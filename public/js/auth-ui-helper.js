// Authentication UI Helper Module
// Purpose: Handles UI updates for user authentication state changes
// Dependencies:
// - Requires window.currentUser object (defined in main.js)
// - Requires DOM elements: guestView, userView, usernameDisplay, privateKeyInput, sendKeyButton (defined in main.js)
// - Requires window.fetchAndRenderMessages function (defined in api-rendering-logic.js)
// - Used by auth-handlers.js and main.js for authentication state management

// Authentication UI update function
const updateUIForUser = (user) => {
    // Check dependencies
    if (typeof window.currentUser === 'undefined') {
        console.error('updateUIForUser: currentUser object not available');
        return;
    }

    // Get DOM elements if not globally available
    const guestViewEl = window.guestView || document.getElementById('guest-view');
    const userViewEl = window.userView || document.getElementById('user-view');
    const usernameDisplayEl = window.usernameDisplay || document.getElementById('username-display');
    const privateKeyInputEl = window.privateKeyInput || document.getElementById('private-key-input');
    const sendKeyButtonEl = window.sendKeyButton || document.getElementById('send-key-button');

    if (!guestViewEl || !userViewEl || !usernameDisplayEl || !privateKeyInputEl || !sendKeyButtonEl) {
        console.error('updateUIForUser: Required DOM elements not available');
        return;
    }

    if (user) {
        // Update current user
        window.currentUser = user;
        guestViewEl.classList.add('hidden');
        userViewEl.classList.remove('hidden');
        usernameDisplayEl.textContent = user.username;

        // 如果用户已登录，隐藏KEY输入框（因为会自动显示私有消息）
        if (privateKeyInputEl.classList.contains('hidden')) {
            // KEY输入框已隐藏，不需要操作
        } else {
            // 如果KEY输入框显示，隐藏它并重新加载消息
            privateKeyInputEl.classList.add('hidden');
            sendKeyButtonEl.classList.add('hidden');

            // Call fetchAndRenderMessages with error handling
            if (window.fetchAndRenderMessages) {
                try {
                    window.fetchAndRenderMessages();
                } catch (error) {
                    console.error('updateUIForUser: Error fetching messages:', error);
                    // Fallback: reload page if critical error
                    window.location.reload();
                }
            } else {
                console.error('updateUIForUser: fetchAndRenderMessages function not available');
                // Fallback: reload page to ensure proper state
                window.location.reload();
            }
        }
    } else {
        // Clear current user
        window.currentUser = null;
        guestViewEl.classList.remove('hidden');
        userViewEl.classList.add('hidden');
    }
};

// Make function globally available
window.updateUIForUser = updateUIForUser;