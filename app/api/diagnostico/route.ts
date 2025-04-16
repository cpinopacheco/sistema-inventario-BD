import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // Verificar variables de entorno
    const envVars = {
      POSTGRES_HOST: process.env.POSTGRES_HOST || "No definido",
      POSTGRES_PORT: process.env.POSTGRES_PORT || "No definido",
      POSTGRES_USER: process.env.POSTGRES_USER || "No definido",
      POSTGRES_DB: process.env.POSTGRES_DB || "No definido",
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD
        ? "Definido (oculto)"
        : "No definido",
    };

    // Intentar conexión
    let dbStatus = "No verificado";
    let dbError = null;

    try {
      const client = await pool.connect();
      await client.query("SELECT NOW() as time");
      dbStatus = "Conectado";
      client.release();
    } catch (error) {
      dbStatus = "Error de conexión";
      dbError = error instanceof Error ? error.message : "Error desconocido";
    }

    return NextResponse.json({
      status: "ok",
      environment: process.env.NODE_ENV,
      envVars,
      database: {
        status: dbStatus,
        error: dbError,
      },
    });
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Error en diagnóstico",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
