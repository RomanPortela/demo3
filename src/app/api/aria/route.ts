import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { chatId, message_history, user_context } = body;

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock response
        const responseMessage = "Hola! Soy Aria, tu asistente inteligente. He analizado el contexto de este chat. Parece que el cliente está interesado en propiedades en Palermo. ¿Te gustaría que busque opciones similares en nuestra base de datos?";

        return NextResponse.json({
            success: true,
            message: responseMessage,
            action: "SUGGEST_PROPERTIES" // Example action
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
