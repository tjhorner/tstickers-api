const fs = require('fs').promises
const fsOld = require('fs')
const crypto = require('crypto')
const path = require('path')
const EventEmitter = require('events')
const request = require('request')

class HttpImageCache extends EventEmitter {
  constructor(directory, cacheTime) {
    super()
    this.directory = directory
    this.cacheTime = cacheTime * 1000
    this.manifestPath = path.join(directory, "manifest.json")
    this.loadManifest()
  }

  async loadManifest() {
    try {
      await fs.access(this.manifestPath)
    } catch(e) {
      this.manifest = { }
      await fs.writeFile(this.manifestPath, "{ }")
      return
    }

    this.manifest = JSON.parse(await fs.readFile(this.manifestPath))
    this.emit("ready")
  }

  cacheHit(hash) {
    return !!(this.manifest[hash] && this.manifest[hash] + this.cacheTime >= Date.now())
  }

  async getCachedImage(hash) {
    return await fs.readFile(path.join(this.directory, hash))
  }

  async getImage(url) {
    const hash = crypto.createHash("sha256").update(url, "utf8").digest("hex")

    if(this.cacheHit(hash)) {
      return await this.getCachedImage(hash)
    } else {
      return new Promise((resolve, reject) => {
        request(url, { encoding: null }, (err, res, body) => {
          this.manifest[hash] = Date.now()
          this.commitManifest()
          resolve(body)
        }).pipe(fsOld.createWriteStream(path.join(this.directory, hash)))
      })
    }
  }

  async commitManifest() {
    await fs.writeFile(this.manifestPath, JSON.stringify(this.manifest, null, 2))
  }
}

module.exports = HttpImageCache