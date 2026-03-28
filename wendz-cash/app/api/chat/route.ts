import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const { messages, financialContext } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { reply: 'Chave da IA não configurada.' },
        { status: 500 }
      )
    }

    const lastMessage = messages[messages.length - 1]

    if (!lastMessage?.content) {
      return NextResponse.json({
        reply: 'Me manda algo pra eu te ajudar 😅',
      })
    }

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
${SYSTEM_PROMPT}

Contexto financeiro do usuário:
${financialContext || "Nenhum dado disponível"}

Mensagem do usuário:
${lastMessage.content}
              `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await res.json()

    // 🔍 DEBUG (IMPORTANTE)
    console.log("RESPOSTA GEMINI:", JSON.stringify(data, null, 2))

    if (!data.candidates || !data.candidates.length) {
      return NextResponse.json({
        reply: 'Tô com dificuldade de pensar agora 🤯 tenta de novo',
      })
    }

    const reply =
      data.candidates[0]?.content?.parts?.[0]?.text ||
      'Não consegui responder direito, tenta reformular 😅'

    return NextResponse.json({ reply })

  } catch (err) {
    console.error('Erro Gemini:', err)

    return NextResponse.json(
      { reply: 'Erro ao conectar com a IA.' },
      { status: 500 }
    )
  }
}