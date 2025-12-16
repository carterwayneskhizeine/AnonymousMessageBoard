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

    // 文件上传相关 DOM 元素
    const fileUpload = document.getElementById('file-upload');
    const uploadFileButton = document.getElementById('upload-file-button');
    const fileStatus = document.getElementById('file-status');
    const filePreviewContainer = document.getElementById('file-preview-container');
    const filePreviewContent = document.getElementById('file-preview-content');
    const filePreviewName = document.getElementById('file-preview-name');
    const filePreviewType = document.getElementById('file-preview-type');
    const filePreviewSize = document.getElementById('file-preview-size');
    const removeFileButton = document.getElementById('remove-file-button');

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
    let selectedFile = null; // { file: File, previewUrl: string, uploadedData: object, isImage: boolean }
    let currentPage = 1;
    let totalPages = 1;
    let currentPrivateKey = '';
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

    // --- File Upload Helper Functions ---
    const uploadFile = async (file) => {
        return new Promise((resolve, reject) => {
            // Create XMLHttpRequest to handle progress events
            const xhr = new XMLHttpRequest();

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Set up progress tracking
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    fileStatus.textContent = `Uploading: ${Math.round(percentComplete)}%`;
                }
            });

            // Handle upload completion
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (parseError) {
                        console.error('Error parsing upload response:', parseError);
                        reject(new Error('Invalid response from server'));
                    }
                } else {
                    let errorMessage = 'Upload failed';
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        errorMessage = errorData.error || `Upload failed with status: ${xhr.status}`;
                    } catch (parseError) {
                        console.error('Error parsing error response:', parseError);
                        errorMessage = `Upload failed with status: ${xhr.status}`;
                    }
                    reject(new Error(errorMessage));
                }
            });

            // Handle upload error
            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload - server may be unavailable'));
            });

            // Handle timeout
            xhr.addEventListener('timeout', () => {
                reject(new Error('Upload timed out - please try again'));
            });

            // Handle abort (if needed)
            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            // Configure and send request
            xhr.open('POST', '/api/upload-file');
            xhr.timeout = 300000; // 5 minutes timeout
            xhr.send(formData);
        });
    };

    const clearSelectedFile = () => {
        if (selectedFile && selectedFile.previewUrl) {
            URL.revokeObjectURL(selectedFile.previewUrl);
        }
        selectedFile = null;
        filePreviewContainer.classList.add('hidden');
        fileStatus.textContent = 'No file selected';
        fileStatus.classList.remove('text-green-400');
        fileStatus.classList.add('text-gray-500');
        fileUpload.value = '';
    };

    const updateFilePreview = (file) => {
        // Clear previous file
        clearSelectedFile();

        // Determine if file is an image
        const isImage = file.type.startsWith('image/');

        // Update state
        selectedFile = {
            file: file,
            previewUrl: isImage ? URL.createObjectURL(file) : null,
            uploadedData: null,
            isImage: isImage
        };

        // Update UI
        if (isImage) {
            // Show preview image
            filePreviewContent.innerHTML = `
                <img src="${selectedFile.previewUrl}" alt="File preview" class="max-h-40 rounded-lg border border-gray-800">
                <div class="text-xs text-gray-500 mt-2">${file.name}</div>
                <div class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB • ${file.type}</div>
            `;
        } else {
            // Show file icon and info for non-image files
            filePreviewContent.innerHTML = `
                <div class="text-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div class="text-center text-sm text-gray-300 break-all">${file.name}</div>
                <div class="text-center text-xs text-gray-500 mt-1">${file.type || 'Unknown type'}</div>
                <div class="text-center text-xs text-gray-500 mt-1">${(file.size / 1024).toFixed(1)} KB</div>
            `;
        }

        filePreviewContainer.classList.remove('hidden');
        fileStatus.textContent = 'File selected';
        fileStatus.classList.remove('text-gray-500');
        fileStatus.classList.add('text-green-400');
    };

    // --- Main Rendering Function ---
    const renderMessage = (message) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'bg-black border border-gray-800 p-4 rounded-lg shadow-md animate-fade-in flex flex-col group';
        messageElement.dataset.messageId = message.id;

        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.className = 'mb-2';

        // 显示文件（如果有）
        if (message.has_image === 1 && message.image_filename) {
            const fileContainer = document.createElement('div');
            fileContainer.className = 'mb-3';

            // 检查文件类型以决定如何显示
            const isImage = message.image_mime_type && message.image_mime_type.startsWith('image/');

            if (isImage) {
                // 显示图片预览
                let imageUrl = `/uploads/${message.image_filename}`;
                // 如果是私有消息，添加 private key 作为查询参数
                if (message.is_private === 1 && message.private_key) {
                    imageUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
                }
                const img = document.createElement('img');
                img.src = imageUrl;
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

                fileContainer.appendChild(img);
                fileContainer.appendChild(imageInfo);
            } else {
                // 显示文件下载链接
                const fileCard = document.createElement('div');
                fileCard.className = 'p-3 bg-gray-900 rounded-lg border border-gray-800 flex items-center';

                // 文件图标
                const fileIcon = document.createElement('div');
                fileIcon.className = 'mr-3';
                fileIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                `;

                // 文件信息和下载链接
                const fileInfo = document.createElement('div');
                fileInfo.className = 'flex-1 min-w-0';

                const fileName = document.createElement('div');
                fileName.className = 'text-sm font-medium text-gray-200 truncate';
                fileName.textContent = message.image_filename;

                const fileInfoText = document.createElement('div');
                fileInfoText.className = 'text-xs text-gray-500';
                let fileInfoStr = message.image_mime_type || 'File';
                if (message.image_size) {
                    fileInfoStr += ` • ${(message.image_size / 1024).toFixed(1)} KB`;
                }
                fileInfoText.textContent = fileInfoStr;

                // 下载链接
                let downloadUrl = `/uploads/${message.image_filename}`;
                // 如果是私有消息，添加 private key 作为查询参数
                if (message.is_private === 1 && message.private_key) {
                    downloadUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
                }
                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = message.image_filename;
                downloadLink.className = 'inline-block mt-1 text-sm text-blue-400 hover:text-blue-300';
                downloadLink.innerHTML = 'Download File <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>';

                fileInfo.appendChild(fileName);
                fileInfo.appendChild(fileInfoText);
                fileInfo.appendChild(downloadLink);

                fileCard.appendChild(fileIcon);
                fileCard.appendChild(fileInfo);

                fileContainer.appendChild(fileCard);
            }

            contentContainer.appendChild(fileContainer);
        }

        // 为 private 消息添加 KEY 显示 (放在内容之前)
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

                // Create a wrapper div to contain both the pre element and the copy button
                const wrapper = document.createElement('div');
                wrapper.className = 'relative group';

                // Replace the pre element with the wrapper
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);

                // Add overflow-x-auto to the pre element for scrolling
                pre.classList.add('overflow-x-auto');

                const copyButton = document.createElement('button');
                copyButton.className = 'copy-code-btn absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-xs px-2 py-1 rounded border border-gray-700 text-gray-200 hover:border-gray-100 hover:text-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10';
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

                // Add the copy button as a child of the wrapper (not the pre element)
                wrapper.appendChild(copyButton);
            });

            contentContainer.appendChild(contentDiv);
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
    const fetchAndRenderMessages = async (page = 1) => {
        try {
            // 更新当前页码
            currentPage = page;

            // 获取当前输入的 private key
            currentPrivateKey = privateKeyInput.value.trim();

            // 构建 URL
            let url = `/api/messages?page=${page}&limit=5`;
            if (currentPrivateKey) {
                url += `&privateKey=${encodeURIComponent(currentPrivateKey)}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages.');

            const data = await response.json();
            messages = data.messages || [];
            totalPages = data.pagination?.totalPages || 1;

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

            // 渲染分页控件
            renderPagination();

            // 错误提示处理
            if (currentPrivateKey) {
                // 使用后端返回的 hasPrivateMessages 标志，如果不存在则回退到前端检查
                const hasPrivateMessages = data.hasPrivateMessages !== undefined ?
                    data.hasPrivateMessages :
                    messages.some(m => m.is_private === 1);

                if (!hasPrivateMessages) {
                    errorMessage.textContent = 'No matching message found';
                    errorMessage.classList.remove('hidden');
                } else {
                    errorMessage.classList.add('hidden');
                }
            } else {
                errorMessage.classList.add('hidden');
            }

            // 更新URL状态
            updateURL();
        } catch (error) {
            console.error('Error:', error);
            messageList.innerHTML = '<p class="text-red-500 text-center">Could not load messages.</p>';
            errorMessage.classList.add('hidden');
        }
    };

    // --- Pagination Functions ---
    const renderPagination = () => {
        // 移除现有的分页控件
        const existingPagination = document.getElementById('pagination-controls');
        if (existingPagination) {
            existingPagination.remove();
        }

        // 如果只有一页，不显示分页
        if (totalPages <= 1) return;

        // 创建分页容器
        const paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-controls';
        paginationContainer.className = 'flex justify-center items-center gap-2 mt-8';

        // 计算要显示的页码
        const pagesToShow = calculatePagesToShow(currentPage, totalPages);

        // 添加上一页按钮
        if (currentPage > 1) {
            const prevButton = createPaginationButton('<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/><g transform="matrix(0.83 0 0 0.83 12 12)"><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: currentColor; fill-rule: nonzero; opacity: 1;" transform=" translate(-13.5, -15)" d="M 17 3 L 19 3 C 19.386 3 19.738 3.223 19.904 3.572 C 20.07 3.9210000000000003 20.019 4.334 19.774 4.634 L 11.292 15 L 19.774 25.367 C 20.019000000000002 25.666 20.069000000000003 26.079 19.904 26.429000000000002 C 19.738999999999997 26.779000000000003 19.386 27 19 27 L 17 27 C 16.7 27 16.416 26.865 16.226 26.633 L 7.225999999999999 15.633 C 6.924999999999999 15.264 6.924999999999999 14.735 7.225999999999999 14.366 L 16.226 3.3659999999999997 C 16.416 3.135 16.7 3 17 3 z" stroke-linecap="round" /></g></svg>', 'prev', 'Previous page');
            prevButton.addEventListener('click', () => fetchAndRenderMessages(currentPage - 1));
            paginationContainer.appendChild(prevButton);
        }

        // 添加页码按钮
        pagesToShow.forEach((pageNum, index) => {
            if (pageNum === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'px-3 py-2 text-gray-500';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            } else {
                const pageButton = createPaginationButton(pageNum.toString(), `page-${pageNum}`, `Go to page ${pageNum}`);
                if (pageNum === currentPage) {
                    pageButton.classList.add('bg-gray-800', 'border-gray-100', 'text-gray-100');
                    pageButton.classList.remove('hover:border-gray-100', 'hover:text-gray-100');
                }
                pageButton.addEventListener('click', () => fetchAndRenderMessages(pageNum));
                paginationContainer.appendChild(pageButton);
            }
        });

        // 添加下一页按钮
        if (currentPage < totalPages) {
            const nextButton = createPaginationButton('<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/><g transform="matrix(0.83 0 0 0.83 12 12)"><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: currentColor; fill-rule: nonzero; opacity: 1;" transform=" translate(-15.5, -15)" d="M 12 27 L 10 27 C 9.614 27 9.262 26.777 9.096 26.428 C 8.93 26.079 8.981 25.666 9.226 25.366 L 17.708 15 L 9.226 4.633 C 8.981000000000002 4.334 8.931000000000001 3.9210000000000003 9.096 3.5709999999999997 C 9.261 3.220999999999999 9.614 3 10 3 L 12 3 C 12.3 3 12.584 3.135 12.774000000000001 3.367 L 21.774 14.367 C 22.075 14.736 22.075 15.265 21.774 15.634 L 12.774000000000001 26.634 C 12.584 26.865 12.3 27 12 27 z" stroke-linecap="round" /></g></svg>', 'next', 'Next page');
            nextButton.addEventListener('click', () => fetchAndRenderMessages(currentPage + 1));
            paginationContainer.appendChild(nextButton);
        }

        // 添加到分页容器
        const paginationContainerElement = document.getElementById('pagination-container');
        if (paginationContainerElement) {
            paginationContainerElement.innerHTML = '';
            paginationContainerElement.appendChild(paginationContainer);
        }
    };

    const createPaginationButton = (text, id, title) => {
        const button = document.createElement('button');
        button.id = id;
        button.className = 'border border-gray-700 hover:border-gray-100 text-gray-400 hover:text-gray-100 font-bold py-2 px-3 rounded-lg transition-colors';
        button.innerHTML = text;
        button.title = title;
        return button;
    };

    const calculatePagesToShow = (currentPage, totalPages) => {
        const pages = [];

        if (totalPages <= 7) {
            // 显示所有页码
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Google搜索结果式分页逻辑
            if (currentPage <= 4) {
                // 显示前5页，然后是省略号，最后是最后一页
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // 显示第一页，省略号，最后5页
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // 显示第一页，省略号，当前页前后各2页，省略号，最后一页
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // --- URL State Management ---
    const updateURL = () => {
        const params = new URLSearchParams();
        if (currentPage > 1) {
            params.set('page', currentPage);
        }
        if (currentPrivateKey) {
            params.set('key', currentPrivateKey);
        }

        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    };

    const parseURLParams = () => {
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page');
        const key = params.get('key');

        if (page) {
            currentPage = parseInt(page);
        }
        if (key) {
            currentPrivateKey = key;
            privateKeyInput.value = key;
            privateKeyInput.classList.remove('hidden');
            sendKeyButton.classList.remove('hidden');
        }
    };

    // --- Event Handlers ---
    let isSubmitting = false; // Prevent duplicate submissions

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        isSubmitting = true;

        try {
            const content = messageInput.value.trim();

            // 验证：消息必须有内容或文件
            if (!content && !selectedFile) {
                alert('Message must have either text content or a file');
                return;
            }

            // 如果有文件，先上传文件
            let fileData = null;
            if (selectedFile && selectedFile.file) {
                fileStatus.textContent = 'Uploading file...';
                postMessageButton.disabled = true; // Disable the button during upload
                postMessageButton.classList.add('opacity-50', 'cursor-not-allowed');

                fileData = await uploadFile(selectedFile.file);
                selectedFile.uploadedData = fileData;
                fileStatus.textContent = 'File uploaded';
            }

            // 存储消息内容和文件数据，稍后发送
            messageTypeModal.dataset.pendingContent = content;
            if (fileData) {
                messageTypeModal.dataset.fileData = JSON.stringify(fileData);
            } else {
                delete messageTypeModal.dataset.fileData;
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
            // 恢复文件状态
            if (selectedFile) {
                fileStatus.textContent = 'File selected';
            }
        } finally {
            isSubmitting = false;
            postMessageButton.disabled = false; // Re-enable the button
            postMessageButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    };

    // 发送消息到 API
    const postMessageToAPI = async (content, isPrivate, privateKey) => {
        try {
            // 获取文件数据
            let fileData = null;
            if (messageTypeModal.dataset.fileData) {
                try {
                    fileData = JSON.parse(messageTypeModal.dataset.fileData);
                } catch (e) {
                    console.error('Failed to parse file data:', e);
                }
            }

            // 构建请求体
            const requestBody = {
                content,
                isPrivate,
                privateKey
            };

            // 添加文件信息
            if (fileData) {
                requestBody.hasImage = true; // 保持现有字段名以向后兼容
                requestBody.imageFilename = fileData.filename;
                requestBody.imageMimeType = fileData.mimeType;
                requestBody.imageSize = fileData.size;
            }

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                clearSelectedFile(); // 清除文件状态
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
            const response = await fetch(`/api/messages/${id}`, {
                method: 'DELETE'
            });
            if (response.status !== 204) {
                throw new Error('Server failed to delete message.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            // On error, restore the message in the local array and re-render
            if (originalMessage && originalIndex !== -1) {
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content
                })
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

        // 如果消息有文件（has_image为1），不允许编辑（因为一个消息只能有一个文件，编辑时不能删除文件）
        if (originalMessage.has_image === 1) {
            alert('Cannot edit messages with files. You can only edit the text content of file messages by deleting and reposting.');
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

    // 文件上传事件监听器
    uploadFileButton.addEventListener('click', () => {
        fileUpload.click();
    });

    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件大小 (50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File is too large. Maximum size is 50MB.');
            fileUpload.value = '';
            return;
        }

        updateFilePreview(file);
    });

    removeFileButton.addEventListener('click', clearSelectedFile);

    // KEY 按钮事件监听器
    keyButton.addEventListener('click', (e) => {
        e.preventDefault();
        const isShowingKeyInput = !privateKeyInput.classList.contains('hidden');

        if (isShowingKeyInput) {
            // 隐藏 KEY 输入框和 Send 按钮，显示 Post Message 按钮和文件上传按钮
            privateKeyInput.classList.add('hidden');
            sendKeyButton.classList.add('hidden');
            postMessageButton.classList.remove('hidden');
            uploadFileButton.classList.remove('hidden');
            privateKeyInput.value = '';
            // 隐藏错误提示
            errorMessage.classList.add('hidden');
            fetchAndRenderMessages(); // 重新加载（只显示 public）
        } else {
            // 显示 KEY 输入框和 Send 按钮，隐藏 Post Message 按钮和文件上传按钮
            privateKeyInput.classList.remove('hidden');
            sendKeyButton.classList.remove('hidden');
            postMessageButton.classList.add('hidden');
            uploadFileButton.classList.add('hidden');
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
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

    // Parse URL parameters for pagination and private key
    parseURLParams();

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