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
advertising audiences. **The privacy notice states this as a promise, in three
separate places**, and all three have to move together — see "Google Ads"
below before touching either flag.

Funnel events, named in Spanish because the owner reads them in the GA4
console: `cotizacion_iniciada`, `ruta_completada`, `vehiculo_seleccionado`,
`precio_mostrado`, `clic_whatsapp`, `pago_iniciado`, `reserva_pagada`. They
live in `lib/analytics.ts`.

> `.env.example` is not versioned — the `.env*` rule in `.gitignore` covers it
> — so this table is the tracked place where variables get documented.

## Google Ads

Nothing here is wired yet: the site carries the GA4 tag (`G-…`) and **no Ads
tag** (`AW-…`). These are the two steps to take when advertising starts, in
order. Step 1 is free and touches no code; step 2 costs a privacy-notice
change and should not be done casually.

Console menu paths were accurate in September 2026 and Google moves them
regularly — trust the concepts, not the exact clicks.

### 1. Import GA4 conversions into Ads — no code

**Before you start, the funnel events must have fired at least once.** GA4
only lets you mark an event as a key event after it has arrived, and Ads can
only import key events. As of September 2026 only `page_view` had ever fired,
so this step is blocked until real traffic converts. Do not fabricate test
events to unblock it: they land in the owner's reports and stay there.

1. **Mark the key events.** GA4 → Admin → Data display → Events, then star
   `reserva_pagada`, `pago_iniciado` and `clic_whatsapp`.
2. **Link the accounts.** GA4 → Admin → Product links → Google Ads links.
   Needs Editor on the GA4 property and admin on the Ads account.
3. **Import.** Google Ads → Goals → Conversions → New conversion action →
   Import → Google Analytics 4 properties → Web.

Then set each one up deliberately, because this decides what Google buys:

| event | role in Ads | why |
|---|---|---|
| `reserva_pagada` | **Primary** | The only one that is money in the bank |
| `pago_iniciado` | Secondary | Useful to read, must not drive bidding |
| `clic_whatsapp` | Secondary | Same — see below |

**Making `clic_whatsapp` primary is the mistake to avoid.** Smart bidding buys
whatever the primary conversion rewards, so a primary WhatsApp click teaches
Google to find people who message and never pay. Keep it secondary until
there is a way to tie a WhatsApp conversation back to a paid booking.

Two things about the imported data:

- `reserva_pagada` already sends `value` and `currency: "MXN"` with the
  **amount actually charged**, plus the folio as `transaction_id`, so choose
  "use the value from the event" and let the dedup work.
- The event is not named `purchase`, on purpose — the owner reads these
  reports in Spanish. Ads imports any event name, so this costs nothing here;
  it only means GA4's built-in Monetization reports stay empty.

Imported GA4 conversions arrive with a delay and are attributed by GA4's
model, not the Ads tag. If same-day numbers ever matter more than keeping the
code untouched, the alternative is an `AW-` tag fired next to `track()`.

### 2. Remarketing — code AND privacy notice, in the same commit

Remarketing needs the two flags in `app/_components/Analytics.tsx` turned on:

```js
allow_google_signals: false,            // → true
allow_ad_personalization_signals: false // → true
```

**The site currently promises the opposite in three separate files.** Flipping
the flags without changing all three leaves a false statement in a legal
document:

| file | what it says |
|---|---|
| `lib/legal.ts` | the `Google Analytics` entry in `encargados` — both `para` and `forWhat` |
| `app/[lang]/privacidad/page.tsx` | the cookie paragraph: "las señales de publicidad y la personalización de anuncios están desactivadas" |
| `app/[lang]/privacy/page.tsx` | the English twin of that paragraph |

The rule is one commit: flags and all three texts, or neither. Never "flip it
now and update the notice later" — in between, the site is collecting for a
purpose it tells visitors it does not collect for.

Also worth knowing before spending the effort: Google requires a minimum
audience size before a remarketing list can serve at all (historically around
100 users in 30 days for Display and far more for Search — check the current
figure, it moves). At the traffic this site had in September 2026, a list
would not have filled. Remarketing is a step for later, not for launch.

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
