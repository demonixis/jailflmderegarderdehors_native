# Plan d'Amélioration - Application Météo Aéronautique Raspberry Pi

## Résumé
Application web de météo aéronautique pour aéro-club, affichant METAR/TAF, radar météo, cartes TEMSI, webcam et ADS-B. Tourne en mode kiosque 24/7 sur Raspberry Pi avec des problèmes de stabilité nécessitant un reload forcé toutes les 30 minutes ("erreur 5").

**Symptômes observés:** Écran blanc/freeze, crash Chromium, erreurs JavaScript, lenteur progressive.

---

## Phase 1: Corrections de Bugs Critiques (Priorité Haute)

### 1.1 Corriger clearInterval/clearTimeout
**Fichier:** `root/assets/js/core.js:90`
```javascript
// AVANT (bug)
clearInterval(mouseMoveTimout)

// APRÈS
clearTimeout(mouseMoveTimout)
```
- **Impact:** Fuite mémoire contribuant à la lenteur progressive et "erreur 5"

### 1.2 Remplacer eval() par un registre de fonctions
**Fichier:** `root/assets/js/core.js:9,36`
```javascript
// AVANT (risque sécurité/performance)
eval(loaderDelegate + '()')

// APRÈS - Ajouter en haut du fichier:
const loaderRegistry = {
    loadMetarTaf,
    loadRadar,
    loadTemsi,
    loadWindy,
    loadScheduler,
    loadWebcam,
    loadAdsbMap
};

// Puis remplacer les eval() par:
if(loaderDelegate && loaderRegistry[loaderDelegate]) {
    loaderRegistry[loaderDelegate]()
}
```

### 1.3 Corriger le catch vide dans temsi.js
**Fichier:** `root/assets/js/temsi.js:73-75`
```javascript
// AVANT
catch(error) {
}

// APRÈS
catch(error) {
    console.error('[TEMSI] Error:', error.message || error);
    loadTemsiCache = null; // Permet retry au prochain cycle
}
```

### 1.4 Ajouter .catch() sur toutes les promesses
**Fichier:** `root/assets/js/metar-taf.js`
```javascript
// AVANT
getMetar('LFLY').then(metar => {
    const contentElement = document.getElementById('lfly-metar');
    contentElement.innerHTML = metar;
})

// APRÈS
getMetar('LFLY')
    .then(metar => {
        const contentElement = document.getElementById('lfly-metar');
        if (contentElement) contentElement.innerHTML = metar;
    })
    .catch(error => {
        console.error('[METAR] LFLY error:', error);
        const el = document.getElementById('lfly-metar');
        if (el) el.innerHTML = '<span class="error">Indisponible</span>';
    });
```
Appliquer le même pattern aux 3 autres appels (getTaf LFLY, getMetar LFLN, getMetar LFLH).

**Fichier:** `root/assets/js/temsi.js:68` - Ajouter .catch() similaire.

### 1.5 Ajouter vérifications null sur accès DOM
**Fichiers concernés:** adsbmap.js, webcam.js, scheduler.js, windy.js, radar.js
```javascript
// Pattern à appliquer (exemple adsbmap.js)
const loadAdsbMap = () => {
    const container = document.getElementById('adsbmap');
    if (!container) return;
    const iframe = container.getElementsByTagName('iframe')[0];
    if (!iframe) return;
    iframe.src = iframe.src;
}
```

### 1.6 Corriger setAttribute dans radar.js
**Fichier:** `root/assets/js/radar.js:8`
```javascript
// AVANT
imageElement.attributes['alt'] = "Radar météo"

// APRÈS
imageElement.setAttribute('alt', 'Radar météo');
```

### 1.7 Corriger la race condition dans loadTemsi()
**Fichier:** `root/assets/js/temsi.js`
```javascript
let loadTemsiCache = null;
let loadTemsiInProgress = false;  // NOUVEAU

const loadTemsi = () => {
    if (loadTemsiInProgress) return;  // NOUVEAU

    const pdfCanvas = document.querySelector('#temsi canvas');
    if (!pdfCanvas) return;

    try {
        // ... code existant ...

        loadTemsiInProgress = true;  // NOUVEAU

        getAvailableTemsi()
            .then(charts => { /* ... */ })
            .catch(error => { /* ... */ })
            .finally(() => {
                loadTemsiInProgress = false;  // NOUVEAU
            });
    }
    catch(error) {
        loadTemsiInProgress = false;
        console.error('[TEMSI] Error:', error);
    }
}
```

