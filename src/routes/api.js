import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- 1. UTILIDAD DE LECTURA (ROBUSTA) ---
// Esta función lee cualquier archivo JSON de tu carpeta 'database'
const leerDB = (archivo, callback) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    
    // Si el archivo no existe, devolvemos una lista vacía para evitar errores
    if (!fs.existsSync(dbPath)) return callback([]);
    
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error leyendo ${archivo}:`, err);
            return callback([]);
        }
        try {
            const json = JSON.parse(data);
            callback(json);
        } catch (e) {
            console.error(`Error parseando ${archivo}:`, e);
            callback([]); // Si el JSON está malformado, devuelve vacío
        }
    });
};

// --- 2. RUTAS DE PELÍCULAS Y SERIES ---

// A) Obtener TODO el catálogo (Para el Home)
router.get('/movies', (req, res) => {
    leerDB('movies.json', (data) => {
        res.json(data);
    });
});

// B) Obtener SOLO UN título por ID (Para el Reproductor)
router.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id); // Convertimos el ID de la URL a número
    
    leerDB('movies.json', (movies) => {
        const item = movies.find(m => m.id === id);
        
        if (item) {
            res.json(item); // Envía solo la película/serie solicitada
        } else {
            res.status(404).json({ error: "Contenido no encontrado" });
        }
    });
});

// --- 3. RUTAS DE SHORTS ---
router.get('/shorts', (req, res) => {
    leerDB('shorts.json', (data) => {
        res.json(data);
    });
});

// --- 4. RUTAS DE BÚSQUEDA ---
router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    
    if (!q) return res.json([]); // Si no escriben nada, devuelve vacío

    leerDB('movies.json', (movies) => {
        const results = movies.filter(m => {
            // Buscamos por título O por categoría
            // (m.title || '') evita que se rompa si falta el título
            const tituloMatch = (m.title || '').toLowerCase().includes(q);
            const catMatch = (m.cat || '').toLowerCase().includes(q);
            return tituloMatch || catMatch;
        });
        res.json(results);
    });
});

export default router;
