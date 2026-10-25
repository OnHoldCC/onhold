# singleSpark React component library

## Shared transaction and form controls (0.5.0)

`/ui` now includes the complete OnHold transaction progress dialog, compact stage timings, expandable full records, duration tracing, tag input, media upload, copy-link fields, live data values, contract address disclosures and GitHub links. Their styles ship in `/ui.css`; host APIs, translations, wallet execution and recovery remain outside the library. See [OnHold extraction and integration](docs/component-audit/onhold-controls.md) for boundaries and examples. The gallery includes interactive examples and generated prop tables.

Closing the progress dialog only dismisses its view. Its caller keeps the pending transaction and receipt checks alive, and supplies `done` only after confirmed completion. Default labels remain English and every user-facing progress label can be overridden.

The gallery follows an Ant Design-style documentation layout: categories on the left, interactive examples, usage code, TypeScript APIs and design tokens on the right. The former Paid series now uses SingleSpark names.

- [Button](http://localhost:4173/#/components/button), [Modal](http://localhost:4173/#/components/modal), [WalletDialog](http://localhost:4173/#/components/wallet-dialog), [Tabs](http://localhost:4173/#/components/tabs) and [List](http://localhost:4173/#/components/list).
- [Theme configurator](http://localhost:4173/#/foundations/theme), [Colors](http://localhost:4173/#/foundations/colors), [Typography](http://localhost:4173/#/foundations/typography), [Icons](http://localhost:4173/#/foundations/icons) and [Spacing and motion](http://localhost:4173/#/foundations/spacing).

The catalog contains 45 SingleSpark primitive, wallet and Web3 pages, 74 SingleSpark business compositions and 64 Backers entries. Ten of the 183 entries remain explicit unverified placeholders without production integration. Themes, icons and design variables have shared exports.

## Icons and loading states (0.4.0)

- [ChainIcon](http://localhost:4173/#/components/chain-icon) and [TokenIcon](http://localhost:4173/#/components/token-icon) have separate previews and exports. SOL, ETH, Base, OP Mainnet, BNB Chain, USDC and USDT use official artwork; BNB has a separate asset mark.
- [Loading](http://localhost:4173/#/components/loading) provides spinners, dots and region overlays. [Skeleton](http://localhost:4173/#/components/skeleton) provides eleven layouts with shimmer, pulse, static states and child composition.
- Examples switch between content, loading overlays and skeleton composition. Lists, wallet lists, statistics, trades, charts and quotes also use internal skeletons.
- TokenIcon no longer accepts `chain`; it represents the asset only. TokenIdentity combines distinct asset and network markers. Root and `/icons` compatibility exports remain, alongside `/chain-icons` and `/token-icons`.

## Web3 components (0.3.0)

This release added 17 components, 17 chain/token SVGs and 14 UI icons.

- [Trading panel](http://localhost:4173/#/components/token-trade-panel): Pump.fun-inspired buy/sell forms and amount presets, with separately exported amount, slippage, quote and status controls.
- [Candlestick chart](http://localhost:4173/#/components/candlestick-chart): data-driven candles/lines, volume, periods, zoom and a data table.
- [Statistics grid](http://localhost:4173/#/components/stat-grid) and separate chain and token identities.
- Buttons add icon/iconPosition, Tabs add icons, and ListItem adds selected/disabled states with shared focus, pressed, error and reduced-motion behavior.

See [Web3 integration](docs/component-audit/web3-integration.md) for types, examples and boundaries. Trading demonstrations use simulated data; the host provides real quotes, wallet signatures and confirmations.

## Development and usage

```sh
npm install
npm run build
npm run dev
```

Open `http://localhost:4173`. Rebuild after TSX or token changes and refresh the page. `npm run typecheck` checks the library and gallery; `npm test` covers catalog entries, themes, icons, asset paths and static-server boundaries. The workspace starts the gallery on port 4174 to avoid conflicts.

Other projects can install this local directory or a tarball created with `npm pack`. React and React DOM 18–19 are peer dependencies.

Production consumers can use `/primitives` (buttons, fields, money), `/assets` (separate network/token icons and asset amounts), `/feedback` (loading and skeletons), and `/stats` (metrics and sparklines). Existing root and `/singlespark` imports remain compatible. Shared chunks keep exported components identical across entrypoints.

Use `AddressLink` from `/ui` for CA and Vault addresses: the short address and copy icon form one button, with shared hover, focus and copy feedback. An optional `href` adds a separate explorer link; `label` and `onError` let the host bind translations and error notifications.

`npm run build:package` builds the React package, declarations and styles without regenerating the gallery or its tracked preview assets. The frontend's dev, build, test and typecheck commands run this step for the explicit local package dependency. Use the full `npm run build` in this repository when updating the standalone gallery.

`SingleSparkAssetAmount` accepts an already formatted amount and an explicit `{ symbol, name, icon, decimals }` asset. It does not convert raw integers or infer transaction currency from a network name. ARC native USDC gas (18 decimals), Argus USDC settlement (6), SOL (9) and WETH (18) must retain their owning protocol's units. Chain artwork and token artwork have separate registries.

```tsx
'use client';
import { useState } from 'react';
import {
  SingleSparkTheme, SingleSparkButton, SingleSparkTabs,
  SingleSparkList, SingleSparkListItem, SingleSparkIcon,
} from '@singlespark/component-atlas';
import '@singlespark/component-atlas/singlespark.css';

export function Example() {
  const [tab, setTab] = useState('Overview');
  return (
    <SingleSparkTheme mode="dark">
      <SingleSparkTabs values={['Overview', 'Activity']} value={tab} onChange={setTab} />
      <SingleSparkList>
        <SingleSparkListItem title="Project" description="Your first spark" trailing="Active" />
      </SingleSparkList>
      <SingleSparkButton variant="primary" onClick={() => console.log('create')}>
        <SingleSparkIcon name="Launch" /> Create project
      </SingleSparkButton>
    </SingleSparkTheme>
  );
}
```

Components support native attributes and controlled state without requiring Next.js, Tailwind or Ant Design. The documentation structure takes inspiration from Ant Design while component visuals retain their reference styles.

## Design foundations

```tsx
import { SingleSparkTheme, singleSparkFonts } from '@singlespark/component-atlas';

<SingleSparkTheme
  mode="light"
  tokens={{ primary: '#1677ff', 'primary-hover': '#4096ff',
    'primary-text': '#fff', 'font-sans': singleSparkFonts.inter }}
>
  {children}
</SingleSparkTheme>
```

- `mode`: dark, light or system, with nested scopes. Dark preserves the reference appearance; light is a reusable extension.
- `tokens`: semantic colors, typography, spacing, corners and motion, consumed through `--ss-*` variables.
- `/tokens` exports singleSparkColors, singleSparkFonts, singleSparkSpacing, singleSparkRadii, singleSparkMotion and singleSparkTypeScale.
- `/icons` exports SingleSparkIcon and singleSparkIconNames. Icons support size, color and title; untitled icons are decorative.
- Arial uses the system font. Geist Mono, KHTeka and Inter ship locally. Source records remain in `docs/component-audit/`.

`/singlespark.css` includes themes and fonts. Import `/theme.css` for design variables alone or `/backers.css` for Backers styles.

## Source organization

| Location | Responsibility |
| --- | --- |
| `react/singlespark-primitives.tsx` | Buttons, tabs, inputs, lists, pagination and disclosures |
| `react/singlespark-modal.tsx`, `singlespark-wallet.tsx` | Dialogs, wallet buttons, options, lists, connection status and picker |
| `react/tokens.ts`, `theme.tsx`, `icons.tsx` | Design variables, theme provider and shared icons |
| `react/singlespark-home.tsx`, `singlespark-business.tsx` | Homepage and business compositions |
| `react/backers.tsx` | Backers primitives and business components |
| `docs-app.tsx`, `styles.css` | Gallery and interactive examples |
| `dist/` | ESM, TypeScript declarations and distributable styles |

Builds generate API tables from TypeScript props and theme CSS from tokens.ts. Static asset URLs allow bundlers such as Vite to package fonts, images and chart snapshots.

## Sources and boundaries

References are UsePaid and Backers. Observed UsePaid surfaces use custom Next.js/React UI with Tailwind compilation characteristics, Reown AppKit wallet UI and official Lightweight Charts. See [technology observations](docs/component-audit/paid-tech-stack.md). Source domains, public snapshots and third-party licenses retain their original names.

The component API is this library's design, not a claim about private source code. Hosts integrate wallets, authentication and transactions. Charts default to static data. Nine authenticated flows and one unavailable profile remain unverified placeholders.

## Maintenance

Repository: <https://github.com/SingleSparkfun/SingleSparkUiUx>. The product and backend live in sibling SingleSparkFront and SingleSparkBackend repositories.

Implementations are split into 296 independent TSX files under `react/components/<category>/<Component>.tsx`, including public and internal components. The 183 catalog entries are a different count. [source-index.json](docs/component-audit/source-index.json) maps implementations; tests verify that indexed files contain actual implementations rather than forwarding-only stubs.

Categories include primitives, modal, wallet, trade, stats, chart, feedback, assets, theme, business, home and backers. `react/*.shared.tsx` retains shared types, constants and helpers. Existing barrel exports, package entries and CSS paths remain compatible.

For new components: create the implementation, update category and root exports, add catalog examples and API documentation, update the source index, then run build, typecheck and tests. Distinguish chain, token and UI icons; record official sources in `assets/web3/sources.json`. Compose business components from primitives without coupling to product APIs, custody keys or backend configuration.

The one-time split migration is complete; its rewriting script has been removed. Maintain component implementations and the source index directly. Backers components import `assets/backers/snapshot.json` directly; do not maintain a second TS data literal. Status and all six candle intervals live in that snapshot; unused standalone duplicates were removed. Original response files with distinct source artwork URLs remain as provenance.

## Project-common UI

Product controls and their CSS live in `react/components/ui` and are exported through `@singlespark/component-atlas/ui`. Import `@singlespark/component-atlas/ui.css` after the shared theme. This includes Button, Input/Textarea/Checkbox/RangeInput, Select, NetworkSelector, SegmentedTabs, SegProgressBar, Dialog/DetailDialog, BottomNavigation, BottomSheet, NavigationIndicator, Notice, DataTable, EmptyState, Skeleton, Sparkline and StatTile. Notice composes SingleSparkNotice with an optional icon and translated close button; the host owns live announcements, placement and dismissal timing. Pass labels and values as props; the package must not import frontend routing, translation providers, wallet state or chain execution. Application bindings remain in the frontend. Existing frontend integration tests exercise the exported controls.

`npm run build:package` builds declarations, JavaScript and CSS without regenerating the gallery.

Business notifications reuse `NotificationFrame` from `@singlespark/component-atlas/singlespark` inside a `.u-business` scope, with the shared theme and `singlespark.css`. Pass `title`, `children`, optional `actions` (shared `SingleSparkButton` controls), `onClose` and translated `closeLabel`. The message slot uses the existing notification frame without payout demo amounts or imagery; the original `step`-based launch preview remains compatible. Use `variant="toast"` for a compact dark message and `.ub-notification-stack` for centered placement. The application owns alert announcements, dismissal timing and recovery callbacks. Inline `Notice` is not the floating business notification.

`BottomNavigation` accepts a translated `label`, optional `className`, and up to five `items` with `id`, `label`, `icon`, optional `href`, `active`, `expanded`, and `onClick`. Use actual `href` values for destinations, and preserve modified clicks when binding a client router. A button with `expanded` opens overflow navigation. Positioning and page clearance belong to the host layout; shared item styles include touch targets and bottom safe-area padding. One soft, decorative droplet follows the selected icon in 240ms; labels remain stationary. Optional `overflow` supplies `title`, `closeLabel`, `items`, `onClose` and `footer`. It composes BottomSheet above the bar and moves the same droplet up to the active overflow icon. Keep overflow open when switching its routes; closing returns the droplet to the active bar item (More for overflow routes). Route changes are immediate; rapid changes retarget the same indicator. Layout/scroll changes reposition without animation, and prefers-reduced-motion disables travel. Use regular Phosphor line icons for desktop and mobile destinations. Both BottomNavigation and SingleSparkSidebar reuse NavigationIndicator: a liquid surface with a large rounded head, smaller trailing droplet and a curved connecting neck; the head travels in 240ms, the tail catches up by 420ms, and two small settling waves finish by 620ms. Desktop navigation rows have no selected or hover background. Rapid selections cancel and retarget from the current head and tail positions. Reduced motion disables travel and deformation.

`BottomSheet` accepts `open`, `onClose`, `title`, `closeLabel`, `children` and an optional `bottomInset` for navigation clearance. It portals a bounded, scrollable sheet to the document body and reuses Dialog's focus containment/restoration, scroll lock, Escape and backdrop dismissal. Use `app-navigation-list` on a child nav for single-column overflow links. The frontend component catalogue includes live examples and source for both controls.

`NavigationIndicator` accepts an active icon `targetRef`, an optional `clipSelector` (default `nav`), `className` and `zIndex`. It observes navigation layout and scroll without rerendering for position changes. Three static head, tail and neck layers use transform-only Web Animations keyframes, so travel does not need JavaScript frame callbacks or SVG filter repaints while route content renders. Bounds stay fixed during travel and shrink on arrival. Rapid selections sample the current animation time before retargeting; reduced motion and browsers without Web Animations snap to the destination. Both `/ui.css` and `/singlespark.css` include its styling.

`/ui` exports `TokenDetailLayout`, `TokenDetailHeader`, `TokenPluginPanel`, `VaultOverview` and `RevenueAllocation` for shared token details and compact Vault dialogs. Callers supply verified data, translated labels, actions and record views; these components do not read networks or sign transactions. Rules and contract details use a closed native disclosure. Styles ship through `/ui.css`.

`LaunchWizard` provides the Pons-inspired two-step launch page: a step indicator, rounded form card, responsive preview column, Back/Continue actions and final submit. Pass exactly two `steps`, each with `label`, `title`, optional `description` and `content`; pass `title`, `preview`, `nextLabel`, `backLabel`, `submitLabel` and `onSubmit`. Continue validates only the active information fields and never calls `onSubmit`. Inactive fieldsets are hidden and disabled; values remain mounted when navigating Back. The preview may be a node or a function of the current step. `disabled` locks navigation and submission. Wallet checks, platform validation, transaction encoding and recovery remain with the host.

`PluginChoiceCard` combines a labelled checkbox, icon, title, description and selected-only settings slot. The frontend uses it for optional plugin selection and weight inputs. Launch styles include local Nunito 600/800 fonts, rounded inputs, green actions, compact token identity previews and a single-column narrow layout. Nunito is redistributed under the SIL Open Font License in `assets/fonts/Nunito-OFL.txt`; font files were obtained from the public Pons creation-page assets. These components import through `/ui` and `/ui.css`; existing `LaunchFormLayout` and `TokenLaunchPreview` APIs remain available.

`NetworkSelector` accepts controlled `value`, `options` (`value`, `label`, optional image URL `icon` and `disabled`), `onChange`, `ariaLabel`, and translated `scrollLabels`. Its row reuses SegmentedTabs and ScrollRail; `compact` reuses Select. Disabled choices remain visible and are skipped by keyboard selection. `locked` temporarily blocks interaction during wallet work while keeping enabled network icons in color; it does not change option availability. The host supplies availability, exact chain IDs and an optional image-error handler; the UI package does not authorize chains or switch wallets.


Shared product layouts are exported from `@singlespark/component-atlas/ui`: `LaunchFormLayout`, `TokenLaunchPreview`, `TokenCardLayout`, `TokenDetailLayout` and `TokenDetailHeader`. Their styles ship in `ui.css`. Applications supply translated labels, validated media/link slots, formatted financial values, form fields and action callbacks; the layouts have no wallet, chain RPC, launch permission or sample-balance defaults. Existing `arc-create-*` and discovery class names remain compatible with application integrations and source previews.


`CollectibleCard` is a presentation-only collectible frame with supplied artwork, grade and metadata slots. Its frame, pointer tilt and one-shot hover sheen are adapted from the user-supplied FWA `AssetCard`; the implementation is local and has no dependency on FWA or Next.js. The sweep plays once per mouse entry, stays idle while the pointer remains inside, and resets on leave. Touch does not capture gestures or play the sweep, and reduced motion disables tilt and the sweep. Optional labelled card flipping shows supplied information on the reverse, with the hidden face excluded from the accessibility tree. Reduced motion changes sides immediately. NFT artwork, rarity and financial data remain frontend bindings.

`CollectibleFan` composes supplied card content into a circular fan of five visible cards by default, bounded to eight. Every card uses the same angular spacing and radius, including the selected card in an even-sized hand. A content render function receives the flipped state; a native button toggles the information side, and browsing resets it. Hover or keyboard focus raises a card; arrow controls and keyboard left/right cycle through the supplied batch. It measures card content to keep its controls below the fan and disables transitions for reduced motion. It is a local shared component, not an imported FWA carousel. Applications provide card identity, labels and content, and own fetching and pagination; the component has no NFT, wallet or RPC dependency.

`CollectibleCarousel` provides native touch scrolling and centered scroll snapping for supplied card content, with keyboard and bounded arrow controls. It respects reduced motion, announces the visible card and handles empty collections. `CollectibleMarquee` supplies a slow, seamless right-to-left artwork strip with an inert duplicate, hover/focus pause and a translated pause/resume control. Reduced motion keeps a static, horizontally scrollable list. These card components are exported through `@singlespark/component-atlas/ui`; eligibility, random selection and confirmed results stay in the host feature. `SingleSparkIcon` includes the reusable `key` glyph; reward features supply gold/silver colors and visible labels.

`CollectibleReel` is the shared opening animation: `spinning` controls the waiting loop and `resultId` comes from the host's verified result. The reel slows onto that supplied card and announces its label, without generating a reward or advancing business state on a timer. Reduced motion skips scrolling. Wallets, eligibility, payment, randomness and mint finality stay outside the UI package.

`CollectibleMarquee` fills wide viewports by repeating complete cycles at a fixed 24px gap; filler copies are inert and hidden from assistive technology. Each cycle uses the same spacing at its seam and the same travel speed. `CollectibleCard` sizes itself from its visible face, so long provenance on the back cannot stretch an artwork-only front.

`Button` and `SingleSparkButton` share one loading behavior: pass `loading={busy}` and keep the normal action label. The last idle content remains visible while loading, followed by one decorative spinner. Loading disables repeat clicks and sets `aria-busy`; the label updates again when loading finishes. Transaction recovery and network/funding checks remain caller-owned. `ProcessSteps` accepts optional descriptions and elapsed labels alongside caller-controlled pending/active/complete/error states; it never advances or infers transaction success on a timer.

## Content-only Coming soon overlay

Import `ComingSoonOverlay` from `@singlespark/component-atlas/ui` and its styles from `@singlespark/component-atlas/ui.css`:

```tsx
<div style={{ minHeight: 320 }}>
  <ComingSoonOverlay title="Coming soon" description="This feature opens soon.">
    <StaticFeaturePreview />
  </ComingSoonOverlay>
</div>
```

The host supplies `title`, `description` and optional preview `children`, and sets the region's minimum height. The shared component owns the blur, centered notice, theme colors and inert preview. It remains inside that region; it does not portal to the document body, lock scrolling or trap focus, so surrounding navigation stays usable. It does not suppress child effects or authorize actions: unreleased features should pass static preview content rather than mount wallet or data workflows. The frontend catalogue includes a live example under Dialogs & popovers.

Home analytics metrics and summary values accept `null` to reserve an unknown number with the shared skeleton; a confirmed `"0"` remains readable. Home payment previews use the same convention for unknown Claim rewards. `RevenueAllocation` from `/ui` supplies the shared thin-ring allocation display, responsive aligned legend and two-decimal percentage labels with exact percentages in hover titles. Segment geometry retains the supplied percentages; it never changes allocation policies.

`TransactionProgressDialog` composes the shared focus-managed DetailDialog and read-only ProcessSteps. Callers supply verified transaction status, steps, elapsed time and actions; the UI package never reads a wallet or RPC.
