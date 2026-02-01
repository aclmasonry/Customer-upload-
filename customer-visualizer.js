// Customer Visualizer Controller
// Simplified version for customers to preview materials on pre-mapped sample images
// Uses presets saved by admin from index.html

console.log('Customer Visualizer loading...');

// ============= GLOBAL VARIABLES =============
let canvas, ctx;
let customerImage = null;
let customerAreas = [];
let projectData = null;
let loadedTextures = {};
let selectedMaterial = null;

// ============= MATERIAL DATA =============
// Material arrays (STONE_MATERIALS, THIN_BRICK_MATERIALS, FULL_BRICK_MATERIALS)
// are loaded from materials.js - the single source of truth
// This ensures all pages show the same stock status

// ============= PROFILE SPECIFICATIONS =============
// Detailed specifications for each profile including dimensions and descriptions
const PROFILE_SPECS = {
    // Eldorado Stone profiles
    'bluffstone': {
        description: 'Bluffstone is a narrow ledge stone available in a warm palette of tinted neutral grays, wine, and hints of apricot. It\'s perfect for a tight, dry-stacked look. Corners available.',
        flatsHeight: '1" - 5"',
        flatsLength: '3.625" - 21.25"',
        flatsThickness: '0.625" - 2.625"',
        cornerShort: '2.25" - 7"',
        cornerLong: '5.375" - 13.25"'
    },
    'cliffstone': {
        description: 'Explore countless design options with this contemporary, versatile profile that gracefully compliments a variety of modern looks with refined, flat-planed faces and distinctive textural details. Corners available.',
        flatsHeight: '1.25" - 5.5"',
        flatsLength: '4" - 21.25"',
        flatsThickness: '0.625" - 2.375"',
        cornerShort: '1.75" - 5.375"',
        cornerLong: '4.5" - 10.375"'
    },
    'coastal-reef': {
        description: 'Presenting the ocean-worn accents of coral, CoastalReef is a precision cut stone that is deeply faceted in texture and makes for a naturally beautiful range of color. CoastalReef\'s color palettes are culled from coral\'s organic blends of pearl and ecru. Corners available.',
        flatsHeight: '4" - 12"',
        flatsLength: '4" - 16"',
        flatsThickness: '1.25"',
        cornerShort: '2.75" - 6.75"',
        cornerLong: '2.75" - 10.75"'
    },
    'country-rubble': {
        description: 'Country Rubble brings to mind provincial stone types of Europe where the architecture is a reflection of a simpler way of life. Rough-faced stones are shot through with the colors of the region. A simple rustic beauty reflected in the randomness of each individual stone that captures the timeless character of the European countryside. Corners available.',
        flatsHeight: '2" - 16.5"',
        flatsLength: '3.5" - 21"',
        flatsThickness: '0.625" - 2.625"',
        cornerShort: '1" - 5.75"',
        cornerLong: '3" - 11.375"'
    },
    'cut-coarse-stone': {
        description: 'Cut Coarse Stone is reminiscent of a saw-cut Turkish Limestone. The highly textural and yet contemporary linear-style installs with a clean, dry-stack application. This stone is the perfect scale for an efficient installation, appealing to both commercial and residential exteriors and interiors. The muted color palette is indicative of natural limestone. Corners available.',
        flatsHeight: '3", 6", 9"',
        flatsLength: '12", 18", 24"',
        flatsThickness: '0.75" - 2"',
        cornerShort: '2" - 5"',
        cornerLong: '5.625" - 9.625"'
    },
    'cypress-ridge': {
        description: 'Inspired by Italian and Provencal architecture, Cypress Ridge is designed to reflect the poetic harmony and enduring characteristics of age-old hilltop villages. A combination of irregularly shaped stones with colors ranging from sun-drenched golds, earthy browns, and faint olive green hues offset rust-colored accents to give each stone its own story to tell. Corners available.',
        flatsHeight: '1" - 10.5"',
        flatsLength: '4" - 21.25"',
        flatsThickness: '1" - 2.625"',
        cornerShort: '1.75" - 6.25"',
        cornerLong: '3.75" - 11.5"'
    },
    'european-ledge': {
        description: 'European Ledge creates the perfect fusion between old-world stonework and modern design. Evoking a unique balance of weather-worn surface contours and precision-cut stone, this modern interpretation of split-face travertine is assembled into tightly stacked ledge pieces with varying surface heights and lengths. The distinctive appearance delivers a timeless feel to any exterior or interior environment. Corners available.',
        flatsHeight: '4.5"',
        flatsLength: '24"',
        flatsThickness: '0.75" - 2.25"',
        cornerShort: '3.75" - 5"',
        cornerLong: '8.25" - 10"'
    },
    'fieldledge': {
        description: 'Fieldledge is a hybrid of horizontally oriented fieldstones and ledge stones. The stone\'s old world quality and smoother face transitions between a rustic look and an articulated ledge. Fieldledge\'s color palettes range from cool to warm gray blends. Its sepia base and raw linen color is complemented by subtle khaki-greens and olives, warm ochres, chestnut browns, and raw umber. Corners available.',
        flatsHeight: '1.5" - 8"',
        flatsLength: '4" - 19"',
        flatsThickness: '0.5" - 2"',
        cornerShort: '1.75" - 7.25"',
        cornerLong: '2.75" - 13.5"'
    },
    'hillstone': {
        description: 'Hillstone is a distinctive hand-blended stone. With a raw linen color base — hidden by generous swaths of sage and intertwined with hints of tan and ochre — it is rugged and rusticated with the characteristic randomness of the Tuscany countryside. Corners available.',
        flatsHeight: '1" - 11.5"',
        flatsLength: '3" - 16"',
        flatsThickness: '0.75" - 2.5"',
        cornerShort: '1.25" - 6.5"',
        cornerLong: '3.25" - 10"'
    },
    'ledgecut33': {
        description: 'The number 33 represents the 3" height and 3 different lengths of 12", 18", and 24" of stone with LedgeCut33. Individual pieces guarantee a natural and authentic appearance which is easy to handle, cut, and install. LedgeCut33 is designed for a dry-stack installation and includes flat pieces and 90 degree corner pieces. Corners available.',
        flatsHeight: '3"',
        flatsLength: '12", 18", 24"',
        flatsThickness: '0.75" - 2"',
        cornerShort: '2" - 5"',
        cornerLong: '5.75" - 8.5"'
    },
    'limestone': {
        description: 'Limestone is a tailored stone that conveys a traditional formality. It is a hand-dressed, chiseled textured stone roughhewn into a rectangular ashlar profile. The distinctive color blends are versatile palettes ranging from lighter soft creams and golden umbers to light coffee, sienna rusts, and more deep moss greens. Corners available.',
        flatsHeight: '4" - 20.375"',
        flatsLength: '1.5" - 12.5"',
        flatsThickness: '0.625" - 2.25"',
        cornerShort: '2.25" - 4.25"',
        cornerLong: '5.75" - 16"'
    },
    'loreiobrick': {
        description: 'LoreioBrick is a long-format brick profile that represents the next evolution in Euro-inspired contemporary style. The brick silhouette flaunts textural details, slender cuts, and soft gradients that come together to create an architectural balance in any space.',
        flatsHeight: '1.62"',
        flatsLength: '20.25"',
        flatsThickness: '1.125" - 1.375"',
        cornerShort: '1.5" - 1.875"',
        cornerLong: '6.75" - 9"'
    },
    'marquee24': {
        description: 'From refined residences to formal public spaces, majestic churches to modern skyscrapers — the versatility of limestone continues to be a key element of style for the ages. Marquee24 is offered in sleek 12" x 24" stone veneer with the authentic textures and subtle hues of natural cut limestone. Corners available.',
        flatsHeight: '12"',
        flatsLength: '24"',
        flatsThickness: '1"',
        cornerShort: '4"',
        cornerLong: '16"'
    },
    'mountain-ledge': {
        description: 'The contemporary look, warmth, and texture of the Mountain Ledge series is available in a variety of versatile earthen tone palettes. Proportioned to complement fascia accents and custom residences alike, these stones are sized to facilitate selection and reduce installation cost with incremental heights. Corners available.',
        flatsHeight: '1" - 4"',
        flatsLength: '3.5" - 19"',
        flatsThickness: '0.625" - 2.625"',
        cornerShort: '1.25" - 6.25"',
        cornerLong: '2.375" - 17.25"'
    },
    'mountain-ledge-panels': {
        description: 'Mountain Ledge Panels are shaped like the Mountain Ledge stones but they are precast as a panel system to facilitate ease of installation where larger stones are needed for a greater expanse or height. These long panels retain the appearance and precision of individual Mountain Ledge stones hand-laid and dry-stacked together. Corners available.',
        flatsHeight: '5"',
        flatsLength: '8", 12", 20"',
        flatsThickness: '0.625" - 2.5"',
        cornerShort: '2.375"',
        cornerLong: '6.375", 10.375"'
    },
    'ridgetop18': {
        description: 'Blend modern and traditional with this large-faced stone that masterfully combines medium rocky texture, monochromatic colors and a cut that\'s perfect for stacking tight or as a contrasting band against smoother profiles. Corners available.',
        flatsHeight: '9"',
        flatsLength: '18"',
        flatsThickness: '0.625" - 1.625"',
        cornerShort: '4"',
        cornerLong: '13"'
    },
    'rivenwood': {
        description: 'Rivenwood is a panelized profile with wood grain characteristics, inspired by the pioneering craftsmanship seen in 19th-century barns. This product is designed with textural diversity and intricate imperfections for an aged yet contemporary look.',
        flatsHeight: '4"',
        flatsLength: '35.75"',
        flatsThickness: '0.75" - 1.75"',
        cornerShort: '1.5" - 4"',
        cornerLong: '5" - 8.5"'
    },
    'river-rock': {
        description: 'River Rock is meticulously re-created to capture the essence of a river rock with its characteristic shapes and deep naturally rounded stones. Stones are individually selected for their distinct irregularity and unique textural nuances water-worn into the surface. Corners available.',
        flatsHeight: '2" - 12.5"',
        flatsLength: '3" - 14.5"',
        flatsThickness: '0.625" - 2.5"',
        cornerShort: '1.5" - 5.25"',
        cornerLong: '1.75" - 8.5"'
    },
    'roughcut': {
        description: 'RoughCut mimics limestone with its embedded, fossilized artifacts and roughly cleaved, pronounced face. Shaped for bold, traditional statements with clean contemporary lines, the color palettes contain blonds, russet, and cool grays. Corners available.',
        flatsHeight: '1.5" - 11.5"',
        flatsLength: '3.25" - 18.25"',
        flatsThickness: '1" - 2.5"',
        cornerShort: '2" - 9.625"',
        cornerLong: '3.875" - 15.5"'
    },
    'rustic-ledge': {
        description: 'Rustic Ledge is a textured and layered full-scale ledge stone with long dimensional stones. Split along parallel planes, the stones possess distinctive textural foliation and pronounced rock cleavage. Corners available.',
        flatsHeight: '1" - 4.25"',
        flatsLength: '4.5" - 21.25"',
        flatsThickness: '0.625" - 2"',
        cornerShort: '2" - 10.5"',
        cornerLong: '4.5" - 17.375"'
    },
    'shadow-rock': {
        description: 'Dramatic in appearance with exceptional dimension and texture, Shadow Rock is the stone of choice for creative expression and masonry craftsmanship. Crisp angular facets and extraordinary depth creates textural surfaces while dramatic shadowing complements contemporary architectural designs and more rustic environments. Corners available.',
        flatsHeight: '1.125" - 9.25"',
        flatsLength: '3.375" - 20.375"',
        flatsThickness: '0.625" - 2.625"',
        cornerShort: '2.5" - 5.5"',
        cornerLong: '5.5" - 17.5"'
    },
    'sierracut24': {
        description: 'Establish a strong presence with SierraCut24, one of our largest and most distinctive stone surfaces. The heavy rock texture stacks nicely as a foundational element or grand facade. Corners available.',
        flatsHeight: '12"',
        flatsLength: '24"',
        flatsThickness: '1" - 2.625"',
        cornerShort: '4"',
        cornerLong: '16"'
    },
    'stacked-stone': {
        description: 'The classic elegance and intricate detail of small stones combined with the simplicity of a panel system give this stone the appearance of a precision hand-laid dry-stack set. This stone type makes installation easy for expansive walls and column fascias alike. Corners available.',
        flatsHeight: '4"',
        flatsLength: '8", 12", 20"',
        flatsThickness: '0.625" - 2"',
        cornerShort: '2.5"',
        cornerLong: '6.5", 10.5"'
    },
    'tundrabrick': {
        description: 'TundraBrick is a classically-shaped profile with all the surface character you could want. Slightly squared edges are chiseled and worn as if they\'d braved the elements for decades. Corners available.',
        flatsHeight: '2.5"',
        flatsLength: '7.75" - 8"',
        flatsThickness: '0.6875" - 0.8125"',
        cornerShort: '2.875"',
        cornerLong: '7.125"'
    },
    'vantage30': {
        description: 'Vantage30 delivers a unique planking appearance with its long 30" linear lines. The gentle textural surface brings an additional element of movement while uniformly stacking tight for clean installation. Corners available.',
        flatsHeight: '6"',
        flatsLength: '30"',
        flatsThickness: '0.75" - 1.75"',
        cornerShort: '4"',
        cornerLong: '19"'
    },
    'vintage-ranch': {
        description: 'Enjoy the warmth and inviting texture of Vintage Ranch, our authentic interpretation of reclaimed barn wood. This American classic is composed of hand-selected boards culled for their celebrated patina and timeless beauty.',
        flatsHeight: '6"',
        flatsLength: '36"',
        flatsThickness: '1" - 1.3125"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'zen24': {
        description: 'Find balance with this large format stone that harmoniously blends into a space, but adds the light texture reminiscent of gently raked sand in a zen garden. Corners available.',
        flatsHeight: '12"',
        flatsLength: '24"',
        flatsThickness: '1"',
        cornerShort: '4"',
        cornerLong: '16"'
    },
    // Casa di Sassi profiles
    'casa-fieldstone': {
        description: 'Add text',
        flatsHeight: '2" - 8"',
        flatsLength: '4" - 16"',
        flatsThickness: '1" - 3"',
        cornerShort: '2" - 6"',
        cornerLong: '4" - 12"'
    },
    'casa-ledgestone': {
        description: 'Add text',
        flatsHeight: '2" - 4"',
        flatsLength: '4" - 18"',
        flatsThickness: '0.75" - 1.5"',
        cornerShort: '2" - 4"',
        cornerLong: '4" - 10"'
    },
    'quartz-ledgestone': {
        description: 'Add text',
        flatsHeight: '2" - 4"',
        flatsLength: '4" - 16"',
        flatsThickness: '0.75" - 1.5"',
        cornerShort: '2" - 4"',
        cornerLong: '4" - 10"'
    },
    'viso-limestone': {
        description: 'Add text',
        flatsHeight: '2" - 6"',
        flatsLength: '4" - 18"',
        flatsThickness: '1" - 2"',
        cornerShort: '2" - 5"',
        cornerLong: '4" - 12"'
    },
    // Dutch Quality profiles
    'dry-stack': {
        description: 'Add text',
        flatsHeight: '1" - 3"',
        flatsLength: '4" - 16"',
        flatsThickness: '0.75" - 1.5"',
        cornerShort: '2" - 4"',
        cornerLong: '4" - 8"'
    },
    'ledgestone': {
        description: 'Add text',
        flatsHeight: '2" - 4"',
        flatsLength: '4" - 18"',
        flatsThickness: '1" - 2"',
        cornerShort: '2" - 5"',
        cornerLong: '4" - 10"'
    },
    'limestone-dq': {
        description: 'Add text',
        flatsHeight: '2" - 8"',
        flatsLength: '4" - 20"',
        flatsThickness: '1" - 2.5"',
        cornerShort: '2" - 6"',
        cornerLong: '4" - 12"'
    },
    'fieldstone': {
        description: 'Add text',
        flatsHeight: '2" - 8"',
        flatsLength: '4" - 16"',
        flatsThickness: '1" - 3"',
        cornerShort: '2" - 6"',
        cornerLong: '4" - 12"'
    },

    // =====================================================
    // ACCENT PROFILES (Hearthstones, Sills, Caps, etc.)
    // =====================================================
    'hearthstone': {
        description: 'Hearthstones provide a beautiful finishing touch for fireplaces and mantels. Available in multiple edge styles: Chiseled Edge (20 x 20 x 2"), Snapped Edge (20 x 20 x 1.5"), and Split Edge (20 x 20 x 2"). Each style offers a unique texture and appearance.',
        flatsHeight: '20"',
        flatsLength: '20"',
        flatsThickness: '1.5" - 2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'head-keystone': {
        description: 'Head Keystones add architectural detail above windows and doorways. These accent pieces create a classic, elegant appearance.',
        flatsHeight: '11.5"',
        flatsLength: '9.5"',
        flatsThickness: '5"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'trimstone': {
        description: 'Trimstones are versatile accent pieces used for window surrounds, door frames, and other architectural details.',
        flatsHeight: '8"',
        flatsLength: '6"',
        flatsThickness: '2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wainscot-sill': {
        description: 'Wainscot Sills provide a finished edge for wainscot stone applications. Available in Split Edge (20 x 3 x 2") and Snapped Edge (19.75 x 3 x 1.5") styles.',
        flatsHeight: '3"',
        flatsLength: '19.75" - 20"',
        flatsThickness: '1.5" - 2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wainscot-sill-straight': {
        description: 'Wainscot Sill Straight pieces are used for linear applications. Chiseled Edge style with dimensions 19.75 x 3 x 2 x 2.5".',
        flatsHeight: '3"',
        flatsLength: '19.75"',
        flatsThickness: '2" - 2.5"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wainscot-sill-90': {
        description: 'Wainscot Sill 90° corners are used for inside and outside corner applications. Chiseled Edge style with 8 x 8" dimensions.',
        flatsHeight: '8"',
        flatsLength: '8"',
        flatsThickness: '2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wainscot-sill-135': {
        description: 'Wainscot Sill 135° corners are used for angled corner applications. Chiseled Edge style with 7.5 x 7.5" dimensions.',
        flatsHeight: '7.5"',
        flatsLength: '7.5"',
        flatsThickness: '2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wall-cap': {
        description: 'Wall Caps provide a finished top edge for stone walls and columns. Available in Chiseled Edge (37" lengths in 6", 9", and 12" depths) and Split Edge (30" lengths in 9" and 12" depths) styles.',
        flatsHeight: '2" - 2.25"',
        flatsLength: '30" - 37"',
        flatsThickness: '6" - 12"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'wall-cap-peaked': {
        description: 'Wall Cap Peaked provides a decorative peaked top (3.5" peak) for columns and wall ends. Available in 12 x 20" and 16 x 20" sizes with Chiseled Edge finish.',
        flatsHeight: '2.375" + 3.5" peak',
        flatsLength: '20"',
        flatsThickness: '12" - 16"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'archstone': {
        description: 'Archstones are used to create beautiful curved details above windows and doorways. Chiseled Edge finish with 13 x 11 x 5.5" dimensions.',
        flatsHeight: '11"',
        flatsLength: '13"',
        flatsThickness: '5.5"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'archstone-keystone': {
        description: 'Archstone Keystones are the center accent piece for arch applications. Ashlar finish with 15 x 8 x 5" dimensions.',
        flatsHeight: '8"',
        flatsLength: '15"',
        flatsThickness: '5"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'column-cap': {
        description: 'Column Caps provide a finished top for stone columns. Available in multiple sizes and edge styles: Chiseled Edge (24 x 24 x 2.5"), Snapped Edge (18-24" square x 1.5"), and Split Edge (18-26" square x 2").',
        flatsHeight: '1.5" - 2.5"',
        flatsLength: '18" - 26"',
        flatsThickness: '18" - 26"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'headstone-straight': {
        description: 'Headstones provide a finished edge at the top of stone applications. Straight pieces with Ashlar finish, 17.75 x 7.75" dimensions.',
        flatsHeight: '7.75"',
        flatsLength: '17.75"',
        flatsThickness: '2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'headstone-left': {
        description: 'Headstone Left corners provide a finished left-turn edge. Ashlar finish with 15.5 x 7.75 x 17" dimensions.',
        flatsHeight: '7.75"',
        flatsLength: '15.5"',
        flatsThickness: '17"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'headstone-right': {
        description: 'Headstone Right corners provide a finished right-turn edge. Ashlar finish with 15.5 x 7.75 x 17" dimensions.',
        flatsHeight: '7.75"',
        flatsLength: '15.5"',
        flatsThickness: '17"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'electrical-box': {
        description: 'Electrical Box covers allow outlets to be installed within stone veneer walls. Single size 6 x 8 x 2".',
        flatsHeight: '8"',
        flatsLength: '6"',
        flatsThickness: '2"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    },
    'light-box': {
        description: 'Light Box covers allow light fixtures to be installed within stone veneer walls. Standard size 8 x 10 x 1.75".',
        flatsHeight: '10"',
        flatsLength: '8"',
        flatsThickness: '1.75"',
        cornerShort: 'N/A',
        cornerLong: 'N/A'
    }
};

// Default specs for profiles not in the database
const DEFAULT_PROFILE_SPECS = {
    description: 'Add text',
    flatsHeight: 'Varies',
    flatsLength: 'Varies',
    flatsThickness: 'Varies',
    cornerShort: 'Varies',
    cornerLong: 'Varies'
};

// Get profile specs with fallback to defaults
function getProfileSpecs(profile) {
    const normalizedProfile = profile ? profile.toLowerCase().replace(/\s+/g, '-') : '';
    return PROFILE_SPECS[normalizedProfile] || DEFAULT_PROFILE_SPECS;
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer Visualizer DOM loaded...');

    // Clear old/stale preset data from localStorage to ensure fresh presets are used
    // This prevents issues where old presets with wrong keys are cached
    localStorage.removeItem('samplePresets');

    // Initialize canvas
    canvas = document.getElementById('main-canvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    ctx = canvas.getContext('2d');

    // Load visualizer data from localStorage
    loadVisualizerData();

    // Setup UI event listeners
    setupEventListeners();

    // Initialize modal with default category styles and manufacturers
    updateStyleOptionsForCategory('all');
    updateManufacturerOptionsForCategory('all');

    // Initialize lighting controls
    initLightingControls();

    // Initialize quote modal
    initQuoteModal();

    // Initialize material info panel close button
    const infoCloseBtn = document.getElementById('material-info-close');
    if (infoCloseBtn) {
        infoCloseBtn.addEventListener('click', () => {
            hideInfoPanel();
        });
    }

    // Initialize compare slots
    initCompareSlots();

    // Initialize inline browse section
    initInlineBrowse();

    // Initialize sticky positioning for right info panel
    initInfoPanelStickyHandler();

    // Initialize floating done button
    initFloatingDoneButton();

    // Initialize mobile selected strip (starts hidden/empty)
    updateMobileSelectedStrip();

    // Setup mobile material badge click handler
    const mobileBadge = document.getElementById('mobile-material-badge');
    if (mobileBadge) {
        mobileBadge.addEventListener('click', function() {
            const material = this._material;
            if (material) {
                // Show the product detail popup for this material
                showProductDetailPopup(material, [material]);
            }
        });
    }
});

// ============= DATA LOADING =============
async function loadVisualizerData() {
    // Get selected sample from choose-sample page
    const visualizerDataStr = localStorage.getItem('visualizerData');
    if (!visualizerDataStr) {
        console.error('No visualizer data found');
        showNoPresetMessage();
        return;
    }

    const visualizerData = JSON.parse(visualizerDataStr);
    console.log('Visualizer data:', visualizerData);

    if (!visualizerData.sample) {
        console.error('No sample selected');
        showNoPresetMessage();
        return;
    }

    // Update scene name in header
    document.getElementById('scene-name').textContent = visualizerData.sample.name;

    // Check if this is a custom upload with AI-generated mask
    if (visualizerData.isCustomUpload && visualizerData.customAreas) {
        console.log('Loading custom upload with AI-generated mask');
        loadCustomUploadData(visualizerData);
        return;
    }

    // Get the house key from the sample image path
    const imagePath = visualizerData.sample.image;
    const houseKey = getHouseKey(imagePath);
    console.log('Looking for preset with key:', houseKey);

    // Try to load preset from multiple sources
    let preset = null;

    // 1. Try localStorage first
    const samplePresetsStr = localStorage.getItem('samplePresets');
    if (samplePresetsStr) {
        const samplePresets = JSON.parse(samplePresetsStr);
        preset = samplePresets[houseKey];
        if (preset) {
            console.log('Found preset in localStorage');
        }
    }

    // 2. If not in localStorage, try the SAMPLE_PRESETS from presets.js
    if (!preset && window.SAMPLE_PRESETS && window.SAMPLE_PRESETS[houseKey]) {
        preset = window.SAMPLE_PRESETS[houseKey];
        console.log('Found preset in SAMPLE_PRESETS');
    }

    // 3. If still not found, try fetching from JSON file
    if (!preset) {
        try {
            const presetFileName = houseKey.replace(/\s+/g, '-').toLowerCase();
            const response = await fetch(`./presets/${presetFileName}.json`);
            if (response.ok) {
                preset = await response.json();
                console.log('Loaded preset from JSON file');
            }
        } catch (e) {
            console.log('No preset JSON file found');
        }
    }

    if (!preset) {
        console.log('No preset found for:', houseKey);
        showNoPresetMessage();
        return;
    }

    // Ensure the house path is correct (use file path, not base64)
    if (preset.house && preset.house.startsWith('data:')) {
        // Replace base64 with proper file path
        preset.house = imagePath;
    }

    // Load the preset data
    loadProjectData(preset);

    // Also load any pre-selected material from product-selector
    if (visualizerData.material) {
        selectedMaterial = visualizerData.material;
        console.log('Pre-selected material:', selectedMaterial);
    }
}

// Handle custom uploaded photos with AI-generated masks
function loadCustomUploadData(visualizerData) {
    console.log('=== LOADING CUSTOM UPLOAD ===');
    console.log('Sample image length:', visualizerData.sample?.image?.length || 0);
    console.log('Custom areas count:', visualizerData.customAreas?.length || 0);
    if (visualizerData.customAreas?.[0]?.mask) {
        console.log('Mask data length:', visualizerData.customAreas[0].mask.length);
    }

    // Hide the "no preset" message
    hideNoPresetMessage();

    // Create a preset-like structure from the custom data
    const customPreset = {
        house: visualizerData.sample.image, // Base64 image data
        areas: []
    };

    // Convert custom areas (with mask data) to area format
    if (visualizerData.customAreas && visualizerData.customAreas.length > 0) {
        visualizerData.customAreas.forEach((area, index) => {
            customPreset.areas.push({
                id: `custom-area-${index}`,
                name: `Wall ${index + 1}`,
                points: area.points || [],
                mask: area.mask, // Store the mask data URL for later use
                useMask: true // Flag to use mask instead of polygon
            });
        });
    }

    console.log('Custom preset created with', customPreset.areas.length, 'areas');
    console.log('House image starts with:', customPreset.house?.substring(0, 50));

    // Load the project data
    loadProjectData(customPreset);

    // Store reference to custom mask for rendering
    window.customMaskData = visualizerData.customAreas[0]?.mask;
    console.log('Custom mask data stored in window.customMaskData');
}

function getHouseKey(imagePath) {
    if (!imagePath) return null;
    // Extract filename without extension
    const filename = imagePath.split('/').pop();
    return filename.split('.')[0];
}

function loadProjectData(data) {
    console.log('Loading project data:', data);
    projectData = data;
    customerAreas = data.areas || [];

    // Hide the "no preset" message and ensure canvas is visible
    hideNoPresetMessage();

    // Load the house image
    if (data.house) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            customerImage = img;
            console.log('House image loaded:', img.width, 'x', img.height);

            // Set canvas dimensions based on image orientation
            const isPortrait = img.height > img.width;
            if (isPortrait) {
                canvas.width = 960;
                canvas.height = 1600;
            } else {
                canvas.width = 1600;
                canvas.height = 960;
            }

            // Draw the canvas
            drawCanvas();

            // Show compare controls
            const compareControls = document.getElementById('compare-controls');
            if (compareControls) {
                compareControls.style.display = 'flex';
            }

            // Initialize color customization if there are customizable areas
            initColorCustomization();
        };
        img.onerror = function() {
            console.error('Failed to load house image:', data.house);
            showNoPresetMessage();
        };
        img.src = data.house;
    }
}

function hideNoPresetMessage() {
    const canvasContainer = document.getElementById('canvas-container');
    const noPresetMessage = document.getElementById('no-preset-message');
    const materialPanel = document.getElementById('material-panel');

    if (canvasContainer) canvasContainer.style.display = 'block';
    if (noPresetMessage) {
        noPresetMessage.classList.remove('visible');
        noPresetMessage.classList.add('hidden');
    }
    if (materialPanel) materialPanel.style.display = 'flex';
}

function showNoPresetMessage() {
    const canvasContainer = document.getElementById('canvas-container');
    const noPresetMessage = document.getElementById('no-preset-message');
    const materialPanel = document.getElementById('material-panel');

    if (canvasContainer) canvasContainer.style.display = 'none';
    if (noPresetMessage) {
        noPresetMessage.classList.remove('hidden');
        noPresetMessage.classList.add('visible');
    }
    if (materialPanel) materialPanel.style.display = 'none';
}

// ============= CANVAS DRAWING =============
function drawCanvas() {
    if (!ctx || !customerImage) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate scaling to fit image in canvas
    const imageWidth = customerImage.naturalWidth || customerImage.width;
    const imageHeight = customerImage.naturalHeight || customerImage.height;

    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const drawX = (canvasWidth - drawWidth) / 2;
    const drawY = (canvasHeight - drawHeight) / 2;

    // Store bounds for later use
    window._bgImageBounds = { drawX, drawY, drawWidth, drawHeight, scale };

    // Fill background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw house image
    ctx.drawImage(customerImage, drawX, drawY, drawWidth, drawHeight);

    // Draw materials on areas with proper z-index layering
    // Order: color fills (siding, roof, etc.) -> trim -> sills -> hearth -> mantle -> stone
    if (customerAreas && customerAreas.length > 0) {
        // Define rendering order - lower priority renders first (bottom), higher renders last (top)
        const areaTypePriority = {
            'roof': 1,
            'siding': 2,
            'soffit': 3,
            'door': 4,
            'shutters': 5,
            'trim': 6,
            'sills': 7,
            'hearth': 8,
            'mantle': 9
            // Stone areas (no areaType) render last
        };

        // Sort areas by priority - stone areas (no areaType with stone) go last
        const sortedAreas = [...customerAreas].sort((a, b) => {
            const priorityA = a.areaType ? (areaTypePriority[a.areaType] || 0) : 100;
            const priorityB = b.areaType ? (areaTypePriority[b.areaType] || 0) : 100;
            return priorityA - priorityB;
        });

        // First pass: draw all areas EXCEPT sills (sills need to be drawn after cutouts)
        sortedAreas.forEach((area, index) => {
            if (area.isCutout) return;
            if (area.areaType === 'sills') return; // Skip sills for now - drawn after cutouts

            // Handle color fill areas (siding, roof, trim, etc.)
            // Only render if user has modified this area type
            if (area.textureMode === 'color_fill' && area.fillColor) {
                if (modifiedAreaTypes.has(area.areaType)) {
                    drawColorFillArea(area);
                }
            }
            // Handle texture fill areas (mantle, hearth with wood/stone textures)
            // Only render if user has modified this area type
            else if (area.textureMode === 'texture_fill' && area.textureUrl) {
                if (modifiedAreaTypes.has(area.areaType)) {
                    drawTextureFillArea(area);
                }
            }
            // Handle stone/brick texture areas - always render
            else if (area.stone && area.stone.url) {
                drawAreaMaterial(area, index);
            }
        });

        // Draw cutouts - restore original image in cutout areas (windows, doors)
        customerAreas.forEach((area) => {
            if (area.isCutout) {
                drawCutout(area);
            }
        });

        // Now draw sills AFTER cutouts so they appear on top of windows
        // Sills should always be drawn if they have a fillColor defined (from preset or user selection)
        sortedAreas.forEach((area, index) => {
            if (area.areaType !== 'sills') return;

            if (area.textureMode === 'color_fill' && area.fillColor) {
                // Always draw sills that have a color - they should always be visible
                drawColorFillArea(area);
            }
        });
    }

    // Draw depth edges (shadows) if they exist in the project data
    if (projectData && projectData.depthEdges && projectData.depthEdges.length > 0) {
        projectData.depthEdges.forEach(edge => {
            drawDepthEdgeEffect(edge);
        });
    }
}

// Draw depth edge shadow effects
function drawDepthEdgeEffect(edge) {
    drawDepthEdgeEffectOnCanvas(ctx, edge);
}

// Draw depth edge shadow effects on a specific canvas context
function drawDepthEdgeEffectOnCanvas(targetCtx, edge) {
    if (!edge || !edge.points || edge.points.length < 2) return;

    const intensity = edge.intensity || 17;
    const shadowOpacity = (edge.shadowOpacity || 40) / 100;
    const shadowOffset = edge.shadowOffset || 5;
    const shadowBlur = edge.shadowBlur || 3;

    targetCtx.save();

    if (edge.mode === 'line') {
        // Draw line depth effect
        const start = edge.points[0];
        const end = edge.points[1];

        // Calculate perpendicular direction for depth effect
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;

        // Create gradient for depth effect
        const gradient = targetCtx.createLinearGradient(
            start.x, start.y,
            start.x + perpX * intensity, start.y + perpY * intensity
        );

        gradient.addColorStop(0, `rgba(0, 0, 0, ${shadowOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Draw depth shadow
        targetCtx.strokeStyle = gradient;
        targetCtx.lineWidth = intensity;
        targetCtx.lineCap = 'square';
        targetCtx.beginPath();
        targetCtx.moveTo(start.x + shadowOffset, start.y + shadowOffset);
        targetCtx.lineTo(end.x + shadowOffset, end.y + shadowOffset);
        targetCtx.stroke();

    } else if (edge.mode === 'area' && edge.points.length >= 3) {
        // Draw area depth effect - simple semi-transparent fill
        targetCtx.beginPath();
        targetCtx.moveTo(edge.points[0].x, edge.points[0].y);
        for (let i = 1; i < edge.points.length; i++) {
            targetCtx.lineTo(edge.points[i].x, edge.points[i].y);
        }
        targetCtx.closePath();

        // Use a subtle but visible shadow opacity (reduce the preset value slightly)
        const adjustedOpacity = shadowOpacity * 0.5; // 40% becomes 20%, which is visible but subtle
        targetCtx.fillStyle = `rgba(0, 0, 0, ${adjustedOpacity})`;
        targetCtx.fill();
    }

    targetCtx.restore();
}

function drawColorFillArea(area) {
    if (!area.points || area.points.length < 3) return;

    ctx.save();

    // Create path for the area with cutouts using evenodd fill rule
    ctx.beginPath();

    // Draw main area path
    area.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Draw cutout paths (holes in the fill)
    if (area.cutouts && area.cutouts.length > 0) {
        area.cutouts.forEach(cutoutId => {
            const cutout = customerAreas.find(a => a.id === cutoutId);
            if (cutout && cutout.points && cutout.points.length >= 3) {
                // Draw cutout path in reverse direction to create a hole
                cutout.points.forEach((pt, i) => {
                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.closePath();
            }
        });
    }

    // Fill with color using evenodd rule to punch out cutouts
    ctx.fillStyle = area.fillColor;

    // Sills and trim should always be fully opaque so they're visible
    if (area.areaType === 'sills' || area.areaType === 'trim') {
        ctx.globalAlpha = 1;
    } else {
        ctx.globalAlpha = (area.materialOpacity !== undefined ? area.materialOpacity : 1) *
                          (area.fillOpacity !== undefined ? area.fillOpacity : 1);
    }
    ctx.fill('evenodd');

    ctx.restore();
}

function drawTextureFillArea(area) {
    if (!area.points || area.points.length < 3 || !area.textureUrl) return;

    // Check if texture is already loaded
    if (loadedTextures[area.textureUrl]) {
        drawTextureFillWithImage(area, loadedTextures[area.textureUrl]);
    } else {
        // Load texture
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            loadedTextures[area.textureUrl] = img;
            drawTextureFillWithImage(area, img);
        };
        img.src = area.textureUrl;
    }
}

function drawTextureFillWithImage(area, img) {
    if (!area.points || area.points.length < 3) return;

    const bounds = getAreaBounds(area.points);

    ctx.save();

    // Create clipping path for the area
    ctx.beginPath();
    area.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();

    // Add cutout paths if any
    if (area.cutouts && area.cutouts.length > 0) {
        area.cutouts.forEach(cutoutId => {
            const cutout = customerAreas.find(a => a.id === cutoutId);
            if (cutout && cutout.points && cutout.points.length >= 3) {
                cutout.points.forEach((pt, i) => {
                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.closePath();
            }
        });
    }

    ctx.clip('evenodd');

    // Set opacity
    ctx.globalAlpha = area.materialOpacity !== undefined ? area.materialOpacity : 0.8;

    // Calculate scale to fit texture nicely with normalization
    const scale = (area.scale || 100) / 100 * 0.5;
    const tileDims = getNormalizedTileDimensions(img, scale);
    const tileWidth = tileDims.width;
    const tileHeight = tileDims.height;

    // Tile the texture across the area
    for (let y = bounds.minY; y < bounds.maxY; y += tileHeight) {
        for (let x = bounds.minX; x < bounds.maxX; x += tileWidth) {
            ctx.drawImage(img, x, y, tileWidth, tileHeight);
        }
    }

    ctx.restore();
}

// Helper function to draw color fills on a given canvas context
// Used by before/after comparison to show customized colors without stone
function drawColorFillsOnCanvas(targetCtx) {
    if (!customerAreas || customerAreas.length === 0) return;

    // Define rendering order - same as main drawCanvas
    const areaTypePriority = {
        'roof': 1,
        'siding': 2,
        'soffit': 3,
        'door': 4,
        'shutters': 5,
        'trim': 6,
        'sills': 7,
        'hearth': 8,
        'mantle': 9
    };

    // Sort areas by priority
    const sortedAreas = [...customerAreas].sort((a, b) => {
        const priorityA = a.areaType ? (areaTypePriority[a.areaType] || 0) : 100;
        const priorityB = b.areaType ? (areaTypePriority[b.areaType] || 0) : 100;
        return priorityA - priorityB;
    });

    sortedAreas.forEach(area => {
        if (area.isCutout) return;

        // Only draw color_fill areas that have been modified by the user
        if (area.textureMode === 'color_fill' && area.fillColor && modifiedAreaTypes.has(area.areaType)) {
            drawColorFillAreaOnCtx(targetCtx, area);
        }
        // Draw texture_fill areas that have been modified
        else if (area.textureMode === 'texture_fill' && area.textureUrl && modifiedAreaTypes.has(area.areaType)) {
            if (loadedTextures[area.textureUrl]) {
                drawTextureFillAreaOnCtx(targetCtx, area, loadedTextures[area.textureUrl]);
            }
        }
    });
}

// Draw a color fill area on a specific context
function drawColorFillAreaOnCtx(targetCtx, area) {
    if (!area.points || area.points.length < 3) return;

    targetCtx.save();

    // Create path for the area with cutouts
    targetCtx.beginPath();
    area.points.forEach((pt, i) => {
        if (i === 0) targetCtx.moveTo(pt.x, pt.y);
        else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();

    // Draw cutout paths
    if (area.cutouts && area.cutouts.length > 0) {
        area.cutouts.forEach(cutoutId => {
            const cutout = customerAreas.find(a => a.id === cutoutId);
            if (cutout && cutout.points && cutout.points.length >= 3) {
                cutout.points.forEach((pt, i) => {
                    if (i === 0) targetCtx.moveTo(pt.x, pt.y);
                    else targetCtx.lineTo(pt.x, pt.y);
                });
                targetCtx.closePath();
            }
        });
    }

    targetCtx.fillStyle = area.fillColor;
    targetCtx.globalAlpha = (area.materialOpacity !== undefined ? area.materialOpacity : 1) *
                            (area.fillOpacity !== undefined ? area.fillOpacity : 1);
    targetCtx.fill('evenodd');

    targetCtx.restore();
}

// Draw a texture fill area on a specific context
function drawTextureFillAreaOnCtx(targetCtx, area, img) {
    if (!area.points || area.points.length < 3) return;

    const bounds = getAreaBounds(area.points);

    targetCtx.save();

    // Create clipping path
    targetCtx.beginPath();
    area.points.forEach((pt, i) => {
        if (i === 0) targetCtx.moveTo(pt.x, pt.y);
        else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();

    if (area.cutouts && area.cutouts.length > 0) {
        area.cutouts.forEach(cutoutId => {
            const cutout = customerAreas.find(a => a.id === cutoutId);
            if (cutout && cutout.points && cutout.points.length >= 3) {
                cutout.points.forEach((pt, i) => {
                    if (i === 0) targetCtx.moveTo(pt.x, pt.y);
                    else targetCtx.lineTo(pt.x, pt.y);
                });
                targetCtx.closePath();
            }
        });
    }

    targetCtx.clip('evenodd');
    targetCtx.globalAlpha = area.materialOpacity !== undefined ? area.materialOpacity : 0.8;

    // Calculate scale with normalization for consistent sizing
    const scale = (area.scale || 100) / 100 * 0.5;
    const tileDims = getNormalizedTileDimensions(img, scale);
    const tileWidth = tileDims.width;
    const tileHeight = tileDims.height;

    for (let y = bounds.minY; y < bounds.maxY; y += tileHeight) {
        for (let x = bounds.minX; x < bounds.maxX; x += tileWidth) {
            targetCtx.drawImage(img, x, y, tileWidth, tileHeight);
        }
    }

    targetCtx.restore();
}

function drawAreaMaterial(area, index) {
    if (!area.stone || !area.stone.url) return;

    // Check if texture is loaded
    if (loadedTextures[area.stone.url]) {
        drawAreaMaterialWithImage(area, loadedTextures[area.stone.url]);
    } else {
        // Load texture
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            loadedTextures[area.stone.url] = img;
            drawAreaMaterialWithImage(area, img);
        };
        img.src = area.stone.url;
    }
}

function drawAreaMaterialWithImage(area, img) {
    // Check if this area uses a mask (from custom upload) instead of polygon points
    if (area.useMask && area.mask) {
        drawAreaMaterialWithMask(area, img);
        return;
    }

    const bounds = getAreaBounds(area.points);

    // Determine if this is a brick texture based on textureMode or material profile
    const isBrick = area.textureMode === 'brick_linear' ||
                    area.textureMode === 'brick_running' ||
                    (area.stone && area.stone.profile &&
                     (area.stone.profile.includes('brick') || area.stone.manufacturer === 'thin-brick' || area.stone.manufacturer === 'full-brick'));

    const scale = scaleToRealSize(area.scale || 200, isBrick);

    ctx.save();

    // Create clipping path for the area
    ctx.beginPath();
    area.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.clip();

    // Draw the tiled texture with normalized dimensions
    const tileDims = getNormalizedTileDimensions(img, scale);
    const tileWidth = tileDims.width;
    const tileHeight = tileDims.height;

    for (let y = bounds.minY; y < bounds.maxY; y += tileHeight) {
        for (let x = bounds.minX; x < bounds.maxX; x += tileWidth) {
            ctx.drawImage(img, x, y, tileWidth, tileHeight);
        }
    }

    ctx.restore();
}

// Draw texture using a mask image (from AI segmentation)
function drawAreaMaterialWithMask(area, textureImg) {
    const maskDataUrl = area.mask;
    if (!maskDataUrl) return;

    // Check if mask is already loaded
    if (loadedTextures['mask_' + area.id]) {
        applyMaskedTexture(area, textureImg, loadedTextures['mask_' + area.id]);
    } else {
        // Load the mask image
        const maskImg = new Image();
        maskImg.onload = function() {
            loadedTextures['mask_' + area.id] = maskImg;
            applyMaskedTexture(area, textureImg, maskImg);
        };
        maskImg.src = maskDataUrl;
    }
}

function applyMaskedTexture(area, textureImg, maskImg) {
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Get the image bounds (how the image is positioned on canvas)
    // This was calculated in drawCanvas() and stored for us
    const bounds = window._bgImageBounds;
    if (!bounds) {
        console.error('No image bounds available for mask alignment');
        return;
    }

    const { drawX, drawY, drawWidth, drawHeight } = bounds;

    // Determine if this is a brick texture
    const isBrick = area.textureMode === 'brick_linear' ||
                    area.textureMode === 'brick_running' ||
                    (area.stone && area.stone.profile &&
                     (area.stone.profile.includes('brick') || area.stone.manufacturer === 'thin-brick' || area.stone.manufacturer === 'full-brick'));

    const scale = scaleToRealSize(area.scale || 200, isBrick);

    // Create temporary canvas for the texture
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = canvasWidth;
    textureCanvas.height = canvasHeight;
    const textureCtx = textureCanvas.getContext('2d');

    // Tile the texture across the entire canvas with normalized dimensions
    const tileDims = getNormalizedTileDimensions(textureImg, scale);
    const tileWidth = tileDims.width;
    const tileHeight = tileDims.height;

    for (let y = 0; y < canvasHeight; y += tileHeight) {
        for (let x = 0; x < canvasWidth; x += tileWidth) {
            textureCtx.drawImage(textureImg, x, y, tileWidth, tileHeight);
        }
    }

    // Create temporary canvas for the mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvasWidth;
    maskCanvas.height = canvasHeight;
    const maskCtx = maskCanvas.getContext('2d');

    // CRITICAL FIX: Draw mask aligned with the image position, not filling entire canvas
    // The mask was created at the same dimensions as the uploaded image
    // It needs to be drawn at the same position/scale as the house image
    maskCtx.drawImage(maskImg, drawX, drawY, drawWidth, drawHeight);

    // Get mask pixel data
    const maskData = maskCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const textureData = textureCtx.getImageData(0, 0, canvasWidth, canvasHeight);

    // Apply mask - where mask has white or red pixels, keep texture; otherwise transparent
    for (let i = 0; i < maskData.data.length; i += 4) {
        const r = maskData.data[i];
        const g = maskData.data[i + 1];
        const b = maskData.data[i + 2];
        const a = maskData.data[i + 3];

        // Check if this pixel is part of the mask
        // Support both formats:
        // 1. Black/white mask from polygon tool (white = selected)
        // 2. Red overlay mask from brush tool (red tint = selected)
        const isWhiteMask = r > 200 && g > 200 && b > 200; // White pixels
        const isRedMask = a > 30 && (r > 50 && r > g && r > b); // Red tinted pixels
        const isMasked = isWhiteMask || isRedMask;

        if (!isMasked) {
            // Make texture transparent where not masked
            textureData.data[i + 3] = 0;
        }
    }

    textureCtx.putImageData(textureData, 0, 0);

    // Draw the masked texture onto main canvas
    ctx.drawImage(textureCanvas, 0, 0);
}

function drawCutout(area) {
    if (!customerImage || !area.points || area.points.length < 3) return;

    ctx.save();

    // Create clipping path
    ctx.beginPath();
    area.points.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.clip();

    // Draw original image in this area
    const bounds = window._bgImageBounds;
    if (bounds) {
        ctx.drawImage(customerImage, bounds.drawX, bounds.drawY, bounds.drawWidth, bounds.drawHeight);
    }

    ctx.restore();
}

function getAreaBounds(points) {
    if (!points || points.length === 0) {
        return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
    });
    return { minX, minY, maxX, maxY };
}

function scaleToRealSize(scale, isBrick = false) {
    // The admin editor stores scale as a slider value (typically 10-1000 for stone)
    // A lower scale value means smaller texture tiles
    // Scale 68 should produce small, realistic stone sizes
    // Dividing by 1000 gives: scale 68 = 0.068x, scale 200 = 0.2x (2x smaller than before)
    // Apply 72.5% increase for better visibility
    return (scale / 1000) * 1.725;
}

// Standard reference dimensions for texture normalization
// All textures will be normalized to render as if they were this size
const TEXTURE_REFERENCE_WIDTH = 1000;  // Reference width in pixels
const TEXTURE_REFERENCE_HEIGHT = 1000; // Reference height in pixels

// Calculate normalized tile dimensions so all textures render at consistent sizes
// regardless of their source image resolution
function getNormalizedTileDimensions(img, scale) {
    // Calculate normalization factor based on reference size
    // This ensures a 500px image and a 2000px image render at the same visual size
    const normalizationFactor = TEXTURE_REFERENCE_WIDTH / Math.max(img.width, img.height);

    // Apply normalization and scale
    const normalizedWidth = img.width * normalizationFactor * scale;
    const normalizedHeight = img.height * normalizationFactor * scale;

    return {
        width: normalizedWidth,
        height: normalizedHeight
    };
}

// ============= MATERIAL APPLICATION =============
function applyMaterialToAllAreas(material) {
    console.log('Applying material to all areas:', material.name);
    console.log('Number of customer areas:', customerAreas ? customerAreas.length : 0);
    console.log('Customer image loaded:', customerImage ? 'Yes' : 'No');
    console.log('Project data:', projectData);

    if (!customerAreas || customerAreas.length === 0) {
        console.warn('No customer areas found to apply material to!');
        // Show user feedback
        alert('This scene does not have any stone areas mapped yet. Please try a different scene or contact support.');
        return;
    }

    // Check if any areas can actually receive stone (not cutouts or color fills)
    const stoneAreas = customerAreas.filter(area => !area.isCutout && area.textureMode !== 'color_fill');
    if (stoneAreas.length === 0) {
        console.warn('All areas are cutouts or color fills - no stone areas available');
        alert('This scene does not have any stone areas available. All areas are either cutouts or color fills.');
        return;
    }
    console.log('Stone-applicable areas:', stoneAreas.length);

    // Pre-load the texture
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        console.log('Texture loaded:', material.url, 'Size:', img.width, 'x', img.height);
        loadedTextures[material.url] = img;

        // Apply to all non-cutout, non-color-fill areas
        let appliedCount = 0;
        customerAreas.forEach(area => {
            // Skip cutouts and color fill areas
            if (area.isCutout) {
                console.log('Skipping cutout area:', area.id);
                return;
            }
            if (area.textureMode === 'color_fill') {
                console.log('Skipping color fill area:', area.id);
                return;
            }

            area.stone = {
                url: material.url,
                name: material.name,
                manufacturer: material.manufacturer,
                profile: material.profile
            };
            appliedCount++;
            console.log('Applied material to area:', area.id, 'points:', area.points?.length);
        });

        console.log('Material applied to', appliedCount, 'areas. Redrawing canvas...');

        // Redraw canvas
        drawCanvas();

        // Update material badge on canvas
        updateAppliedMaterialBadge(material);
    };
    img.onerror = function() {
        console.error('Failed to load texture:', material.url);
    };
    img.src = material.url;
}

// Update/show material badge on canvas (desktop) and mobile info bar
function updateAppliedMaterialBadge(material) {
    // Desktop badge on canvas
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        // Remove existing badge
        const existingBadge = canvasContainer.querySelector('.applied-material-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        if (material) {
            // Create badge element
            const badge = document.createElement('div');
            badge.className = 'applied-material-badge';
            badge.innerHTML = `
                <img src="${material.url}" alt="${material.name}">
                <div class="badge-text">
                    <span class="badge-name">${material.name || 'Unknown'}</span>
                    <span class="badge-color">${material.color || material.profile || ''}</span>
                </div>
            `;
            canvasContainer.appendChild(badge);
        }
    }

    // Mobile badge below canvas
    const mobileBadge = document.getElementById('mobile-material-badge');
    if (mobileBadge) {
        if (material) {
            mobileBadge.classList.add('has-material');
            mobileBadge.innerHTML = `
                <img src="${material.url}" alt="${material.name}">
                <div class="badge-text">
                    <span class="badge-name">${material.name || 'Unknown'}</span>
                    <span class="badge-color">${material.color || material.profile || ''}</span>
                </div>
            `;
            // Store material data for click handler
            mobileBadge._material = material;
        } else {
            mobileBadge.classList.remove('has-material');
            mobileBadge.innerHTML = '<span class="badge-empty-text">Tap a stone below</span>';
            mobileBadge._material = null;
        }
    }
}

// Update mobile selected materials strip - placeholder, real function defined later
function updateMobileSelectedStrip() {
    // This will be overwritten by the real function after inlineSelectedMaterials is defined
}

// ============= MODAL STATE =============
let modalSelectedMaterials = []; // Array of up to 5 selected materials
let modalActiveCategory = 'all';
let modalActiveStyle = 'all';
let modalActiveManufacturer = 'all';
let modalActiveColor = 'all';
let modalActiveAvailability = 'all';
let modalSearchTerm = '';
const MAX_SELECTED_MATERIALS = 5;

// Quick-access materials on left side of canvas
let savedMaterials = []; // Materials saved for quick switching
let activeMaterialIndex = 0; // Currently active material in the quick-access list

// ============= UI SETUP =============
function setupEventListeners() {
    // Download button
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadImage);
    }

    // Compare toggle (Before/After)
    const compareToggle = document.getElementById('compare-toggle');
    if (compareToggle) {
        compareToggle.addEventListener('click', toggleCompare);
    }

    // Compare toggle in header (Before/After button)
    const compareToggleHeader = document.getElementById('compare-toggle-header');
    if (compareToggleHeader) {
        compareToggleHeader.addEventListener('click', function() {
            toggleCompare();
            // Sync the active state with the header button
            this.classList.toggle('active', compareMode);
        });
    }

    // Compare Materials button
    const compareMaterialsBtn = document.getElementById('compare-materials-btn');
    if (compareMaterialsBtn) {
        compareMaterialsBtn.addEventListener('click', toggleCompareMaterials);
    }

    // Compare material thumb - click to select different material (left side)
    const compareMaterialThumb = document.getElementById('compare-material-thumb');
    if (compareMaterialThumb) {
        compareMaterialThumb.addEventListener('click', () => {
            selectingMaterialSlot = 'A';
            openMaterialModalForCompare();
        });
    }

    // Compare selector close button
    const compareSelectorClose = document.getElementById('compare-selector-close');
    if (compareSelectorClose) {
        compareSelectorClose.addEventListener('click', exitCompareMaterialsMode);
    }

    // Browse Materials button - opens modal
    const browseBtn = document.getElementById('browse-materials-btn');
    if (browseBtn) {
        browseBtn.addEventListener('click', openMaterialModal);
    }

    // Modal close buttons
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMaterialModal);
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeMaterialModal);
    }

    // Modal backdrop click to close
    const modal = document.getElementById('material-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeMaterialModal();
            }
        });
    }

    // Category tabs in modal
    document.querySelectorAll('.category-tab-modal').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            selectModalCategory(category);
        });
    });

    // Style dropdown
    const styleSelect = document.getElementById('style-filter-select');
    if (styleSelect) {
        styleSelect.addEventListener('change', function() {
            modalActiveStyle = this.value;
            filterModalProducts();
        });
    }

    // Manufacturer dropdown
    const manufacturerSelect = document.getElementById('manufacturer-filter-select');
    if (manufacturerSelect) {
        manufacturerSelect.addEventListener('change', function() {
            modalActiveManufacturer = this.value;
            filterModalProducts();
        });
    }

    // Color dropdown
    const colorSelect = document.getElementById('color-filter-select');
    if (colorSelect) {
        colorSelect.addEventListener('change', function() {
            modalActiveColor = this.value;
            filterModalProducts();
        });
    }

    // Search input in modal
    const searchInput = document.getElementById('modal-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            modalSearchTerm = this.value.toLowerCase();
            filterModalProducts();
        });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearModalFilters);
    }

    // Availability radio filter
    document.querySelectorAll('input[name="availability-modal"]').forEach(radio => {
        radio.addEventListener('change', function() {
            modalActiveAvailability = this.value;
            filterModalProducts();
        });
    });

    // Apply button
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applySelectedMaterial);
    }
}

// ============= MODAL FUNCTIONS =============
function openMaterialModal() {
    const modal = document.getElementById('material-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        // Reset modal state
        modalSelectedMaterials = [];
        updateModalSelectedStrip();
        // Populate products for current category
        filterModalProducts();
    }
    console.log('Modal opened');
}

function closeMaterialModal() {
    const modal = document.getElementById('material-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }

    // Reset modal title
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Browse Materials';
    }

    // Clear the compare selection flag if user closed without selecting
    if (window._selectingForCompare) {
        window._selectingForCompare = false;
        selectingMaterialSlot = null;
    }

    console.log('Modal closed');
}

function selectModalCategory(category) {
    modalActiveCategory = category;
    modalActiveStyle = 'all'; // Reset style when changing category
    modalActiveManufacturer = 'all'; // Reset manufacturer when changing category

    // Update tab UI
    document.querySelectorAll('.category-tab-modal').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Update style dropdown options based on category
    updateStyleOptionsForCategory(category);

    // Update manufacturer dropdown options based on category
    updateManufacturerOptionsForCategory(category);

    // Re-filter products
    filterModalProducts();
}

function updateStyleOptionsForCategory(category) {
    const styleSelect = document.getElementById('style-filter-select');
    if (!styleSelect) return;

    let styles = [];
    if (category === 'all') {
        // Combined styles from all categories
        styles = [
            { id: 'all', label: 'All Styles' },
            // Stone styles
            { id: 'bluffstone', label: 'Bluffstone' },
            { id: 'cliffstone', label: 'Cliffstone' },
            { id: 'european-ledge', label: 'European Ledge' },
            { id: 'stacked-stone', label: 'Stacked Stone' },
            { id: 'limestone', label: 'Limestone' },
            { id: 'mountain-ledge', label: 'Mountain Ledge' },
            { id: 'ledgestone', label: 'Ledgestone' },
            { id: 'ez-ledge', label: 'EZ Ledge' },
            { id: 'dry-stack', label: 'Dry Stack' },
            // Brick styles
            { id: 'heritage', label: 'Heritage' },
            { id: 'smooth', label: 'Smooth' },
            { id: 'glazed', label: 'Glazed' },
            { id: 'klaycoat', label: 'Klaycoat' },
            { id: 'standard', label: 'Standard' },
            { id: 'handmold', label: 'Handmold' },
            { id: 'contemporary', label: 'Contemporary' },
            { id: 'legacy', label: 'Legacy' },
            { id: 'wirecut', label: 'Wirecut' }
        ];
    } else if (category === 'stone') {
        styles = [
            { id: 'all', label: 'All Styles' },
            { id: 'bluffstone', label: 'Bluffstone' },
            { id: 'cliffstone', label: 'Cliffstone' },
            { id: 'european-ledge', label: 'European Ledge' },
            { id: 'stacked-stone', label: 'Stacked Stone' },
            { id: 'limestone', label: 'Limestone' },
            { id: 'mountain-ledge', label: 'Mountain Ledge' },
            { id: 'ledgestone', label: 'Ledgestone' },
            { id: 'ez-ledge', label: 'EZ Ledge' },
            { id: 'dry-stack', label: 'Dry Stack' }
        ];
    } else if (category === 'thin-brick') {
        styles = [
            { id: 'all', label: 'All Styles' },
            { id: 'heritage', label: 'Heritage' },
            { id: 'smooth', label: 'Smooth' },
            { id: 'glazed', label: 'Glazed' },
            { id: 'klaycoat', label: 'Klaycoat' },
            { id: 'standard', label: 'Standard' },
            { id: 'handmold', label: 'Handmold' }
        ];
    } else if (category === 'full-brick') {
        styles = [
            { id: 'all', label: 'All Styles' },
            { id: 'standard', label: 'Standard' },
            { id: 'glazed', label: 'Glazed' },
            { id: 'klaycoat', label: 'Klaycoat' },
            { id: 'contemporary', label: 'Contemporary' },
            { id: 'legacy', label: 'Legacy' },
            { id: 'wirecut', label: 'Wirecut' }
        ];
    }

    // Populate the select dropdown
    styleSelect.innerHTML = styles.map(s =>
        `<option value="${s.id}"${s.id === modalActiveStyle ? ' selected' : ''}>${s.label}</option>`
    ).join('');
}

function updateManufacturerOptionsForCategory(category) {
    const manufacturerSelect = document.getElementById('manufacturer-filter-select');
    if (!manufacturerSelect) return;

    let manufacturers = [];
    if (category === 'all') {
        // Combined manufacturers from all categories
        manufacturers = [
            { id: 'all', label: 'All Brands' },
            // Stone manufacturers
            { id: 'eldorado-stone', label: 'Eldorado Stone' },
            { id: 'casa-di-sassi', label: 'Casa Di Sassi' },
            { id: 'dutch-quality', label: 'Dutch Quality' },
            // Brick manufacturers
            { id: 'endicott', label: 'Endicott' },
            { id: 'glen-gery', label: 'Glen-Gery' },
            { id: 'hebron-brick', label: 'Hebron Brick' },
            { id: 'interstate-brick', label: 'Interstate Brick' },
            { id: 'king-klinker', label: 'King Klinker' },
            { id: 'hc-muddox', label: 'H.C. Muddox' },
            { id: 'brampton-brick', label: 'Brampton Brick' },
            { id: 'palmetto-brick', label: 'Palmetto Brick' }
        ];
    } else if (category === 'stone') {
        manufacturers = [
            { id: 'all', label: 'All Brands' },
            { id: 'eldorado-stone', label: 'Eldorado Stone' },
            { id: 'casa-di-sassi', label: 'Casa Di Sassi' },
            { id: 'dutch-quality', label: 'Dutch Quality' }
        ];
    } else if (category === 'thin-brick') {
        manufacturers = [
            { id: 'all', label: 'All Brands' },
            { id: 'endicott', label: 'Endicott' },
            { id: 'glen-gery', label: 'Glen-Gery' },
            { id: 'hebron-brick', label: 'Hebron Brick' },
            { id: 'interstate-brick', label: 'Interstate Brick' },
            { id: 'king-klinker', label: 'King Klinker' },
            { id: 'hc-muddox', label: 'H.C. Muddox' }
        ];
    } else if (category === 'full-brick') {
        manufacturers = [
            { id: 'all', label: 'All Brands' },
            { id: 'hebron-brick', label: 'Hebron Brick' },
            { id: 'interstate-brick', label: 'Interstate Brick' },
            { id: 'glen-gery', label: 'Glen-Gery' },
            { id: 'hc-muddox', label: 'H.C. Muddox' },
            { id: 'brampton-brick', label: 'Brampton Brick' },
            { id: 'palmetto-brick', label: 'Palmetto Brick' }
        ];
    }

    // Populate the select dropdown
    manufacturerSelect.innerHTML = manufacturers.map(m =>
        `<option value="${m.id}"${m.id === modalActiveManufacturer ? ' selected' : ''}>${m.label}</option>`
    ).join('');
}

function clearModalFilters() {
    modalActiveStyle = 'all';
    modalActiveManufacturer = 'all';
    modalActiveColor = 'all';
    modalActiveAvailability = 'all';
    modalSearchTerm = '';

    // Reset dropdowns
    const styleSelect = document.getElementById('style-filter-select');
    const manufacturerSelect = document.getElementById('manufacturer-filter-select');
    const colorSelect = document.getElementById('color-filter-select');
    const searchInput = document.getElementById('modal-search-input');

    if (styleSelect) styleSelect.value = 'all';
    if (manufacturerSelect) manufacturerSelect.value = 'all';
    if (colorSelect) colorSelect.value = 'all';
    if (searchInput) searchInput.value = '';

    // Reset availability radio to 'all'
    const allRadio = document.querySelector('input[name="availability-modal"][value="all"]');
    if (allRadio) allRadio.checked = true;

    // Re-filter products
    filterModalProducts();
}

function getMaterialsForCategory(category) {
    if (category === 'all') {
        // Return all materials EXCEPT accents - user must click Accents category to see them
        return [...STONE_MATERIALS, ...THIN_BRICK_MATERIALS, ...FULL_BRICK_MATERIALS];
    }
    if (category === 'stone') return STONE_MATERIALS;
    if (category === 'thin-brick') return THIN_BRICK_MATERIALS;
    if (category === 'full-brick') return FULL_BRICK_MATERIALS;
    if (category === 'accents') return ACCENT_MATERIALS;
    return [];
}

function matchesColorFilter(material, colorFilter) {
    if (colorFilter === 'all') return true;

    // Use the actual color property on the material (primary check)
    if (material.color === colorFilter) return true;

    return false;
}

// Match profile to accessory type
function matchesAccessoryType(profile, accessoryType) {
    if (!profile) return false;
    if (accessoryType === 'all') return true;
    const p = profile.toLowerCase();

    switch (accessoryType) {
        case 'wall-cap':
            return p.includes('wall-cap') || p.includes('flat-wall-cap');
        case 'sill':
            return p.includes('sill') || p.includes('watertable');
        case 'hearthstone':
            return p.includes('hearthstone');
        case 'column-cap':
            return p.includes('column-cap') || p.includes('natural-cap') || p.includes('chiseled-cap');
        case 'light-box':
            return p.includes('light-box') || p.includes('lightbox');
        case 'keystone':
            return p.includes('keystone') || p.includes('archstone');
        case 'electrical-box':
            return p.includes('electrical');
        case 'trimstone':
            return p.includes('trimstone') || p.includes('trim');
        case 'headstone':
            return p.includes('headstone') || p.includes('head-');
        default:
            return false;
    }
}

// Format accessory type for display
function formatAccessoryType(type) {
    const names = {
        'wall-cap': 'Wall Caps',
        'sill': 'Watertable / Sills',
        'hearthstone': 'Hearthstones',
        'column-cap': 'Column Caps',
        'light-box': 'Lightboxes',
        'keystone': 'Keystones & Archstones',
        'electrical-box': 'Electrical Boxes',
        'trimstone': 'Trim Stones',
        'headstone': 'Cut Heads'
    };
    return names[type] || type;
}

function filterModalProducts() {
    const materials = getMaterialsForCategory(modalActiveCategory);
    const grid = document.getElementById('modal-results-grid');
    const countEl = document.getElementById('results-count');

    if (!grid) return;

    // Filter materials
    const filtered = materials.filter(material => {
        // Style filter
        if (modalActiveStyle !== 'all') {
            if (material.profile !== modalActiveStyle) return false;
        }

        // Manufacturer filter
        if (modalActiveManufacturer !== 'all') {
            if (material.manufacturer !== modalActiveManufacturer) return false;
        }

        // Color filter
        if (!matchesColorFilter(material, modalActiveColor)) return false;

        // Availability filter
        if (modalActiveAvailability === 'in-stock' && !material.stocked) {
            return false;
        }
        if (modalActiveAvailability === 'special-order' && material.stocked) {
            return false;
        }

        // Search filter
        if (modalSearchTerm) {
            const searchFields = [
                material.name.toLowerCase(),
                (material.manufacturer || '').toLowerCase().replace(/-/g, ' '),
                (material.profile || '').toLowerCase().replace(/-/g, ' ')
            ].join(' ');
            if (!searchFields.includes(modalSearchTerm)) return false;
        }

        return true;
    });

    // Group filtered materials by profile and manufacturer for color variant display
    const grouped = groupByProfileAndManufacturer(filtered);

    // Update count (show total individual products, not groups)
    if (countEl) {
        countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    }

    // Clear grid
    grid.innerHTML = '';

    // Render grouped products with color variants
    grouped.forEach(group => {
        const card = createModalProductCard(group);
        grid.appendChild(card);
    });
}

function groupByProfileAndManufacturer(materials) {
    const groups = {};

    materials.forEach(material => {
        // Include category in the key to separate stone from brick products
        const key = `${material.category || 'unknown'}-${material.manufacturer}-${material.profile}`;
        if (!groups[key]) {
            groups[key] = {
                profile: material.profile,
                manufacturer: material.manufacturer,
                category: material.category,
                variants: []
            };
        }
        groups[key].variants.push(material);
    });

    return Object.values(groups);
}

function createModalProductCard(group) {
    const card = document.createElement('div');
    const mainVariant = group.variants[0];
    const isSelected = modalSelectedMaterials.some(m => m.url === mainVariant.url);

    card.className = `product-card-modal${isSelected ? ' selected' : ''}`;
    card.dataset.url = mainVariant.url;
    card.dataset.name = mainVariant.name;
    card.dataset.manufacturer = mainVariant.manufacturer;
    card.dataset.profile = mainVariant.profile || '';
    card.dataset.variantIndex = '0';

    const manufacturerDisplay = formatManufacturer(mainVariant.manufacturer);
    const profileDisplay = formatProfile(mainVariant.profile);
    const categoryDisplay = formatCategory(mainVariant.category);

    // Show category badge when viewing "all" categories
    const showCategoryBadge = modalActiveCategory === 'all';

    // Check if any variant is stocked
    const hasStockedVariant = group.variants.some(v => v.stocked);

    card.innerHTML = `
        <div class="product-image-container-modal">
            <img src="${mainVariant.url}" alt="${mainVariant.name}" loading="lazy" class="product-image-modal">
            ${showCategoryBadge ? `<span class="category-badge-modal">${categoryDisplay}</span>` : ''}
            ${hasStockedVariant ? `<span class="collection-card-badge in-stock">In Stock</span>` : ''}
        </div>
        <div class="product-info">
            <div class="product-profile-modal">${profileDisplay}</div>
            <div class="product-name">${mainVariant.name}</div>
            <div class="product-manufacturer">${manufacturerDisplay}</div>
            ${group.variants.length > 1 ? createColorVariantsHTML(group.variants) : ''}
        </div>
    `;

    // Add click handlers for color variants
    if (group.variants.length > 1) {
        const variants = card.querySelectorAll('.color-variant-modal');
        variants.forEach((variant, index) => {
            variant.addEventListener('click', (e) => {
                e.stopPropagation();
                switchModalVariant(card, group.variants, index);
            });
        });

        // Add click handler for +N button to show all variants
        const moreBtn = card.querySelector('.more-variants-btn');
        if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showAllVariantsPopup(card, group.variants);
            });
        }
    }

    // Main card click selects the product
    card.addEventListener('click', () => {
        selectModalProduct(card);
    });

    return card;
}

function createColorVariantsHTML(variants) {
    const maxVisible = 4;

    let html = '<div class="color-variants-container-modal">';
    html += '<div class="color-variants-modal">';

    variants.forEach((variant, index) => {
        const isHidden = index >= maxVisible;
        html += `
            <div class="color-variant-modal ${index === 0 ? 'active' : ''} ${isHidden ? 'hidden' : ''}"
                 data-index="${index}"
                 data-url="${variant.url}"
                 data-name="${variant.name}"
                 title="${variant.name}">
                <img src="${variant.url}" alt="${variant.name}">
            </div>
        `;
    });

    html += '</div>';

    // Show +N indicator if more variants exist - make it clickable
    if (variants.length > maxVisible) {
        html += `<button class="more-variants-modal more-variants-btn" data-total="${variants.length}" title="Show all ${variants.length} colors">+${variants.length - maxVisible}</button>`;
    }

    html += '</div>';
    return html;
}

function switchModalVariant(card, variants, index) {
    const variant = variants[index];

    // Update main image
    const mainImage = card.querySelector('.product-image-modal');
    if (mainImage) {
        mainImage.src = variant.url;
        mainImage.alt = variant.name;
    }

    // Update card data attributes
    card.dataset.url = variant.url;
    card.dataset.name = variant.name;
    card.dataset.variantIndex = index;

    // Update product name
    const nameEl = card.querySelector('.product-name');
    if (nameEl) {
        nameEl.textContent = variant.name;
    }

    // Update active state on color variants
    card.querySelectorAll('.color-variant-modal').forEach((v, i) => {
        v.classList.toggle('active', i === index);
    });

    // If this card was selected, update the selected material in the array
    if (card.classList.contains('selected')) {
        const oldUrl = card.dataset.url; // The URL before switch - wait, this was already updated
        // Find by old variant and update
        const existingIndex = modalSelectedMaterials.findIndex(m =>
            m.manufacturer === (variant.manufacturer || card.dataset.manufacturer) &&
            m.profile === (variant.profile || card.dataset.profile)
        );
        if (existingIndex >= 0) {
            modalSelectedMaterials[existingIndex] = {
                url: variant.url,
                name: variant.name,
                manufacturer: variant.manufacturer || card.dataset.manufacturer,
                profile: variant.profile || card.dataset.profile,
                category: card.dataset.category || 'stone',
                color: variant.color || card.dataset.color
            };
            updateModalSelectedStrip();
        }
    }
}

function showAllVariantsPopup(card, variants) {
    // Remove any existing popup
    closeVariantsPopup();

    const currentIndex = parseInt(card.dataset.variantIndex) || 0;

    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'variants-popup';
    popup.className = 'variants-popup';

    // Get profile name for the title
    const profileName = formatProfile(card.dataset.profile);

    popup.innerHTML = `
        <div class="variants-popup-header">
            <span class="variants-popup-title">${profileName} - All Colors</span>
            <button class="variants-popup-close">&times;</button>
        </div>
        <div class="variants-popup-grid">
            ${variants.map((v, i) => `
                <div class="variant-popup-item ${i === currentIndex ? 'active' : ''}"
                     data-index="${i}"
                     data-url="${v.url}"
                     data-name="${v.name}">
                    <img src="${v.url}" alt="${v.name}">
                    <span class="variant-popup-name">${v.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Add to document
    document.body.appendChild(popup);

    // Position near the card
    const cardRect = card.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    // Position below the card, centered
    let left = cardRect.left + (cardRect.width / 2) - (popupRect.width / 2);
    let top = cardRect.bottom + 10;

    // Keep within viewport
    if (left < 10) left = 10;
    if (left + popupRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popupRect.width - 10;
    }
    if (top + popupRect.height > window.innerHeight - 10) {
        top = cardRect.top - popupRect.height - 10;
    }

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';

    // Add click handlers
    popup.querySelector('.variants-popup-close').addEventListener('click', closeVariantsPopup);

    popup.querySelectorAll('.variant-popup-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            switchModalVariant(card, variants, index);
            closeVariantsPopup();
        });
    });

    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', handlePopupOutsideClick);
    }, 100);
}

function closeVariantsPopup() {
    const popup = document.getElementById('variants-popup');
    if (popup) {
        popup.remove();
    }
    document.removeEventListener('click', handlePopupOutsideClick);
}

function handlePopupOutsideClick(e) {
    const popup = document.getElementById('variants-popup');
    if (popup && !popup.contains(e.target) && !e.target.classList.contains('more-variants-btn')) {
        closeVariantsPopup();
    }
}

function formatProfile(profile) {
    if (!profile) return '';
    return profile
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

function formatManufacturer(manufacturer) {
    if (!manufacturer) return '';
    return manufacturer
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

function formatCategory(category) {
    if (!category) return '';
    if (category === 'stone') return 'Stone';
    if (category === 'thin-brick') return 'Thin Brick';
    if (category === 'full-brick') return 'Full Brick';
    return category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function selectModalProduct(card) {
    const material = {
        url: card.dataset.url,
        name: card.dataset.name,
        manufacturer: card.dataset.manufacturer,
        profile: card.dataset.profile,
        category: card.dataset.category || 'stone',
        color: card.dataset.color
    };

    // Check if already selected
    const existingIndex = modalSelectedMaterials.findIndex(m => m.url === material.url);

    if (existingIndex >= 0) {
        // Already selected - remove it
        modalSelectedMaterials.splice(existingIndex, 1);
        card.classList.remove('selected');
    } else {
        // Not selected - add if under limit
        if (modalSelectedMaterials.length < MAX_SELECTED_MATERIALS) {
            modalSelectedMaterials.push(material);
            card.classList.add('selected');
        } else {
            // At limit - show message
            alert(`You can select up to ${MAX_SELECTED_MATERIALS} materials. Remove one to add another.`);
            return;
        }
    }

    // Update preview strip
    updateModalSelectedStrip();
}

function updateModalSelectedStrip() {
    const listEl = document.getElementById('selected-materials-list');
    const countEl = document.getElementById('selected-count');
    const applyBtn = document.getElementById('apply-btn');

    if (countEl) {
        countEl.textContent = modalSelectedMaterials.length;
    }

    if (listEl) {
        listEl.innerHTML = modalSelectedMaterials.map((material, index) => `
            <div class="selected-material-thumb" data-index="${index}" title="${material.name}">
                <img src="${material.url}" alt="${material.name}">
                <button class="remove-btn" data-index="${index}">&times;</button>
            </div>
        `).join('');

        // Add click handlers for remove buttons
        listEl.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                removeSelectedMaterial(index);
            });
        });
    }

    if (applyBtn) {
        applyBtn.disabled = modalSelectedMaterials.length === 0;
        applyBtn.textContent = modalSelectedMaterials.length > 1
            ? `Apply ${modalSelectedMaterials.length} Materials`
            : 'Apply Material';
    }
}

function removeSelectedMaterial(index) {
    const material = modalSelectedMaterials[index];
    modalSelectedMaterials.splice(index, 1);

    // Update card selection state
    document.querySelectorAll('.product-card-modal').forEach(card => {
        if (card.dataset.url === material.url) {
            card.classList.remove('selected');
        }
    });

    updateModalSelectedStrip();
}

function applySelectedMaterial() {
    if (modalSelectedMaterials.length === 0) return;

    // Restore modal title
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Browse Materials';
    }

    // Check if we're selecting for comparison mode (single select only)
    if (window._selectingForCompare) {
        window._selectingForCompare = false;
        const material = modalSelectedMaterials[0]; // Use first selected
        const slotLower = window._compareSlotLowercase;
        window._compareSlotLowercase = null;

        // Add material to savedMaterials if not there
        let materialIndex = savedMaterials.findIndex(m => m.url === material.url);
        if (materialIndex === -1) {
            if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
                savedMaterials.shift();
            }
            savedMaterials.push(material);
            materialIndex = savedMaterials.length - 1;
        }

        // Update the compare slot in our system
        if (slotLower === 'a') {
            compareIndexA = materialIndex;
            compareMaterialA = material;
        } else if (slotLower === 'b') {
            compareIndexB = materialIndex;
            compareMaterialB = material;
        }

        // Also update for the old comparison system
        if (selectingMaterialSlot === 'A') {
            compareMaterialA = material;
            compareMaterial = material;
            updateCompareMaterialThumb();
        } else if (selectingMaterialSlot === 'B') {
            compareMaterialB = material;
        }

        // Clear selecting state and update UI
        selectingMaterialSlot = null;
        pendingCompareSlot = null;
        document.getElementById('compare-slot-a')?.classList.remove('selecting');
        document.getElementById('compare-slot-b')?.classList.remove('selecting');

        closeMaterialModal();
        updateQuickMaterialsStrip();
        updateCompareSlots();

        modalSelectedMaterials = [];
        return;
    }

    // Normal apply - save to quick access strip and apply first one
    savedMaterials = [...modalSelectedMaterials];
    activeMaterialIndex = 0;

    // Apply the first material
    const firstMaterial = savedMaterials[0];
    applyMaterialToAllAreas(firstMaterial);
    updateActionBarDisplay(firstMaterial);
    selectedMaterial = firstMaterial;

    // Update the quick access strip
    updateQuickMaterialsStrip();

    // Close modal and clear selection
    closeMaterialModal();
    modalSelectedMaterials = [];

    // If material compare mode is active, refresh the comparison
    if (compareMaterialsMode && compareMaterial) {
        compareMaterialA = compareMaterial;
        compareMaterialB = selectedMaterial;
        startMaterialComparison();
    }
}

// ============= UNIFIED MATERIAL PANEL =============
let compareIndexA = null; // Index for comparison material A (left)
let compareIndexB = null; // Index for comparison material B (right)
let pendingCompareSlot = null; // Which slot is waiting for selection ('a' or 'b')
let draggedMaterial = null; // Material being dragged

function updateQuickMaterialsStrip() {
    // Now redirects to unified panel
    updateUnifiedPanel();
}

function updateUnifiedPanel() {
    const panel = document.getElementById('unified-material-panel');
    const browseSection = document.querySelector('.browse-section-inline');
    if (!panel) return;

    // Show panel if we have materials or selections
    const hasContent = savedMaterials.length > 0 || inlineSelectedMaterials.length > 0;

    if (hasContent) {
        panel.classList.add('visible');
        // Add padding to browse section to make room for panel
        browseSection?.classList.add('panel-visible');
    } else {
        panel.classList.remove('visible');
        browseSection?.classList.remove('panel-visible');
        return;
    }

    // Update active material section
    updateActiveMaterialSection();

    // Update compare slots
    updateUnifiedCompareSlots();

    // Update selected materials list
    updateUnifiedSelectedList();

    // Update sticky position for left panel
    updateUnifiedPanelStickyPosition();

    // Update floating done button
    if (typeof window.updateFloatingDoneButton === 'function') {
        window.updateFloatingDoneButton();
    }

    // Update mobile selected strip
    updateMobileSelectedStrip();
}

function updateActiveMaterialSection() {
    const emptyEl = document.getElementById('active-material-empty');
    const contentEl = document.getElementById('active-material-content');

    if (!emptyEl || !contentEl) return;

    const activeMaterial = savedMaterials[activeMaterialIndex];

    if (activeMaterial) {
        emptyEl.style.display = 'none';
        contentEl.classList.remove('hidden');

        document.getElementById('active-material-image').src = activeMaterial.url;
        document.getElementById('active-material-image').dataset.url = activeMaterial.url;
        document.getElementById('active-material-name').textContent = activeMaterial.name;
        document.getElementById('active-material-profile').textContent = formatProfile(activeMaterial.profile);
        document.getElementById('active-material-manufacturer').textContent = formatManufacturer(activeMaterial.manufacturer);

        const stockEl = document.getElementById('active-material-stock');
        if (activeMaterial.stocked) {
            stockEl.textContent = 'In Stock';
            stockEl.className = 'active-material-stock in-stock';
        } else if (activeMaterial.stocked === false) {
            stockEl.textContent = 'Special Order';
            stockEl.className = 'active-material-stock special-order';
        } else {
            stockEl.textContent = '';
        }
    } else {
        emptyEl.style.display = 'block';
        contentEl.classList.add('hidden');
    }
}

function updateUnifiedCompareSlots() {
    const slotA = document.getElementById('compare-slot-a');
    const slotB = document.getElementById('compare-slot-b');
    const compareBtn = document.getElementById('compare-action-btn');

    if (!slotA || !slotB) return;

    // Update slot A
    updateCompareSlotUI(slotA, compareMaterialA, 'a');

    // Update slot B
    updateCompareSlotUI(slotB, compareMaterialB, 'b');

    // Update compare button
    if (compareBtn) {
        compareBtn.disabled = !(compareMaterialA && compareMaterialB);
    }
}

function updateCompareSlotUI(slotEl, material, slotId) {
    const content = slotEl.querySelector('.slot-content');
    const empty = slotEl.querySelector('.slot-empty');
    const image = slotEl.querySelector('.slot-image');
    const removeBtn = slotEl.querySelector('.slot-remove');
    const nameEl = slotEl.querySelector('.slot-name');

    if (material) {
        content.classList.add('filled');
        empty.style.display = 'none';
        image.src = material.url;
        image.dataset.url = material.url;
        image.classList.remove('hidden');
        removeBtn.classList.remove('hidden');
        nameEl.textContent = material.name;
    } else {
        content.classList.remove('filled');
        empty.style.display = 'flex';
        image.classList.add('hidden');
        removeBtn.classList.add('hidden');
        nameEl.textContent = '';
    }
}

function updateUnifiedSelectedList() {
    const list = document.getElementById('unified-selected-list');
    const countEl = document.getElementById('unified-selected-count');

    if (!list) return;

    // Combine saved materials and inline selected materials
    const allSelected = [...new Map([...savedMaterials, ...inlineSelectedMaterials].map(m => [m.url, m])).values()];

    if (countEl) {
        countEl.textContent = `${allSelected.length}/10`;
    }

    // Find active material URL
    const activeMaterial = savedMaterials[activeMaterialIndex];
    const activeUrl = activeMaterial?.url;

    list.innerHTML = allSelected.slice(0, 10).map((material, index) => `
        <div class="selected-material-item" data-url="${material.url}" data-index="${index}" draggable="true">
            <img src="${material.url}" alt="${material.name}" class="selected-material-thumb ${material.url === activeUrl ? 'active' : ''}" title="${material.name}" draggable="true">
            <button class="remove-btn" data-url="${material.url}">&times;</button>
        </div>
    `).join('');

    // Store allSelected for drag reference
    list._allSelected = allSelected;

    // Add click handlers to apply material to canvas
    list.querySelectorAll('.selected-material-item').forEach(item => {
        // Click on item (not remove button) applies to canvas
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            const url = item.dataset.url;
            const material = allSelected.find(m => m.url === url);
            if (material) {
                applyMaterialFromSelection(material);
            }
        });

        // Drag handlers for the item
        item.addEventListener('dragstart', (e) => {
            const url = item.dataset.url;
            const material = allSelected.find(m => m.url === url);
            if (material) {
                draggedMaterial = material;
                e.dataTransfer.setData('text/plain', url);
                e.dataTransfer.effectAllowed = 'copy';
                item.style.opacity = '0.5';
            }
        });
        item.addEventListener('dragend', (e) => {
            item.style.opacity = '1';
            draggedMaterial = null;
            document.querySelectorAll('.slot-content').forEach(slot => {
                slot.classList.remove('drag-over');
            });
        });
    });

    // Add remove handlers
    list.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            removeFromUnifiedSelection(url);
        });
    });
}

function applyMaterialFromSelection(material) {
    if (!material) return;

    // Add to saved materials if not already there
    let index = savedMaterials.findIndex(m => m.url === material.url);
    if (index === -1) {
        if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
            savedMaterials.shift();
        }
        savedMaterials.push(material);
        index = savedMaterials.length - 1;
    }

    // Set as active
    activeMaterialIndex = index;
    selectedMaterial = material;

    // Apply to canvas
    applyMaterialToAllAreas(material);

    // Update all UI
    updateUnifiedPanel();
    updateMaterialInfoPanelDisplay(material);

    // Scroll to canvas
    const canvasSection = document.querySelector('.canvas-section');
    if (canvasSection) {
        canvasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateMaterialInfoPanelDisplay(material) {
    const panel = document.getElementById('material-info-panel');
    if (!panel || !material) return;

    // Update panel content
    const thumb = document.getElementById('material-info-thumb');
    const name = document.getElementById('material-info-name');
    const profile = document.getElementById('material-info-profile');
    const brand = document.getElementById('material-info-brand');
    const category = document.getElementById('material-info-category');
    const color = document.getElementById('material-info-color');
    const stock = document.getElementById('material-info-stock');

    if (thumb) thumb.src = material.url;
    if (name) name.textContent = material.name || '-';
    if (profile) profile.textContent = formatProfile(material.profile) || '-';
    if (brand) brand.textContent = formatManufacturer(material.manufacturer) || '-';
    if (category) category.textContent = formatCategory(material.category) || '-';
    if (color) color.textContent = formatColorFamily(material.color) || '-';
    if (stock) {
        if (material.stocked) {
            stock.textContent = 'In Stock';
            stock.style.color = '#27ae60';
        } else if (material.stocked === false) {
            stock.textContent = 'Special Order';
            stock.style.color = '#888';
        } else {
            stock.textContent = '-';
            stock.style.color = '#333';
        }
    }

    // Check if we need sticky mode before showing (to prevent animation conflict)
    const canvasSection = document.querySelector('.canvas-section');
    if (canvasSection) {
        const canvasRect = canvasSection.getBoundingClientRect();
        const panelHeight = panel.offsetHeight || 300; // estimate if not visible yet
        const windowHeight = window.innerHeight;
        const canvasBottom = canvasRect.bottom;
        const centeredPanelBottom = (windowHeight - panelHeight) / 2 + panelHeight;

        if (canvasBottom < centeredPanelBottom + 20) {
            // We're already scrolled past - add sticky-mode to prevent animation
            panel.classList.add('sticky-mode');
        }
    }

    // Show the panel
    panel.classList.add('visible');

    // Update sticky position
    updateInfoPanelStickyPosition();

    // Update compare button state
    if (typeof updateInfoPanelCompareButton === 'function') {
        updateInfoPanelCompareButton(material);
    }
}

// Hide the right info panel and reset sticky state
function hideInfoPanel() {
    const panel = document.getElementById('material-info-panel');
    if (panel) {
        panel.classList.remove('visible', 'sticky-mode');
        panel.style.top = '';
        panel.style.transform = '';
    }
}

// Handle right info panel sticky behavior at canvas bottom
function updateInfoPanelStickyPosition() {
    const panel = document.getElementById('material-info-panel');
    const canvasContainer = document.getElementById('canvas-container');

    if (!panel || !canvasContainer || !panel.classList.contains('visible')) return;

    const canvasRect = canvasContainer.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const windowHeight = window.innerHeight;
    const margin = 20;

    // Canvas bottom in viewport coordinates
    const canvasBottom = canvasRect.bottom;

    // The maximum top position (panel centered in viewport)
    const maxTop = (windowHeight - panelHeight) / 2;

    // The sticky position (panel bottom at canvas bottom)
    const stickyTop = canvasBottom - panelHeight - margin;

    // If canvas bottom is above where centered panel bottom would be, use sticky position
    // Otherwise use centered position
    let finalTop;
    if (stickyTop < maxTop) {
        // Canvas has scrolled up - stick to canvas bottom
        finalTop = Math.max(80, stickyTop);
    } else {
        // Canvas still visible - stay centered
        finalTop = maxTop;
    }

    // Set position directly
    panel.style.top = finalTop + 'px';
    panel.style.transform = 'none';
}

// Handle left unified panel sticky behavior at canvas bottom
function updateUnifiedPanelStickyPosition() {
    const panel = document.getElementById('unified-material-panel');
    const canvasContainer = document.getElementById('canvas-container');

    if (!panel || !canvasContainer || !panel.classList.contains('visible')) return;

    const canvasRect = canvasContainer.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const windowHeight = window.innerHeight;
    const margin = 20;

    // Canvas bottom in viewport coordinates
    const canvasBottom = canvasRect.bottom;

    // Where panel top would be if centered
    const centeredTop = (windowHeight - panelHeight) / 2;

    // Calculate where panel top should be to align its bottom with canvas bottom
    const stickyTop = canvasBottom - panelHeight - margin;

    // Use the HIGHER of the two positions (smaller top value = higher on screen)
    const targetTop = Math.min(centeredTop, stickyTop);

    // Clamp to not go above header
    const finalTop = Math.max(80, targetTop);

    panel.style.top = finalTop + 'px';
    panel.style.transform = 'none';
}

// Initialize scroll handler for sticky panels (both left and right)
function initInfoPanelStickyHandler() {
    console.log('Initializing sticky panel scroll handler');
    const updateBothPanels = () => {
        updateInfoPanelStickyPosition();
        updateUnifiedPanelStickyPosition();
    };
    // Listen on both window and document for scroll events
    window.addEventListener('scroll', updateBothPanels, { passive: true });
    document.addEventListener('scroll', updateBothPanels, { passive: true });
    window.addEventListener('resize', updateBothPanels, { passive: true });
}

// ============= FLOATING DONE BUTTON =============
function initFloatingDoneButton() {
    const floatingBtn = document.getElementById('floating-done-btn');
    const canvasContainer = document.getElementById('canvas-container');

    if (!floatingBtn || !canvasContainer) return;

    // Click handler - apply selected materials and scroll to canvas
    floatingBtn.addEventListener('click', () => {
        // Apply selected materials to the canvas
        if (inlineSelectedMaterials && inlineSelectedMaterials.length > 0) {
            // Apply the first selected material
            const firstMaterial = inlineSelectedMaterials[0];
            applyInlineMaterial(firstMaterial, null);

            // Copy all to saved materials
            inlineSelectedMaterials.forEach(material => {
                const existingIndex = savedMaterials.findIndex(m => m.url === material.url);
                if (existingIndex === -1) {
                    if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
                        savedMaterials.shift();
                    }
                    savedMaterials.push(material);
                }
            });

            updateQuickMaterialsStrip();
        } else if (savedMaterials && savedMaterials.length > 0) {
            // If no inline selections but have saved materials, apply the active one
            const activeMaterial = savedMaterials[activeMaterialIndex] || savedMaterials[0];
            applyMaterialToAllAreas(activeMaterial);
        }

        // Scroll to canvas
        canvasContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Update visibility on scroll
    const updateFloatingButton = () => {
        const canvasRect = canvasContainer.getBoundingClientRect();
        const isScrolledPastCanvas = canvasRect.bottom < 100; // Canvas is mostly above viewport

        // Count selections (unified selection list + compare slots)
        const selectionCount = getFloatingButtonCount();

        // Show button if scrolled past canvas AND has selections
        if (isScrolledPastCanvas && selectionCount > 0) {
            floatingBtn.classList.remove('hidden');
            document.getElementById('done-btn-count').textContent = selectionCount;
        } else {
            floatingBtn.classList.add('hidden');
        }
    };

    // Listen for scroll events
    window.addEventListener('scroll', updateFloatingButton, { passive: true });
    document.addEventListener('scroll', updateFloatingButton, { passive: true });

    // Also update when selections change
    window.updateFloatingDoneButton = updateFloatingButton;
}

function getFloatingButtonCount() {
    // Count materials in unified selection
    let count = 0;

    // Count from savedMaterials (quick material list)
    if (typeof savedMaterials !== 'undefined' && savedMaterials) {
        count += savedMaterials.length;
    }

    // Count from inlineSelectedMaterials if not already in savedMaterials
    if (typeof inlineSelectedMaterials !== 'undefined' && inlineSelectedMaterials) {
        inlineSelectedMaterials.forEach(m => {
            const alreadyCounted = savedMaterials && savedMaterials.some(s => s.url === m.url);
            if (!alreadyCounted) count++;
        });
    }

    // Count compare materials if filled
    if (typeof compareMaterialA !== 'undefined' && compareMaterialA) count++;
    if (typeof compareMaterialB !== 'undefined' && compareMaterialB) count++;

    return count;
}

function removeFromUnifiedSelection(url) {
    // Remove from savedMaterials
    const savedIndex = savedMaterials.findIndex(m => m.url === url);
    if (savedIndex >= 0) {
        removeQuickMaterial(savedIndex);
    }

    // Remove from inlineSelectedMaterials
    const inlineIndex = inlineSelectedMaterials.findIndex(m => m.url === url);
    if (inlineIndex >= 0) {
        inlineSelectedMaterials.splice(inlineIndex, 1);

        // Update card selection state
        document.querySelectorAll(`.browse-section-inline .product-card[data-url="${url}"]`).forEach(card => {
            card.classList.remove('selected');
        });
    }

    updateUnifiedPanel();
    updateInlineSelectedPanel();
    updateViewSelectedButton();
}

function initUnifiedPanelDragDrop() {
    const panel = document.getElementById('unified-material-panel');
    if (!panel) return;

    // Make active material draggable
    const activeImage = document.getElementById('active-material-image');
    if (activeImage) {
        activeImage.addEventListener('dragstart', (e) => {
            const url = activeImage.dataset.url || activeImage.src;
            const material = findMaterialByUrl(url);
            if (material) {
                draggedMaterial = material;
                e.dataTransfer.setData('text/plain', url);
                e.dataTransfer.effectAllowed = 'copy';
                activeImage.style.opacity = '0.5';
            }
        });
        activeImage.addEventListener('dragend', () => {
            activeImage.style.opacity = '1';
            draggedMaterial = null;
            document.querySelectorAll('.slot-content').forEach(slot => {
                slot.classList.remove('drag-over');
            });
        });
    }

    // Setup compare slot drop zones and click handlers
    setupCompareSlotListeners();

    // Compare button - toggles compare mode on/off
    const compareBtn = document.getElementById('compare-action-btn');
    compareBtn?.addEventListener('click', () => {
        if (compareMaterialsMode) {
            // Already comparing - exit compare mode
            exitCompareMaterialsMode();
        } else if (compareMaterialA && compareMaterialB) {
            // Start comparison
            compareMaterialsMode = true;
            startMaterialComparison();
        }
        updateCompareSlots();
    });

    // Clear all button
    const clearBtn = document.getElementById('unified-clear-btn');
    clearBtn?.addEventListener('click', clearAllUnifiedSelection);

    // Material info panel close button
    const infoCloseBtn = document.getElementById('material-info-close');
    infoCloseBtn?.addEventListener('click', () => {
        hideInfoPanel();
    });

    // Active Material Info button - opens detailed popup
    const activeInfoBtn = document.getElementById('active-material-info-btn');
    activeInfoBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeMaterial = savedMaterials[activeMaterialIndex];
        if (activeMaterial) {
            // Find all variants for this profile/manufacturer
            const variants = findVariantsForMaterial(activeMaterial);
            showProductDetailPopup(activeMaterial, variants);
        }
    });
}

// Find all color variants for a material (same profile and manufacturer)
function findVariantsForMaterial(material) {
    if (!material) return [material];

    const allMaterials = [
        ...(window.STONE_MATERIALS || []),
        ...(window.THIN_BRICK_MATERIALS || []),
        ...(window.FULL_BRICK_MATERIALS || [])
    ];

    const variants = allMaterials.filter(m =>
        m.profile === material.profile &&
        m.manufacturer === material.manufacturer
    );

    return variants.length > 0 ? variants : [material];
}

function setupCompareSlotListeners() {
    const slotA = document.getElementById('compare-slot-a');
    const slotB = document.getElementById('compare-slot-b');

    [slotA, slotB].forEach(slotEl => {
        if (!slotEl) return;
        const slotId = slotEl.dataset.slot;
        const content = slotEl.querySelector('.slot-content');

        if (content) {
            // Drop zone handlers
            content.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                content.classList.add('drag-over');
            });

            content.addEventListener('dragleave', () => {
                content.classList.remove('drag-over');
            });

            content.addEventListener('drop', (e) => {
                e.preventDefault();
                content.classList.remove('drag-over');

                if (!draggedMaterial) return;

                if (slotId === 'a') {
                    compareMaterialA = draggedMaterial;
                    compareIndexA = savedMaterials.findIndex(m => m.url === draggedMaterial.url);
                } else {
                    compareMaterialB = draggedMaterial;
                    compareIndexB = savedMaterials.findIndex(m => m.url === draggedMaterial.url);
                }

                updateUnifiedCompareSlots();
                draggedMaterial = null;
            });

            // Click to add active material to slot
            content.addEventListener('click', (e) => {
                if (e.target.classList.contains('slot-remove')) return;

                const activeMaterial = savedMaterials[activeMaterialIndex];
                if (!activeMaterial) return;

                if (slotId === 'a') {
                    compareMaterialA = activeMaterial;
                    compareIndexA = activeMaterialIndex;
                } else {
                    compareMaterialB = activeMaterial;
                    compareIndexB = activeMaterialIndex;
                }

                updateUnifiedCompareSlots();
            });
        }

        // Remove button handler (use event delegation since button may be recreated)
        slotEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('slot-remove')) {
                e.stopPropagation();
                clearCompareSlot(slotId);
            }
        });
    });
}

function handleDragStart(e) {
    const url = e.target.dataset.url || e.target.src;
    const material = findMaterialByUrl(url);

    if (material) {
        draggedMaterial = material;
        e.dataTransfer.setData('text/plain', url);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
    }
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    draggedMaterial = null;

    // Remove drag-over class from all slots
    document.querySelectorAll('.slot-content').forEach(slot => {
        slot.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const slotEl = e.currentTarget.closest('.compare-slot-unified');
    const slotId = slotEl?.dataset.slot;

    if (!slotId || !draggedMaterial) return;

    if (slotId === 'a') {
        compareMaterialA = draggedMaterial;
        compareIndexA = savedMaterials.findIndex(m => m.url === draggedMaterial.url);
    } else {
        compareMaterialB = draggedMaterial;
        compareIndexB = savedMaterials.findIndex(m => m.url === draggedMaterial.url);
    }

    updateUnifiedCompareSlots();
    draggedMaterial = null;
}

function findMaterialByUrl(url) {
    // Search in all material arrays
    const allMaterials = [...STONE_MATERIALS, ...THIN_BRICK_MATERIALS, ...FULL_BRICK_MATERIALS];
    return allMaterials.find(m => m.url === url) ||
           savedMaterials.find(m => m.url === url) ||
           inlineSelectedMaterials.find(m => m.url === url);
}

function clearAllUnifiedSelection() {
    // Clear saved materials
    savedMaterials = [];
    activeMaterialIndex = 0;
    selectedMaterial = null;

    // Clear inline selected
    clearInlineSelection();

    // Exit compare mode completely (hide slider, labels, etc.)
    if (compareMaterialsMode) {
        exitCompareMaterialsMode();
    }

    // Also exit before/after compare mode if active
    if (compareMode) {
        compareMode = false;
        const compareToggleBtn = document.getElementById('compare-toggle');
        const slider = document.getElementById('compare-slider');
        const beforeCanvas = document.getElementById('before-canvas');
        const hotspotsContainer = document.getElementById('hotspots-container');

        if (compareToggleBtn) compareToggleBtn.classList.remove('active');
        if (slider) slider.style.display = 'none';
        if (beforeCanvas) beforeCanvas.style.display = 'none';
        if (hotspotsContainer) hotspotsContainer.style.display = 'block';
    }

    // Clear compare slots (indices already cleared by exitCompareMaterialsMode)
    compareIndexA = null;
    compareIndexB = null;
    compareMaterialA = null;
    compareMaterialB = null;

    // Clear all materials from the canvas
    if (customerAreas && customerAreas.length > 0) {
        customerAreas.forEach(area => {
            if (!area.isCutout && area.textureMode !== 'color_fill') {
                area.stone = null;
            }
        });
        drawCanvas();
    }

    // Hide the right info panel
    hideInfoPanel();

    updateUnifiedPanel();
    updateCompareSlots();
}

function initCompareSlots() {
    // Now uses unified panel - initialize drag/drop
    initUnifiedPanelDragDrop();

    // Initialize curated collections below canvas
    initCuratedCollections();
}

// Calgary's Top Sellers - Top 20 Hottest products (ranked 1-20)
const TOP_SELLERS = [
    // #1 - Kwik Stack Matera
    { name: 'Matera Kwik Stack', url: './Images/Casa Di Sassi/Kwik Stack/casa-profile-kwikStack-matera.jpg', manufacturer: 'casa-di-sassi', profile: 'kwik-stack', color: 'gray', category: 'stone', stocked: true },
    // #2 - Cliffstone Banff Springs
    { name: 'Banff Springs', url: './Images/Eldorado Stone/Cliffstone/Profile-Cliffstone-Banff_Springs.jpg', manufacturer: 'eldorado-stone', profile: 'cliffstone', color: 'gray', category: 'stone', stocked: true },
    // #3 - Volterra Niveo
    { name: 'Niveo Volterra', url: './Images/Casa Di Sassi/Volterra/casa-profile-volterra-niveo.jpg', manufacturer: 'casa-di-sassi', profile: 'volterra', color: 'white-cream', category: 'stone', stocked: true },
    // #4 - Dry Stack Coal Crest
    { name: 'Coal Crest Dry Stack', url: './Images/Dutch Quality/Dry Stack/DQ_Profile_Coal-Crest_Drystack.jpg', manufacturer: 'dutch-quality', profile: 'dry-stack', color: 'charcoal', category: 'stone', stocked: true },
    // #5 - TundraBrick Chalk Dust
    { name: 'Chalk Dust', url: './Images/Eldorado Stone/Tundrabrick/Tundrabrick-Chalk-Dust.jpg', manufacturer: 'eldorado-stone', profile: 'tundrabrick', color: 'white-cream', category: 'stone', stocked: true },
    // #6 - TundraBrick Hartford
    { name: 'Hartford', url: './Images/Eldorado Stone/Tundrabrick/TundraBrick-Hartford.jpg', manufacturer: 'eldorado-stone', profile: 'tundrabrick', color: 'gray', category: 'stone', stocked: false },
    // #7 - Cliffstone Whitebark
    { name: 'Whitebark', url: './Images/Eldorado Stone/Cliffstone/Profile-Cliffstone-Whitebark.jpg', manufacturer: 'eldorado-stone', profile: 'cliffstone', color: 'white-cream', category: 'stone', stocked: true },
    // #8 - Limestone Grand Banks
    { name: 'Grand Banks', url: './Images/Eldorado Stone/Limestone/Profile-Limestone-Grand_Banks.jpg', manufacturer: 'eldorado-stone', profile: 'limestone', color: 'tan', category: 'stone', stocked: true },
    // #9 - Roughcut Loire Valley
    { name: 'Loire Valley', url: './Images/Eldorado Stone/Roughcut/Profile-RoughCut-Loire_Valley.jpg', manufacturer: 'eldorado-stone', profile: 'roughcut', color: 'tan', category: 'stone', stocked: true },
    // #10 - Roughcut Casa Blanca
    { name: 'Casa Blanca', url: './Images/Eldorado Stone/Roughcut/Profile-RoughCut-Casa_Blanca.jpg', manufacturer: 'eldorado-stone', profile: 'roughcut', color: 'white-cream', category: 'stone', stocked: true },
    // #11 - Stacked Stone Black River
    { name: 'Black River', url: './Images/Eldorado Stone/Stacked Stone/Profile-Stacked_Stone-Black_River.jpg', manufacturer: 'eldorado-stone', profile: 'stacked-stone', color: 'charcoal', category: 'stone', stocked: true },
    // #12 - Dry Stack Winter Point
    { name: 'Winter Point Dry Stack', url: './Images/Dutch Quality/Dry Stack/DQ-Profile-Weather-Ledge-Winter-Point.jpg', manufacturer: 'dutch-quality', profile: 'dry-stack', color: 'white-cream', category: 'stone', stocked: true },
    // #13 - Stacked Stone Dark Rundle
    { name: 'Dark Rundle', url: './Images/Eldorado Stone/Stacked Stone/Profile-Stacked_Stone-Dark_Rundle.jpg', manufacturer: 'eldorado-stone', profile: 'stacked-stone', color: 'charcoal', category: 'stone', stocked: true },
    // #14 - Dry Stack Arizona
    { name: 'Arizona Dry Stack', url: './Images/Dutch Quality/Dry Stack/DQ_Profile_Dry-Stack_Arizona.jpg', manufacturer: 'dutch-quality', profile: 'dry-stack', color: 'tan', category: 'stone', stocked: true },
    // #15 - Weather Ledge Elkwood
    { name: 'Elkwood Weather Ledge', url: './Images/Dutch Quality/Weather Ledge/Elkwood-Weather-Ledge.jpg', manufacturer: 'dutch-quality', profile: 'weather-ledge', color: 'tan', category: 'stone', stocked: true },
    // #16 - Kwik Stack Carbone
    { name: 'Carbone Kwik Stack', url: './Images/Casa Di Sassi/Kwik Stack/casa-profile-kwikStack-carbone.jpg', manufacturer: 'casa-di-sassi', profile: 'kwik-stack', color: 'charcoal', category: 'stone', stocked: true },
    // #17 - Ledgestone Turin
    { name: 'Turin Ledgestone', url: './Images/Casa Di Sassi/Ledgestone/casa-profile-ledgestone-turin.jpg', manufacturer: 'casa-di-sassi', profile: 'ledgestone', color: 'charcoal', category: 'stone', stocked: true },
    // #18 - Weather Ledge Winter Point
    { name: 'Winter Point Weather Ledge', url: './Images/Dutch Quality/Weather Ledge/DQ-Profile-Weather-Ledge-Winter-Point.jpg', manufacturer: 'dutch-quality', profile: 'weather-ledge', color: 'white-cream', category: 'stone', stocked: true },
    // #19 - Stacked Stone Silver Lining
    { name: 'Silver Lining', url: './Images/Eldorado Stone/Stacked Stone/Profile-Stacked_Stone-Silver_Lining.jpg', manufacturer: 'eldorado-stone', profile: 'stacked-stone', color: 'white-cream', category: 'stone', stocked: true },
    // #20 - Weather Ledge Quail Grey
    { name: 'Quail Grey Weather Ledge', url: './Images/Dutch Quality/Weather Ledge/DQ_Profile_Weather-Ledge_Quail-Grey.jpg', manufacturer: 'dutch-quality', profile: 'weather-ledge', color: 'gray', category: 'stone', stocked: true }
];

// Architect's Picks - Modern selections for contemporary homes
const ARCHITECT_PICKS = [
    { name: 'Iron Mill', url: './Images/Eldorado Stone/European Ledge/Profile-European_Ledge-Iron_Mill.jpg', manufacturer: 'eldorado-stone', profile: 'european-ledge', color: 'gray', category: 'stone' },
    { name: 'Black River', url: './Images/Eldorado Stone/Stacked Stone/Profile-Stacked_Stone-Black_River.jpg', manufacturer: 'eldorado-stone', profile: 'stacked-stone', color: 'black', category: 'stone' },
    { name: 'Zinc', url: './Images/Eldorado Stone/European Ledge/Profile-European_Ledge-Zinc.jpg', manufacturer: 'eldorado-stone', profile: 'european-ledge', color: 'gray', category: 'stone' }
];

// In Stock - Materials available for immediate delivery
const IN_STOCK = [
    { name: 'Cottonwood', url: './Images/Eldorado Stone/European Ledge/Profile-European_Ledge-Cottonwood.jpg', manufacturer: 'eldorado-stone', profile: 'european-ledge', color: 'white-cream', category: 'stone' },
    { name: 'Niveo', url: './Images/Casa Di Sassi/Kwik Stack/casa-profile-kwikStack-niveo.jpg', manufacturer: 'casa-di-sassi', profile: 'kwik-stack', color: 'white-cream', category: 'stone' },
    { name: 'Matera', url: './Images/Casa Di Sassi/Ledgestone/casa-profile-ledgestone-matera.jpg', manufacturer: 'casa-di-sassi', profile: 'ledgestone', color: 'gray', category: 'stone' }
];

function initCuratedCollections() {
    initTopSellersGrid();
    initArchitectPicksGrid();
    initInStockGrid();

    // Show the curated collections section
    const curatedSection = document.getElementById('curated-collections');
    if (curatedSection) {
        curatedSection.style.display = 'block';
    }
}

function initTopSellersGrid() {
    const grid = document.getElementById('top-sellers-grid');
    if (!grid) return;

    grid.innerHTML = '';

    TOP_SELLERS.forEach((material, index) => {
        const card = createCollectionCard(material, 'top-seller', index + 1);
        grid.appendChild(card);
    });
}

function initArchitectPicksGrid() {
    const grid = document.getElementById('architect-picks-grid');
    if (!grid) return;

    grid.innerHTML = '';

    ARCHITECT_PICKS.forEach((material) => {
        const card = createCollectionCard(material, 'architect');
        grid.appendChild(card);
    });
}

function initInStockGrid() {
    const grid = document.getElementById('in-stock-grid');
    if (!grid) return;

    grid.innerHTML = '';

    IN_STOCK.forEach((material) => {
        const card = createCollectionCard(material, 'in-stock');
        grid.appendChild(card);
    });
}

function createCollectionCard(material, badgeType, rank = null) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.dataset.url = material.url;

    let badgeText = '';
    if (badgeType === 'top-seller' && rank) {
        badgeText = `#${rank} Top Seller`;
    } else if (badgeType === 'architect') {
        badgeText = "Architect's Pick";
    } else if (badgeType === 'in-stock') {
        badgeText = 'In Stock';
    }

    card.innerHTML = `
        <div class="collection-card-image">
            <img src="${material.url}" alt="${material.name}" loading="lazy">
            <span class="collection-card-badge ${badgeType}">${badgeText}</span>
        </div>
        <div class="collection-card-info">
            <div class="collection-card-name">${material.name}</div>
            <div class="collection-card-profile">${formatProfile(material.profile)}</div>
        </div>
    `;

    card.addEventListener('click', () => {
        applyCuratedMaterial(material, card);
    });

    return card;
}

// Keep old function names for backward compatibility but redirect to new ones
function initTopSellers() {
    initTopSellersGrid();
}

function initArchitectPicks() {
    initArchitectPicksGrid();
}

function initInStock() {
    initInStockGrid();
}

function applyCuratedMaterial(material, cardElement) {
    // Add to saved materials if not already there
    const existingIndex = savedMaterials.findIndex(m => m.url === material.url);

    if (existingIndex === -1) {
        // Add to saved materials (limit to 5)
        if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
            savedMaterials.shift(); // Remove oldest
        }
        savedMaterials.push(material);
        activeMaterialIndex = savedMaterials.length - 1;
    } else {
        activeMaterialIndex = existingIndex;
    }

    // Apply to canvas
    applyMaterialToAllAreas(material);

    // Update UI
    updateQuickMaterialsStrip();
    updateMobileSelectedStrip(); // Update mobile strip with new selection

    // Update active state - clear all collection cards and highlight selected
    document.querySelectorAll('.collection-card').forEach(card => {
        card.classList.remove('active');
    });
    cardElement?.classList.add('active');

    // Show material info panel
    showMaterialInfoPanel(material);

    // Show compare controls
    const compareControls = document.getElementById('compare-controls');
    if (compareControls) {
        compareControls.style.display = 'flex';
    }
}

function selectMaterialForSlot(slot) {
    // If slot already has material, do nothing (use X to remove first)
    if (slot === 'a' && compareIndexA !== null) return;
    if (slot === 'b' && compareIndexB !== null) return;

    // Set pending slot selection and open material browser directly
    pendingCompareSlot = slot;
    // Use uppercase for compatibility with modal system
    selectingMaterialSlot = slot.toUpperCase();
    window._selectingForCompare = true;
    window._compareSlotLowercase = slot; // Track which slot in our system

    // Update slot visuals to show it's being filled
    const slotEl = document.getElementById(`compare-slot-${slot}`);
    slotEl?.classList.add('selecting');

    // Open the material browser modal
    openMaterialModalForCompare();
}

function cancelSlotSelection() {
    pendingCompareSlot = null;
    document.getElementById('compare-slot-a')?.classList.remove('selecting');
    document.getElementById('compare-slot-b')?.classList.remove('selecting');
    updateQuickMaterialsStrip();
}

function assignMaterialToSlot(index, slot) {
    const material = savedMaterials[index];

    if (slot === 'a') {
        compareIndexA = index;
        compareMaterialA = material;
    } else {
        compareIndexB = index;
        compareMaterialB = material;
    }

    // Clear pending selection
    pendingCompareSlot = null;
    document.getElementById('compare-slot-a')?.classList.remove('selecting');
    document.getElementById('compare-slot-b')?.classList.remove('selecting');

    updateCompareSlots();
    updateQuickMaterialsStrip();
}

function updateCompareSlots() {
    // Now uses unified panel
    updateUnifiedCompareSlots();

    // Also update the compare action button text based on mode
    const compareBtn = document.getElementById('compare-action-btn');
    if (compareBtn) {
        if (compareMaterialsMode) {
            compareBtn.textContent = 'Exit Compare';
            compareBtn.classList.add('active');
        } else {
            compareBtn.textContent = 'Compare A / B';
            compareBtn.classList.remove('active');
        }
    }
}

function clearCompareSlot(slot) {
    if (slot === 'a') {
        compareIndexA = null;
        compareMaterialA = null;
    } else {
        compareIndexB = null;
        compareMaterialB = null;
    }

    // If comparison was active, exit compare view
    if (compareMaterialsMode) {
        // Exit the visual comparison completely
        compareMaterialsMode = false;
        selectingMaterialSlot = null;

        const btn = document.getElementById('compare-materials-btn');
        const selector = document.getElementById('compare-material-selector');
        const container = document.getElementById('canvas-container');
        const beforeCanvas = document.getElementById('before-canvas');
        const slider = document.getElementById('compare-slider');
        const hotspotsContainer = document.getElementById('hotspots-container');

        if (btn) btn.classList.remove('active');
        if (selector) selector.style.display = 'none';
        if (beforeCanvas) beforeCanvas.style.display = 'none';
        if (slider) slider.style.display = 'none';
        if (hotspotsContainer) hotspotsContainer.style.display = 'block';
        removeCompareLabels(container);
    }

    // Also check if we need to exit the before/after compare mode
    if (compareMode) {
        compareMode = false;
        const compareToggleBtn = document.getElementById('compare-toggle');
        const slider = document.getElementById('compare-slider');
        const beforeCanvas = document.getElementById('before-canvas');
        const hotspotsContainer = document.getElementById('hotspots-container');

        if (compareToggleBtn) compareToggleBtn.classList.remove('active');
        if (slider) slider.style.display = 'none';
        if (beforeCanvas) beforeCanvas.style.display = 'none';
        if (hotspotsContainer) hotspotsContainer.style.display = 'block';
    }

    updateCompareSlots();
    updateQuickMaterialsStrip();
}

function toggleSlotComparison() {
    if (compareMaterialsMode) {
        // Exit comparison mode
        exitCompareMaterialsMode();
    } else {
        // Start comparison
        if (compareIndexA === null || compareIndexB === null) return;

        compareMaterialsMode = true;

        // Sync with top bar compare button
        const btn = document.getElementById('compare-materials-btn');
        if (btn) btn.classList.add('active');

        // Set the materials for comparison from saved materials
        compareMaterialA = savedMaterials[compareIndexA];
        compareMaterialB = savedMaterials[compareIndexB];

        startMaterialComparison();
    }
    updateCompareSlots();
}

function exitQuickCompare() {
    compareIndexA = null;
    compareIndexB = null;
    pendingCompareSlot = null;
    exitCompareMaterialsMode();
    updateCompareSlots();
    updateQuickMaterialsStrip();
}

function switchToQuickMaterial(index) {
    if (index < 0 || index >= savedMaterials.length) return;

    // Exit compare mode if active
    if (compareMaterialsMode) {
        exitQuickCompare();
    }

    activeMaterialIndex = index;
    const material = savedMaterials[index];

    // Apply the material
    applyMaterialToAllAreas(material);
    updateActionBarDisplay(material);
    selectedMaterial = material;

    // Update visual state
    updateQuickMaterialsStrip();
}

function showMaterialInfoPanel(material) {
    if (!material) return;

    // Find the material index in savedMaterials or add it
    let index = savedMaterials.findIndex(m => m.url === material.url);
    if (index === -1) {
        if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
            savedMaterials.shift();
        }
        savedMaterials.push(material);
        index = savedMaterials.length - 1;
    }
    activeMaterialIndex = index;

    // Update unified panel (left side)
    updateUnifiedPanel();

    // Also show the right side info panel
    updateMaterialInfoPanelDisplay(material);
}

function removeQuickMaterial(index) {
    // Clear compare slot if removing a compared material
    if (compareIndexA === index) {
        clearCompareSlot('a');
    } else if (compareIndexB === index) {
        clearCompareSlot('b');
    }

    savedMaterials.splice(index, 1);

    // Adjust indices after removal
    if (compareIndexA !== null && compareIndexA > index) {
        compareIndexA--;
        compareMaterialA = savedMaterials[compareIndexA];
    }
    if (compareIndexB !== null && compareIndexB > index) {
        compareIndexB--;
        compareMaterialB = savedMaterials[compareIndexB];
    }

    // Adjust active index if needed
    if (activeMaterialIndex >= savedMaterials.length) {
        activeMaterialIndex = Math.max(0, savedMaterials.length - 1);
    } else if (activeMaterialIndex > index) {
        activeMaterialIndex--;
    }

    // If we removed the active material, switch to another
    if (savedMaterials.length > 0 && index <= activeMaterialIndex) {
        const material = savedMaterials[activeMaterialIndex];
        applyMaterialToAllAreas(material);
        updateActionBarDisplay(material);
        selectedMaterial = material;
    }

    updateQuickMaterialsStrip();
    updateMobileSelectedStrip(); // Update mobile strip after removal

    // Hide material info if no materials left
    if (savedMaterials.length === 0) {
        hideInfoPanel();
    }
}

function updateActionBarDisplay(material) {
    const display = document.getElementById('selected-material-display');
    if (!display) return;

    display.innerHTML = `
        <img src="${material.url}" alt="${material.name}">
        <div class="selected-material-info">
            <span class="selected-material-name">${material.name}</span>
            <span class="selected-material-type">${formatManufacturer(material.manufacturer)}</span>
        </div>
    `;

    // Also update the material info panel
    updateMaterialInfoPanel(material);
}

function updateMaterialInfoPanel(material) {
    const panel = document.getElementById('material-info-panel');
    if (!panel || !material) return;

    // Update panel content
    document.getElementById('material-info-thumb').src = material.url;
    document.getElementById('material-info-name').textContent = material.name || '-';
    document.getElementById('material-info-profile').textContent = formatProfile(material.profile) || '-';
    document.getElementById('material-info-brand').textContent = formatManufacturer(material.manufacturer) || '-';
    document.getElementById('material-info-category').textContent = formatCategory(material.category) || '-';
    document.getElementById('material-info-color').textContent = formatColorFamily(material.color) || '-';

    // Handle price if available
    const priceRow = document.getElementById('material-info-price-row');
    const priceEl = document.getElementById('material-info-price');
    if (material.pricePerSqFt) {
        priceEl.textContent = `$${material.pricePerSqFt.toFixed(2)}/sq ft`;
        priceRow.style.display = 'flex';
    } else {
        priceRow.style.display = 'none';
    }

    // Handle product link if available
    const productLink = document.getElementById('material-product-link');
    if (material.productUrl) {
        productLink.href = material.productUrl;
        productLink.style.display = 'block';
    } else {
        productLink.style.display = 'none';
    }

    // Check if we need sticky mode before showing (to prevent animation conflict)
    const canvasSection = document.querySelector('.canvas-section');
    if (canvasSection) {
        const canvasRect = canvasSection.getBoundingClientRect();
        const panelHeight = panel.offsetHeight || 300;
        const windowHeight = window.innerHeight;
        const canvasBottom = canvasRect.bottom;
        const centeredPanelBottom = (windowHeight - panelHeight) / 2 + panelHeight;

        if (canvasBottom < centeredPanelBottom + 20) {
            panel.classList.add('sticky-mode');
        }
    }

    // Show the panel
    panel.classList.add('visible');

    // Update sticky position
    updateInfoPanelStickyPosition();
}

function formatProfile(profile) {
    if (!profile) return '-';
    return profile.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatCategory(category) {
    if (!category) return '-';
    return category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatColorFamily(color) {
    if (!color) return '-';
    return color.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ============= LIGHTING SIMULATION =============
let currentLighting = {
    preset: 'daylight'
};

function initLightingControls() {
    const toggleBtn = document.getElementById('lighting-toggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            // Toggle between daylight and evening
            const newPreset = currentLighting.preset === 'daylight' ? 'evening' : 'daylight';
            applyLightingPreset(newPreset);

            // Update button appearance
            toggleBtn.classList.toggle('evening', newPreset === 'evening');

            // Toggle icons
            const sunIcon = document.getElementById('sun-icon');
            const moonIcon = document.getElementById('moon-icon');
            if (sunIcon) sunIcon.classList.toggle('hidden', newPreset === 'evening');
            if (moonIcon) moonIcon.classList.toggle('hidden', newPreset === 'daylight');
        });
    }
}

function applyLightingPreset(preset) {
    currentLighting.preset = preset;

    let filterValue = 'none';

    if (preset === 'daylight') {
        // Normal daylight - no filter
        filterValue = 'none';
    } else if (preset === 'evening') {
        // Realistic evening: darker, warm amber/orange tones, reduced saturation
        // Simulates golden hour / dusk lighting
        filterValue = 'brightness(0.6) saturate(0.85) sepia(0.25) hue-rotate(-5deg)';
    }

    // Apply CSS filter to the canvas
    canvas.style.filter = filterValue;

    // Also apply to before canvas if it exists
    const beforeCanvas = document.getElementById('before-canvas');
    if (beforeCanvas) {
        beforeCanvas.style.filter = filterValue;
    }
}

// ============= QUOTE REQUEST MODAL =============
function initQuoteModal() {
    const quoteBtn = document.getElementById('quote-btn');
    const quoteModal = document.getElementById('quote-modal');
    const quoteCloseBtn = document.getElementById('quote-modal-close');
    const quoteCancelBtn = document.getElementById('quote-cancel-btn');
    const quoteForm = document.getElementById('quote-form');

    if (quoteBtn) {
        quoteBtn.addEventListener('click', openQuoteModal);
    }

    if (quoteCloseBtn) {
        quoteCloseBtn.addEventListener('click', closeQuoteModal);
    }

    if (quoteCancelBtn) {
        quoteCancelBtn.addEventListener('click', closeQuoteModal);
    }

    if (quoteModal) {
        quoteModal.addEventListener('click', (e) => {
            if (e.target === quoteModal) {
                closeQuoteModal();
            }
        });
    }

    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }
}

function openQuoteModal() {
    const modal = document.getElementById('quote-modal');
    const previewImage = document.getElementById('quote-preview-image');
    const materialSummary = document.getElementById('quote-material-summary');
    const sqftInput = document.getElementById('quote-sqft');

    // Capture current canvas as preview image
    previewImage.src = canvas.toDataURL('image/jpeg', 0.8);

    // Populate material summary
    if (selectedMaterial) {
        materialSummary.innerHTML = `
            <div class="quote-material-row">
                <span class="quote-material-label">Material</span>
                <span>${selectedMaterial.name}</span>
            </div>
            <div class="quote-material-row">
                <span class="quote-material-label">Brand</span>
                <span>${formatManufacturer(selectedMaterial.manufacturer)}</span>
            </div>
            <div class="quote-material-row">
                <span class="quote-material-label">Style</span>
                <span>${formatProfile(selectedMaterial.profile)}</span>
            </div>
            <div class="quote-material-row">
                <span class="quote-material-label">Category</span>
                <span>${formatCategory(selectedMaterial.category)}</span>
            </div>
        `;
    } else {
        materialSummary.innerHTML = `
            <div class="quote-material-row">
                <span>No material selected yet</span>
            </div>
        `;
    }

    // Pre-fill square footage if already entered in calculator
    const calcSqft = document.getElementById('sqft-input');
    if (calcSqft && calcSqft.value) {
        sqftInput.value = calcSqft.value;
    }

    modal.classList.add('active');
}

function closeQuoteModal() {
    const modal = document.getElementById('quote-modal');
    modal.classList.remove('active');
}

function handleQuoteSubmit(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('quote-name').value,
        email: document.getElementById('quote-email').value,
        phone: document.getElementById('quote-phone').value,
        sqft: document.getElementById('quote-sqft').value,
        message: document.getElementById('quote-message').value,
        material: selectedMaterial ? {
            name: selectedMaterial.name,
            manufacturer: selectedMaterial.manufacturer,
            profile: selectedMaterial.profile,
            category: selectedMaterial.category
        } : null,
        scene: document.getElementById('scene-name')?.textContent,
        visualizationImage: canvas.toDataURL('image/jpeg', 0.8)
    };

    // Store the quote data for the external form
    localStorage.setItem('quoteRequestData', JSON.stringify(formData));

    // Show confirmation and redirect to ACL Masonry quote page
    alert('Thank you! You will be redirected to complete your quote request.');

    // Open ACL Masonry quote page in new tab
    window.open('https://aclmasonry.com/request-a-quote/', '_blank');

    closeQuoteModal();

    // Clear form
    document.getElementById('quote-form').reset();
}

// ============= UTILITY FUNCTIONS =============
function downloadImage() {
    // Check if we're in any comparison mode
    if (compareMode || compareMaterialsMode) {
        // Show download options modal
        showDownloadOptions();
    } else {
        // Regular download
        downloadRegularImage();
    }
}

function downloadRegularImage() {
    const link = document.createElement('a');

    // Create filename with material name and scene name
    const sceneName = document.getElementById('scene-name')?.textContent || 'scene';
    const materialName = selectedMaterial?.name || 'design';
    const filename = `ACL-Masonry-${sceneName}-${materialName}.png`
        .replace(/[^a-zA-Z0-9-_.]/g, '-')
        .replace(/-+/g, '-');

    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function showDownloadOptions() {
    // Create modal for download options
    let modal = document.getElementById('download-options-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'download-options-modal';
        modal.innerHTML = `
            <div class="download-options-content">
                <h3>Download Options</h3>
                <div class="download-options-buttons">
                    <button class="download-option-btn" id="download-comparison-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="12" y1="3" x2="12" y2="21"/>
                        </svg>
                        <span>Download Comparison</span>
                        <small>Side-by-side with slider</small>
                    </button>
                    <button class="download-option-btn" id="download-current-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <path d="M12 8v8m-4-4l4 4 4-4"/>
                        </svg>
                        <span>Download Current View</span>
                        <small>Just the applied material</small>
                    </button>
                </div>
                <button class="download-cancel-btn" id="download-cancel-btn">Cancel</button>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(modal);

        // Style the content
        const content = modal.querySelector('.download-options-content');
        content.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 340px;
            width: 90%;
            text-align: center;
        `;

        const h3 = content.querySelector('h3');
        h3.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 18px;
            color: #333;
        `;

        const buttonsContainer = content.querySelector('.download-options-buttons');
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
        `;

        content.querySelectorAll('.download-option-btn').forEach(btn => {
            btn.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            btn.querySelector('span').style.cssText = `
                font-size: 14px;
                font-weight: 600;
                color: #333;
            `;
            btn.querySelector('small').style.cssText = `
                font-size: 12px;
                color: #888;
            `;
            btn.querySelector('svg').style.cssText = `
                color: #27ae60;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = '#27ae60';
                btn.style.background = '#f8fff8';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = '#e0e0e0';
                btn.style.background = 'white';
            });
        });

        const cancelBtn = content.querySelector('.download-cancel-btn');
        cancelBtn.style.cssText = `
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            background: #f0f0f0;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s ease;
        `;
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#e0e0e0';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = '#f0f0f0';
        });

        // Event listeners
        document.getElementById('download-comparison-btn').addEventListener('click', () => {
            hideDownloadOptions();
            downloadComparisonImage();
        });

        document.getElementById('download-current-btn').addEventListener('click', () => {
            hideDownloadOptions();
            downloadRegularImage();
        });

        document.getElementById('download-cancel-btn').addEventListener('click', hideDownloadOptions);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideDownloadOptions();
        });
    }

    // Show modal
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

function hideDownloadOptions() {
    const modal = document.getElementById('download-options-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}

function downloadComparisonImage() {
    const beforeCanvas = document.getElementById('before-canvas');
    const mainCanvas = canvas;

    if (!beforeCanvas || !mainCanvas) {
        console.error('Cannot create comparison - canvases not found');
        downloadRegularImage();
        return;
    }

    // Create a temporary canvas for the composite
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mainCanvas.width;
    tempCanvas.height = mainCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate the split position
    const splitX = Math.round((compareSliderPosition / 100) * mainCanvas.width);

    // Draw the before canvas (left side)
    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.rect(0, 0, splitX, mainCanvas.height);
    tempCtx.clip();
    tempCtx.drawImage(beforeCanvas, 0, 0);
    tempCtx.restore();

    // Draw the main canvas (right side)
    tempCtx.save();
    tempCtx.beginPath();
    tempCtx.rect(splitX, 0, mainCanvas.width - splitX, mainCanvas.height);
    tempCtx.clip();
    tempCtx.drawImage(mainCanvas, 0, 0);
    tempCtx.restore();

    // Draw the divider line
    tempCtx.strokeStyle = 'white';
    tempCtx.lineWidth = 3;
    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    tempCtx.shadowBlur = 4;
    tempCtx.beginPath();
    tempCtx.moveTo(splitX, 0);
    tempCtx.lineTo(splitX, mainCanvas.height);
    tempCtx.stroke();

    // Add labels
    const labelPadding = 20;
    const labelFontSize = Math.max(16, Math.round(mainCanvas.width / 40));

    tempCtx.font = `bold ${labelFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    tempCtx.textAlign = 'center';
    tempCtx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    tempCtx.shadowBlur = 4;
    tempCtx.fillStyle = 'white';

    // Get label text based on mode
    let leftLabel, rightLabel;
    if (compareMaterialsMode && compareMaterialA && compareMaterialB) {
        leftLabel = compareMaterialA.name?.toUpperCase() || 'MATERIAL A';
        rightLabel = compareMaterialB.name?.toUpperCase() || 'MATERIAL B';
    } else {
        leftLabel = 'BEFORE';
        rightLabel = 'AFTER';
    }

    // Draw left label
    tempCtx.fillText(leftLabel, splitX / 2, mainCanvas.height - labelPadding);

    // Draw right label
    tempCtx.fillText(rightLabel, splitX + (mainCanvas.width - splitX) / 2, mainCanvas.height - labelPadding);

    // Reset shadow for clean export
    tempCtx.shadowBlur = 0;

    // Create filename
    const sceneName = document.getElementById('scene-name')?.textContent || 'scene';
    let filename;
    if (compareMaterialsMode && compareMaterialA && compareMaterialB) {
        filename = `ACL-Masonry-${sceneName}-${compareMaterialA.name}-vs-${compareMaterialB.name}-comparison.png`;
    } else {
        const materialName = selectedMaterial?.name || 'design';
        filename = `ACL-Masonry-${sceneName}-${materialName}-before-after.png`;
    }
    filename = filename.replace(/[^a-zA-Z0-9-_.]/g, '-').replace(/-+/g, '-');

    // Download
    const link = document.createElement('a');
    link.download = filename;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}

let compareMode = false;
let compareMaterialsMode = false; // New: compare two materials instead of before/after
let compareSliderPosition = 50; // percentage
let compareMaterial = null; // The second material to compare against

function toggleCompare() {
    // If materials compare mode is active, deactivate it
    if (compareMaterialsMode) {
        exitCompareMaterialsMode();
    }

    compareMode = !compareMode;
    const btn = document.getElementById('compare-toggle');
    const headerBtn = document.getElementById('compare-toggle-header');
    const materialsBtn = document.getElementById('compare-materials-btn');
    const hotspotsContainer = document.getElementById('hotspots-container');
    if (btn) btn.classList.toggle('active', compareMode);
    if (headerBtn) headerBtn.classList.toggle('active', compareMode);
    if (materialsBtn) materialsBtn.classList.remove('active');

    // Hide hotspots during comparison mode
    if (hotspotsContainer) {
        hotspotsContainer.style.display = compareMode ? 'none' : 'block';
    }

    // Close any open hotspot picker
    if (compareMode && typeof closeHotspotPicker === 'function') {
        closeHotspotPicker();
    }

    const container = document.getElementById('canvas-container');
    let slider = document.getElementById('compare-slider');
    let beforeCanvas = document.getElementById('before-canvas');

    if (compareMode) {
        // Create slider if it doesn't exist
        if (!slider) {
            slider = document.createElement('div');
            slider.id = 'compare-slider';
            slider.innerHTML = `
                <div class="slider-line"></div>
                <div class="slider-handle">
                    <span>◀</span>
                    <span>▶</span>
                </div>
            `;
            container.appendChild(slider);

            // Add slider styles
            slider.style.cssText = `
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                width: 4px;
                background: #fff;
                cursor: ew-resize;
                z-index: 20;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                transform: translateX(-50%);
            `;

            const handle = slider.querySelector('.slider-handle');
            handle.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 40px;
                height: 40px;
                background: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2px;
                font-size: 12px;
                color: #333;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;

            // Add drag functionality
            let isDragging = false;

            slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const rect = container.getBoundingClientRect();
                let x = e.clientX - rect.left;
                let percent = (x / rect.width) * 100;
                percent = Math.max(5, Math.min(95, percent));
                compareSliderPosition = percent;
                updateComparePosition();
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Touch support
            slider.addEventListener('touchstart', (e) => {
                isDragging = true;
                e.preventDefault();
            });

            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const rect = container.getBoundingClientRect();
                let x = e.touches[0].clientX - rect.left;
                let percent = (x / rect.width) * 100;
                percent = Math.max(5, Math.min(95, percent));
                compareSliderPosition = percent;
                updateComparePosition();
            });

            document.addEventListener('touchend', () => {
                isDragging = false;
            });
        }

        // Setup before canvas - must match the exact displayed size of main canvas
        if (beforeCanvas) {
            // Get the actual displayed size of the main canvas
            const mainCanvasRect = canvas.getBoundingClientRect();
            const displayWidth = mainCanvasRect.width;
            const displayHeight = mainCanvasRect.height;

            // Set the before canvas to the same internal resolution as main canvas
            beforeCanvas.width = canvas.width;
            beforeCanvas.height = canvas.height;

            const beforeCtx = beforeCanvas.getContext('2d');

            // Draw original image without stone materials (but WITH customized colors)
            if (customerImage) {
                const bounds = window._bgImageBounds;
                beforeCtx.fillStyle = '#f0f0f0';
                beforeCtx.fillRect(0, 0, beforeCanvas.width, beforeCanvas.height);
                if (bounds) {
                    beforeCtx.drawImage(customerImage, bounds.drawX, bounds.drawY, bounds.drawWidth, bounds.drawHeight);
                }

                // Draw customized colors on before canvas (same as main, but no stone)
                drawColorFillsOnCanvas(beforeCtx);
            }

            // Critical: Match the CSS display size exactly to the main canvas
            beforeCanvas.style.cssText = `
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: ${displayWidth}px;
                height: ${displayHeight}px;
                z-index: 10;
                pointer-events: none;
            `;
        }

        slider.style.display = 'block';
        compareSliderPosition = 50;
        updateComparePosition();

        // Add labels
        addCompareLabels(container);

    } else {
        if (beforeCanvas) {
            beforeCanvas.style.display = 'none';
        }
        if (slider) {
            slider.style.display = 'none';
        }
        removeCompareLabels(container);
    }
}

function updateComparePosition() {
    const slider = document.getElementById('compare-slider');
    const beforeCanvas = document.getElementById('before-canvas');

    if (slider) {
        slider.style.left = compareSliderPosition + '%';
    }

    if (beforeCanvas) {
        // Clip the before canvas to show only the left portion
        beforeCanvas.style.clipPath = `inset(0 ${100 - compareSliderPosition}% 0 0)`;
    }
}

function addCompareLabels(container) {
    // Remove existing labels first
    removeCompareLabels(container);

    const beforeLabel = document.createElement('div');
    beforeLabel.id = 'compare-label-before';
    beforeLabel.textContent = 'BEFORE';
    beforeLabel.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 25;
    `;

    const afterLabel = document.createElement('div');
    afterLabel.id = 'compare-label-after';
    afterLabel.textContent = 'AFTER';
    afterLabel.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(122, 5, 5, 0.9);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 25;
    `;

    container.appendChild(beforeLabel);
    container.appendChild(afterLabel);
}

function removeCompareLabels(container) {
    const beforeLabel = document.getElementById('compare-label-before');
    const afterLabel = document.getElementById('compare-label-after');
    if (beforeLabel) beforeLabel.remove();
    if (afterLabel) afterLabel.remove();
}

// ============= COMPARE MATERIALS MODE =============
// State for two-material comparison when no main material is applied
let compareMaterialA = null; // Left side material
let compareMaterialB = null; // Right side material
let selectingMaterialSlot = null; // 'A', 'B', or null

function toggleCompareMaterials() {
    // If before/after mode is active, deactivate it first
    if (compareMode) {
        toggleCompare();
    }

    compareMaterialsMode = !compareMaterialsMode;
    const btn = document.getElementById('compare-materials-btn');
    const beforeAfterBtn = document.getElementById('compare-toggle');
    const selector = document.getElementById('compare-material-selector');

    btn.classList.toggle('active', compareMaterialsMode);
    if (beforeAfterBtn) beforeAfterBtn.classList.remove('active');

    if (compareMaterialsMode) {
        // Show the material selector
        if (selector) selector.style.display = 'flex';

        // Check if left sidebar compare slots already have materials
        if (compareIndexA !== null && compareIndexB !== null && savedMaterials[compareIndexA] && savedMaterials[compareIndexB]) {
            // Use the materials from the sidebar slots
            compareMaterialA = savedMaterials[compareIndexA];
            compareMaterialB = savedMaterials[compareIndexB];
            startMaterialComparison();
            return;
        }

        // If we have a main material applied, use that as the right side
        if (selectedMaterial) {
            compareMaterialB = selectedMaterial;
            // Prompt user to select the left side (compare material)
            if (!compareMaterial) {
                selectingMaterialSlot = 'A';
                openMaterialModalForCompare();
            } else {
                compareMaterialA = compareMaterial;
                startMaterialComparison();
            }
        } else {
            // No main material applied - need to select both materials
            // Start by selecting material A (left side)
            if (!compareMaterialA) {
                selectingMaterialSlot = 'A';
                openMaterialModalForCompare();
            } else if (!compareMaterialB) {
                selectingMaterialSlot = 'B';
                openMaterialModalForCompare();
            } else {
                startMaterialComparison();
            }
        }
    } else {
        exitCompareMaterialsMode();
    }
}

function exitCompareMaterialsMode() {
    compareMaterialsMode = false;
    selectingMaterialSlot = null;

    // Reset quick compare indices
    compareIndexA = null;
    compareIndexB = null;
    compareMaterialA = null;
    compareMaterialB = null;

    const btn = document.getElementById('compare-materials-btn');
    const selector = document.getElementById('compare-material-selector');
    const container = document.getElementById('canvas-container');
    const beforeCanvas = document.getElementById('before-canvas');
    const slider = document.getElementById('compare-slider');
    const hotspotsContainer = document.getElementById('hotspots-container');

    if (btn) btn.classList.remove('active');
    if (selector) selector.style.display = 'none';
    if (beforeCanvas) beforeCanvas.style.display = 'none';
    if (slider) slider.style.display = 'none';
    if (hotspotsContainer) hotspotsContainer.style.display = 'block'; // Show hotspots again
    removeCompareLabels(container);

    // Restore modal title if it was changed
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Browse Materials';
    }

    // Update the quick materials strip and compare slots
    updateQuickMaterialsStrip();
    updateCompareSlots();
}

function openMaterialModalForCompare() {
    // Set a flag so we know we're selecting for comparison
    window._selectingForCompare = true;

    // Update modal title to indicate what we're selecting
    const modalTitle = document.querySelector('.modal-header h2');
    if (modalTitle) {
        if (selectingMaterialSlot === 'A') {
            modalTitle.textContent = 'Select First Material (Left Side)';
        } else if (selectingMaterialSlot === 'B') {
            modalTitle.textContent = 'Select Second Material (Right Side)';
        } else {
            modalTitle.textContent = 'Select Material to Compare';
        }
    }

    openMaterialModal();
}

function startMaterialComparison() {
    // Use the A/B materials if set, otherwise fall back to compareMaterial/selectedMaterial
    const leftMaterial = compareMaterialA || compareMaterial;
    const rightMaterial = compareMaterialB || selectedMaterial;

    if (!leftMaterial || !rightMaterial) {
        console.log('Cannot start comparison: missing materials', { leftMaterial, rightMaterial });
        return;
    }

    // Hide hotspots during comparison mode
    const hotspotsContainer = document.getElementById('hotspots-container');
    if (hotspotsContainer) hotspotsContainer.style.display = 'none';

    // Close any open hotspot picker
    if (typeof closeHotspotPicker === 'function') {
        closeHotspotPicker();
    }

    const container = document.getElementById('canvas-container');
    let slider = document.getElementById('compare-slider');
    let beforeCanvas = document.getElementById('before-canvas');

    // Create slider if needed (reuse from before/after mode)
    if (!slider) {
        slider = document.createElement('div');
        slider.id = 'compare-slider';
        slider.innerHTML = `
            <div class="slider-line"></div>
            <div class="slider-handle">
                <span>◀</span>
                <span>▶</span>
            </div>
        `;
        container.appendChild(slider);

        slider.style.cssText = `
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 4px;
            background: #fff;
            cursor: ew-resize;
            z-index: 20;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            transform: translateX(-50%);
        `;

        const handle = slider.querySelector('.slider-handle');
        handle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 12px;
            color: #333;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;

        // Add drag functionality
        let isDragging = false;

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = container.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let percent = (x / rect.width) * 100;
            percent = Math.max(5, Math.min(95, percent));
            compareSliderPosition = percent;
            updateComparePosition();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch support
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const rect = container.getBoundingClientRect();
            let x = e.touches[0].clientX - rect.left;
            let percent = (x / rect.width) * 100;
            percent = Math.max(5, Math.min(95, percent));
            compareSliderPosition = percent;
            updateComparePosition();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // First, ensure the right material is drawn on the main canvas
    const rightImg = new Image();
    rightImg.crossOrigin = 'anonymous';
    rightImg.onload = function() {
        loadedTextures[rightMaterial.url] = rightImg;

        // Apply right material to main canvas areas
        customerAreas.forEach(area => {
            if (area.isCutout || area.textureMode === 'color_fill') return;
            area.stone = {
                url: rightMaterial.url,
                name: rightMaterial.name,
                manufacturer: rightMaterial.manufacturer,
                profile: rightMaterial.profile
            };
        });
        drawCanvas();

        // Now draw the left material on the before canvas
        if (beforeCanvas) {
            const mainCanvasRect = canvas.getBoundingClientRect();
            const displayWidth = mainCanvasRect.width;
            const displayHeight = mainCanvasRect.height;

            beforeCanvas.width = canvas.width;
            beforeCanvas.height = canvas.height;

            // Load and draw the left material
            const leftImg = new Image();
            leftImg.crossOrigin = 'anonymous';
            leftImg.onload = function() {
                drawCanvasWithMaterial(beforeCanvas, leftMaterial, leftImg);

                beforeCanvas.style.cssText = `
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: ${displayWidth}px;
                    height: ${displayHeight}px;
                    z-index: 10;
                    pointer-events: none;
                `;

                slider.style.display = 'block';
                compareSliderPosition = 50;
                updateComparePosition();

                // Add labels with material names
                addMaterialCompareLabels(container, leftMaterial.name, rightMaterial.name);
            };
            leftImg.src = leftMaterial.url;
        }
    };
    rightImg.src = rightMaterial.url;
}

function drawCanvasWithMaterial(targetCanvas, material, textureImg) {
    const targetCtx = targetCanvas.getContext('2d');

    // Clear canvas
    targetCtx.fillStyle = '#f0f0f0';
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

    // Draw background image
    if (customerImage && window._bgImageBounds) {
        const bounds = window._bgImageBounds;
        targetCtx.drawImage(customerImage, bounds.drawX, bounds.drawY, bounds.drawWidth, bounds.drawHeight);
    }

    // First draw customized colors (before stone, so stone is on top)
    drawColorFillsOnCanvas(targetCtx);

    // Draw stone areas with the comparison material
    if (customerAreas && textureImg) {
        customerAreas.forEach(area => {
            // Skip non-stone areas and cutouts
            if (area.isCutout) return;
            if (area.textureMode === 'color_fill' || area.textureMode === 'texture_fill') return;
            if (area.areaType) return; // Skip typed areas (siding, trim, etc)
            if (!area.points || area.points.length < 3) return;

            targetCtx.save();

            // Create clipping path
            targetCtx.beginPath();
            targetCtx.moveTo(area.points[0].x, area.points[0].y);
            for (let i = 1; i < area.points.length; i++) {
                targetCtx.lineTo(area.points[i].x, area.points[i].y);
            }
            targetCtx.closePath();

            // Handle cutouts
            if (area.cutouts && area.cutouts.length > 0) {
                area.cutouts.forEach(cutoutId => {
                    const cutout = customerAreas.find(a => a.id === cutoutId);
                    if (cutout && cutout.points) {
                        targetCtx.moveTo(cutout.points[0].x, cutout.points[0].y);
                        for (let i = cutout.points.length - 1; i >= 0; i--) {
                            targetCtx.lineTo(cutout.points[i].x, cutout.points[i].y);
                        }
                        targetCtx.closePath();
                    }
                });
            }

            targetCtx.clip();

            // Calculate bounds
            const xs = area.points.map(p => p.x);
            const ys = area.points.map(p => p.y);
            const minX = Math.min(...xs);
            const minY = Math.min(...ys);
            const maxX = Math.max(...xs);
            const maxY = Math.max(...ys);

            // Draw texture - use normalized scale for consistent sizing
            const scale = scaleToRealSize(area.scale || 200);
            const patternDims = getNormalizedTileDimensions(textureImg, scale);
            const patternWidth = patternDims.width;
            const patternHeight = patternDims.height;

            targetCtx.save();
            if (area.rotation) {
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                targetCtx.translate(centerX, centerY);
                targetCtx.rotate((area.rotation * Math.PI) / 180);
                targetCtx.translate(-centerX, -centerY);
            }

            for (let y = minY - patternHeight; y < maxY + patternHeight; y += patternHeight) {
                for (let x = minX - patternWidth; x < maxX + patternWidth; x += patternWidth) {
                    targetCtx.drawImage(textureImg, x, y, patternWidth, patternHeight);
                }
            }
            targetCtx.restore();

            targetCtx.restore();
        });
    }

    // Draw sills on top of windows (same as main drawCanvas)
    if (customerAreas && customerAreas.length > 0) {
        customerAreas.forEach(area => {
            if (area.areaType !== 'sills') return;
            if (area.textureMode === 'color_fill' && area.fillColor) {
                drawColorFillAreaOnCtx(targetCtx, area);
            }
        });
    }

    // Draw depth edges (shadows) if they exist in the project data
    if (projectData && projectData.depthEdges && projectData.depthEdges.length > 0) {
        projectData.depthEdges.forEach(edge => {
            drawDepthEdgeEffectOnCanvas(targetCtx, edge);
        });
    }
}

function addMaterialCompareLabels(container, leftName, rightName) {
    removeCompareLabels(container);

    const leftLabel = document.createElement('div');
    leftLabel.id = 'compare-label-before';
    leftLabel.textContent = leftName.toUpperCase();
    leftLabel.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 25;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    const rightLabel = document.createElement('div');
    rightLabel.id = 'compare-label-after';
    rightLabel.textContent = rightName.toUpperCase();
    rightLabel.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(122, 5, 5, 0.9);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        z-index: 25;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;

    container.appendChild(leftLabel);
    container.appendChild(rightLabel);
}

function updateCompareMaterialThumb() {
    const thumb = document.getElementById('compare-material-thumb');
    if (!thumb) return;

    const material = compareMaterialA || compareMaterial;
    if (material) {
        thumb.innerHTML = `
            <img src="${material.url}" alt="${material.name}">
            <span class="thumb-name">${material.name}</span>
        `;
    } else {
        thumb.innerHTML = '<span class="thumb-placeholder">Select Material</span>';
    }
}

// ============= COLOR CUSTOMIZATION =============
// Preset colors for siding, roof, trim, etc.
const PRESET_COLORS = {
    siding: [
        { name: 'White', color: '#FFFFFF' },
        { name: 'Cream', color: '#FFFDD0' },
        { name: 'Beige', color: '#D4C4A8' },
        { name: 'Tan', color: '#C1BC86' },
        { name: 'Yellow', color: '#F4D03F' },
        { name: 'Light Blue', color: '#AED6F1' },
        { name: 'Sage Green', color: '#9DC183' },
        { name: 'Gray', color: '#95A5A6' },
        { name: 'Charcoal', color: '#4A4A4A' },
        { name: 'Brown', color: '#8B7355' },
        { name: 'Navy', color: '#2C3E50' },
        { name: 'Black', color: '#1C1C1C' }
    ],
    roof: [
        { name: 'Charcoal', color: '#36454F' },
        { name: 'Black', color: '#1C1C1C' },
        { name: 'Brown', color: '#5D4037' },
        { name: 'Terra Cotta', color: '#C45A36' },
        { name: 'Slate Gray', color: '#708090' },
        { name: 'Forest Green', color: '#228B22' },
        { name: 'Weathered Wood', color: '#8B7355' },
        { name: 'Shake', color: '#A0522D' }
    ],
    trim: [
        { name: 'White', color: '#FFFFFF' },
        { name: 'Cream', color: '#FFFDD0' },
        { name: 'Black', color: '#1C1C1C' },
        { name: 'Charcoal', color: '#4A4A4A' },
        { name: 'Brown', color: '#5D4037' },
        { name: 'Navy', color: '#2C3E50' }
    ],
    shutters: [
        { name: 'Black', color: '#1C1C1C' },
        { name: 'Navy', color: '#2C3E50' },
        { name: 'Forest Green', color: '#228B22' },
        { name: 'Burgundy', color: '#800020' },
        { name: 'Charcoal', color: '#4A4A4A' },
        { name: 'White', color: '#FFFFFF' },
        { name: 'Brown', color: '#5D4037' },
        { name: 'Red', color: '#B22222' }
    ],
    door: [
        { name: 'White', color: '#FFFFFF' },
        { name: 'Black', color: '#1C1C1C' },
        { name: 'Navy', color: '#2C3E50' },
        { name: 'Red', color: '#8B0000' },
        { name: 'Forest Green', color: '#228B22' },
        { name: 'Brown', color: '#5D4037' },
        { name: 'Gray', color: '#708090' },
        { name: 'Burgundy', color: '#800020' }
    ],
    soffit: [
        { name: 'White', color: '#FFFFFF' },
        { name: 'Cream', color: '#FFFDD0' },
        { name: 'Beige', color: '#D4C4A8' },
        { name: 'Gray', color: '#95A5A6' },
        { name: 'Brown', color: '#8B7355' },
        { name: 'Black', color: '#1C1C1C' }
    ],
    sills: [
        { name: 'White', color: '#FFFFFF' },
        { name: 'Cream', color: '#FFFDD0' },
        { name: 'Gray', color: '#708090' },
        { name: 'Black', color: '#1C1C1C' },
        { name: 'Brown', color: '#5D4037' },
        { name: 'Tan', color: '#C1BC86' }
    ]
};

// Texture options for mantle, hearth, and siding
const PRESET_TEXTURES = {
    mantle: [
        // Wood options
        { name: 'Oak', url: './Images/Wood Surfaces/Wood/26.jpg', type: 'wood' },
        { name: 'Walnut', url: './Images/Wood Surfaces/Wood/27.jpg', type: 'wood' },
        { name: 'Cherry', url: './Images/Wood Surfaces/Wood/28.jpg', type: 'wood' },
        { name: 'Maple', url: './Images/Wood Surfaces/Wood/29.jpg', type: 'wood' },
        { name: 'Pine', url: './Images/Wood Surfaces/Wood/30.jpg', type: 'wood' },
        { name: 'Ash', url: './Images/Wood Surfaces/Wood/31.jpg', type: 'wood' },
        { name: 'Mahogany', url: './Images/Wood Surfaces/Wood/32.jpg', type: 'wood' },
        { name: 'Ebony', url: './Images/Wood Surfaces/Wood/33.jpg', type: 'wood' },
        // Stone/Concrete options
        { name: 'Light Stone', url: './Images/Stone & Concrete Surfaces/Stone/21.jpg', type: 'stone' },
        { name: 'Dark Stone', url: './Images/Stone & Concrete Surfaces/Stone/22.jpg', type: 'stone' },
        { name: 'Concrete Gray', url: './Images/Stone & Concrete Surfaces/Concrete/17.jpg', type: 'concrete' },
        { name: 'Polished Concrete', url: './Images/Stone & Concrete Surfaces/Concrete/18.jpg', type: 'concrete' }
    ],
    hearth: [
        // Stone options
        { name: 'Slate', url: './Images/Stone & Concrete Surfaces/Stone/21.jpg', type: 'stone' },
        { name: 'Granite', url: './Images/Stone & Concrete Surfaces/Stone/22.jpg', type: 'stone' },
        { name: 'Marble', url: './Images/Stone & Concrete Surfaces/Stone/23.jpg', type: 'stone' },
        { name: 'Travertine', url: './Images/Stone & Concrete Surfaces/Stone/24.jpg', type: 'stone' },
        { name: 'Limestone', url: './Images/Stone & Concrete Surfaces/Stone/25.jpg', type: 'stone' },
        // Concrete options
        { name: 'Concrete Gray', url: './Images/Stone & Concrete Surfaces/Concrete/17.jpg', type: 'concrete' },
        { name: 'Polished Concrete', url: './Images/Stone & Concrete Surfaces/Concrete/18.jpg', type: 'concrete' },
        { name: 'Stamped Concrete', url: './Images/Stone & Concrete Surfaces/Concrete/19.jpg', type: 'concrete' },
        { name: 'Brushed Concrete', url: './Images/Stone & Concrete Surfaces/Concrete/20.jpg', type: 'concrete' }
    ],
    siding: [
        // Wood siding textures using available wood surface images
        { name: 'Natural Wood - Light', url: './Images/Wood Surfaces/Wood/26.jpg', type: 'wood', hasImage: true },
        { name: 'Natural Wood - Medium', url: './Images/Wood Surfaces/Wood/27.jpg', type: 'wood', hasImage: true },
        { name: 'Natural Wood - Dark', url: './Images/Wood Surfaces/Wood/28.jpg', type: 'wood', hasImage: true },
        { name: 'Cedar - Natural', url: './Images/Wood Surfaces/Wood/29.jpg', type: 'wood', hasImage: true },
        { name: 'Pine - Light', url: './Images/Wood Surfaces/Wood/30.jpg', type: 'wood', hasImage: true },
        { name: 'Ash - Gray', url: './Images/Wood Surfaces/Wood/31.jpg', type: 'wood', hasImage: true },
        { name: 'Mahogany', url: './Images/Wood Surfaces/Wood/32.jpg', type: 'wood', hasImage: true },
        { name: 'Ebony - Dark', url: './Images/Wood Surfaces/Wood/33.jpg', type: 'wood', hasImage: true },
        { name: 'Weathered Wood', url: './Images/Wood Surfaces/Wood/35.jpg', type: 'wood', hasImage: true },
        { name: 'Reclaimed Wood', url: './Images/Wood Surfaces/Wood/36.jpg', type: 'wood', hasImage: true },
        { name: 'Stained Oak', url: './Images/Wood Surfaces/Wood/37.jpg', type: 'wood', hasImage: true }
    ]
};

// Get sill products from ACCENT_MATERIALS (Watertable/Sills)
function getSillProducts() {
    if (typeof ACCENT_MATERIALS === 'undefined') return [];
    return ACCENT_MATERIALS.filter(m => {
        const profile = (m.profile || '').toLowerCase();
        return profile.includes('sill') || profile.includes('watertable');
    });
}

// Product catalog for accents (keystones, corbels, quoins, etc.)
const ACCENTS_CATALOG = [
    // Keystones
    { name: 'Keystone - Limestone', sku: 'ACC-KEY-LS', price: '$45.00/ea', url: './Images/Accents/keystone-limestone.jpg', category: 'keystone', manufacturer: 'Eldorado Stone' },
    { name: 'Keystone - Cast Stone', sku: 'ACC-KEY-CS', price: '$55.00/ea', url: './Images/Accents/keystone-cast.jpg', category: 'keystone', manufacturer: 'Dutch Quality' },
    // Corbels
    { name: 'Corbel - Traditional', sku: 'ACC-CRB-TRD', price: '$85.00/ea', url: './Images/Accents/corbel-traditional.jpg', category: 'corbel', manufacturer: 'Eldorado Stone' },
    { name: 'Corbel - Modern', sku: 'ACC-CRB-MOD', price: '$75.00/ea', url: './Images/Accents/corbel-modern.jpg', category: 'corbel', manufacturer: 'Dutch Quality' },
    // Quoins
    { name: 'Quoin Set - Limestone', sku: 'ACC-QN-LS', price: '$125.00/set', url: './Images/Accents/quoin-limestone.jpg', category: 'quoin', manufacturer: 'Eldorado Stone' },
    { name: 'Quoin Set - Fieldstone', sku: 'ACC-QN-FS', price: '$145.00/set', url: './Images/Accents/quoin-fieldstone.jpg', category: 'quoin', manufacturer: 'Casa Di Sassi' },
    // Address blocks
    { name: 'Address Block - Rectangle', sku: 'ACC-ADD-RCT', price: '$65.00/ea', url: './Images/Accents/address-rect.jpg', category: 'address', manufacturer: 'ACL Masonry' },
    { name: 'Address Block - Arch', sku: 'ACC-ADD-ARC', price: '$85.00/ea', url: './Images/Accents/address-arch.jpg', category: 'address', manufacturer: 'ACL Masonry' },
    // Caps
    { name: 'Post Cap - Pyramid', sku: 'ACC-CAP-PYR', price: '$35.00/ea', url: './Images/Accents/cap-pyramid.jpg', category: 'cap', manufacturer: 'Dutch Quality' },
    { name: 'Post Cap - Flat', sku: 'ACC-CAP-FLT', price: '$28.00/ea', url: './Images/Accents/cap-flat.jpg', category: 'cap', manufacturer: 'Dutch Quality' },
    { name: 'Wall Cap - Beveled', sku: 'ACC-WCP-BVL', price: '$18.00/lf', url: './Images/Accents/wallcap-beveled.jpg', category: 'wallcap', manufacturer: 'Eldorado Stone' }
];

// Default opacity settings for different area types
const AREA_OPACITY_DEFAULTS = {
    siding: 0.5,
    roof: 0.6,
    shutters: 0.7,
    trim: 0.5,
    door: 0.7,
    soffit: 0.5,
    sills: 0.6,
    mantle: 0.8,
    hearth: 0.8
};

// Check if area type uses textures instead of colors
function isTextureAreaType(areaType) {
    return areaType === 'mantle' || areaType === 'hearth' || areaType === 'siding';
}

// Check if area type uses a product catalog (purchasable items)
function isProductCatalogAreaType(areaType) {
    return areaType === 'sills' || areaType === 'accents';
}

// Get product catalog for an area type
function getProductCatalog(areaType) {
    if (areaType === 'sills') return getSillProducts();
    if (areaType === 'accents') return ACCENTS_CATALOG;
    return [];
}

// Track currently selected color area
let selectedColorAreaType = null;
let colorCustomizableAreas = [];
// Track which area types have been user-modified (to prevent showing colors on initial load)
let modifiedAreaTypes = new Set();

function initColorCustomization() {
    // Find all areas with areaType that are customizable (color_fill, texture_fill, or have areaType set)
    colorCustomizableAreas = customerAreas.filter(area =>
        area.areaType && !area.isCutout
    );

    const customizeBtn = document.getElementById('customize-colors-btn');

    if (colorCustomizableAreas.length > 0) {
        // Show the customize colors button
        if (customizeBtn) {
            customizeBtn.classList.remove('hidden');
        }

        // Build the area selector buttons
        buildColorAreaButtons();

        // Setup event listeners
        setupColorCustomizationListeners();
    } else {
        // Hide the button if no customizable areas
        if (customizeBtn) {
            customizeBtn.classList.add('hidden');
        }
    }
}

function buildColorAreaButtons() {
    const container = document.getElementById('color-area-buttons');
    if (!container) return;

    container.innerHTML = '';

    // Get unique area types
    const areaTypes = [...new Set(colorCustomizableAreas.map(a => a.areaType))];

    areaTypes.forEach((type, index) => {
        const btn = document.createElement('button');
        btn.className = 'color-area-btn' + (index === 0 ? ' active' : '');
        btn.dataset.areaType = type;
        btn.textContent = formatAreaType(type);

        btn.addEventListener('click', () => selectColorAreaType(type));
        container.appendChild(btn);
    });

    // Select first area type by default
    if (areaTypes.length > 0) {
        selectedColorAreaType = areaTypes[0];
        buildColorSwatches(areaTypes[0]);
    }
}

function formatAreaType(type) {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function selectColorAreaType(type) {
    selectedColorAreaType = type;

    // Update button states
    document.querySelectorAll('.color-area-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.areaType === type);
    });

    // Rebuild swatches for this area type
    buildColorSwatches(type);
}

function buildColorSwatches(areaType) {
    const container = document.getElementById('color-swatches-grid');
    const labelEl = document.querySelector('.color-swatches-label');
    if (!container) return;

    container.innerHTML = '';

    // Check if this is a texture-based area type
    if (isTextureAreaType(areaType)) {
        // Update label
        if (labelEl) labelEl.textContent = 'Choose Surface';

        // Get textures for this area type
        const textures = PRESET_TEXTURES[areaType] || [];

        // Find current texture of this area type
        const area = colorCustomizableAreas.find(a => a.areaType === areaType);
        const currentTexture = area ? area.textureUrl : null;

        textures.forEach(textureOption => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch texture-swatch';
            swatch.style.backgroundImage = `url('${textureOption.url}')`;
            swatch.style.backgroundSize = 'cover';
            swatch.style.backgroundPosition = 'center';
            swatch.dataset.textureUrl = textureOption.url;
            swatch.dataset.textureName = textureOption.name;
            swatch.title = textureOption.name;

            // Check if this is the current texture
            if (currentTexture && currentTexture === textureOption.url) {
                swatch.classList.add('active');
            }

            // Add texture name label
            const label = document.createElement('span');
            label.className = 'color-swatch-label';
            label.textContent = textureOption.name;
            swatch.appendChild(label);

            swatch.addEventListener('click', () => applyTextureToArea(areaType, textureOption.url, textureOption.name));
            container.appendChild(swatch);
        });
    } else {
        // Update label
        if (labelEl) labelEl.textContent = 'Choose Color';

        // Get colors for this area type (default to siding if not found)
        const colors = PRESET_COLORS[areaType] || PRESET_COLORS.siding;

        // Find current color of this area type
        const area = colorCustomizableAreas.find(a => a.areaType === areaType);
        const currentColor = area ? area.fillColor : null;

        colors.forEach(colorOption => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = colorOption.color;
            swatch.dataset.color = colorOption.color;
            swatch.title = colorOption.name;

            // Check if this is the current color
            if (currentColor && currentColor.toLowerCase() === colorOption.color.toLowerCase()) {
                swatch.classList.add('active');
            }

            // Add color name label
            const label = document.createElement('span');
            label.className = 'color-swatch-label';
            label.textContent = colorOption.name;
            swatch.appendChild(label);

            swatch.addEventListener('click', () => applyColorToArea(areaType, colorOption.color));
            container.appendChild(swatch);
        });
    }
}

function applyColorToArea(areaType, color) {
    // Check if clicking the same color that's already active (toggle off)
    const currentArea = customerAreas.find(a => a.areaType === areaType);
    const isToggleOff = currentArea &&
                        modifiedAreaTypes.has(areaType) &&
                        currentArea.fillColor &&
                        currentArea.fillColor.toLowerCase() === color.toLowerCase();

    if (isToggleOff) {
        // Remove this area type from modified set (revert to default/hidden)
        modifiedAreaTypes.delete(areaType);

        // Update swatch active states - none should be active
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });

        // Redraw canvas
        drawCanvas();
        return;
    }

    // Mark this area type as modified by user
    modifiedAreaTypes.add(areaType);

    // Find all areas of this type and update their color (synced together)
    customerAreas.forEach(area => {
        if (area.areaType === areaType) {
            area.fillColor = color;
            // Ensure it's in color_fill mode
            area.textureMode = 'color_fill';
            area.textureUrl = null;
            // Apply default opacity for this area type if not set
            if (area.materialOpacity === undefined) {
                area.materialOpacity = AREA_OPACITY_DEFAULTS[areaType] || 0.5;
            }
        }
    });

    // Update swatch active states
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.toggle('active', swatch.dataset.color === color);
    });

    // Redraw canvas
    drawCanvas();
}

function applyTextureToArea(areaType, textureUrl, textureName) {
    // Check if clicking the same texture that's already active (toggle off)
    const currentArea = customerAreas.find(a => a.areaType === areaType);
    const isToggleOff = currentArea &&
                        modifiedAreaTypes.has(areaType) &&
                        currentArea.textureUrl === textureUrl;

    if (isToggleOff) {
        // Remove this area type from modified set (revert to default/hidden)
        modifiedAreaTypes.delete(areaType);

        // Update swatch active states - none should be active
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('active');
        });

        // Redraw canvas
        drawCanvas();
        return;
    }

    // Mark this area type as modified by user
    modifiedAreaTypes.add(areaType);

    // Find all areas of this type and update their texture (synced together)
    customerAreas.forEach(area => {
        if (area.areaType === areaType) {
            area.textureUrl = textureUrl;
            area.textureName = textureName;
            // Switch to texture mode for mantle/hearth
            area.textureMode = 'texture_fill';
            // Apply default opacity for this area type if not set
            if (area.materialOpacity === undefined) {
                area.materialOpacity = AREA_OPACITY_DEFAULTS[areaType] || 0.8;
            }
        }
    });

    // Update swatch active states
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.toggle('active', swatch.dataset.textureUrl === textureUrl);
    });

    // Redraw canvas
    drawCanvas();
}

