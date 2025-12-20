import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'src')))

// --- LOGOTIPO EN LA PESTAÑA (Favicon) ---
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// 2. Ruta Principal (Inicio)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 3. NUEVO APARTADO (Sub-dominio/Sección)
// Esto crea la dirección: tuweb.com/vip
app.get('/vip', (req, res) => {
  // Asegúrate de crear el archivo 'vip.html' dentro de la carpeta 'src'
  res.sendFile(path.join(__dirname, 'src', 'vip.html'))
})

// 4. Ruta About (Mantenida)
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

export default app

