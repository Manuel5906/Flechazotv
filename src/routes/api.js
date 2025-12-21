import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Función auxiliar para leer archivos JSON y evitar repetir código
const leerDatabase = (archivo, res, callback) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error leyendo ${archivo}:`, err)
            return res.status(500).json({ error: 'Error interno del servidor' })
        }
        try {
            const json = JSON.parse(data)
            callback(json)
        } catch (parseError) {
            console.error(`Error parseando ${archivo}:`, parseError)
            res.status(500).json({ error: 'Error procesando datos' })
        }
    })
}

// ==========================================
// 1. RUTA: Obtener Shorts
// URL: http://localhost:3000/api/shorts
// ==========================================
router.get('/shorts', (req, res) => {
    leerDatabase('shorts.json', res, (data) => {
        res.json(data)
    })
})

// ==========================================
// 2. RUTA: Explorar (Todas las películas)
// URL: http://localhost:3000/api/movies
// ==========================================
router.get('/movies', (req, res) => {
    leerDatabase('movies.json', res, (data) => {
        // Opción: Si quieres filtrar por categoría (?cat=Acción)
        const categoria = req.query.cat
        if (categoria) {
            const filtradas = data.filter(m => m.cat.toLowerCase() === categoria.toLowerCase())
            return res.json(filtradas)
        }
        
        // Si no hay filtro, devuelve todo
        res.json(data)
    })
})

// ==========================================
// 3. RUTA: Búsqueda en Tiempo Real
// URL: http://localhost:3000/api/search?q=batman
// ==========================================
router.get('/search', (req, res) => {
    const query = req.query.q // Lo que escribe el usuario

    if (!query) {
        return res.json([]) // Si no escribe nada, devuelve array vacío
    }

    leerDatabase('movies.json', res, (data) => {
        const busqueda = query.toLowerCase()
        
        // Filtramos las películas que coincidan con el título
        const resultados = data.filter(item => 
            item.title.toLowerCase().includes(busqueda) || 
            item.desc.toLowerCase().includes(busqueda)
        )

        res.json(resultados)
    })
})

export default router
