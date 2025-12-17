import {
    createButton
} from './utils.js';
import {
    converter
} from './main-rendering-function.js';

// Create a DOM element for a single, flat comment
export const createCommentElement = (comment, messageId, parentId, commentMap) => {
    const commentElement = document.createElement('div');
    // Add a border and padding, but no complex margins for nesting
    commentElement.className = 'mb-3 bg-black border border-gray-800 rounded-lg p-3';
    commentElement.dataset.commentId = comment.id;
    commentElement.id = `comment-${comment.id}`; // Add an ID for linking

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
    let commentText = comment.text;

    // If it's a reply, find the parent and prepend an @-mention
    if (parentId && commentMap.has(parentId)) {
        const parentComment = commentMap.get(parentId);
        const parentAuthor = parentComment.user.name;
        // The mention is a link to the parent comment for better navigation
        const mentionLink = `<a href="#comment-${parentId}" class="text-blue-400 hover:underline mr-1 no-underline">@${parentAuthor}</a>`;
        commentText = `${mentionLink} ${comment.text}`;
    }

    // Apply Tailwind's typography styles for ALL comments for proper markdown rendering
    textElement.className = 'prose prose-invert max-w-none text-gray-200 mb-3';
    // Use global converter from main.js to render markdown
    textElement.innerHTML = converter.makeHtml(commentText);


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

    // Always show the reply button, allowing for infinite "nesting" in a flat view
    const replyButton = createButton('Reply', comment.id, 'reply');
    actionsElement.appendChild(replyButton);


    // Append all parts to the main comment element
    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);
    commentElement.appendChild(actionsElement);
    // No repliesContainer is needed anymore as the list is flat

    return commentElement;
};