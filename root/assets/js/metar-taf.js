const loadMetarTaf = () => {
    const getMetar = (airportIcao) => {
        return fetch('/weather/api/data/metar?ids=' + airportIcao)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.text()
            })
    }

    const getTaf = (airportIcao) => {
        return fetch('/weather/api/data/taf?ids=' + airportIcao)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.text()
            })
    }

    getMetar('LFLY')
        .then(metar => {
            const contentElement = document.getElementById('lfly-metar')
            if (contentElement) contentElement.innerHTML = metar
        })
        .catch(error => {
            console.error('[METAR] LFLY error:', error)
            const el = document.getElementById('lfly-metar')
            if (el) el.innerHTML = '<span class="error">Indisponible</span>'
        })

    getTaf('LFLY')
        .then(taf => {
            const contentElement = document.getElementById('lfly-taf')
            if (contentElement) contentElement.innerHTML = taf
        })
        .catch(error => {
            console.error('[TAF] LFLY error:', error)
            const el = document.getElementById('lfly-taf')
            if (el) el.innerHTML = '<span class="error">Indisponible</span>'
        })

    getMetar('LFLN')
        .then(metar => {
            const contentElement = document.getElementById('lfln-metar')
            if (contentElement) contentElement.innerHTML = metar
        })
        .catch(error => {
            console.error('[METAR] LFLN error:', error)
            const el = document.getElementById('lfln-metar')
            if (el) el.innerHTML = '<span class="error">Indisponible</span>'
        })

    getMetar('LFLH')
        .then(metar => {
            const contentElement = document.getElementById('lflh-metar')
            if (contentElement) contentElement.innerHTML = metar
        })
        .catch(error => {
            console.error('[METAR] LFLH error:', error)
            const el = document.getElementById('lflh-metar')
            if (el) el.innerHTML = '<span class="error">Indisponible</span>'
        })
}
