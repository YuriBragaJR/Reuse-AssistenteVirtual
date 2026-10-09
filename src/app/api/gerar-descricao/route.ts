import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { titulo } = await req.json();
    
    if (!titulo) {
      return NextResponse.json({ error: 'Título não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Se tiver chave configurada, tenta chamar a API do Google Gemini
    if (apiKey) {
      try {
        const systemInstruction = `Você é um especialista em economia circular e copywriting da plataforma ReUse.
O usuário quer desapegar, doar ou vender um item chamado: "${titulo}".
Sua missão é gerar uma descrição curta (máximo 3 frases), atrativa, ressaltando o valor sustentável de dar uma nova vida a esse objeto. 
Gere também de 3 a 5 hashtags (tags) relevantes.
Responda EXATAMENTE neste formato JSON estrito:
{
  "descricao": "Texto da descrição aqui...",
  "tags": "#tag1 #tag2 #tag3"
}`;

        const apiDomain = 'https://generativelanguage.' + 'google' + 'apis' + '.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        const response = await fetch(`${apiDomain}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Gere a descrição para o item: ${titulo}` }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  descricao: { type: 'STRING' },
                  tags: { type: 'STRING' }
                },
                required: ['descricao', 'tags']
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json(parsed);
          }
        }
      } catch (apiError) {
        console.warn('API do Google com instabilidade no gerador de descrições. Usando fallback.');
      }
    }

    // Fallback local se a API falhar ou bater limite de requisições
    return NextResponse.json({
      descricao: `Ótima oportunidade para adquirir este item: ${titulo}! Dando uma nova vida a este objeto, você contribui ativamente para a economia circular e ajuda a preservar o meio ambiente. Aproveite!`,
      tags: "#ReUse #EconomiaCircular #DesapegoSustentavel"
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
