import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Intentar ejecutar una consulta simple
    const result = await query("SELECT NOW() as current_time")

    return NextResponse.json({
      status: "success",
      message: "Conexión a la base de datos establecida correctamente",
      serverTime: result.rows[0].current_time,
    })
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con la base de datos",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

