import {
    createCommentElement
} from './comment-element.js';
import {
    handlePostComment
} from './comment-post.js';
import {
    handleVote
} from './comment-vote.js';
import {
    handleEditComment
} from './comment-edit.js';
import {
    handleDeleteComment
} from './comment-delete.js';
import {
    handleReply
} from './reply-handler.js';

/**
 * Flattens the nested comment structure into a sorted, flat list for rendering.
 * Replies are placed immediately after their parent, sorted chronologically.
 * @param {Array} comments - The original nested array of comments from the API.
 * @returns {{flatComments: Array, commentMap: Map}} - A flat, sorted array of comments and a map for quick ID lookups.
 */
const flattenAndSortComments = (comments) => {
    const commentMap = new Map();
    const repliesMap = new Map();

    // Recursive function to process all comments and populate the maps
    function processComments(commentList, parentId = null) {
        commentList.forEach(comment => {
            comment.parentId = parentId; // Assign parentId for later reference
            commentMap.set(comment.id, comment);

            // Group replies by their parent ID
            if (parentId) {
                if (!repliesMap.has(parentId)) {
                    repliesMap.set(parentId, []);
                }
                repliesMap.get(parentId).push(comment);
            }

            // Recurse through replies
            if (comment.replies && comment.replies.length > 0) {
                processComments(comment.replies, comment.id);
            }
        });
    }

    processComments(comments);

    // Get top-level comments and sort them by time
    const topLevelComments = comments.sort((a, b) => new Date(a.time) - new Date(b.time));

    const flatComments = [];
    const addedComments = new Set();

    // Recursive function to build the final flat list in the desired order
    function addCommentWithReplies(comment) {
        if (addedComments.has(comment.id)) return;

        flatComments.push(comment);
        addedComments.add(comment.id);

        const childReplies = repliesMap.get(comment.id);
        if (childReplies) {
            // Sort replies chronologically before adding them
            childReplies.sort((a, b) => new Date(a.time) - new Date(b.time));
            childReplies.forEach(reply => {
                addCommentWithReplies(reply); // This recursion creates the "insert after parent" effect
            });
        }
    }

    topLevelComments.forEach(comment => {
        addCommentWithReplies(comment);
    });

    return {
        flatComments,
        commentMap
    };
};


// Render the complete comment section structure
export const renderCommentSection = (container, messageId, comments, pagination) => {
    container.innerHTML = ''; // Clear previous content

    const {
        flatComments,
        commentMap
    } = flattenAndSortComments(comments);

    // 1. Comments List
    const commentsListContainer = document.createElement('div');
    commentsListContainer.className = 'comments-list';

    if (flatComments.length > 0) {
        flatComments.forEach(comment => {
            // Pass the comment, its parentId, and the commentMap to the element creator
            commentsListContainer.appendChild(createCommentElement(comment, messageId, comment.parentId, commentMap));
        });
    }
    container.appendChild(commentsListContainer);

    // 2. Comment Form and Toggle Button
    const formContainer = document.createElement('div');
    formContainer.className = 'mt-6';
    
    const commentForm = document.createElement('form');
    commentForm.className = `flex flex-col gap-3 hidden`; // Initially hidden
    commentForm.innerHTML = `
        <textarea
            class="input-bp min-h-[80px]"
            rows="2"
            placeholder="Add a comment..."></textarea>
        <div class="flex justify-end gap-2">
            <button type="button" class="btn-bp-outline text-sm py-1.5 px-5 comment-cancel-btn">
                Cancel
            </button>
            <button type="submit" class="btn-bp-primary text-sm py-1.5 px-5">
                Post Comment
            </button>
        </div>
        <div class="comment-error-message hidden text-red-400 text-center font-bold p-3 bg-black rounded-lg border border-red-800" role="alert"></div>
    `;

    const toggleFormButton = document.createElement('button');
    toggleFormButton.className = 'btn-bp-outline w-full text-sm py-2'; // White outline button
    toggleFormButton.textContent = 'Post a new comment';

    toggleFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        toggleFormButton.classList.add('hidden'); // Hide the button
        commentForm.classList.remove('hidden'); // Show the form
        commentForm.querySelector('textarea').focus();
    });

    // Add event listener for the new Cancel button
    commentForm.querySelector('.comment-cancel-btn').addEventListener('click', (e) => {
        e.preventDefault();
        commentForm.classList.add('hidden'); // Hide the form
        commentForm.querySelector('textarea').value = ''; // Clear textarea
        toggleFormButton.classList.remove('hidden'); // Show the button
    });

    formContainer.appendChild(toggleFormButton); // Always show toggle button initially
    formContainer.appendChild(commentForm); // Append form (initially hidden)

    container.appendChild(formContainer);


    // 3. Comments Pagination
    const commentsPaginationContainer = document.createElement('div');
    commentsPaginationContainer.className = 'comments-pagination-container mt-4';
    if (pagination && pagination.totalPages > 1) {
        // Simplified pagination for now
        const paginationElement = document.createElement('div');
        paginationElement.className = 'flex justify-center items-center gap-2';
        paginationElement.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
        commentsPaginationContainer.appendChild(paginationElement);
    }
    container.appendChild(commentsPaginationContainer);

    // 4. Add event listener for the new form
    const formToUse = container.querySelector('form');
    formToUse.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = formToUse.querySelector('textarea');
        const errorDiv = formToUse.querySelector('.comment-error-message');

        handlePostComment(messageId, null, input, errorDiv);
    });

    // 5. Delegated event listeners for comment actions
    commentsListContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const commentId = button.dataset.id;

        if (action === 'vote') {
            const vote = button.dataset.vote === 'up' ? 1 : -1;
            handleVote(commentId, vote, messageId);
        } else if (action === 'edit') {
            handleEditComment(commentId, messageId, commentsListContainer);
        } else if (action === 'delete') {
            handleDeleteComment(commentId, messageId);
        } else if (action === 'reply') {
            const commentElement = button.closest('[data-comment-id]');
            handleReply(commentId, messageId, commentElement);
        }
    });
};