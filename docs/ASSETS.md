# Image assets

**Originals (kept, never shipped):** `source-images/products/*.png` (six 1254 × 1254 product photos), `source-images/brand/` (emblem, old collection poster, old OG placeholder).

**Shipped variants:** `public/products/<slug>-{400,640,960,1254}.{webp,avif}`, `public/products/<slug>-detail-380.*` (ingredient area of each photo), `public/brand/auvdahl-emblem-{400,640,960,1254}.*`, `public/og-image.jpg` (1200 × 630).

Regenerate after replacing an original (needs Python + Pillow with WebP and AVIF): `python3 scripts/optimize-images.py`. Variants are never upscaled; the script skips any width larger than the source.

**Real resolution:** the six product photos are 1254 × 1254 px. That is sharp up to about 625 CSS px wide on a 2× screen (phones, MacBooks); on the desktop hero and product page at 2× the browser enlarges them by roughly 1.1–1.3×. Larger originals (2000 px or more) would remove that.

**Used by the site:** `<ProductImage slug="…">` (src/components/ProductImage.tsx) builds the `<picture>` with AVIF/WebP `srcset`, `sizes`, width/height and lazy/eager loading.
