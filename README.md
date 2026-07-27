# The Palette · Digital Guest Guides

Four **independent** room guide pages for The Palette homestay (35 Nguyễn Bỉnh Khiêm, Hai Bà Trưng, Hà Nội).

Each room has its own QR code that opens its own page directly — there is no homepage.

## Structure
```
project/
├── dreamy.html        ← QR in #dreamy room opens this
├── playful.html       ← QR in #playful room opens this
├── refined.html       ← QR in #refined room opens this
├── thoughtful.html    ← QR in #thoughtful room opens this
├── food.html          ← ONE shared food guide (all rooms link here)
└── assets/            (css / js — for future images & logo)
```

## Navigation
- Each room page is a standalone entry point (its own QR).
- The "Xem gợi ý quán" button on every room opens the same **food.html**.
- food.html returns to whichever room the guest came from (browser back).

## Run locally (VS Code)
Open this folder → install the **Live Server** extension → right-click any room page (e.g. `dreamy.html`) → *Open with Live Server*.
Open room pages via Live Server (not `file://`) so the `food.html` link works.

## Deploy
It's a static site. Drag this whole folder onto https://app.netlify.com/drop.
Each room's public URL becomes e.g. `https://your-site.netlify.app/dreamy.html` — generate one QR per room pointing at its URL.

## To fill in
Placeholders to replace (Ctrl/Cmd+Shift+F): `YOUR_PAGE` (Facebook), `0000 000 000` / `tel:0000000000` (hotline), `YOUR_PLACE_ID` (Google review), and the restaurant entries in `food.html`.
