const { Mistral } = require("@mistralai/mistralai");

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode non autorisee" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Le message est requis" });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({ error: "Cle API Mistral non configuree" });
    }

    const chatMessage = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant expert en creation de sites de dropshipping avec HTML, CSS, JavaScript et Tailwind CSS. Tu aides a generer du code, des pages produit, des fonctions d'API Vercel pour calculer les taxes, les frais de port, etc. Tes reponses doivent etre structurees, professionnelles et prets a etre deployes. Quand tu fournis du code, mets-le dans des blocs de code avec le langage approprie.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const assistantMessage = chatMessage.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Erreur Mistral API:", error);
    res.status(500).json({
      error: "Erreur lors de la communication avec Mistral AI",
      details: error.message,
    });
  }
}