# Code Separation Guide

## Overview

This guide provides a standardized approach for extracting JavaScript code (functions, objects, modules) from `public/js/main.js` into separate files. This practice improves code organization, maintainability, and follows the single responsibility principle.

## When to Extract Code

Consider extracting code from `main.js` when:

- The code block is a complete, self-contained unit (function or object)
- The code can work independently with minimal dependencies
- The main.js file is becoming too large (> 1000 lines)
- Multiple files work better than monolithic structure
- The code will be reused or needs separate testing

## Standard Extraction Process

### 1. Create New Module File

**File Naming Convention:**
- Use kebab-case: `feature-name.js` (e.g., `youtube-extension.js`, `file-upload.js`, `comment-system.js`)
- Place in `public/js/` directory
- Add a clear header comment describing the purpose

**File Template:**
```javascript
// [Feature Name] Module
// Purpose: Brief description of what this module does
// Dependencies: List any global dependencies (if any)

// Code should be self-contained and primarily expose functions/objects globally
```

### 2. Update main.js

**Remove the original code:**
- Delete the extracted code block
- Add a reference comment at the original location:
  ```javascript
  // [Feature name] is now defined in [module-name].js
  ```

**Tips:**
- Ensure no other parts of main.js depend on local-only variables from extracted code
- If dependencies exist, consider extracting them together or managing them properly

### 3. Update HTML Template

**Add script import to `views/index.ejs`:**
```html
<script src="/js/[module-name].js?v=<%= new Date().getTime() %>"></script>
```

**Load Order Rules:**
1. Load dependencies first (if any)
2. Always load module scripts BEFORE `main.js`
3. Maintains alphabetical order is good practice, but functional dependency order is mandatory
4. Keep cache-busting query parameter: `?v=<%= new Date().getTime() %>`

### 4. Update Documentation

Add an entry to this guide documenting:
- What was extracted and why
- Lines affected in source files
- Any dependencies introduced
- Load order requirements

## Completed Migrations

---

### Migration: YouTube Extension

**Status:** ✅ Completed
**Date:** Initial refactoring
**Extractor:** `youtubeExtension` object

**Changes:**
- **Created:** `public/js/youtube-extension.js`
- **Modified:** `public/js/main.js` (removed lines 62-70)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** Before `main.js`

---

### Migration: File Upload Function

**Status:** ✅ Completed
**Date:** Recent refactoring
**Extractor:** `uploadFile` function

**Changes:**
- **Created:** `public/js/file-upload.js`
- **Modified:** `public/js/main.js` (removed lines 142-203)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `youtube-extension.js`, before `main.js`
**Dependencies:** None (self-contained)
**Global Exposures:**
- `window.uploadFile`

---

### Migration: Reply Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleReply` function

**Changes:**
- **Created:** `public/js/reply-handler.js`
- **Modified:** `public/js/main.js` (removed lines 1676-1717, made handlePostComment global)
- **Modified:** `views/index.ejs` (added script import)
- **Modified:** `public/js/reply-handler.js` (updated to use window.handlePostComment)
- **Fix applied:** Made `handleReply` globally available as `window.handleReply`

**Load Order:** After `main.js` (to ensure window.handlePostComment is available)
**Dependencies:** Requires `window.handlePostComment` function to be available globally (defined in main.js)

**Global Exposures:**
- `window.handleReply`

---

### Migration: Comment Styles

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** CSS styles for comments and animations

**Changes:**
- **Created:** `public/js/comment-styles.js`
- **Modified:** `public/js/main.js` (removed lines 1683-1704)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `file-upload.js`, before `reply-handler.js`
**Dependencies:** None (self-contained)

---

### Migration: Comment Section Renderer

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `renderCommentSection` function

**Changes:**
- **Created:** `public/js/comment-section-renderer.js`
- **Modified:** `public/js/main.js` (removed lines 1351-1444, updated function call)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `reply-handler.js` (last in comment modules)
**Dependencies:**
- Requires `window.createCommentElement` function (defined in comment-element.js)
- Requires `window.handlePostComment` function (defined in comment-post.js)
- Requires `window.handleVote` function (defined in comment-vote.js)
- Requires `window.handleEditComment` function (defined in comment-edit.js)
- Requires `window.handleDeleteComment` function (defined in comment-delete.js)
- Requires `window.handleReply` function (defined in reply-handler.js)
- Fallback: Logs errors for missing dependencies but doesn't break functionality

**Global Exposures:**
- `window.renderCommentSection`

---

### Migration: Message Reply Button Functions

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `hideMessageReplyButton` and `showMessageReplyButton` functions

**Changes:**
- **Created:** `public/js/message-reply-button.js`
- **Modified:** `public/js/main.js` (removed lines 1657-1665 and 1667-1675)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `comment-styles.js`, before `main.js`
**Dependencies:** None (self-contained)
**Global Exposures:**
- `window.hideMessageReplyButton`
- `window.showMessageReplyButton`

