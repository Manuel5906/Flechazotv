import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// 1. Configurar la carpeta 'src' como estática
// Esto permite que el index.html cargue su CSS e imágenes correctamente.
// NOTA: Si este archivo JS está en una subcarpeta (ej: /api), cambia la ruta a: path.join(__dirname, '..', 'src')
app.use(express.static(path.join(__dirname, 'src')))

// 2. Ruta Home - Servir index.html desde la carpeta src
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

// 3. Ruta About (Mantenida de tu código original)
app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

export default app
