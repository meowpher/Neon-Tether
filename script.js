// --- CONFIG ---
const CFG = { gravity: 0.4, drag: 0.99, spring: 0.08, thruster: 0.4, maxSpeed: 24, startSpeed: 6, maxTetherLen: 600 };

// --- DATA: Store Items ---
const StoreDB = {
    skins: [
        { id: 'skin_cyan', name: 'Cyan Core', cost: 0, color: '#0ff' },
        { id: 'skin_lime', name: 'Toxic Lime', cost: 1000, color: '#0f0' },
        { id: 'skin_pink', name: 'Hot Plasma', cost: 2500, color: '#f0f' },
        { id: 'skin_gold', name: 'Pure Gold', cost: 5000, color: '#ffd700' },
        { id: 'skin_white', name: 'Starlight', cost: 10000, color: '#fff' }
    ],
    trails: [
        { id: 'trail_dust', name: 'Dust', cost: 0, type: 'circle', color: null },
        { id: 'trail_fire', name: 'Afterburner', cost: 2000, type: 'fire', color: '#f50' },
        { id: 'trail_matrix', name: 'Matrix', cost: 4000, type: 'square', color: '#0f0' },
        { id: 'trail_rainbow', name: 'Rainbow', cost: 8000, type: 'rainbow', color: null }
    ],
    bgs: [
        { id: 'bg_default', name: 'Void', cost: 0, color: '#050505' },
        { id: 'bg_midnight', name: 'Midnight', cost: 1500, color: '#000022' },
        { id: 'bg_mars', name: 'Red Planet', cost: 3000, color: '#1a0505' },
        { id: 'bg_slate', name: 'Clean Slate', cost: 5000, color: '#222' }
    ]
};

// --- SAVE SYSTEM ---
const SaveSystem = {
    data: { credits: 0, highScore: 0, totalDist: 0, unlocked: ['skin_cyan', 'trail_dust', 'bg_default'], equipped: { skin: 'skin_cyan', trail: 'trail_dust', bg: 'bg_default' } },
    load: function() { const str = localStorage.getItem('neon_v3'); if (str) this.data = JSON.parse(str); },
    save: function() { localStorage.setItem('neon_v3', JSON.stringify(this.data)); },
    unlock: function(id, cost) { if (this.data.credits >= cost && !this.data.unlocked.includes(id)) { this.data.credits -= cost; this.data.unlocked.push(id); this.save(); return true; } return false; },
    equip: function(type, id) { if (this.data.unlocked.includes(id)) { this.data.equipped[type] = id; this.save(); } }
};

// --- DEV TOOLS ---
const DevTools = {
    active: false,
    initListeners: function() {
        document.getElementById('admin-pass').addEventListener('keydown', (e) => this.login(e));
        document.getElementById('btn-god').addEventListener('click', () => this.toggleGod());
        document.getElementById('btn-money').addEventListener('click', () => this.addMoney());
        document.getElementById('btn-unlock').addEventListener('click', () => this.unlockAll());
        document.getElementById('btn-speed').addEventListener('click', () => this.speedUp());
        document.getElementById('btn-grav').addEventListener('click', () => this.toggleGrav());
        document.getElementById('btn-wipe').addEventListener('click', () => this.wipeSave());
    },
    login: function(e) {
        if(e.key === 'Enter') {
            if(document.getElementById('admin-pass').value.toLowerCase() === 'admin') {
                document.getElementById('dev-login-area').style.display = 'none';
                document.getElementById('dev-panel').style.display = 'block';
                this.active = true;
            }
            document.getElementById('admin-pass').value = '';
        }
    },
    toggleGod: function() {
        game.godMode = !game.godMode;
        const btn = document.getElementById('btn-god');
        btn.innerText = game.godMode ? "GOD MODE: ON" : "GOD MODE: OFF";
        btn.classList.toggle('active');
    },
    addMoney: function() { SaveSystem.data.credits += 50000; SaveSystem.save(); UI.home(); },
    unlockAll: function() {
        StoreDB.skins.forEach(i => { if(!SaveSystem.data.unlocked.includes(i.id)) SaveSystem.data.unlocked.push(i.id); });
        StoreDB.trails.forEach(i => { if(!SaveSystem.data.unlocked.includes(i.id)) SaveSystem.data.unlocked.push(i.id); });
        StoreDB.bgs.forEach(i => { if(!SaveSystem.data.unlocked.includes(i.id)) SaveSystem.data.unlocked.push(i.id); });
        SaveSystem.save(); alert("UNLOCKED ALL");
    },
    speedUp: function() { game.player.vx += 20; CFG.maxSpeed = Math.max(CFG.maxSpeed, game.player.vx); },
    toggleGrav: function() {
        if(CFG.gravity > 0) { CFG.gravity = 0; document.getElementById('btn-grav').innerText = "GRAVITY: OFF"; }
        else { CFG.gravity = 0.4; document.getElementById('btn-grav').innerText = "GRAVITY: ON"; }
        document.getElementById('btn-grav').classList.toggle('active');
    },
    wipeSave: function() { if(confirm("NUKE SAVE DATA?")) { localStorage.removeItem('neon_v3'); location.reload(); } }
};