---

### Migration: Comment Delete Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleDeleteComment` function

**Changes:**
- **Created:** `public/js/comment-delete.js`
- **Modified:** `public/js/main.js` (removed lines 1639-1655, made loadCommentsForMessage global)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js`, before `reply-handler.js`
**Dependencies:**
- Requires `window.loadCommentsForMessage` function (defined in main.js)
- Fallback: page reload if dependency not available

**Global Exposures:**
- `window.handleDeleteComment`

---

### Migration: Comment Loader

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `loadCommentsForMessage` function

**Changes:**
- **Created:** `public/js/comment-loader.js`
- **Modified:** `public/js/main.js` (removed lines 1297-1350, updated function calls)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js` (immediately after main.js)
**Dependencies:**
- Requires `window.renderCommentSection` function (defined in comment-section-renderer.js)
- Requires `window.hideMessageReplyButton` and `window.showMessageReplyButton` functions (defined in message-reply-button.js)
- Fallback: Provides basic error messages if dependencies not available

**Global Exposures:**
- `window.loadCommentsForMessage`

---

### Migration: Comment Element Creator

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `createCommentElement` function

**Changes:**
- **Created:** `public/js/comment-element.js`
- **Modified:** `public/js/main.js` (removed lines 1443-1530, made converter global)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `comment-post.js`, before `comment-vote.js`
**Dependencies:**
- Requires `window.createButton` function (defined in main.js)
- Requires `window.converter` instance (defined in main.js)
- Self-dependent: Requires `window.createCommentElement` for recursive calls
- Fallback: Uses plain text if converter not available, basic DOM elements if createButton not available

**Global Exposures:**
- `window.createCommentElement`

---

### Migration: Comment Post Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handlePostComment` function

**Changes:**
- **Created:** `public/js/comment-post.js`
- **Modified:** `public/js/main.js` (removed lines 1532-1569)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `comment-element.js`, before `comment-vote.js`
**Dependencies:**
- Requires `window.loadCommentsForMessage` function (defined in main.js)
- Fallback: page reload if dependency not available

**Global Exposures:**
- `window.handlePostComment`

---

### Migration: Comment Vote Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleVote` function

**Changes:**
- **Created:** `public/js/comment-vote.js`
- **Modified:** `public/js/main.js` (removed lines 1571-1583, updated function call)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `comment-post.js`, before `comment-edit.js`
**Dependencies:**
- Requires `window.loadCommentsForMessage` function (defined in main.js)
- Fallback: page reload if dependency not available

**Global Exposures:**
- `window.handleVote`

---

### Migration: Comment Edit Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleEditComment` function

**Changes:**
- **Created:** `public/js/comment-edit.js`
- **Modified:** `public/js/main.js` (removed lines 1582-1640, made createButton global)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `comment-vote.js`, before `comment-delete.js`
**Dependencies:**
- Requires `window.createButton` function (defined in main.js)
- Requires `window.loadCommentsForMessage` function (defined in main.js)
- Fallback: Uses basic buttons if createButton not available, page reload if loadCommentsForMessage not available

**Global Exposures:**
- `window.handleEditComment`

---

## Best Practices

### ✅ Do:
- Keep extracted modules self-contained
- Use clear, descriptive naming conventions
- Add proper documentation and comments
- Maintain backward compatibility
- Test after each extraction
- Follow consistent patterns across extractions

### ❌ Don't:
- Break existing functionality
- Create circular dependencies between modules
- Forget to update cache busting parameters
- Extract incomplete or dependent code without handling dependencies
- Change APIs without updating all reference points

## Troubleshooting

### Common Issues:

1. **"Function is not defined" errors**
   - Check script load order in `views/index.ejs`
   - Ensure dependencies are loaded before dependent code
   - Verify the extraction didn't break scope or accessibility

2. **"Cannot read property of undefined" errors**
   - Check if extracted code relies on local variables from main.js
   - Consider making dependencies global or passing them as parameters

3. **Performance issues**
   - Too many separate script files can slow page load
   - Consider bundling for production if performance becomes an issue

### Debugging Steps:
1. Check browser console for errors
2. Verify script loading order in Network tab
3. Test the specific functionality that was extracted
4. Revert changes if necessary and re-evaluate extraction approach

---

### Migration: Authentication Handlers

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** Authentication Event Handlers module

