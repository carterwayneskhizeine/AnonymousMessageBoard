// File Preview Module
// Purpose: Handles file preview display and UI updates for uploaded files
// Dependencies:
// - Requires window.clearSelectedFile function (defined in main.js)
// - Requires window.selectedFile object (defined in main.js)
// - Requires DOM elements: filePreviewContent, filePreviewContainer, fileStatus (defined in main.js)
// - Used by initial-setup.js for file change event handling

// File preview update function
const updateFilePreview = (file) => {
    // Check dependencies
    if (!window.clearSelectedFile) {
        console.error('updateFilePreview: clearSelectedFile function not available');
        return;
    }

    // Get DOM elements if not globally available
    const previewContent = window.filePreviewContent || document.getElementById('file-preview-content');
    const previewContainer = window.filePreviewContainer || document.getElementById('file-preview-container');
    const statusElement = window.fileStatus || document.getElementById('file-status');

    if (!previewContent || !previewContainer || !statusElement) {
        console.error('updateFilePreview: Required DOM elements not available');
        return;
    }

    // Clear previous file
    window.clearSelectedFile();

    // Determine if file is an image
    const isImage = file.type.startsWith('image/');

    // Update state
    window.selectedFile = {
        file: file,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
        uploadedData: null,
        isImage: isImage
    };

    // Update UI
    if (isImage) {
        // Show preview image
        previewContent.innerHTML = `
            <img src="${window.selectedFile.previewUrl}" alt="File preview" class="max-h-40 rounded-lg border border-gray-800">
            <div class="text-xs text-gray-500 mt-2">${file.name}</div>
            <div class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB • ${file.type}</div>
        `;
    } else {
        // Show file icon and info for non-image files
        previewContent.innerHTML = `
            <div class="text-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div class="text-center text-sm text-gray-300 break-all">${file.name}</div>
            <div class="text-center text-xs text-gray-500 mt-1">${file.type || 'Unknown type'}</div>
            <div class="text-center text-xs text-gray-500 mt-1">${(file.size / 1024).toFixed(1)} KB</div>
        `;
    }

    previewContainer.classList.remove('hidden');
    statusElement.textContent = 'File selected';
    statusElement.classList.remove('text-gray-500');
    statusElement.classList.add('text-green-400');
};

// Make function globally available
window.updateFilePreview = updateFilePreview;