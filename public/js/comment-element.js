import {
    createButton
} from './utils.js';
import {
    converter
} from './main-rendering-function.js';

// Create a DOM element for a single, flat comment
export const createCommentElement = (comment, messageId, parentId, commentMap) => {
    const commentElement = document.createElement('div');
    // Minimalist list style for comments
    commentElement.className = 'mb-2 p-3 rounded hover:bg-bp-gray/20 transition-colors border-b border-bp-gray/30 last:border-0';
    commentElement.dataset.commentId = comment.id;
    commentElement.id = `comment-${comment.id}`; 

    // Format time
    const commentTime = new Date(comment.time).toLocaleString();

    // User info header
    const userElement = document.createElement('div');
    userElement.className = 'flex items-center justify-between mb-1';
    
    const userInfo = document.createElement('div');
    userInfo.className = 'flex items-center gap-2';
    
    // Avatar placeholder or just name
    const name = document.createElement('span');
    name.className = 'font-bold text-sm text-bp-gold';
    name.textContent = comment.user.name;
    
    userInfo.appendChild(name);
    
    if (comment.user.verified) {
        const verified = document.createElement('span');
        verified.className = 'text-blue-400 text-xs bg-blue-400/10 px-1 rounded';
        verified.textContent = '✓';
        userInfo.appendChild(verified);
    }
    
    const time = document.createElement('span');
    time.className = 'text-xs text-bp-text-muted';
    time.textContent = commentTime;
    
    userElement.appendChild(userInfo);
    userElement.appendChild(time);

    // Comment text
    const textElement = document.createElement('div');
    let commentText = comment.text;

    // If it's a reply, find the parent and prepend an @-mention
    if (parentId && commentMap.has(parentId)) {
        const parentComment = commentMap.get(parentId);
        const parentAuthor = parentComment.user.name;
        // The mention is a link
        const mentionLink = `<a href="#comment-${parentId}" class="text-bp-gold hover:underline mr-1 no-underline bg-bp-gold/10 px-1 rounded text-xs font-bold">@${parentAuthor}</a>`;
        commentText = `${mentionLink} ${comment.text}`;
    }

    // Apply Tailwind's typography styles
    textElement.className = 'prose prose-invert prose-sm max-w-none text-gray-300 mb-2 leading-relaxed break-words';
    textElement.innerHTML = converter.makeHtml(commentText);


    // Action buttons
    const actionsElement = document.createElement('div');
    actionsElement.className = 'flex items-center gap-3 text-xs';

    // Like button logic
    const likeContainer = document.createElement('div');
    likeContainer.className = 'flex items-center gap-1 bg-bp-black rounded-full border border-bp-gray px-1';
    
    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like';
    likeBtn.dataset.id = comment.id;
    likeBtn.className = 'p-1 text-bp-text-muted transition-colors hover:text-red-400';
    likeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>`;
    
    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-[10px] min-w-[12px] text-center';
    likesCount.textContent = comment.likes || 0;
    
    likeContainer.appendChild(likeBtn);
    likeContainer.appendChild(likesCount);
    
    actionsElement.appendChild(likeContainer);

    // Divider
    // const divider = document.createElement('span');
    // divider.className = 'text-bp-gray';
    // divider.textContent = '|';
    // actionsElement.appendChild(divider);

    // Edit, Delete, Reply buttons (Using utils.createButton which returns btn-bp-icon)
    // We might want text buttons here for clarity in comments?
    // Let's stick to icons to keep it clean.
    
    if (comment.editable) {
        actionsElement.appendChild(createButton('Edit', comment.id, 'edit'));
    }
    if (comment.deletable) {
        actionsElement.appendChild(createButton('Delete', comment.id, 'delete'));
    }

    const replyButton = createButton('Reply', comment.id, 'reply');
    actionsElement.appendChild(replyButton);


    commentElement.appendChild(userElement);
    commentElement.appendChild(textElement);

    // Store raw text for editing, so it can be retrieved by the edit handler
    const rawTextElement = document.createElement('div');
    rawTextElement.className = 'raw-comment-text hidden';
    rawTextElement.textContent = comment.text || '';
    commentElement.appendChild(rawTextElement);

    commentElement.appendChild(actionsElement);

    return commentElement;
};
