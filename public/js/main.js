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

    // 图片上传相关 DOM 元素
    const imageUpload = document.getElementById('image-upload');
    const uploadImageButton = document.getElementById('upload-image-button');
    const imageStatus = document.getElementById('image-status');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageButton = document.getElementById('remove-image-button');
    const imageInfo = document.getElementById('image-info');

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
    let selectedImage = null; // { file: File, previewUrl: string, uploadedData: object }
    const converter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        strikethrough: true,
        tables: true,
        noHeaderId: false
    });

    // --- Helper Functions ---
    const createButton = (text, id, action) => {
        const icons = {
            copy: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.43 0 0 1.43 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-8, -7.5)" d="M 2.5 1 C 1.675781 1 1 1.675781 1 2.5 L 1 10.5 C 1 11.324219 1.675781 12 2.5 12 L 4 12 L 4 12.5 C 4 13.324219 4.675781 14 5.5 14 L 13.5 14 C 14.324219 14 15 13.324219 15 12.5 L 15 4.5 C 15 3.675781 14.324219 3 13.5 3 L 12 3 L 12 2.5 C 12 1.675781 11.324219 1 10.5 1 Z M 2.5 2 L 10.5 2 C 10.78125 2 11 2.21875 11 2.5 L 11 10.5 C 11 10.78125 10.78125 11 10.5 11 L 2.5 11 C 2.21875 11 2 10.78125 2 10.5 L 2 2.5 C 2 2.21875 2.21875 2 2.5 2 Z M 12 4 L 13.5 4 C 13.78125 4 14 4.21875 14 4.5 L 14 12.5 C 14 12.78125 13.78125 13 13.5 13 L 5.5 13 C 5.21875 13 5 12.78125 5 12.5 L 5 12 L 10.5 12 C 11.324219 12 12 11.324219 12 10.5 Z" stroke-linecap="round" /></g></svg>`,
            edit: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.53 0 0 0.53 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-24, -24)" d="M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 C 4.909599585679415 41.61136473005194 5.055818649159609 42.174475161087585 5.440671944485212 42.559328331832646 C 5.8255252398108155 42.944181502577706 6.388635718178886 43.090400383773854 6.9121094 42.941406 L 17.302734 39.974609 C 17.30338593263404 39.97395859988369 17.304037266243494 39.97330759960771 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 C 38.82682299993104 9.171875423758669 38.82747400006896 9.171875423758669 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 C 10.91015642375867 31.52083300006896 10.91015642375867 31.52018199993104 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z" stroke-linecap="round" /></g></svg>`,
            delete: `<svg id='Delete_Bin_1_24' width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.43 0 0 1.43 12 12)" ><g style="" ><g transform="matrix(1 0 0 1 0 2.5)" ><polyline style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" points="4.5,-4 3.5,4 -3.5,4 -4.5,-4 " /></g><g transform="matrix(1 0 0 1 0 -3.5)" ><line style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" x1="-6" y1="0" x2="6" y2="0" /></g><g transform="matrix(1 0 0 1 -0.04 -5.02)" ><path style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" transform=" translate(-6.96, -1.98)" d="M 4.46 3.21 L 4.46 1.48 C 4.46 0.9277152501692065 4.907715250169207 0.48 5.46 0.48 L 8.46 0.48 C 9.012284749830794 0.48 9.46 0.9277152501692063 9.46 1.4799999999999998 L 9.46 3.48" stroke-linecap="round" /></g></g></g></svg>`,
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
        colors = 'border border-gray-700 hover:border-gray-100 text-gray-200 hover:text-gray-100';
        button.className = `text-sm p-2 rounded-md transition-colors ${colors}`;
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

    // --- Image Upload Helper Functions ---
    const uploadImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            return await response.json();
        } catch (error) {
            console.error('Image upload error:', error);
            throw error;
        }
    };

    const clearSelectedImage = () => {
        if (selectedImage && selectedImage.previewUrl) {
            URL.revokeObjectURL(selectedImage.previewUrl);
        }
        selectedImage = null;
        imagePreviewContainer.classList.add('hidden');
        imageStatus.textContent = 'No image selected';
        imageStatus.classList.remove('text-green-400');
        imageStatus.classList.add('text-gray-500');
        imageUpload.value = '';
    };

    const updateImagePreview = (file) => {
        // Clear previous image
        clearSelectedImage();

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);

        // Update state
        selectedImage = {
            file: file,
            previewUrl: previewUrl,
            uploadedData: null
        };

        // Update UI
        imagePreview.src = previewUrl;
        imagePreview.alt = file.name;
        imageInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        imagePreviewContainer.classList.remove('hidden');
        imageStatus.textContent = 'Image selected';
        imageStatus.classList.remove('text-gray-500');
        imageStatus.classList.add('text-green-400');
    };

    // --- Main Rendering Function ---
    const renderMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'bg-black border border-gray-800 p-4 rounded-lg shadow-md animate-fade-in flex flex-col group';
        messageElement.dataset.messageId = message.id;

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'mb-2';

        // 显示图片（如果有）
        if (message.has_image === 1 && message.image_filename) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'mb-3';

            const img = document.createElement('img');
            img.src = `/uploads/${message.image_filename}`;
            img.alt = 'Uploaded image';
            img.className = 'max-w-full max-h-96 rounded-lg border border-gray-800 cursor-pointer hover:opacity-90 transition-opacity';

            // 添加点击放大功能
            img.addEventListener('click', () => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4';
                modal.innerHTML = `
                    <div class="relative max-w-4xl max-h-[90vh]">
                        <img src="${img.src}" alt="Full size image" class="max-w-full max-h-[90vh] rounded-lg">
                        <button class="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                `;

                modal.querySelector('button').addEventListener('click', () => {
                    document.body.removeChild(modal);
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });

                document.body.appendChild(modal);
            });

            // 添加图片信息
            const imageInfo = document.createElement('div');
            imageInfo.className = 'text-xs text-gray-500 mt-1';
            let infoText = 'Image';
            if (message.image_size) {
                infoText += ` • ${(message.image_size / 1024).toFixed(1)} KB`;
            }
            if (message.image_mime_type) {
                infoText += ` • ${message.image_mime_type.split('/')[1].toUpperCase()}`;
            }
            imageInfo.textContent = infoText;

            imageContainer.appendChild(img);
            imageContainer.appendChild(imageInfo);
            contentContainer.appendChild(imageContainer);
        }

        // Convert markdown to HTML and apply typography styles (如果有文本内容)
        if (message.content && message.content.trim() !== '') {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'prose prose-invert max-w-none text-gray-200';
            contentDiv.innerHTML = converter.makeHtml(message.content);

            // Add copy buttons to code blocks
            const codeBlocks = contentDiv.querySelectorAll('pre code');
            codeBlocks.forEach((codeBlock) => {
                const pre = codeBlock.parentElement;
                if (pre.querySelector('.copy-code-btn')) return; // Avoid duplicates

                pre.classList.add('relative', 'group/code');

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-code-btn absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-xs px-2 py-1 rounded border border-gray-700 text-gray-200 hover:border-gray-100 hover:text-gray-100 opacity-0 group-hover/code:opacity-100 transition-all duration-200 z-10';
                copyButton.innerHTML = 'Copy';
                copyButton.title = 'Copy code';
                copyButton.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(codeBlock.textContent.trim())
                        .then(() => {
                            const original = copyButton.innerHTML;
                            copyButton.innerHTML = 'Copied!';
                            copyButton.classList.add('text-green-400', 'border-green-400');
                            setTimeout(() => {
                                copyButton.innerHTML = original;
                                copyButton.classList.remove('text-green-400', 'border-green-400');
                            }, 2000);
                        })
                        .catch(err => console.error('Copy failed:', err));
                };
                pre.appendChild(copyButton);
            });

            contentContainer.appendChild(contentDiv);

        // 为 private 消息添加 KEY 显示
        if (message.is_private === 1) {
            const privateLabel = document.createElement('div');
            privateLabel.className = 'text-xs text-gray-500 font-bold mb-1 flex items-center gap-1';

            // 创建 "Private" 文本
            const privateText = document.createElement('span');
            privateText.textContent = 'Private';

            // 创建 KEY 显示
            const keyDisplay = document.createElement('span');
            keyDisplay.className = 'text-gray-200 font-mono text-xs bg-black px-2 py-1 rounded border border-gray-800 ml-2';

            if (message.private_key && message.private_key.trim() !== '') {
                keyDisplay.textContent = `KEY: ${message.private_key}`;
                // 添加复制功能提示
                keyDisplay.title = 'Click to copy KEY';
                keyDisplay.style.cursor = 'pointer';

                // 添加点击复制功能
                keyDisplay.addEventListener('click', (e) => {
                    e.stopPropagation(); // 防止事件冒泡
                    navigator.clipboard.writeText(message.private_key).then(() => {
                        const originalText = keyDisplay.textContent;
                        keyDisplay.textContent = 'KEY copied!';
                        keyDisplay.className = 'text-gray-100 font-mono text-xs bg-black px-2 py-1 rounded border border-gray-100 ml-2';

                        // 2秒后恢复原状
                        setTimeout(() => {
                            keyDisplay.textContent = originalText;
                            keyDisplay.className = 'text-gray-200 font-mono text-xs bg-black px-2 py-1 rounded border border-gray-800 ml-2';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy KEY:', err);
                    });
                });
            } else {
                keyDisplay.textContent = 'KEY: (not set)';
                keyDisplay.className = 'text-gray-500 font-mono text-xs bg-black px-2 py-1 rounded border border-gray-800 ml-2';
            }

            // 组装所有元素
            privateLabel.appendChild(privateText);
            privateLabel.appendChild(keyDisplay);

            contentContainer.appendChild(privateLabel);
        }

        const footer = document.createElement('div');
        footer.className = 'flex justify-between items-center';

        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-600';
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
        actions.className = 'flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200';
        actions.appendChild(createButton('Copy', message.id, 'copy'));
        actions.appendChild(createButton('Edit', message.id, 'edit'));
        actions.appendChild(createButton('Delete', message.id, 'delete'));

        footer.appendChild(timestamp);
        footer.appendChild(actions);

        messageElement.appendChild(contentContainer);
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
                    errorMessage.textContent = 'No matching message found';
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

        // 验证：消息必须有内容或图片
        if (!content && !selectedImage) {
            alert('Message must have either text content or an image');
            return;
        }

        try {
            // 如果有图片，先上传图片
            let imageData = null;
            if (selectedImage && selectedImage.file) {
                imageStatus.textContent = 'Uploading image...';
                imageData = await uploadImage(selectedImage.file);
                selectedImage.uploadedData = imageData;
                imageStatus.textContent = 'Image uploaded';
            }

            // 存储消息内容和图片数据，稍后发送
            messageTypeModal.dataset.pendingContent = content;
            if (imageData) {
                messageTypeModal.dataset.imageData = JSON.stringify(imageData);
            } else {
                delete messageTypeModal.dataset.imageData;
            }

            // 重置模态框状态
            typeSelection.classList.remove('hidden');
            privateKeyEntry.classList.add('hidden');
            modalPrivateKey.value = '';

            // 显示模态框
            messageTypeModal.showModal();
        } catch (error) {
            console.error('Error in message submission:', error);
            alert(`Error: ${error.message}`);
            // 恢复图片状态
            if (selectedImage) {
                imageStatus.textContent = 'Image selected';
            }
        }
    };

    // 发送消息到 API
    const postMessageToAPI = async (content, isPrivate, privateKey) => {
        try {
            // 获取图片数据
            let imageData = null;
            if (messageTypeModal.dataset.imageData) {
                try {
                    imageData = JSON.parse(messageTypeModal.dataset.imageData);
                } catch (e) {
                    console.error('Failed to parse image data:', e);
                }
            }

            // 构建请求体
            const requestBody = {
                content,
                isPrivate,
                privateKey
            };

            // 添加图片信息
            if (imageData) {
                requestBody.hasImage = true;
                requestBody.imageFilename = imageData.filename;
                requestBody.imageMimeType = imageData.mimeType;
                requestBody.imageSize = imageData.size;
            }

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
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
                clearSelectedImage(); // 清除图片状态
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

        // 如果消息有图片，不允许编辑（因为一个消息只能有一张图片，编辑时不能删除图片）
        if (originalMessage.has_image === 1) {
            alert('Cannot edit messages with images. You can only edit the text content of image messages by deleting and reposting.');
            return;
        }

        const messageElement = document.querySelector(`[data-message-id='${id}']`);
        const contentContainer = messageElement.querySelector('.mb-2');
        const footer = messageElement.querySelector('.flex.justify-between');

        // 找到文本内容div（如果有）
        const contentDiv = contentContainer.querySelector('.prose');
        if (!contentDiv) {
            alert('No text content to edit');
            return;
        }

        // Create an input area with the raw markdown
        const editInput = document.createElement('textarea');
        editInput.className = 'w-full p-2 bg-black border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-100 focus:outline-none transition-shadow text-gray-200';
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

    // 图片上传事件监听器
    uploadImageButton.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
            imageUpload.value = '';
            return;
        }

        // 检查文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image file is too large. Maximum size is 10MB.');
            imageUpload.value = '';
            return;
        }

        updateImagePreview(file);
    });

    removeImageButton.addEventListener('click', clearSelectedImage);

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
            // 隐藏错误提示
            errorMessage.classList.add('hidden');
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

        // 所有私有消息都需要KEY
        if (!privateKey) {
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
