import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==========================================
// RUTA GET: /api/contenido
// ==========================================
router.get('/contenido', (req, res) => {
  // OJO AQUÍ: Como este archivo está dentro de 'src/routes',
  // tenemos que subir un nivel (..) para llegar a 'src/database'
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

// ==========================================
// RUTA POST: /api/ia-predict (Tu futura IA)
// ==========================================
router.post('/ia-predict', (req, res) => {
    // Aquí pondremos la lógica de la IA más adelante
    const { entrada } = req.body;
    res.json({ mensaje: "IA recibió: " + entrada });
})

export default router
