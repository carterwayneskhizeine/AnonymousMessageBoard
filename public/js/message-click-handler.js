// Message Click Handler Module
// Purpose: Handles all click events on message action buttons
// Dependencies:
// - Requires window.messages array (defined in main.js)
// - Requires window.deleteMessage function (defined in message-operations.js)
// - Requires window.saveMessage function (defined in message-operations.js)
// - Requires window.toggleEditView function (defined in message-edit-toggle.js)
// - Requires window.renderMessage function (defined in main.js)
// - Requires window.loadCommentsForMessage function (defined in comment-loader.js)
// - Requires window.handleReply function (defined in reply-handler.js)

const handleMessageClick = (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const {
        action,
        id
    } = button.dataset;
    if (!action || !id) return;

    if (action === 'delete') {
        if (confirm('Are you sure you want to delete this message?')) {
            if (window.deleteMessage) {
                window.deleteMessage(id);
            } else {
                console.error('window.deleteMessage is not available');
            }
        }
    } else if (action === 'edit') {
        // Hide comments when entering edit mode, similar to the reply button behavior
        const commentsContainer = document.getElementById(`comments-for-${id}`);
        if (commentsContainer) {
            commentsContainer.classList.add('hidden');
        }
        if (window.toggleEditView) {
            window.toggleEditView(id);
        } else {
            console.error('window.toggleEditView is not available');
        }
    } else if (action === 'save') {
        if (window.saveMessage) {
            window.saveMessage(id);
        } else {
            console.error('window.saveMessage is not available');
        }
    } else if (action === 'cancel') {
        const originalMessage = window.messages.find(m => m.id == id);
        if (originalMessage) {
            const messageElement = document.querySelector(`[data-message-id='${id}']`);
            const restoredElement = window.renderMessage ? window.renderMessage(originalMessage) : null;

            if (restoredElement) {
                // Replace the old element with the new one
                messageElement.replaceWith(restoredElement);

                // Load comments for the message (comments are visible by default)
                if (window.loadCommentsForMessage) {
                    window.loadCommentsForMessage(id);
                } else {
                    console.error('window.loadCommentsForMessage is not available');
                }
            }
        }
    } else if (action === 'copy') {
        const messageToCopy = window.messages.find(m => m.id == id);
        if (messageToCopy && navigator.clipboard) {
            navigator.clipboard.writeText(messageToCopy.content)
                .then(() => {
                    const originalHTML = button.innerHTML;
                    button.textContent = 'Copied!';
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
    } else if (action === 'reply') {
        const commentsContainer = document.getElementById(`comments-for-${id}`);
        if (commentsContainer) {
            // Check if comments are already loaded
            if (commentsContainer.dataset.loaded === 'true') {
                // Comments are loaded, toggle the entire comment container visibility
                commentsContainer.classList.toggle('hidden');
            } else {
                // Comments not loaded yet, load them
                if (window.loadCommentsForMessage) {
                    window.loadCommentsForMessage(id);
                } else {
                    console.error('window.loadCommentsForMessage is not available');
                }
            }
        }
    }
};

// Make function globally available
window.handleMessageClick = handleMessageClick;