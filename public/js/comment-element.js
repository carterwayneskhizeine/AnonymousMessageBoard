import {
    createButton
} from './utils.js';
import {
    converter
} from './main-rendering-function.js';

// Create a DOM element for a comment (handles nesting and recursion)
export const createCommentElement = (comment, messageId, depth = 0) => {
    const commentElement = document.createElement('div');
    // Use the same styling as regular messages for all depths
    commentElement.className = 'mb-3 bg-black border border-gray-800 rounded-lg p-3';
    commentElement.dataset.commentId = comment.id;

    // Format time for display
    const commentTime = new Date(comment.time).toLocaleString();

    // User info
    const userElement = document.createElement('div');
    userElement.className = 'mb-2';
    userElement.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-200">${comment.user.name}</span>
            ${comment.user.verified ? '<span class="ml-2 text-blue-400 text-sm">✓ Verified</span>' : ''}
        </div>
        <div class="flex items-center justify-between mt-1">
            <span class="text-gray-500 text-sm">${commentTime}</span>
        </div>
    `;

    // Comment text
    const textElement = document.createElement('div');
    if (depth === 0) {
        // Apply Tailwind's typography styles for top-level comments for proper markdown rendering
        textElement.className = 'prose prose-invert max-w-none text-gray-200 mb-3';
    } else {
        // For nested comments, use a simpler style
        textElement.className = 'mb-3 text-gray-300';
    }
    // Use global converter from main.js
    textElement.innerHTML = converter.makeHtml(comment.text);


    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-2 text-sm';

    // Vote buttons
    actionsElement.innerHTML = `
        <button data-action="vote" data-vote="up" data-id="${comment.id}" class="text-gray-400 hover:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
        </button>
        <span class="text-gray-400">${comment.score}</span>
        <button data-action="vote" data-vote="down" data-id="${comment.id}" class="text-gray-400 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
    `;

    // Edit, Delete, Reply buttons
    if (comment.editable) {
        const editButton = createButton('Edit', comment.id, 'edit');
        actionsElement.appendChild(editButton);
    }
    if (comment.deletable) {
        const deleteButton = createButton('Delete', comment.id, 'delete');
        actionsElement.appendChild(deleteButton);
    }
    // Only show reply button if nesting depth is less than 2
    if (depth < 2) {
        const replyButton = createButton('Reply', comment.id, 'reply');
        actionsElement.appendChild(replyButton);
    }
    // For depth 2 and above, no reply button is shown

    // Replies container - limit nesting to 2 levels maximum
    const repliesContainer = document.createElement('div');

    if (depth >= 2) { // After 2 levels of nesting, stop creating nested styling
        // Still render the replies but without the nesting indentation and styling
        repliesContainer.className = 'mt-2 replies-container';
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                // Use global function for recursive call
                repliesContainer.appendChild(createCommentElement(reply, messageId, depth + 1)); // Recursive call with incremented depth
            });
        }
    } else {
        // For nesting levels 0-5, use increasing indentation
        const marginLeftClass = ['ml-2', 'ml-3', 'ml-4', 'ml-5', 'ml-6', 'ml-6'][depth] || 'ml-6';
        repliesContainer.className = `${marginLeftClass} mt-2 border-l-2 border-gray-700 pl-2 replies-container`;

        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
                // Use global function for recursive call
                repliesContainer.appendChild(createCommentElement(reply, messageId, depth + 1)); // Recursive call with incremented depth
            });
        }
    }

    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);
    commentElement.appendChild(actionsElement);
    commentElement.appendChild(repliesContainer);

    return commentElement;
};