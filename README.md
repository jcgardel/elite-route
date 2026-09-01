This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Stripe payments

Set these environment variables before testing card payments:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The checkout endpoint is `POST /api/checkout`. Stripe webhooks should point to
`/api/webhooks/stripe` and listen for `checkout.session.completed`.

> **Use a test key locally.** With an `sk_live_…` key in `.env.local`, completing
> a checkout on your own machine creates real sessions in the production Stripe
> account. Keep `sk_test_…` for development.

## Google Maps keys

Two separate keys, on purpose:

| Variable | Used by | Restriction |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | the browser (autocomplete) | HTTP referrer: `eliteroute.mx`, `www.eliteroute.mx`, `*.vercel.app` |
| `GOOGLE_MAPS_API_KEY` | the server (`/api/maps`, checkout) | none — server calls send no referrer |

They must not hold the same key. A referrer-restricted key fails server-side with
`REQUEST_DENIED: API keys with referer restrictions cannot be used with this API`
— which is exactly what happens locally when `GOOGLE_MAPS_API_KEY` is set to the
browser key.

## Analytics (GA4)

One variable, and the site works with it empty:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Leave it unset and nothing loads — no script request, no cookie, and the
privacy notice's analytics paragraph is the only thing that would be ahead of
reality. Set it in the Vercel project (Production and Preview) to switch
measurement on; no code change needed.

The tag starts with `allow_google_signals` and
`allow_ad_personalization_signals` off, so GA4 measures and does not build
advertising audiences. That is what the privacy notice promises, so if you
ever turn those on for remarketing, update `app/[lang]/privacidad/page.tsx`
and its English twin in the same change.

Funnel events, named in Spanish because the owner reads them in the GA4
console: `cotizacion_iniciada`, `ruta_completada`, `vehiculo_seleccionado`,
`precio_mostrado`, `clic_whatsapp`, `pago_iniciado`, `reserva_pagada`. They
live in `lib/analytics.ts`.

> `.env.example` is not versioned — the `.env*` rule in `.gitignore` covers it
> — so this table is the tracked place where variables get documented.

## WhatsApp payment notifications

When Stripe sends `checkout.session.completed`, the app builds a WhatsApp-ready
message with the payment, customer, route and vehicle details.

Configure either an automation webhook:

```bash
WHATSAPP_NOTIFY_WEBHOOK_URL=https://hook.make.com/...
```

Or configure WhatsApp Cloud API directly:

```bash
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_NOTIFY_TO=525543582919
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
