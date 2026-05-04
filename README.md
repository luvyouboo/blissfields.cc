# [blissfields.cc](http://blissfields.cc)
A simple, discord looking bio page.

## Features
- Sleek
- Smooth
- [LastFM integration](https://www.last.fm/api)
- [Lanyard integration (discord presence)](https://github.com/Phineas/lanyard)
- Custom icons

## Setup
1. Clone the repo
2. Create a [Cloudflare](https://cloudflare.com) account
3. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and run `wrangler login`
4. Create a Worker and add your secrets:
    ```bash
    wrangler secret put LANYARD_API_URL
    wrangler secret put LASTFM_API_KEY
    ```
5. Deploy with `wrangler deploy` and update the API URLs in `index.html` and `lastfm.js` with your Worker URL. Also update the CORS allowlist in `server.js` with your Cloudflare Pages URL and custom domain
6. Fill in your details in `index.html` — Discord ID, pronouns, about text, and social links
7. Drop your assets into `img/` — see the table below
8. Link the repo to [Cloudflare Pages](https://pages.cloudflare.com)
9. Enjoy!

## Assets
| File | Size |
|------|------|
| `img/banner.png` | 800 × 300 |
| `img/404.png` | 250 × 250 |
| `img/socials/*.png` | 250 × 250 |

- Vibe coded with Claude
