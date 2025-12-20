import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'src')))

// --- TRUCO PARA EL LOGO (FAVICON) ---
// Cuando el navegador busque el icono de la pestaña automáticamente,
// lo redirigimos a tu imagen URL.
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})
// -------------------------------------

// 2. Ruta Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 3. Ruta About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

export default app
