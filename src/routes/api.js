<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Flechazo TV - Ultimate</title>
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    
    <style>
        /* --- 1. TEMAS --- */
        :root { 
            --bg: #0f0f1a; --card: #1e1e2d; --primary: #ff4b4b; 
            --gradient: linear-gradient(135deg, #ff4b4b, #a24bfa);
            --safe-top: env(safe-area-inset-top);
            --safe-bottom: env(safe-area-inset-bottom);
        }
        .theme-fire { --bg: #0a0000; --card: #1a0505; --primary: #ff3300; --gradient: linear-gradient(135deg, #ff3300, #ff9900); }
        .theme-emerald { --bg: #05100a; --card: #0d1e15; --primary: #00ff88; --gradient: linear-gradient(135deg, #00ff88, #00ccff); }
        .theme-ocean { --bg: #050a1a; --card: #0d152d; --primary: #0088ff; --gradient: linear-gradient(135deg, #0088ff, #00ffff); }

        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; outline: none; }
        body { margin: 0; font-family: -apple-system, sans-serif; background: var(--bg); color: #fff; padding-bottom: calc(90px + var(--safe-bottom)); transition: 0.4s; overflow-x: hidden; }

        /* --- 2. NOTIFICACIONES --- */
        .notif-badge { position: absolute; top: -5px; right: -5px; background: var(--primary); width: 16px; height: 16px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg); }
        .notif-panel { position: fixed; top: 75px; right: 20px; width: 280px; max-height: 350px; background: var(--card); border-radius: 20px; border: 1px solid #333; z-index: 2000; display: none; overflow-y: auto; box-shadow: 0 10px 30px #000; }
        .notif-item { padding: 15px; border-bottom: 1px solid #333; font-size: 13px; }

        /* --- 3. REPRODUCTOR --- */
        .player-fs { position: fixed; inset: 0; background: #000; z-index: 6000; display: none; align-items: center; justify-content: center; }
        .close-player { position: absolute; top: calc(25px + var(--safe-top)); left: 20px; font-size: 28px; z-index: 6001; }

        /* --- 4. MODAL INFO --- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 3000; display: none; align-items: flex-end; backdrop-filter: blur(8px); }
        .modal-sheet { width: 100%; max-width: 500px; background: var(--card); border-radius: 30px 30px 0 0; animation: slideUp 0.4s ease; margin: 0 auto; overflow: hidden; }
        .modal-hero { width: 100%; height: 230px; position: relative; }
        .modal-hero img { width: 100%; height: 100%; object-fit: cover; }

        /* --- 5. UI PRINCIPAL --- */
        .header { padding: calc(15px + var(--safe-top)) 25px 15px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: var(--bg); z-index: 1000; }
        .logo { font-size: 24px; font-weight: 900; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .poster { min-width: 120px; height: 180px; border-radius: 12px; object-fit: cover; background: var(--card); margin-right: 15px; cursor: pointer; transition: 0.2s; }
        .horizontal-scroll { display: flex; overflow-x: auto; padding: 0 25px 20px; scrollbar-width: none; }
        .section-title { padding: 20px 25px 10px; font-size: 18px; font-weight: bold; }

        /* --- 6. SHORTS --- */
        .shorts-container { height: 100vh; scroll-snap-type: y mandatory; overflow-y: scroll; background: #000; position: fixed; inset: 0; z-index: 500; padding-bottom: calc(70px + var(--safe-bottom)); }
        .short-v { height: 100%; scroll-snap-align: start; position: relative; display: flex; align-items: center; }
        .short-v video { width: 100%; height: 100%; object-fit: cover; }
        .short-ui { position: absolute; bottom: 100px; left: 15px; right: 15px; display: flex; justify-content: space-between; align-items: flex-end; z-index: 10; text-shadow: 0 2px 4px #000; }

        /* --- 7. NAV --- */
        .nav { position: fixed; bottom: 0; width: 100%; background: rgba(15,15,26,0.98); display: flex; justify-content: space-around; padding: 10px 0 calc(12px + var(--safe-bottom)); z-index: 2000; border-top: 1px solid #333; }
        .nav-btn { color: #666; font-size: 11px; text-align: center; flex: 1; cursor: pointer; }
        .nav-btn.active { color: var(--primary); }
        .nav-btn i { font-size: 22px; display: block; margin-bottom: 4px; }

        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .hidden { display: none !important; }
    </style>
</head>
<body>

    <div id="player-overlay" class="player-fs">
        <i class="fa-solid fa-chevron-left close-player" onclick="stopVideo()"></i>
        <video id="main-video" controls playsinline webkit-playsinline style="width: 100%;"></video>
    </div>

    <div id="info-modal" class="modal-overlay" onclick="if(event.target.id==='info-modal') closeInfo()">
        <div class="modal-sheet" id="info-content"></div>
    </div>

    <div id="app">
        <header id="main-header" class="header">
            <h2 class="logo">Flechazo TV</h2>
            <div style="position:relative;" onclick="toggleNotifs()">
                <i class="fa-solid fa-bell" style="font-size:24px;"></i>
                <span id="notif-dot" class="notif-badge hidden">!</span>
                <div id="notif-panel" class="notif-panel"></div>
            </div>
        </header>

        <div id="screen-home" class="screen">
            <div class="section-title">🔥 Tendencias Semanales</div>
            <div class="horizontal-scroll" id="trends-list"></div>
            <div class="section-title">⚔️ Acción y Free Fire</div>
            <div class="horizontal-scroll" id="action-list"></div>
        </div>

        <div id="screen-explore" class="screen hidden">
            <div style="padding: calc(15px + var(--safe-top)) 20px;">
                <div style="background:var(--card); padding:15px; border-radius:15px; display:flex; gap:10px; border:1px solid #333;">
                    <i class="fa-solid fa-magnifying-glass" style="color:var(--primary);"></i>
                    <input type="text" id="search-inp" placeholder="Buscar drama, acción..." style="background:transparent; border:none; color:white; width:100%;">
                </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; padding:0 20px;" id="explore-grid"></div>
        </div>

        <div id="screen-shorts" class="screen hidden">
            <div id="shorts-wrapper" class="shorts-container"></div>
        </div>

        <div id="screen-profile" class="screen hidden">
            <div style="padding: 40px 20px; text-align: center;">
                <img src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg" style="width:110px; border-radius:50%; border:3px solid var(--primary);">
                <h2 id="p-name">Gamer Pro</h2>
                <div style="background:var(--card); border-radius:20px; padding:10px; margin-top:20px; text-align: left;">
                    <div style="padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                        <span>Tema de App</span>
                        <select onchange="setTheme(this.value)" style="background:none; border:none; color:var(--primary); font-weight:bold;">
                            <option value="default">Noche</option>
                            <option value="fire">Fuego</option>
                            <option value="emerald">Esmeralda</option>
                            <option value="ocean">Océano</option>
                        </select>
                    </div>
                </div>
                <button onclick="location.reload()" style="width:100%; padding:15px; border-radius:15px; margin-top:20px; background:rgba(255,0,0,0.1); color:red; border:none; font-weight:bold;">CERRAR SESIÓN</button>
            </div>
        </div>

        <nav class="nav">
            <div class="nav-btn active" onclick="switchTab('home', this)"><i class="fa-solid fa-house"></i>Inicio</div>
            <div class="nav-btn" onclick="switchTab('explore', this)"><i class="fa-solid fa-compass"></i>Explorar</div>
            <div class="nav-btn" onclick="switchTab('shorts', this)"><i class="fa-solid fa-bolt"></i>Shorts</div>
            <div class="nav-btn" onclick="switchTab('profile', this)"><i class="fa-solid fa-user-gear"></i>Perfil</div>
        </nav>
    </div>

    <script>
        let moviesData = [];
        const API_URL = 'http://localhost:3000/api';

        // --- 1. CARGA DE APIS ---
        async function initApp() {
            try {
                const [m, s, n] = await Promise.all([
                    fetch(`${API_URL}/movies`).then(r => r.json()),
                    fetch(`${API_URL}/shorts`).then(r => r.json()),
                    fetch(`${API_URL}/notifications`).then(r => r.json())
                ]);
                moviesData = m;
                renderMovies(m);
                renderShorts(s);
                renderNotifs(n);
            } catch(e) { console.error("API Error: Verifica que el servidor puerto 3000 esté activo."); }
        }

        function renderMovies(data) {
            const h = document.getElementById('trends-list');
            const a = document.getElementById('action-list');
            const e = document.getElementById('explore-grid');
            h.innerHTML = ''; a.innerHTML = ''; e.innerHTML = '';
            data.forEach(m => {
                const img = `<img class="poster" src="${m.img}" onclick="openInfo(${m.id})">`;
                h.innerHTML += img;
                e.innerHTML += img;
                if(m.cat === 'Acción' || m.cat === 'Free Fire') a.innerHTML += img;
            });
        }

        // --- 2. MODAL Y PLAYER ---
        window.openInfo = id => {
            const m = moviesData.find(x => x.id === id);
            document.getElementById('info-content').innerHTML = `
                <div class="modal-hero"><img src="${m.img}"></div>
                <div style="padding:25px;">
                    <h2 style="margin:0;">${m.title}</h2>
                    <p style="color:var(--primary); font-weight:bold;">${m.cat} • 2025</p>
                    <p style="color:#aaa; font-size:14px; margin-bottom:20px;">${m.desc || 'Disfruta de lo mejor de Flechazo TV.'}</p>
                    <button onclick="playVideo('${m.videoUrl || m.video}')" style="width:100%; padding:15px; background:#fff; color:#000; border:none; border-radius:12px; font-weight:bold;">VER AHORA</button>
                </div>`;
            document.getElementById('info-modal').style.display = 'flex';
        };

        window.playVideo = url => {
            const v = document.getElementById('main-video');
            v.src = url;
            document.getElementById('player-overlay').style.display = 'flex';
            v.play();
            closeInfo();
        };

        window.stopVideo = () => { document.getElementById('main-video').pause(); document.getElementById('player-overlay').style.display = 'none'; };
        window.closeInfo = () => document.getElementById('info-modal').style.display = 'none';

        // --- 3. SHORTS TIKTOK ---
        function renderShorts(data) {
            const wrap = document.getElementById('shorts-wrapper');
            wrap.innerHTML = data.map(s => `
                <div class="short-v">
                    <video src="${s.videoUrl}" loop playsinline webkit-playsinline></video>
                    <div class="short-ui"><b>@${s.user}</b></div>
                </div>`).join('');
            const obs = new IntersectionObserver(ents => ents.forEach(e => {
                const v = e.target.querySelector('video');
                if (e.isIntersecting) v.play().catch(()=>{}); else v.pause();
            }), { threshold: 0.8 });
            document.querySelectorAll('.short-v').forEach(sv => obs.observe(sv));
        }

        // --- 4. BUSCADOR Y NOTIF ---
        document.getElementById('search-inp').addEventListener('input', async e => {
            const res = await fetch(`${API_URL}/search?q=${e.target.value}`);
            renderMovies(await res.json());
        });

        function renderNotifs(data) {
            if(data.length > 0) {
                document.getElementById('notif-dot').classList.remove('hidden');
                document.getElementById('notif-panel').innerHTML = data.map(n => `<div class="notif-item"><b>${n.title}</b><br>${n.msg}</div>`).join('');
            }
        }
        window.toggleNotifs = () => {
            const p = document.getElementById('notif-panel');
            p.style.display = p.style.display === 'block' ? 'none' : 'block';
            document.getElementById('notif-dot').classList.add('hidden');
        };

        // --- 5. NAVEGACIÓN ---
        window.switchTab = (tab, el) => {
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            document.getElementById('screen-'+tab).classList.remove('hidden');
            document.getElementById('main-header').style.display = (tab === 'home') ? 'flex' : 'none';
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
            if(tab !== 'shorts') document.querySelectorAll('video').forEach(v => v.pause());
        }

        window.setTheme = t => { document.body.className = 'theme-' + t; localStorage.setItem('f_theme', t); }

        initApp();
        if(localStorage.getItem('f_theme')) setTheme(localStorage.getItem('f_theme'));
    </script>
</body>
</html>
