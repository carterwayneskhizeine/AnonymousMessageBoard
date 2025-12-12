document.addEventListener('DOMContentLoaded', () => {

    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messageList = document.getElementById('message-list');

    // 新增 DOM 元素
    const keyButton = document.getElementById('key-button');
    const privateKeyInput = document.getElementById('private-key-input');
    const sendKeyButton = document.getElementById('send-key-button');
    const postMessageButton = document.getElementById('post-message-button');
    const messageTypeModal = document.getElementById('message-type-modal');
    const publicOption = document.getElementById('public-option');
    const privateOption = document.getElementById('private-option');
    const typeSelection = document.getElementById('type-selection');
    const privateKeyEntry = document.getElementById('private-key-entry');
    const modalPrivateKey = document.getElementById('modal-private-key');
    const confirmPrivate = document.getElementById('confirm-private');
    const cancelPrivate = document.getElementById('cancel-private');
    const errorMessage = document.getElementById('error-message');

    // 认证相关 DOM 元素
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const guestView = document.getElementById('guest-view');
    const userView = document.getElementById('user-view');
    const usernameDisplay = document.getElementById('username-display');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    const cancelLogin = document.getElementById('cancel-login');
    const cancelRegister = document.getElementById('cancel-register');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerFromLoginBtn = document.getElementById('register-from-login');
    
    // --- Global State and Instances ---
    let messages = [];
    let currentUser = null;
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

    // --- Authentication Helper Functions ---
    const updateUIForUser = (user) => {
        if (user) {
            currentUser = user;
            guestView.classList.add('hidden');
            userView.classList.remove('hidden');
            usernameDisplay.textContent = user.username;

            // 如果用户已登录，隐藏KEY输入框（因为会自动显示私有消息）
            if (privateKeyInput.classList.contains('hidden')) {
                // KEY输入框已隐藏，不需要操作
            } else {
                // 如果KEY输入框显示，隐藏它并重新加载消息
                privateKeyInput.classList.add('hidden');
                sendKeyButton.classList.add('hidden');
                fetchAndRenderMessages();
            }
        } else {
            currentUser = null;
            guestView.classList.remove('hidden');
            userView.classList.add('hidden');
        }
    };

    const showError = (element, message) => {
        element.textContent = message;
        element.classList.remove('hidden');
    };

    const clearError = (element) => {
        element.textContent = '';
        element.classList.add('hidden');
    };

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                updateUIForUser(data.user);
                return data.user;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
        return null;
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

        // 为 private 消息添加锁图标
        if (message.is_private === 1) {
            const privateLabel = document.createElement('div');
            privateLabel.className = 'text-xs text-blue-400 font-bold mb-1 flex items-center gap-1';
            privateLabel.innerHTML = 'Private';
            messageElement.appendChild(privateLabel);
        }

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
            // 获取当前输入的 private key
            const currentPrivateKey = privateKeyInput.value.trim();

            // 构建 URL
            let url = '/api/messages';
            if (currentPrivateKey) {
                url += `?privateKey=${encodeURIComponent(currentPrivateKey)}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages.');

            const data = await response.json();
            messages = data.messages || data; // 支持两种响应格式

            // 更新用户状态（如果API返回了userId）
            if (data.userId && !currentUser) {
                // 如果API返回了userId但前端不知道，重新检查认证状态
                await checkAuthStatus();
            }

            // 渲染消息
            messageList.innerHTML = '';
            messages.forEach(message => {
                messageList.appendChild(renderMessage(message));
            });

            // 错误提示处理
            if (currentPrivateKey) {
                // 使用后端返回的 hasPrivateMessages 标志，如果不存在则回退到前端检查
                const hasPrivateMessages = data.hasPrivateMessages !== undefined
                    ? data.hasPrivateMessages
                    : messages.some(m => m.is_private === 1);

                if (!hasPrivateMessages) {
                    errorMessage.textContent = '没有找到匹配的消息';
                    errorMessage.classList.remove('hidden');
                } else {
                    errorMessage.classList.add('hidden');
                }
            } else {
                errorMessage.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            messageList.innerHTML = '<p class="text-red-500 text-center">Could not load messages.</p>';
            errorMessage.classList.add('hidden');
        }
    };

    // --- Event Handlers ---
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content) return;

        // 存储消息内容，稍后发送
        messageTypeModal.dataset.pendingContent = content;

        // 重置模态框状态
        typeSelection.classList.remove('hidden');
        privateKeyEntry.classList.add('hidden');
        modalPrivateKey.value = '';

        // 显示模态框
        messageTypeModal.showModal();
    };

    // 发送消息到 API
    const postMessageToAPI = async (content, isPrivate, privateKey) => {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, isPrivate, privateKey }),
            });

            if (response.ok) {
                const newMessage = await response.json();

                // 如果是 public 消息，立即显示
                if (!isPrivate) {
                    messages.unshift(newMessage);
                    messageList.innerHTML = '';
                    messages.forEach(message => {
                        messageList.appendChild(renderMessage(message));
                    });
                } else if (currentUser) {
                    // 如果用户已登录且发送私有消息，立即显示（因为用户可以看到自己的私有消息）
                    messages.unshift(newMessage);
                    messageList.innerHTML = '';
                    messages.forEach(message => {
                        messageList.appendChild(renderMessage(message));
                    });
                }
                // 未登录用户发送的私有消息不显示

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

    // KEY 按钮事件监听器
    keyButton.addEventListener('click', (e) => {
        e.preventDefault();
        const isShowingKeyInput = !privateKeyInput.classList.contains('hidden');

        if (isShowingKeyInput) {
            // 隐藏 KEY 输入框和 Send 按钮，显示 Post Message 按钮
            privateKeyInput.classList.add('hidden');
            sendKeyButton.classList.add('hidden');
            postMessageButton.classList.remove('hidden');
            privateKeyInput.value = '';
            fetchAndRenderMessages(); // 重新加载（只显示 public）
        } else {
            // 显示 KEY 输入框和 Send 按钮，隐藏 Post Message 按钮
            privateKeyInput.classList.remove('hidden');
            sendKeyButton.classList.remove('hidden');
            postMessageButton.classList.add('hidden');
            privateKeyInput.focus();
        }
    });

    // 监听 KEY 输入框的回车键
    privateKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchAndRenderMessages();
        }
    });

    // Send 按钮点击事件
    sendKeyButton.addEventListener('click', () => {
        fetchAndRenderMessages();
    });

    // 模态框按钮事件监听器
    publicOption.addEventListener('click', async () => {
        const content = messageTypeModal.dataset.pendingContent;
        messageTypeModal.close();
        await postMessageToAPI(content, false, null);
    });

    privateOption.addEventListener('click', () => {
        typeSelection.classList.add('hidden');
        privateKeyEntry.classList.remove('hidden');
        modalPrivateKey.focus();
    });

    cancelPrivate.addEventListener('click', () => {
        typeSelection.classList.remove('hidden');
        privateKeyEntry.classList.add('hidden');
        modalPrivateKey.value = '';
    });

    confirmPrivate.addEventListener('click', async () => {
        const privateKey = modalPrivateKey.value.trim();

        // 如果用户已登录，不需要private_key
        if (!currentUser && !privateKey) {
            alert('KEY cannot be empty!');
            return;
        }

        const content = messageTypeModal.dataset.pendingContent;
        messageTypeModal.close();
        await postMessageToAPI(content, true, privateKey);
    });

    // --- Authentication Event Handlers ---
    // Login button
    loginBtn.addEventListener('click', () => {
        clearError(loginError);
        loginUsername.value = '';
        loginPassword.value = '';
        loginModal.showModal();
    });

    // Register from login button (in login modal)
    registerFromLoginBtn.addEventListener('click', () => {
        // Close login modal
        loginModal.close();
        // Clear any errors
        clearError(registerError);
        // Clear form fields
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        // Show register modal
        registerModal.showModal();
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (response.ok) {
                updateUIForUser(null);
                fetchAndRenderMessages(); // 重新加载消息（不再显示私有消息）
            } else {
                const errorData = await response.json();
                alert(`登出失败: ${errorData.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('登出失败，请重试');
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(loginError);

        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password) {
            showError(loginError, 'Username and password cannot be empty');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                loginModal.close();
                updateUIForUser(data.user);
                fetchAndRenderMessages(); // 重新加载消息（显示用户的私有消息）
            } else {
                showError(loginError, data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(loginError, 'Network error, please try again');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(registerError);

        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();

        if (!username || !password || !confirmPassword) {
            showError(registerError, 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            showError(registerError, 'Passwords do not match');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            showError(registerError, 'Username must be between 3-20 characters');
            return;
        }

        if (password.length < 6) {
            showError(registerError, 'Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerModal.close();
                // Clear login form errors
                clearError(loginError);
                loginUsername.value = '';
                loginPassword.value = '';
                updateUIForUser(data.user);
                fetchAndRenderMessages(); // 重新加载消息
            } else {
                showError(registerError, data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError(registerError, 'Network error, please try again');
        }
    });

    // Cancel login
    cancelLogin.addEventListener('click', () => {
        loginModal.close();
    });

    // Cancel register
    cancelRegister.addEventListener('click', () => {
        registerModal.close();
        // Clear login form errors and show login modal
        clearError(loginError);
        loginModal.showModal();
    });

    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.close();
        }
    });

    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.close();
            // Clear login form errors and show login modal
            clearError(loginError);
            loginModal.showModal();
        }
    });

    // Check authentication status on page load
    checkAuthStatus().then(user => {
        if (user) {
            console.log('User is logged in:', user.username);
        }
    });

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