**Changes:**
- **Created:** `public/js/auth-handlers.js`
- **Modified:** `public/js/main.js` (removed lines 1118-1295, made functions globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `file-upload.js`, before `comment-styles.js`
**Dependencies:**
- Requires `window.updateUIForUser` function (defined in main.js)
- Requires `window.fetchAndRenderMessages` function (defined in main.js)
- Requires `window.showError` function (defined in main.js)
- Requires `window.clearError` function (defined in main.js)
- Requires `window.checkAuthStatus` function (defined in main.js)
- Requires authentication DOM elements (defined in main.js)
- Fallback: Uses page reload if dependencies not available

**Global Exposures:**
- `window.initAuthHandlers`
- Authentication DOM elements: `loginBtn`, `registerBtn`, `logoutBtn`, etc.

---

### Migration: Initial Setup Event Listeners

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `initEventListeners` function (event listener setup)

**Changes:**
- **Created:** `public/js/initial-setup.js`
- **Modified:** `public/js/main.js` (removed lines 1054-1147, made elements and functions global)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js` (last in main modules, before comment modules)
**Dependencies:**
- Requires all DOM elements to be available globally (defined in main.js)
- Requires multiple functions: `handlePostSubmit`, `handleMessageClick`, `updateFilePreview`, `clearSelectedFile`, `postMessageToAPI`
- Requires `fetchAndRenderMessages` function (defined in main.js)
- Self-dependent: Requires many DOM elements and functions from main.js
- Comprehensive dependency checking with console error logging for missing dependencies

**Global Exposures:**
- `window.initEventListeners`

---

### Migration: Message Edit Toggle Function

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `toggleEditView` function

**Changes:**
- **Created:** `public/js/message-edit-toggle.js`
- **Modified:** `public/js/main.js` (removed lines 1032-1072, made messages array globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `message-reply-button.js`, before `main.js`
**Dependencies:**
- Requires `window.createButton` function (defined in main.js)
- Requires `window.messages` array (defined in main.js, made globally accessible)
- Fallback: Uses global functions and variables as needed

**Global Exposures:**
- `window.toggleEditView`

---

### Migration: Message Operations Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `deleteMessage` and `saveMessage` functions

**Changes:**
- **Created:** `public/js/message-operations.js`
- **Modified:** `public/js/main.js` (removed lines 968-1038, updated function calls)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `message-edit-toggle.js`, before `main.js`
**Dependencies:**
- Requires `window.messages` array (defined in main.js)
- Requires `window.renderMessage` function (defined in main.js)
- Requires `window.fetchAndRenderMessages` function (defined in main.js)
- Requires `window.loadCommentsForMessage` function (defined in comment-loader.js)
- Fallback: Provides error handling and conditional checks for missing dependencies

**Global Exposures:**
- `window.deleteMessage`
- `window.saveMessage`

---

### Migration: Message Click Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleMessageClick` function

**Changes:**
- **Created:** `public/js/message-click-handler.js`
- **Modified:** `public/js/main.js` (removed lines 903-969, made function globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `message-operations.js`, before `main.js`
**Dependencies:**
- Requires `window.messages` array (defined in main.js)
- Requires `window.deleteMessage` function (defined in message-operations.js)
- Requires `window.saveMessage` function (defined in message-operations.js)
- Requires `window.toggleEditView` function (defined in message-edit-toggle.js)
- Requires `window.renderMessage` function (defined in main.js)
- Requires `window.loadCommentsForMessage` function (defined in comment-loader.js)
- Requires `window.handleReply` function (defined in reply-handler.js)
- Error handling: Logs console errors for missing dependencies

**Global Exposures:**
- `window.handleMessageClick`

---

### Migration: Message Post API Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `postMessageToAPI` function

**Changes:**
- **Created:** `public/js/message-post-api.js`
- **Modified:** `public/js/main.js` (removed lines 826-901, made additional elements and variables globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `message-operations.js`, before `message-click-handler.js`
**Dependencies:**
- Requires `window.messages` array (defined in main.js)
- Requires `window.messageTypeModal` DOM element (defined in main.js)
- Requires `window.messageList` DOM element (defined in main.js)
- Requires `window.messageInput` DOM element (defined in main.js)
- Requires `window.currentUser` object (defined in main.js)
- Requires `window.renderMessage` function (defined in main.js)
- Requires `window.clearSelectedFile` function (defined in main.js)
- Requires `window.loadCommentsForMessage` function (defined in comment-loader.js)
- Fallback: Provides proper error handling and conditional checks for missing dependencies

**Additional Changes Required in main.js:**
- Made `window.messageInput` globally available
- Made `window.currentUser` globally available using Object.defineProperty

**Global Exposures:**
- `window.postMessageToAPI`

---

### Migration: Event Handlers

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handlePostSubmit` function

**Changes:**
- **Created:** `public/js/event-handlers.js`
- **Modified:** `public/js/main.js` (removed lines 772-833, made selectedFile globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `file-upload.js`, before `auth-handlers.js`
**Dependencies:**
- Requires `window.uploadFile` function (defined in file-upload.js)
- Requires multiple DOM elements: `window.messageInput`, `window.fileStatus`, `window.postMessageButton`, `window.messageTypeModal`, etc.
- Requires `window.selectedFile` object (defined in main.js, made globally accessible)
- Fallback: Provides error messages for missing dependencies

**Global Exposures:**
- `window.handlePostSubmit`

---

### Migration: Pagination Functions

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** Pagination functions and URL state management

**Changes:**
- **Created:** `public/js/pagination.js`
- **Modified:** `public/js/main.js` (removed lines 643-779, made pagination variables globally available)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `message-edit-toggle.js`, before `message-operations.js`
**Dependencies:**
- Requires `window.fetchAndRenderMessages` function (defined in main.js)
- Requires pagination variables: `window.currentPage`, `window.totalPages`, `window.currentPrivateKey` (defined in main.js)
- Requires DOM elements: `window.privateKeyInput`, `window.sendKeyButton` for parseURLParams
- Fallback: Provides console error logging for missing dependencies

**Global Exposures:**
- `window.renderPagination`
- `window.calculatePagesToShow`
- `window.updateURL`
- `window.parseURLParams`

---

### Migration: API & Rendering Logic

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `fetchAndRenderMessages` function

**Changes:**
- **Created:** `public/js/api-rendering-logic.js`
- **Modified:** `public/js/main.js` (removed lines 597-660)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js`, before `initial-setup.js` (critical: depends on main.js Object.defineProperty calls)
**Dependencies:**
- Requires `window.currentPage`, `window.totalPages`, `window.currentPrivateKey` variables (defined in main.js)
- Requires `window.privateKeyInput`, `window.messageList`, `window.errorMessage` DOM elements (defined in main.js)
- Requires `window.messages` array (defined in main.js)
- Requires `window.renderMessage` function (defined in main.js)
- Requires `window.renderPagination` function (defined in pagination.js)
- Requires `window.updateURL` function (defined in pagination.js)
- Requires `window.loadCommentsForMessage` function (defined in comment-loader.js)
- Requires `window.checkAuthStatus` function (defined in main.js)
- Requires `window.currentUser` object (defined in main.js)
- Error handling: Provides console error logging for missing dependencies

**Global Exposures:**
- `window.fetchAndRenderMessages`

---

### Migration: Main Rendering Function

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `renderMessage` function

**Changes:**
- **Created:** `public/js/main-rendering-function.js`
- **Modified:** `public/js/main.js` (removed lines 301-592, updated function reference)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js`, before `api-rendering-logic.js`
**Dependencies:**
- Requires `window.createButton` function (defined in main.js)
- Requires `window.converter` instance (defined in main.js)
- Required by `window.fetchAndRenderMessages` function (defined in api-rendering-logic.js)
- Fallback: Creates basic button and text converter if dependencies not available

**Global Exposures:**
- `window.renderMessage`

---

### Migration: File Preview Update Function

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `updateFilePreview` function

**Changes:**
- **Created:** `public/js/file-preview.js`
- **Modified:** `public/js/main.js` (removed lines 258-299, updated function reference)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `file-upload.js`, before `event-handlers.js`
**Dependencies:**
- Requires `window.clearSelectedFile` function (defined in main.js)
- Requires `window.selectedFile` object (defined in main.js)
- Requires DOM elements: `filePreviewContent`, `filePreviewContainer`, `fileStatus` (defined in main.js)
- Required by `window.initialSetup` function (defined in initial-setup.js)
- Error handling: Provides console error logging for missing dependencies

**Additional Changes Required in main.js:**
- Made `window.fileStatus`, `window.filePreviewContainer`, and `window.filePreviewContent` globally available

**Global Exposures:**
- `window.updateFilePreview`

---

### Migration: Authentication UI Helper

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `updateUIForUser` function

**Changes:**
- **Created:** `public/js/auth-ui-helper.js`
- **Modified:** `public/js/main.js` (removed lines 194-216, updated function reference)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** Before `auth-handlers.js`
**Dependencies:**
- Requires `window.currentUser` object (defined in main.js)
- Requires DOM elements: `guestView`, `userView`, `usernameDisplay`, `privateKeyInput`, `sendKeyButton` (defined in main.js)
- Requires `window.fetchAndRenderMessages` function (defined in api-rendering-logic.js)
- Required by `window.initAuthHandlers` function (defined in auth-handlers.js) and main.js
- Error handling: Provides console error logging and fallback to page reload for critical errors

**Global Exposures:**
- `window.updateUIForUser`

---

## Future Considerations

- Consider using a module bundler (Webpack, Rollup) for complex projects
- Implement TypeScript for better code organization
- Add unit tests for extracted modules
- Consider implementing ES6 modules with import/export syntax
