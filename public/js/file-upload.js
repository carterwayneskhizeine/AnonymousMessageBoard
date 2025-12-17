// File Upload Helper Functions
// Handles file uploads with progress tracking and error handling

const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        // Create XMLHttpRequest to handle progress events
        const xhr = new XMLHttpRequest();

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Set up progress tracking
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                fileStatus.textContent = `Uploading: ${Math.round(percentComplete)}%`;
            }
        });

        // Handle upload completion
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (parseError) {
                    console.error('Error parsing upload response:', parseError);
                    reject(new Error('Invalid response from server'));
                }
            } else {
                let errorMessage = 'Upload failed';
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || `Upload failed with status: ${xhr.status}`;
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                    errorMessage = `Upload failed with status: ${xhr.status}`;
                }
                reject(new Error(errorMessage));
            }
        });

        // Handle upload error
        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload - server may be unavailable'));
        });

        // Handle timeout
        xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timed out - please try again'));
        });

        // Handle abort (if needed)
        xhr.addEventListener('abort', () => {
            reject(new Error('Upload was aborted'));
        });

        // Configure and send request
        xhr.open('POST', '/api/upload-file');
        xhr.timeout = 300000; // 5 minutes timeout
        xhr.send(formData);
    });
};

// Make function globally available
window.uploadFile = uploadFile;