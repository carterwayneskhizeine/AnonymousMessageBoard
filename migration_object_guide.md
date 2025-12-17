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

**Load Order:** After `main.js` (to ensure window.handlePostComment is available)
**Dependencies:** Requires `window.handlePostComment` function to be available globally (defined in main.js)

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

### Migration: Comment Edit Handler

**Status:** ✅ Completed
**Date:** 2025-12-17
**Extractor:** `handleEditComment` function

**Changes:**
- **Created:** `public/js/comment-edit.js`
- **Modified:** `public/js/main.js` (removed lines 1582-1640, made createButton global)
- **Modified:** `views/index.ejs` (added script import)

**Load Order:** After `main.js`, before `comment-delete.js`
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

## Future Considerations

- Consider using a module bundler (Webpack, Rollup) for complex projects
- Implement TypeScript for better code organization
- Add unit tests for extracted modules
- Consider implementing ES6 modules with import/export syntax
