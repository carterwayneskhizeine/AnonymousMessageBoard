import {
    messages
} from './state.js';
import {
    deleteMessage,
    saveMessage
} from './message-operations.js';
import {
    toggleEditView
} from './message-edit-toggle.js';
import {
    renderMessage
} from './main-rendering-function.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';

export const handleMessageClick = (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const {
        action,
        id
    } = button.dataset;
    if (!action || !id) return;

    if (action === 'delete') {
        if (confirm('Are you sure you want to delete this message?')) {
            deleteMessage(id);
        }
    } else if (action === 'edit') {
        // Hide comments when entering edit mode, similar to the reply button behavior
        const commentsContainer = document.getElementById(`comments-for-${id}`);
        if (commentsContainer) {
            commentsContainer.classList.add('hidden');
        }
        toggleEditView(id);
    } else if (action === 'save') {
        saveMessage(id);
    } else if (action === 'cancel') {
        const originalMessage = messages.find(m => m.id == id);
        if (originalMessage) {
            const messageElement = document.querySelector(`[data-message-id='${id}']`);
            const restoredElement = renderMessage(originalMessage);

            if (restoredElement) {
                // Replace the old element with the new one
                messageElement.replaceWith(restoredElement);

                // Load comments for the message (comments are visible by default)
                loadCommentsForMessage(id);
            }
        }
    } else if (action === 'copy') {
        const messageToCopy = messages.find(m => m.id == id);
        if (messageToCopy && navigator.clipboard) {
            navigator.clipboard.writeText(messageToCopy.content)
                .then(() => {
                    const originalHTML = button.innerHTML;
                    button.innerHTML = '<span style="font-size: 50%">Copied!</span>';
                    setTimeout(() => {
                        button.innerHTML = originalHTML;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy message: ', err);
                    alert('Failed to copy message.');
                });
        } else {
            alert('Clipboard API not supported or message not found.');
        }
    } else if (action === 'like-message') {
        handleMessageLike(id);
    } else if (action === 'reply') {
        const commentsContainer = document.getElementById(`comments-for-${id}`);
        if (commentsContainer) {
            // Check if comments are already loaded
            if (commentsContainer.dataset.loaded === 'true') {
                // Comments are loaded, toggle the entire comment container visibility
                commentsContainer.classList.toggle('hidden');
            } else {
                // Comments not loaded yet, load them
                loadCommentsForMessage(id);
            }
        }
    } else if (action === 'make-private') {
        handleMakePrivate(id);
    } else if (action === 'md') {
        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const textarea = messageElement.querySelector('textarea');
        if (textarea && typeof Stackedit !== 'undefined') {
            const stackedit = new Stackedit();
            stackedit.openFile({
                name: 'Edit Message',
                content: {
                    text: textarea.value
                }
            });
            stackedit.on('fileChange', (file) => {
                textarea.value = file.content.text;
            });
        }
    }
};

async function handleMessageLike(messageId) {
    try {
        const response = await fetch(`/api/messages/${messageId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to like message');
        }

        // For now, just refresh all messages to show the change
        fetchAndRenderMessages();

    } catch (error) {
        console.error('Failed to like message:', error);
        alert('An error occurred while liking the message.');
    }
}

function handleMakePrivate(messageId) {
    const modal = document.getElementById('admin-private-modal');
    const input = document.getElementById('admin-modal-private-key');

    // Store the message ID in modal dataset
    modal.dataset.messageId = messageId;

    // Clear previous input and show modal
    input.value = '';
    modal.showModal();
    input.focus();
}