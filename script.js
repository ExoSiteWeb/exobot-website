// Animation d'entrée au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Animation des éléments du header
    const header = document.querySelector('header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            header.style.transition = 'all 0.6s ease-out';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }

    // Animation des éléments flottants
    const elements = document.querySelectorAll('.element');
    Array.from(elements).filter(Boolean).forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px) scale(0.8)';
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        }, 300 + index * 200);
    });

    // Animation du texte du héros
    const heroText = document.querySelector('.hero-content h1');
    const heroParagraph = document.querySelector('.hero-content p');
    const heroButtons = document.querySelector('.hero-buttons');

    [heroText, heroParagraph, heroButtons].forEach((element, index) => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 600 + index * 200);
        }
    });

    // Dashboard OAuth handling
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'dashboard.html') {
        handleDashboardAuth();
    }
});

// Gestion des onglets (features et dashboard)
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    if (button) {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');

            // Cacher tous les panneaux
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Afficher le panneau correspondant
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    }
});

// Dashboard functionality
function initializeDashboard() {
    // Tab switching for dashboard
    const dashboardTabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    const dashboardTabPanes = document.querySelectorAll('.dashboard-tabs .tab-pane');

    dashboardTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            dashboardTabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Hide all panes
            dashboardTabPanes.forEach(pane => pane.classList.remove('active'));

            // Show corresponding pane
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Role management
    initializeRoleManagement();

    // Settings actions
    initializeSettingsActions();

    // Load saved settings
    loadDashboardSettings();
}

function initializeRoleManagement() {
    // Add role functionality
    const addModBtn = document.querySelector('#mod-role + .add-role-btn');
    const addAdminBtn = document.querySelector('#admin-role + .add-role-btn');

    if (addModBtn) {
        addModBtn.addEventListener('click', () => addRole('mod'));
    }

    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', () => addRole('admin'));
    }

    // Load saved roles
    loadSavedRoles();
}

function addRole(type) {
    const input = document.getElementById(`${type}-role`);
    const roleName = input.value.trim();

    if (roleName) {
        const roleList = document.getElementById(`${type}-roles-list`);
        const roleTag = document.createElement('div');
        roleTag.className = 'role-tag';
        roleTag.innerHTML = `
            ${roleName}
            <span class="remove-role" onclick="removeRole(this, '${type}')">&times;</span>
        `;
        roleList.appendChild(roleTag);
        input.value = '';

        // Save to localStorage
        saveRole(type, roleName);
    }
}

function removeRole(element, type) {
    const roleTag = element.parentElement;
    const roleName = roleTag.textContent.replace('×', '').trim();
    roleTag.remove();

    // Remove from localStorage
    removeSavedRole(type, roleName);
}

function saveRole(type, roleName) {
    const roles = JSON.parse(localStorage.getItem(`dashboard_${type}_roles`) || '[]');
    if (!roles.includes(roleName)) {
        roles.push(roleName);
        localStorage.setItem(`dashboard_${type}_roles`, JSON.stringify(roles));
    }
}

function removeSavedRole(type, roleName) {
    const roles = JSON.parse(localStorage.getItem(`dashboard_${type}_roles`) || '[]');
    const index = roles.indexOf(roleName);
    if (index > -1) {
        roles.splice(index, 1);
        localStorage.setItem(`dashboard_${type}_roles`, JSON.stringify(roles));
    }
}

function loadSavedRoles() {
    ['mod', 'admin'].forEach(type => {
        const roles = JSON.parse(localStorage.getItem(`dashboard_${type}_roles`) || '[]');
        const roleList = document.getElementById(`${type}-roles-list`);

        if (roleList) {
            roles.forEach(roleName => {
                const roleTag = document.createElement('div');
                roleTag.className = 'role-tag';
                roleTag.innerHTML = `
                    ${roleName}
                    <span class="remove-role" onclick="removeRole(this, '${type}')">&times;</span>
                `;
                roleList.appendChild(roleTag);
            });
        }
    });
}

function initializeSettingsActions() {
    // Save settings
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDashboardSettings);
    }

    // Reset settings
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDashboardSettings);
    }

    // Export settings
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardSettings);
    }
}

