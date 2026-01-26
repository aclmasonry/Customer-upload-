
// Upload Photo - AI-Powered Segmentation
// Uses multiple AI backends with fallback for reliability:
// 1. Primary: fal.ai (Florence-2 + SAM for text-guided segmentation)
// 2. Fallback: Replicate API (Meta SAM-2 automatic segmentation)

console.log('Upload Photo module loading...');

// ============= CONFIGURATION =============
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

// fal.ai API (primary - fast, reliable, text-to-segment)
// Using Florence-2 + SAM for text-guided segmentation
const FAL_API_URL = 'https://fal.run/fal-ai/florence-sam';

// Replicate API - using Grounded SAM for text-based segmentation
// Supports mask_prompt (what to select) and negative_mask_prompt (what to exclude)
const REPLICATE_MODEL = "schananas/grounded_sam";
const REPLICATE_VERSION = "ee871c19efb1941f55f66a3d7d960428c8a5afcb77449547fe8e5a3ab9ebc21c";

// CORS proxy for development
const USE_CORS_PROXY = true;
const CORS_PROXY_URL = 'https://corsproxy.io/?';

// ============= STATE =============
let apiKey = localStorage.getItem('replicate_api_key') || '';
let falApiKey = localStorage.getItem('fal_api_key') || '';
let uploadedImage = null;
let uploadedImageDataUrl = null;
let photoCanvas, photoCtx;
let maskCanvas, maskCtx;
let currentTool = 'add'; // 'add' or 'remove'
let selectedAreas = []; // Array of mask data
let maskHistory = []; // For undo functionality
let isProcessing = false;

// For multi-click refinement
let currentClickPoints = []; // Array of {x, y, label} for accumulating clicks

// For mask selection UI
let availableMasks = []; // Store multiple mask options from SAM
let selectedMaskIndex = 1; // Default to "part" mask (index 1)

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
    console.log('Upload Photo initialized');

    // Initialize canvases
    photoCanvas = document.getElementById('photo-canvas');
    maskCanvas = document.getElementById('mask-canvas');

    if (photoCanvas) photoCtx = photoCanvas.getContext('2d');
    if (maskCanvas) maskCtx = maskCanvas.getContext('2d');

    // Setup event listeners
    setupUploadListeners();
    setupToolbarListeners();
    setupModalListeners();
    setupPromptDialog();

    // Check for API key
    if (!apiKey) {
        // Show API modal or continue in manual mode
        // For now, we'll allow testing without API
        console.log('No API key found - AI features will prompt for key when used');
    }
});

// ============= UPLOAD HANDLING =============
function setupUploadListeners() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    if (!uploadZone || !fileInput) return;

    // Click to upload
    uploadZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');

        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Back to upload button
    document.getElementById('btn-back-upload')?.addEventListener('click', () => {
        showStep('upload');
        resetEditor();
    });

    // Continue button
    document.getElementById('btn-continue')?.addEventListener('click', () => {
        console.log('Continue button clicked, selectedAreas:', selectedAreas.length);
        if (selectedAreas.length > 0) {
            saveAndContinue();
        } else {
            alert('Please select at least one area before continuing.');
        }
    });
}

function handleFile(file) {
    // Validate file
    if (!SUPPORTED_FORMATS.includes(file.type)) {
        alert('Please upload a JPG, PNG, or WebP image.');
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert('File is too large. Please upload an image under 10MB.');
        return;
    }

    // Read and display image
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImageDataUrl = e.target.result;
        loadImageToCanvas(uploadedImageDataUrl);
    };
    reader.readAsDataURL(file);
}

function loadImageToCanvas(dataUrl) {
    const img = new Image();
    img.onload = () => {
        uploadedImage = img;

        // Calculate canvas size (max 1600px width, maintain aspect ratio)
        const maxWidth = 1600;
        const maxHeight = 960;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        // Set canvas sizes
        photoCanvas.width = width;
        photoCanvas.height = height;
        maskCanvas.width = width;
        maskCanvas.height = height;

        // Draw image
        photoCtx.drawImage(img, 0, 0, width, height);

        // Clear mask
        maskCtx.clearRect(0, 0, width, height);

        // Show selection step
        showStep('select');

        // Setup canvas click handler
        setupCanvasClickHandler();
    };
    img.src = dataUrl;
}

