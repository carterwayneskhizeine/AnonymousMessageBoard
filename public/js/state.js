export let messages = [];
export let currentUser = null;
export let selectedFile = null;
export let currentPage = 1;
export let totalPages = 1;
export let currentPrivateKey = '';
export let isPrivateFilterMode = false;
export let currentFeedType = 'latest';

export function setMessages(newMessages) {
  messages = newMessages;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export function setSelectedFile(file) {
  selectedFile = file;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function setTotalPages(pages) {
    totalPages = pages;
}

export function setCurrentPrivateKey(key) {
    currentPrivateKey = key;
}

export function setIsPrivateFilterMode(mode) {
    isPrivateFilterMode = mode;
}

export function setCurrentFeedType(type) {
    currentFeedType = type;
}