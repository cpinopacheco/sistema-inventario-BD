import { Pool } from "pg"

// Verificar que las variables de entorno estén disponibles
const requiredEnvVars = ["POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Variable de entorno ${envVar} no está definida`)
  }
}

// Configuración de la conexión a la base de datos
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Verificar la conexión al inicializar
pool.on("connect", () => {
  console.log("Conexión a PostgreSQL establecida")
})

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL", err)
})

// Función para ejecutar consultas SQL
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta ejecutada", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error al ejecutar consulta:", error)
    throw error
  }
}

// Función para obtener un cliente de la pool
export async function getClient() {
  const client = await pool.connect()
  return client
}

// Exportar la pool para uso directo si es necesario
export { pool }

