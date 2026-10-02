# PRAVAHA

**Scan it. Know its worth. Find the right recycler.**

A vernacular, offline-tolerant marketplace that turns informal e-waste collection into a transparent, traceable, and more profitable formal recycling journey.

Built for **SIH26229** — Ministry of Mines / JNARDDC · Software · Clean & Green Technology.

## What’s included

| Page | Path | Description |
|------|------|-------------|
| Landing | `index.html` | Public marketing surface — hero, 7-step pipeline, impact counters, collector & recycler panels |
| Collector App | `pages/collector.html` | Mobile-first PWA-style demo of the full Scan → Value → Match → Arrange → QR Handover → Ledger flow |
| Recycler Portal | `pages/recycler.html` | Desktop-first portal — incoming requests, quote/accept/counter, materials & availability |
| Admin Dashboard | `pages/admin.html` | Program overview metrics, live funnel, material mix (demo data labelled) |

## Design system (from PRD)

- **Primary (Go / Formal):** `#0E7C66`
- **Surface:** `#F5F2E9`
- **Caution:** `#E0A458`
- **Hazard:** `#B3261E`
- **Info:** `#0891A8`
- Typography: Inter / Noto Sans
- Icon-first, 44px+ touch targets, AA+ contrast
- Hindi + Marathi + English with language toggle on every surface
- Voice output via Web Speech API on collector flows

## How to run

Open `index.html` in a browser, or serve the folder:

```bash
cd kabadiwala-connect
python3 -m http.server 8080
# → http://localhost:8080
```

## Demo walkthrough (Collector)

1. Open **Collector App**
2. Tap **Scan & Sell** → Capture → Confirm category (or override)
3. Enter weight on the keypad
4. See Fair Price Radar (indicative range)
5. Browse matched recyclers → Request quote
6. Choose Pickup / Self-drop → Generate QR passport
7. Simulate recycler scan → Ledger updates

Language toggle (EN / हिं / मर) works on all pages. Voice buttons speak prices/instructions in the selected language when supported by the browser.

## Out of scope (per PRD)

Nationwide network, blockchain, custom payment gateway, full ERP, predictive pricing, native Android build, IoT — none of these are required to demonstrate the core pipeline.
