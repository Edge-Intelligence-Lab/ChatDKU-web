# ChatDKU Website Developer Documentation

## Our Stack:

We're using the Next.js framework for its quick development opportunities and rich open-source community. The site runs as a **real Node server** (`next build` + `next start`) on port 3000 on GPU4, behind Apache. Our chat, session, and user data comes from the Django backend.

### How a request reaches a backend

There are three backend services on GPU4, and Apache (`/etc/apache2/sites-enabled/chatdku.conf`) decides which one gets each prefix. It terminates TLS and enforces Shibboleth, passing the identity down as `UID` / `X-DisplayName` headers:

| Path | Goes to |
| --- | --- |
| `/api/chat`, `/api/c/`, `/api/feedback`, `/api/events` | **Django**, `127.0.0.1:8009` |
| `/api/get_session` | **Django** `/api/c/create_session` (an Apache-level rewrite) |
| `/user`, `/admin` | **Django**, `127.0.0.1:8009` |
| `/public/chat`, `/public/auth/get-token` | **FastAPI public**, `127.0.0.1:8999` |
| everything else | **this Next server**, `127.0.0.1:3000` |

One trap in that table: the `/user` rule is `ProxyPass /user http://127.0.0.1:8009/user/`, and the two sides disagree about the trailing slash. Apache appends whatever follows `/user` to a target that already ends in one, and Django's resolver never collapses repeated slashes. So `/user` works (empty remainder), while `/user/upload` reaches Django as `/user//upload` and 404s — **file uploads cannot work in production until that vhost rule is balanced** to `ProxyPass /user/ http://127.0.0.1:8009/user/`. Don't "fix" it by adding a trailing slash on the client; that just turns `/user` into `/user//`.

Two more things follow from that table:

- The student app you are working on talks to **Django**, not to the FastAPI service. The FastAPI backend on `:8999` is a separate product — the unauthenticated public chat used by `ChatDKU-web-public`, with its own JWT auth and a single-step plain-text stream. A third FastAPI service on `:8123` runs the agent itself and is only ever called by Django, through Celery.
- Apache reaches Django directly, so **the route handlers under `app/api/` and `app/user/` only run in development**. They are still written as faithful proxies that mirror Django's URLs 1:1 (see `lib/server/backend.ts` for the full contract), so dev and production behave the same and a change to the Apache config cannot silently start serving mock data. Mock responses only appear when `MOCK_API` is on, which is the default for `npm run dev`.

We're using the [shadcn/ui](https://ui.shadcn.com/) open-source UI library. This is a widely used, simple, and customizable UI library that uses Tailwind CSS for globally consistent styling.

Try to stick to these shadcn/ui components as much as possible, and only create custom components when necessary. This is to keep accessibility standards and consistency.

## Development Guide:

### Dependencies:

- The latest Node.js LTS runtime must be installed on the machine you're using to develop.

### Development flow:

