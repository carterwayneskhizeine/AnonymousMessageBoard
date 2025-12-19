import {
    initAuthHandlers
} from './auth-handlers.js';
import {
    initEventListeners
} from './initial-setup.js';
import {
    fetchAndRenderMessages
} from './api-rendering-logic.js';
import {
    parseURLParams
} from './pagination.js';
import { initSearchHandler } from './search-handler.js';
import './comment-styles.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Application initializing...");

    // 1. 解析URL参数
    parseURLParams();

    // 2. 检查认证状态并获取初始消息
    fetchAndRenderMessages().catch(error => {
        console.error('Error fetching initial messages:', error);
    });

    // 3. 绑定认证UI事件
    initAuthHandlers();

    // 4. 绑定所有其他的UI事件监听器
    initEventListeners();
    
    // 5. 绑定搜索事件
    initSearchHandler();

    console.log("Application initialized successfully using ES Modules.");
});