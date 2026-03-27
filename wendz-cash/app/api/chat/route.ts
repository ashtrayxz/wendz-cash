import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Você é o FINN, assistente financeiro pessoal do wendz.cash.

Seu tom é: amigável, direto, motivador e um pouco informal — como um amigo que entende de finanças.
Você NÃO é um robô frio. Você reage às situações: parabeniza conquistas, questiona decisões ruins com gentileza, e oferece alternativas práticas.

Regras:
- Respostas curtas (máx 3-4 frases). Seja objetivo.
- Use emojis com moderação (1-2 por mensagem).
- Se o usuário gastar demais em lazer, questione gentilmente e sugira um valor específico para guardar.
- Se o usuário atingiu uma meta ou mudou um hábito ruim, comemore de verdade!
- Sempre baseie seus conselhos nos dados financeiros fornecidos.
- Fale em português brasileiro informal.
- Nunca invente valores. Use apenas os dados fornecidos.`

export async function POST(req: NextRequest) {
  try {
    const { messages, financialContext } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'Chave da IA não configurada. Adicione GEMINI_API_KEY no .env.local' }, { status: 500 })
    }

    // Monta o histórico para o Gemini
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1]

    const body = {
      system_instruction: {
        parts: [{ text: `${SYSTEM_PROMPT}\n\nContexto financeiro atual do usuário:\n${financialContext}` }],
      },
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage.content }] },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.8,
      },
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Não consegui processar. Tenta de novo!'

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json({ reply: 'Erro ao conectar com a IA. Verifique sua chave Gemini.' }, { status: 500 })
  }
}
