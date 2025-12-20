import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// AQUÍ SE DEFINE LA VARIABLE 'app'
const app = express()

// 1. Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'src')))

// --- TRUCO DEL ICONO ---
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// 2. RUTA LOGIN (La raíz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 3. RUTA API / INICIO
// (Asegúrate de escribir 'app.get', no 'ap.get')
app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'inicio.html'))
})

// 4. Ruta About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// EXPORTAR: Asegúrate de que diga 'app'
export default app
