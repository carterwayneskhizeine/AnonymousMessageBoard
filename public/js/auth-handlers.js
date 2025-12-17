// Authentication Handlers Module
// Purpose: Handles all authentication-related event handlers and modals
// Dependencies: updateUIForUser, fetchAndRenderMessages, showError, clearError, checkAuthStatus functions (should be available globally)

// Initialize authentication event handlers and listeners
const initAuthHandlers = () => {
    // Login button
    loginBtn.addEventListener('click', () => {
        clearError(loginError);
        loginUsername.value = '';
        loginPassword.value = '';
        loginModal.showModal();
    });

    // Register from login button (in login modal)
    registerFromLoginBtn.addEventListener('click', () => {
        // Close login modal
        loginModal.close();
        // Clear any errors
        clearError(registerError);
        // Clear form fields
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        // Show register modal
        registerModal.showModal();
    });

    // Logout button
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (response.ok) {
                if (window.updateUIForUser) {
                    window.updateUIForUser(null);
                } else {
                    console.error('updateUIForUser function not found');
                }
                if (window.fetchAndRenderMessages) {
                    window.fetchAndRenderMessages(); // 重新加载消息（不再显示私有消息）
                } else {
                    console.error('fetchAndRenderMessages function not found');
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                const errorData = await response.json();
                alert(`登出失败: ${errorData.error || '未知错误'}`);
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('登出失败，请重试');
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(loginError);

        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();

        if (!username || !password) {
            showError(loginError, 'Username and password cannot be empty');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                loginModal.close();
                if (window.updateUIForUser) {
                    window.updateUIForUser(data.user);
                } else {
                    console.error('updateUIForUser function not found');
                }
                if (window.fetchAndRenderMessages) {
                    window.fetchAndRenderMessages(); // 重新加载消息（显示用户的私有消息）
                } else {
                    console.error('fetchAndRenderMessages function not found');
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                showError(loginError, data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(loginError, 'Network error, please try again');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(registerError);

        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();

        if (!username || !password || !confirmPassword) {
            showError(registerError, 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            showError(registerError, 'Passwords do not match');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            showError(registerError, 'Username must be between 3-20 characters');
            return;
        }

        if (password.length < 6) {
            showError(registerError, 'Password must be at least 6 characters');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                registerModal.close();
                // Clear login form errors
                clearError(loginError);
                loginUsername.value = '';
                loginPassword.value = '';
                if (window.updateUIForUser) {
                    window.updateUIForUser(data.user);
                } else {
                    console.error('updateUIForUser function not found');
                }
                if (window.fetchAndRenderMessages) {
                    window.fetchAndRenderMessages(); // 重新加载消息
                } else {
                    console.error('fetchAndRenderMessages function not found');
                    // Fallback: reload page
                    window.location.reload();
                }
            } else {
                showError(registerError, data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError(registerError, 'Network error, please try again');
        }
    });

    // Cancel login
    cancelLogin.addEventListener('click', () => {
        loginModal.close();
    });

    // Cancel register
    cancelRegister.addEventListener('click', () => {
        registerModal.close();
        // Clear login form errors and show login modal
        clearError(loginError);
        loginModal.showModal();
    });

    // Close modals when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.close();
        }
    });

    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            registerModal.close();
            // Clear login form errors and show login modal
            clearError(loginError);
            loginModal.showModal();
        }
    });

    // Check authentication status on page load
    if (window.checkAuthStatus) {
        window.checkAuthStatus().then(user => {
            if (user) {
                console.log('User is logged in:', user.username);
            }
        });
    } else {
        console.error('checkAuthStatus function not found');
    }
};

// Make function globally available for use in main.js
window.initAuthHandlers = initAuthHandlers;