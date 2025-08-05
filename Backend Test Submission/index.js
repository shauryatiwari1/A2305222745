
const express = require('express')
const bodyParser = require('body-parser')
const { Log } = require('../Logging Middleware/loggingMiddleware')

const app = express()
const port = 3000
app.use(bodyParser.json())

let urlData = {}

app.post('/shorturls', async function(req, res) {
    var url = req.body.url
    var validity = req.body.validity
    var code
    if (req.body.shortcode) {
        code = req.body.shortcode
    } else {
        code = Math.random().toString(36).substring(2, 8)
    }
    if (typeof url !== 'string' || !url) {
        await Log('backend', 'error', 'handler', 'URL is not valid')
        res.status(400).json({ error: 'URL is required' })
        return
    }
    if (urlData[code]) {
        await Log('backend', 'error', 'handler', 'Shortcode exists')
        res.status(409).json({ error: 'Shortcode already exists' })
        return
    }
    var mins = 30
    if (typeof validity === 'number' && validity > 0) {
        mins = validity
    }
    var expiryTime = new Date(Date.now() + mins * 60000).toISOString()
    urlData[code] = {
        url: url,
        expiry: expiryTime,
        created: new Date().toISOString(),
        clicks: []
    }
    await Log('backend', 'info', 'handler', 'Shortlink created: ' + code)
    res.status(201).json({ shortLink: 'http://localhost:' + port + '/' + code, expiry: expiryTime })
})

app.get('/shorturls/:shortcode', async function(req, res) {
    var code = req.params.shortcode
    if (urlData[code]) {
        await Log('backend', 'info', 'handler', 'Stats for: ' + code)
        res.json({
            totalClicks: urlData[code].clicks.length,
            url: urlData[code].url,
            created: urlData[code].created,
            expiry: urlData[code].expiry,
            clicks: urlData[code].clicks
        })
    } else {
        await Log('backend', 'error', 'handler', 'Shortcode not found')
        res.status(404).json({ error: 'Shortcode not found' })
    }
})

app.get('/:shortcode', async function(req, res) {
    var code = req.params.shortcode
    if (urlData[code]) {
        var now = new Date()
        var expiryDate = new Date(urlData[code].expiry)
        if (now > expiryDate) {
            await Log('backend', 'error', 'route', 'Shortcode expired')
            res.status(410).json({ error: 'Shortcode expired' })
        } else {
            urlData[code].clicks.push({ timestamp: now.toISOString() })
            await Log('backend', 'info', 'route', 'Redirected to ' + urlData[code].url)
            res.redirect(urlData[code].url)
        }
    } else {
        await Log('backend', 'error', 'route', 'Shortcode not found')
        res.status(404).json({ error: 'Shortcode not found' })
    }
})

app.listen(port, function() {
    console.log('Service running on', port)
})
