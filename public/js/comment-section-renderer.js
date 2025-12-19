import {
    createCommentElement
} from './comment-element.js';
import {
    handlePostComment
} from './comment-post.js';
import {
    handleLike
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
    toggleFormButton.className = 'btn-bp-icon ml-auto'; // Use same style as reply button, aligned to right
    toggleFormButton.title = 'Post a new comment';
    toggleFormButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/><g transform="matrix(0.77 0 0 0.77 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(220,220,220); fill-rule: nonzero; opacity: 1;" transform=" translate(-13, -12.51)" d="M 4 1 C 1.804688 1 0 2.800781 0 5 L 0 15 C 0 17.195313 1.804688 19 4 19 L 6.3125 19 L 8.0625 23.375 C 8.207031 23.765625 8.582031 24.027344 9 24.027344 C 9.417969 24.027344 9.792969 23.765625 9.9375 23.375 L 11.6875 19 L 22 19 C 24.195313 19 26 17.195313 26 15 L 26 5 C 26 2.800781 24.195313 1 22 1 Z M 4 3 L 22 3 C 23.117188 3 24 3.882813 24 5 L 24 15 C 24 16.113281 23.113281 17 22 17 L 11 17 C 10.589844 16.996094 10.214844 17.242188 10.0625 17.625 L 9 20.28125 L 7.9375 17.625 C 7.785156 17.242188 7.410156 16.996094 7 17 L 4 17 C 2.886719 17 2 16.113281 2 15 L 2 5 C 2 3.882813 2.882813 3 4 3 Z" stroke-linecap="round" /></g></svg>`;

    toggleFormButton.addEventListener('click', (e) => {
        e.preventDefault();
        buttonWrapper.classList.add('hidden'); // Hide the button wrapper
        commentForm.classList.remove('hidden'); // Show the form
        commentForm.querySelector('textarea').focus();
    });

    // Add event listener for the new Cancel button
    commentForm.querySelector('.comment-cancel-btn').addEventListener('click', (e) => {
        e.preventDefault();
        commentForm.classList.add('hidden'); // Hide the form
        commentForm.querySelector('textarea').value = ''; // Clear textarea
        buttonWrapper.classList.remove('hidden'); // Show the button wrapper
    });

    // Create a wrapper for the button to align it to the right
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'flex justify-end';
    buttonWrapper.appendChild(toggleFormButton);

    formContainer.appendChild(buttonWrapper); // Add button wrapper
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

        if (action === 'like') {
            handleLike(commentId, messageId);
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