// ============= CANVAS INTERACTION =============
// Store click coordinates for point-based segmentation
let lastClickX = 0;
let lastClickY = 0;

function setupCanvasClickHandler() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;

    // Click on canvas = capture click position and open prompt dialog
    wrapper.addEventListener('click', async (e) => {
        if (isProcessing) return;
        if (e.button !== 0) return; // Only left click

        // Get click position relative to the canvas
        const rect = maskCanvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to canvas coordinates (accounting for CSS scaling)
        const scaleX = maskCanvas.width / rect.width;
        const scaleY = maskCanvas.height / rect.height;
        lastClickX = Math.round(clickX * scaleX);
        lastClickY = Math.round(clickY * scaleY);

        console.log(`Click at canvas coords: (${lastClickX}, ${lastClickY})`);

        // Show click indicator
        showClickIndicator(clickX, clickY, true);

        // Open the prompt dialog to let user specify what they want to select
        showPromptDialog();
    });

    // Right click - could be used to specify exclusions in future
    wrapper.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        alert('Tip: Left-click on the area you want to select, then choose a description.');
    });
}

function showClickIndicator(x, y, isPositive = true) {
    const indicator = document.getElementById('click-indicator');
    if (!indicator) return;

    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;

    // Change color based on click type
    indicator.style.borderColor = isPositive ? '#4CAF50' : '#f44336'; // Green for add, red for remove
    indicator.classList.add('active');

    setTimeout(() => {
        indicator.classList.remove('active');
    }, 500);
}

// ============= AI SEGMENTATION INTEGRATION =============
// Text-prompt based segmentation using CLIPSeg (Hugging Face) or Grounded SAM (Replicate)
// Much more accurate for architectural elements like "brick wall", "stone pillar", etc.

// Store the current text prompts for refinement
let currentPositivePrompt = '';
let currentNegativePrompt = '';

async function processWithTextPromptAI(maskPrompt, negativePrompt = '') {
    if (!maskPrompt || maskPrompt.trim() === '') {
        alert('Please specify what you want to select (e.g., "brick wall", "stone")');
        return;
    }

    isProcessing = true;
    currentPositivePrompt = maskPrompt;
    currentNegativePrompt = negativePrompt;

    showLoading(true, `Detecting "${maskPrompt}"...`);

    try {
        let masks = null;
        let usedAPI = '';

        // Try fal.ai first (fast, text-to-segment with Florence-2 + SAM)
        if (falApiKey) {
            try {
                console.log('Trying fal.ai Florence-SAM...');
                showLoading(true, `Detecting "${maskPrompt}" with AI...`);
                masks = await callFalAI(maskPrompt);
                usedAPI = 'fal.ai';
            } catch (falError) {
                console.warn('fal.ai failed:', falError.message);
            }
        }

        // Fallback to Replicate if fal.ai failed and we have a Replicate key
        if (!masks && apiKey) {
            console.log('Falling back to Replicate SAM-2...');
            showLoading(true, `Detecting "${maskPrompt}" with SAM-2...\n(This may take a moment on first use)`);
            masks = await callReplicateSAM(maskPrompt, negativePrompt);
            usedAPI = 'replicate';
        }

        // If still no masks and no API keys, show error
        if (!masks) {
            // Show API modal to get keys
            const modal = document.getElementById('api-modal');
            if (modal) modal.classList.remove('hidden');
            throw new Error('Please add an API key to use AI segmentation.');
        }

        if (masks && masks.length > 0) {
            // Store available masks
            availableMasks = masks;
            console.log(`${usedAPI} returned ${masks.length} mask(s)`);

            // Grounded SAM returns a single mask based on text prompt
            // Apply it directly since it's text-guided and should be accurate
            if (masks.length === 1) {
                saveMaskToHistory();
                maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
                await addMaskToSelection(masks[0], maskPrompt);
                updateAreasPanel();
                updateContinueButton();
            } else if (masks.length > 1) {
                // Multiple masks - show selection UI
                showMaskSelectionUI(masks, maskPrompt);
            }
        } else {
            alert(`Could not detect "${maskPrompt}" in the image. Try a different description like "brick", "stone wall", or "building facade".`);
        }
    } catch (error) {
        console.error('AI segmentation error:', error);

        // Provide more helpful error messages
        let errorMessage = 'Error processing image. ';
        if (error.message.includes('401')) {
            errorMessage += 'Invalid API key. Please check your token.';
        } else if (error.message.includes('402')) {
            errorMessage += 'Billing issue with your account.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Too many requests. Please wait a moment.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage += 'Network error. Check your internet connection.';
        } else if (error.message.includes('timeout')) {
            errorMessage += 'Processing took too long. Try a smaller image.';
        } else {
            errorMessage += error.message || 'Please try again.';
        }

        alert(errorMessage);
    } finally {
        isProcessing = false;
        showLoading(false);
    }
}

