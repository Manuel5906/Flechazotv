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

// --- 5. RUTAS DE YOUTUBE (SCRAPING AVANZADO) ---

// A) Obtener videos de un canal (Acepta URL completa o ID)
// Uso: /youtube/channel?url=https://youtube.com/@primetvoficial
router.get('/youtube/channel', async (req, res) => {
    // Aceptamos 'url' o 'id' por compatibilidad
    let inputUrl = req.query.url || req.query.id;

    if (!inputUrl) {
        return res.status(400).json({ error: 'Falta el link del canal (?url=...)' });
    }

    try {
        let channelId = '';

        // PASO 1: Detectar si es un Link/Handle (@) o un ID directo
        if (inputUrl.includes('youtube.com') || inputUrl.includes('@')) {
            // Limpiamos la URL para buscar el nombre exacto
            const cleanQuery = inputUrl.split('?')[0]; 
            console.log(`Buscando ID para: ${cleanQuery}`);
            
            // Buscamos el canal usando yt-search
            const searchResult = await yts(cleanQuery);
            
            // Filtramos para encontrar el objeto tipo 'channel'
            const channel = searchResult.channels && searchResult.channels.length > 0 
                ? searchResult.channels[0] 
                : searchResult.all.find(item => item.type === 'channel');

            if (!channel) {
                return res.status(404).json({ error: 'No se encontró el canal con ese enlace.' });
            }
            
            // Extraemos el ID de la url que devuelve la búsqueda
            // channel.url suele ser ".../channel/UCxxxx"
            channelId = channel.url.split('/').pop(); 
        } else {
            // Si ya es un ID (ej: UC123...)
            channelId = inputUrl;
        }

        // PASO 2: Convertir ID de Canal (UC...) a Playlist de Subidas (UU...)
        // Esto es necesario para usar ytpl y sacar la lista de videos
        const uploadsId = channelId.startsWith('UC') ? channelId.replace('UC', 'UU') : channelId;

        // PASO 3: Obtener los videos
        // limit: 20 trae los últimos 20. Puedes subirlo hasta 100 si quieres más.
        const playlist = await ytpl(uploadsId, { limit: 20 });

        // PASO 4: Formatear los datos
        const videos = playlist.items.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.bestThumbnail.url, // La mejor calidad disponible
            url: item.shortUrl,
            duration: item.duration,
            views: item.shortViewCount,
            isShort: item.durationSec < 60 // True si dura menos de 1 min
        }));

        res.json({
            channel_name: playlist.author.name,
            channel_url: playlist.author.url,
            channel_avatar: playlist.author.bestAvatar.url,
            total_videos_found: playlist.estimatedItemCount,
            videos: videos
        });

    } catch (error) {
        console.error("Error API YouTube:", error.message);
        res.status(500).json({ error: 'Error obteniendo videos. Verifica el link o intenta más tarde.' });
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
        
        // Filtramos para devolver solo videos
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
