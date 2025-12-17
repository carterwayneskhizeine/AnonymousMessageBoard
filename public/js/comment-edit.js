// Comment Edit Module
// Purpose: Handles editing of comments in the message board
// Dependencies: createButton and loadCommentsForMessage functions (should be available globally)

// Handle editing of a comment with inline form
const handleEditComment = (commentId, messageId, container) => {
    const commentElement = container.querySelector(`[data-comment-id='${commentId}']`);
    if (!commentElement) {
        console.error(`Comment element with ID ${commentId} not found`);
        return;
    }

    const textElement = commentElement.querySelector('.text-gray-300');
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
    textarea.value = currentText;
    editForm.appendChild(textarea);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end gap-2 mt-2';

    // Use global createButton function from main.js
    if (window.createButton) {
        // Create cancel button
        const cancelButton = window.createButton('Cancel', commentId, 'cancel');
        cancelButton.type = 'button';
        cancelButton.classList.remove('p-2'); // Remove default padding
        cancelButton.classList.add('px-2', 'py-1'); // Add smaller padding
        cancelButton.addEventListener('click', () => {
            if (window.loadCommentsForMessage) {
                window.loadCommentsForMessage(messageId, 1, true);
            } else {
                console.error('loadCommentsForMessage function not found, reloading page');
                window.location.reload();
            }
        });

        // Create save button
        const saveButton = window.createButton('Save', commentId, 'save');
        saveButton.type = 'submit';
        saveButton.classList.remove('p-2'); // Remove default padding
        saveButton.classList.add('px-2', 'py-1'); // Add smaller padding

        // Add buttons to container
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
    } else {
        console.error('createButton function not found, falling back to basic buttons');
        // Fallback to basic buttons if createButton is not available
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.type = 'button';
        cancelButton.className = 'px-2 py-1 border border-gray-700 hover:border-gray-100 text-gray-200 hover:text-gray-100 rounded';
        cancelButton.addEventListener('click', () => {
            if (window.loadCommentsForMessage) {
                window.loadCommentsForMessage(messageId, 1, true);
            } else {
                window.location.reload();
            }
        });

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.type = 'submit';
        saveButton.className = 'px-2 py-1 border border-gray-700 hover:border-gray-100 text-gray-200 hover:text-gray-100 rounded';

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
    }

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText }),
            });
            if (!response.ok) throw new Error('Failed to save comment');

            // Use global loadCommentsForMessage function from main.js
            if (window.loadCommentsForMessage) {
                window.loadCommentsForMessage(messageId, 1, true); // Refresh
            } else {
                console.error('loadCommentsForMessage function not found, reloading page');
                window.location.reload();
            }
        } catch (error) {
            console.error('Save comment error:', error);
            alert('Failed to save comment. Please try again.');
        }
    });
};

// Make function globally available for use in main.js
window.handleEditComment = handleEditComment;