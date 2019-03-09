var config
try {
  config = require('./config.json')
} catch(e) {
  config = process.env
}

const path = require('path')

const Telegram = require('node-telegram-bot-api')
const bot = new Telegram(config.BOT_TOKEN, { polling: false })

const express = require('express')
const app = express()

const HttpImageCache = require('./lib/HttpImageCache')
const cache = new HttpImageCache(path.join(__dirname, "cache"), parseInt(config.CACHE_TIME))

const cacheControl = require('express-cache-controller')

const cors = require('cors')

const sharp = require('sharp')

const cachedLinks = { }

app.use(cacheControl())
app.use(cors())

app.get("/pack/:name", async (req, res) => {
  var packRaw

  try {
    packRaw = await bot.getStickerSet(req.params.name)
  } catch(e) {
    res.status(500)
    res.send({ error: "Something bad happened. Try again later." })
    return
  }

  res.cacheControl = {
    maxAge: 120,
    public: true
  }

  var pack = {
    name: packRaw.title,
    masks: packRaw.contains_masks,
    stickers: packRaw.stickers.map(sticker => {
      return {
        id: sticker.file_id,
        size: sticker.file_size,
        width: sticker.width,
        height: sticker.height,
        emoji: sticker.emoji,
        mask_position: sticker.mask_position
      }
    })
  }

  res.send(pack)
})

app.get("/sticker/:id.png", async (req, res) => {
  try {
    const stickerUrl = cachedLinks[req.params.id] || (cachedLinks[req.params.id] = await bot.getFileLink(req.params.id))
    const stickerWebp = await cache.getImage(stickerUrl)
  
    const stickerPng = await sharp(stickerWebp).toFormat("png").toBuffer()
  
    res.setHeader("Content-Type", "image/png")
    res.send(stickerPng)
  } catch(e) {
    res.sendStatus(500)
    return
  }

  res.cacheControl = {
    maxAge: parseInt(config.CACHE_TIME),
    public: true
  }
})

app.listen(process.env.PORT || 3000)