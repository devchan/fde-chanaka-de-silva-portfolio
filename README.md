# Chanaka De Silva Portfolio

Premium portfolio for enterprise AI, Forward Deployed Engineering, Staff Software Engineering, and solution architecture roles.

## Getting Started

### Docker Production Runtime

Build and run the production container:

```bash
docker compose up --build portfolio
```

Open [http://localhost:3000](http://localhost:3000).

### Docker Development Runtime

Run the dev server inside Docker with live source mounts:

```bash
docker compose --profile dev up portfolio-dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Runtime

If you prefer host Node:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Gates

```bash
npm run lint
npm run build
docker compose build portfolio
```

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide Icons
- MDX support via `@next/mdx`
- Standalone Docker output

## Routes

- `/`
- `/about`
- `/experience`
- `/projects`
- `/projects/[slug]`
- `/architecture`
- `/ai-lab`
- `/ai-lab/[slug]`
- `/skills`
- `/blog`
- `/blog/[slug]`
- `/resume`
- `/contact`

## SEO and Distribution

- Metadata API
- Open Graph image route
- Twitter cards
- Structured data
- Sitemap
- Robots
- RSS feed
- PWA manifest
- Service worker offline cache
