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

// --- 5. RUTAS DE YOUTUBE (CORREGIDO Y ROBUSTO) ---

// A) Obtener videos de un canal (Acepta URL completa, Handle o ID)
// Uso: /youtube/channel?url=https://youtube.com/@primetvoficial
router.get('/youtube/channel', async (req, res) => {
    let inputUrl = req.query.url || req.query.id;

    if (!inputUrl) {
        return res.status(400).json({ error: 'Falta el link del canal (?url=...)' });
    }

    try {
        let channelId = '';

        // PASO 1: Obtener el ID Técnico (UC...)
        // Si el input NO parece un ID técnico (no empieza con UC), hay que buscarlo.
        if (!inputUrl.startsWith('UC')) {
            // Limpiamos la URL para quedarnos con el nombre o handle
            const cleanQuery = inputUrl.includes('youtube.com') 
                ? inputUrl.split('?')[0].split('/').pop() // Intenta sacar el handle (ej: @primetvoficial)
                : inputUrl;

            console.log(`Buscando ID técnico para: ${cleanQuery}`);
            
            const searchResult = await yts(cleanQuery);
            
            // Estrategia A: Intentar sacar el ID del resultado tipo 'Channel'
            const channelObj = searchResult.channels && searchResult.channels.length > 0 
                ? searchResult.channels[0] 
                : null;

            if (channelObj && channelObj.url && channelObj.url.includes('/channel/UC')) {
                channelId = channelObj.url.split('/channel/')[1];
            } 
            
            // Estrategia B (Respaldo): Si A falla (o devuelve un handle), buscamos el autor del primer VIDEO
            // Esto es mucho más seguro porque los videos siempre tienen el ID real del autor.
            if (!channelId) {
                console.log("Buscando ID a través de los videos del canal...");
                const videoObj = searchResult.videos.length > 0 ? searchResult.videos[0] : null;
                
                if (videoObj && videoObj.author && videoObj.author.url) {
                    // La url del autor suele ser ".../channel/UCxxxxxxx"
                    const parts = videoObj.author.url.split('/channel/');
                    if (parts.length > 1) {
                        channelId = parts[1];
                    }
                }
            }

            if (!channelId) {
                return res.status(404).json({ error: 'No se pudo encontrar el ID técnico. Intenta pegar el link de un video del canal en lugar del canal.' });
            }

        } else {
            // Si el usuario ya dio un ID tipo UC...
            channelId = inputUrl;
        }

        console.log(`ID Técnico confirmado: ${channelId}`);

        // PASO 2: Convertir ID de Canal (UC...) a Playlist de Subidas (UU...)
        const uploadsId = channelId.replace(/^UC/, 'UU');

        // PASO 3: Obtener los videos
        const playlist = await ytpl(uploadsId, { limit: 20 });

        // PASO 4: Formatear
        const videos = playlist.items.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.bestThumbnail.url,
            url: item.shortUrl,
            duration: item.duration,
            views: item.shortViewCount,
            isShort: item.durationSec < 60
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
        res.status(500).json({ 
            error: 'Error interno obteniendo videos.',
            details: error.message 
        });
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
