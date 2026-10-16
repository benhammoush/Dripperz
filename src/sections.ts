/**
 * Shared navigation and honest placeholders for later Phase 3 milestones.
 * @packageDocumentation
 */

export const SECTIONS = [
  {
    id: 'collection',
    label: 'Cyberclub',
    title: 'The collection',
    detail:
      'Collection artwork and synchronized galleries follow in the core showcase milestone.',
  },
  {
    id: 'cybermap',
    label: 'Cybermap',
    title: 'Cybermap',
    detail:
      'The historical timeline follows after content review. No new commitments are announced here.',
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
      'Reviewed questions and answers follow in the core showcase milestone.',
  },
] as const;
