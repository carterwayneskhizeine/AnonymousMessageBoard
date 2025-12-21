import { loginError, registerError, filePreviewContainer, fileStatus, fileUpload } from './ui-elements.js';
import { selectedFile as selectedFileState, setCurrentUser, setSelectedFile } from './state.js';
import { updateUIForUser } from './auth-ui-helper.js';

// Button creator with icon support
export const createButton = (text, id, action) => {
    const icons = {
        copy: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.43 0 0 1.43 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-8, -7.5)" d="M 2.5 1 C 1.675781 1 1 1.675781 1 2.5 L 1 10.5 C 1 11.324219 1.675781 12 2.5 12 L 4 12 L 4 12.5 C 4 13.324219 4.675781 14 5.5 14 L 13.5 14 C 14.324219 14 15 13.324219 15 12.5 L 15 4.5 C 15 3.675781 14.324219 3 13.5 3 L 12 3 L 12 2.5 C 12 1.675781 11.324219 1 10.5 1 Z M 2.5 2 L 10.5 2 C 10.78125 2 11 2.21875 11 2.5 L 11 10.5 C 11 10.78125 10.78125 11 10.5 11 L 2.5 11 C 2.21875 11 2 10.78125 2 10.5 L 2 2.5 C 2 2.21875 2.21875 2 2.5 2 Z M 12 4 L 13.5 4 C 13.78125 4 14 4.21875 14 4.5 L 14 12.5 C 14 12.78125 13.78125 13 13.5 13 L 5.5 13 C 5.21875 13 5 12.78125 5 12.5 L 5 12 L 10.5 12 C 11.324219 12 12 11.324219 12 10.5 Z" stroke-linecap="round" /></g></svg>`,
        edit: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/2000/svg'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.53 0 0 0.53 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-24, -24)" d="M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 C 4.909599585679415 41.61136473005194 5.055818649159609 42.174475161087585 5.440671944485212 42.559328331832646 C 5.8255252398108155 42.944181502577706 6.388635718178886 43.090400383773854 6.9121094 42.941406 L 17.302734 39.974609 C 17.30338593263404 39.97395859988369 17.304037266243494 39.97330759960771 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 C 38.82682299993104 9.171875423758669 38.82747400006896 9.171875423758669 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 C 10.91015642375867 31.52083300006896 10.91015642375867 31.52018199993104 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z" stroke-linecap="round" /></g></svg>`,
        reply: `<svg width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/2000/svg'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(0.48 0 0 0.48 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;" transform=" translate(-25, -28.01)" d="M 20.875 11 C 20.691406 11.023438 20.519531 11.101563 20.375 11.21875 L 4.375 24.21875 C 4.136719 24.410156 4 24.695313 4 25 C 4 25.304688 4.136719 25.589844 4.375 25.78125 L 20.375 38.78125 C 20.675781 39.023438 21.085938 39.070313 21.433594 38.902344 C 21.78125 38.734375 22 38.382813 22 38 L 22 31.09375 C 32.605469 31.308594 38.09375 34.496094 40.90625 37.65625 C 43.769531 40.878906 43.992188 43.90625 44 44 C 44 44 44 44.0625 44 44.0625 C 44.015625 44.613281 44.480469 45.046875 45.03125 45.03125 C 45.582031 45.015625 46.015625 44.550781 46 44 C 46 44 46 43.9375 46 43.9375 C 46 43.9375 46 43.875 46 43.875 C 45.996094 43.683594 45.886719 37.699219 42.78125 31.5625 C 39.71875 25.507813 33.511719 19.414063 22 19.0625 L 22 12 C 22.003906 11.710938 21.878906 11.4375 21.664063 11.246094 C 21.449219 11.054688 21.160156 10.964844 20.875 11 Z M 20 14.09375 L 20 20 C 20 20.550781 20.449219 21 21 21 C 32.511719 21 38.082031 26.671875 41 32.4375 C 41.742188 33.90625 42.296875 35.375 42.71875 36.75 C 42.601563 36.609375 42.53125 36.484375 42.40625 36.34375 C 39.089844 32.613281 32.753906 29 21 29 C 20.449219 29 20 29.449219 20 30 L 20 35.90625 L 6.59375 25 Z" stroke-linecap="round" /></g></svg>`,
        delete: `<svg id='Delete_Bin_1_24' width='18' height='18' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/2000/svg'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.43 0 0 1.43 12 12)" ><g style="" ><g transform="matrix(1 0 0 1 0 2.5)" ><polyline style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" points="4.5,-4 3.5,4 -3.5,4 -4.5,-4 " /></g><g transform="matrix(1 0 0 1 0 -3.5)" ><line style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" x1="-6" y1="0" x2="6" y2="0" /></g><g transform="matrix(1 0 0 1 -0.04 -5.02)" ><path style="stroke: rgb(255,255,255); stroke-width: 1; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" transform=" translate(-6.96, -1.98)" d="M 4.46 3.21 L 4.46 1.48 C 4.46 0.9277152501692065 4.907715250169207 0.48 5.46 0.48 L 8.46 0.48 C 9.012284749830794 0.48 9.46 0.9277152501692063 9.46 1.4799999999999998 L 9.46 3.48" stroke-linecap="round" /></g></g></g></svg>`,
        save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`,
        cancel: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
        md: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`
    };

    const button = document.createElement('button');
    button.innerHTML = icons[action] || '';
    if (action === 'md') {
        button.innerHTML += '<span class="ml-1 text-[10px] font-bold">MD</span>';
        button.className = 'btn-bp-outline h-8 flex items-center px-2 py-1 text-xs transition-colors hover:text-bp-gold';
    } else {
        button.className = 'btn-bp-icon';
    }
    button.title = text;
    button.dataset.id = id;
    button.dataset.action = action;
    return button;
};


// Error display utilities
export const showError = (element, message) => {
    element.textContent = message;
    element.classList.remove('hidden');
};

export const clearError = (element) => {
    element.textContent = '';
    element.classList.add('hidden');
};

// Authentication status checker
export const checkAuthStatus = async () => {
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

// File selection clearer
export const clearSelectedFile = () => {
    if (selectedFileState && selectedFileState.previewUrl) {
        URL.revokeObjectURL(selectedFileState.previewUrl);
    }
    setSelectedFile(null);
    filePreviewContainer.classList.add('hidden');
    fileStatus.textContent = 'No file selected';
    fileStatus.classList.remove('text-green-400');
    fileStatus.classList.add('text-gray-500');
    fileUpload.value = '';
};
