# design-sync notes

## Setup (fresh clone)

- Stage the converter into `.ds-sync/` (skill §2.4) and install its deps there.
- Run `bash .design-sync/build.sh` (= `cfg.buildCmd`) before the converter. It symlinks `.design-sync/ds-package/node_modules` → `apps/web/node_modules` (so ts-morph finds `@types/react`) and emits `.d.ts` into `ds-package/types/` (gitignored).
- Build the reference: `cd apps/web && npx storybook build -c .storybook -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference"`.
- Converter: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules apps/web/node_modules --out ./ds-bundle` (entry comes from `cfg.entry`).

## Fixes

- [GENERAL] No dist/.d.ts: `@placeastro/ui` exports TS source, and apps/web components are not a package. The converter found 0 exports → `.design-sync/ds-package/` is a facade package (`index.ts` re-exports `packages/ui/src` + the API-free apps/web components; `tsconfig.json` emits declarations). esbuild bundles the TS source directly (same source vite compiles).
- [GENERAL] `--node-modules apps/web/node_modules`, not `packages/ui/node_modules`: apps/web has every runtime dep of both packages.
- [GENERAL] Story titles are kebab-case autotitles (`ui/button`, `components/gallery`) → `cfg.titleMap`. Source files are kebab-case, so the story-import rule-2 filename match never fires → `cfg.storyImports.shim` lists each component file so stories render the bundle, not a source copy.
- [GENERAL] `.storybook/preview.tsx` imports `globals.css`, whose `@import "tailwindcss"` esbuild can't resolve → the decorator bundle fails. Replaced with `cfg.provider: DarkTheme` (`ds-package/dark-theme.tsx`): adds `dark` to `<html>` like preview.tsx does and paints `--background`/`--foreground`/`--font-body` (the card template forces `body{background:#fff}`, which otherwise shows light surfaces and makes ghost/link buttons invisible). The QueryClient and app-container decorators are not reproduced; none of the synced components needs them.
- [GENERAL] CSS comes from `[CSS_FROM_STORYBOOK]` (compiled Tailwind of the storybook build). Only classes used in `apps/web/src` + `packages/ui/src` exist. Fonts are Google Fonts via a remote `@import` (`[FONT_REMOTE]`), the same URL as index.html.
- Excluded by user decision: `PlaceImage`, `PlaceImageList` (`titleMap: null`). They fetch through the oRPC client (`@/lib/client`), which can't reach the API in claude.ai/design, and their stories depend on Storybook's module mock. `PlaceImageUploadForm` has no story.
- Carousel `NavigatesToLastSlide` and Tooltip `OpenOnHover` are play-driven. Owned previews (`previews/Carousel.tsx`, `previews/Tooltip.tsx`) express the end state through props: `opts.startIndex: 2` / `open: true` (+ 48px top room so Radix doesn't flip the tooltip below). Tooltip card is `cardMode: single`, `primaryStory: OpenOnHover`.
- Tried and reverted: regrouping the apps/web components from `components` to `app` via a docsMap `category` stub. The story-title group wins over the doc category.
- Expected framing difference on every sheet: storybook wraps stories in `mx-auto max-w-5xl px-6 py-6`; previews don't.

## Re-sync risks

- `ds-package/index.ts` enumerates the apps/web components by hand. A new API-free component with a story needs a line there, plus `titleMap` and `storyImports.shim` entries. A component with a story but no facade export is dropped as `[TITLE_UNMAPPED]`.
- New `packages/ui` components are picked up through `export *`, but still need `titleMap` + `storyImports.shim` entries.
- Owned previews override `NavigatesToLastSlide`/`OpenOnHover` args; if those stories change their slides or content, update the owned files.
- `DarkTheme` is sync-only code shipped on `window.Placeastro`; if the app gets a light theme or a real theme provider, replace it.
- Styling is scraped from the storybook build. Rebuild `sb-reference` whenever `globals.css` or component classes change, or the bundle CSS goes stale.
