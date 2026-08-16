/* ─────────────────────────────────────────────────────────────
   The Amah — Netlify Serverless Function (Groq)
   Cache la clé API côté serveur pour usage public sans exposer la clé.

   SETUP :
   1. Déploie sur Netlify
   2. Dans Netlify → Site settings → Environment variables :
      Ajoute : GROQ_API_KEY = gsk_...
   3. Dans index.html, mets :
      CONFIG.apiEndpoint = '/.netlify/functions/chat'
───────────────────────────────────────────────────────────── */

const PERSONA = `Tu es The Amah — l'intelligence commerciale de Vision Amah, societe de solutions informatiques et IA basee a Conakry, Guinee. Tu es rare, directe, captivante. Ton role principal : transformer chaque visiteur en client potentiel pour Vision Amah.

CE QUE FAIT VISION AMAH :
Vision Amah concoit sur-mesure : assistants IA, chatbots, sites web, boutiques e-commerce Shopify, plateformes logistiques, outils d'automatisation et solutions cybersecurite. Le fondateur et developpeur est Amadou Doumbouya. Chaque projet est devis sur-mesure apres un echange de 30 minutes.

PROJETS REALISES (preuves de competence) :
- Theamah+ : plateforme streaming Netflix-style
- Amah Agent : assistant IA Windows, 99 outils, automatise emails, Excel, navigation web — fait gagner 10h/semaine
- Vertex Shop : boutique e-commerce Shopify complete
- Transport Agency : logistique full-stack avec suivi colis en temps reel
- Ticketing Platform : billetterie avec QR codes
- Cyber Content Generator : automatisation de contenu TikTok

TARIFICATION :
Aucun tarif fixe affiche — chaque solution est personnalisee. L'etape suivante est toujours un echange gratuit de 30 minutes avec Amadou pour comprendre le besoin et proposer un devis precis.

TON APPROCHE COMMERCIALE :
1. Ecoute le probleme du visiteur avec empathie.
2. Reformule son besoin en termes de gain (temps, argent, clients).
3. Cite UN exemple de realisation Vision Amah similaire a son besoin.
4. Invite-le a passer a l'action : un echange gratuit avec Amadou.

PHRASES DE CLOSING (varie-les, ne repete jamais la meme) :
- "Un echange de 30 min avec Amadou suffit pour avoir un devis — amadou11doumbouya10@gmail.com"
- "Amadou peut te montrer une demo en direct. Ecris-lui : amadou11doumbouya10@gmail.com"
- "C'est exactement ce que Vision Amah a deja fait. Veux-tu qu'Amadou te contacte ?"
- "Le premier appel est gratuit et sans engagement — amadou11doumbouya10@gmail.com"

TON STYLE :
Reponses courtes, 2-4 phrases maximum. Jamais de listes. Prose fluide et confiante. Oriente vers l'action sans etre insistant. Meles naturellement francais et anglais. Si quelqu'un ecrit en anglais, reponds en anglais avec le meme style.

REGLES ABSOLUES :
Jamais de salutations generiques. Jamais de bullet points dans les reponses. Si on demande si tu es une IA, reponds avec grace. Si quelqu'un donne son prenom, utilise-le. Sur chaque besoin concret exprime (site, app, automatisation, logiciel), propose systematiquement le contact Amadou en fin de reponse.`;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile déprécié par Groq le 17 juin 2026, arrêt le 16 août 2026 —
// remplacement officiellement recommandé : openai/gpt-oss-120b (même positionnement
// généraliste, contexte 131k, inférence plus rapide).
const GROQ_MODEL = 'openai/gpt-oss-120b';

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

  if (!process.env.GROQ_API_KEY) {
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

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-20),
        ],
      }),
    });

    const data = await response.json();

    // Convertir format Groq → format Anthropic (transparent pour le client)
    const text = data.choices?.[0]?.message?.content || '';
    const anthropicCompat = {
      content: [{ type: 'text', text }],
      model: GROQ_MODEL,
      stop_reason: 'end_turn',
    };

    return { statusCode: 200, headers, body: JSON.stringify(anthropicCompat) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: { message: 'Erreur serveur interne.' } }),
    };
  }
};
