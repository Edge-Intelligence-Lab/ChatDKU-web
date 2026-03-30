# ChatDKU Website Developer Documentation

## Our Stack:

We're using the Next.js framework for its quick development opportunities and rich open-source community. Since our backend is handled by Django, we are serving the website as a static site using `next build`.

We're using the [shadcn/ui](https://ui.shadcn.com/) open-source UI library. This is a widely used, simple, and customizable UI library that uses Tailwind CSS for globally consistent styling.

Try to stick to these shadcn/ui components as much as possible, and only create custom components when necessary. This is to keep accessibility standards and consistency.

## Development Guide:

### Dependencies:

- The latest Node.js LTS runtime must be installed on the machine you're using to develop.

### Development flow:

1. Run `npm install` in the frontend directory to install Node dependencies.
2. Run `npm run dev` to spin up a localhost server and navigate to http://localhost:3000/ to see the homepage. The dev server will hot-reload whenever you save.
3. Make necessary edits, and review changes on both a desktop screen and a mobile screen. Test with many aspect ratios to make sure nothing clips or looks broken. You can also enter "test" in the chat box to test proper markdown rendering (this is important as users must be able to read ChatDKU's responses easily).
4. Use `npm run test` to run all tests for essential functionality.
5. Check that `npm run build` succeeds before pushing to the main branch.

### Deploying to production:

1. Run `sudo bash deploy.sh` to run the deployment script. It will go through the entire test suite and deploy the frontend as well as create a backup of the previous deployment in case a rollback is needed.  
   This backup is stored at `/var/www/chatdku_webapp_backups`
2. Visit [ChatDKU](https://chatdku.dukekunshan.edu.cn) in incognito mode. Make sure the chat responses are clear and legible.

### Installing automated deployment services:

There are two systemd services that automate deployment maintenance:

- **`chatdku-deploy`** — Checks if the frontend is present at `/var/www/chatdku`. If it's missing or empty (e.g. after a reboot or accidental deletion), it automatically rebuilds and redeploys. Runs 2 minutes after boot and every 15 minutes thereafter.
- **`chatdku-cleanup-backups`** — Removes deployment backups in `/var/www/chatdku_webapp_backups` that are older than 30 days. Runs once daily.

To install and activate both services:

```bash
sudo cp chatdku-deploy.service chatdku-deploy.timer /etc/systemd/system/
sudo cp chatdku-cleanup-backups.service chatdku-cleanup-backups.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chatdku-deploy.timer chatdku-cleanup-backups.timer
```

To check their statuses:

```bash
systemctl list-timers chatdku-*
sudo journalctl -u chatdku-deploy.service -e
sudo journalctl -u chatdku-cleanup-backups.service -e
```

### Vercel deployment with Cloudflare Tunnel

The public-facing site is deployed on Vercel. Since the Python backend runs on an internal network, a Cloudflare Tunnel exposes it so Vercel's serverless functions can reach it.

#### Environment variables (Vercel)

| Variable           | Purpose                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BACKEND_BASE_URL` | Cloudflare Tunnel hostname (e.g. `https://api.chatdku.com`)                                                                                                                             |
| `JWT_SECRET`       | Shared secret used to fetch a JWT from the backend's `/auth/get-token` endpoint [(find here)](https://github.com/Edge-Intelligence-Lab/ChatDKU-backend/blob/main/chatdku/.env.example). |

These are used by the API routes in `app/api/chat/route.ts` and `app/api/auth/token/route.ts`, as well as the dev-mode rewrites in `next.config.ts`. All fall back to the internal hostname when `BACKEND_BASE_URL` is not set.

#### Cloudflare Tunnel setup (backend server)

1. Install `cloudflared` and authenticate: `cloudflared tunnel login`
2. Create the tunnel: `cloudflared tunnel create chatdku-backend`
3. Route DNS: `cloudflared tunnel route dns chatdku-backend api.chatdku.com`
4. Create `~/.cloudflared/config.yml`:

```yaml
tunnel: chatdku-backend
credentials-file: ~/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  - hostname: api.chatdku.com
    service: http://localhost:8999
  - service: http_status:404
```

5. Run as a systemd service:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

#### Authentication flow

1. Guest clicks "Proceed" on the login page
2. Client calls `/api/auth/token` (Next.js API route)
3. The route fetches a JWT from the backend using `JWT_SECRET`
4. JWT is returned to the client and stored as a `chatdku_token` cookie
5. Subsequent chat requests go through `/api/chat`, which proxies to the backend with `Authorization: Bearer <token>`
