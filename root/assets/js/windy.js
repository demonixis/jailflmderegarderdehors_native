const loadWindy = () => {
    const container = document.getElementById('windy')
    if (!container) return

    const iframe = container.getElementsByTagName('iframe')[0]
    if (!iframe) return

    iframe.src = iframe.src
}
