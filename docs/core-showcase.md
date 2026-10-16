# Core showcase content and assets

## Approved scope — 2026-10-16

The owner confirmed publication rights for all ten Phase 3 collection/character
images and their optimized derivatives. They approved an archived-roadmap
treatment, showcase-focused FAQ rewrite and X-only external links, and explicitly
removed the personal footer attribution. This approval does not establish the
historical completion of roadmap proposals or grant artwork rights to visitors.

The implementation uses shared configuration in `src/showcaseContent.ts` and
`src/sections.ts`. Layout/identity uses PR 3's provisional source-first criteria;
usable reference captures remain outstanding. No 3D, rarity implementation,
treasury figures, terminal, audio, wallet, minting or blockchain requests belong
to this milestone. Legacy sources and hosting remain untouched.

## Local artwork provenance

Sources are under legacy `src/md/`. All are 2000×2000. Originals total 11,959,313
bytes and are not copied into this repository. Six have misleading `.png`
extensions despite JPEG encoding. Each published derivative is a correctly named
1000×1000 JPEG, encoded at quality 85 using Windows System.Drawing with
high-quality bicubic resampling and a black background; no crop or lore alteration.
The first derivative was inspected before converting the remaining nine.
Owner visual acceptance of the derivatives is still required before publication.

| Original          | Published file under `public/artwork/` | Gallery position / title           |
| ----------------- | -------------------------------------- | ---------------------------------- |
| `4_0000.png`      | `showcase-01.jpg`                      | Collection 1 / Collection study 01 |
| `11_0000-min.png` | `showcase-02.jpg`                      | Collection 2 / Collection study 02 |
| `the_creator.png` | `showcase-03.jpg`                      | Collection 3 / The Creator         |
| `5_0000.png`      | `showcase-04.jpg`                      | Collection 4 / Collection study 04 |
| `6_0000.png`      | `showcase-05.jpg`                      | Collection 5 / Collection study 05 |
| `h2.png`          | `drip-x.jpg`                           | Character 1 / DRIP-X               |
| `h1.png`          | `redacted.jpg`                         | Character 2 / redacted             |
| `h3.png`          | `civil-x.jpg`                          | Character 3 / C1V1L-X              |
| `h4.png`          | `aim-x.jpg`                            | Character 4 / A1M-X                |
| `h5.png`          | `lil-x.jpg`                            | Character 5 / L1L-X                |

Collection order follows the desktop reference; mobile originally used a
different order, now intentionally unified in shared content. Character order and
image/description mappings agree across both legacy variants. Lore is selected
from public desktop Phase 3 descriptions; existing redactions stay redacted. The
unnamed character has no invented identity or story. Collection-study numbers
are display labels, not token IDs, ranks or assertions of collection supply.

The derived assets total 1,113,452 bytes. The existing delivery controller still
enforces a 4,000,000-byte JSON request including base64 files. Keep that guard
unchanged and measure the built bundle's serialized upload size locally before
publication. A successful local size check is not provider/deployment acceptance.
The local built-bundle calculation on 2026-10-16, including virtual robots/config
and identity files, base64 encoding, 64-character synthetic project ID suffixes
and 20-digit synthetic run IDs, measured approximately 1.94 MB for each target.
These are request-size measurements with synthetic identities, not
actual deployment records; future bundle changes require a fresh calculation.

## Historical content and links

The cybermap preserves the seven-stage original order, but every stage is an
archived proposal. Legacy strike-through styling does not prove completion.
Old prices, sales calls to action, funding/royalty percentages and benefits are
not republished as current claims. No completion dates are fabricated.

The FAQ explains the historical showcase, no-wallet behavior, gallery controls,
archived roadmap, absence of visitor rights grants and deferred features. It
replaces obsolete minting instructions, blanket ownership claims and permanent
IPFS-hosting guarantees. Footer content has no personal attribution.

Read-only link inspection on 2026-10-16 found the matching public profile at
<https://twitter.com/DripperzCC>. This is the sole approved external destination;
it is a plain link, not an embedded feed. One legacy Discord invite returned 404;
another resolved to DIGITAL BRICKS rather than a Dripperz-named server. The legacy
LinkedIn credit could not be verified (HTTP 999). None are copied or silently
replaced. Terminal/document links and radio remain separate milestones.

## Gallery behavior and acceptance

- One selected index drives image, title and description. Previous/Next and
  Left/Right wrap through the same ordered data. Manual selection stops autoplay.
- Autoplay is opt-in, retaining the legacy 5-second collection and 8-second
  character intervals. Focus, hover, hidden-tab/offscreen state and reduced motion
  suspend advancement. Missing observer support keeps autoplay static. Timers,
  observers and event listeners are cleaned up when disabled or unmounted.
- Broken artwork keeps captions/navigation usable. Images have explicit square
  dimensions, local URLs and lazy loading. Each gallery has its own controls.
- Verify both galleries, FAQ, navigation, approved link and image quality at
  1440×900, 768×1024 and 390×844, including keyboard and reduced-motion behavior.
  Browser checks do not substitute for owner localhost acceptance.

Implementation ends at local checks, read-only review and owner acceptance.
No publication, deployment, delivery-configuration change or release-evidence
update is authorized by this document.
