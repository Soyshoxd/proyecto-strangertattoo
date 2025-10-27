import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error("❌ Faltan variables de entorno de Firebase Admin.");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Firebase Admin inicializado correctamente");
    }
  } catch (error) {
    console.error("🔥 Error al inicializar Firebase Admin:", error);
  }
}

export const db = admin.firestore();
export { admin };
