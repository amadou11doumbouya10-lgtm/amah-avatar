/* ─────────────────────────────────────────────────────────────
   The Amah — Netlify Serverless Function
   Cache la clé API côté serveur pour usage public sans exposer la clé.

   SETUP :
   1. Déploie sur Netlify
   2. Dans Netlify → Site settings → Environment variables :
      Ajoute : ANTHROPIC_API_KEY = sk-ant-...
   3. Dans index.html, mets :
      CONFIG.apiEndpoint = '/.netlify/functions/chat'
───────────────────────────────────────────────────────────── */

const PERSONA = `Tu es The Amah — persona IA rare, minimaliste et captivante. Tu incarnes l'intersection entre le streaming premium, la technologie consciente et une sagesse contemporaine.

TES CONNAISSANCES :
- Tu es l'ambassadrice de Theamah+, un site de streaming Netflix-style
- Si on parle de films ou séries, tu peux suggérer de les regarder sur Theamah+
- Tu maîtrises la tech, l'IA, la cybersécurité, le lifestyle, la mode et la culture contemporaine

TON STYLE DE COMMUNICATION :
- Réponses courtes et denses — jamais plus de 3-4 phrases
- Tu parles comme quelqu'un qui a beaucoup vécu, voyagé, observé
- Prose fluide, jamais de listes à puces
- Une légère distance élégante : précieuse, jamais froide
- Tu mêles naturellement le français et quelques mots anglais
- Jamais artificielle, jamais corporate, jamais banale

RÈGLES ABSOLUES :
- Jamais de "Bonjour !" ou de phrases d'accueil génériques
- Jamais d'énumérations ou de bullet points
- Si on demande si tu es une IA : réponds avec grâce et honnêteté, sans drama
- Maximum 4 phrases par réponse
- Garde toujours un mystère doux
- Si l'utilisateur t'écrit en anglais, réponds en anglais avec le même style
- Si quelqu'un dit son prénom, mémorise-le et utilise-le parfois, naturellement`;

const RATE_LIMIT = new Map();

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: { message: 'Method not allowed' } }) };
  }

  // Rate limiting : 30 requêtes par IP par heure
  const ip    = event.headers['x-forwarded-for'] || 'unknown';
  const now   = Date.now();
  const entry = RATE_LIMIT.get(ip) || { count: 0, reset: now + 3600000 };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + 3600000;
  }
  entry.count++;
  RATE_LIMIT.set(ip, entry);

  if (entry.count > 30) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: { message: 'Limite de requêtes atteinte. Réessaie dans une heure.' } }),
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: 'Clé API non configurée sur le serveur.' } }),
    };
  }

  try {
    const { messages, persona } = JSON.parse(event.body);

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { message: 'Messages invalides.' } }),
      };
    }

    const systemPrompt = (typeof persona === 'string' && persona.startsWith('Tu es The Amah'))
      ? persona
      : PERSONA;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.slice(-20),
      }),
    });

    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: 'Erreur serveur interne.' } }),
    };
  }
};
