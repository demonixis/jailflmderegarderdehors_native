const loadScheduler = () => {
    const container = document.getElementById('scheduler')
    if (!container) return

    const iframe = container.getElementsByTagName('iframe')[0]
    if (!iframe) return

    iframe.src = iframe.src
}
