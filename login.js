// ===========================
// CONFIG - STATIC CREDENTIALS
// ===========================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// ===========================
// DOM REFS
// ===========================
const usernameInput = document.getElementById('adminUsername');
const passwordInput = document.getElementById('adminPassword');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const togglePassword = document.getElementById('togglePassword');

// ===========================
// TOGGLE PASSWORD VISIBILITY
// ===========================
let passwordVisible = false;

togglePassword.addEventListener('click', function() {
    passwordVisible = !passwordVisible;
    passwordInput.type = passwordVisible ? 'text' : 'password';
    this.textContent = passwordVisible ? '🙈' : '👁️';
});

// ===========================
// LOGIN FUNCTION
// ===========================
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Remove previous error
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    errorMsg.classList.remove('show');

    // Validate empty fields
    if (!username) {
        usernameInput.classList.add('error');
        errorMsg.textContent = '❌ Please enter your username!';
        errorMsg.classList.add('show');
        usernameInput.focus();
        return;
    }

    if (!password) {
        passwordInput.classList.add('error');
        errorMsg.textContent = '❌ Please enter your password!';
        errorMsg.classList.add('show');
        passwordInput.focus();
        return;
    }

    // Show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading-spinner"></span> Verifying...';

    // Simulate verification delay (600ms)
    setTimeout(() => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // ✅ Login Successful
            loginBtn.innerHTML = '✅ Redirecting...';

            // Save session
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', Date.now());
            localStorage.setItem('adminUsername', username);

            // Redirect to generator
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);

        } else {
            // ❌ Login Failed
            usernameInput.classList.add('error');
            passwordInput.classList.add('error');

            if (username !== ADMIN_USERNAME) {
                errorMsg.textContent = '❌ Invalid username! Please try again.';
            } else if (password !== ADMIN_PASSWORD) {
                errorMsg.textContent = '❌ Invalid password! Please try again.';
            } else {
                errorMsg.textContent = '❌ Invalid username or password! Please try again.';
            }

            errorMsg.classList.add('show');

            loginBtn.disabled = false;
            loginBtn.innerHTML = '🚀 Login';

            // Clear password field
            passwordInput.value = '';
            passwordInput.focus();
        }
    }, 600);
}

// ===========================
// LOGIN BUTTON CLICK
// ===========================
loginBtn.addEventListener('click', handleLogin);

// ===========================
// ENTER KEY SUPPORT
// ===========================
document.getElementById('loginForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
    }
});

// ===========================
// SESSION CHECK
// ===========================
(function checkSession() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

    if (isLoggedIn && (Date.now() - loginTime) < sessionDuration) {
        // Already logged in, redirect to generator
        window.location.href = 'index.html';
    }
})();

// ===========================
// AUTO-FOCUS ON USERNAME
// ===========================
window.addEventListener('load', function() {
    usernameInput.focus();
});