// Clear all customized colors - revert everything to default
function clearAllColors() {
    // Clear all modified area types
    modifiedAreaTypes.clear();

    // Update all swatch active states
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.remove('active');
    });

    // Redraw canvas
    drawCanvas();
}

function setupColorCustomizationListeners() {
    const customizeBtn = document.getElementById('customize-colors-btn');
    const panel = document.getElementById('color-customize-panel');
    const closeBtn = document.getElementById('color-panel-close');
    const clearAllBtn = document.getElementById('clear-all-colors-btn');

    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            if (panel) {
                panel.classList.toggle('hidden');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (panel) {
                panel.classList.add('hidden');
            }
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            clearAllColors();
        });
    }
}

function showColorCustomizePanel() {
    const panel = document.getElementById('color-customize-panel');
    if (panel) {
        panel.classList.remove('hidden');
    }
}

function hideColorCustomizePanel() {
    const panel = document.getElementById('color-customize-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

// ============= INTERACTIVE HOTSPOTS FOR COLOR CUSTOMIZATION =============
let hotspotsVisible = true;
let activeHotspotPicker = null;

function initHotspots() {
    // Check if we have customizable areas
    if (!colorCustomizableAreas || colorCustomizableAreas.length === 0) {
        console.log('No customizable areas for hotspots');
        return;
    }

    // Hide the "Customize Colors" button since we're using hotspots now
    const customizeBtn = document.getElementById('customize-colors-btn');
    if (customizeBtn) {
        customizeBtn.style.display = 'none';
    }

    // Build hotspots for each unique area type
    buildAreaHotspots();

    // Show first-time coach mark if user hasn't seen it
    showCoachMarkIfNeeded();

    // Listen for window resize to reposition hotspots
    window.addEventListener('resize', debounce(repositionHotspots, 200));
}

function buildAreaHotspots() {
    const container = document.getElementById('hotspots-container');
    if (!container) return;

    container.innerHTML = '';

    // Check if preset has custom hotspot positions
    const customPositions = projectData?.hotspotPositions || {};

    // Get unique area types from customizable areas
    const areaTypes = [...new Set(colorCustomizableAreas.map(a => a.areaType))];

    areaTypes.forEach(areaType => {
        let center;

        // Use custom position from preset if available
        if (customPositions[areaType]) {
            const customPos = customPositions[areaType];
            const canvasEl = document.getElementById('main-canvas');
            const displayWidth = canvasEl?.offsetWidth || canvasEl?.width || 1600;
            const displayHeight = canvasEl?.offsetHeight || canvasEl?.height || 960;
            const scaleX = displayWidth / (canvasEl?.width || 1600);
            const scaleY = displayHeight / (canvasEl?.height || 960);

            center = {
                x: customPos.x * scaleX,
                y: customPos.y * scaleY,
                canvasX: customPos.x,
                canvasY: customPos.y
            };
        } else {
            // Calculate center from area polygons
            const areasOfType = colorCustomizableAreas.filter(a => a.areaType === areaType);
            center = calculateAreaTypeCenter(areasOfType);
        }

        if (center) {
            createHotspot(areaType, center, container);
        }
    });
}

function calculateAreaTypeCenter(areas) {
    // Calculate the centroid of all areas of this type combined
    let totalX = 0;
    let totalY = 0;
    let pointCount = 0;

    areas.forEach(area => {
        if (area.points && area.points.length > 0) {
            area.points.forEach(pt => {
                totalX += pt.x;
                totalY += pt.y;
                pointCount++;
            });
        }
    });

    if (pointCount === 0) return null;

    // Get the centroid in canvas coordinates
    const canvasCenterX = totalX / pointCount;
    const canvasCenterY = totalY / pointCount;

    // Convert to percentage of canvas for responsive positioning
    const canvasEl = document.getElementById('main-canvas');
    if (!canvasEl) return null;

    // Use actual display dimensions for positioning
    const displayWidth = canvasEl.offsetWidth || canvasEl.width;
    const displayHeight = canvasEl.offsetHeight || canvasEl.height;

    // Scale from canvas coordinates to display coordinates
    const scaleX = displayWidth / canvasEl.width;
    const scaleY = displayHeight / canvasEl.height;

    return {
        x: canvasCenterX * scaleX,
        y: canvasCenterY * scaleY,
        canvasX: canvasCenterX,
        canvasY: canvasCenterY
    };
}

function createHotspot(areaType, position, container) {
    const hotspot = document.createElement('div');
    hotspot.className = 'area-hotspot';
    hotspot.dataset.areaType = areaType;
    hotspot.style.left = `${position.x}px`;
    hotspot.style.top = `${position.y}px`;

    // Store canvas coordinates for repositioning
    hotspot.dataset.canvasX = position.canvasX;
    hotspot.dataset.canvasY = position.canvasY;

    hotspot.innerHTML = `
        <div class="hotspot-pulse"></div>
        <div class="hotspot-inner"></div>
        <div class="hotspot-label">${formatAreaType(areaType)}</div>
    `;

    hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        openHotspotColorPicker(areaType, hotspot);
    });

    container.appendChild(hotspot);
}

