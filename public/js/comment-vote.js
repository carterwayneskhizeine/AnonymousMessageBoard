// Comment Vote Module
// Purpose: Handles voting functionality for comments in the message board
// Dependencies: loadCommentsForMessage function (should be available globally)

// Handle voting on a comment (upvote or downvote)
const handleVote = async (commentId, vote, messageId) => {
    try {
        const response = await fetch(`/api/comments/${commentId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vote }),
        });
        if (!response.ok) throw new Error('Failed to vote');

        // Use global loadCommentsForMessage function from main.js
        if (window.loadCommentsForMessage) {
            window.loadCommentsForMessage(messageId, 1, true); // Refresh
        } else {
            console.error('loadCommentsForMessage function not found, reloading page');
            window.location.reload();
        }
    } catch (error) {
        console.error('Vote error:', error);
    }
};

// Make function globally available for use in main.js
window.handleVote = handleVote;