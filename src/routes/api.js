import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- UTILIDADES ---
const leerDB = (archivo, callback) => {
    // Asegúrate de que la carpeta 'database' exista
    const dbPath = path.join(__dirname, '../database', archivo)
    if (!fs.existsSync(dbPath)) return callback([]);
    
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return callback([]);
        try {
            const json = JSON.parse(data);
            callback(json);
        } catch (e) {
            callback([]); // Si el JSON está corrupto, devuelve array vacío
        }
    });
};

const escribirDB = (archivo, data) => {
    const dbPath = path.join(__dirname, '../database', archivo);
    // writeFileSync es más seguro para evitar corrupción simple
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// --- RUTAS DE CONTENIDO (Películas y Series) ---

// 1. Obtener TODO el catálogo (Para el Home)
router.get('/movies', (req, res) => {
    leerDB('movies.json', (data) => res.json(data));
});

// 2. NUEVO: Obtener SOLO UN título por ID (Para el Reproductor)
router.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id); // Convertir texto a número
    leerDB('movies.json', (movies) => {
        const item = movies.find(m => m.id === id);
        
        if (item) {
            res.json(item); // Devuelve la película o serie específica
        } else {
            res.status(404).json({ error: "Contenido no encontrado" });
        }
    });
});

router.get('/shorts', (req, res) => {
    leerDB('shorts.json', (data) => res.json(data));
});

// 3. Búsqueda optimizada
router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    
    if (!q) return res.json([]); // Si no hay búsqueda, devuelve vacío

    leerDB('movies.json', (movies) => {
        const results = movies.filter(m => {
            const tituloMatch = m.title && m.title.toLowerCase().includes(q);
            const catMatch = m.cat && m.cat.toLowerCase().includes(q);
            return tituloMatch || catMatch;
        });
        res.json(results);
    });
});

// --- RUTAS DE NOTIFICACIONES ---
router.get('/notifications', (req, res) => {
    leerDB('notifications.json', (data) => res.json(data));
});

router.post('/notifications', (req, res) => {
    const { title, msg, type } = req.body;
    
    if (!title || !msg) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    leerDB('notifications.json', (db) => {
        const notifs = db || [];
        // Agregamos fecha automática
        const nuevaNotificacion = { 
            id: Date.now(), 
            title, 
            msg, 
            type: type || 'info', 
            date: new Date().toLocaleString() 
        };
        
        notifs.unshift(nuevaNotificacion); // Pone la más nueva al principio
        escribirDB('notifications.json', notifs);
        res.json({ success: true, data: nuevaNotificacion });
    });
});

export default router;
