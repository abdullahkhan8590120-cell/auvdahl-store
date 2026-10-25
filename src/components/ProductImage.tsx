// Responsive product photo. Source files are 1254x1254 originals; variants (400/640/960/1254) are never upscaled.
// The photo is square, so a square box with object-contain shows it uncropped; width/height prevent layout shift.
const WIDTHS = [400, 640, 960, 1254] as const
const set = (slug: string, ext: 'avif' | 'webp') => WIDTHS.map(w => `/products/${slug}-${w}.${ext} ${w}w`).join(', ')
export const productImageSrc = (slug: string, w: (typeof WIDTHS)[number] = 1254) => `/products/${slug}-${w}.webp`
interface Props { slug: string; name: string; sizes: string; eager?: boolean; className?: string }
export default function ProductImage({ slug, name, sizes, eager = false, className = '' }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={set(slug, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set(slug, 'webp')} sizes={sizes} />
      <img
        src={productImageSrc(slug, 960)} srcSet={set(slug, 'webp')} sizes={sizes}
        width={1254} height={1254} alt={`AUVDAHL ${name} eau de parfum, 50 ml`}
        loading={eager ? 'eager' : 'lazy'} decoding={eager ? 'sync' : 'async'} {...(eager ? { fetchPriority: 'high' as const } : {})}
        className={`aspect-square h-auto w-full object-contain ${className}`}
      />
    </picture>
  )
}
