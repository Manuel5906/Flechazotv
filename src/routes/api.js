import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ytpl from 'ytpl'
import yts from 'yt-search'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- 1. UTILIDAD DE LECTURA ---
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
            callback([]); 
        }
    });
};

// --- 2. RUTAS LOCALES (MOVIES/SHORTS) ---
router.get('/movies', (req, res) => leerDB('movies.json', (data) => res.json(data)));

router.get('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id);
    leerDB('movies.json', (movies) => {
        const item = movies.find(m => m.id === id);
        item ? res.json(item) : res.status(404).json({ error: "No encontrado" });
    });
});

router.get('/shorts', (req, res) => leerDB('shorts.json', (data) => res.json(data)));

router.get('/search', (req, res) => {
    const q = req.query.q ? req.query.q.toLowerCase() : '';
    if (!q) return res.json([]); 
    leerDB('movies.json', (movies) => {
        const results = movies.filter(m => (m.title || '').toLowerCase().includes(q) || (m.cat || '').toLowerCase().includes(q));
        res.json(results);
    });
});

// --- 3. RUTAS DE YOUTUBE ---

// A) Obtener videos de un CANAL (Handle, URL o ID)
router.get('/youtube/channel', async (req, res) => {
    let inputUrl = req.query.url || req.query.id;
    if (!inputUrl) return res.status(400).json({ error: 'Falta link' });

    try {
        let channelId = '';
        if (!inputUrl.startsWith('UC')) {
            const cleanQuery = inputUrl.includes('youtube.com') ? inputUrl.split('?')[0].split('/').pop() : inputUrl;
            const searchResult = await yts(cleanQuery);
            
            // Estrategia 1: Buscar canal
            const channelObj = searchResult.channels && searchResult.channels.length > 0 ? searchResult.channels[0] : null;
            if (channelObj && channelObj.url && channelObj.url.includes('/channel/UC')) {
                channelId = channelObj.url.split('/channel/')[1];
            } 
            // Estrategia 2: Buscar video del autor
            if (!channelId) {
                const videoObj = searchResult.videos.length > 0 ? searchResult.videos[0] : null;
                if (videoObj && videoObj.author && videoObj.author.url) {
                    const parts = videoObj.author.url.split('/channel/');
                    if (parts.length > 1) channelId = parts[1];
                }
            }
            if (!channelId) return res.status(404).json({ error: 'No se encontró ID del canal' });
        } else {
            channelId = inputUrl;
        }

        const uploadsId = channelId.replace(/^UC/, 'UU');
        const playlist = await ytpl(uploadsId, { limit: 20 });
        
        res.json({
            channel_name: playlist.author.name,
            channel_url: playlist.author.url,
            channel_avatar: playlist.author.bestAvatar.url,
            videos: playlist.items.map(item => ({
                id: item.id,
                title: item.title,
                thumbnail: item.bestThumbnail.url,
                url: item.shortUrl,
                duration: item.duration,
                views: item.shortViewCount,
                isShort: item.durationSec < 60
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// B) BUSCAR videos (Global)
router.get('/youtube/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Falta el término de búsqueda' });

    try {
        // Realizamos la búsqueda general
        const r = await yts(query);

        if (!r.videos || r.videos.length === 0) {
            return res.status(404).json({ error: 'No se encontraron resultados' });
        }

        // 1. Intentamos obtener info del autor/canal específicamente
        // Buscamos en los resultados de tipo 'accounts' o 'channels' que a veces trae yts
        const authorInfo = r.accounts ? r.accounts[0] : (r.channels ? r.channels[0] : null);

        // 2. Mapeamos los videos
        const videos = r.videos.slice(0, 15).map(v => ({
            title: v.title,
            videoId: v.videoId,
            url: v.url,
            thumbnail: v.thumbnail,
            timestamp: v.timestamp,
            views: v.views,
            author: {
                name: v.author.name,
                url: v.author.url,
                // Intentamos sacar la imagen del autor. 
                // Si yts no la da directa, usamos un placeholder o la del canal si existe
                image: v.author.image || (authorInfo ? authorInfo.image : '')
            }
        }));

        // Respuesta enriquecida
        res.json({
            bestMatchAuthor: authorInfo ? {
                name: authorInfo.name,
                image: authorInfo.image,
                url: authorInfo.url,
                subscribers: authorInfo.subCountLabel
            } : null,
            videos: videos
        });

    } catch (error) {
        console.error('Error en YouTube Search:', error);
        res.status(500).json({ error: 'Error al realizar la búsqueda' });
    }
});

// C) INFO DE UN SOLO VIDEO (Con Poster y Banner)
router.get('/youtube/video', async (req, res) => {
    const inputUrl = req.query.url;
    if (!inputUrl) return res.status(400).json({ error: 'Falta URL' });

    try {
        // 1. Extraer ID
        const videoIdMatch = inputUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/);
        const videoId = videoIdMatch ? videoIdMatch[1] : inputUrl;

        // 2. Buscar datos
        const video = await yts({ videoId: videoId });

        // URL de Alta Calidad (Max Res)
        const highResImage = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        // URL de Calidad Media (HQ - siempre existe si falla la Max)
        const midResImage = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        // 3. Respuesta JSON ajustada
        res.json({
            id: 0, 
            tipo: "pelicula",
            title: video.title,
            desc: video.description, 
            cat: "Drama", 
            imagenes: {
                poster: highResImage, 
                banner: highResImage
            },
            url: video.url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Video no encontrado' });
    }
});


export default router;
