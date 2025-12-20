import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. CONFIGURACIÓN
app.use(express.json()) // Para entender JSON si fuera necesario
app.use(express.static(path.join(__dirname, 'src'))) // Carpeta pública

// --- TRUCO DEL ICONO ---
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// ==========================================
// 2. API CONECTADA A ARCHIVO JSON
// ==========================================
app.get('/api/contenido', (req, res) => {
  const dbPath = path.join(__dirname, 'src/database', 'contenido.json')
  
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
// 3. RUTAS (PÁGINAS)
// ==========================================

// RUTA 1: Login (Raíz) -> index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// RUTA 2: App Principal (Usuario) -> inicio.html
// Aquí es donde está el reproductor y los pagos QR
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'inicio.html')) 
})

// RUTA 3: Panel Admin -> admin.html (¡ESTO FALTABA!)
// Aquí entras tú para aprobar los pagos
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'admin.html'))
})

// RUTA 4: About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, 'src', 'components', 'about.htm'))
})

// ==========================================
// 4. ARRANCAR SERVIDOR (¡ESTO FALTABA!)
// ==========================================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo!`)
  console.log(`📱 App Usuarios: http://localhost:${PORT}/inicio`)
  console.log(`👮 Panel Admin:  http://localhost:${PORT}/admin`)
})

export default app