### 1.8 Supprimer console.log de debug
**Fichier:** `root/assets/js/temsi.js:50`
```javascript
// AVANT
.then(response => {
    console.log(response)
    return response.text()...

// APRÈS
.then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text()...
```

---

## Phase 2: Améliorations de Fiabilité (Priorité Moyenne)

### 2.1 Ajouter gestion d'erreur sur les proxies
**Fichier:** `main.js`
```javascript
const proxyErrorHandler = (err, req, res, target) => {
    console.error(`[PROXY] Error proxying to ${target}:`, err.message);
    res.status(502).json({ error: 'Service temporarily unavailable' });
};

app.use('/weather', createProxyMiddleware({
    target: 'https://aviationweather.gov',
    changeOrigin: true,
    pathRewrite: { '^/weather': '' },
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => proxyErrorHandler(err, req, res, 'aviationweather.gov'),
}));
// Idem pour /aviation-meteo
```

### 2.2 Tester stabilité sans reload forcé
**Fichier:** `root/assets/js/core.js:82-85`
- Après Phase 1, étendre l'intervalle à 2h puis 12h pour tester
- Si stable 24h+, envisager suppression complète

### 2.3 Ajouter dégradation gracieuse UI
Créer `root/assets/js/error-display.js` avec helper pour affichage cohérent des erreurs.

---

## Phase 3: Externalisation de la Configuration (Optionnel)

### 3.1 Créer config.json à la racine
```json
{
  "server": { "port": 3000 },
  "airports": ["LFLY", "LFLN", "LFLH"],
  "localDevices": {
    "webcam": { "url": "http://192.168.0.95:9081", "enabled": true },
    "adsb": { "url": "http://192.168.0.100/tar1090", "enabled": true }
  },
  "externalServices": {
    "radarUrl": "https://www.meteo60.fr/radars/animation-radar-centre-est.gif"
  },
  "scheduler": { "url": "http://agenda.tousenvol.com/visu.php" }
}
```

### 3.2 Endpoint /api/config pour le frontend
Permet de changer la configuration sans modifier le code.

---

## Fichiers Critiques à Modifier

| Fichier | Modifications |
|---------|---------------|
| `root/assets/js/core.js` | clearTimeout fix, remplacer eval(), null checks |
| `root/assets/js/temsi.js` | catch vide, race condition, .catch(), debug log |
| `root/assets/js/metar-taf.js` | Ajouter .catch() sur 4 appels |
| `root/assets/js/radar.js` | setAttribute fix, null check |
| `root/assets/js/adsbmap.js` | Null checks |
| `root/assets/js/webcam.js` | Null checks |
| `root/assets/js/scheduler.js` | Null checks |
| `root/assets/js/windy.js` | Null checks |
| `main.js` | Gestion erreur proxy |

---

## Vérification

1. **Après Phase 1:** Lancer l'application et observer les logs console pour erreurs
2. **Test de stabilité:** Laisser tourner 24h+ avec reload étendu à 2h
3. **Simulation panne réseau:** Déconnecter services externes, vérifier dégradation gracieuse
4. **Monitoring mémoire:** `htop` sur Raspberry Pi pour surveiller consommation RAM
5. **Test appareils locaux offline:** Éteindre webcam/ADS-B, vérifier comportement

---

## Ordre d'Implémentation

```
Phase 1 (corriger bugs critiques - stabilité)
├── 1.1 clearTimeout fix
├── 1.2 remplacer eval()
├── 1.3-1.4 gestion erreurs
├── 1.5-1.6 null checks et setAttribute
└── 1.7-1.8 race condition et cleanup

Phase 2 (après stabilisation)
├── 2.1 proxy error handling
└── 2.2-2.3 test sans reload + UI erreurs

Phase 3 (facilite déploiement futur)
└── Configuration externalisée
```
