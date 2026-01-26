// Upload Photo - AI-Powered Segmentation with Meta's SAM 2
// Uses Replicate API for Segment Anything Model 2 with click-based segmentation

console.log('Upload Photo module loading...');

// ============= CONFIGURATION =============
// Using Meta's SAM 2 Video - supports click coordinates for point-based segmentation
// We send the image as a single frame and click coordinates to segment specific objects
const REPLICATE_MODEL = "meta/sam-2-video";
const REPLICATE_SAM_VERSION = "33432afdfc06a10da6b4018932893d39b0159f838b6d11dd1236dff85cc5ec1d";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

// CORS proxy for development (Replicate doesn't allow direct browser calls)
// For production, you should set up your own backend proxy
const USE_CORS_PROXY = true;
const CORS_PROXY_URL = 'https://corsproxy.io/?';

// ============= STATE =============
let apiKey = localStorage.getItem('replicate_api_key') || '';
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
let videoDataUrlCache = null; // Cache the video so we don't recreate it each time

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
function setupCanvasClickHandler() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;

    // Left click = add to selection (positive point)
    wrapper.addEventListener('click', async (e) => {
        if (isProcessing) return;
        if (e.button !== 0) return; // Only left click

        const rect = maskCanvas.getBoundingClientRect();
        const scaleX = maskCanvas.width / rect.width;
        const scaleY = maskCanvas.height / rect.height;

        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);

        console.log(`Left click (add) at canvas coordinates: (${x}, ${y})`);

        // Show click indicator (green for add)
        showClickIndicator(e.clientX - rect.left, e.clientY - rect.top, true);

        // Add positive point and process
        currentClickPoints.push({ x, y, label: 1 });
        await processMultiClickWithSAM();
    });

    // Right click = remove from selection (negative point)
    wrapper.addEventListener('contextmenu', async (e) => {
        e.preventDefault(); // Prevent context menu
        if (isProcessing) return;

        const rect = maskCanvas.getBoundingClientRect();
        const scaleX = maskCanvas.width / rect.width;
        const scaleY = maskCanvas.height / rect.height;

        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);

        console.log(`Right click (remove) at canvas coordinates: (${x}, ${y})`);

        // Show click indicator (red for remove)
        showClickIndicator(e.clientX - rect.left, e.clientY - rect.top, false);

        // Add negative point and process
        currentClickPoints.push({ x, y, label: 0 });
        await processMultiClickWithSAM();
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

// ============= SAM INTEGRATION =============
// Multi-click segmentation using SAM 2
// Accumulates positive (left click) and negative (right click) points
async function processMultiClickWithSAM() {
    // Check for API key
    if (!apiKey) {
        const modal = document.getElementById('api-modal');
        if (modal) modal.classList.remove('hidden');
        return;
    }

    if (currentClickPoints.length === 0) return;

    isProcessing = true;
    const pointCount = currentClickPoints.length;
    const positiveCount = currentClickPoints.filter(p => p.label === 1).length;
    const negativeCount = currentClickPoints.filter(p => p.label === 0).length;

    showLoading(true, `Refining selection (${positiveCount} include, ${negativeCount} exclude)...`);

    try {
        // Call Replicate API with all click points
        const mask = await callReplicateSAMWithMultipleClicks(currentClickPoints);

        if (mask) {
            // Save to history for undo
            saveMaskToHistory();

            // Clear mask canvas first, then apply new mask
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

            // Apply mask
            addMaskToSelection(mask, `${positiveCount} clicks (+${positiveCount}/-${negativeCount})`);

            // Update UI
            updateAreasPanel();
            updateContinueButton();
        }
    } catch (error) {
        console.error('SAM processing error:', error);

        // Remove the last click point since it failed
        currentClickPoints.pop();

        // Provide more helpful error messages
        let errorMessage = 'Error processing image. ';
        if (error.message.includes('401')) {
            errorMessage += 'Invalid API key. Please check your Replicate token.';
        } else if (error.message.includes('402')) {
            errorMessage += 'Billing issue with Replicate account.';
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

// Legacy text prompt handler - kept for prompt dialog
async function processWithTextPrompt(maskPrompt, negativePrompt = '') {
    // For text prompts, we'll use the center of the image as a default click
    // This is a fallback - the main interaction should be click-based
    const centerX = Math.round(maskCanvas.width / 2);
    const centerY = Math.round(maskCanvas.height / 2);

    // Show a message that text prompts work differently now
    alert('Tip: For best results, click directly on the area you want to select. The AI will detect the entire object you clicked on.');

    // Still process with a center click as fallback
    await processClickWithSAM(centerX, centerY, true);
}

// Convert image to a short WebM video for SAM-2-video API
async function imageToVideoDataUrl() {
    return new Promise((resolve, reject) => {
        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = photoCanvas.width;
        tempCanvas.height = photoCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the image
        tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);

        // Check if MediaRecorder supports webm
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
            ? 'video/webm;codecs=vp8'
            : 'video/webm';

        console.log('Using video mimeType:', mimeType);

        // Create a video stream from canvas
        const stream = tempCanvas.captureStream(1); // 1 FPS
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            videoBitsPerSecond: 2500000
        });

        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Video created, size:', blob.size, 'bytes');
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        };

        mediaRecorder.onerror = (e) => {
            console.error('MediaRecorder error:', e);
            reject(e);
        };

        // Record for 100ms (just need 1-2 frames)
        mediaRecorder.start();

        // Draw a few frames to ensure we have content
        let frameCount = 0;
        const drawFrame = () => {
            tempCtx.drawImage(uploadedImage, 0, 0, tempCanvas.width, tempCanvas.height);
            frameCount++;
            if (frameCount < 5) {
                requestAnimationFrame(drawFrame);
            } else {
                // Stop after a few frames
                setTimeout(() => {
                    mediaRecorder.stop();
                }, 200);
            }
        };
        drawFrame();
    });
}

