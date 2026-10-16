/**
 * Shared navigation and honest descriptions of current and deferred Phase 3 sections.
 * @packageDocumentation
 */

export const SECTIONS = [
  {
    id: 'collection',
    label: 'Cyberclub',
    title: 'The collection',
    detail:
      'Original collection artwork and fictional characters from Phase 3.',
  },
  {
    id: 'cybermap',
    label: 'Cybermap',
    title: 'Cybermap',
    detail:
      'The original roadmap is archived as historical proposals, not current commitments.',
  },
  {
    id: 'treasury',
    label: 'Treasury',
    title: 'Historical treasury',
    detail:
      'Only approved, dated historical information will appear here. No live balances are requested.',
  },
  {
    id: 'rarity',
    label: 'Rarity',
    title: 'Rarity explorer',
    detail:
      'Local exploration follows validation of the legacy dataset and its original rules. No wallet is required.',
  },
  {
    id: 'faq',
    label: 'FAQ',
    title: 'Frequently asked questions',
    detail:
      'Answers about this historical showcase and its local-only interactions.',
  },
] as const;
