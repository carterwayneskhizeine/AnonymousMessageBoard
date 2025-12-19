import {
    currentPage,
    totalPages,
    currentPrivateKey,
    isPrivateFilterMode,
    setCurrentPage,
    setCurrentPrivateKey,
    setIsPrivateFilterMode
} from './state.js';
import {
    privateKeyInput,
    sendKeyButton,
    postMessageButton,
    uploadFileButton
} from './ui-elements.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';


// --- Pagination Functions ---
export const renderPagination = (pageClickHandler = fetchAndRenderMessages) => {
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
        prevButton.addEventListener('click', () => pageClickHandler(currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }

    // 添加页码按钮
    pagesToShow.forEach((pageNum, index) => {
        if (pageNum === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-2 text-bp-text-muted';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        } else {
            const pageButton = createPaginationButton(pageNum.toString(), `page-${pageNum}`, `Go to page ${pageNum}`);
            if (pageNum === currentPage) {
                // Active State: Gold background, Black text
                pageButton.className = 'bg-bp-gold text-bp-black font-bold py-2 px-4 rounded-md shadow-glow transition-all';
            }
            pageButton.addEventListener('click', () => pageClickHandler(pageNum));
            paginationContainer.appendChild(pageButton);
        }
    });

    // 添加下一页按钮
    if (currentPage < totalPages) {
        const nextButton = createPaginationButton('<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/><g transform="matrix(0.83 0 0 0.83 12 12)"><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: currentColor; fill-rule: nonzero; opacity: 1;" transform=" translate(-15.5, -15)" d="M 12 27 L 10 27 C 9.614 27 9.262 26.777 9.096 26.428 C 8.93 26.079 8.981 25.666 9.226 25.366 L 17.708 15 L 9.226 4.633 C 8.981000000000002 4.334 8.931000000000001 3.9210000000000003 9.096 3.5709999999999997 C 9.261 3.220999999999999 9.614 3 10 3 L 12 3 C 12.3 3 12.584 3.135 12.774000000000001 3.367 L 21.774 14.367 C 22.075 14.736 22.075 15.265 21.774 15.634 L 12.774000000000001 26.634 C 12.584 26.865 12.3 27 12 27 z" stroke-linecap="round" /></g></svg>', 'next', 'Next page');
        nextButton.addEventListener('click', () => pageClickHandler(currentPage + 1));
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
    button.className = 'btn-bp-outline text-sm py-2 px-3 hover:text-bp-gold hover:border-bp-gold';
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
export const updateURL = () => {
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

export const parseURLParams = () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const key = params.get('key');

    if (page) {
        setCurrentPage(parseInt(page));
    }
    if (key) {
        setCurrentPrivateKey(key);
        privateKeyInput.value = key;
        privateKeyInput.classList.remove('hidden');
        sendKeyButton.classList.remove('hidden');
        // 隐藏 Post Message 按钮和文件上传按钮
        postMessageButton.classList.add('hidden');
        uploadFileButton.classList.add('hidden');
        // 自动进入私有过滤模式
        setIsPrivateFilterMode(true);
    }
};
