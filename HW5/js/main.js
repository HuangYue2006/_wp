const state = {
  currentTheme: localStorage.getItem('theme') || 'light',
  projects: [],
};

const DOM = {
  themeToggle: document.getElementById('themeToggle'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  navLinks: document.getElementById('navLinks'),
  navbar: document.getElementById('navbar'),
  projectsGrid: document.getElementById('projectsGrid'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  modalDesc: document.getElementById('modalDesc'),
  modalLangs: document.getElementById('modalLangs'),
  modalLink: document.getElementById('modalLink'),
  modalClose: document.getElementById('modalClose'),
  contactForm: document.getElementById('contactForm'),
  formSuccess: document.getElementById('formSuccess'),
  currentYear: document.getElementById('currentYear'),
};

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.currentTheme);
  DOM.themeToggle.textContent = state.currentTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.currentTheme);
  initTheme();
}

function handleNavScroll() {
  requestAnimationFrame(() => {
    DOM.navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMobileMenu() {
  DOM.navLinks.classList.toggle('open');
  DOM.mobileMenuBtn.textContent = DOM.navLinks.classList.contains('open') ? '✕' : '☰';
}

function closeMobileMenu() {
  DOM.navLinks.classList.remove('open');
  DOM.mobileMenuBtn.textContent = '☰';
}

function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

async function fetchProjects() {
  try {
    const res = await fetch('https://api.github.com/users/HuangYue2006/repos?sort=updated&per_page=10');
    if (!res.ok) throw new Error('Failed to fetch');
    state.projects = await res.json();
    renderProjects();
  } catch (err) {
    renderEmptyProjects();
  }
}

function renderEmptyProjects() {
  if (!DOM.projectsGrid) return;
  DOM.projectsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted)">暫無公開專案</p>';
}

function getLangColor(lang) {
  const colors = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    HTML: '#e34f26',
    CSS: '#563d7c',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    C: '#555555',
    'C++': '#f34b7d',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
  };
  return colors[lang] || '#8b8b8b';
}

function renderProjects() {
  if (!DOM.projectsGrid) return;

  const filtered = state.projects.filter(r => !r.fork).slice(0, 6);

  if (filtered.length === 0) {
    renderEmptyProjects();
    return;
  }

  DOM.projectsGrid.innerHTML = filtered.map(repo => `
    <div class="project-card" data-repo="${repo.name}">
      <div class="project-card-body">
        <h3>${repo.name}</h3>
        <p>${repo.description || '暫無描述'}</p>
        <div class="project-langs">
          ${repo.language ? `<span class="project-lang" style="background:${getLangColor(repo.language)}22;color:${getLangColor(repo.language)}">${repo.language}</span>` : ''}
          ${repo.topics?.slice(0, 3).map(t => `<span class="project-lang">${t}</span>`).join('') || ''}
        </div>
        <div class="project-links">
          <a href="${repo.html_url}" target="_blank" onclick="event.stopPropagation()">GitHub →</a>
          ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" onclick="event.stopPropagation()">Demo →</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.repo));
  });
}

function openModal(repoName) {
  const repo = state.projects.find(r => r.name === repoName);
  if (!repo) return;

  DOM.modalTitle.textContent = repo.name;
  DOM.modalDesc.textContent = repo.description || '這個專案還沒有描述。';
  DOM.modalLangs.innerHTML = repo.language
    ? `<span class="project-lang" style="background:${getLangColor(repo.language)}22;color:${getLangColor(repo.language)}">${repo.language}</span>`
    : '';
  DOM.modalLink.href = repo.html_url;
  DOM.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  DOM.modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function handleContactSubmit(e) {
  e.preventDefault();
  let valid = true;

  const fields = [
    { id: 'name', label: '姓名' },
    { id: 'email', label: 'Email' },
    { id: 'message', label: '訊息' },
  ];

  fields.forEach(({ id, label }) => {
    const input = document.getElementById(id);
    const group = input.closest('.form-group');
    if (!input.value.trim()) {
      group.classList.add('error');
      group.querySelector('.error').textContent = `請填寫${label}`;
      valid = false;
    } else {
      group.classList.remove('error');
    }
  });

  const email = document.getElementById('email');
  const emailGroup = email.closest('.form-group');
  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailGroup.classList.add('error');
    emailGroup.querySelector('.error').textContent = '請輸入有效的 Email';
    valid = false;
  }

  if (!valid) return;

  DOM.contactForm.style.display = 'none';
  DOM.formSuccess.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setActiveNav();

  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }

  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }

  if (DOM.mobileMenuBtn) {
    DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });

  if (DOM.modalClose) {
    DOM.modalClose.addEventListener('click', closeModal);
  }

  if (DOM.modalOverlay) {
    DOM.modalOverlay.addEventListener('click', e => {
      if (e.target === DOM.modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', handleContactSubmit);
  }

  if (DOM.projectsGrid) {
    fetchProjects();
  }
});
