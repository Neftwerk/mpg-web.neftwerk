/**
 * The app-wide deco pattern.
 *
 * Rendered as its own fixed layer rather than as a `background-image` on
 * `<body>` for two reasons:
 *
 *  - `background-attachment: fixed` is unreliable on iOS Safari, where it
 *    degrades to `scroll`. A fixed element is honoured everywhere, so the
 *    pattern stays put while the page scrolls over it.
 *  - The source is an SVG, not `deco.jpg`. The JPEG is 360x640, so on any
 *    viewport wider than a phone it had to be upscaled several times over —
 *    that is the blur. Vector art rasterises crisply at whatever size and
 *    device pixel ratio it is painted at.
 *
 * The art is `deco-pattern-tile.svg`, the seamless mirror of the source
 * pattern. The source draws its lattice across only the upper half of its
 * canvas, so `cover` left the lower half of the screen bare; the tile repeats
 * down a page of any height instead. Sizing it `100% auto` keeps the pattern's
 * horizontal gradient spanning the viewport exactly once, which is what stops
 * the repeat showing a colour break.
 *
 * `-z-10` puts it behind page content but still above the body background
 * colour, which propagates to the canvas and shows through the pattern's 0.3
 * opacity.
 */
export function DecoBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-[url('/images/deco-pattern-tile.svg')] bg-[length:100%_auto] bg-top bg-repeat-y"
    />
  );
}
