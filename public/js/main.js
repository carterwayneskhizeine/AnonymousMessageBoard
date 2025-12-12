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
        const icons = {
            copy: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m11.25 0A2.25 2.25 0 0120.25 9v6.75A2.25 2.25 0 0118 18h-2.25m-1.5-4.125v4.125m-1.5-4.125h4.125m-4.125 0L18 8.25m-1.5 8.25L12 12" /></svg>`,
            edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`,
            delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.14-2.006-2.14H9.75c-1.096 0-2.006.96-2.006 2.14v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`,
            save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`,
            cancel: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`
        };

        const button = document.createElement('button');
        button.innerHTML = icons[action] || '';
        button.title = text;
        button.dataset.id = id;
        button.dataset.action = action;
        let colors = '';
        // Apply gray color scheme to all buttons
        colors = 'bg-gray-600 hover:bg-gray-700';
        button.className = `text-white text-sm p-2 rounded-md transition-colors ${colors}`;
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
        timestamp.textContent = new Date(message.timestamp + 'Z').toLocaleString('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        });

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

            if (response.ok) {
                const newMessage = await response.json();
                // 将新消息添加到本地数组的开头
                messages.unshift(newMessage);
                // 重新渲染消息列表
                messageList.innerHTML = '';
                messages.forEach(message => {
                    messageList.appendChild(renderMessage(message));
                });
                messageInput.value = '';
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
        const button = e.target.closest('button');
        if (!button) return;

        const { action, id } = button.dataset;
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
            const originalMessage = messages.find(m => m.id == id);
            if (originalMessage) {
                const messageElement = document.querySelector(`[data-message-id='${id}']`);
                const restoredElement = renderMessage(originalMessage);
                messageElement.replaceWith(restoredElement);
            }
        } else if (action === 'copy') {
            const messageToCopy = messages.find(m => m.id == id);
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
        }
    };
    
    const deleteMessage = async (id) => {
        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const originalIndex = messages.findIndex(m => m.id == id);
        const originalMessage = messages[originalIndex];

        // Optimistically remove from DOM
        if (messageElement) {
            messageElement.remove();
        }
        // And from local state
        messages = messages.filter(m => m.id != id);

        try {
            const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            if (response.status !== 204) {
                throw new Error('Server failed to delete message.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            // On error, restore the message in the local array and re-render
            if(originalMessage && originalIndex !== -1) {
                messages.splice(originalIndex, 0, originalMessage);
            }
            fetchAndRenderMessages(); // Fallback to full render on error
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
                const updatedMessage = await response.json();
            
                // Update local messages array
                const index = messages.findIndex(m => m.id == id);
                if (index !== -1) {
                    messages[index] = updatedMessage;
                }

                // Create a new rendered element for the updated message
                const newMessageElement = renderMessage(updatedMessage);
                
                // Replace the old element with the new one
                messageElement.replaceWith(newMessageElement);
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
