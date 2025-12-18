import {
    createButton
} from './utils.js';
import {
    youtubeExtension
} from './youtube-extension.js';
import {
    loadCommentsForMessage
} from './comment-loader.js';



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
            img.className = 'max-w-full max-h-96 rounded-lg border border-gray-800 cursor-pointer hover:opacity-90 transition-opacity';

            // 添加点击放大功能
            img.addEventListener('click', () => {
                const modal = document.createElement('div');
                modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4';
                modal.innerHTML = `
                    <div class="relative max-w-4xl max-h-[80vh] mb-4">
                        <img src="${img.src}" alt="Full size image" class="max-w-full max-h-[80vh] rounded-lg">
                    </div>
                    <button class="bg-black/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/60 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
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
            video.className = 'max-w-full rounded-lg border border-gray-800';
            video.innerHTML = 'Your browser does not support the video tag.';

            // 添加视频信息
            const videoInfo = document.createElement('div');
            videoInfo.className = 'text-xs text-gray-500 mt-1';
            let infoText = 'Video';
            if (message.image_size) {
                infoText += ` • ${(message.image_size / 1024 / 1024).toFixed(2)} MB`;
            }
            if (message.image_mime_type) {
                infoText += ` • ${message.image_mime_type}`;
            }
            videoInfo.textContent = infoText;

            fileContainer.appendChild(video);
            fileContainer.appendChild(videoInfo);
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
    const replyButton = createButton('Reply', message.id, 'reply');
    replyButton.classList.add('hidden'); // Initially hidden, will be shown if no comments
    actions.appendChild(replyButton);
    actions.appendChild(createButton('Edit', message.id, 'edit'));
    actions.appendChild(createButton('Delete', message.id, 'delete'));

    footer.appendChild(timestamp);
    footer.appendChild(actions);

    messageElement.appendChild(contentContainer);
    messageElement.appendChild(footer);

    // Add a container for comments, hidden by default (will be shown if there are comments)
    const commentsContainer = document.createElement('div');
    commentsContainer.id = `comments-for-${message.id}`;
    commentsContainer.className = 'mt-4 pt-4 border-t border-gray-800 hidden';
    messageElement.appendChild(commentsContainer);

    // 如果存在AI回复，则自动加载评论区
    // 使用setTimeout确保messageElement已添加到DOM中，以便loadCommentsForMessage可以找到它
    if (message.has_ai_reply) {
        setTimeout(() => {
            loadCommentsForMessage(message.id);
        }, 0);
    }

    return messageElement;
};