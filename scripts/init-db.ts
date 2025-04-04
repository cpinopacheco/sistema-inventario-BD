import { pool } from "../lib/db"

async function initializeDatabase() {
  const client = await pool.connect()

  try {
    console.log("Iniciando creación de tablas...")

    // Iniciar transacción
    await client.query("BEGIN")

    // Crear tabla de categorías
    await client.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL
      )
    `)
    console.log("✅ Tabla categorias creada")

    // Crear tabla de productos
    await client.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id VARCHAR(10) PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 0,
        descripcion TEXT,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE RESTRICT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Tabla productos creada")

    // Verificar si ya existen categorías
    const categoriasResult = await client.query("SELECT COUNT(*) FROM categorias")
    if (Number.parseInt(categoriasResult.rows[0].count) === 0) {
      // Insertar categorías iniciales
      await client.query(`
        INSERT INTO categorias (nombre) VALUES 
        ('Electrónica'), 
        ('Oficina')
      `)
      console.log("✅ Categorías iniciales insertadas")

      // Insertar productos iniciales
      await client.query(`
        INSERT INTO productos (id, nombre, cantidad, descripcion, categoria_id) VALUES
        ('P001', 'Auriculares Sony WH-1000XM4', 7, 'Auriculares con cancelación de ruido', 1),
        ('P002', 'Escritorio Ajustable', 3, 'Escritorio de altura ajustable', 2),
        ('P003', 'Impresora Multifuncional Canon', 12, 'Impresora, escáner y copiadora', 1),
        ('P004', 'Laptop HP Pavilion', 15, 'Laptop con procesador i7', 1),
        ('P005', 'Monitor LG UltraWide', 8, 'Monitor ultrawide de 34 pulgadas', 1),
        ('P006', 'Silla de Oficina Ergonómica', 5, 'Silla ergonómica con soporte lumbar', 2),
        ('P007', 'Tablet Samsung Galaxy Tab S7', 9, 'Tablet Android con pantalla de 11 pulgadas', 1),
        ('P008', 'Teclado Mecánico Logitech', 25, 'Teclado mecánico con retroiluminación RGB', 1)
      `)
      console.log("✅ Productos iniciales insertados")
    } else {
      console.log("ℹ️ Ya existen categorías en la base de datos, omitiendo datos iniciales")
    }

    // Confirmar transacción
    await client.query("COMMIT")
    console.log("✅ Base de datos inicializada correctamente")
  } catch (error) {
    // Revertir transacción en caso de error
    await client.query("ROLLBACK")
    console.error("❌ Error al inicializar la base de datos:", error)
    throw error
  } finally {
    // Liberar cliente
    client.release()
    // Cerrar pool de conexiones
    await pool.end()
  }
}

// Ejecutar la función
initializeDatabase()
  .then(() => {
    console.log("🚀 Script completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error en el script:", error)
    process.exit(1)
  })