1. Run `npm install` in the frontend directory to install Node dependencies.
2. Run `npm run dev` to spin up a localhost server and navigate to http://localhost:3000/ to see the homepage. The dev server will hot-reload whenever you save.
3. Make necessary edits, and review changes on both a desktop screen and a mobile screen. Test with many aspect ratios to make sure nothing clips or looks broken. `npm run dev` serves mock chat responses with markdown in them, so check that responses stay clear and legible (this is important — users must be able to read ChatDKU's answers easily). Set `MOCK_API=false` in `.env.local` to hit the real backend instead, which needs internal network access.
4. Use `npm run test` to run the suite (`npm run test:watch` while working, `npm run test:coverage` for a report).
5. Check that `npm run typecheck`, `npm run lint` and `npm run build` all succeed before pushing to the main branch.

### Testing:

Tests run on [Vitest](https://vitest.dev) with Testing Library, split into two projects:

- **ui** — components and browser-side `lib/` code, in jsdom.
- **api** — the route handlers under `app/`, in node, against real `Request`/`Response` objects.

Because the route handlers are proxies, the useful seam to stub is Django itself, not our own
endpoints. `integration/chat-flow.test.tsx` does exactly that: the component's `fetch` calls are
routed into the actual route handlers, and only the backend beyond them is faked, so a mismatch
between the client, the proxy and the documented backend contract fails the suite.

When you change an endpoint, update the contract notes in `lib/server/backend.ts` and the fake
backend in the integration test together — they are the two places that describe what Django
returns.

### Deploying to production:

The app runs on GPU4 as `chatdku-web.service`, a systemd unit that keeps `next start` alive on
127.0.0.1:3000 and brings it back after a crash or a reboot. The unit file lives at the root of this
repo; `/etc/systemd/system/chatdku-web.service` is a copy of it. Deploying means rebuilding in place
and restarting the unit:

```bash
cd /opt/chatdku/ChatDKU-web
git pull
PATH=/opt/node-22/bin:$PATH npm ci
PATH=/opt/node-22/bin:$PATH npm run build
sudo systemctl restart chatdku-web
```

Pull as yourself — the checkout is owned by a maintainer and shared through the `deploy` group, not
owned by `chatdku-admin` (see first-time setup below for why). The `PATH` prefix is there because
the system `node` on GPU4 is 18, too old to build this; put `/opt/node-22/bin` on your `PATH` in
`~/.bashrc` if you deploy often.

Build before restarting, not after: `next start` serves whatever is in `.next` at the moment it
boots, so restarting first would put the old build back up and then swap it out mid-flight.

Afterwards, visit [ChatDKU](https://chatdku.dukekunshan.edu.cn) in incognito mode. Make sure a chat response streams in and is clear and legible.

Useful commands:

```bash
systemctl status chatdku-web
journalctl -u chatdku-web -f          # live logs
journalctl -u chatdku-web -n 100      # last 100 lines
```

> **Rollback**: there is no build backup to restore — `git checkout <last-good-commit>`, rebuild, and
> restart the unit.

### First-time setup on a new box:

These steps are only needed once. Everything runs as `chatdku-admin`, the user the other ChatDKU
services on GPU4 already run as.

**1. Install a supported Node runtime.** GPU4's system `node` is 18, and Next 16 needs 20.9 or
newer. Rather than upgrading the system package out from under the other services on that box,
unpack the LTS tarball into `/opt/node-22`, which is the path the unit's `PATH` points at:

```bash
curl -fsSLO https://nodejs.org/dist/v22.22.2/node-v22.22.2-linux-x64.tar.xz
sudo mkdir -p /opt/node-22
sudo tar -xJf node-v22.22.2-linux-x64.tar.xz -C /opt/node-22 --strip-components=1
/opt/node-22/bin/node -v
```

**2. Clone the repo to `/opt/chatdku/ChatDKU-web`**, alongside the backend checkout, as *your own*
user — not as `chatdku-admin`:

```bash
git clone git@github.com:Edge-Intelligence-Lab/ChatDKU-web.git /opt/chatdku/ChatDKU-web
```

The service runs as `chatdku-admin`, but the checkout deliberately is not owned by it.
`chatdku-admin` has no credentials on GitHub, so a checkout owned by it could never be
`git pull`ed; and running `git` against a repo owned by another user trips Git's dubious-ownership
guard anyway. Instead the whole tree is shared through the `deploy` group, which every maintainer
belongs to. `/opt/chatdku` is setgid with `group::rwx`, so anything created inside it inherits group
`deploy`, and the standard `umask 002` on this box makes it group-writable. `ChatDKU-backend` next
door works exactly this way — owned by a person, served by `chatdku-admin`.

Two things follow. Keep your umask at `002` when you build, or `.next` comes out group-read-only and
the service cannot write its runtime cache. And if you clone as a user who is somehow not in
`deploy`, fix the group rather than the owner:

```bash
sudo chgrp -R deploy /opt/chatdku/ChatDKU-web
sudo chmod -R g+w /opt/chatdku/ChatDKU-web
```

**3. Build once:**

```bash
cd /opt/chatdku/ChatDKU-web
PATH=/opt/node-22/bin:$PATH npm ci
PATH=/opt/node-22/bin:$PATH npm run build
```

**4. Add `/opt/chatdku/ChatDKU-web/.env.production`** if this deployment needs to override anything
(`BACKEND_BASE_URL`, for instance). The file is optional — the unit starts without it, and
`NODE_ENV=production` already keeps `MOCK_API` off. Keep it out of git.

**5. Install and enable the unit:**

```bash
sudo cp /opt/chatdku/ChatDKU-web/chatdku-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now chatdku-web
systemctl status chatdku-web
```

`enable --now` both starts it and makes it come back on reboot. Confirm it is actually listening
before you go looking at Apache:

```bash
ss -tlnp | grep 3000
curl -I http://127.0.0.1:3000
```

If you edit `chatdku-web.service` in the repo, the copy under `/etc/systemd/system/` does not change
by itself — copy it over again and `daemon-reload`.
