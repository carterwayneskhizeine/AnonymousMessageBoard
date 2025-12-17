// Comment Post Module
// Purpose: Handles posting of comments in the message board
// Dependencies: loadCommentsForMessage function (should be available globally)

// Handle posting a new comment (top-level or reply)
const handlePostComment = async (messageId, parentId, inputElement, errorElement) => {
    const content = inputElement.value.trim();
    if (!content) {
        errorElement.textContent = 'Comment cannot be empty.';
        errorElement.classList.remove('hidden');
        return;
    }

    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, pid: parentId, text: content }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to post comment');
        }

        inputElement.value = '';
        errorElement.classList.add('hidden');

        // Use global loadCommentsForMessage function from main.js
        if (window.loadCommentsForMessage) {
            window.loadCommentsForMessage(messageId, 1, true); // Force refresh
        } else {
            console.error('loadCommentsForMessage function not found, reloading page');
            window.location.reload();
            return;
        }

        // 自动刷新页面以确保所有状态同步
        setTimeout(() => {
            window.location.reload();
        }, 1000); // 1秒后刷新，让用户看到成功提示

    } catch (error) {
        console.error('Error posting comment:', error);
        errorElement.textContent = error.message;
        errorElement.classList.remove('hidden');
    }
};

// Make function globally available for use in reply-handler.js and main.js
window.handlePostComment = handlePostComment;