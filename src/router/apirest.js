import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==========================================
// RUTA GET: /api/contenido
// ==========================================
router.get('/contenido', (req, res) => {
  // Buscamos el JSON en la carpeta database
  const dbPath = path.join(__dirname, '../database', 'contenido.json')
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error al leer la base de datos' })
    }
    const jsonData = JSON.parse(data)
    res.json(jsonData)
  })
})

export default router