import express from 'express';
import session from 'express-session';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🔗 TON SITE (NE CHANGE RIEN)
const FRONTEND_ORIGIN = 'https://exositeweb.github.io';
const DASHBOARD_PATH = '/exobot-website/dashboard.html';
const REDIRECT_URI = FRONTEND_ORIGIN + DASHBOARD_PATH;

const DISCORD_API = 'https://discord.com/api';

// ===== MIDDLEWARES =====
app.use(express.json());

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(session({
  name: 'exobot.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none'
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// ===== AUTH DISCORD =====
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds'
  });

  res.json({
    authUrl: `${DISCORD_API}/oauth2/authorize?${params.toString()}`
  });
});

app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;

  try {
    const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    const token = await tokenRes.json();
    if (!token.access_token) {
      return res.status(400).json({ success: false });
    }

    const userRes = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });

    const user = await userRes.json();

    req.session.user = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      accessToken: token.access_token
    };

    res.json({ success: true, user: req.session.user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// ===== API =====
app.get('/api/user', requireAuth, (req, res) => {
  res.json(req.session.user);
});

app.get('/api/guilds', requireAuth, async (req, res) => {
  const r = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${req.session.user.accessToken}` }
  });
  res.json(await r.json());
});

// ===== SETTINGS (simple mais fiable) =====
const SETTINGS = {};

app.get('/api/settings/:guildId', requireAuth, (req, res) => {
  res.json(SETTINGS[req.params.guildId] || {});
});

app.post('/api/settings/:guildId', requireAuth, (req, res) => {
  SETTINGS[req.params.guildId] = req.body;
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('ExoBot backend prêt sur le port', PORT);
});