// Call SAM 2 with multiple click coordinates for refined segmentation
async function callReplicateSAMWithMultipleClicks(clickPoints) {
    // Build the API URL (with optional CORS proxy)
    const apiUrl = 'https://api.replicate.com/v1/predictions';
    const fetchUrl = USE_CORS_PROXY ? CORS_PROXY_URL + encodeURIComponent(apiUrl) : apiUrl;

    console.log('Calling SAM 2 API with multiple clicks...', clickPoints);

    // Convert image to video format (cache it for subsequent calls)
    if (!videoDataUrlCache) {
        showLoading(true, 'Preparing image...');
        try {
            videoDataUrlCache = await imageToVideoDataUrl();
            console.log('Video data URL created and cached, length:', videoDataUrlCache.length);
        } catch (videoError) {
            console.warn('Could not create video, trying with image directly:', videoError);
            videoDataUrlCache = uploadedImageDataUrl;
        }
    }

    // Build coordinate strings from all click points
    // Format: '[x1,y1],[x2,y2],[x3,y3]'
    const coordsArray = clickPoints.map(p => `[${p.x},${p.y}]`);
    const clickCoordinates = coordsArray.join(',');

    // Format labels: '1,0,1,0' etc.
    const clickLabels = clickPoints.map(p => p.label).join(',');

    // All clicks are on frame 0
    const clickFrames = clickPoints.map(() => '0').join(',');

    // All clicks belong to the same object
    const clickObjectIds = clickPoints.map(() => 'wall').join(',');

    console.log('Click coordinates:', clickCoordinates);
    console.log('Click labels:', clickLabels);

    // SAM 2 Video input format:
    // input_video: the video file
    // click_coordinates: '[x,y],[x,y]' format
    // click_labels: '1,0,1' for foreground/background mix
    // click_frames: '0,0,0' (all on first frame)
    // mask_type: 'binary' or 'highlighted'

    const input = {
        input_video: videoDataUrlCache,
        click_coordinates: clickCoordinates,
        click_labels: clickLabels,
        click_frames: clickFrames,
        click_object_ids: clickObjectIds,
        mask_type: 'binary',  // Binary mask for cleaner extraction
        output_video: false,
        output_format: 'png'
    };

    console.log('SAM 2 Input (truncated):', {
        ...input,
        input_video: input.input_video.substring(0, 100) + '...'
    });

    // Create prediction
    const createResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: REPLICATE_SAM_VERSION,
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
            throw new Error(`API request failed: ${createResponse.status} - ${errorText.substring(0, 100)}`);
        }
    }

    const prediction = await createResponse.json();
    console.log('Prediction created:', prediction.id);

    // Poll for result
    const result = await pollForResult(prediction.id);

    if (result.status === 'succeeded' && result.output) {
        console.log('SAM 2 succeeded, output:', JSON.stringify(result.output, null, 2));

        // SAM 2 output is typically an array of frame URLs or a single URL
        let maskUrl = null;
        const output = result.output;

        if (Array.isArray(output)) {
            // Output is an array of frame URLs - take the first one
            console.log('Output is array with', output.length, 'items');
            if (output.length > 0) {
                maskUrl = output[0];
                console.log('Using first frame:', maskUrl);
            }
        } else if (typeof output === 'object') {
            // Output might be an object with fields
            console.log('Output keys:', Object.keys(output));
            // Try common field names
            maskUrl = output.output || output.mask || output.frame || output.image;
        } else if (typeof output === 'string') {
            // Output is a single URL string
            maskUrl = output;
        }

        if (maskUrl) {
            console.log('Using mask URL:', maskUrl);
            return await loadMaskImage(maskUrl);
        } else {
            console.error('Could not find mask image in output:', output);
            throw new Error('No mask image found in response. Check console for output structure.');
        }
    } else {
        console.error('SAM 2 failed:', result);
        throw new Error(result.error || 'Processing failed - could not segment object.');
    }
}

