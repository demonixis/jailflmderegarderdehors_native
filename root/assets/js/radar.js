const loadRadar = () => {
    const radarTab = document.getElementById('radar')
    if (!radarTab) return

    const imageElement = document.createElement('img')
    const cacheDate = new Date()
    const cacheValue =
        `${cacheDate.getFullYear()}${cacheDate.getMonth()}${cacheDate.getDate()}${cacheDate.getHours()}${Math.round(cacheDate.getMinutes() / 15)}`
    imageElement.src = 'https://www.meteo60.fr/radars/animation-radar-centre-est.gif?cache=' + cacheValue
    imageElement.setAttribute('alt', 'Radar météo')

    radarTab.innerHTML = ''
    radarTab.appendChild(imageElement)
}
