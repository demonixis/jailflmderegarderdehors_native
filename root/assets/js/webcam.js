const loadWebcam = () => {
    const container = document.getElementById('webcam')
    if (!container) return

    const img = container.getElementsByTagName('img')[0]
    if (!img) return

    img.src = img.src
}
