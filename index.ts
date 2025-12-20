import express from 'express'
import path from 'path'
import fs from 'fs' // Importamos el sistema de archivos
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'src')))

// --- TRUCO DEL ICONO ---
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// ==========================================
// 2. API CONECTADA A ARCHIVO JSON
// ==========================================
app.get('/api/contenido', (req, res) => {
  // Ruta al archivo JSON
  const dbPath = path.join(__dirname, 'database', 'contenido.json')
  
  // Leemos el archivo
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Error al leer la base de datos' })
    }
    // Convertimos el texto a JSON y lo enviamos
    const jsonData = JSON.parse(data)
    res.json(jsonData)
  })
})
// ==========================================

// 3. RUTA LOGIN
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 4. RUTA HOME / INICIO
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'inicio.html'))
})

// 5. Ruta About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

export default app
