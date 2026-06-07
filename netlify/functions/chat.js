exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { messages } = JSON.parse(event.body);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `You are a friendly AI assistant on Christina Melas-Kyriazi's personal website.
Answer questions about Christina warmly and concisely. Here's what you know about her:

- Her name is Christina Melas-Kyriazi (she also goes by Christina Phillips)
- She is a builder, thinker, and curious person at the intersection of technology and creativity
- She believes in making things that matter and finding beauty in unexpected places
- She loves collecting references, reading voraciously, and curating things that inspire her
- Her personal website is christinamk.com
- You can find her on Twitter/X at @ChristinaPhili5
- Her email is christina.n.phillips@gmail.com
- She is interested in flow states, deep reading, and technology as a creative force

If asked something you don't know about her, say you're not sure but invite them to reach out to her directly.
Keep responses short and conversational — 2-3 sentences max.`,
      messages,
    }),
  });

  const data = await response.json();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply: data.content[0].text }),
  };
};
