const API_BASE = 'https://exobot-backend.onrender.com';

const loginSection = document.getElementById('loginSection');
const userSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const guildList = document.getElementById('guildList');
const logoutBtn = document.getElementById('logoutBtn');

// ===== AUTH =====
async function loginWithDiscord() {
  const res = await fetch(`${API_BASE}/auth/discord`, {
    credentials: 'include'
  });
  const data = await res.json();
  window.location.href = data.authUrl;
}

async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  location.reload();
}

// ===== SESSION =====
async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error();

    const user = await res.json();
    showDashboard(user);
  } catch {
    showLogin();
  }
}

// ===== UI =====
function showLogin() {
  loginSection.classList.remove('hidden');
  userSection.classList.add('hidden');
  logoutBtn.style.display = 'none';
}

function showDashboard(user) {
  loginSection.classList.add('hidden');
  userSection.classList.remove('hidden');
  logoutBtn.style.display = 'inline-flex';

  renderUser(user);
  loadGuilds();
}

function renderUser(user) {
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  userInfo.innerHTML = `
    <div style="display:flex;align-items:center;gap:15px">
      <img src="${avatar}" width="64" style="border-radius:50%">
      <div>
        <strong>${user.username}</strong>
        <div style="color:var(--muted)">Discord</div>
      </div>
    </div>
  `;
}

// ===== GUILDS =====
async function loadGuilds() {
  const res = await fetch(`${API_BASE}/api/guilds`, {
    credentials: 'include'
  });

  const guilds = await res.json();
  guildList.innerHTML = '';

  guilds.forEach(g => {
    const card = document.createElement('div');
    card.className = 'guild-card';
    card.innerHTML = `
      <h3>${g.name}</h3>
      <button class="btn primary">Configurer</button>
    `;
    guildList.appendChild(card);
  });
}

logoutBtn.onclick = logout;

checkSession();