import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- UTILIDADES ---
const leerDB = (archivo, callback) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    if (!fs.existsSync(dbPath)) return callback([]);
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return callback([]);
        callback(JSON.parse(data));
    });
};

const escribirDB = (archivo, data) => {
    const dbPath = path.join(__dirname, '../database', archivo);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// --- RUTAS DE CONTENIDO ---
router.get('/movies', (req, res) => {
    leerDB('movies.json', (data) => res.json(data));
});

router.get('/shorts', (req, res) => {
    leerDB('shorts.json', (data) => res.json(data));
});

router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    leerDB('movies.json', (movies) => {
        const results = movies.filter(m => 
            m.title.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q)
        );
        res.json(results);
    });
});

// --- RUTAS DE NOTIFICACIONES ---
router.get('/notifications', (req, res) => {
    leerDB('notifications.json', (data) => res.json(data));
});

router.post('/notifications', (req, res) => {
    const { title, msg, type } = req.body;
    leerDB('notifications.json', (db) => {
        const notifs = db || [];
        notifs.unshift({ id: Date.now(), title, msg, type, date: new Date().toLocaleString() });
        escribirDB('notifications.json', notifs);
        res.json({ success: true });
    });
});

export default router;