function repositionHotspots() {
    const container = document.getElementById('hotspots-container');
    const canvasEl = document.getElementById('main-canvas');
    if (!container || !canvasEl) return;

    const displayWidth = canvasEl.offsetWidth || canvasEl.width;
    const displayHeight = canvasEl.offsetHeight || canvasEl.height;
    const scaleX = displayWidth / canvasEl.width;
    const scaleY = displayHeight / canvasEl.height;

    container.querySelectorAll('.area-hotspot').forEach(hotspot => {
        const canvasX = parseFloat(hotspot.dataset.canvasX);
        const canvasY = parseFloat(hotspot.dataset.canvasY);

        hotspot.style.left = `${canvasX * scaleX}px`;
        hotspot.style.top = `${canvasY * scaleY}px`;
    });

    // Also reposition active picker if open
    if (activeHotspotPicker) {
        const areaType = activeHotspotPicker.dataset.areaType;
        const hotspot = container.querySelector(`[data-area-type="${areaType}"]`);
        if (hotspot) {
            positionPickerNearHotspot(activeHotspotPicker, hotspot);
        }
    }
}

function openHotspotColorPicker(areaType, hotspot) {
    // Close any existing picker
    closeHotspotPicker();

    // Dismiss coach mark if showing
    dismissCoachMark();

    const isTexture = isTextureAreaType(areaType);
    const isProductCatalog = isProductCatalogAreaType(areaType);

    // For product catalogs (sills, accents), open the full modal instead of small picker
    if (isProductCatalog) {
        openProductCatalogModal(areaType);
        return;
    }

    // Find current selection
    const currentArea = colorCustomizableAreas.find(a => a.areaType === areaType);
    const currentValue = isTexture ? currentArea?.textureUrl : currentArea?.fillColor;
    const isModified = modifiedAreaTypes.has(areaType);

    // Create picker element
    const picker = document.createElement('div');
    picker.className = 'hotspot-color-picker';
    picker.dataset.areaType = areaType;

    let swatchesHTML = '';

    if (false) {
        // Product catalog code moved to openProductCatalogModal - this block is now unused
        const catalog = getProductCatalog(areaType);
        picker.classList.add('product-catalog-picker');
        swatchesHTML = `<div class="hotspot-product-grid">`;
        catalog.forEach(product => {
            const activeClass = isModified && currentValue === product.url ? 'active' : '';
            swatchesHTML += `
                <div class="hotspot-product-item ${activeClass}"
                     data-url="${product.url}"
                     data-name="${product.name}"
                     data-sku="${product.sku}"
                     data-price="${product.price}"
                     data-color="${product.color || ''}"
                     title="${product.name} - ${product.price}">
                    <div class="product-thumb" style="background-color: ${product.color || '#ccc'}"></div>
                    <div class="product-info">
                        <span class="product-name">${product.name}</span>
                        <span class="product-price">${product.price}</span>
                    </div>
                </div>
            `;
        });
        swatchesHTML += `</div>`;
        swatchesHTML += `<div class="product-catalog-footer">
            <a href="https://aclmasonry.com/request-a-quote/" target="_blank" class="request-quote-link">Request Quote for Selected</a>
        </div>`;
    } else if (isTexture) {
        const options = PRESET_TEXTURES[areaType] || [];
        // Check if we also have colors for this type (like siding has both textures and colors)
        const colorOptions = PRESET_COLORS[areaType];

        if (colorOptions && colorOptions.length > 0) {
            // Siding: show both colors and textures in tabs
            swatchesHTML = `
                <div class="picker-tabs">
                    <button class="picker-tab active" data-tab="colors">Colors</button>
                    <button class="picker-tab" data-tab="textures">Textures</button>
                </div>
                <div class="picker-tab-content active" data-content="colors">
                    <div class="hotspot-color-grid">`;
            colorOptions.forEach(opt => {
                const activeClass = isModified && currentValue?.toLowerCase() === opt.color.toLowerCase() ? 'active' : '';
                swatchesHTML += `
                    <div class="hotspot-color-swatch ${activeClass}"
                         data-color="${opt.color}"
                         title="${opt.name}"
                         style="background-color: ${opt.color}">
                    </div>
                `;
            });
            swatchesHTML += `</div></div>
                <div class="picker-tab-content" data-content="textures">
                    <div class="hotspot-texture-grid">`;
            options.forEach(opt => {
                // For siding textures, check if color matches current value (since we use color fallback)
                const activeClass = isModified && (currentValue === opt.url || currentValue === opt.color) ? 'active' : '';
                const hasRealImage = opt.hasImage && opt.url;
                swatchesHTML += `
                    <div class="hotspot-texture-swatch ${activeClass}"
                         data-url="${opt.url || ''}"
                         data-name="${opt.name}"
                         data-color="${opt.color || ''}"
                         data-type="${opt.type || ''}"
                         data-has-image="${hasRealImage ? 'true' : 'false'}"
                         title="${opt.name}"
                         style="background-color: ${opt.color || '#ccc'}">
                        <span class="texture-type-label">${opt.type || ''}</span>
                    </div>
                `;
            });
            swatchesHTML += `</div></div>`;
        } else {
            // Regular texture picker (mantle, hearth)
            swatchesHTML = `<div class="hotspot-texture-grid">`;
            options.forEach(opt => {
                const activeClass = isModified && currentValue === opt.url ? 'active' : '';
                swatchesHTML += `
                    <div class="hotspot-texture-swatch ${activeClass}"
                         data-url="${opt.url}"
                         data-name="${opt.name}"
                         title="${opt.name}"
                         style="background-image: url('${opt.url}')">
                    </div>
                `;
            });
            swatchesHTML += `</div>`;
        }
    } else {
        const options = PRESET_COLORS[areaType] || PRESET_COLORS.siding;
        swatchesHTML = `<div class="hotspot-color-grid">`;
        options.forEach(opt => {
            const activeClass = isModified && currentValue?.toLowerCase() === opt.color.toLowerCase() ? 'active' : '';
            swatchesHTML += `
                <div class="hotspot-color-swatch ${activeClass}"
                     data-color="${opt.color}"
                     title="${opt.name}"
                     style="background-color: ${opt.color}">
                </div>
            `;
        });
        swatchesHTML += `</div>`;
    }

    const pickerTitle = isProductCatalog
        ? `Browse ${formatAreaType(areaType)}`
        : formatAreaType(areaType);

    picker.innerHTML = `
        <div class="hotspot-picker-header">
            <span class="hotspot-picker-title">${pickerTitle}</span>
            <button class="hotspot-picker-close">&times;</button>
        </div>
        ${swatchesHTML}
        <button class="hotspot-clear-btn">Clear ${formatAreaType(areaType)}</button>
    `;

    // Add event listeners
    picker.querySelector('.hotspot-picker-close').addEventListener('click', closeHotspotPicker);
    picker.querySelector('.hotspot-clear-btn').addEventListener('click', () => {
        clearAreaTypeColor(areaType);
        closeHotspotPicker();
    });

    // Tab switching for siding
    picker.querySelectorAll('.picker-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            picker.querySelectorAll('.picker-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
            picker.querySelectorAll('.picker-tab-content').forEach(c => c.classList.toggle('active', c.dataset.content === tabName));
        });
    });

    // Product catalog items
    if (isProductCatalog) {
        picker.querySelectorAll('.hotspot-product-item').forEach(item => {
            item.addEventListener('click', () => {
                const color = item.dataset.color;
                if (color) {
                    applyColorToArea(areaType, color);
                    picker.querySelectorAll('.hotspot-product-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });
    } else if (isTexture) {
        picker.querySelectorAll('.hotspot-texture-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                // Check if this texture has a real image or just uses color fallback
                const hasRealImage = swatch.dataset.hasImage === 'true';
                const color = swatch.dataset.color;
                const url = swatch.dataset.url;

                if (hasRealImage && url) {
                    // Use actual texture image
                    applyTextureToArea(areaType, url, swatch.dataset.name);
                    updatePickerSelection(picker, url, 'url');
                } else if (color) {
                    // Fall back to color (for siding textures without real images)
                    applyColorToArea(areaType, color);
                    updatePickerSelection(picker, color, 'color');
                }

                // Update active state for all texture swatches
                picker.querySelectorAll('.hotspot-texture-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            });
        });
        // Also handle colors in tabbed interface
        picker.querySelectorAll('.picker-tab-content[data-content="colors"] .hotspot-color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                applyColorToArea(areaType, swatch.dataset.color);
                updatePickerSelection(picker, swatch.dataset.color, 'color');
                // Also remove active from texture tab swatches when picking a color
                picker.querySelectorAll('.hotspot-texture-swatch').forEach(s => s.classList.remove('active'));
            });
        });
    }

    if (!isTexture && !isProductCatalog) {
        picker.querySelectorAll('.hotspot-color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                applyColorToArea(areaType, swatch.dataset.color);
                updatePickerSelection(picker, swatch.dataset.color, 'color');
            });
        });
    }

    // Add to DOM and position
    const container = document.getElementById('canvas-container');
    container.appendChild(picker);
    positionPickerNearHotspot(picker, hotspot);

    activeHotspotPicker = picker;

    // Close picker when clicking outside
    setTimeout(() => {
        document.addEventListener('click', handleOutsidePickerClick);
    }, 10);
}

