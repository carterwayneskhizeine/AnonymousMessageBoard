import {
    messages
} from './state.js';
import {
    createButton
} from './utils.js';

export const toggleEditView = (id) => {
    // Access the global messages array
    const originalMessage = messages.find(m => m.id == id);
    if (!originalMessage) return;

    // If message has file (has_image is 1), don't allow editing (because a message can only have one file and files can't be deleted during editing)
    if (originalMessage.has_image === 1) {
        alert('Cannot edit messages with files. You can only edit the text content of file messages by deleting and reposting.');
        return;
    }

    const messageElement = document.querySelector(`[data-message-id='${id}']`);
    const contentContainer = messageElement.querySelector('.mb-4');
    const footer = messageElement.querySelector('.flex.justify-between');

    // Find the text content div (if it exists)
    const contentDiv = contentContainer.querySelector('.prose');
    if (!contentDiv) {
        alert('No text content to edit');
        return;
    }

    // Create an input area with the raw markdown
    const editInput = document.createElement('textarea');
    editInput.className = 'input-bp min-h-[150px] text-gray-200';
    editInput.value = originalMessage.content;
    editInput.rows = 8;

    // Create new action buttons
    const saveButton = createButton('Save', id, 'save');
    const cancelButton = createButton('Cancel', id, 'cancel');
    const newActions = document.createElement('div');
    newActions.className = 'flex gap-2 mt-2 self-end';
    newActions.appendChild(saveButton);
    newActions.appendChild(cancelButton);

    // Replace elements
    contentDiv.replaceWith(editInput);
    footer.style.display = 'none'; // Hide the original footer
    messageElement.appendChild(newActions);
    editInput.focus();
};