async function saveDashboardSettings() {
    const guildSelect = document.getElementById('guild-select');
    const selectedGuildId = guildSelect?.value;

    if (!selectedGuildId) {
        showNotification('Veuillez sélectionner un serveur avant de sauvegarder', 'error');
        return;
    }

    const settings = {
        moderation: {
            antiSpam: document.getElementById('anti-spam-toggle')?.checked || false,
            spamThreshold: parseInt(document.getElementById('spam-threshold')?.value) || 5,
            linkFilter: document.getElementById('link-filter-toggle')?.checked || false,
            allowedDomains: document.getElementById('allowed-domains')?.value || '',
            wordFilter: document.getElementById('word-filter-toggle')?.checked || false,
            bannedWords: document.getElementById('banned-words')?.value || '',
            spamSanction: document.getElementById('spam-sanction')?.value || 'warn',
            linkSanction: document.getElementById('link-sanction')?.value || 'delete',
            wordSanction: document.getElementById('word-sanction')?.value || 'delete'
        },
        support: {
            tickets: document.getElementById('tickets-toggle')?.checked || false,
            ticketCategory: document.getElementById('ticket-category')?.value || 'Support',
            logs: document.getElementById('logs-toggle')?.checked || false,
            logChannel: document.getElementById('log-channel')?.value || '#logs',
            antiRaid: document.getElementById('anti-raid-toggle')?.checked || false,
            raidThreshold: parseInt(document.getElementById('raid-threshold')?.value) || 10,
            verification: document.getElementById('verification-toggle')?.checked || false,
            verificationRole: document.getElementById('verification-role')?.value || 'Membre'
        },
        utilities: {
            games: document.getElementById('games-toggle')?.checked || false,
            info: document.getElementById('info-toggle')?.checked || false,
            tools: document.getElementById('tools-toggle')?.checked || false
        },
        general: {
            botPrefix: document.getElementById('bot-prefix')?.value || '!',
            botLanguage: document.getElementById('bot-language')?.value || 'fr',
            botStatus: document.getElementById('bot-status')?.value || 'online',
            botActivity: document.getElementById('bot-activity')?.value || 'J\'aide les membres !'
        }
    };

    try {
        const response = await fetch(`${API_BASE}/api/settings/${selectedGuildId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            showNotification('Paramètres sauvegardés avec succès sur le serveur !', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Erreur lors de la sauvegarde des paramètres', 'error');
    }
}

function loadDashboardSettings() {
    const settings = JSON.parse(localStorage.getItem('dashboard_settings') || '{}');

    // Load moderation settings
    if (document.getElementById('anti-spam-toggle')) {
        document.getElementById('anti-spam-toggle').checked = settings.antiSpam || false;
        document.getElementById('spam-threshold').value = settings.spamThreshold || 5;
        document.getElementById('link-filter-toggle').checked = settings.linkFilter || false;
        document.getElementById('allowed-domains').value = settings.allowedDomains || '';
        document.getElementById('word-filter-toggle').checked = settings.wordFilter || false;
        document.getElementById('banned-words').value = settings.bannedWords || '';
    }

    // Load sanctions
    if (document.getElementById('spam-sanction')) {
        document.getElementById('spam-sanction').value = settings.spamSanction || 'warn';
        document.getElementById('link-sanction').value = settings.linkSanction || 'delete';
        document.getElementById('word-sanction').value = settings.wordSanction || 'delete';
    }

    // Load support settings
    if (document.getElementById('tickets-toggle')) {
        document.getElementById('tickets-toggle').checked = settings.tickets || false;
        document.getElementById('ticket-category').value = settings.ticketCategory || 'Support';
        document.getElementById('logs-toggle').checked = settings.logs || false;
        document.getElementById('log-channel').value = settings.logChannel || '#logs';
        document.getElementById('anti-raid-toggle').checked = settings.antiRaid || false;
        document.getElementById('raid-threshold').value = settings.raidThreshold || 10;
        document.getElementById('verification-toggle').checked = settings.verification || false;
        document.getElementById('verification-role').value = settings.verificationRole || 'Membre';
    }

    // Load utilities settings
    if (document.getElementById('games-toggle')) {
        document.getElementById('games-toggle').checked = settings.games || false;
        document.getElementById('info-toggle').checked = settings.info || false;
        document.getElementById('tools-toggle').checked = settings.tools || false;
    }

    // Load general settings
    if (document.getElementById('bot-prefix')) {
        document.getElementById('bot-prefix').value = settings.botPrefix || '!';
        document.getElementById('bot-language').value = settings.botLanguage || 'fr';
        document.getElementById('bot-status').value = settings.botStatus || 'online';
        document.getElementById('bot-activity').value = settings.botActivity || 'J\'aide les membres !';
    }
}

function resetDashboardSettings() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
        localStorage.removeItem('dashboard_settings');
        localStorage.removeItem('dashboard_mod_roles');
        localStorage.removeItem('dashboard_admin_roles');
        location.reload();
    }
}

function exportDashboardSettings() {
    const settings = {
        settings: JSON.parse(localStorage.getItem('dashboard_settings') || '{}'),
        modRoles: JSON.parse(localStorage.getItem('dashboard_mod_roles') || '[]'),
        adminRoles: JSON.parse(localStorage.getItem('dashboard_admin_roles') || '[]')
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'exobot-dashboard-config.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showNotification('Configuration exportée avec succès !', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS
const notificationStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);

// Animation au défilement
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer les sections pour l'animation au défilement
const sections = document.querySelectorAll('.features, .docs, .help');
sections.forEach(section => {
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    }
});

// Observer les éléments de fonctionnalité
const featureItems = document.querySelectorAll('.feature-item');
featureItems.forEach((item, index) => {
    if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease-out';
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    }
});

// Observer les éléments de docs et help
const docsItems = document.querySelectorAll('.docs-info, .docs-buttons');
docsItems.forEach((item, index) => {
    if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease-out';
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    }
});

const helpItems = document.querySelectorAll('.help-item');
helpItems.forEach((item, index) => {
    if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease-out';
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
    }
});

// Navigation fluide
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') {
            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70; // Ajustement pour le header fixe
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Effet de survol pour les boutons d'invitation
const inviteButtons = document.querySelectorAll('.invite-btn');
inviteButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animation des éléments flottants continus
function animateFloatingElements() {
    const elements = document.querySelectorAll('.element');
    elements.forEach((element, index) => {
        const delay = index * 2000; // Délai différent pour chaque élément
        setTimeout(() => {
            element.style.animation = 'floatElement 6s ease-in-out infinite';
        }, delay);
    });
}

animateFloatingElements();

// Effet de particules en arrière-plan (optionnel)
function createParticles() {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            heroSection.appendChild(particle);
        }
    }
}

// Ajouter des styles CSS pour les particules
const particleStyles = `
.particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: rgba(99, 102, 241, 0.3);
    border-radius: 50%;
    pointer-events: none;
    animation: particleFloat linear infinite;
}

@keyframes particleFloat {
    0% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

// Injecter les styles des particules
const styleSheet = document.createElement('style');
styleSheet.textContent = particleStyles;
document.head.appendChild(styleSheet);

// Créer les particules après un court délai
setTimeout(createParticles, 1000);

// Gestion du menu mobile (si nécessaire à l'avenir)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Écouter les changements de taille d'écran pour ajuster les animations
window.addEventListener('resize', function() {
    // Réinitialiser les animations si nécessaire
    if (window.innerWidth <= 768) {
        // Ajustements pour mobile
        const elements = document.querySelectorAll('.element');
        elements.forEach(element => {
            if (element) {
                element.style.width = '60px';
                element.style.height = '60px';
            }
        });
    } else {
        // Ajustements pour desktop
        const elements = document.querySelectorAll('.element');
        elements.forEach(element => {
            if (element) {
                element.style.width = '80px';
                element.style.height = '80px';
            }
        });
    }
});

// Dashboard authentication system
const API_BASE = 'https://exobot-backend.onrender.com'; // Local development URL

function handleDashboardAuth() {
    console.log('handleDashboardAuth called');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    console.log('OAuth code:', code ? 'present' : 'not present');

    if (code) {
        console.log('Processing OAuth code...');
        // Exchange code for access token via backend
        exchangeCodeForToken(code);
    } else {
        console.log('No OAuth code, checking existing session...');
        // Check if already logged in via backend
        checkExistingSession();
    }
}

async function checkExistingSession() {
    try {
        const response = await fetch(`${API_BASE}/api/user`, {
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('Existing session found, showing dashboard');
            showDashboard(userData);
        } else {
            console.log('No session found, showing login form');
            showLoginForm();
        }
    } catch (error) {
        console.error('Error checking session:', error);
        showLoginForm();
    }
}

async function exchangeCodeForToken(code) {
    try {
        console.log('Exchanging code for token via backend...');

        const response = await fetch(`${API_BASE}/auth/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            showDashboard(data.user);
            showNotification('Connexion Discord réussie !', 'success');
        } else {
            throw new Error(data.error || 'Authentication failed');
        }

    } catch (error) {
        console.error('Error exchanging code for token:', error);
        showNotification('Erreur lors de la connexion Discord: ' + error.message, 'error');
        showLoginForm();
    }
}

async function fetchDiscordUser() {
    // This function is now handled by the backend
    // Keeping for compatibility but it should not be called directly
    console.warn('fetchDiscordUser should not be called directly, use backend API instead');
}

function showLoginForm() {
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.style.display = 'flex';
    }

    const dashboardContent = document.querySelector('.dashboard-features');
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }
}

function showDashboard(user) {
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.style.display = 'none';
    }

    const dashboardControl = document.querySelector('.dashboard-control');
    if (dashboardControl) {
        dashboardControl.style.display = 'block';

        // Initialize dashboard functionality
        initializeDashboard();

        // Update user profile in dashboard
        updateUserProfile(user);

        // Load user guilds
        loadUserGuilds();

        // Add user info to header
        const navContainer = document.querySelector('.nav-container');
        if (navContainer && !document.querySelector('.user-info')) {
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32" alt="Avatar" style="border-radius: 50%; width: 32px; height: 32px;">
                    <span>${user.username}</span>
                    <button onclick="logout()" style="background: none; border: none; color: var(--text-light); cursor: pointer;">Déconnexion</button>
                </div>
            `;
            navContainer.appendChild(userInfo);
        }
    }
}

function updateUserProfile(user) {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userDiscriminator = document.getElementById('user-discriminator');

    if (userAvatar) {
        userAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
    }
    if (userName) {
        userName.textContent = user.username;
    }
    if (userDiscriminator) {
        userDiscriminator.textContent = `#${user.discriminator}`;
    }
}

async function loadUserGuilds() {
    try {
        const response = await fetch(`${API_BASE}/api/guilds`, {
            credentials: 'include'
        });

        if (response.ok) {
            const guilds = await response.json();
            populateGuildSelector(guilds);
        } else {
            console.error('Failed to load guilds');
        }
    } catch (error) {
        console.error('Error loading guilds:', error);
    }
}

function populateGuildSelector(guilds) {
    const guildSelect = document.getElementById('guild-select');
    if (!guildSelect) return;

    guildSelect.innerHTML = '<option value="">Sélectionnez un serveur</option>';

    guilds.forEach(guild => {
        const option = document.createElement('option');
        option.value = guild.id;
        option.textContent = guild.name;
        guildSelect.appendChild(option);
    });

    // Add event listener for guild selection
    guildSelect.addEventListener('change', (e) => {
        const selectedGuildId = e.target.value;
        if (selectedGuildId) {
            loadGuildSettings(selectedGuildId);
        }
    });
}

async function loadGuildSettings(guildId) {
    try {
        const response = await fetch(`${API_BASE}/api/settings/${guildId}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const settings = await response.json();
            applySettingsToUI(settings);
            showNotification('Paramètres chargés pour ce serveur', 'success');
        } else {
            console.error('Failed to load settings');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function applySettingsToUI(settings) {
    // Moderation settings
    if (settings.moderation) {
        document.getElementById('anti-spam-toggle').checked = settings.moderation.antiSpam || false;
        document.getElementById('spam-threshold').value = settings.moderation.spamThreshold || 5;
        document.getElementById('link-filter-toggle').checked = settings.moderation.linkFilter || false;
        document.getElementById('allowed-domains').value = settings.moderation.allowedDomains || '';
        document.getElementById('word-filter-toggle').checked = settings.moderation.wordFilter || false;
        document.getElementById('banned-words').value = settings.moderation.bannedWords || '';

        document.getElementById('spam-sanction').value = settings.moderation.spamSanction || 'warn';
        document.getElementById('link-sanction').value = settings.moderation.linkSanction || 'delete';
        document.getElementById('word-sanction').value = settings.moderation.wordSanction || 'delete';
    }

    // Support settings
    if (settings.support) {
        document.getElementById('tickets-toggle').checked = settings.support.tickets || false;
        document.getElementById('ticket-category').value = settings.support.ticketCategory || 'Support';
        document.getElementById('logs-toggle').checked = settings.support.logs || false;
        document.getElementById('log-channel').value = settings.support.logChannel || '#logs';
        document.getElementById('anti-raid-toggle').checked = settings.support.antiRaid || false;
        document.getElementById('raid-threshold').value = settings.support.raidThreshold || 10;
        document.getElementById('verification-toggle').checked = settings.support.verification || false;
        document.getElementById('verification-role').value = settings.support.verificationRole || 'Membre';
    }

    // Utilities settings
    if (settings.utilities) {
        document.getElementById('games-toggle').checked = settings.utilities.games || false;
        document.getElementById('info-toggle').checked = settings.utilities.info || false;
        document.getElementById('tools-toggle').checked = settings.utilities.tools || false;
    }

    // General settings
    if (settings.general) {
        document.getElementById('bot-language').value = settings.general.botLanguage || 'fr';
        document.getElementById('bot-status').value = settings.general.botStatus || 'online';
        document.getElementById('bot-activity').value = settings.general.botActivity || 'J\'aide les membres !';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    // Clear local storage and reload
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_refresh_token');
    localStorage.removeItem('discord_user');
    location.reload();
}

async function initiateDiscordLogin() {
    try {
        const response = await fetch(`${API_BASE}/auth/discord`);
        const data = await response.json();
        window.location.href = data.authUrl;
    } catch (error) {
        console.error('Error initiating Discord login:', error);
        showNotification('Erreur lors de l\'initialisation de la connexion Discord', 'error');
    }
}
