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
    confirmPrivate,
    feedLatestBtn,
    feedPrivateBtn,
    feedTrendingBtn,
    feedPostsBtn,
    feedLikedBtn,
    mobileFeedLatestBtn,
    mobileFeedPrivateBtn,
    mobileFeedTrendingBtn,
    mobileFeedPostsBtn,
    mobileFeedLikedBtn,
    mobileSearchToggle,
    globalSearchContainer,
    sidebarToggleBtn,
    desktopSidebar,
    mainContent,
    mainContentWrapper,
    adminPrivateModal,
    adminModalPrivateKey,
    adminCancelPrivate,
    adminConfirmPrivate,
    stackeditButton,
    messageInput
} from './ui-elements.js';
import {
    isPrivateFilterMode,
    setIsPrivateFilterMode,
    setCurrentPrivateKey,
    currentFeedType,
    setCurrentFeedType,
    setCurrentPage
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

    // --- StackEdit Event Listener ---
    if (stackeditButton && typeof Stackedit !== 'undefined') {
        const stackedit = new Stackedit();

        stackeditButton.addEventListener('click', () => {
            stackedit.openFile({
                name: 'Message',
                content: {
                    text: messageInput.value,
                    properties: {
                        colorTheme: 'dark'
                    }
                }
            });
        });

        stackedit.on('fileChange', (file) => {
            messageInput.value = file.content.text;
        });
    }


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

    // Admin Private Modal Event Listeners
    adminCancelPrivate.addEventListener('click', () => {
        adminPrivateModal.close();
        adminModalPrivateKey.value = '';
    });

    adminConfirmPrivate.addEventListener('click', async () => {
        const privateKey = adminModalPrivateKey.value.trim();

        if (!privateKey) {
            alert('KEY cannot be empty!');
            return;
        }

        const messageId = adminPrivateModal.dataset.messageId;
        if (!messageId) {
            console.error('No message ID found in modal');
            return;
        }

        try {
            const response = await fetch(`/api/messages/${messageId}/make-private`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ privateKey })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to make message private');
            }

            const updatedMessage = await response.json();
            console.log('Message made private successfully:', updatedMessage);

            // Close modal
            adminPrivateModal.close();
            adminModalPrivateKey.value = '';

            // Refresh messages to show the updated state
            fetchAndRenderMessages();

        } catch (error) {
            console.error('Error making message private:', error);
            alert(error.message || 'Failed to make message private');
        }
    });

    // Allow Enter key to submit in admin private modal
    adminModalPrivateKey.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adminConfirmPrivate.click();
        }
    });

    // --- Feed Navigation & Search ---
    const handleFeedChange = (type) => {
        if (currentFeedType === type) return;
        setCurrentFeedType(type);
        setCurrentPage(1); // Reset to page 1

        // Update UI active states
        updateFeedButtonStyles(type);

        fetchAndRenderMessages(1);
    };

    if (feedLatestBtn) feedLatestBtn.addEventListener('click', () => handleFeedChange('latest'));
    if (feedPrivateBtn) feedPrivateBtn.addEventListener('click', () => handleFeedChange('private'));
    if (feedTrendingBtn) feedTrendingBtn.addEventListener('click', () => handleFeedChange('trending'));
    if (feedLikedBtn) feedLikedBtn.addEventListener('click', () => handleFeedChange('liked'));
    if (feedPostsBtn) feedPostsBtn.addEventListener('click', () => handleFeedChange('posts'));

    if (mobileFeedLatestBtn) mobileFeedLatestBtn.addEventListener('click', () => handleFeedChange('latest'));
    if (mobileFeedPrivateBtn) mobileFeedPrivateBtn.addEventListener('click', () => handleFeedChange('private'));
    if (mobileFeedTrendingBtn) mobileFeedTrendingBtn.addEventListener('click', () => handleFeedChange('trending'));
    if (mobileFeedLikedBtn) mobileFeedLikedBtn.addEventListener('click', () => handleFeedChange('liked'));
    if (mobileFeedPostsBtn) mobileFeedPostsBtn.addEventListener('click', () => handleFeedChange('posts'));

    // Mobile Search Toggle
    const mobileSearchContainer = document.getElementById('mobile-search-container');
    if (mobileSearchToggle && mobileSearchContainer) {
        mobileSearchToggle.addEventListener('click', () => {
            mobileSearchContainer.classList.toggle('hidden');
            const input = mobileSearchContainer.querySelector('input');
            if (!mobileSearchContainer.classList.contains('hidden') && input) {
                input.focus();
            }
        });
    }

    // --- Sidebar Toggle ---
    if (sidebarToggleBtn && desktopSidebar && mainContent && mainContentWrapper) {
        sidebarToggleBtn.addEventListener('click', () => {
            desktopSidebar.classList.toggle('lg:block');

            // Check if the sidebar is now hidden on large screens
            const isSidebarHidden = !desktopSidebar.classList.contains('lg:block');

            if (isSidebarHidden) {
                // --- COLLAPSED STATE ---
                // Main content becomes a full-width flex container to center its child
                mainContent.classList.remove('lg:col-span-9');
                mainContent.classList.add('lg:col-span-12', 'lg:flex', 'lg:justify-center');

                // Inner wrapper gets a fixed 3/4 width on large screens
                mainContentWrapper.classList.add('lg:w-9/12');
            } else {
                // --- VISIBLE STATE ---
                // Main content reverts to a 9-column grid item
                mainContent.classList.add('lg:col-span-9');
                mainContent.classList.remove('lg:col-span-12', 'lg:flex', 'lg:justify-center');

                // Inner wrapper reverts to full width of its parent grid cell
                mainContentWrapper.classList.remove('lg:w-9/12');
            }
        });
    }

    function updateFeedButtonStyles(activeType) {
        const desktopBtns = {
            latest: feedLatestBtn,
            private: feedPrivateBtn,
            trending: feedTrendingBtn,
            liked: feedLikedBtn,
            posts: feedPostsBtn
        };
        const mobileBtns = {
            latest: mobileFeedLatestBtn,
            private: mobileFeedPrivateBtn,
            trending: mobileFeedTrendingBtn,
            liked: mobileFeedLikedBtn,
            posts: mobileFeedPostsBtn
        };

        // Desktop Classes
        const activeClassesDesktop = ['bg-bp-gold/10', 'text-bp-gold', 'font-medium'];
        const inactiveClassesDesktop = ['text-bp-text-muted', 'hover:bg-bp-gray', 'hover:text-bp-text'];

        // Mobile Classes
        // Active: btn-bp-primary (bg-bp-gold text-bp-black ...)
        // Inactive: btn-bp-outline bg-bp-dark (border ... text-muted ...)

        Object.keys(desktopBtns).forEach(type => {
            const btn = desktopBtns[type];
            if (!btn) return;
            if (type === activeType) {
                btn.classList.add(...activeClassesDesktop);
                btn.classList.remove('text-bp-text-muted', 'hover:bg-bp-gray', 'hover:text-bp-text');
            } else {
                btn.classList.remove(...activeClassesDesktop);
                btn.classList.add('text-bp-text-muted', 'hover:bg-bp-gray', 'hover:text-bp-text');
            }
        });

        Object.keys(mobileBtns).forEach(type => {
            const btn = mobileBtns[type];
            if (!btn) return;
            if (type === activeType) {
                // To Primary
                btn.classList.remove('btn-bp-outline', 'bg-bp-dark');
                btn.classList.add('btn-bp-primary');
            } else {
                // To Outline
                btn.classList.remove('btn-bp-primary');
                btn.classList.add('btn-bp-outline', 'bg-bp-dark');
            }
        });
    }
};
