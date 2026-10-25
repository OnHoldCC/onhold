# Reusable controls extracted from OnHold

The 0.5.0 controls preserve the current OnHold layout and interactions. The package owns presentation, keyboard handling, local media previews and duration recording. The host owns wallet state, authentication, upload APIs, receipts, transaction recovery, chain configuration and translation values.

| Shared control | Preserved behavior |
| --- | --- |
| `TransactionProgressDialog` | Body portal, 480px desktop layout, bounded mobile body, header and footer dismissal, success mark, status announcement, elapsed time and caller-owned recovery actions |
| `TimingSteps`, `TimingDetails`, `InteractionTimings` | Compact stages, active-only wait hints, collapsed full records, localized status and elapsed labels |
| `createInteractionTiming`, `useInteractionTimings` | Result/error propagation, immutable published rows, stage grouping, total durations, frozen completion and no retained wallet payloads |
| `TagsField` | Controlled tags, custom entries, caller-supplied suggestions and limits, Unicode character counting, IME-safe Enter, arrows, Escape and Backspace |
| `TokenMediaUpload` | Image/video choices, authentication callback, local preview, busy lock, timeout, cleanup and optional custom error presentation |
| `CopyLinkField` | Read-only URL, copy/check icon, localized labels, copy failure callback and reset when the URL changes |
| `DataValue` | Unknown/loading distinction, confirmed zero, cached values during refresh, compact values with the full amount available, exact BigInt formatting and supplied unit slot |
| `ContractAddressList` | Closed contract disclosure, supplied network, explorer links and host wallet-action slots |
| `GitHubLink` | Accessible external source link, configurable destination and redistributed Octicons license |

Existing shared controls also receive OnHold improvements that previously existed only in its generated package: list content slots, wallet-brand icon slots, sidebar brand labels, mirrored recorded-history loops, full metric value titles, flipped collectible metadata focus and the licensed pickaxe icon. Rebuilding the library now preserves these features.

## Integration

```tsx
import {TransactionProgressDialog, createInteractionTiming} from '@singlespark/component-atlas/ui';
import '@singlespark/component-atlas/theme.css';
import '@singlespark/component-atlas/ui.css';

<TransactionProgressDialog
  open={visible}
  onClose={() => setVisible(false)}
  title="Stake NFT"
  status={status}
  steps={view.steps}
  details={view.details}
  elapsed={view.elapsed}
  done={verifiedComplete}
  closeLabel="Close"
  labels={{steps:'Transaction steps',details:'Timing details',elapsed:'Elapsed'}}
>
  {recoveryActions}
</TransactionProgressDialog>
```

Do not terminate the transaction or clear pending recovery state in `onClose`; it only controls visibility. Only set `done` after the host confirms completion. A receipt timeout is not proof of a failed on-chain transaction. Pass a translated `error` status label when a stopped step actually means pending confirmation.

`TimingOptions` supplies stage labels, optional wait descriptions and a stage-group map. It contains no application-specific stage keys. Closing and reopening a dialog must reuse the host's trace and pending transaction.

OnHold retains only bindings in `InteractionTimings`, `TagsField`, `Feedback.DataValue`, `InviteLink`, `ContractAssets` and `GitHubLink`; mint and mining dialogs import `TransactionProgressDialog` directly. `TokenMediaUpload` is a direct shared export. Its application error notice is supplied through `renderError`.

NFT gallery/staking layouts already compose `CollectibleCard`, pagination and other shared primitives. Account verification, auction decay, referral fetching, mining data, protocol policies, welcome artwork and API integrations remain application responsibilities rather than additional UI-library components.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build:package` and `npm run build` here. The gallery includes searchable, interactive examples and generated API tables for the extracted controls. OnHold additionally runs its complete frontend suite, production build and desktop/mobile browser interaction checks. Its `front/scripts/sync-singlespark.mjs` replaces generated distribution files while preserving wallet runtime adapters.