function positionPickerNearHotspot(picker, hotspot) {
    const container = document.getElementById('canvas-container');
    const containerRect = container.getBoundingClientRect();
    const hotspotRect = hotspot.getBoundingClientRect();
    const pickerWidth = picker.offsetWidth || 250;
    const pickerHeight = picker.offsetHeight || 300;

    // Calculate position relative to container
    let left = hotspotRect.left - containerRect.left + hotspotRect.width / 2 - pickerWidth / 2;
    let top = hotspotRect.bottom - containerRect.top + 12;

    // Keep picker within container bounds
    if (left < 10) left = 10;
    if (left + pickerWidth > containerRect.width - 10) {
        left = containerRect.width - pickerWidth - 10;
    }

    // If picker would go below canvas, position above hotspot
    if (top + pickerHeight > containerRect.height - 10) {
        top = hotspotRect.top - containerRect.top - pickerHeight - 12;
    }

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
}

function updatePickerSelection(picker, value, type) {
    const selector = type === 'url' ? '.hotspot-texture-swatch' : '.hotspot-color-swatch';
    const dataAttr = type === 'url' ? 'url' : 'color';

    picker.querySelectorAll(selector).forEach(swatch => {
        const swatchValue = swatch.dataset[dataAttr];
        const matches = type === 'color'
            ? swatchValue.toLowerCase() === value.toLowerCase()
            : swatchValue === value;
        swatch.classList.toggle('active', matches);
    });
}

