import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Función para leer JSON
const leerDB = (archivo, res) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error DB' })
        res.json(JSON.parse(data))
    })
}

// RUTAS
router.get('/movies', (req, res) => leerDB('movies.json', res))
router.get('/shorts', (req, res) => leerDB('shorts.json', res))

// BUSCADOR REAL
router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : ''
    const dbPath = path.join(__dirname, '../database', 'movies.json')
    
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if(err) return res.json([])
        const movies = JSON.parse(data)
        const results = movies.filter(m => 
            m.title.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q)
        )
        res.json(results)
    })
})

export default router
