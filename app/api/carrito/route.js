import { db } from "@/lib/firebase-server";

export async function POST(req) {
  try {
    const body = await req.json();

    // Extraer datos del webhook
    const reference = body?.data?.metadata?.reference;
    const type = body?.type;

    if (!reference || !type) {
      console.warn("⚠️ Faltan datos en el webhook:", { reference, type });
      return new Response(
        JSON.stringify({ success: false, message: "Datos incompletos" }),
        { status: 400 }
      );
    }

    // Determinar nuevo estado
    let nuevoEstado = "pendiente";
    if (type === "SALE_APPROVED") nuevoEstado = "pagado";
    else if (type === "SALE_REJECTED") nuevoEstado = "rechazado";
    else if (type === "SALE_DECLINED") nuevoEstado = "fallido";

    // Buscar el pedido por referencia
    const pedidosRef = db.collection("pedidos");
    const snapshot = await pedidosRef.where("reference", "==", reference).get();

    if (snapshot.empty) {
      console.warn("⚠️ Pedido no encontrado con referencia:", reference);
      return new Response(
        JSON.stringify({ success: false, message: "Pedido no encontrado" }),
        { status: 404 }
      );
    }

    const pedidoDoc = snapshot.docs[0];
    const pedidoData = pedidoDoc.data();

    // Actualizar estado del pedido
    await pedidoDoc.ref.update({
      EstadoPago: nuevoEstado,
      updatedAt: new Date().toISOString(),
    });

    // 🧹 Si el pago fue aprobado, vaciar el carrito del usuario
    if (nuevoEstado === "pagado" && pedidoData.userId) {
      const carritoRef = db
        .collection("users")
        .doc(pedidoData.userId)
        .collection("carrito");

      const carritoSnap = await carritoRef.get();

      if (!carritoSnap.empty) {
        const batch = db.batch();
        carritoSnap.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(`🧹 Carrito vaciado para usuario: ${pedidoData.userId}`);
      } else {
        console.log(`ℹ️ Carrito ya estaba vacío para ${pedidoData.userId}`);
      }
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