function closeHotspotPicker() {
    if (activeHotspotPicker) {
        activeHotspotPicker.remove();
        activeHotspotPicker = null;
    }
    document.removeEventListener('click', handleOutsidePickerClick);
}

function handleOutsidePickerClick(e) {
    if (activeHotspotPicker && !activeHotspotPicker.contains(e.target) && !e.target.closest('.area-hotspot')) {
        closeHotspotPicker();
    }
}

function clearAreaTypeColor(areaType) {
    // Remove from modified set
    modifiedAreaTypes.delete(areaType);

    // Redraw canvas
    drawCanvas();
}

// ============= PRODUCT CATALOG MODAL (Sills, Accents) =============
let currentCatalogAreaType = null;
let currentCatalogProduct = null;

function openProductCatalogModal(areaType) {
    const modal = document.getElementById('product-catalog-modal');
    if (!modal) return;

    currentCatalogAreaType = areaType;
    const catalog = getProductCatalog(areaType);
    if (!catalog || catalog.length === 0) return;

    // Find current selection if any
    const currentArea = colorCustomizableAreas.find(a => a.areaType === areaType);
    const currentUrl = currentArea?.textureUrl;
    const currentColor = currentArea?.fillColor;

    // Find currently selected product or default to first
    let selectedProduct = catalog[0];

    // Try to match by URL first (for ACCENT_MATERIALS products)
    if (currentUrl) {
        const matchingProduct = catalog.find(p => p.url === currentUrl);
        if (matchingProduct) selectedProduct = matchingProduct;
    } else if (currentColor) {
        // Fall back to color matching for legacy products
        const matchingProduct = catalog.find(p => p.color && p.color.toLowerCase() === currentColor.toLowerCase());
        if (matchingProduct) selectedProduct = matchingProduct;
    }

    // Render the color variants (circles)
    renderCatalogColorVariants(catalog, selectedProduct);

    // Show selected product details
    updateCatalogModalProduct(selectedProduct);

    // Show modal
    modal.classList.remove('hidden');

    // Add event listeners
    setupCatalogModalListeners();
}

