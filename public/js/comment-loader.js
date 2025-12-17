// Comment Loader Module
// Purpose: Handles loading comments for messages using API and coordinates rendering
// Dependencies: renderCommentSection and message reply button functions (should be available globally)

// Load comments for a specific message from the API
const loadCommentsForMessage = async (messageId, page = 1, forceRefresh = false) => {
    const commentsContainer = document.getElementById(`comments-for-${messageId}`);
    if (!commentsContainer) return;

    // Avoid reloading if already loaded, unless forcing a refresh
    if (commentsContainer.dataset.loaded === 'true' && !forceRefresh) {
        return;
    }

    const commentsPerPage = 10;
    try {
        const response = await fetch(`/api/comments?messageId=${messageId}&page=${page}&limit=${commentsPerPage}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const data = await response.json();
        const { comments, pagination } = data;

        // Mark as loaded and store comments data
        commentsContainer.dataset.loaded = 'true';
        commentsContainer.dataset.comments = JSON.stringify(comments);

        // Render the full comment section structure
        if (window.renderCommentSection) {
            window.renderCommentSection(commentsContainer, messageId, comments, pagination);
        } else {
            console.error('renderCommentSection function not found, falling back to basic rendering');
            commentsContainer.innerHTML = '<p class="text-gray-500 text-center">Comment rendering not available.</p>';
            return;
        }

        // Show or hide the message's Reply button and comment container based on whether there are comments
        if (comments.length > 0) {
            // Use global hideMessageReplyButton function
            if (window.hideMessageReplyButton) {
                window.hideMessageReplyButton(messageId);
            } else {
                console.error('hideMessageReplyButton function not found');
            }
            // Show the entire comment container when there are comments
            commentsContainer.classList.remove('hidden');
            // Ensure comment form is visible when there are comments
            const commentForm = commentsContainer.querySelector('form');
            if (commentForm) {
                commentForm.classList.remove('hidden');
            }
        } else {
            // Use global showMessageReplyButton function
            if (window.showMessageReplyButton) {
                window.showMessageReplyButton(messageId);
            } else {
                console.error('showMessageReplyButton function not found');
            }
            // Hide the entire comment container when there are no comments
            commentsContainer.classList.add('hidden');
            // Comment form is already visible (no hidden class), but container is hidden
        }

    } catch (error) {
        console.error(`Error loading comments for message ${messageId}:`, error);
        commentsContainer.innerHTML = `<p class="text-red-500 text-center">Could not load comments.</p>`;
    }
};

// Make function globally available for use in main.js
window.loadCommentsForMessage = loadCommentsForMessage;