// Legacy function name for compatibility
async function processWithGroundedSAM(maskPrompt, negativePrompt = '') {
    return processWithTextPromptAI(maskPrompt, negativePrompt);
}

// Wrapper for backward compatibility
async function processWithTextPrompt(maskPrompt, negativePrompt = '') {
    await processWithTextPromptAI(maskPrompt, negativePrompt);
}

// ============= FAL.AI FLORENCE-SAM API =============
// Florence-2 + SAM: Text-guided semantic segmentation (fast, reliable)
async function callFalAI(textPrompt) {
    console.log('Calling fal.ai Florence-SAM API...');
    console.log('Prompt:', textPrompt);

    const fetchUrl = USE_CORS_PROXY
        ? CORS_PROXY_URL + encodeURIComponent(FAL_API_URL)
        : FAL_API_URL;

    const requestBody = {
        image_url: uploadedImageDataUrl,
        prompts: textPrompt
    };

    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${falApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    console.log('fal.ai Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('fal.ai Error:', errorText);
        throw new Error(`fal.ai failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('fal.ai response:', data);

    // fal.ai florence-sam returns results array with mask_url
    if (data.results && data.results.length > 0) {
        const maskUrls = data.results.map(r => r.mask_url).filter(Boolean);
        if (maskUrls.length > 0) {
            const maskImages = await Promise.all(maskUrls.map(url => loadMaskImage(url)));
            return maskImages;
        }
    }

    throw new Error('No masks found in fal.ai response');
}

// Helper to convert dataURL to Blob
async function dataURLtoBlob(dataURL) {
    const response = await fetch(dataURL);
    return await response.blob();
}

// ============= REPLICATE GROUNDED SAM API =============
// Uses schananas/grounded_sam for text-based segmentation
// Supports mask_prompt (what to select) and negative_mask_prompt (what to exclude)
async function callReplicateSAM(maskPrompt, negativePrompt = '') {
    // Use version-based API endpoint
    const apiUrl = 'https://api.replicate.com/v1/predictions';
    const fetchUrl = USE_CORS_PROXY ? CORS_PROXY_URL + encodeURIComponent(apiUrl) : apiUrl;

    console.log('Calling Replicate Grounded SAM API with text prompt...');
    console.log('Model:', REPLICATE_MODEL);
    console.log('Version:', REPLICATE_VERSION);
    console.log('Text prompt:', maskPrompt);
    console.log('Negative prompt:', negativePrompt);

    // Grounded SAM input with text prompts
    // mask_prompt: what to select (e.g., "brick wall", "stone pillar")
    // negative_mask_prompt: what to exclude (optional)
    const input = {
        image: uploadedImageDataUrl,
        mask_prompt: maskPrompt,
        adjustment_factor: 0
    };

    // Add negative prompt if provided
    if (negativePrompt) {
        input.negative_mask_prompt = negativePrompt;
    }

    console.log('Grounded SAM Input (image truncated):', {
        ...input,
        image: input.image.substring(0, 100) + '...'
    });

    const createResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: REPLICATE_VERSION,
            input: input
        })
    });

    console.log('API Response status:', createResponse.status);

    if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('API Error:', errorText);
        try {
            const error = JSON.parse(errorText);
            throw new Error(error.detail || `API request failed: ${createResponse.status}`);
        } catch (e) {
            if (e.message.includes('API request failed')) throw e;
            throw new Error(`API request failed: ${createResponse.status} - ${errorText.substring(0, 100)}`);
        }
    }

    const prediction = await createResponse.json();
    console.log('Prediction created:', prediction.id);

    // Poll for result
    const result = await pollForResult(prediction.id);

    if (result.status === 'succeeded' && result.output) {
        return await processSAMOutput(result.output);
    } else {
        console.error('SAM failed:', result);
        throw new Error(result.error || 'Processing failed - could not segment object.');
    }
}

// Process SAM output - returns array of mask images
// Grounded SAM returns a single mask URL based on text prompt
async function processSAMOutput(output) {
    console.log('Grounded SAM output:', typeof output === 'string' ? output.substring(0, 200) : JSON.stringify(output, null, 2));

    let maskUrls = [];

    // Grounded SAM typically returns a single mask URL as a string
    if (typeof output === 'string' && output.startsWith('http')) {
        maskUrls = [output];
    } else if (typeof output === 'object' && output !== null) {
        console.log('Output keys:', Object.keys(output));

        // Check for common output formats
        if (Array.isArray(output)) {
            maskUrls = output.filter(item => typeof item === 'string' && item.startsWith('http'));
        } else if (output.mask) {
            maskUrls = [output.mask];
        } else if (output.masks && Array.isArray(output.masks)) {
            maskUrls = output.masks;
        } else if (output.output) {
            // Some models wrap result in 'output' key
            if (typeof output.output === 'string' && output.output.startsWith('http')) {
                maskUrls = [output.output];
            }
        } else {
            // Look for any URL-like values
            for (const key of Object.keys(output)) {
                const val = output[key];
                if (typeof val === 'string' && val.startsWith('http')) {
                    console.log(`Found URL in key "${key}": ${val.substring(0, 80)}...`);
                    maskUrls.push(val);
                } else if (Array.isArray(val)) {
                    val.forEach((item, i) => {
                        if (typeof item === 'string' && item.startsWith('http')) {
                            console.log(`Found URL in ${key}[${i}]: ${item.substring(0, 80)}...`);
                            maskUrls.push(item);
                        }
                    });
                }
            }
        }
    } else if (Array.isArray(output)) {
        console.log('Output is array with', output.length, 'items');
        maskUrls = output.filter(item => typeof item === 'string' && item.startsWith('http'));
    }

    if (maskUrls.length === 0) {
        console.error('Could not find mask URLs in output:', output);
        throw new Error('No mask images found in response. The text prompt may not have matched any objects in the image.');
    }

    console.log(`Found ${maskUrls.length} mask URL(s):`, maskUrls.map(u => u.substring(0, 60) + '...'));

    // Load all mask images
    const maskImages = await Promise.all(maskUrls.map(url => loadMaskImage(url)));

    return maskImages;
}

async function pollForResult(predictionId, maxAttempts = 120) {
    const baseUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;

    for (let i = 0; i < maxAttempts; i++) {
        const fetchUrl = USE_CORS_PROXY ? CORS_PROXY_URL + encodeURIComponent(baseUrl) : baseUrl;

        const response = await fetch(fetchUrl, {
            headers: {
                'Authorization': `Token ${apiKey}`
            }
        });

        if (!response.ok) {
            console.error('Poll response not ok:', response.status);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }

        const result = await response.json();
        console.log(`Poll ${i + 1}: ${result.status}`);

        if (result.status === 'succeeded') {
            return result;
        } else if (result.status === 'failed') {
            throw new Error(result.error || 'Processing failed');
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update loading text based on status
        if (result.status === 'starting') {
            // Model is cold-starting (can take 30-60s on first run)
            showLoading(true, `Starting AI model... (${i + 1}s)\nFirst run may take up to 2 minutes`);
        } else if (result.status === 'processing') {
            showLoading(true, `Analyzing image... (${i + 1}s)`);
        } else {
            showLoading(true, `AI working... (${i + 1}s)`);
        }
    }

    throw new Error('Processing timeout - please try again');
}

async function loadMaskImage(maskUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => {
            console.error('Failed to load mask image:', maskUrl, e);
            reject(new Error('Failed to load mask image'));
        };
        img.src = maskUrl;
    });
}

// ============= MASK MANAGEMENT =============
async function addMaskToSelection(maskImage, promptUsed = '') {
    console.log('addMaskToSelection called with prompt:', promptUsed);
    console.log('Mask image dimensions:', maskImage.width, 'x', maskImage.height);
    console.log('Canvas dimensions:', maskCanvas.width, 'x', maskCanvas.height);

    // Create temporary canvas for mask processing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw mask image scaled to canvas
    tempCtx.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);

    // Get mask data
    const maskData = tempCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // First pass: count bright vs dark pixels to detect if mask needs inversion
    // If more than 60% of the image is "selected", the mask is likely inverted
    let brightPixels = 0;
    let darkPixels = 0;
    const totalPixels = maskData.data.length / 4;

    for (let i = 0; i < maskData.data.length; i += 4) {
        const r = maskData.data[i];
        const g = maskData.data[i + 1];
        const b = maskData.data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness > 128) {
            brightPixels++;
        } else {
            darkPixels++;
        }
    }

    const brightRatio = brightPixels / totalPixels;
    console.log(`Mask analysis: ${(brightRatio * 100).toFixed(1)}% bright pixels`);

    // If more than 60% is bright, the mask is probably inverted (selecting background)
    // For architectural elements like "brick wall", we expect less than 60% of image
    const shouldInvert = brightRatio > 0.6;
    if (shouldInvert) {
        console.log('Mask appears inverted (selecting background). Inverting...');
    }

    // Apply mask with semi-transparent overlay
    const currentData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    let pixelsAdded = 0;
    let pixelsSkipped = 0;

    for (let i = 0; i < maskData.data.length; i += 4) {
        const r = maskData.data[i];
        const g = maskData.data[i + 1];
        const b = maskData.data[i + 2];
        const a = maskData.data[i + 3];

        // SAM mask: white/bright pixels = selected area, black/dark = background
        const brightness = (r + g + b) / 3;
        let isSelected = brightness > 128 || (a > 128 && brightness > 50);

        // Invert selection if needed
        if (shouldInvert) {
            isSelected = !isSelected;
        }

        if (isSelected) {
            // Add to selection - red tint overlay
            currentData.data[i] = 122;     // R (ACL red)
            currentData.data[i + 1] = 5;   // G
            currentData.data[i + 2] = 5;   // B
            currentData.data[i + 3] = 100; // A (semi-transparent)
            pixelsAdded++;
        } else {
            pixelsSkipped++;
        }
    }

    maskCtx.putImageData(currentData, 0, 0);

    console.log(`Mask applied: ${pixelsAdded} pixels added, ${pixelsSkipped} skipped`);

    // Store mask for later use (store the corrected version)
    // If we inverted, we need to store the inverted mask
    if (shouldInvert) {
        // Create inverted mask for storage
        for (let i = 0; i < maskData.data.length; i += 4) {
            maskData.data[i] = 255 - maskData.data[i];
            maskData.data[i + 1] = 255 - maskData.data[i + 1];
            maskData.data[i + 2] = 255 - maskData.data[i + 2];
        }
        tempCtx.putImageData(maskData, 0, 0);
    }

    selectedAreas.push({
        type: 'add',
        prompt: promptUsed,
        maskData: tempCanvas.toDataURL()
    });

    console.log('selectedAreas now has', selectedAreas.length, 'items');
}

function removeMaskFromSelection(maskImage) {
    // Create temporary canvas for mask processing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw mask image
    tempCtx.drawImage(maskImage, 0, 0, maskCanvas.width, maskCanvas.height);

    // Get mask data
    const maskData = tempCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    // Remove from current selection
    const currentData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i] > 128 || maskData.data[i + 3] > 128) {
            // Remove from selection - make transparent
            currentData.data[i + 3] = 0;
        }
    }

    maskCtx.putImageData(currentData, 0, 0);

    // Store removal
    selectedAreas.push({
        type: 'remove',
        maskData: tempCanvas.toDataURL()
    });
}

function saveMaskToHistory() {
    maskHistory.push(maskCanvas.toDataURL());
    // Limit history size
    if (maskHistory.length > 20) {
        maskHistory.shift();
    }
}

// ============= MASK SELECTION UI =============
// When SAM returns multiple masks, let the user pick which one is correct
let pendingMaskPrompt = '';

function showMaskSelectionUI(masks, prompt, labels = null) {
    pendingMaskPrompt = prompt;

    // Create or get the mask selection modal
    let modal = document.getElementById('mask-selection-modal');
    if (!modal) {
        modal = createMaskSelectionModal();
        document.body.appendChild(modal);
    }

    // Update the description
    const desc = modal.querySelector('p');
    if (desc) {
        desc.textContent = `Click on the option that best matches the "${prompt}" you want to select:`;
    }

    // Populate with mask previews (show first 8 masks)
    const grid = modal.querySelector('.mask-grid');
    grid.innerHTML = '';

    const masksToShow = masks.slice(0, 8);

    masksToShow.forEach((maskImg, index) => {
        const item = document.createElement('div');
        item.className = 'mask-option';
        item.dataset.index = index;

        // Create composite preview: original image with mask overlay
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');

        // Draw original image scaled
        if (uploadedImage) {
            ctx.drawImage(uploadedImage, 0, 0, 200, 120);
        }

        // Create a temp canvas to process the mask with red tint
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 120;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(maskImg, 0, 0, 200, 120);

        // Get mask data and apply red tint
        const maskData = tempCtx.getImageData(0, 0, 200, 120);
        for (let i = 0; i < maskData.data.length; i += 4) {
            const brightness = (maskData.data[i] + maskData.data[i+1] + maskData.data[i+2]) / 3;
            if (brightness > 128) {
                // Apply red overlay on selected areas
                ctx.fillStyle = 'rgba(122, 5, 5, 0.5)';
            }
        }

        // Draw mask with red overlay
        ctx.globalCompositeOperation = 'source-over';
        tempCtx.globalCompositeOperation = 'source-in';
        tempCtx.fillStyle = 'rgba(122, 5, 5, 0.6)';
        tempCtx.fillRect(0, 0, 200, 120);
        ctx.drawImage(tempCanvas, 0, 0);

        item.appendChild(canvas);

        // Add label
        const label = document.createElement('span');
        label.textContent = labels && labels[index] ? labels[index] : `Option ${index + 1}`;
        item.appendChild(label);

        // Click handler
        item.addEventListener('click', () => selectMaskOption(index));

        grid.appendChild(item);
    });

    // Adjust grid columns based on number of masks
    if (masksToShow.length <= 3) {
        grid.style.gridTemplateColumns = `repeat(${masksToShow.length}, 1fr)`;
    } else {
        grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }

    modal.classList.remove('hidden');
}

function createMaskSelectionModal() {
    const modal = document.createElement('div');
    modal.id = 'mask-selection-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>Select the Correct Area</h2>
            <p>The AI detected multiple areas. Click the one that matches "${pendingMaskPrompt}":</p>
            <div class="mask-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0;"></div>
            <div class="modal-actions">
                <button class="btn-secondary" id="mask-select-cancel">Cancel</button>
            </div>
        </div>
    `;

    // Add styles for mask options
    const style = document.createElement('style');
    style.textContent = `
        .mask-option {
            cursor: pointer;
            border: 2px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            overflow: hidden;
            transition: all 0.2s;
            text-align: center;
        }
        .mask-option:hover {
            border-color: var(--acl-red);
            transform: scale(1.02);
        }
        .mask-option canvas {
            display: block;
            width: 100%;
            height: auto;
        }
        .mask-option span {
            display: block;
            padding: 6px;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            background: rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);

    // Cancel button handler
    modal.querySelector('#mask-select-cancel').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    return modal;
}

async function selectMaskOption(index) {
    const modal = document.getElementById('mask-selection-modal');
    if (modal) modal.classList.add('hidden');

    if (availableMasks[index]) {
        saveMaskToHistory();
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        await addMaskToSelection(availableMasks[index], pendingMaskPrompt);
        updateAreasPanel();
        updateContinueButton();
    }
}

function undoLastAction() {
    if (maskHistory.length === 0 && currentClickPoints.length === 0) return;

    // If we have click points, remove the last one and re-process
    if (currentClickPoints.length > 0) {
        currentClickPoints.pop();
        if (currentClickPoints.length > 0) {
            // Re-process with remaining points
            processMultiClickWithSAM();
        } else {
            // No more points, clear the mask
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            selectedAreas = [];
            updateAreasPanel();
            updateContinueButton();
        }
        return;
    }

    const previousState = maskHistory.pop();
    const img = new Image();
    img.onload = () => {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskCtx.drawImage(img, 0, 0);

        // Remove last area
        selectedAreas.pop();
        updateAreasPanel();
        updateContinueButton();
    };
    img.src = previousState;
}

function clearAllSelections() {
    if (selectedAreas.length === 0 && currentClickPoints.length === 0) return;

    saveMaskToHistory();
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    selectedAreas = [];
    currentClickPoints = []; // Reset click points
    availableMasks = []; // Clear stored masks
    updateAreasPanel();
    updateContinueButton();
}

// ============= TOOLBAR =============
function setupToolbarListeners() {
    // "Add Custom Area" button - opens prompt dialog
    document.getElementById('tool-add')?.addEventListener('click', () => {
        showPromptDialog();
    });

    document.getElementById('tool-clear')?.addEventListener('click', () => {
        if (confirm('Clear all selected areas?')) {
            clearAllSelections();
        }
    });

    document.getElementById('tool-undo')?.addEventListener('click', () => {
        undoLastAction();
    });
}

function setTool(tool) {
    currentTool = tool;

    // Update button states
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tool-${tool}`)?.classList.add('active');
}

// ============= UI UPDATES =============
function showStep(step) {
    document.getElementById('step-upload')?.classList.toggle('hidden', step !== 'upload');
    document.getElementById('step-select')?.classList.toggle('hidden', step !== 'select');
}

function showLoading(show, text = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    const textEl = document.getElementById('loading-text');

    if (overlay) overlay.classList.toggle('hidden', !show);
    if (textEl) textEl.textContent = text;
}

function updateAreasPanel() {
    const list = document.getElementById('areas-list');
    if (!list) return;

    const addedAreas = selectedAreas.filter(a => a.type === 'add');

    if (addedAreas.length === 0) {
        list.innerHTML = '<p class="no-areas">Click on the image to select walls, pillars, or stone areas</p>';
    } else {
        // Show each detected area with its click info
        list.innerHTML = addedAreas.map((area, index) => `
            <div class="area-item">
                <div class="area-preview" style="background: rgba(122, 5, 5, 0.5);"></div>
                <div class="area-info">
                    <span class="area-name">Selection ${index + 1}</span>
                    <span class="area-clicks">${area.prompt || 'Area detected'}</span>
                </div>
            </div>
        `).join('');
    }
}

function updateContinueButton() {
    const btn = document.getElementById('btn-continue');
    if (!btn) return;

    const hasSelection = selectedAreas.some(a => a.type === 'add');
    btn.disabled = !hasSelection;
}

// ============= API KEY MODAL =============
function setupModalListeners() {
    document.getElementById('btn-save-api')?.addEventListener('click', () => {
        const falInput = document.getElementById('fal-api-key-input');
        const replicateInput = document.getElementById('api-key-input');

        // Save fal.ai key if provided
        if (falInput && falInput.value.trim()) {
            falApiKey = falInput.value.trim();
            localStorage.setItem('fal_api_key', falApiKey);
        }

        // Save Replicate key if provided
        if (replicateInput && replicateInput.value.trim()) {
            apiKey = replicateInput.value.trim();
            localStorage.setItem('replicate_api_key', apiKey);
        }

        // Need at least one key
        if (falApiKey || apiKey) {
            document.getElementById('api-modal')?.classList.add('hidden');
        } else {
            alert('Please enter at least one API key to use AI features.');
        }
    });

    document.getElementById('btn-skip-api')?.addEventListener('click', () => {
        document.getElementById('api-modal')?.classList.add('hidden');
    });
}

// ============= SAVE AND CONTINUE =============
function saveAndContinue() {
    console.log('saveAndContinue called');

    // Generate final mask - use lower quality to reduce size
    const finalMask = maskCanvas.toDataURL('image/png');
    console.log('Final mask generated, length:', finalMask.length);

    // Compress the main image if it's too large (target ~1MB max for localStorage)
    let compressedImage = uploadedImageDataUrl;
    const maxSize = 1000000; // 1MB

    if (uploadedImageDataUrl.length > maxSize) {
        console.log('Image too large, compressing...', uploadedImageDataUrl.length, 'bytes');
        // Create compressed version
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Reduce dimensions if needed
        let scale = 1;
        if (uploadedImage.width > 1600 || uploadedImage.height > 1200) {
            scale = Math.min(1600 / uploadedImage.width, 1200 / uploadedImage.height);
        }

        tempCanvas.width = uploadedImage.width * scale;
        tempCanvas.height = uploadedImage.height * scale;
        tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);

        // Try different quality levels
        for (let quality = 0.8; quality >= 0.3; quality -= 0.1) {
            compressedImage = tempCanvas.toDataURL('image/jpeg', quality);
            console.log(`Compressed at quality ${quality}: ${compressedImage.length} bytes`);
            if (compressedImage.length < maxSize) break;
        }
    }

    // Create area data compatible with visualizer
    const areaData = {
        points: extractMaskPoints(),
        mask: finalMask
    };
    console.log('Area data created with', areaData.points.length, 'points');

    // Save to localStorage
    const visualizerData = {
        sample: {
            id: 'custom-upload',
            name: 'Your Photo',
            image: compressedImage
        },
        customAreas: [areaData],
        isCustomUpload: true
    };

    // Check total size
    const dataStr = JSON.stringify(visualizerData);
    console.log('Total data size:', dataStr.length, 'bytes (~' + Math.round(dataStr.length / 1024) + 'KB)');

    if (dataStr.length > 4500000) { // ~4.5MB localStorage limit
        alert('The image and mask are too large to save. Please try with a smaller image (under 2000x2000 pixels).');
        return;
    }

    try {
        localStorage.setItem('visualizerData', JSON.stringify(visualizerData));
        console.log('Data saved to localStorage successfully');

        // Navigate to visualizer
        console.log('Navigating to customer-visualizer.html');
        window.location.href = 'customer-visualizer.html';
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        alert('Error saving data: ' + e.message + '. The image may be too large. Try a smaller image.');
    }
}

function extractMaskPoints() {
    // Extract boundary points from mask for polygon rendering
    // This is a simplified version - could be enhanced with marching squares
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const points = [];

    // Sample points along the mask boundary
    for (let y = 0; y < maskCanvas.height; y += 10) {
        for (let x = 0; x < maskCanvas.width; x++) {
            const i = (y * maskCanvas.width + x) * 4;
            if (imageData.data[i + 3] > 50) {
                // Found mask pixel
                points.push([x / maskCanvas.width, y / maskCanvas.height]);
                break;
            }
        }
    }

    // Add right edge points
    for (let y = 0; y < maskCanvas.height; y += 10) {
        for (let x = maskCanvas.width - 1; x >= 0; x--) {
            const i = (y * maskCanvas.width + x) * 4;
            if (imageData.data[i + 3] > 50) {
                points.push([x / maskCanvas.width, y / maskCanvas.height]);
                break;
            }
        }
    }

    return points;
}

function resetEditor() {
    uploadedImage = null;
    uploadedImageDataUrl = null;
    selectedAreas = [];
    maskHistory = [];
    currentClickPoints = []; // Reset click points
    availableMasks = []; // Clear stored masks

    if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }

    updateAreasPanel();
    updateContinueButton();
}

