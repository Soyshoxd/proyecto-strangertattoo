import { db } from "@/lib/firebase-server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📩 Webhook recibido:", JSON.stringify(body, null, 2)); // 💬 log completo

    const reference = body?.data?.metadata?.reference;
    const type = body?.type;

    if (!reference || !type) {
      console.warn("⚠️ Faltan datos en el webhook:", { reference, type });
      return new Response(JSON.stringify({ success: false, message: "Datos incompletos" }), { status: 400 });
    }

    let nuevoEstado = "pendiente";
    if (type === "SALE_APPROVED") nuevoEstado = "pagado";
    else if (type === "SALE_REJECTED") nuevoEstado = "rechazado";
    else if (type === "SALE_DECLINED") nuevoEstado = "fallido";

    console.log(`🔍 Buscando pedido con referencia ${reference}`);

    const pedidosRef = db.collection("pedidos");
    const snapshot = await pedidosRef.where("reference", "==", reference).get();

    if (snapshot.empty) {
      console.warn("⚠️ Pedido no encontrado con referencia:", reference);
      return new Response(JSON.stringify({ success: false, message: "Pedido no encontrado" }), { status: 404 });
    }

    const pedidoDoc = snapshot.docs[0];
    const pedidoData = pedidoDoc.data();
    const userId = pedidoData.userId;
    console.log("📦 Pedido encontrado, usuario:", userId);

    await pedidoDoc.ref.update({
      EstadoPago: nuevoEstado,
      updatedAt: new Date().toISOString(),
    });

    if (nuevoEstado === "pagado" && userId) {
      console.log(`🧹 Intentando vaciar carrito de ${userId}...`);
      const carritoRef = db.collection("users").doc(userId).collection("carrito");
      const carritoSnap = await carritoRef.get();
      console.log(`🛒 Documentos encontrados en carrito: ${carritoSnap.size}`);

      for (const item of carritoSnap.docs) {
        console.log("🗑️ Eliminando:", item.id);
        await item.ref.delete();
      }

      console.log(`✅ Carrito vaciado correctamente para ${userId}`);
    } else {
      console.log("⏭️ No se vacía carrito (no pagado o sin userId)");
    }

    return new Response(
      JSON.stringify({ success: true, nuevoEstado }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("🔥 Error en webhook Bold:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