function renderCatalogColorVariants(catalog, selectedProduct) {
    const container = document.getElementById('catalog-color-variants');
    if (!container) return;

    container.innerHTML = '';

    catalog.forEach(product => {
        const variant = document.createElement('div');
        variant.className = 'catalog-color-variant';
        if (product === selectedProduct) variant.classList.add('active');

        // Check if product has an image URL (from ACCENT_MATERIALS)
        if (product.url && !product.url.includes('coming-soon')) {
            variant.style.backgroundImage = `url('${product.url}')`;
            variant.style.backgroundSize = 'cover';
            variant.style.backgroundPosition = 'center';
        } else if (product.color && product.color.startsWith('#')) {
            // Legacy: Use hex color as background
            variant.style.backgroundColor = product.color;
        } else {
            // Default placeholder
            variant.style.backgroundColor = '#ccc';
        }

        variant.title = product.name + (product.variant ? ` - ${product.variant}` : '');
        variant.dataset.productIndex = catalog.indexOf(product);

        variant.addEventListener('click', () => {
            // Update active state
            container.querySelectorAll('.catalog-color-variant').forEach(v => v.classList.remove('active'));
            variant.classList.add('active');

            // Update product details
            updateCatalogModalProduct(product);
        });

        container.appendChild(variant);
    });
}

