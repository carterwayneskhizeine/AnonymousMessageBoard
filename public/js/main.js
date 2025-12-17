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

    // Make authentication DOM elements globally available for auth-handlers.js
    window.loginBtn = loginBtn;
    window.registerBtn = registerBtn;
    window.logoutBtn = logoutBtn;
    window.guestView = guestView;
    window.userView = userView;
    window.usernameDisplay = usernameDisplay;
    window.loginModal = loginModal;
    window.registerModal = registerModal;
    window.loginForm = loginForm;
    window.registerForm = registerForm;
    window.loginUsername = loginUsername;
    window.loginPassword = loginPassword;
    window.registerUsername = registerUsername;
    window.registerPassword = registerPassword;
    window.registerConfirmPassword = registerConfirmPassword;
    window.cancelLogin = cancelLogin;
    window.cancelRegister = cancelRegister;
    window.loginError = loginError;
    window.registerError = registerError;
    window.registerFromLoginBtn = registerFromLoginBtn;

    // Make DOM elements globally available for initial-setup.js
    window.messageForm = messageForm;
    window.messageList = messageList;
    window.keyButton = keyButton;
    window.privateKeyInput = privateKeyInput;
    window.sendKeyButton = sendKeyButton;
    window.postMessageButton = postMessageButton;
    window.uploadFileButton = uploadFileButton;
    window.fileUpload = fileUpload;
    window.removeFileButton = removeFileButton;
    window.errorMessage = errorMessage;
    window.messageTypeModal = messageTypeModal;
    window.publicOption = publicOption;
    window.privateOption = privateOption;
    window.typeSelection = typeSelection;
    window.privateKeyEntry = privateKeyEntry;
    window.modalPrivateKey = modalPrivateKey;
    window.cancelPrivate = cancelPrivate;
    window.confirmPrivate = confirmPrivate;
    window.messageInput = messageInput;

    // Make file preview DOM elements globally available for file-preview.js
    window.fileStatus = fileStatus;
    window.filePreviewContainer = filePreviewContainer;
    window.filePreviewContent = filePreviewContent;

    // --- Global State and Instances ---
    let messages = [];
    let currentUser = null;

    // Make currentUser globally available for modules that need it
    Object.defineProperty(window, 'currentUser', {
        get: function() { return currentUser; },
        set: function(value) { currentUser = value; },
        enumerable: true,
        configurable: true
    });
    let selectedFile = null; // { file: File, previewUrl: string, uploadedData: object, isImage: boolean }
    let currentPage = 1;
    let totalPages = 1;
    let currentPrivateKey = '';
    // YouTubeExtension is now defined in youtube-extension.js
    const converter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        strikethrough: true,
        tables: true,
        noHeaderId: false,
        extensions: [youtubeExtension]
    });

    // Make converter globally available for modules that need it
    window.converter = converter;

    // Make messages array globally available as a getter/setter to maintain reference
    Object.defineProperty(window, 'messages', {
        get: function() { return messages; },
        set: function(value) { messages = value; },
        enumerable: true,
        configurable: true
    });

    // Make selectedFile globally available as a getter/setter to maintain reference
    Object.defineProperty(window, 'selectedFile', {
        get: function() { return selectedFile; },
        set: function(value) { selectedFile = value; },
        enumerable: true,
        configurable: true
    });

    // Make pagination variables globally available as getter/setter to maintain reference
    Object.defineProperty(window, 'currentPage', {
        get: function() { return currentPage; },
        set: function(value) { currentPage = value; },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(window, 'totalPages', {
        get: function() { return totalPages; },
        set: function(value) { totalPages = value; },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(window, 'currentPrivateKey', {
        get: function() { return currentPrivateKey; },
        set: function(value) { currentPrivateKey = value; },
        enumerable: true,
        configurable: true
    });

    // --- Helper Functions ---
    const createButton = (text, id, action) => {
        const icons = {
            copy: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.43 0 0 1.43 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-8, -7.5)" d="M 2.5 1 C 1.675781 1 1 1.675781 1 2.5 L 1 10.5 C 1 11.324219 1.675781 12 2.5 12 L 4 12 L 4 12.5 C 4 13.324219 4.675781 14 5.5 14 L 13.5 14 C 14.324219 14 15 13.324219 15 12.5 L 15 4.5 C 15 3.675781 14.324219 3 13.5 3 L 12 3 L 12 2.5 C 12 1.675781 11.324219 1 10.5 1 Z M 2.5 2 L 10.5 2 C 10.78125 2 11 2.21875 11 2.5 L 11 10.5 C 11 10.78125 10.78125 11 10.5 11 L 2.5 11 C 2.21875 11 2 10.78125 2 10.5 L 2 2.5 C 2 2.21875 2.21875 2 2.5 2 Z M 12 4 L 13.5 4 C 13.78125 4 14 4.21875 14 4.5 L 14 12.5 C 14 12.78125 13.78125 13 13.5 13 L 5.5 13 C 5.21875 13 5 12.78125 5 12.5 L 5 12 L 10.5 12 C 11.324219 12 12 11.324219 12 10.5 Z" stroke-linecap="round" /></g></svg>`,
            edit: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.53 0 0 0.53 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-24, -24)" d="M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 C 4.909599585679415 41.61136473005194 5.055818649159609 42.174475161087585 5.440671944485212 42.559328331832646 C 5.8255252398108155 42.944181502577706 6.388635718178886 43.090400383773854 6.9121094 42.941406 L 17.302734 39.974609 C 17.30338593263404 39.97395859988369 17.304037266243494 39.97330759960771 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 C 38.82682299993104 9.171875423758669 38.82747400006896 9.171875423758669 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 C 10.91015642375867 31.52083300006896 10.91015642375867 31.52018199993104 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z" stroke-linecap="round" /></g></svg>`,
            reply: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.48 0 0 0.48 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-25, -28.01)" d="M 20.875 11 C 20.691406 11.023438 20.519531 11.101563 20.375 11.21875 L 4.375 24.21875 C 4.136719 24.410156 4 24.695313 4 25 C 4 25.304688 4.136719 25.589844 4.375 25.78125 L 20.375 38.78125 C 20.675781 39.023438 21.085938 39.070313 21.433594 38.902344 C 21.78125 38.734375 22 38.382813 22 38 L 22 31.09375 C 32.605469 31.308594 38.09375 34.496094 40.90625 37.65625 C 43.769531 40.878906 43.992188 43.90625 44 44 C 44 44 44 44.0625 44 44.0625 C 44.015625 44.613281 44.480469 45.046875 45.03125 45.03125 C 45.582031 45.015625 46.015625 44.550781 46 44 C 46 44 46 43.9375 46 43.9375 C 46 43.9375 46 43.875 46 43.875 C 45.996094 43.683594 45.886719 37.699219 42.78125 31.5625 C 39.71875 25.507813 33.511719 19.414063 22 19.0625 L 22 12 C 22.003906 11.710938 21.878906 11.4375 21.664063 11.246094 C 21.449219 11.054688 21.160156 10.964844 20.875 11 Z M 20 14.09375 L 20 20 C 20 20.550781 20.449219 21 21 21 C 32.511719 21 38.082031 26.671875 41 32.4375 C 41.742188 33.90625 42.296875 35.375 42.71875 36.75 C 42.601563 36.609375 42.53125 36.484375 42.40625 36.34375 C 39.089844 32.613281 32.753906 29 21 29 C 20.449219 29 20 29.449219 20 30 L 20 35.90625 L 6.59375 25 Z" stroke-linecap="round" /></g></svg>`,
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

    // Make createButton globally available for modules that need it
    window.createButton = createButton;

    // --- Authentication Helper Functions ---
    // updateUIForUser function is now defined in auth-ui-helper.js

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

    // updateUIForUser is now globally available from auth-ui-helper.js
    window.showError = showError;
    window.clearError = clearError;
    window.checkAuthStatus = checkAuthStatus;

    // --- File Upload Helper Functions ---
    // uploadFile function is now defined in file-upload.js

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

    // updateFilePreview function is now defined in file-preview.js

    // --- Main Rendering Function ---
    // renderMessage function is now defined in main-rendering-function.js

    // renderMessage is now globally available from main-rendering-function.js

    // --- API & Rendering Logic ---
    // fetchAndRenderMessages function is now defined in api-rendering-logic.js

    // Make fetchAndRenderMessages globally available for auth-handlers.js
    // This is now handled in api-rendering-logic.js

    // Pagination functions are now defined in pagination.js

    // handlePostSubmit is now defined in event-handlers.js

    // postMessageToAPI function is now defined in message-post-api.js

    // handleMessageClick function is now defined in message-click-handler.js

    // Message delete and save functions are now defined in message-operations.js

    // toggleEditView is now defined in message-edit-toggle.js

    // Make additional functions globally available for initial-setup.js (after all functions are defined)
    
    window.handleMessageClick = handleMessageClick;
    // updateFilePreview is now globally available from file-preview.js
    window.clearSelectedFile = clearSelectedFile;
    window.postMessageToAPI = postMessageToAPI;

    // --- Initial Setup ---
    // Initial Setup is now defined in initial-setup.js

    // Authentication Event Handlers are now defined in auth-handlers.js

    // loadCommentsForMessage function is now defined in comment-loader.js

    // renderCommentSection function is now defined in comment-section-renderer.js
    
    // createCommentElement function is now defined in comment-element.js

    // handlePostComment function is now defined in comment-post.js

    // handleVote function is now defined in comment-vote.js

    // handleEditComment function is now defined in comment-edit.js

    // handleDeleteComment function is now defined in comment-delete.js

    // hideMessageReplyButton and showMessageReplyButton functions are now defined in message-reply-button.js

    // handleReply function is now defined in reply-handler.js

    // Parse URL parameters for pagination and private key
    if (window.parseURLParams) {
        window.parseURLParams();
    } else {
        console.error('parseURLParams function not found');
    }

    fetchAndRenderMessages();

    // Initialize authentication handlers
    if (window.initAuthHandlers) {
        window.initAuthHandlers();
    } else {
        console.error('initAuthHandlers function not found');
    }

    // Initialize event listeners
    if (window.initEventListeners) {
        window.initEventListeners();
    } else {
        console.error('initEventListeners function not found');
    }

    // Comment styles are now initialized in comment-styles.js
});