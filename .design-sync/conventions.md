# placeastro conventions

placeastro is a dark-only astronomy image catalog. Its UI is shadcn/ui-style React components styled with Tailwind v4 utility classes over CSS custom-property tokens.

## Setup: always wrap in `DarkTheme`

The product is dark-only (`<html class="dark">`). The tokens (`--background`, `--primary`, ...) only take their dark values under `.dark`. Without it everything renders in an unintended light palette, and ghost/link buttons become near-invisible.

```jsx
const { DarkTheme, Button } = window.Placeastro;
<DarkTheme>
  <App />
</DarkTheme>
```

`DarkTheme` adds `dark` to `<html>` and paints `--background` / `--foreground` / `--font-body` on its own box. Wrap the whole tree once, at the root.

## Styling idiom

- **Tailwind utilities are precompiled.** Only classes that already appear in `_ds_bundle.css` exist; there is no JIT. Before using a class, grep `_ds_bundle.css`. If a class is missing, use an inline `style` with a token instead, e.g. `style={{ background: 'var(--card)' }}`.
- **Tokens** (`var(--name)`): `--background` `--foreground` `--card` `--card-foreground` `--primary` (amber, the accent) `--primary-foreground` `--secondary` `--secondary-foreground` `--muted` `--muted-foreground` `--accent` `--destructive` `--border` `--input` `--ring` `--radius`.
- **Fonts**: `--font-body` (Outfit, the default), `--font-display` (Crimson Pro, for headings and the wordmark, usually italic), `--font-mono` (JetBrains Mono). Display heading class: `font-[family-name:var(--font-display)] italic tracking-tight`.
- **Utility families that exist**:
  - colour: `bg-background` `bg-primary` `bg-secondary/50` `text-primary` `text-muted-foreground` `text-foreground/70` `text-foreground/90` `text-destructive` `border-border/50`
  - layout: `flex` `flex-col` `flex-wrap` `grid` `grid-cols-1` `grid-cols-2` `md:grid-cols-4` `items-center` `justify-between` `justify-center` `mx-auto` `max-w-5xl` `max-w-lg` `max-w-sm` `max-w-xs`
  - spacing: `gap-1` `gap-1.5` `gap-2` `gap-2.5` `gap-3` `gap-4` `gap-6` `gap-10` `gap-12` `gap-20` `p-6` `px-4` `px-6` `px-8` `py-2` `py-6` `py-8` `py-10` `py-12` `py-20` `mb-2` `mb-4` `mb-8` `mb-10`
  - type: `text-xs` `text-sm` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-6xl` `font-medium` `font-semibold` `font-bold` `tracking-tight` `tracking-widest` `leading-relaxed`
  - shape: `rounded-md` `rounded-lg` `rounded-xl` `rounded-full` `border` `border-b` `border-t` `aspect-square` `object-cover` `overflow-hidden`
- **Page chrome**: the app container is `mx-auto max-w-5xl px-6`. Section dividers are `border-b border-border/50`. The decorative background layers are `<div className="star-field" />`, `<div className="nebula-glow" />` and `<div className="grain-overlay" />` (fixed, behind content; put the content in `relative z-10`).

## Components

- `Button`: `variant` = default | secondary | destructive | outline | ghost | link, `size` = default | sm | lg | icon, `asChild`.
- `Carousel` + `CarouselContent` / `CarouselItem` / `CarouselPrevious` / `CarouselNext` (Embla, `opts` passes Embla options). The prev/next buttons sit outside the slide (`-left-12` / `-right-12`), so leave horizontal room (e.g. `px-16`).
- `Tooltip` + `TooltipTrigger asChild` / `TooltipContent` (the provider is built in; content is portalled with an amber `bg-primary` surface).
- `Gallery` (`imageUrls: string[]`): an autoplaying square image carousel. `CopyToClipboard` (`text`): a clipboard icon.

Per-component API and examples: `components/<group>/<Name>/<Name>.prompt.md` and `.d.ts`.

## Example

```jsx
const { DarkTheme, Button, Gallery } = window.Placeastro;
<DarkTheme>
  <main className="mx-auto max-w-5xl px-6 py-12">
    <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl italic tracking-tight">M16 — Eagle Nebula</h1>
    <p className="mb-8 text-sm text-muted-foreground">NASA / ESA</p>
    <div className="flex flex-col items-center gap-6">
      <Gallery imageUrls={urls} />
      <Button variant="outline">Copy URL</Button>
    </div>
  </main>
</DarkTheme>
```