function updateCatalogModalProduct(product) {
    currentCatalogProduct = product;

    const modal = document.getElementById('product-catalog-modal');
    if (!modal) return;

    // Check if this is an ACCENT_MATERIALS product (has profile/variant/size)
    const isAccentMaterial = product.profile || product.variant || product.size;

    // Update type label
    const typeLabel = document.getElementById('catalog-type-label');
    if (typeLabel) {
        if (isAccentMaterial && product.profile) {
            // Format profile name (e.g., 'wainscot-sill' -> 'WAINSCOT SILL')
            typeLabel.textContent = product.profile.replace(/-/g, ' ').toUpperCase();
        } else {
            typeLabel.textContent = currentCatalogAreaType === 'sills' ? 'WINDOW SILL' :
                                     currentCatalogAreaType === 'accents' ? 'ACCENT' :
                                     currentCatalogAreaType.toUpperCase();
        }
    }

    // Update product preview
    const preview = document.getElementById('catalog-modal-image');
    if (preview) {
        if (product.url && !product.url.includes('coming-soon')) {
            // Use actual product image
            preview.style.backgroundImage = `url('${product.url}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.backgroundColor = 'transparent';
        } else if (product.color && product.color.startsWith('#')) {
            preview.style.backgroundImage = 'none';
            preview.style.backgroundColor = product.color;
        } else {
            preview.style.backgroundImage = 'none';
            preview.style.backgroundColor = '#ccc';
        }
    }

    // Update title
    const titleEl = document.getElementById('catalog-product-title');
    if (titleEl) {
        if (isAccentMaterial) {
            // Use variant as title (e.g., "Split Edge", "Chiseled Edge")
            titleEl.textContent = product.variant || formatProfile(product.profile);
        } else {
            const nameParts = product.name.split(' - ');
            titleEl.textContent = nameParts[0];
        }
    }

    // Update color name
    const colorNameEl = document.getElementById('catalog-color-name');
    if (colorNameEl) {
        if (isAccentMaterial) {
            colorNameEl.textContent = product.name;
        } else {
            const nameParts = product.name.split(' - ');
            colorNameEl.textContent = nameParts[1] || 'Standard';
        }
    }

    // Update specs - handle both old and new product structures
    const manufacturerEl = document.getElementById('catalog-manufacturer');
    const skuEl = document.getElementById('catalog-sku');
    const priceEl = document.getElementById('catalog-price');

    if (manufacturerEl) {
        manufacturerEl.textContent = formatManufacturer(product.manufacturer) || product.manufacturer || '-';
    }

    if (skuEl) {
        // For ACCENT_MATERIALS, show size instead of SKU
        skuEl.textContent = product.size || product.sku || '-';
    }

    if (priceEl) {
        if (product.unitPrice) {
            const priceText = `$${product.unitPrice.toFixed(2)}/${product.soldBy || 'each'}`;
            priceEl.textContent = priceText;
        } else {
            priceEl.textContent = product.price || '-';
        }
    }

    // Update label for SKU field if showing size
    const skuLabel = document.querySelector('#product-catalog-modal .catalog-spec-row:nth-child(2) .catalog-spec-label');
    if (skuLabel) {
        skuLabel.textContent = isAccentMaterial ? 'Size:' : 'SKU:';
    }

    // Show stock status for ACCENT_MATERIALS
    const categoryRow = document.getElementById('catalog-category-row');
    const categoryEl = document.getElementById('catalog-category');
    if (categoryRow && categoryEl) {
        if (isAccentMaterial) {
            categoryRow.style.display = 'flex';
            const stockText = product.stocked ? 'In Stock' : (product.comingSoon ? 'Coming Soon' : 'Special Order');
            categoryEl.textContent = stockText;
            // Update label
            const catLabel = categoryRow.querySelector('.catalog-spec-label');
            if (catLabel) catLabel.textContent = 'Availability:';
        } else if (product.category) {
            categoryRow.style.display = 'flex';
            categoryEl.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
            const catLabel = categoryRow.querySelector('.catalog-spec-label');
            if (catLabel) catLabel.textContent = 'Category:';
        } else {
            categoryRow.style.display = 'none';
        }
    }
}

function setupCatalogModalListeners() {
    const modal = document.getElementById('product-catalog-modal');
    if (!modal) return;

    // Close button
    const closeBtn = document.getElementById('catalog-modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeProductCatalogModal;
    }

    // Apply button
    const applyBtn = document.getElementById('catalog-apply-btn');
    if (applyBtn) {
        applyBtn.onclick = () => {
            if (currentCatalogProduct && currentCatalogAreaType) {
                // Check if product has a texture URL (ACCENT_MATERIALS)
                if (currentCatalogProduct.url && !currentCatalogProduct.url.includes('coming-soon')) {
                    // Apply as texture
                    applyTextureToArea(currentCatalogAreaType, currentCatalogProduct.url, currentCatalogProduct.name);
                } else if (currentCatalogProduct.color && currentCatalogProduct.color.startsWith('#')) {
                    // Apply as color (legacy products)
                    applyColorToArea(currentCatalogAreaType, currentCatalogProduct.color);
                }
                closeProductCatalogModal();
            }
        };
    }

    // Click outside to close
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeProductCatalogModal();
        }
    };

    // Escape key to close
    document.addEventListener('keydown', handleCatalogModalEscape);
}

function handleCatalogModalEscape(e) {
    if (e.key === 'Escape') {
        closeProductCatalogModal();
    }
}

function closeProductCatalogModal() {
    const modal = document.getElementById('product-catalog-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentCatalogAreaType = null;
    currentCatalogProduct = null;
    document.removeEventListener('keydown', handleCatalogModalEscape);
}

// ============= FIRST-TIME COACH MARK =============
const COACH_MARK_STORAGE_KEY = 'visualizer_hotspot_coach_seen';

function showCoachMarkIfNeeded() {
    // Check if user has seen the coach mark before
    if (localStorage.getItem(COACH_MARK_STORAGE_KEY)) {
        return;
    }

    // Wait a moment for hotspots to render
    setTimeout(() => {
        showCoachMark();
    }, 800);
}

function showCoachMark() {
    const container = document.getElementById('canvas-container');
    const firstHotspot = document.querySelector('.area-hotspot');

    if (!container || !firstHotspot) return;

    const coachMark = document.createElement('div');
    coachMark.className = 'coach-mark';
    coachMark.id = 'hotspot-coach-mark';

    coachMark.innerHTML = `
        <button class="coach-mark-dismiss">&times;</button>
        <div class="coach-mark-content">
            <span class="coach-mark-icon">🎨</span>
            <div class="coach-mark-text">
                <strong>Tip: Customize Your Home!</strong>
                Click the small circles to change colors for siding, roof, trim, and more. Try it out!
            </div>
        </div>
    `;

    container.appendChild(coachMark);

    // Position near the first hotspot
    const hotspotRect = firstHotspot.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    let left = hotspotRect.left - containerRect.left + hotspotRect.width / 2 - 120;
    let top = hotspotRect.bottom - containerRect.top + 16;

    // Keep within bounds
    if (left < 10) left = 10;
    if (left + 240 > containerRect.width - 10) left = containerRect.width - 250;

    // If too low, put above
    if (top + 100 > containerRect.height - 10) {
        top = hotspotRect.top - containerRect.top - 90;
        coachMark.classList.add('bottom');
    }

    coachMark.style.left = `${left}px`;
    coachMark.style.top = `${top}px`;

    // Dismiss handlers
    coachMark.querySelector('.coach-mark-dismiss').addEventListener('click', dismissCoachMark);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (document.getElementById('hotspot-coach-mark')) {
            dismissCoachMark();
        }
    }, 8000);
}

function dismissCoachMark() {
    const coachMark = document.getElementById('hotspot-coach-mark');
    if (coachMark) {
        coachMark.style.opacity = '0';
        coachMark.style.transform = 'translateY(-10px)';
        coachMark.style.transition = 'all 0.3s ease-out';
        setTimeout(() => coachMark.remove(), 300);
    }

    // Mark as seen
    localStorage.setItem(COACH_MARK_STORAGE_KEY, 'true');
}

// Utility: debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update initColorCustomization to also init hotspots
const originalInitColorCustomization = initColorCustomization;
initColorCustomization = function() {
    originalInitColorCustomization();
    // Initialize hotspots after color customization is set up
    initHotspots();
};

// ============= INLINE BROWSE SECTION =============
// Variables for inline browse filters
let inlineActiveCategory = 'all';
let inlineActiveStyle = 'all';
let inlineActiveManufacturer = 'all';
let inlineActiveColor = 'all';
let inlineActiveAccessory = 'all';
let inlineActiveAvailability = 'all';
let inlineSearchTerm = '';
let inlineActiveQuickFilter = 'all'; // For filter pills: all, top-seller, acl-favorite, trending, in-stock

// Selection system variables
const MAX_INLINE_SELECTION = 10;
let inlineSelectedMaterials = [];
let currentPopupMaterial = null;
let currentPopupVariants = [];
// Preview mode state for similar products
let originalPopupMaterial = null;
let originalPopupVariants = [];
let isPreviewingSimilar = false;

// Real implementation of mobile selected strip update
updateMobileSelectedStrip = function() {
    const strip = document.getElementById('mobile-selected-strip');
    const itemsContainer = document.getElementById('selected-strip-items');
    const countEl = document.getElementById('strip-count');
    const mobileBadge = document.getElementById('mobile-material-badge');

    console.log('[MobileStrip] Updating... savedMaterials:', savedMaterials.length, 'inlineSelected:', inlineSelectedMaterials.length);

    if (!strip || !itemsContainer) {
        console.log('[MobileStrip] Missing elements - strip:', !!strip, 'items:', !!itemsContainer);
        return;
    }

    // Combine all selected materials (remove duplicates by URL)
    const allSelected = [...new Map([...savedMaterials, ...inlineSelectedMaterials].map(m => [m.url, m])).values()];
    console.log('[MobileStrip] allSelected count:', allSelected.length);

    // Update count
    if (countEl) {
        countEl.textContent = allSelected.length;
    }

    // Always update the badge - use first available material
    const displayMaterial = allSelected[0] || null;
    console.log('[MobileStrip] displayMaterial:', displayMaterial?.name || 'none');

    if (mobileBadge) {
        if (displayMaterial && displayMaterial.url) {
            mobileBadge.classList.add('has-material');
            mobileBadge.innerHTML = `
                <img src="${displayMaterial.url}" alt="${displayMaterial.name || 'Stone'}" onerror="this.style.display='none'">
                <div class="badge-text">
                    <span class="badge-name">${displayMaterial.name || 'Selected Stone'}</span>
                    <span class="badge-color">${displayMaterial.color || displayMaterial.profile || ''}</span>
                </div>
            `;
            mobileBadge._material = displayMaterial;
            console.log('[MobileStrip] Badge updated with:', displayMaterial.name);
        } else {
            mobileBadge.classList.remove('has-material');
            mobileBadge.innerHTML = '<span class="badge-empty-text">Tap a stone below</span>';
            mobileBadge._material = null;
            console.log('[MobileStrip] Badge cleared - no material');
        }
    }

    // Show/hide strip based on selections
    if (allSelected.length === 0) {
        strip.classList.add('empty');
        itemsContainer.innerHTML = '<div class="strip-empty">Select materials below</div>';
        return;
    } else {
        strip.classList.remove('empty');
    }

    // Clear and rebuild items
    itemsContainer.innerHTML = '';

    // Get currently applied material URL
    const appliedMaterialUrl = displayMaterial?.url || null;

    // Add each selected material
    allSelected.forEach((material) => {
        const item = document.createElement('div');
        item.className = 'strip-item' + (material.url === appliedMaterialUrl ? ' active' : '');
        item.innerHTML = `
            <img src="${material.url}" alt="${material.name}">
            <div class="strip-item-name">${material.name || 'Material'}</div>
        `;

        // Click to apply this material
        item.addEventListener('click', () => {
            applyMaterialToAllAreas(material);
            // Update active state
            itemsContainer.querySelectorAll('.strip-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            // Update active index in savedMaterials
            let idx = savedMaterials.findIndex(m => m.url === material.url);
            if (idx < 0) {
                // Add to savedMaterials if not there
                if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
                    savedMaterials.shift();
                }
                savedMaterials.push(material);
                idx = savedMaterials.length - 1;
            }
            activeMaterialIndex = idx;
            // Update mobile badge directly
            const badge = document.getElementById('mobile-material-badge');
            if (badge) {
                badge.classList.add('has-material');
                badge.innerHTML = `
                    <img src="${material.url}" alt="${material.name || 'Stone'}">
                    <div class="badge-text">
                        <span class="badge-name">${material.name || 'Selected Stone'}</span>
                        <span class="badge-color">${material.color || material.profile || ''}</span>
                    </div>
                `;
                badge._material = material;
            }
        });

        itemsContainer.appendChild(item);
    });
};

// Create sets for quick lookup of featured materials
const TOP_SELLER_URLS = new Set(TOP_SELLERS.map(m => m.url));
const ACL_FAVORITE_URLS = new Set(ARCHITECT_PICKS.map(m => m.url));
const BEST_VALUE_URLS = new Set(IN_STOCK.map(m => m.url));

function initInlineBrowse() {
    console.log('Initializing inline browse section...');

    // Initialize filter dropdowns
    updateInlineStyleOptions('all');
    updateInlineManufacturerOptions('all');

    // Setup inline browse event listeners
    setupInlineBrowseListeners();

    // Setup selection panel listeners
    setupSelectionPanelListeners();

    // Setup filter pill listeners
    setupFilterPillListeners();

    // Setup category button listeners
    setupCategoryButtonListeners();

    // Load all materials by default
    filterInlineProducts();
}

function setupFilterPillListeners() {
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const wasActive = this.classList.contains('active');

            // Toggle: if clicking active pill, show all materials
            if (wasActive) {
                inlineActiveQuickFilter = 'all';
                this.classList.remove('active');
            } else {
                inlineActiveQuickFilter = filter;
                // Update active state on pills
                document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                this.classList.add('active');
            }

            // Update results title
            const titleEl = document.getElementById('inline-results-title');
            if (titleEl) {
                if (inlineActiveQuickFilter === 'all') {
                    titleEl.textContent = "All Materials";
                } else {
                    switch(filter) {
                        case 'top-seller':
                            titleEl.textContent = "Top Sellers";
                            break;
                        case 'acl-favorite':
                            titleEl.textContent = "ACL's Choice";
                            break;
                        case 'best-value':
                            titleEl.textContent = "Best Value";
                            break;
                    }
                }
            }

            // Re-filter products
            filterInlineProducts();

            // Auto-scroll to results section
            const resultsSection = document.getElementById('inline-results-section');
            if (resultsSection) {
                setTimeout(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

function setupCategoryButtonListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            const wasActive = this.classList.contains('active');

            // Remove active state from all category buttons
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));

            // Hide accents subtabs by default
            const accentsSubtabs = document.getElementById('inline-accents-subtabs');
            if (accentsSubtabs) {
                accentsSubtabs.classList.add('hidden');
                document.querySelectorAll('#inline-accents-subtabs .accent-subtab').forEach(t => t.classList.remove('active'));
            }

            // Hide manufacturer tabs by default
            const manufacturerTabs = document.getElementById('inline-manufacturer-tabs');
            if (manufacturerTabs) {
                manufacturerTabs.classList.add('hidden');
            }

            if (wasActive) {
                // Clicking active button toggles off - show all
                inlineActiveCategory = 'all';
                inlineActiveManufacturer = 'all';
            } else {
                // Set new category
                this.classList.add('active');
                inlineActiveCategory = category;
                inlineActiveManufacturer = 'all';

                // Show accents subtabs if accents category is selected
                if (category === 'accents' && accentsSubtabs) {
                    accentsSubtabs.classList.remove('hidden');
                }

                // Show manufacturer tabs for stone or brick categories
                if ((category === 'stone' || category === 'thin-brick' || category === 'full-brick') && manufacturerTabs) {
                    populateManufacturerTabs(category);
                    manufacturerTabs.classList.remove('hidden');
                }
            }

            // Update style and manufacturer dropdowns for the new category
            updateInlineStyleOptions(inlineActiveCategory);
            updateInlineManufacturerOptions(inlineActiveCategory);

            // Update results title
            const titleEl = document.getElementById('inline-results-title');
            if (titleEl) {
                if (inlineActiveCategory === 'all') {
                    titleEl.textContent = "All Materials";
                } else {
                    const categoryNames = {
                        'stone': 'Manufactured Stone',
                        'thin-brick': 'Thin Brick',
                        'full-brick': 'Full Brick',
                        'accents': 'Accents'
                    };
                    titleEl.textContent = categoryNames[category] || "All Materials";
                }
            }

            // Re-filter products
            filterInlineProducts();

            // Auto-scroll to results section
            const resultsSection = document.getElementById('inline-results-section');
            if (resultsSection) {
                setTimeout(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });

    // Accent subtabs event listeners
    document.querySelectorAll('#inline-accents-subtabs .accent-subtab').forEach(tab => {
        tab.addEventListener('click', function() {
            const accentType = this.dataset.accentType;

            // Toggle active state
            document.querySelectorAll('#inline-accents-subtabs .accent-subtab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Set accessory filter and trigger filtering
            inlineActiveAccessory = accentType;
            filterInlineProducts();

            // Update title
            const titleEl = document.getElementById('inline-results-title');
            if (titleEl) {
                titleEl.textContent = formatAccessoryType(accentType);
            }

            // Auto-scroll to results section
            const resultsSection = document.getElementById('inline-results-section');
            if (resultsSection) {
                setTimeout(() => {
                    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

// Helper function to check if a material has a badge
function getMaterialBadges(material) {
    const badges = [];
    if (TOP_SELLER_URLS.has(material.url)) {
        badges.push({ type: 'top-seller', text: 'Hot' });
    }
    if (ACL_FAVORITE_URLS.has(material.url)) {
        badges.push({ type: 'acl-favorite', text: 'Favorite' });
    }
    if (BEST_VALUE_URLS.has(material.url)) {
        badges.push({ type: 'best-value', text: 'Value' });
    }
    return badges;
}

function applyInlineMaterial(material, cardElement) {
    // Add to saved materials if not already there
    const existingIndex = savedMaterials.findIndex(m => m.url === material.url);

    if (existingIndex === -1) {
        // Add to saved materials (limit to 5)
        if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
            savedMaterials.shift(); // Remove oldest
        }
        savedMaterials.push(material);
        activeMaterialIndex = savedMaterials.length - 1;
    } else {
        activeMaterialIndex = existingIndex;
    }

    // Apply to canvas
    applyMaterialToAllAreas(material);

    // Update UI
    updateQuickMaterialsStrip();
    updateMobileSelectedStrip(); // Update mobile strip with new selection

    // Update active state - clear all collection cards and inline product cards and highlight selected
    document.querySelectorAll('.collection-card, .inline-product-card').forEach(card => {
        card.classList.remove('active');
    });
    cardElement?.classList.add('active');

    // Show material info panel
    showMaterialInfoPanel(material);

    // Show compare controls
    const compareControls = document.getElementById('compare-controls');
    if (compareControls) {
        compareControls.style.display = 'flex';
    }

    // Scroll to canvas
    const canvasSection = document.querySelector('.canvas-section');
    if (canvasSection) {
        canvasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setupInlineBrowseListeners() {
    // Search input
    const searchInput = document.getElementById('inline-search-input');
    let searchScrollDebounceTimer = null;

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            inlineSearchTerm = this.value.toLowerCase();
            if (inlineSearchTerm.length > 0) {
                filterInlineProducts();
                showInlineResults('Search: "' + this.value + '"');

                // Debounced scroll - only scroll after user stops typing for 400ms
                clearTimeout(searchScrollDebounceTimer);
                searchScrollDebounceTimer = setTimeout(() => {
                    const resultsSection = document.getElementById('inline-results-section');
                    if (resultsSection) {
                        // Only scroll if results are not already visible
                        const rect = resultsSection.getBoundingClientRect();
                        if (rect.top > window.innerHeight || rect.bottom < 0) {
                            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }, 400);
            } else {
                clearTimeout(searchScrollDebounceTimer);
            }

            // Toggle clear button
            const clearBtn = document.getElementById('inline-clear-search-btn');
            if (clearBtn) {
                clearBtn.classList.toggle('hidden', !this.value);
            }
        });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById('inline-clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('inline-search-input');
            if (searchInput) searchInput.value = '';
            inlineSearchTerm = '';
            this.classList.add('hidden');
            filterInlineProducts();
        });
    }

    // Style filter dropdown
    const styleFilter = document.getElementById('inline-style-filter');
    if (styleFilter) {
        styleFilter.addEventListener('change', function() {
            inlineActiveStyle = this.value;
            filterInlineProducts();
        });
    }

    // Manufacturer filter dropdown
    const manufacturerFilter = document.getElementById('inline-manufacturer-filter');
    if (manufacturerFilter) {
        manufacturerFilter.addEventListener('change', function() {
            inlineActiveManufacturer = this.value;
            filterInlineProducts();
        });
    }

    // Color filter dropdown
    const colorFilter = document.getElementById('inline-color-filter');
    if (colorFilter) {
        colorFilter.addEventListener('change', function() {
            inlineActiveColor = this.value;
            filterInlineProducts();
        });
    }

    // Availability filter
    document.querySelectorAll('input[name="inline-availability"]').forEach(radio => {
        radio.addEventListener('change', function() {
            inlineActiveAvailability = this.value;
            filterInlineProducts();
        });
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('inline-clear-filters-btn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearInlineFilters);
    }

    // Clear results button
    const clearResultsBtn = document.getElementById('inline-clear-results-btn');
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', hideInlineResults);
    }

    // Browse by Style options (visual icons)
    document.querySelectorAll('.browse-filters-row .style-option').forEach(option => {
        option.addEventListener('click', function() {
            const style = this.dataset.style;
            const wasActive = this.classList.contains('active');

            // Clear all style options active state
            document.querySelectorAll('.browse-filters-row .style-option').forEach(o => o.classList.remove('active'));

            if (wasActive) {
                // Clicking active option toggles off
                inlineActiveStyle = 'all';
            } else {
                // Set new style
                this.classList.add('active');
                inlineActiveStyle = style;
            }

            // Sync with dropdown
            const styleSelect = document.getElementById('inline-style-filter');
            if (styleSelect) styleSelect.value = inlineActiveStyle;

            filterInlineProducts();
        });
    });

    // Browse by Color options (visual swatches)
    document.querySelectorAll('.browse-filters-row .color-option').forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            const wasActive = this.classList.contains('active');

            // Clear all color options active state
            document.querySelectorAll('.browse-filters-row .color-option').forEach(o => o.classList.remove('active'));

            if (wasActive) {
                // Clicking active option toggles off
                inlineActiveColor = 'all';
            } else {
                // Set new color
                this.classList.add('active');
                inlineActiveColor = color;
            }

            filterInlineProducts();
        });
    });

    // Manufacturer tabs - event listener delegated
    const manufacturerTabsContainer = document.getElementById('inline-manufacturer-tabs');
    if (manufacturerTabsContainer) {
        manufacturerTabsContainer.addEventListener('click', function(e) {
            const tab = e.target.closest('.manufacturer-tab');
            if (!tab) return;

            const manufacturer = tab.dataset.manufacturer;
            const wasActive = tab.classList.contains('active');

            // Clear all manufacturer tabs active state
            document.querySelectorAll('.manufacturer-tab').forEach(t => t.classList.remove('active'));

            if (wasActive) {
                // Toggle off - show all for category
                inlineActiveManufacturer = 'all';
            } else {
                // Set new manufacturer
                tab.classList.add('active');
                inlineActiveManufacturer = manufacturer;
            }

            // Sync with dropdown
            const mfrSelect = document.getElementById('inline-manufacturer-filter');
            if (mfrSelect) mfrSelect.value = inlineActiveManufacturer;

            filterInlineProducts();
        });
    }
}

function updateInlineStyleOptions(category) {
    const select = document.getElementById('inline-style-filter');
    if (!select) return;

    const materials = getMaterialsForCategory(category);
    const styles = [...new Set(materials.map(m => m.profile).filter(Boolean))].sort();

    select.innerHTML = '<option value="all">All Styles</option>';
    styles.forEach(style => {
        select.innerHTML += `<option value="${style}">${formatProfile(style)}</option>`;
    });
}

function updateInlineManufacturerOptions(category) {
    const select = document.getElementById('inline-manufacturer-filter');
    if (!select) return;

    const materials = getMaterialsForCategory(category);
    const manufacturers = [...new Set(materials.map(m => m.manufacturer).filter(Boolean))].sort();

    select.innerHTML = '<option value="all">All Manufacturers</option>';
    manufacturers.forEach(mfr => {
        select.innerHTML += `<option value="${mfr}">${formatManufacturer(mfr)}</option>`;
    });
}

function populateManufacturerTabs(category) {
    const container = document.querySelector('#inline-manufacturer-tabs .manufacturer-tabs-row');
    if (!container) return;

    const materials = getMaterialsForCategory(category);
    const manufacturers = [...new Set(materials.map(m => m.manufacturer).filter(Boolean))].sort();

    // Add "All" tab first
    let tabsHTML = `<button class="manufacturer-tab active" data-manufacturer="all">All ${getCategoryDisplayName(category)}</button>`;

    // Add tab for each manufacturer
    manufacturers.forEach(mfr => {
        tabsHTML += `<button class="manufacturer-tab" data-manufacturer="${mfr}">${formatManufacturer(mfr)}</button>`;
    });

    container.innerHTML = tabsHTML;
}

function getCategoryDisplayName(category) {
    const names = {
        'stone': 'Stone',
        'thin-brick': 'Thin Brick',
        'full-brick': 'Full Brick',
        'accents': 'Accents'
    };
    return names[category] || 'Materials';
}

function filterInlineProducts() {
    const materials = getMaterialsForCategory(inlineActiveCategory);

    // Filter materials
    const filtered = materials.filter(material => {
        // Quick filter pills (Top Sellers, ACL's Choice, Best Value)
        if (inlineActiveQuickFilter !== 'all') {
            switch(inlineActiveQuickFilter) {
                case 'top-seller':
                    if (!TOP_SELLER_URLS.has(material.url)) return false;
                    break;
                case 'acl-favorite':
                    if (!ACL_FAVORITE_URLS.has(material.url)) return false;
                    break;
                case 'best-value':
                    if (!BEST_VALUE_URLS.has(material.url)) return false;
                    break;
                case 'in-stock':
                    if (!material.stocked) return false;
                    break;
            }
        }

        // Style filter
        if (inlineActiveStyle !== 'all') {
            // Check if material profile matches or is related to the style
            const profile = material.profile || '';
            if (!profile.toLowerCase().includes(inlineActiveStyle.toLowerCase()) &&
                profile !== inlineActiveStyle) return false;
        }

        // Manufacturer filter
        if (inlineActiveManufacturer !== 'all') {
            if (material.manufacturer !== inlineActiveManufacturer) return false;
        }

        // Color filter
        if (inlineActiveColor !== 'all') {
            if (!matchesColorFilter(material, inlineActiveColor)) return false;
        }

        // Accessory type filter
        if (inlineActiveAccessory !== 'all') {
            if (!matchesAccessoryType(material.profile, inlineActiveAccessory)) return false;
        }

        // Availability filter (from dropdown, not pill)
        if (inlineActiveAvailability === 'in-stock' && !material.stocked) {
            return false;
        }

        // Search filter
        if (inlineSearchTerm) {
            const searchFields = [
                material.name.toLowerCase(),
                (material.manufacturer || '').toLowerCase().replace(/-/g, ' '),
                (material.profile || '').toLowerCase().replace(/-/g, ' ')
            ].join(' ');
            if (!searchFields.includes(inlineSearchTerm)) return false;
        }

        return true;
    });

    renderInlineResults(filtered);
}

function renderInlineResults(materials) {
    const grid = document.getElementById('inline-results-grid');
    const countEl = document.getElementById('inline-results-count');

    if (!grid) return;

    // Update count
    if (countEl) {
        countEl.textContent = `${materials.length} product${materials.length !== 1 ? 's' : ''}`;
    }

    // Clear grid
    grid.innerHTML = '';

    // Group materials by profile and manufacturer for color variant display
    const grouped = groupByProfileAndManufacturer(materials);

    // Render products
    grouped.forEach(group => {
        const card = createInlineProductCard(group);
        grid.appendChild(card);
    });
}

function createInlineProductCard(group) {
    const card = document.createElement('div');
    const mainVariant = group.variants[0];

    card.className = 'product-card';
    card.dataset.url = mainVariant.url;

    const manufacturerDisplay = formatManufacturer(mainVariant.manufacturer);
    const profileDisplay = formatProfile(mainVariant.profile);
    const hasStockedVariant = group.variants.some(v => v.stocked);

    // Check if already selected
    const isSelected = inlineSelectedMaterials.some(m => m.url === mainVariant.url);
    if (isSelected) {
        card.classList.add('selected');
    }

    // Get badges for this product
    const badges = getMaterialBadges(mainVariant);
    let badgesHTML = '';
    if (badges.length > 0) {
        badgesHTML = '<div class="product-badges">';
        badges.forEach(badge => {
            badgesHTML += `<span class="product-badge ${badge.type}">${badge.text}</span>`;
        });
        badgesHTML += '</div>';
    }

    // Stock badge (shown on right side)
    const stockBadgeHTML = hasStockedVariant ? `<span class="stock-badge">In Stock</span>` : '';

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${mainVariant.url}" alt="${mainVariant.name}" loading="lazy" class="product-image">
            ${badgesHTML}
            ${stockBadgeHTML}
            <button class="select-checkbox" title="Add to selection">&#10003;</button>
        </div>
        <div class="product-info">
            <div class="product-profile">${profileDisplay}</div>
            <div class="product-name">${mainVariant.name}</div>
            <div class="product-manufacturer">${manufacturerDisplay}</div>
            ${group.variants.length > 1 ? createInlineColorVariantsHTML(group.variants) : ''}
        </div>
    `;

    // Store variants on the card for later use
    card._variants = group.variants;
    card._currentIndex = 0;

    // Add click handler for selection checkbox
    const checkbox = card.querySelector('.select-checkbox');
    if (checkbox) {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentVariant = group.variants[card._currentIndex || 0];
            toggleInlineSelection(currentVariant, card);
        });
    }

    // Add click handlers for color variants
    if (group.variants.length > 1) {
        const variants = card.querySelectorAll('.color-variant');
        variants.forEach((variant, index) => {
            variant.addEventListener('click', (e) => {
                e.stopPropagation();
                card._currentIndex = index;
                switchInlineVariant(card, group.variants, index);
            });
        });

        // Add navigation arrow handlers
        const navButtons = card.querySelectorAll('.color-nav');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const direction = btn.dataset.direction;
                navigateInlineColorVariants(card, group.variants, direction);
            });
        });
    }

    // Main card click shows product detail popup
    card.addEventListener('click', () => {
        const currentVariant = group.variants[card._currentIndex || 0];
        showProductDetailPopup(currentVariant, group.variants);
    });

    return card;
}

