const loadAdsbMap = () => {
    const container = document.getElementById('adsbmap')
    if (!container) return

    const iframe = container.getElementsByTagName('iframe')[0]
    if (!iframe) return

    iframe.src = iframe.src
}
