import {
    messageForm,
    messageList,
    uploadFileButton,
    fileUpload,
    removeFileButton,
    keyButton,
    privateKeyInput,
    sendKeyButton,
    postMessageButton,
    errorMessage,
    publicOption,
    messageTypeModal,
    privateOption,
    typeSelection,
    privateKeyEntry,
    modalPrivateKey,
    cancelPrivate,
    confirmPrivate
} from './ui-elements.js';
import {
    isPrivateFilterMode,
    setIsPrivateFilterMode,
    setCurrentPrivateKey
} from './state.js';

import {
    clearSelectedFile
} from './utils.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';
import {
    updateURL
} from './pagination.js';
import {
    handlePostSubmit,
    postMessageToAPI
} from './message-post-api.js';
import {
    handleMessageClick
} from './message-click-handler.js';
import {
    updateFilePreview
} from './file-preview.js';


// Initialize all event listeners and application setup
export const initEventListeners = () => {
    // --- Main Form Event Listeners ---
    messageForm.addEventListener('submit', handlePostSubmit);
    messageList.addEventListener('click', handleMessageClick);


    // --- File Upload Event Listeners ---
    uploadFileButton.addEventListener('click', () => {
        fileUpload.click();
    });


    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件大小 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File is too large. Maximum size is 50MB.');
            fileUpload.value = '';
            return;
        }

        updateFilePreview(file);
    });

    removeFileButton.addEventListener('click', clearSelectedFile);


    // --- KEY Button Event Listeners ---
    keyButton.addEventListener('click', (e) => {
        e.preventDefault();
        const isShowingKeyInput = !privateKeyInput.classList.contains('hidden');

        if (isShowingKeyInput) {
            // 如果当前处于私有过滤模式，退出私有过滤模式
            if (isPrivateFilterMode) {
                setIsPrivateFilterMode(false);
                setCurrentPrivateKey('');
            }

            // 隐藏 KEY 输入框和 Send 按钮，显示 Post Message 按钮和文件上传按钮
            privateKeyInput.classList.add('hidden');
            sendKeyButton.classList.add('hidden');
            postMessageButton.classList.remove('hidden');
            uploadFileButton.classList.remove('hidden');
            privateKeyInput.value = '';
            // 隐藏错误提示
            errorMessage.classList.add('hidden');
            updateURL(); // 更新 URL，移除 key 参数
            fetchAndRenderMessages(); // 重新加载（只显示 public）
        } else {
            // 显示 KEY 输入框和 Send 按钮，隐藏 Post Message 按钮和文件上传按钮
            privateKeyInput.classList.remove('hidden');
            sendKeyButton.classList.remove('hidden');
            postMessageButton.classList.add('hidden');
            uploadFileButton.classList.add('hidden');
            privateKeyInput.focus();
        }
    });

    // 监听 KEY 输入框的回车键
    privateKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleKeySubmit();
        }
    });

    // Send 按钮点击事件
    sendKeyButton.addEventListener('click', handleKeySubmit);

    // 处理 KEY 提交的函数
    function handleKeySubmit() {
        const key = privateKeyInput.value.trim();
        if (key) {
            setIsPrivateFilterMode(true);
            updateURL(); // 更新 URL，添加 key 参数
            fetchAndRenderMessages();
        }
    }

    // --- Modal Event Listeners ---
    publicOption.addEventListener('click', async () => {
        const content = messageTypeModal.dataset.pendingContent;
        messageTypeModal.close();
        await postMessageToAPI(content, false, null);
    });

    privateOption.addEventListener('click', () => {
        typeSelection.classList.add('hidden');
        privateKeyEntry.classList.remove('hidden');
        modalPrivateKey.focus();
    });

    cancelPrivate.addEventListener('click', () => {
        typeSelection.classList.remove('hidden');
        privateKeyEntry.classList.add('hidden');
        modalPrivateKey.value = '';
    });

    confirmPrivate.addEventListener('click', async () => {
        const privateKey = modalPrivateKey.value.trim();

        // 所有私有消息都需要KEY
        if (!privateKey) {
            alert('KEY cannot be empty!');
            return;
        }

        const content = messageTypeModal.dataset.pendingContent;
        messageTypeModal.close();
        await postMessageToAPI(content, true, privateKey);
    });
};