function createInlineColorVariantsHTML(variants) {
    const maxVisible = 4;

    let html = '<div class="color-variants-container">';
    html += '<div class="color-variants-wrapper">';
    html += '<div class="color-variants" data-offset="0">';

    variants.forEach((variant, index) => {
        const isHidden = index >= maxVisible;
        html += `
            <div class="color-variant ${index === 0 ? 'active' : ''} ${isHidden ? 'hidden' : ''}" data-index="${index}" title="${variant.name}">
                <img src="${variant.url}" alt="${variant.name}">
            </div>
        `;
    });

    html += '</div>';

    // Add navigation arrows if more than maxVisible variants
    if (variants.length > maxVisible) {
        html += `
            <button class="color-nav color-nav-left hidden" data-direction="left" title="Previous colors">
                <span>&#9664;</span>
            </button>
            <button class="color-nav color-nav-right" data-direction="right" title="More colors">
                <span>&#9654;</span>
            </button>
        `;
    }

    html += '</div></div>';
    return html;
}

function switchInlineVariant(card, variants, index) {
    const variant = variants[index];
    if (!variant) return;

    // Update card display
    const img = card.querySelector('.product-image');
    const name = card.querySelector('.product-name');

    if (img) img.src = variant.url;
    if (name) name.textContent = variant.name;

    card.dataset.url = variant.url;
    card._currentIndex = index;

    // Update active variant indicator
    card.querySelectorAll('.color-variant').forEach((v, i) => {
        v.classList.toggle('active', i === index);
    });

    // Update selection state based on new variant
    const isSelected = inlineSelectedMaterials.some(m => m.url === variant.url);
    card.classList.toggle('selected', isSelected);
}

function navigateInlineColorVariants(card, variants, direction) {
    const maxVisible = 4;
    const container = card.querySelector('.color-variants');
    const variantElements = card.querySelectorAll('.color-variant');
    const leftNav = card.querySelector('.color-nav-left');
    const rightNav = card.querySelector('.color-nav-right');

    if (!container) return;

    let offset = parseInt(container.dataset.offset) || 0;

    if (direction === 'right') {
        offset = Math.min(offset + 1, variants.length - maxVisible);
    } else {
        offset = Math.max(offset - 1, 0);
    }

    container.dataset.offset = offset;

    // Update visibility of variants
    variantElements.forEach((el, index) => {
        if (index >= offset && index < offset + maxVisible) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Update navigation button visibility
    if (leftNav) {
        leftNav.classList.toggle('hidden', offset === 0);
    }
    if (rightNav) {
        rightNav.classList.toggle('hidden', offset >= variants.length - maxVisible);
    }
}

// ============= SELECTION SYSTEM =============

function toggleInlineSelection(material, cardElement) {
    const existingIndex = inlineSelectedMaterials.findIndex(m => m.url === material.url);

    if (existingIndex >= 0) {
        // Remove from selection
        inlineSelectedMaterials.splice(existingIndex, 1);
        cardElement?.classList.remove('selected');
    } else {
        // Add to selection (max 10)
        if (inlineSelectedMaterials.length >= MAX_INLINE_SELECTION) {
            alert('Maximum 10 materials can be selected. Please remove some to add more.');
            return;
        }
        inlineSelectedMaterials.push(material);
        cardElement?.classList.add('selected');
    }

    updateInlineSelectedPanel();
    updateViewSelectedButton();
    updatePopupSelectButton(material);
    updateMobileSelectedStrip(); // Update mobile strip directly
}

function updateInlineSelectedPanel() {
    // Now uses unified panel
    updateUnifiedPanel();
}

// Legacy function - kept for compatibility but now unused
function updateInlineSelectedPanelLegacy() {
    const panel = document.getElementById('selected-panel');
    const itemsContainer = document.getElementById('selected-panel-items');
    const countEl = document.getElementById('panel-selected-count');
    const applyBtn = document.getElementById('apply-selected-btn');

    if (!panel || !itemsContainer) return;

    // Update count
    if (countEl) {
        countEl.textContent = inlineSelectedMaterials.length;
    }

    // Enable/disable apply button
    if (applyBtn) {
        applyBtn.disabled = inlineSelectedMaterials.length === 0;
    }

    // Show/hide panel
    if (inlineSelectedMaterials.length > 0) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }

    // Render items
    itemsContainer.innerHTML = '';
    inlineSelectedMaterials.forEach((material, index) => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `
            <img src="${material.url}" alt="${material.name}" class="selected-item-image">
            <div class="selected-item-info">
                <div class="selected-item-name">${material.name}</div>
                <div class="selected-item-manufacturer">${formatManufacturer(material.manufacturer)}</div>
            </div>
            <button class="selected-item-remove" data-index="${index}" title="Remove">&times;</button>
        `;

        // Add click handler to view this item
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('selected-item-remove')) {
                showProductDetailPopup(material, [material]);
            }
        });

        // Add remove handler
        const removeBtn = item.querySelector('.selected-item-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromInlineSelection(index);
            });
        }

        itemsContainer.appendChild(item);
    });
}

function removeFromInlineSelection(index) {
    const material = inlineSelectedMaterials[index];
    if (!material) return;

    inlineSelectedMaterials.splice(index, 1);

    // Update card selection state
    document.querySelectorAll('.browse-section-inline .product-card').forEach(card => {
        if (card.dataset.url === material.url) {
            card.classList.remove('selected');
        }
    });

    updateInlineSelectedPanel();
    updateViewSelectedButton();
}

function updateViewSelectedButton() {
    // Now uses unified panel - just trigger panel update
    updateUnifiedPanel();
}

function clearInlineSelection() {
    inlineSelectedMaterials = [];

    // Clear all card selection states
    document.querySelectorAll('.browse-section-inline .product-card').forEach(card => {
        card.classList.remove('selected');
    });

    updateInlineSelectedPanel();
    updateViewSelectedButton();
}

function applySelectedMaterials() {
    if (inlineSelectedMaterials.length === 0) return;

    // Apply first selected material to canvas
    const firstMaterial = inlineSelectedMaterials[0];
    applyInlineMaterial(firstMaterial, null);

    // Copy all to saved materials
    inlineSelectedMaterials.forEach(material => {
        const existingIndex = savedMaterials.findIndex(m => m.url === material.url);
        if (existingIndex === -1) {
            if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
                savedMaterials.shift();
            }
            savedMaterials.push(material);
        }
    });

    updateQuickMaterialsStrip();
    updateMobileSelectedStrip(); // Update mobile strip with selections

    // Scroll to canvas
    const canvasSection = document.querySelector('.canvas-section');
    if (canvasSection) {
        canvasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============= PRODUCT DETAIL POPUP =============

function showProductDetailPopup(material, variants) {
    const popup = document.getElementById('product-detail-popup');
    if (!popup) return;

    currentPopupMaterial = material;
    currentPopupVariants = variants || [material];

    // Get profile specs
    const specs = getProfileSpecs(material.profile);

    // Update popup content
    const image = document.getElementById('popup-image');
    const profile = document.getElementById('popup-profile');
    const colorName = document.getElementById('popup-color-name');
    const description = document.getElementById('popup-description');
    const selectedColor = document.getElementById('popup-selected-color');
    const variantsContainer = document.getElementById('popup-color-variants');

    // Dimension elements
    const flatsHeight = document.getElementById('popup-flats-height');
    const flatsLength = document.getElementById('popup-flats-length');
    const flatsThickness = document.getElementById('popup-flats-thickness');
    const cornerShort = document.getElementById('popup-corner-short');
    const cornerLong = document.getElementById('popup-corner-long');

    // Stock badge
    const stockBadge = document.getElementById('popup-stock-badge');
    const stock = document.getElementById('popup-stock');

    if (image) {
        image.src = material.url;
        image.alt = material.name;
    }
    if (profile) profile.textContent = formatProfile(material.profile).toUpperCase();
    if (colorName) colorName.textContent = material.name;
    if (description) description.textContent = specs.description;
    if (selectedColor) selectedColor.textContent = material.name;

    // Update dimensions
    if (flatsHeight) flatsHeight.textContent = specs.flatsHeight;
    if (flatsLength) flatsLength.textContent = specs.flatsLength;
    if (flatsThickness) flatsThickness.textContent = specs.flatsThickness;
    if (cornerShort) cornerShort.textContent = specs.cornerShort;
    if (cornerLong) cornerLong.textContent = specs.cornerLong;

    // Update stock badge
    if (stockBadge && stock) {
        stockBadge.className = 'popup-stock-badge';
        if (material.comingSoon) {
            stock.textContent = 'Coming Soon';
            stockBadge.classList.add('coming-soon');
        } else if (material.stocked) {
            stock.textContent = 'In Stock';
        } else {
            stock.textContent = 'Special Order';
            stockBadge.classList.add('special-order');
        }
    }

    // Render color variants
    if (variantsContainer) {
        if (currentPopupVariants.length > 1) {
            variantsContainer.innerHTML = currentPopupVariants.map((v, i) => `
                <div class="popup-color-variant ${v.url === material.url ? 'active' : ''}"
                     data-index="${i}"
                     title="${v.name}">
                    <img src="${v.url}" alt="${v.name}">
                    <span class="variant-name">${v.name}</span>
                </div>
            `).join('');

            // Add click handlers
            variantsContainer.querySelectorAll('.popup-color-variant').forEach(el => {
                el.addEventListener('click', () => {
                    const index = parseInt(el.dataset.index);
                    const variant = currentPopupVariants[index];
                    if (variant) {
                        showProductDetailPopup(variant, currentPopupVariants);
                    }
                });
            });
        } else {
            variantsContainer.innerHTML = '';
        }
    }

    // Populate similar products
    populatePopupSimilarProducts(material);

    // Update compare button state
    if (typeof updatePopupCompareButton === 'function') {
        updatePopupCompareButton(material);
    }

    // Show popup
    popup.classList.remove('hidden');

    // Setup popup event listeners
    setupPopupListeners();
}

function updatePopupSelectButton(material) {
    const btn = document.getElementById('popup-select-btn');
    if (!btn) return;

    const isSelected = inlineSelectedMaterials.some(m => m.url === material.url);

    if (isSelected) {
        btn.classList.add('selected');
        btn.innerHTML = '<span class="select-icon">&#10003;</span> Selected';
    } else {
        btn.classList.remove('selected');
        btn.innerHTML = '<span class="select-icon">+</span> Add to Selection';
    }
}

function closeProductDetailPopup() {
    const popup = document.getElementById('product-detail-popup');
    if (popup) {
        popup.classList.add('hidden');
    }
    currentPopupMaterial = null;
    currentPopupVariants = [];
    // Reset preview state
    originalPopupMaterial = null;
    originalPopupVariants = [];
    isPreviewingSimilar = false;
    // Remove preview indicator if exists
    const previewIndicator = document.querySelector('.preview-mode-indicator');
    if (previewIndicator) {
        previewIndicator.remove();
    }
}

// Find and display similar products in popup
function populatePopupSimilarProducts(material) {
    const container = document.getElementById('popup-similar-products');
    if (!container) return;

    // Get all materials from the global arrays
    const allMaterials = [
        ...STONE_MATERIALS.map(m => ({ ...m, category: 'stone' })),
        ...THIN_BRICK_MATERIALS.map(m => ({ ...m, category: 'thin-brick' })),
        ...FULL_BRICK_MATERIALS.map(m => ({ ...m, category: 'full-brick' })),
        ...(typeof ACCENT_MATERIALS !== 'undefined' ? ACCENT_MATERIALS.map(m => ({ ...m, category: 'accents' })) : [])
    ];

    // Find similar products - same category but different profile, or same color
    const similar = allMaterials.filter(m => {
        // Don't include the current material or its variants
        if (m.url === material.url) return false;
        if (m.profile === material.profile && m.manufacturer === material.manufacturer) return false;

        // Similar if same category
        if (m.category === material.category) return true;

        // Or similar if same color
        if (m.color === material.color) return true;

        return false;
    });

    // Shuffle and take first 6
    const shuffled = similar.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    if (selected.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; color: #888;">No similar products found</p>';
        return;
    }

    container.innerHTML = selected.map(m => `
        <div class="similar-product-card" data-material='${JSON.stringify(m).replace(/'/g, "&apos;")}'>
            <img class="similar-product-image" src="${m.url}" alt="${m.name}">
            <div class="similar-product-name">${m.name}</div>
        </div>
    `).join('');

    // Add click handlers - preview mode instead of full navigation
    container.querySelectorAll('.similar-product-card').forEach(card => {
        card.addEventListener('click', () => {
            const materialData = JSON.parse(card.dataset.material.replace(/&apos;/g, "'"));
            previewSimilarPopupProduct(materialData, card);
        });
    });
}

// Preview a similar product without leaving the original profile
function previewSimilarPopupProduct(material, clickedCard) {
    // Store original if not already previewing
    if (!isPreviewingSimilar) {
        originalPopupMaterial = currentPopupMaterial;
        originalPopupVariants = [...currentPopupVariants];
    }
    isPreviewingSimilar = true;

    // Update image only
    const popupImage = document.getElementById('popup-image');
    if (popupImage) {
        popupImage.src = material.url;
        popupImage.alt = material.name;
    }

    // Update title and color name to show previewing product
    const popupProfile = document.getElementById('popup-profile');
    if (popupProfile) {
        popupProfile.textContent = formatProfile(material.profile).toUpperCase();
    }

    const popupColorName = document.getElementById('popup-color-name');
    if (popupColorName) {
        popupColorName.textContent = material.name;
    }

    // Update description
    const specs = getProfileSpecs(material.profile);
    const popupDescription = document.getElementById('popup-description');
    if (popupDescription) {
        popupDescription.textContent = specs.description;
    }

    // Add preview indicator if not exists
    let previewIndicator = document.querySelector('.preview-mode-indicator');
    const popupLeft = document.querySelector('.popup-left');
    if (!previewIndicator && popupLeft) {
        previewIndicator = document.createElement('div');
        previewIndicator.className = 'preview-mode-indicator';
        previewIndicator.innerHTML = `Previewing similar product <span class="back-link">← Back to original</span>`;
        popupLeft.insertBefore(previewIndicator, popupLeft.firstChild);

        // Add click handler to go back
        previewIndicator.querySelector('.back-link').addEventListener('click', exitSimilarPopupPreview);
    }

    // Highlight the previewing card
    document.querySelectorAll('.similar-product-card').forEach(c => c.classList.remove('previewing'));
    if (clickedCard) {
        clickedCard.classList.add('previewing');
    }

    // Update current material for action buttons
    currentPopupMaterial = material;
}

// Exit preview mode and return to original product
function exitSimilarPopupPreview() {
    if (!originalPopupMaterial) return;

    isPreviewingSimilar = false;

    // Restore original content
    const material = originalPopupMaterial;
    currentPopupMaterial = material;
    currentPopupVariants = originalPopupVariants;

    // Update popup with original material
    const image = document.getElementById('popup-image');
    if (image) {
        image.src = material.url;
        image.alt = material.name;
    }

    const profile = document.getElementById('popup-profile');
    if (profile) profile.textContent = formatProfile(material.profile).toUpperCase();

    const colorName = document.getElementById('popup-color-name');
    if (colorName) colorName.textContent = material.name;

    const specs = getProfileSpecs(material.profile);
    const description = document.getElementById('popup-description');
    if (description) description.textContent = specs.description;

    // Remove preview indicator
    const previewIndicator = document.querySelector('.preview-mode-indicator');
    if (previewIndicator) {
        previewIndicator.remove();
    }

    // Remove previewing highlight
    document.querySelectorAll('.similar-product-card').forEach(c => c.classList.remove('previewing'));

    // Re-populate similar products based on original material
    populatePopupSimilarProducts(material);

    // Clear stored originals
    originalPopupMaterial = null;
    originalPopupVariants = [];
}

function setupPopupListeners() {
    const popup = document.getElementById('product-detail-popup');
    if (!popup) return;

    // Close button
    const closeBtn = document.getElementById('popup-close');
    if (closeBtn) {
        closeBtn.onclick = closeProductDetailPopup;
    }

    // Overlay click
    const overlay = popup.querySelector('.popup-overlay');
    if (overlay) {
        overlay.onclick = closeProductDetailPopup;
    }

    // Select button (legacy)
    const selectBtn = document.getElementById('popup-select-btn');
    if (selectBtn) {
        selectBtn.onclick = () => {
            if (currentPopupMaterial) {
                const card = document.querySelector(`.browse-section-inline .product-card[data-url="${currentPopupMaterial.url}"]`);
                toggleInlineSelection(currentPopupMaterial, card);
            }
        };
    }

    // Apply button - "See It On Your Home"
    const applyBtn = document.getElementById('popup-apply-btn');
    if (applyBtn) {
        applyBtn.onclick = () => {
            if (currentPopupMaterial) {
                applyInlineMaterial(currentPopupMaterial, null);
                closeProductDetailPopup();
                // Scroll to canvas
                const canvasContainer = document.getElementById('canvas-container');
                if (canvasContainer) {
                    canvasContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        };
    }

    // Sample button - "Order a Sample"
    const sampleBtn = document.getElementById('popup-sample-btn');
    if (sampleBtn) {
        sampleBtn.onclick = () => {
            if (currentPopupMaterial) {
                const subject = encodeURIComponent(`Sample Request: ${currentPopupMaterial.name || 'Product'}`);
                const body = encodeURIComponent(`I would like to order a sample for:\n\nProduct: ${currentPopupMaterial.name}\nManufacturer: ${formatManufacturer(currentPopupMaterial.manufacturer)}\nProfile: ${formatProfile(currentPopupMaterial.profile)}\n\nPlease contact me with details.`);
                window.location.href = `mailto:contact@aclmasonry.ca?subject=${subject}&body=${body}`;
            }
        };
    }

    // Share button - share via text/SMS
    const shareBtn = document.getElementById('popup-share-btn');
    if (shareBtn) {
        shareBtn.onclick = async () => {
            if (!currentPopupMaterial) return;

            const material = currentPopupMaterial;

            // Live server base URL
            const liveBaseUrl = 'https://stonevisualizer.aclmasonry.ca';

            // Build full image URL for sharing
            const imagePath = material.url.startsWith('./') ? material.url.substring(2) : material.url;
            const imageUrl = `${liveBaseUrl}/${imagePath}`;

            // Professional share message
            const shareText =
                `${material.name || 'Stone Veneer'}\n\n` +
                `Brand: ${formatManufacturer(material.manufacturer)}\n` +
                `Profile: ${formatProfile(material.profile)}\n` +
                `Color: ${formatColorFamily(material.color)}\n` +
                `Availability: ${material.stocked ? 'In Stock' : 'Special Order'}\n\n` +
                `View Stone:\n${imageUrl}\n\n` +
                `ACL Masonry & Stone Supply\n` +
                `contact@aclmasonry.ca`;

            // Try native share first (mobile)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: material.name || 'Stone Veneer',
                        text: shareText
                    });
                    return;
                } catch (err) {
                    if (err.name === 'AbortError') return;
                }
            }

            // Fallback: Open SMS
            const smsBody = encodeURIComponent(shareText);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            window.location.href = isIOS ? `sms:&body=${smsBody}` : `sms:?body=${smsBody}`;
        };
    }

    // Favorite button
    const favoriteBtn = document.getElementById('popup-favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.onclick = () => {
            if (currentPopupMaterial) {
                // Add to saved materials (favorites)
                const existingIndex = savedMaterials.findIndex(m => m.url === currentPopupMaterial.url);
                if (existingIndex === -1) {
                    if (savedMaterials.length >= MAX_SELECTED_MATERIALS) {
                        savedMaterials.shift();
                    }
                    savedMaterials.push(currentPopupMaterial);
                    favoriteBtn.classList.add('favorited');
                } else {
                    savedMaterials.splice(existingIndex, 1);
                    favoriteBtn.classList.remove('favorited');
                }
                updateQuickMaterialsStrip();
                updateUnifiedPanel();
            }
        };

        // Update initial state
        if (currentPopupMaterial) {
            const isFavorited = savedMaterials.some(m => m.url === currentPopupMaterial.url);
            favoriteBtn.classList.toggle('favorited', isFavorited);
        }
    }
}

function setupSelectionPanelListeners() {
    // Now uses unified panel - setup is handled by initUnifiedPanelDragDrop
    // This function kept for compatibility but does nothing
}

function showInlineResults(title) {
    const resultsSection = document.getElementById('inline-results-section');
    const titleEl = document.getElementById('inline-results-title');

    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    }
    if (titleEl) {
        titleEl.textContent = title || 'Results';
    }

    // Scroll to results
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideInlineResults() {
    const resultsSection = document.getElementById('inline-results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }

    // Clear all active states
    document.querySelectorAll('.browse-section-inline .category-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.browse-section-inline .style-option').forEach(o => o.classList.remove('active'));
    document.querySelectorAll('.browse-section-inline .color-option').forEach(o => o.classList.remove('active'));

    // Reset filters
    clearInlineFilters();
}

function clearInlineFilters() {
    inlineActiveCategory = 'all';
    inlineActiveStyle = 'all';
    inlineActiveManufacturer = 'all';
    inlineActiveColor = 'all';
    inlineActiveAccessory = 'all';
    inlineActiveAvailability = 'all';
    inlineSearchTerm = '';
    inlineActiveQuickFilter = 'all';

    // Reset UI
    const searchInput = document.getElementById('inline-search-input');
    if (searchInput) searchInput.value = '';

    const clearSearchBtn = document.getElementById('inline-clear-search-btn');
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

    const styleFilter = document.getElementById('inline-style-filter');
    if (styleFilter) styleFilter.value = 'all';

    const manufacturerFilter = document.getElementById('inline-manufacturer-filter');
    if (manufacturerFilter) manufacturerFilter.value = 'all';

    const colorFilter = document.getElementById('inline-color-filter');
    if (colorFilter) colorFilter.value = 'all';

    document.querySelectorAll('input[name="inline-availability"]').forEach(radio => {
        radio.checked = radio.value === 'all';
    });

    // Reset filter pills - set "All Materials" as active
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.filter === 'all');
    });

    // Reset category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Hide accents subtabs
    const accentsSubtabs = document.getElementById('inline-accents-subtabs');
    if (accentsSubtabs) {
        accentsSubtabs.classList.add('hidden');
        document.querySelectorAll('#inline-accents-subtabs .accent-subtab').forEach(t => t.classList.remove('active'));
    }

    // Hide manufacturer tabs
    const manufacturerTabs = document.getElementById('inline-manufacturer-tabs');
    if (manufacturerTabs) {
        manufacturerTabs.classList.add('hidden');
        document.querySelectorAll('.manufacturer-tab').forEach(t => t.classList.remove('active'));
    }

    // Clear browse by style options
    document.querySelectorAll('.browse-filters-row .style-option').forEach(o => o.classList.remove('active'));

    // Clear browse by color options
    document.querySelectorAll('.browse-filters-row .color-option').forEach(o => o.classList.remove('active'));

    // Update title
    const titleEl = document.getElementById('inline-results-title');
    if (titleEl) titleEl.textContent = 'All Materials';

    // Re-filter to show all
    filterInlineProducts();
}

console.log('Customer Visualizer loaded!');
