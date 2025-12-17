// Comment Delete Module
// Purpose: Handles deletion of comments in the message board
// Dependencies: loadCommentsForMessage function (should be available globally)

// Handle deletion of a comment with confirmation and refresh
const handleDeleteComment = async (commentId, messageId) => {
    if (!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete comment');

        // Refresh comments
        const commentsContainer = document.getElementById(`comments-for-${messageId}`);
        if (commentsContainer) {
            // Clear loaded flag to force reload
            delete commentsContainer.dataset.loaded;
        }

        // Use global loadCommentsForMessage function from main.js
        if (window.loadCommentsForMessage) {
            window.loadCommentsForMessage(messageId, 1, true); // Refresh
        } else {
            console.error('loadCommentsForMessage function not found');
            // Fallback: reload the page
            window.location.reload();
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
};

// Make function globally available for use in main.js
window.handleDeleteComment = handleDeleteComment;