async function pollForResult(predictionId, maxAttempts = 60) {
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

        // Update loading text
        showLoading(true, `AI analyzing... (${i + 1}s)`);
    }

    throw new Error('Processing timeout - please try again');
}

async function loadMaskImage(maskUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = maskUrl;
    });
}

// ============= MASK MANAGEMENT =============
function addMaskToSelection(maskImage, promptUsed = '') {
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

    // Apply mask with semi-transparent overlay
    const currentData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    let pixelsAdded = 0;
    let pixelsSkipped = 0;

    for (let i = 0; i < maskData.data.length; i += 4) {
        const r = maskData.data[i];
        const g = maskData.data[i + 1];
        const b = maskData.data[i + 2];
        const a = maskData.data[i + 3];

        // RAM-Grounded-SAM mask has colored regions for different objects
        // We want to detect ANY non-black pixel as part of the mask
        // Black/near-black pixels are background (r,g,b all close to 0)
        const isBackground = (r < 30 && g < 30 && b < 30) || a < 50;

        if (!isBackground) {
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

    // Store mask for later use
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
    videoDataUrlCache = null; // Clear video cache
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
        const input = document.getElementById('api-key-input');
        if (input && input.value.trim()) {
            apiKey = input.value.trim();
            localStorage.setItem('replicate_api_key', apiKey);
            document.getElementById('api-modal')?.classList.add('hidden');
        }
    });

    document.getElementById('btn-skip-api')?.addEventListener('click', () => {
        document.getElementById('api-modal')?.classList.add('hidden');
        alert('Manual mode: You can draw selections manually, but AI auto-detection is disabled.');
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
    videoDataUrlCache = null; // Clear video cache

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

    // Auto-detect button - now explains click-based workflow
    document.getElementById('auto-detect-btn')?.addEventListener('click', () => {
        // Show instructions for click-based workflow
        alert('Refine Your Selection:\n\n' +
            'LEFT CLICK (green) = Add to selection\n' +
            '• Click on the wall or area you want\n' +
            '• Add more clicks to expand the selection\n\n' +
            'RIGHT CLICK (red) = Remove from selection\n' +
            '• Click on grass, sky, or other areas to exclude\n' +
            '• The AI will refine the mask with each click\n\n' +
            'TIPS:\n' +
            '• Start with one click on the main area\n' +
            '• Use right-clicks to remove unwanted areas\n' +
            '• Use Undo to remove the last click');
    });
}

console.log('Upload Photo module loaded!');
