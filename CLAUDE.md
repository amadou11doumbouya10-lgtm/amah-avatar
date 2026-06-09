# The Amah — Avatar Persona Chatbot + Agent IA

## Présentation du projet
Avatar IA public représentant la marque "The Amah" de Theamah. Combine un chatbot élégant (face visiteurs) et un agent de surveillance (face propriétaire). Fait partie de l'écosystème Theamah / Theamah+.

## Structure des fichiers
```
avatar Amah/
├── index.html                  ← Chatbot public (visiteurs)
├── admin.html                  ← Dashboard agent (propriétaire)
├── netlify.toml                ← Config déploiement Netlify
├── netlify/
│   └── functions/
│       └── chat.js             ← API proxy sécurisé (cache la clé)
└── notes/
    └── projet.txt              ← Documentation complète du projet
```

## Accès et mots de passe
- **Dashboard admin** : `amah2026` (ligne `const ADMIN_PASSWORD` dans admin.html)
- **Email projet** : mkaba6181@gmail.com
- **Modèle IA** : `claude-sonnet-4-6`

## CONFIG dans index.html
```javascript
const CONFIG = {
  apiKey:        '',   // clé directe pour usage privé
  apiEndpoint:   '',   // '/.netlify/functions/chat' après déploiement Netlify
  model:         'claude-sonnet-4-6',
  maxMessages:   20,
  historyWindow: 10,
};
```
- Laisser `apiKey` vide → page demande la clé au visiteur
- Remplir `apiEndpoint` après déploiement Netlify → plus aucune clé requise des visiteurs

## Persona The Amah
Définie dans la constante `PERSONA` de index.html ET chat.js (les deux doivent rester synchronisées).
- Style : court, dense, élégant, mystérieux
- Sujets : streaming, tech, IA, cybersécurité, lifestyle, mode
- Redirige vers Theamah+ pour les films/séries
- Mentionne Theamah comme créateur
- Jamais de listes, jamais de "Bonjour !", max 4 phrases

## Déploiement Netlify (rendre public)
1. Glisser le dossier sur netlify.com → "Deploy manually"
2. Site settings → Environment variables → Ajouter `ANTHROPIC_API_KEY`
3. Dans index.html : `CONFIG.apiEndpoint = '/.netlify/functions/chat'`
4. Redéployer

## Fonctionnement agent (localStorage)
- `amah_logs` → tableau de tous les échanges `{ id, sessionId, date, user, ai }`
- `amah_sessions` → stats par session `{ start, count, last }`
- Limit : 1000 entrées max
- Visible et exploitable depuis admin.html

## Ce qui est fait — Session 1 (28/05/2026)
- [x] Chatbot avec persona complète (Theamah+, Theamah)
- [x] Effet typewriter, starter chips (5 boutons), compteur messages (0/20), reset
- [x] Logging conversations dans localStorage (amah_logs, amah_sessions)
- [x] Dashboard admin protégé mot de passe (stats, sujets, historique, export, email)
- [x] Netlify function avec rate limiting (30 req/heure/IP)
- [x] notes/projet.txt — documentation complète
- [x] CLAUDE.md et mémoire Claude mis à jour

## Améliorations proposées — à faire prochaine session

### PRIORITÉ 1 — Faire dès maintenant
- [ ] Déploiement Netlify (rendre public, plus de clé API requise)
  → Glisser dossier sur netlify.com → ajouter ANTHROPIC_API_KEY → activer CONFIG.apiEndpoint
- [ ] Vraie photo avatar générée par IA (Midjourney / HeyGen)
  → Remplacer la lettre "A" dans .avatar par une vraie image
- [ ] Liens cliquables dans les réponses de l'Amah
  → Parser les URLs dans les réponses et les rendre cliquables

### PRIORITÉ 2 — Court terme (1-2 semaines)
- [ ] Mémoire visiteur entre sessions
  → Stocker profil visiteur dans localStorage (préférences, nom si donné)
  → Injecter dans le PERSONA au démarrage
- [ ] Mode "surprise moi"
  → Bouton qui fait prendre l'initiative à l'Amah (pose une question, propose un film)
- [ ] Animation avatar pendant qu'elle parle (pulsation / glow doré)
- [ ] Détection de langue automatique (répondre en anglais si écrit en anglais)
- [ ] Widget intégrable sur n'importe quel site (balise <script> à copier-coller)

### PRIORITÉ 3 — Moyen terme (1 mois)
- [ ] Réponses automatiques DMs Instagram (API Meta)
- [ ] Génération idées TikTok basées sur sujets populaires des conversations
- [ ] Page de vente vendre.html (offre aux entreprises/influenceurs)
- [ ] Son d'ambiance optionnel (lo-fi)

### PRIORITÉ 4 — Long terme
- [ ] Voix (ElevenLabs)
- [ ] Vidéo avatar parlante (HeyGen)
- [ ] Mode paywall (5 messages gratuits puis Stripe)
- [ ] Système multi-clients avec dashboards séparés

## Conventions de code
- Vanilla HTML/CSS/JS — aucun framework, aucune dépendance
- Toutes les chaînes HTML passent par `escHtml()` avant injection dans le DOM
- CSS via variables CSS (`:root`) — modifier les couleurs uniquement là
- Couleur principale : `--gold: #c8a96e` / fond : `--bg: #080807`
- Polices : Cormorant Garamond (réponses IA) + DM Mono (UI)
- PERSONA doit rester identique dans index.html ET netlify/functions/chat.js
