// Minimal frontend auth and gating for MAPEAR
(function(){
  const CONFIG = window.MAPEAR_CONFIG || {};
  const STORAGE_KEY = 'mapear_auth_v1';

  function readAuth(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }

  function writeAuth(data){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function clearAuth(){
    localStorage.removeItem(STORAGE_KEY);
  }

  function isLoggedIn(){
    const a = readAuth();
    return !!(a && a.token && a.user);
  }

  function getToken(){
    const a = readAuth();
    return a?.token || null;
  }

  async function exchangeGoogleIdToken(idToken){
    const res = await fetch(CONFIG.apiBaseUrl + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) throw new Error('Falha ao autenticar no servidor');
    return res.json();
  }

  function ensureAuthModal(){
    if (document.getElementById('auth-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.display = 'none';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div style="max-width:420px;width:92%;background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:18px">
        <h2 style="margin:0 0 8px;color:#60a5fa">Entrar para continuar</h2>
        <p class="muted" style="margin:0 0 14px">Use sua conta Google para acessar Jogos, Curso e Artefatos.</p>
        <div id="gsi-button"></div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn ghost" id="auth-cancel">Cancelar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    document.getElementById('auth-cancel').addEventListener('click', hideModal);
  }

  function showModal(){
    ensureAuthModal();
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'flex';
    renderGoogleButton();
  }

  function hideModal(){
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
  }

  function renderGoogleButton(){
    if (!window.google || !window.google.accounts || !CONFIG.googleClientId) return;
    const target = document.getElementById('gsi-button');
    if (!target) return;
    target.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: CONFIG.googleClientId,
      callback: async (response) => {
        try {
          const data = await exchangeGoogleIdToken(response.credential);
          writeAuth({ token: data.token, user: data.user });
          hideModal();
          updateHeaderUser();
        } catch (err) {
          alert('Não foi possível fazer login. Tente novamente.');
        }
      }
    });
    window.google.accounts.id.renderButton(target, { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'continue_with' });
  }

  function gateLinks(){
    const gatedSelectors = [
      "a[href*='mapear.html']",
      "a[href*='cursoMapear.html']",
      "a[href$='Artefatos.zip']"
    ];
    const links = document.querySelectorAll(gatedSelectors.join(','));
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        if (!isLoggedIn()){
          e.preventDefault();
          showModal();
        }
      });
    });
  }

  function updateHeaderUser(){
    let container = document.getElementById('user-box');
    if (!container){
      container = document.createElement('div');
      container.id = 'user-box';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      const header = document.querySelector('.app-header .main-nav');
      if (header) header.appendChild(container);
    }
    const auth = readAuth();
    if (auth?.user){
      container.innerHTML = '';
      const name = document.createElement('span');
      name.textContent = auth.user.name || auth.user.email;
      name.className = 'muted';
      const out = document.createElement('button');
      out.className = 'btn ghost';
      out.textContent = 'Sair';
      out.addEventListener('click', () => { clearAuth(); updateHeaderUser(); });
      container.appendChild(name);
      container.appendChild(out);
    } else {
      container.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'btn ghost';
      btn.textContent = 'Entrar';
      btn.addEventListener('click', showModal);
      container.appendChild(btn);
    }
  }

  function attachAuthHeader(fetchOptions){
    const token = getToken();
    if (!token) return fetchOptions || {};
    const next = { ...(fetchOptions || {}) };
    next.headers = { ...(next.headers || {}), Authorization: 'Bearer ' + token };
    return next;
  }

  // Expose small API
  window.MAPEAR_AUTH = {
    isLoggedIn,
    getToken,
    attachAuthHeader,
    requireLogin: showModal,
    logout: () => { clearAuth(); updateHeaderUser(); }
  };

  // Init
  document.addEventListener('DOMContentLoaded', function(){
    ensureAuthModal();
    gateLinks();
    updateHeaderUser();
    // If GIS already loaded, render button now
    if (window.google && window.google.accounts) renderGoogleButton();
  });
})();

