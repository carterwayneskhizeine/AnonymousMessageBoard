// Message Post API Module
// Purpose: Handles posting messages to the API including file attachments
// Dependencies:
// - Requires window.messages array (defined in main.js)
// - Requires window.messageTypeModal DOM element (defined in main.js)
// - Requires window.messageList DOM element (defined in main.js)
// - Requires window.messageInput DOM element (defined in main.js)
// - Requires window.currentUser object (defined in main.js)
// - Requires window.renderMessage function (defined in main.js)
// - Requires window.clearSelectedFile function (defined in main.js)
// - Requires window.loadCommentsForMessage function (defined in comment-loader.js)

const postMessageToAPI = async (content, isPrivate, privateKey) => {
    try {
        // 获取文件数据
        let fileData = null;
        if (window.messageTypeModal && window.messageTypeModal.dataset.fileData) {
            try {
                fileData = JSON.parse(window.messageTypeModal.dataset.fileData);
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
                window.messages.unshift(newMessage);
                if (window.messageList) {
                    window.messageList.innerHTML = '';
                    window.messages.forEach(message => {
                        const renderedMessage = window.renderMessage ? window.renderMessage(message) : null;
                        if (renderedMessage) {
                            window.messageList.appendChild(renderedMessage);
                        }
                    });
                    // 为新消息加载评论以显示正确的Reply按钮状态
                    if (window.loadCommentsForMessage) {
                        window.loadCommentsForMessage(newMessage.id);
                    }
                }
            } else if (window.currentUser) {
                // 如果用户已登录且发送私有消息，立即显示（因为用户可以看到自己的私有消息）
                window.messages.unshift(newMessage);
                if (window.messageList) {
                    window.messageList.innerHTML = '';
                    window.messages.forEach(message => {
                        const renderedMessage = window.renderMessage ? window.renderMessage(message) : null;
                        if (renderedMessage) {
                            window.messageList.appendChild(renderedMessage);
                        }
                    });
                    // 为新消息加载评论以显示正确的Reply按钮状态
                    if (window.loadCommentsForMessage) {
                        window.loadCommentsForMessage(newMessage.id);
                    }
                }
            }
            // 未登录用户发送的私有消息不显示

            if (window.messageInput) {
                window.messageInput.value = '';
            }
            if (window.clearSelectedFile) {
                window.clearSelectedFile(); // 清除文件状态
            }

            // 自动刷新页面以确保所有状态同步
            setTimeout(() => {
                window.location.reload();
            }, 1000); // 1秒后刷新，让用户看到成功提示
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error || 'Something went wrong'}`);
        }
    } catch (error) {
        console.error('Error submitting message:', error);
        alert('Failed to post message.');
    }
};

// Make function globally available
window.postMessageToAPI = postMessageToAPI;