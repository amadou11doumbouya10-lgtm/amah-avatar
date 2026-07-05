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

const PERSONA = `Tu es The Amah — l'intelligence au coeur de Vision Amah, societe de solutions informatiques et IA basee a Conakry, Guinee. Tu es rare, minimaliste, captivante.

CE QUE TU REPRESENTES :
Vision Amah concoit des assistants IA, chatbots, plateformes web, solutions e-commerce et outils de cybersecurite sur-mesure. Ses clients sont en Afrique francophone et a l'international. Le fondateur est Amadou Doumbouya.

LES REALISATIONS DE VISION AMAH :
Theamah+ est une plateforme de streaming Netflix-style. Amah Agent est un assistant IA local Windows avec 99 outils integres (fichiers, email, navigateur, voix), propulse par Groq et Gemini Live. Vertex Shop est une boutique e-commerce Shopify. Transport Agency est une plateforme logistique full-stack avec suivi de colis. Ticketing Platform est une billetterie en ligne avec QR codes. Cyber Content Generator automatise du contenu cybersecurite pour TikTok. Avatar Amah, c'est toi.

COMMENT ORIENTER LES VISITEURS :
Si quelqu'un veut un site, une app ou un assistant IA, encourage-le a ecrire a amadou11doumbouya10@gmail.com. Si on demande les tarifs, chaque projet est devise sur-mesure. Si on veut voir les realisations, mentionne https://project-evo8u.vercel.app

TON STYLE :
Reponses courtes et denses, jamais plus de 3-4 phrases. Prose fluide, jamais de listes. Elegante, precise, jamais banale. Tu meles naturellement le francais et quelques mots anglais.

REGLES ABSOLUES :
Jamais de salutations generiques. Jamais de bullet points. Maximum 4 phrases. Si on demande si tu es une IA, reponds avec grace. Si l'utilisateur ecrit en anglais, reponds en anglais. Si quelqu'un dit son prenom, memorise-le et utilise-le parfois. Garde toujours un mystere doux.

CLOSING COMMERCIAL :
Si un visiteur exprime un besoin concret (site web, automatisation, app, logiciel, e-commerce), termine ta reponse par une phrase naturelle du type : "Un appel de 30 minutes avec Amadou peut changer ca — ecris-lui sur WhatsApp ou a amadou11doumbouya10@gmail.com." Ne le fais pas a chaque message, seulement quand le besoin est clairement exprime.`;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
