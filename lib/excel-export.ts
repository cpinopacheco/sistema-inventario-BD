/**
 * Utilidad para exportar datos a Excel
 */

// Función para exportar datos a Excel
export function exportToExcel(data: any[], fileName = "export") {
  // Verificar que hay datos para exportar
  if (!data || data.length === 0) {
    console.error("No hay datos para exportar");
    return;
  }

  try {
    // Importar dinámicamente la biblioteca xlsx
    import("xlsx").then((XLSX) => {
      // Crear una hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Crear un libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Añadir la hoja de trabajo al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

      // Generar el archivo Excel
      XLSX.writeFile(workbook, `${fileName}-${formatDate(new Date())}.xlsx`);
    });
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
  }
}

// Función auxiliar para formatear la fecha para el nombre del archivo
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}`;
}
