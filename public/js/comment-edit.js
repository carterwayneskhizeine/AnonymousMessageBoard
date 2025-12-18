import {
    createButton
} from './utils.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';

// Handle editing of a comment with inline form
export const handleEditComment = (commentId, messageId, container) => {
    const commentElement = container.querySelector(`[data-comment-id='${commentId}']`);
    if (!commentElement) {
        console.error(`Comment element with ID ${commentId} not found`);
        return;
    }

    const textElement = commentElement.querySelector('.prose');
    if (!textElement) {
        console.error(`Text element for comment ${commentId} not found`);
        return;
    }

    // This is a simplified version. A full implementation would require fetching the raw markdown.
    const currentText = textElement.textContent;

    const editForm = document.createElement('form');
    editForm.className = 'mt-2';

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full p-2 bg-black border border-gray-800 rounded';
    textarea.rows = 6; // Set height to 6 rows
    textarea.value = currentText;
    editForm.appendChild(textarea);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end gap-2 mt-2';

    // Create cancel button
    const cancelButton = createButton('Cancel', commentId, 'cancel');
    cancelButton.type = 'button';
    cancelButton.classList.remove('p-2'); // Remove default padding
    cancelButton.classList.add('px-2', 'py-1'); // Add smaller padding
    cancelButton.addEventListener('click', () => {
        loadCommentsForMessage(messageId, 1, true);
    });

    // Create save button
    const saveButton = createButton('Save', commentId, 'save');
    saveButton.type = 'submit';
    saveButton.classList.remove('p-2'); // Remove default padding
    saveButton.classList.add('px-2', 'py-1'); // Add smaller padding

    // Add buttons to container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);


    // Add container to form
    editForm.appendChild(buttonContainer);

    textElement.replaceWith(editForm);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newText = textarea.value.trim();
        if (!newText) {
            console.error('Comment text cannot be empty');
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: newText
                }),
            });
            if (!response.ok) throw new Error('Failed to save comment');

            loadCommentsForMessage(messageId, 1, true); // Refresh
        } catch (error) {
            console.error('Save comment error:', error);
            alert('Failed to save comment. Please try again.');
        }
    });
};