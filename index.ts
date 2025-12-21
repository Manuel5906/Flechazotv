import express from 'express'
import path from 'path'
import { Analytics } from "@vercel/analytics/next"
import { fileURLToPath } from 'url'

// IMPORTAMOS TUS RUTAS (Esto busca el archivo del paso 2)
import apirest from './src/routes/api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// CONFIGURACIÓN
app.use(express.json()) 
app.use(express.static(path.join(__dirname, 'src'))) 

app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// CONECTAR LAS RUTAS
// Aquí decimos: "Cualquier ruta en api.js empieza con /api"
app.use('/api', apirest) 

// RUTAS DE PÁGINAS (HTML)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src', 'index.html')))
app.get('/inicio', (req, res) => res.sendFile(path.join(__dirname, 'src', 'inicio.html'))) 
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'src', 'admin.html')))
app.get('/vip', (req, res) => res.sendFile(path.join(__dirname, 'src', 'vip.html')))

// ARRANCAR
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`)
})

export default app
