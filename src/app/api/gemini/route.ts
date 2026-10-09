import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let userText = '';
  
  try {
    const body = await req.json();
    userText = (body.text || '').trim();
    const mensagemLower = userText.toLowerCase();

    const isCriarDesapego = 
      mensagemLower.includes('desapegar') || 
      mensagemLower.includes('doar') || 
      mensagemLower.includes('cadastrar') || 
      mensagemLower.includes('vender') ||
      mensagemLower.includes('criar') ||
      mensagemLower.includes('oferecer');

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemInstruction = `Você é o assistente virtual da plataforma ReUse, focado em economia circular, trocas e doações de objetos.
Sua função é orientar os usuários e identificar a intenção deles.
Se o usuário demonstrar interesse em criar um novo desapego, doar, cadastrar um item, vender ou oferecer algo, defina "isCriarDesapego" como true. Caso contrário, defina como false.
Responda sempre em formato JSON estrito.`;


        const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

        for (const model of models) {
          const apiDomain = 'https://generativelanguage.' + 'google' + 'apis' + '.com/v1beta/models/' + model + ':generateContent';
          
          const response = await fetch(`${apiDomain}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userText }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    reply: { type: 'STRING' },
                    isCriarDesapego: { type: 'BOOLEAN' },
                  },
                  required: ['reply', 'isCriarDesapego'],
                },
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              return NextResponse.json({
                reply: [{ response_type: 'text', text: parsed.reply || 'Como posso ajudar?' }],
                isCriarDesapego: !!parsed.isCriarDesapego,
              });
            }
          }
        }
      } catch (apiError) {
        console.warn('API do Google indisponível ou com limite excedido. Usando modo resiliente local.');
      }
    }

    let respostaTexto = "Olá! Sou o assistente do ReUse. Como posso ajudar com seus desapegos hoje?";

    if (isCriarDesapego) {
      respostaTexto = "Com certeza! Vou te redirecionar agora para a página onde você pode cadastrar seu novo desapego...";
    } else if (mensagemLower.includes('oi') || mensagemLower.includes('olá') || mensagemLower.includes('ola')) {
      respostaTexto = "Olá! Você deseja explorar itens disponíveis ou criar um novo desapego?";
    }

    return NextResponse.json({
      reply: [{ response_type: 'text', text: respostaTexto }],
      isCriarDesapego,
    });

  } catch (error) {
    console.error('Erro na rota do assistente:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
