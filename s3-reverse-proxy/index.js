const express = require('express')
const httpProxy = require('http-proxy')

const app = express()
const PORT = 8000

const BASE_PATH = 'https://deploypilot.s3.ap-south-1.amazonaws.com/__outputs'

const proxy = httpProxy.createProxy()

app.listen(PORT , () => console.log(`Reverse proxy running..${PORT}`))

app.use((req , res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolvesTo = `${BASE_PATH}/${subdomain}`

    return proxy.web(req , res , {target : resolvesTo , changeOrigin : true})

})

proxy.on('proxyReq', (proxyReq, req, res) => {
    if (req.url === '/') {
        proxyReq.path = proxyReq.path.endsWith('/') ? proxyReq.path + 'index.html' : proxyReq.path + '/index.html';
    }
});
