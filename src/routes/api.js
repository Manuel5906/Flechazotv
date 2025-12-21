import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- UTILIDADES ---

// Función para leer JSON de forma asíncrona (Mejor para rendimiento)
const leerDB = (archivo, callback) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error al leer ${archivo}:`, err);
            return callback(null);
        }
        callback(JSON.parse(data));
    });
};

// Función para escribir en JSON
const escribirDB = (archivo, data) => {
    const dbPath = path.join(__dirname, '../database', archivo);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// --- RUTAS DE CONTENIDO ---

// Obtener todas las películas (Inicio y Explorar)
router.get('/movies', (req, res) => {
    leerDB('movies.json', (data) => {
        if (!data) return res.status(500).json({ error: 'Error al cargar películas' });
        res.json(data);
    });
});

// Obtener los Shorts (TikTok Style)
router.get('/shorts', (req, res) => {
    leerDB('shorts.json', (data) => {
        if (!data) return res.status(500).json({ error: 'Error al cargar shorts' });
        res.json(data);
    });
});

// Buscador en Tiempo Real
router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    leerDB('movies.json', (movies) => {
        if (!movies) return res.json([]);
        const results = movies.filter(m => 
            m.title.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q)
        );
        res.json(results);
    });
});

// --- RUTAS DE NOTIFICACIONES ---

// Obtener notificaciones para la campana de la App
router.get('/notifications', (req, res) => {
    leerDB('notifications.json', (data) => {
        if (!data) return res.json([]);
        res.json(data);
    });
});

// Recibir notificación desde el Panel Admin (POST)
router.post('/notifications', (req, res) => {
    const { title, msg, type } = req.body;
    
    leerDB('notifications.json', (db) => {
        const notifs = db || [];
        const nuevaNotificacion = {
            id: Date.now(),
            title: title || "Aviso",
            msg: msg || "",
            type: type || "info",
            date: new Date().toLocaleString()
        };
        
        notifs.unshift(nuevaNotificacion); // Agregar al principio
        escribirDB('notifications.json', notifs);
        
        res.json({ success: true, message: "Notificación enviada" });
    });
});

export default router;
