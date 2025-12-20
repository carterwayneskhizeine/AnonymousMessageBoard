import {
    createButton
} from './utils.js';
import {
    youtubeExtension
} from './youtube-extension.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';
import {
    currentUser
} from './state.js';


let extensions = [];
if (youtubeExtension &&
    typeof youtubeExtension === 'object' &&
    youtubeExtension.type &&
    youtubeExtension.regex &&
    youtubeExtension.replace) {
    extensions.push(youtubeExtension);
}

export const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    strikethrough: true,
    tables: true,
    noHeaderId: false,
    extensions: extensions
});

// Main message rendering function
export const renderMessage = (message) => {
    // Wrapper: Card style
    const messageElement = document.createElement('div');
    messageElement.className = 'card-bp animate-fade-in flex flex-col group hover:border-bp-gold/50 transition-all';
    messageElement.dataset.messageId = message.id;

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'mb-4';

    // 显示文件（如果有）
    if (message.has_image === 1 && message.image_filename) {
        const fileContainer = document.createElement('div');
        fileContainer.className = 'mb-4';

        // 检查文件类型以决定如何显示
        const isImage = message.image_mime_type && message.image_mime_type.startsWith('image/');
        const isVideo = message.image_mime_type && message.image_mime_type.startsWith('video/');

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
            img.className = 'w-full max-h-[500px] object-cover rounded-lg border border-bp-gray cursor-pointer hover:opacity-90 transition-opacity';

            // 添加点击放大功能
            img.addEventListener('click', () => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4 animate-fade-in';
                modal.innerHTML = `
                    <div class="relative max-w-7xl w-full max-h-[90vh] flex items-center justify-center">
                        <img src="${img.src}" alt="Full size image" class="max-w-full max-h-[85vh] rounded-lg shadow-glow-strong">
                        <button class="absolute -top-12 right-0 md:top-4 md:right-4 bg-bp-black/50 text-white p-2 rounded-full hover:bg-bp-black transition-colors border border-bp-gray">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                `;

                const closeBtn = modal.querySelector('button');
                closeBtn.addEventListener('click', () => {
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
            const fileNameDisplay = document.createElement('div');
            fileNameDisplay.className = 'text-sm font-medium text-bp-text truncate mt-2 px-1';
            fileNameDisplay.textContent = message.image_filename;
            fileNameDisplay.title = message.image_filename;

            const imageInfo = document.createElement('div');
            imageInfo.className = 'text-xs text-bp-text-muted mt-1 flex items-center gap-2 px-1';
            imageInfo.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Image</span>
                <span class="text-gray-600">•</span>
                <span>${message.image_mime_type ? message.image_mime_type.split('/')[1].toUpperCase() : 'JPG'}</span>
                ${message.image_size ? `<span class="text-gray-600">•</span><span>${(message.image_size / 1024).toFixed(1)} KB</span>` : ''}
            `;

            fileContainer.appendChild(img);
            fileContainer.appendChild(fileNameDisplay);
            fileContainer.appendChild(imageInfo);
        } else if (isVideo) {
            // 显示视频播放器
            let videoUrl = `/uploads/${message.image_filename}`;
            // 如果是私有消息，添加 private key 作为查询参数
            if (message.is_private === 1 && message.private_key) {
                videoUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
            }

            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            video.className = 'w-full rounded-lg border border-bp-gray bg-black';
            video.innerHTML = 'Your browser does not support the video tag.';

            // 添加视频信息
            const fileNameDisplay = document.createElement('div');
            fileNameDisplay.className = 'text-sm font-medium text-bp-text truncate mt-2 px-1';
            fileNameDisplay.textContent = message.image_filename;
            fileNameDisplay.title = message.image_filename;

            const videoInfo = document.createElement('div');
            videoInfo.className = 'text-xs text-bp-text-muted mt-1 flex items-center gap-2 px-1';
            videoInfo.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span>Video</span>
                ${message.image_size ? `<span class="text-gray-600">•</span><span>${(message.image_size / 1024 / 1024).toFixed(2)} MB</span>` : ''}
            `;

            fileContainer.appendChild(video);
            fileContainer.appendChild(fileNameDisplay);
            fileContainer.appendChild(videoInfo);
        } else {
            // 显示文件下载链接 (File Card)
            const fileCard = document.createElement('div');
            fileCard.className = 'p-4 bg-bp-black rounded-lg border border-bp-gray flex items-center group/file hover:border-bp-gold/30 transition-colors';

            // 文件图标
            const fileIcon = document.createElement('div');
            fileIcon.className = 'mr-4 p-3 bg-bp-dark rounded-full text-bp-gold/80 group-hover/file:text-bp-gold transition-colors';
            fileIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            `;

            // 文件信息和下载链接
            const fileInfo = document.createElement('div');
            fileInfo.className = 'flex-1 min-w-0';

            const fileName = document.createElement('div');
            fileName.className = 'text-sm font-bold text-bp-text truncate mb-1';
            fileName.textContent = message.image_filename;
            fileInfo.appendChild(fileName);

            const fileInfoText = document.createElement('div');
            fileInfoText.className = 'text-xs text-bp-text-muted flex gap-2';
            let fileInfoStr = message.image_mime_type || 'File';
            if (message.image_size) {
                fileInfoStr += ` • ${(message.image_size / 1024).toFixed(1)} KB`;
            }
            fileInfoText.textContent = fileInfoStr;
            fileInfo.appendChild(fileInfoText);

            // 下载链接
            let downloadUrl = `/uploads/${message.image_filename}`;
            // 如果是私有消息，添加 private key 作为查询参数
            if (message.is_private === 1 && message.private_key) {
                downloadUrl += `?privateKey=${encodeURIComponent(message.private_key)}`;
            }
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = message.image_filename;
            downloadLink.className = 'ml-4 btn-bp-icon hover:bg-bp-gray p-2 rounded-full text-bp-text-muted hover:text-bp-gold';
            downloadLink.title = 'Download';
            downloadLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>';

            fileCard.appendChild(fileIcon);
            fileCard.appendChild(fileInfo);
            fileCard.appendChild(downloadLink);

            fileContainer.appendChild(fileCard);
        }

        contentContainer.appendChild(fileContainer);
    }

    // 为 private 消息添加 KEY 显示
    if (message.is_private === 1) {
        const privateLabel = document.createElement('div');
        privateLabel.className = 'mb-3 flex items-center gap-2';

        // Badge
        const badge = document.createElement('span');
        badge.className = 'badge-bp border-bp-gold text-bp-gold';
        badge.textContent = 'PRIVATE';

        // KEY Display
        const keyDisplay = document.createElement('span');
        keyDisplay.className = 'font-mono text-xs text-bp-text-muted bg-bp-black px-2 py-0.5 rounded border border-bp-gray border-dashed ml-1';

        if (message.private_key && message.private_key.trim() !== '') {
            keyDisplay.innerHTML = `<span class="text-gray-500 select-none">KEY:</span> <span class="text-gray-300">${message.private_key}</span>`;
            // 添加复制功能提示
            keyDisplay.title = 'Click to copy KEY';
            keyDisplay.style.cursor = 'pointer';

            // 添加点击复制功能
            keyDisplay.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡
                navigator.clipboard.writeText(message.private_key).then(() => {
                    const originalHTML = keyDisplay.innerHTML;
                    keyDisplay.textContent = 'Copied!';
                    keyDisplay.className = 'font-mono text-xs text-bp-gold bg-bp-black px-2 py-0.5 rounded border border-bp-gold ml-1';

                    // 2秒后恢复原状
                    setTimeout(() => {
                        keyDisplay.innerHTML = originalHTML;
                        keyDisplay.className = 'font-mono text-xs text-bp-text-muted bg-bp-black px-2 py-0.5 rounded border border-bp-gray border-dashed ml-1';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy KEY:', err);
                });
            });
        } else {
            keyDisplay.textContent = 'KEY: (hidden)';
        }

        // 组装所有元素
        privateLabel.appendChild(badge);
        privateLabel.appendChild(keyDisplay);

        contentContainer.appendChild(privateLabel);
    }

    // Convert markdown to HTML and apply typography styles (如果有文本内容)
    if (message.content && message.content.trim() !== '') {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'prose prose-invert max-w-none text-gray-300 prose-headings:text-gray-100 prose-a:text-bp-gold prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-bp-gold prose-code:text-bp-gold prose-code:bg-bp-black prose-code:px-1 prose-code:rounded prose-pre:bg-bp-black prose-pre:border prose-pre:border-bp-gray break-words';
        contentDiv.innerHTML = converter.makeHtml(message.content);

        // Add copy buttons to code blocks (preserved logic, updated styling)
        const codeBlocks = contentDiv.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            if (pre.querySelector('.copy-code-btn')) return;

            const wrapper = document.createElement('div');
wrapper.className = 'relative group/code';

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            pre.classList.add('overflow-x-auto');

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn absolute top-2 right-2 bg-bp-gray text-xs px-2 py-1 rounded text-gray-300 opacity-0 group-hover/code:opacity-100 transition-all z-10 hover:bg-bp-gold hover:text-black font-medium';
            copyButton.innerHTML = 'Copy';
            copyButton.onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(codeBlock.textContent.trim())
                    .then(() => {
                        const original = copyButton.innerHTML;
                        copyButton.innerHTML = 'Copied!';
                        setTimeout(() => {
                            copyButton.innerHTML = original;
                        }, 2000);
                    })
                    .catch(err => console.error('Copy failed:', err));
            };
            wrapper.appendChild(copyButton);
        });

        contentContainer.appendChild(contentDiv);
    }

    // Footer with timestamp and actions
    const footer = document.createElement('div');
    footer.className = 'flex justify-between items-center mt-4 pt-4 border-t border-bp-gray/50';

    const timestamp = document.createElement('div');
    timestamp.className = 'text-xs text-bp-text-muted font-mono';
    timestamp.textContent = new Date(message.timestamp + 'Z').toLocaleString('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    });

    const actions = document.createElement('div');
    actions.className = 'flex gap-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200';

    // Like button
    const likeContainer = document.createElement('div');
    likeContainer.className = 'flex items-center gap-1'; // Adjusted for text button

    const likeBtn = document.createElement('button');
    likeBtn.dataset.action = 'like-message';
    likeBtn.dataset.id = message.id;
    // Use text-sm for message actions, consistent with comment actions
    likeBtn.className = `transition-colors font-medium text-sm hover:text-bp-gold ${message.userHasLiked ? 'text-bp-gold' : 'text-bp-text-muted'}`;
    likeBtn.textContent = 'like';
    
    const likesCount = document.createElement('span');
    likesCount.className = 'text-gray-400 font-mono text-xs min-w-[12px]';
    likesCount.textContent = message.likes || 0;

    likeContainer.appendChild(likeBtn);
    likeContainer.appendChild(likesCount);
    actions.appendChild(likeContainer);

    // Actions
    actions.appendChild(createButton('Copy', message.id, 'copy'));

    const replyButton = createButton('Reply', message.id, 'reply');
    replyButton.classList.add('hidden'); // Initially hidden
    actions.appendChild(replyButton);

    // Conditional rendering for Edit and Delete buttons
    if (currentUser && (currentUser.is_admin || currentUser.id === message.user_id)) {
        actions.appendChild(createButton('Edit', message.id, 'edit'));
        actions.appendChild(createButton('Delete', message.id, 'delete'));
    }

    footer.appendChild(timestamp);
    footer.appendChild(actions);

    messageElement.appendChild(contentContainer);
    messageElement.appendChild(footer);

    // Comments Container
    const commentsContainer = document.createElement('div');
    commentsContainer.id = `comments-for-${message.id}`;
    commentsContainer.className = 'mt-4 pt-4 border-t border-bp-gray hidden bg-bp-black/30 -mx-5 -mb-5 p-5 rounded-b-lg';
    messageElement.appendChild(commentsContainer);

    // 如果存在AI回复，则自动加载评论区
    if (message.has_ai_reply) {
        setTimeout(() => {
            loadCommentsForMessage(message.id);
        }, 0);
    }

    return messageElement;
};
