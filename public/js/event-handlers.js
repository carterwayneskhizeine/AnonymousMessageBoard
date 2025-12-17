// Event Handlers Module
// Purpose: Handles form submissions and other UI event interactions
// Dependencies:
// - Requires window.messageInput DOM element (defined in main.js)
// - Requires window.selectedFile object (defined in main.js)
// - Requires window.fileStatus DOM element (defined in main.js)
// - Requires window.postMessageButton DOM element (defined in main.js)
// - Requires window.messageTypeModal DOM element (defined in main.js)
// - Requires window.typeSelection DOM element (defined in main.js)
// - Requires window.privateKeyEntry DOM element (defined in main.js)
// - Requires window.modalPrivateKey DOM element (defined in main.js)
// - Requires window.uploadFile function (defined in file-upload.js)
// - Uses local isSubmitting variable for duplicate submission prevention

// --- Event Handlers ---
let isSubmitting = false; // Prevent duplicate submissions

const handlePostSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
        return;
    }

    isSubmitting = true;

    try {
        const content = window.messageInput ? window.messageInput.value.trim() : '';

        // 验证：消息必须有内容或文件
        if (!content && !window.selectedFile) {
            alert('Message must have either text content or a file');
            return;
        }

        // 如果有文件，先上传文件
        let fileData = null;
        if (window.selectedFile && window.selectedFile.file) {
            if (window.fileStatus) {
                window.fileStatus.textContent = 'Uploading file...';
            }
            if (window.postMessageButton) {
                window.postMessageButton.disabled = true; // Disable the button during upload
                window.postMessageButton.classList.add('opacity-50', 'cursor-not-allowed');
            }

            if (window.uploadFile) {
                fileData = await window.uploadFile(window.selectedFile.file);
                if (window.selectedFile) {
                    window.selectedFile.uploadedData = fileData;
                }
                if (window.fileStatus) {
                    window.fileStatus.textContent = 'File uploaded';
                }
            } else {
                console.error('window.uploadFile is not available');
                alert('File upload functionality not available');
                return;
            }
        }

        // 存储消息内容和文件数据，稍后发送
        if (window.messageTypeModal) {
            window.messageTypeModal.dataset.pendingContent = content;
            if (fileData) {
                window.messageTypeModal.dataset.fileData = JSON.stringify(fileData);
            } else {
                delete window.messageTypeModal.dataset.fileData;
            }

            // 重置模态框状态
            if (window.typeSelection) {
                window.typeSelection.classList.remove('hidden');
            }
            if (window.privateKeyEntry) {
                window.privateKeyEntry.classList.add('hidden');
            }
            if (window.modalPrivateKey) {
                window.modalPrivateKey.value = '';
            }

            // 显示模态框
            window.messageTypeModal.showModal();
        } else {
            console.error('window.messageTypeModal is not available');
            alert('Modal functionality not available');
        }
    } catch (error) {
        console.error('Error in message submission:', error);
        alert(`Error: ${error.message}`);
        // 恢复文件状态
        if (window.selectedFile && window.fileStatus) {
            window.fileStatus.textContent = 'File selected';
        }
    } finally {
        isSubmitting = false;
        if (window.postMessageButton) {
            window.postMessageButton.disabled = false; // Re-enable the button
            window.postMessageButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
};

// Make function globally available
window.handlePostSubmit = handlePostSubmit;