# The Amah — Avatar Persona Chatbot + Agent IA

## Présentation du projet
Avatar IA public représentant **Vision Amah**, société de solutions informatiques et IA basée à Conakry, Guinée (fondateur : Amadou Doumbouya). Combine un chatbot commercial élégant (face visiteurs — qualifie et convertit vers un échange avec Amadou) et un agent de surveillance (face propriétaire). Fait aussi partie de l'écosystème Theamah / Theamah+ (mentionné comme réalisation).

**Live** : https://legendary-selkie-d298b7.netlify.app — intégré comme widget flottant `💬` dans Theamah+.

## Structure des fichiers
```
avatar Amah/
├── index.html                  ← Chatbot public (visiteurs)
├── admin.html                  ← Dashboard agent (propriétaire)
├── netlify.toml                ← Config déploiement Netlify
├── README.md                   ← Vue d'ensemble publique du repo
├── netlify/
│   └── functions/
│       └── chat.js             ← API proxy sécurisé (cache la clé, appelle Groq)
├── API Claude/                 ← Clé API locale (ignorée par git, ne jamais commiter)
└── notes/
    └── projet.txt              ← Documentation historique (session 1, en partie obsolète)
```

## Accès et mots de passe
- **Dashboard admin** : `amah2026` (ligne `const ADMIN_PASSWORD` dans admin.html)
- **Email projet** : mkaba6181@gmail.com
- **Email contact commercial (persona)** : amadou11doumbouya10@gmail.com
- **Modèle IA (public, via le proxy Netlify)** : `openai/gpt-oss-120b` sur **Groq** — voir `GROQ_MODEL` dans chat.js. Variable d'environnement Netlify requise : `GROQ_API_KEY` (plus `ANTHROPIC_API_KEY`). Remplace `llama-3.3-70b-versatile`, déprécié par Groq le 17/06/2026 et arrêté le 16/08/2026.
- **Modèle IA (mode privé, clé directe)** : `claude-sonnet-4-6` — utilisé seulement si `CONFIG.apiEndpoint` est vide dans index.html (chemin de secours pour usage personnel, pas celui des visiteurs publics).

## CONFIG dans index.html
```javascript
const CONFIG = {
  apiKey:        '',   // clé directe pour usage privé
  apiEndpoint:   '/.netlify/functions/chat',
  model:         'claude-sonnet-4-6',  // valeur envoyée par le client, ignorée par chat.js (qui force GROQ_MODEL)
  maxMessages:   20,
  historyWindow: 10,
};
```
- Laisser `apiKey` vide → page demande la clé au visiteur
- `apiEndpoint` déjà actif → aucune clé requise des visiteurs en prod

## Persona The Amah — "intelligence commerciale de Vision Amah"
Définie dans la constante `PERSONA` de index.html ET chat.js (**les deux doivent rester synchronisées** — un désync a été trouvé et corrigé le 16/08/2026, chat.js étant resté sur une version antérieure pendant plusieurs commits).
- Rôle : qualifier le besoin du visiteur et le convertir en contact avec Amadou (30 min gratuites)
- Cite les réalisations Vision Amah (Theamah+, Amah Agent, Vertex Shop, Transport Agency, Ticketing Platform, Cyber Content Generator) comme preuves de compétence
- Style : court (2-4 phrases), direct, élégant, jamais de listes, jamais de "Bonjour !"
- Closing commercial varié en fin de réponse quand un besoin concret est exprimé, jamais à chaque message
- Mélange naturel français/anglais, répond en anglais si on lui écrit en anglais

## Déploiement Netlify (déjà en place)
1. Site settings → Environment variables → `GROQ_API_KEY` (pas `ANTHROPIC_API_KEY`)
2. `CONFIG.apiEndpoint` déjà réglé sur `/.netlify/functions/chat` dans index.html
3. `netlify deploy --prod` pour republier après changement

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
