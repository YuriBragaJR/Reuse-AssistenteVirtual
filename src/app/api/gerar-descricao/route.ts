import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { titulo } = await req.json();
    
    if (!titulo) {
      return NextResponse.json({ error: 'Título não fornecido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `Você é um copywriter criativo e especialista em economia circular da plataforma ReUse.
O usuário quer desapegar, doar ou vender um item chamado: "${titulo}".
Sua missão é gerar uma descrição curta (máximo 3 frases) e ALTAMENTE ATRATIVA.

REGRAS DE CRIATIVIDADE (OBRIGATÓRIO):
- Varie o tom de voz a cada geração: pode ser bem humorado, nostálgico, super prático, entusiasmado ou focado no design.
- NUNCA repita frases clichês como "Dando uma nova vida", "Ótima oportunidade", "Ajudar o meio ambiente" ou "Economia circular". Seja sutil.
- Crie um texto único, focado nos benefícios reais e no charme do objeto. Use adjetivos variados.
- Gere de 3 a 5 hashtags criativas.

Responda EXATAMENTE neste formato JSON estrito:
{
  "descricao": "Texto criativo da descrição aqui...",
  "tags": "#tag1 #tag2 #tag3"
}`;

        const apiDomain = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        const response = await fetch(`${apiDomain}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Gere uma descrição ÚNICA, CRIATIVA E SURPREENDENTE para o item: ${titulo}` }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.9, 
              topP: 0.95,
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

    const fallbacks = [
      `Que tal levar este item incrível: ${titulo}? Ele está pronto para fazer parte de uma nova história. Aproveite para economizar e praticar o consumo consciente!`,
      `Achei que você ia gostar de ver: ${titulo}. Perfeito para quem busca qualidade com um ótimo custo-benefício. Faz a sua oferta!`,
      `Item imperdível na área: ${titulo}. Desapegar é uma arte, e levar essa beleza pra casa é melhor ainda. Chama no chat!`
    ];
    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

    return NextResponse.json({
      descricao: randomFallback,
      tags: "#ReUse #Achado #Desapego"
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}