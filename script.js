/**************************************************
 * CONFIG
 **************************************************/
const API_BASE = 'https://exobot-backend.onrender.com';

/**************************************************
 * ELEMENTS DOM
 **************************************************/
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('userSection');
const userInfo = document.getElementById('userInfo');
const guildList = document.getElementById('guildList');
const logoutBtn = document.getElementById('logoutBtn');

/**************************************************
 * INIT
 **************************************************/
document.addEventListener('DOMContentLoaded', () => {
  handleAuthFlow();
});

/**************************************************
 * AUTH FLOW
 **************************************************/
function handleAuthFlow() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (code) {
    exchangeCodeForToken(code);
  } else {
    checkExistingSession();
  }
}

async function exchangeCodeForToken(code) {
  try {
    const res = await fetch(`${API_BASE}/auth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code })
    });

    if (!res.ok) throw new Error();

    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname);
    checkExistingSession();
  } catch {
    showLogin();
  }
}

async function checkExistingSession() {
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

/**************************************************
 * UI STATES
 **************************************************/
function showLogin() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboard(user) {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');

  renderUser(user);
  loadGuilds();
}

/**************************************************
 * USER
 **************************************************/
function renderUser(user) {
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  userInfo.innerHTML = `
    <div class="user-card">
      <img src="${avatar}" width="80" alt="Avatar">
      <div>
        <strong>${user.username}</strong>
        <p>#${user.discriminator ?? '0000'}</p>
      </div>
    </div>
  `;
}

/**************************************************
 * GUILDS
 **************************************************/
async function loadGuilds() {
  try {
    const res = await fetch(`${API_BASE}/api/guilds`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error();

    const guilds = await res.json();
    renderGuilds(guilds);
  } catch {
    guildList.innerHTML = '<li>Impossible de charger les serveurs</li>';
  }
}

function renderGuilds(guilds) {
  guildList.innerHTML = '';

  if (!guilds.length) {
    guildList.innerHTML = '<li>Aucun serveur gérable</li>';
    return;
  }

  guilds.forEach(guild => {
    const li = document.createElement('li');
    li.className = 'guild-item';
    li.innerHTML = `
      <strong>${guild.name}</strong>
      <button onclick="openGuildSettings('${guild.id}', '${guild.name}')">
        Gérer
      </button>
    `;
    guildList.appendChild(li);
  });
}

/**************************************************
 * SETTINGS
 **************************************************/
async function openGuildSettings(guildId, guildName) {
  const settings = await getSettings(guildId);

  const antiSpam = settings.moderation?.antiSpam ?? false;

  const html = `
    <h3>${guildName}</h3>
    <label>
      <input type="checkbox" id="antiSpamToggle" ${antiSpam ? 'checked' : ''}>
      Anti-spam
    </label>
    <br><br>
    <button onclick="saveGuildSettings('${guildId}')">Sauvegarder</button>
  `;

  guildList.innerHTML = `<li>${html}</li>`;
}

async function getSettings(guildId) {
  try {
    const res = await fetch(`${API_BASE}/api/settings/${guildId}`, {
      credentials: 'include'
    });
    return await res.json();
  } catch {
    return {};
  }
}

async function saveGuildSettings(guildId) {
  const antiSpam = document.getElementById('antiSpamToggle').checked;

  const settings = {
    moderation: {
      antiSpam
    }
  };

  await fetch(`${API_BASE}/api/settings/${guildId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });

  alert('Paramètres sauvegardés');
  loadGuilds();
}

/**************************************************
 * LOGOUT
 **************************************************/
logoutBtn.addEventListener('click', async () => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  location.reload();
});
