import {
    loadCommentsForMessage
} from './comment-loader.js';

// Handle liking a comment
export const handleLike = async (commentId, messageId) => {
    try {
        const response = await fetch(`/api/comments/${commentId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) throw new Error('Failed to like comment');

        // Instead of a full refresh, we can just update the like count locally
        // for a better user experience. But for simplicity and to ensure
        // data consistency, a full refresh is safer for now.
        loadCommentsForMessage(messageId, 1, true); // Refresh
    } catch (error) {
        console.error('Like error:', error);
        alert('Failed to like the comment. Please try again.');
    }
};