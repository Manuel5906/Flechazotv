import express from 'express'
import path from 'path'
import fs from 'fs' 
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ==========================================
// 1. CONFIGURACIÓN (LO QUE FALTABA: Middleware)
// ==========================================
// Esto permite que tu servidor entienda datos JSON si decides enviar cosas en el futuro
app.use(express.json())
app.use(express.static(path.join(__dirname, 'src')))

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
// 3. RUTAS DE VISTAS (PÁGINAS)
// ==========================================

// Login (Raíz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// Home / Inicio (App Principal)
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'inicio.html')) // Asegúrate que tu archivo se llame inicio.html o index.html según corresponda
})

// About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, 'src', 'components', 'about.htm')) // Ajusté la ruta para que sea más segura dentro de src
})

// ---> [AGREGADO] RUTA PARA EL ADMIN <---
// Esta ruta sirve el archivo admin.html que te di antes
app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'admin.html'))
})


// ==========================================
// 4. ARRANCAR EL SERVIDOR (LO QUE FALTABA)
// ==========================================
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`)
  console.log(`📱 App: http://localhost:${PORT}/inicio`)
  console.log(`👮 Admin: http://localhost:${PORT}/admin-panel`)
})

export default app