// ============= PROMPT DIALOG =============
function showPromptDialog() {
    const modal = document.getElementById('prompt-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Focus the input
        document.getElementById('prompt-input')?.focus();
    }
}

function hidePromptDialog() {
    const modal = document.getElementById('prompt-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function setupPromptDialog() {
    // Quick prompt buttons
    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            if (prompt) {
                hidePromptDialog();
                processWithTextPrompt(prompt);
            }
        });
    });

    // Custom prompt submit
    document.getElementById('prompt-submit')?.addEventListener('click', () => {
        const input = document.getElementById('prompt-input');
        const prompt = input?.value.trim();
        if (prompt) {
            hidePromptDialog();
            processWithTextPrompt(prompt);
            input.value = '';
        }
    });

    // Enter key in input
    document.getElementById('prompt-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const prompt = e.target.value.trim();
            if (prompt) {
                hidePromptDialog();
                processWithTextPrompt(prompt);
                e.target.value = '';
            }
        }
    });

    // Cancel button
    document.getElementById('prompt-cancel')?.addEventListener('click', () => {
        hidePromptDialog();
    });

    // Auto-detect button - opens prompt dialog
    document.getElementById('auto-detect-btn')?.addEventListener('click', () => {
        showPromptDialog();
    });
}

console.log('Upload Photo module loaded!');
