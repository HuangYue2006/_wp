function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function updateNavbar() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const userMenu = document.getElementById('userMenu');
  const profileLink = document.getElementById('profileLink');

  if (isLoggedIn()) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'inline-flex';
      const user = getUser();
      if (user) userMenu.querySelector('.username-text').textContent = user.username;
    }
  } else {
    if (loginBtn) loginBtn.style.display = '';
    if (registerBtn) registerBtn.style.display = '';
    if (userMenu) userMenu.style.display = 'none';
  }
  if (profileLink) {
    profileLink.style.display = isLoggedIn() ? '' : 'none';
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

function initAuth() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const res = await api.auth.login({
          username: formData.get('username'),
          password: formData.get('password'),
        });
        saveAuth(res.access_token, res.user);
        closeModal('loginModal');
        loginForm.reset();
        updateNavbar();
        showNotification(`Welcome back, ${res.user.username}!`, 'success');
      } catch (err) {
        document.getElementById('loginError').textContent = err.message;
        document.getElementById('loginError').style.display = 'block';
      }
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      if (formData.get('password') !== formData.get('confirmPassword')) {
        document.getElementById('registerError').textContent = 'Passwords do not match';
        document.getElementById('registerError').style.display = 'block';
        return;
      }
      try {
        const res = await api.auth.register({
          username: formData.get('username'),
          email: formData.get('email'),
          password: formData.get('password'),
        });
        saveAuth(res.access_token, res.user);
        closeModal('registerModal');
        registerForm.reset();
        updateNavbar();
        showNotification(`Welcome, ${res.user.username}!`, 'success');
      } catch (err) {
        document.getElementById('registerError').textContent = err.message;
        document.getElementById('registerError').style.display = 'block';
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      updateNavbar();
      showNotification('Logged out', 'info');
      window.location.href = '/';
    });
  }

  // Show login modal
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      document.getElementById('registerError').style.display = 'none';
      document.getElementById('loginError').style.display = 'none';
      openModal('loginModal');
    });
  }

  // Show register modal
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      document.getElementById('registerError').style.display = 'none';
      document.getElementById('loginError').style.display = 'none';
      openModal('registerModal');
    });
  }

  // Modal switches
  const switchToRegister = document.getElementById('switchToRegister');
  if (switchToRegister) {
    switchToRegister.addEventListener('click', () => {
      closeModal('loginModal');
      openModal('registerModal');
    });
  }

  const switchToLogin = document.getElementById('switchToLogin');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', () => {
      closeModal('registerModal');
      openModal('loginModal');
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) m.classList.remove('show');
    });
  });

  updateNavbar();
}

document.addEventListener('DOMContentLoaded', initAuth);
