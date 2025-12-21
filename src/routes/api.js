import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==========================================
// RUTA: Obtener Shorts
// URL: http://localhost:3000/api/shorts
// ==========================================
router.get('/shorts', (req, res) => {
  // Asegúrate de que exista la carpeta database y el archivo shorts.json
  const dbPath = path.join(__dirname, '../database', 'shorts.json')
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error leyendo la base de datos de Shorts' })
    }
    try {
        const shorts = JSON.parse(data);
        res.json(shorts);
    } catch (parseError) {
        res.status(500).json({ error: 'Error procesando los datos JSON' })
    }
  })
})

// ... Tus otras rutas (/contenido, /ia) siguen aquí ...

export default router
