import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. Configuración de archivos estáticos (CSS, Imágenes, JS)
app.use(express.static(path.join(__dirname, 'src')))

// --- TRUCO DEL ICONO ---
app.get('/favicon.ico', (req, res) => {
  res.redirect('https://i.ibb.co/v6GdVWRs/IMG-0113.png')
})

// 2. RUTA LOGIN (La raíz)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 3. RUTA API / INICIO (Aquí está la magia)
// El usuario entrará a "tusitio.com/inicio" y el servidor le dará el HTML
// sin mostrar ".html" en la barra de direcciones.
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'home.html'))
})

// 4. Ruta About
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

export default ap
