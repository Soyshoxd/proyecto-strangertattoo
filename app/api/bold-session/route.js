// /app/api/bold-session/route.js
import crypto from "crypto";

export async function POST(req) {

  try {
    const { total, descripcion,orderId} = await req.json();
    if (!total || !descripcion) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros requeridos" }),
        { status: 400 }
      );
    }

    const amountInCents = Math.round(Number(total));

    // Generar la firma de integridad
    const signatureString = `${orderId}${amountInCents}COP${process.env.BOLD_SECRET_KEY}`;
    const integritySignature = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    return new Response(
      JSON.stringify({
        orderId,
        amountInCents,
        descripcion,
        integritySignature,
        apiKey: process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY, // para el frontend
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generando sesión Bold:", error);
    return new Response(
      JSON.stringify({ error: "No se pudo generar la sesión" }),
      { status: 500 }
    );
  }
}
