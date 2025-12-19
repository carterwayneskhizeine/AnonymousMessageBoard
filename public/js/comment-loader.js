import {
    renderCommentSection
} from './comment-section-renderer.js';
import {
    hideMessageReplyButton,
    showMessageReplyButton
} from './message-reply-button.js';

// Load comments for a specific message from the API
export const loadCommentsForMessage = async (messageId, page = 1, forceRefresh = false) => {
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
        const {
            comments,
            pagination
        } = data;

        // Mark as loaded and store comments data
        commentsContainer.dataset.loaded = 'true';
        commentsContainer.dataset.comments = JSON.stringify(comments);

        // Render the full comment section structure
        renderCommentSection(commentsContainer, messageId, comments, pagination);


        // Show or hide the message's Reply button and comment container based on whether there are comments
        if (comments.length > 0) {
            // Use global hideMessageReplyButton function
            hideMessageReplyButton(messageId);
            // Show the entire comment container when there are comments
            commentsContainer.classList.remove('hidden');
        } else {
            // Use global showMessageReplyButton function
            showMessageReplyButton(messageId);
            // Hide the entire comment container when there are no comments
            commentsContainer.classList.add('hidden');
        }

    } catch (error) {
        console.error(`Error loading comments for message ${messageId}:`, error);
        commentsContainer.innerHTML = `<p class="text-red-500 text-center">Could not load comments.</p>`;
    }
};