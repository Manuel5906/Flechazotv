import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Importaciones para YouTube (Scraping)
import ytpl from 'ytpl'
import yts from 'yt-search'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- 1. UTILIDAD DE LECTURA (ROBUSTA) ---
const leerDB = (archivo, callback) => {
    const dbPath = path.join(__dirname, '../database', archivo)
    
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
            callback([]); 
        }
    });
};

// --- 2. RUTAS DE PELÍCULAS Y SERIES (LOCAL) ---
router.get('/movies', (req, res) => {
    leerDB('movies.json', (data) => {
        res.json(data);
    });
});

router.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    leerDB('movies.json', (movies) => {
        const item = movies.find(m => m.id === id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: "Contenido no encontrado" });
        }
    });
});

// --- 3. RUTAS DE SHORTS (LOCAL) ---
router.get('/shorts', (req, res) => {
    leerDB('shorts.json', (data) => {
        res.json(data);
    });
});

// --- 4. RUTAS DE BÚSQUEDA (LOCAL) ---
router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    if (!q) return res.json([]); 

    leerDB('movies.json', (movies) => {
        const results = movies.filter(m => {
            const tituloMatch = (m.title || '').toLowerCase().includes(q);
            const catMatch = (m.cat || '').toLowerCase().includes(q);
            return tituloMatch || catMatch;
        });
        res.json(results);
    });
});

// --- 5. RUTAS DE YOUTUBE (SCRAPING / SIN API KEY) ---

// A) Obtener videos de un canal específico
// Uso: /youtube/channel?id=UCxxxxxxx
router.get('/youtube/channel', async (req, res) => {
    const channelId = req.query.id; 

    if (!channelId) {
        return res.status(400).json({ error: 'Falta el ID del canal (?id=UC...)' });
    }

    try {
        // Truco: Convertir ID de Canal (UC...) a ID de Playlist de Subidas (UU...)
        // Esto permite sacar todos los videos sin buscar, ahorrando recursos.
        const uploadsId = channelId.replace(/^UC/, 'UU');

        // limit: 20 trae los ultimos 20 videos. Puedes subirlo hasta 100.
        const playlist = await ytpl(uploadsId, { limit: 20 });

        const videos = playlist.items.map(item => ({
            id: item.id, // ID del video
            title: item.title,
            thumbnail: item.bestThumbnail.url,
            url: item.shortUrl,
            duration: item.duration,
            views: item.shortViewCount, // Vistas formateadas (ej: "1.2M")
            isShort: item.durationSec < 60 // Detección simple de Short
        }));

        res.json({
            channelName: playlist.author.name,
            channelUrl: playlist.author.url,
            videos: videos
        });

    } catch (error) {
        console.error("Error YouTube Channel:", error.message);
        res.status(500).json({ error: 'No se pudo obtener información del canal. Verifica el ID.' });
    }
});

// B) Buscar videos en YouTube Global
// Uso: /youtube/search?q=Free+Fire
router.get('/youtube/search', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Falta termino de búsqueda (?q=...)' });
    }

    try {
        const r = await yts(query);
        
        // Filtramos para devolver solo videos (quitamos canales o listas)
        const videos = r.videos.slice(0, 15).map(v => ({
            title: v.title,
            videoId: v.videoId,
            url: v.url,
            thumbnail: v.thumbnail,
            timestamp: v.timestamp,
            views: v.views,
            author: v.author.name
        }));

        res.json(videos);

    } catch (error) {
        console.error("Error YouTube Search:", error.message);
        res.status(500).json({ error: 'Error al buscar en YouTube' });
    }
});

export default router;
