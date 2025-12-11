document.addEventListener('DOMContentLoaded', () => {

    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messageList = document.getElementById('message-list');
    
    // --- Global State and Instances ---
    let messages = [];
    const converter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        strikethrough: true,
        tables: true,
        noHeaderId: false
    });

    // --- Helper Functions ---
    const createButton = (text, id, action) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.dataset.id = id;
        button.dataset.action = action;
        let colors = '';
        if (action === 'delete') {
            colors = 'bg-red-700 hover:bg-red-800';
        } else if (action === 'edit') {
            colors = 'bg-blue-600 hover:bg-blue-700';
        } else if (action === 'copy') { 
            colors = 'bg-gray-600 hover:bg-gray-700';
        }
        button.className = `text-white text-xs font-bold py-1 px-2 rounded-md transition-colors ${colors}`;
        return button;
    };

    // --- Main Rendering Function ---
    const renderMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'bg-gray-800 p-4 rounded-lg shadow-md animate-fade-in flex flex-col';
        messageElement.dataset.messageId = message.id;

        // Convert markdown to HTML and apply typography styles
        const contentDiv = document.createElement('div');
        contentDiv.className = 'prose prose-invert max-w-none text-gray-300 mb-2'; // prose-invert for dark mode
        contentDiv.innerHTML = converter.makeHtml(message.content);

        const footer = document.createElement('div');
        footer.className = 'flex justify-between items-center';

        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500';
        timestamp.textContent = new Date(message.timestamp).toLocaleString();

        const actions = document.createElement('div');
        actions.className = 'flex gap-2';
        actions.appendChild(createButton('Copy', message.id, 'copy'));
        actions.appendChild(createButton('Edit', message.id, 'edit'));
        actions.appendChild(createButton('Delete', message.id, 'delete'));
        
        footer.appendChild(timestamp);
        footer.appendChild(actions);
        
        messageElement.appendChild(contentDiv);
        messageElement.appendChild(footer);

        return messageElement;
    };

    // --- API & Rendering Logic ---
    const fetchAndRenderMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) throw new Error('Failed to fetch messages.');
            
            // Store messages in global state
            messages = await response.json();
            
            messageList.innerHTML = ''; 
            messages.forEach(message => {
                messageList.appendChild(renderMessage(message));
            });
        } catch (error) {
            console.error('Error:', error);
            messageList.innerHTML = '<p class="text-red-500 text-center">Could not load messages.</p>';
        }
    };

    // --- Event Handlers ---
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (response.status === 201) {
                messageInput.value = '';
                fetchAndRenderMessages();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Error submitting message:', error);
            alert('Failed to post message.');
        }
    };

    const handleMessageClick = (e) => {
        const { action, id } = e.target.dataset;
        if (!action || !id) return;

        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this message?')) {
                deleteMessage(id);
            }
        } else if (action === 'edit') {
            toggleEditView(id);
        } else if (action === 'save') {
            saveMessage(id);
        } else if (action === 'cancel') {
            fetchAndRenderMessages(); // Easiest way to revert is to re-render
        } else if (action === 'copy') {
            const messageToCopy = messages.find(m => m.id == id);
            if (messageToCopy && navigator.clipboard) {
                navigator.clipboard.writeText(messageToCopy.content)
                    .then(() => {
                        alert('Message copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Failed to copy message: ', err);
                        alert('Failed to copy message.');
                    });
            } else {
                alert('Clipboard API not supported or message not found.');
            }
        }
    };
    
    const deleteMessage = async (id) => {
        try {
            const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            if (response.status === 204) {
                fetchAndRenderMessages();
            } else {
                throw new Error('Failed to delete message.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };
    
    const saveMessage = async (id) => {
        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const input = messageElement.querySelector('textarea');
        const content = input.value.trim();
        if (!content) return;

        try {
            const response = await fetch(`/api/messages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (response.ok) {
                fetchAndRenderMessages();
            } else {
                throw new Error('Failed to save message.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    const toggleEditView = (id) => {
        const originalMessage = messages.find(m => m.id == id);
        if (!originalMessage) return;

        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const contentDiv = messageElement.querySelector('.prose');
        const footer = messageElement.querySelector('.flex.justify-between');
        
        // Create an input area with the raw markdown
        const editInput = document.createElement('textarea');
        editInput.className = 'w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow text-gray-200';
        editInput.value = originalMessage.content;
        editInput.rows = 4;

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

    // --- Initial Setup ---
    messageForm.addEventListener('submit', handlePostSubmit);
    messageList.addEventListener('click', handleMessageClick);
    fetchAndRenderMessages();

    // Add a simple fade-in animation using CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
});
