// Initial Setup Module
// Purpose: Sets up all event listeners and initializes the application
// Dependencies: Requires DOM elements and functions from main.js to be available globally

// Initialize all event listeners and application setup
const initEventListeners = () => {
    // --- Main Form Event Listeners ---
    if (window.messageForm && window.handlePostSubmit) {
        window.messageForm.addEventListener('submit', window.handlePostSubmit);
    } else {
        console.error('messageForm or handlePostSubmit not available');
    }

    if (window.messageList && window.handleMessageClick) {
        window.messageList.addEventListener('click', window.handleMessageClick);
    } else {
        console.error('messageList or handleMessageClick not available');
    }

    // --- File Upload Event Listeners ---
    if (window.uploadFileButton && window.fileUpload) {
        window.uploadFileButton.addEventListener('click', () => {
            window.fileUpload.click();
        });
    } else {
        console.error('uploadFileButton or fileUpload not available');
    }

    if (window.fileUpload && window.updateFilePreview) {
        window.fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 检查文件大小 (50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('File is too large. Maximum size is 50MB.');
                window.fileUpload.value = '';
                return;
            }

            window.updateFilePreview(file);
        });
    } else {
        console.error('fileUpload or updateFilePreview not available');
    }

    if (window.removeFileButton && window.clearSelectedFile) {
        window.removeFileButton.addEventListener('click', window.clearSelectedFile);
    } else {
        console.error('removeFileButton or clearSelectedFile not available');
    }

    // --- KEY Button Event Listeners ---
    if (window.keyButton && window.privateKeyInput && window.sendKeyButton &&
        window.postMessageButton && window.uploadFileButton && window.errorMessage &&
        window.fetchAndRenderMessages) {

        window.keyButton.addEventListener('click', (e) => {
            e.preventDefault();
            const isShowingKeyInput = !window.privateKeyInput.classList.contains('hidden');

            if (isShowingKeyInput) {
                // 隐藏 KEY 输入框和 Send 按钮，显示 Post Message 按钮和文件上传按钮
                window.privateKeyInput.classList.add('hidden');
                window.sendKeyButton.classList.add('hidden');
                window.postMessageButton.classList.remove('hidden');
                window.uploadFileButton.classList.remove('hidden');
                window.privateKeyInput.value = '';
                // 隐藏错误提示
                window.errorMessage.classList.add('hidden');
                window.fetchAndRenderMessages(); // 重新加载（只显示 public）
            } else {
                // 显示 KEY 输入框和 Send 按钮，隐藏 Post Message 按钮和文件上传按钮
                window.privateKeyInput.classList.remove('hidden');
                window.sendKeyButton.classList.remove('hidden');
                window.postMessageButton.classList.add('hidden');
                window.uploadFileButton.classList.add('hidden');
                window.privateKeyInput.focus();
            }
        });

        // 监听 KEY 输入框的回车键
        window.privateKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.fetchAndRenderMessages();
            }
        });

        // Send 按钮点击事件
        window.sendKeyButton.addEventListener('click', () => {
            window.fetchAndRenderMessages();
        });
    } else {
        console.error('KEY button elements or functions not available');
    }

    // --- Modal Event Listeners ---
    if (window.publicOption && window.messageTypeModal && window.postMessageToAPI) {
        window.publicOption.addEventListener('click', async () => {
            const content = window.messageTypeModal.dataset.pendingContent;
            window.messageTypeModal.close();
            await window.postMessageToAPI(content, false, null);
        });
    } else {
        console.error('publicOption, messageTypeModal, or postMessageToAPI not available');
    }

    if (window.privateOption && window.typeSelection && window.privateKeyEntry && window.modalPrivateKey) {
        window.privateOption.addEventListener('click', () => {
            window.typeSelection.classList.add('hidden');
            window.privateKeyEntry.classList.remove('hidden');
            window.modalPrivateKey.focus();
        });
    } else {
        console.error('privateOption or modal elements not available');
    }

    if (window.cancelPrivate && window.typeSelection && window.privateKeyEntry && window.modalPrivateKey) {
        window.cancelPrivate.addEventListener('click', () => {
            window.typeSelection.classList.remove('hidden');
            window.privateKeyEntry.classList.add('hidden');
            window.modalPrivateKey.value = '';
        });
    } else {
        console.error('cancelPrivate or modal elements not available');
    }

    if (window.confirmPrivate && window.typeSelection && window.privateKeyEntry &&
        window.modalPrivateKey && window.messageTypeModal && window.postMessageToAPI) {

        window.confirmPrivate.addEventListener('click', async () => {
            const privateKey = window.modalPrivateKey.value.trim();

            // 所有私有消息都需要KEY
            if (!privateKey) {
                alert('KEY cannot be empty!');
                return;
            }

            const content = window.messageTypeModal.dataset.pendingContent;
            window.messageTypeModal.close();
            await window.postMessageToAPI(content, true, privateKey);
        });
    } else {
        console.error('confirmPrivate or required functions not available');
    }
};

// Make function globally available for use in main.js
window.initEventListeners = initEventListeners;