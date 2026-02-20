
const API_BASE = '/api/v1'; // Versioned API path

const loginform = document.getElementById('login-form');
const registerform = document.getElementById('register-form');
const apiStatus = document.getElementById('api-status');


async function checkApiHealth() {
    if (!apiStatus) return;

    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.status === 'UP') {
            apiStatus.textContent = 'Online';
            apiStatus.className = 'status-indicator online';
        }
    } catch (err) {
        apiStatus.textContent = 'Offline';
        apiStatus.className = 'status-indicator offline';
    }
}

async function login(email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'tickets.html';
        } else {
            showToast('Email ou senha incorretos', 'error');
        }
    } catch (err) {
        showToast('Erro de rede', 'error');
    }
}

async function registerUser(name, email, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            window.location.href = '/index.html';
        } else {
            showToast('Email ou senha incorretos', 'error');
        }
    } catch (err) {
        showToast('Erro de rede', 'error');
    }
}

if (registerform) {
    registerform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        await registerUser(name, email, password);
    });
}

if (loginform) {
    loginform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await login(email, password);
    });
}
// Initial Load
checkApiHealth();
// Interval health check
setInterval(checkApiHealth, 10000);