// --- AUDIO ---
const AudioSys = {
    ctx: null, init: function() { if (!this.ctx) this.ctx = new (window.AudioContext||window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
    play: function(key) {
        if (!this.ctx) return; const osc = this.ctx.createOscillator(); const g = this.ctx.createGain(); osc.connect(g); g.connect(this.ctx.destination); const t = this.ctx.currentTime;
        if (key === 'hook') { osc.frequency.setValueAtTime(400, t); osc.frequency.linearRampToValueAtTime(800, t+0.1); g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0, t+0.1); osc.start(); osc.stop(t+0.1); }
        else if (key === 'buy') { osc.type = 'square'; osc.frequency.setValueAtTime(800, t); g.gain.setValueAtTime(0.1, t); g.gain.linearRampToValueAtTime(0, t+0.2); osc.start(); osc.stop(t+0.2); }
        else if (key === 'crash') { osc.type='sawtooth'; osc.frequency.setValueAtTime(100,t); osc.frequency.exponentialRampToValueAtTime(10,t+0.5); g.gain.setValueAtTime(0.2,t); g.gain.linearRampToValueAtTime(0,t+0.5); osc.start(); osc.stop(t+0.5); }
    }
};

// --- UI ---
const UI = {
    toggle: (id) => { document.querySelectorAll('.menu-screen').forEach(el => el.classList.remove('active')); document.getElementById('hud').style.display = 'none'; if(id) document.getElementById(id).classList.add('active'); },
    home: () => { SaveSystem.load(); document.getElementById('menu-credits').innerText = SaveSystem.data.credits; document.getElementById('menu-high').innerText = SaveSystem.data.highScore + 'm'; UI.toggle('screen-start'); },
    showHelp: () => UI.toggle('screen-help'),
    showStore: () => { UI.toggle('screen-store'); UI.renderStore(); },
    renderStore: () => {
        document.getElementById('store-credits').innerText = SaveSystem.data.credits; const container = document.getElementById('store-content'); container.innerHTML = '';
        const render = (title, items, type) => {
            let html = `<div class="store-section"><div class="store-title">${title}</div><div class="store-grid">`;
            items.forEach(item => {
                const owned = SaveSystem.data.unlocked.includes(item.id); const equipped = SaveSystem.data.equipped[type] === item.id;
                let color = '#333'; if(type==='skin'||type==='bg') color = item.color; if(type==='trail') color = item.color || '#fff';
                html += `<div class="store-item ${equipped?'equipped':(owned?'owned':'')}" onclick="UI.clickItem('${type}','${item.id}',${item.cost})"><div class="item-preview" style="background:${color}"></div><div class="item-name">${item.name}</div><div class="item-cost ${owned?'item-label':''}">${equipped?'EQUIPPED':(owned?'OWNED':item.cost)}</div></div>`;
            });
            container.innerHTML += html + `</div></div>`;
        };
        render('SKINS', StoreDB.skins, 'skin'); render('TRAILS', StoreDB.trails, 'trail'); render('BACKGROUNDS', StoreDB.bgs, 'bg');
    },
    clickItem: (type, id, cost) => { if (SaveSystem.data.unlocked.includes(id)) { SaveSystem.equip(type, id); AudioSys.play('hook'); } else { if (SaveSystem.unlock(id, cost)) { SaveSystem.equip(type, id); AudioSys.play('buy'); } } UI.renderStore(); }
};

// --- GAME ENGINE ---
const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');
const game = {
    state: 'MENU', width: 0, height: 0, score: 0, cameraX: 0, frameCount: 0, godMode: false,
    player: { x: 0, y: 0, vx: 0, vy: 0, r: 8, tether: null }, anchors: [], particles: [], 
    inputs: { left: false, right: false, up: false, down: false, active: false },
    skinColor: '#0ff', bgColor: '#050505', trailType: 'circle',
    init: function() {
        SaveSystem.load(); this.resize(); window.addEventListener('resize', () => this.resize());
        DevTools.initListeners();
        
        // --- INPUT HANDLING ---
        const inputActive = (e) => { 
            // Avoid triggering swing if clicking buttons or inputs
            if(e && e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            
            if (this.state === 'READY') { this.state = 'PLAY'; this.player.vx = CFG.startSpeed; AudioSys.play('hook'); return; }
            if (this.state === 'PLAY') { this.inputs.active = true; this.tryTether(); } 
        };
        const inputEnd = () => { this.inputs.active = false; this.releaseTether(); };

        // Keyboard
        window.addEventListener('keydown', e => { 
            if(e.code==='Space') { e.preventDefault(); inputActive(); }
            if(e.code==='ArrowLeft') this.inputs.left=true; if(e.code==='ArrowRight') this.inputs.right=true; 
            if(e.code==='ArrowUp') this.inputs.up=true; if(e.code==='ArrowDown') this.inputs.down=true; 
        });
        window.addEventListener('keyup', e => { 
            if(e.code==='Space') inputEnd();
            if(e.code==='ArrowLeft') this.inputs.left=false; if(e.code==='ArrowRight') this.inputs.right=false;
            if(e.code==='ArrowUp') this.inputs.up=false; if(e.code==='ArrowDown') this.inputs.down=false; 
        });
        
        // Global Touch/Mouse (Swing)
        window.addEventListener('mousedown', inputActive); window.addEventListener('touchstart', (e)=>{ if(e.target.tagName!=='BUTTON') e.preventDefault(); inputActive(e); }, {passive:false});
        window.addEventListener('mouseup', inputEnd); window.addEventListener('touchend', inputEnd);

        // Mobile Buttons (Steering)
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        
        const touchStartLeft = (e) => { e.stopPropagation(); this.inputs.left = true; };
        const touchEndLeft = (e) => { e.stopPropagation(); this.inputs.left = false; };
        const touchStartRight = (e) => { e.stopPropagation(); this.inputs.right = true; };
        const touchEndRight = (e) => { e.stopPropagation(); this.inputs.right = false; };

        btnLeft.addEventListener('mousedown', touchStartLeft); btnLeft.addEventListener('touchstart', touchStartLeft);
        btnLeft.addEventListener('mouseup', touchEndLeft); btnLeft.addEventListener('touchend', touchEndLeft);
        btnRight.addEventListener('mousedown', touchStartRight); btnRight.addEventListener('touchstart', touchStartRight);
        btnRight.addEventListener('mouseup', touchEndRight); btnRight.addEventListener('touchend', touchEndRight);

        UI.home(); this.loop();
    },
    resize: function() { this.width = canvas.width = window.innerWidth; this.height = canvas.height = window.innerHeight; },
    start: function() { AudioSys.init(); this.applyCustomization(); this.state = 'READY'; this.reset(); document.getElementById('hud').style.display = 'flex'; document.querySelectorAll('.menu-screen').forEach(el => el.classList.remove('active')); },
    applyCustomization: function() { const eq = SaveSystem.data.equipped; const skin = StoreDB.skins.find(s=>s.id===eq.skin); const bg = StoreDB.bgs.find(b=>b.id===eq.bg); const trail = StoreDB.trails.find(t=>t.id===eq.trail); this.skinColor=skin?skin.color:'#0ff'; this.bgColor=bg?bg.color:'#050505'; this.trailType=trail?trail:{type:'circle',color:null}; },
    reset: function() { this.player = { x: 200, y: this.height/2, vx: 0, vy: 0, r: 8, tether: null }; this.anchors = []; this.particles = []; this.cameraX = 0; this.score = 0; this.frameCount = 0; this.godMode = false; for(let i=0; i<20; i++) this.spawnChunk(300 + i*350); },
    spawnChunk: function(x) { this.anchors.push({ x: x, y: this.height * 0.2 + Math.random() * (this.height * 0.6) }); },
    tryTether: function() { const best = this.getBestAnchor(); if (best) { this.player.tether = { anchor: best, len: this.dist(this.player, best) }; AudioSys.play('hook'); } },
    getBestAnchor: function() { let best=null, minDist=CFG.maxTetherLen; this.anchors.forEach(a => { if (a.x < this.player.x - 50) return; const d = this.dist(this.player, a); if (d < minDist) { minDist=d; best=a; } }); return best; },
    dist: function(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); },
    releaseTether: function() { if (this.player.tether) { this.player.vx *= 1.1; this.player.tether = null; } },
    update: function() {
        this.frameCount++; if (this.state === 'READY') { this.player.y = (this.height/2) + Math.sin(this.frameCount * 0.05) * 5; return; } if (this.state !== 'PLAY') return;
        const p = this.player;
        
        if (this.godMode) {
            p.vx = 0; p.vy = 0;
            if(this.inputs.right) p.x += 15; if(this.inputs.left) p.x -= 15;
            if(this.inputs.up) p.y -= 15; if(this.inputs.down) p.y += 15;
        } 
        else {
            p.vy += CFG.gravity; p.vx *= CFG.drag; p.vy *= CFG.drag;
            if (this.inputs.right) { p.vx += CFG.thruster; this.spawnParticle(p.x, p.y, -1); } 
            if (this.inputs.left) { p.vx -= CFG.thruster; this.spawnParticle(p.x, p.y, 1); }
            if (p.tether) { const a = p.tether.anchor; const dist = this.dist(p, a); if (dist > p.tether.len) { const f = (dist - p.tether.len) * CFG.spring; const dx = a.x - p.x; const dy = a.y - p.y; p.vx += (dx/dist)*f; p.vy += (dy/dist)*f; } } else if (this.inputs.active) this.tryTether();
            const speed = Math.hypot(p.vx, p.vy); if (speed > CFG.maxSpeed) { p.vx *= (CFG.maxSpeed/speed); p.vy *= (CFG.maxSpeed/speed); }
            p.x += p.vx; p.y += p.vy;
        }

        this.cameraX += ((p.x - this.width*0.3) - this.cameraX) * 0.1;
        if (this.anchors[this.anchors.length-1].x < this.cameraX + this.width + 800) this.spawnChunk(this.anchors[this.anchors.length-1].x + 300 + Math.random()*200); if (this.anchors.length > 30) this.anchors.shift();
        
        if (!this.godMode && (p.y > this.height + 200 || p.y < -200)) this.gameOver();

        this.score = Math.floor(p.x / 100); document.getElementById('hud-dist').innerText = this.score + "m"; document.getElementById('hud-creds').innerText = this.score; this.updateParticles();
    },
    gameOver: function() { this.state = 'OVER'; AudioSys.play('crash'); SaveSystem.data.credits += this.score; SaveSystem.data.totalDist += this.score; if (this.score > SaveSystem.data.highScore) SaveSystem.data.highScore = this.score; SaveSystem.save(); document.getElementById('end-dist').innerText = this.score + "m"; document.getElementById('end-loot').innerText = this.score; UI.toggle('screen-over'); },
    spawnParticle: function(x, y, dirX) { const t = this.trailType; let color = t.color || (Math.random()>0.5 ? '#0ff' : '#f0f'); if (t.type === 'rainbow') color = `hsl(${Math.random()*360}, 100%, 50%)`; this.particles.push({ x: x, y: y, vx: dirX * (Math.random()*5) + (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 1.0, color: color, size: Math.random()*4, type: t.type }); },
    updateParticles: function() { this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.05; }); this.particles = this.particles.filter(p => p.life > 0); },
    draw: function() {
        ctx.fillStyle = this.bgColor; ctx.fillRect(0, 0, this.width, this.height); ctx.save(); ctx.translate(-this.cameraX, 0);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(this.cameraX, this.height - 50); ctx.lineTo(this.cameraX+this.width, this.height - 50); ctx.stroke();
        this.anchors.forEach(a => { ctx.beginPath(); ctx.arc(a.x, a.y, 6, 0, Math.PI*2); ctx.fillStyle = '#0f0'; ctx.shadowBlur=10; ctx.shadowColor='#0f0'; ctx.fill(); ctx.shadowBlur=0; });
        if (this.player.tether) { ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(this.player.tether.anchor.x, this.player.tether.anchor.y); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
        else { const best = this.getBestAnchor(); if (best && this.state === 'PLAY') { ctx.beginPath(); ctx.moveTo(this.player.x, this.player.y); ctx.lineTo(best.x, best.y); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(best.x, best.y, 15 + Math.sin(this.frameCount*0.2)*3, 0, Math.PI*2); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); } }
        ctx.beginPath(); ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI*2); ctx.fillStyle = this.skinColor; ctx.shadowBlur=20; ctx.shadowColor=this.skinColor; ctx.fill(); ctx.shadowBlur=0;
        this.particles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; if(p.type === 'square' || p.type === 'fire') ctx.fillRect(p.x, p.y, p.size, p.size); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); } ctx.globalAlpha = 1; });
        if (this.state === 'READY') { ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(this.frameCount * 0.1) * 0.4})`; ctx.font = "bold 24px Orbitron"; ctx.textAlign = "center"; ctx.fillText("PRESS SPACE TO ENGAGE", this.player.x, this.player.y - 40); }
        ctx.restore();
    },
    loop: function() { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); }
};
game.init();
