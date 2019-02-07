# Telegram Stickers API

This is basically a wrapper around the Telegram Bot API that only provides access to sticker data.

It aggressively caches sticker image data both on-disk and in the `Cache-Control` header, both to save requests to Telegram and to save requests from clients.

It is suitable for public use -- no API tokens are required.

## Features

- Public sticker API
- Automatically handles WebP -> PNG conversion
- Aggressive file caching for fast response times
- Pre-set CORS headers -- use it in client-side JS immediately

## Usage

Create `config.json`:

```json
{
  "BOT_TOKEN": "Something",
  "CACHE_TIME": 3600
}
```

Then:

```shell
npm install
node index
```

In production, you can use environment variables instead of `config.json`.

Then, simply use these endpoints:

```
GET /pack/:name
GET /sticker/:id.png
```

Examples:
- https://stickers.horner.tj/pack/Animals
- https://stickers.horner.tj/sticker/CAADAgAD3gAD9HsZAAG9he9u98XOPQI.png

**(Please do not use stickers.horner.tj in production. It is not stable and may go down at any time. It is simply for demonstration purposes.)**

## Docker

A `Dockerfile` is included in this repo, but prebuilt images are available:

```
docker pull tjhorner/tstickers-api:latest
```

For your reference, a sample `docker-compose.yml` is also included.