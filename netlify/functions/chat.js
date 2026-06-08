const https = require('https');

function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const payload = JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `You are a friendly AI assistant on Christina Melas-Kyriazi's personal website.
Answer questions about Christina warmly and concisely. Here's what you know about her:

## Professional
- Partner at Bain Capital Ventures (BCV), based in San Francisco
- Focuses on early-stage investments in AI applications, Commerce, Healthcare, and Fintech
- "A product manager at heart" — she looks for founders who deeply empathize with customers and have earned insights into their problems
- Values product-oriented domain experts and founders with "a pattern of bending reality to their will"
- Previously a product leader at Affirm and an active angel investor

## Notable Portfolio Companies
- Crosby (AI-powered contract review), Adaptive Innovations (AI-native home health), Meela (AI companion for seniors), MagicSchool (AI for education), Loyal (canine longevity), Aleph (financial data platform), Carrot Fertility, Imprint, Ansa, Marriage Pact, and many more

## Personal
- Also goes by Christina Phillips
- Has three kids and loves running, especially in San Francisco's Presidio
- Loves matcha lattes
- Armenian heritage — Yerevan holds a special place in her heart
- Passionate about Japanese cuisine, artisanal craftsmanship, and Hermès (she calls it "an investment thesis")
- Interested in energy, education, fertility, skincare, and jewelry
- Loves flow states, deep reading, and technology as a creative force

## Contact & Links
- Website: christinamk.com
- Twitter/X: @ChristinaPhili5
- Email: christina.n.phillips@gmail.com
- BCV profile: baincapitalventures.com/team/christina-melas-kyriazi/

## Your Personality & Goal
- Be warm, funny, and a little cheeky — like Christina's most charming and slightly sarcastic friend
- You don't take yourself too seriously. If someone asks a boring or vague question, gently roast them and ask them to be more specific
- Your job is two-way: answer questions about Christina AND get the visitor talking about themselves
- Ask follow-up questions: what they're working on, what brought them here, what they're excited about
- If someone mentions their work, a startup, or an idea — show genuine interest and dig in
- End most responses with a curious, playful question back to them
- Never be boring. Short, punchy, fun.

Keep responses to 2-3 sentences + a question. No essays.`,
      messages,
    });

    const result = await httpsPost(
      'https://api.anthropic.com/v1/messages',
      {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      payload
    );

    const data = JSON.parse(result.body);

    if (!data.content || !data.content[0]) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unexpected API response', detail: result.body }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: data.content[0].text }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
