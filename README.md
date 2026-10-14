# Dripperz

A planned responsive rebuild of the Dripperz Phase 3 showcase, preserving its cyberpunk identity without wallet, minting or blockchain-data integrations.

## Status

PR 1's source foundation is implemented locally: a minimal status page, version `0.1.0`, pinned tooling and automated check/test configuration. The Phase 3 visual showcase and delivery/deployment configuration are not implemented. Local implementation is not a merged or deployed release.

## Development

Use Node `24.21.0` and npm `11.19.0`.

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. Run `npm run check` for local quality/build gates; install the three Playwright browsers and run `npm run test:browser` for production-bundle smoke tests. See [contribution guidance](CONTRIBUTING.md) for commands, mandatory English documentation and review boundaries.

Requirements and separately reviewed milestones are recorded in [the accepted specification](spec/dripperz.md). Initial source uses React, Vite and strict TypeScript; no legacy assets or integrations have been migrated.

This repository does not replace or modify the existing live site at <https://dripperzcyberclub.netlify.app/>.
