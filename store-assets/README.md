# Steady — Google Play store assets

Everything needed for the Play listing. Copy is written to a **general-fitness**
standard (no medical/treatment claims).

| Asset | File | Notes |
|---|---|---|
| Listing copy | `listing.md` | Title (21), short (72), full description; all within limits |
| Data safety answers | `data-safety.md` | No data collected or shared |
| Content rating answers | `content-rating.md` | IARC questionnaire → Everyone |
| App icon (512) | `../public/icons/icon-512.png` | Turtle mark |
| Feature graphic | `feature-graphic.png` | 1024×500 — regen: `npm run gen:feature-graphic` |
| Phone screenshots | `screenshots/*.png` | 6 × 1080×2400: home, level, session, rest, closet, done |
| Offline proof | `offline-proof.png` | Capture from the offline verification run |

Regenerate the graphics anytime:

```bash
npm run gen:icons             # app + maskable icons
npm run gen:feature-graphic   # 1024x500 feature graphic
```

Related docs: [`../docs/play-submission-runbook.md`](../docs/play-submission-runbook.md),
[`../docs/device-checklist.md`](../docs/device-checklist.md),
[`../twa/README.md`](../twa/README.md).
