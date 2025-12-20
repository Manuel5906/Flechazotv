import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==========================================
// 1. RUTA: Ver Contenido (JSON)
// URL: http://localhost:3000/get/contenido
// ==========================================
router.get('/contenido', (req, res) => {
  const dbPath = path.join(__dirname, '../database', 'contenido.json')
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error leyendo DB' })
    }
    res.json(JSON.parse(data))
  })
})

// ==========================================
// 2. RUTA: Tu IA en versión GET
// URL: http://localhost:3000/get/ia?dato=5
// ==========================================
router.get('/ia', (req, res) => {
    // En GET, los datos no vienen en 'body', vienen en 'query'
    // Ejemplo de uso: .../get/ia?dato=10
    const { dato } = req.query;

    if (!dato) {
        return res.status(400).json({ 
            error: "Falta el parámetro. Usa: /get/ia?dato=TU_NUMERO" 
        })
    }

    // --- LÓGICA DE TU IA (Simulada) ---
    // Digamos que tu red neuronal multiplica por 2.5
    const resultado = parseFloat(dato) * 2.5;

    res.json({
        modo: "GET",
        entrada: dato,
        prediccion_ia: resultado,
        mensaje: "Cálculo realizado exitosamente"
    })
})

export default router
