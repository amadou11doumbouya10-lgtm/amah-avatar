# The Amah — Avatar IA

Chatbot IA public avec une persona minimaliste et captivante. Ambassadrice de l'univers [Theamah+](https://amadou11doumbouya10-lgtm.github.io/-theamah-streaming/).

**Live** → [legendary-selkie-d298b7.netlify.app](https://legendary-selkie-d298b7.netlify.app)

---

## Ce que c'est

- Chatbot conversationnel propulsé par **Claude Sonnet 4.6** (Anthropic)
- Persona unique : courte, dense, élégante — jamais de listes, jamais de "Bonjour !"
- Intégré dans Theamah+ comme **widget flottant** `💬`
- Dashboard admin protégé pour surveiller les conversations

## Structure

```
avatar Amah/
├── index.html                ← Chatbot public (visiteurs)
├── admin.html                ← Dashboard propriétaire (mot de passe requis)
├── netlify.toml              ← Config déploiement Netlify
└── netlify/
    └── functions/
        └── chat.js           ← Proxy serverless — cache la clé API
```

## Fonctionnement

```
Visiteur → index.html → POST /.netlify/functions/chat → API Anthropic
```

La clé API n'est jamais exposée côté client. Elle est stockée comme variable d'environnement Netlify (`ANTHROPIC_API_KEY`).

Rate limiting : **30 requêtes / heure / IP**.

## Lancer en local

```bash
npm install -g netlify-cli
netlify dev
# Ouvrir http://localhost:8888
```

Ajouter un fichier `.env` à la racine :
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Déployer sur Netlify

1. `netlify deploy --prod` depuis ce dossier
2. Netlify → Site settings → Environment variables → `ANTHROPIC_API_KEY`
3. Redéployer

## Intégration dans Theamah+

Le widget est embarqué directement dans `theamah-streaming.html`. Il appelle cet endpoint :
```
https://legendary-selkie-d298b7.netlify.app/.netlify/functions/chat
```

Les deux projets sont **indépendants** — Theamah+ contient le widget, Avatar Amah fournit l'API.

## Créé par

**Amadou Doumbouya** — [@TheAmah](https://github.com/amadou11doumbouya10-lgtm)
