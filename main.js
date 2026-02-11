const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()
const path = require('path');
const port = 3000

const proxyErrorHandler = (err, req, res, target) => {
    console.error(`[PROXY] Error proxying to ${target}:`, err.message);
    if (!res.headersSent) {
        res.status(502).json({ error: 'Service temporarily unavailable' });
    }
};

app.use(express.static('root'))

app.use('/weather', createProxyMiddleware({
    target: 'https://aviationweather.gov',
    changeOrigin: true,
    pathRewrite: {
        '^/weather': '',
    },
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => proxyErrorHandler(err, req, res, 'aviationweather.gov'),
}));

app.use('/aviation-meteo', createProxyMiddleware({
    target: 'https://aviation.meteo.fr',
    changeOrigin: true,
    pathRewrite: {
        '^/aviation-meteo': '',
    },
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err, req, res) => proxyErrorHandler(err, req, res, 'aviation.meteo.fr'),
}));

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'root/index.html'));
});

app.listen(port, () => {
    console.log(`Serveur page TEV lancé sur le port ${port}`)
})
