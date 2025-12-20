import {
    guestView,
    userView,
    usernameDisplay,
    privateKeyInput,
    sendKeyButton,
    feedPrivateBtn,
    mobileFeedPrivateBtn,
    feedLikedBtn,
    feedPostsBtn,
    mobileFeedLikedBtn,
    mobileFeedPostsBtn
} from './ui-elements.js';
import {
    setCurrentUser
} from './state.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';


// Authentication UI update function
export const updateUIForUser = (user) => {
    if (user) {
        // Update current user
        setCurrentUser(user);
        guestView.classList.add('hidden');
        userView.classList.remove('hidden');
        usernameDisplay.textContent = user.username;

        // Show User Specific Feed buttons
        if (feedPrivateBtn) {
            feedPrivateBtn.classList.remove('hidden');
        }
        if (feedLikedBtn) {
            feedLikedBtn.classList.remove('hidden');
        }
        if (feedPostsBtn) {
            feedPostsBtn.classList.remove('hidden');
        }

        if (mobileFeedPrivateBtn) mobileFeedPrivateBtn.classList.remove('hidden');
        if (mobileFeedLikedBtn) mobileFeedLikedBtn.classList.remove('hidden');
        if (mobileFeedPostsBtn) mobileFeedPostsBtn.classList.remove('hidden');

        // 如果用户已登录，隐藏KEY输入框（因为会自动显示私有消息）
        if (!privateKeyInput.classList.contains('hidden')) {
            // 如果KEY输入框显示，隐藏它并重新加载消息
            privateKeyInput.classList.add('hidden');
            sendKeyButton.classList.add('hidden');

            try {
                fetchAndRenderMessages();
            } catch (error) {
                console.error('updateUIForUser: Error fetching messages:', error);
                // Fallback: reload page if critical error
                window.location.reload();
            }
        }
    } else {
        // Clear current user
        setCurrentUser(null);
        guestView.classList.remove('hidden');
        userView.classList.add('hidden');

        // Hide User Specific Feed buttons
        if (feedPrivateBtn) feedPrivateBtn.classList.add('hidden');
        if (feedLikedBtn) feedLikedBtn.classList.add('hidden');
        if (feedPostsBtn) feedPostsBtn.classList.add('hidden');

        if (mobileFeedPrivateBtn) mobileFeedPrivateBtn.classList.add('hidden');
        if (mobileFeedLikedBtn) mobileFeedLikedBtn.classList.add('hidden');
        if (mobileFeedPostsBtn) mobileFeedPostsBtn.classList.add('hidden');
    }
};
