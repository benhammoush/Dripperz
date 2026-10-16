/**
 * Approved public artwork, fictional character descriptions and historical-showcase copy.
 * @packageDocumentation
 */

/** A local portrait paired with its visible title, alternative text and description. */
export interface GallerySlide {
  src: string;
  title: string;
  alt: string;
  description: string;
}

export const COLLECTION_SLIDES: readonly GallerySlide[] = [
  {
    src: '/artwork/showcase-01.jpg',
    title: 'Collection study 01',
    alt: 'Dripperz portrait in a pale blue hood and black face covering',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-02.jpg',
    title: 'Collection study 02',
    alt: 'Robotic figure with a green visor, patterned bucket hat and illustrated jacket against floating gemstones',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-03.jpg',
    title: 'The Creator',
    alt: 'Dark robotic portrait framed by mechanical arms',
    description:
      'The Creator artwork shown in the original Phase 3 collection gallery.',
  },
  {
    src: '/artwork/showcase-04.jpg',
    title: 'Collection study 04',
    alt: 'Silver robotic helmet with illuminated yellow slashes, orange and white hoodie and two swords',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
  {
    src: '/artwork/showcase-05.jpg',
    title: 'Collection study 05',
    alt: 'Black robotic figure in a graphic T-shirt with white wings covered in dark lettering',
    description: 'A portrait from the original Phase 3 collection showcase.',
  },
];

export const CHARACTER_SLIDES: readonly GallerySlide[] = [
  {
    src: '/artwork/drip-x.jpg',
    title: 'DRIP-X',
    alt: 'DRIP-X robotic portrait with a purple reflective visor and gold detail',
    description:
      'This DR1P-X represents the fashion addicts. Even if everyone has style, they are ████████ in the fashion industry of the CyberClub, ████████ spreading The Creator’s culture. Their agility and attention to detail allows them to work with precious stones and exotic textiles to create masterpieces.',
  },
  {
    src: '/artwork/redacted.jpg',
    title: '████',
    alt: 'Unnamed robotic character with a gold and pink reflective visor',
    description:
      'This character’s name and description were redacted in the original public showcase.',
  },
  {
    src: '/artwork/civil-x.jpg',
    title: 'C1V1L-X',
    alt: 'C1V1L-X silver robotic helmet with etched geometric panels against black',
    description:
      'C1V1L-X is a system initially programmed by ██████ to create an economically superior and efficient city. As these are the clones of the original project, the C1V1L-X class is the most common version ██████. Their design is simple and refined. They are multipurpose and participate in a variety of activities.',
  },
  {
    src: '/artwork/aim-x.jpg',
    title: 'A1M-X',
    alt: 'A1M-X gold robotic helmet with bright diagonal illuminated slashes',
    description:
      'A1M-X are Dripcity’s soldiers, they never miss their targets ██████ unique aimbot. We still don’t know why the CyberClub has such a █████ army and why do they need it. Is it to protect themselves from ██████ or are they planning to attack?',
  },
  {
    src: '/artwork/lil-x.jpg',
    title: 'L1L-X',
    alt: 'L1L-X gold robotic helmet with vivid green inset panels',
    description:
      'L1L-X are the gangsters of the CyberClub. They are running the main businesses such as █████████. It seems that they have a mafia-like hierarchy, and we believe we have identified ████████. When someone has a problem, he always reaches out to these thugs for help.',
  },
];

export const ARCHIVED_ROADMAP = [
  {
    title: 'Investigation',
    description:
      'The original roadmap introduced the Cyberclub through an interactive story.',
  },
  {
    title: 'Expand the club',
    description:
      'The original plan invited visitors to a whitelist and social communities. Those invitations are not current offers.',
  },
  {
    title: 'Presale',
    description:
      'A presale was described in the original roadmap. This showcase does not offer minting or purchases.',
  },
  {
    title: 'Public sale',
    description:
      'The original roadmap described a public sale and metadata reveal. No sale or reveal schedule is announced here.',
  },
  {
    title: 'Treasury / Community wallet',
    description:
      'The original plan described a community wallet, committee elections and voting. This archive does not verify implementation, funding or current governance.',
  },
  {
    title: 'Community building',
    description:
      'Partnerships, giveaways, events and community website features appeared in the original plan. They are not current commitments.',
  },
  {
    title: 'Expanding the Cyberclub universe',
    description:
      'The original plan proposed a play-to-earn studio, spin-off collections and future-project access. This archive does not announce or confirm delivery of those proposals.',
  },
] as const;

export const SHOWCASE_FAQ = [
  {
    question: 'What is this site?',
    answer:
      'A personal, non-commercial historical showcase of the Dripperz Phase 3 visual identity, artwork and fictional universe. It is not a mint or sales website.',
  },
  {
    question: 'Do I need a wallet?',
    answer:
      'No. This showcase has no wallet connection, minting or live blockchain integration. You can explore the artwork without signing in.',
  },
  {
    question: 'How do the galleries work?',
    answer:
      'Use Previous and Next, or focus a gallery and press Left or Right. Images and descriptions change together. Slideshows are off by default; play is optional, with pauses while focused, hovered, hidden or offscreen. Reduced-motion preferences keep them still.',
  },
  {
    question: 'Is the cybermap a current roadmap?',
    answer:
      'No. It records proposals from the original roadmap, not verified completion or new commitments. No dates, investment opportunities or future benefits are promised.',
  },
  {
    question: 'Does this site grant artwork rights?',
    answer:
      'No artwork license or ownership rights are granted by viewing this showcase. It makes no claim about the rights associated with any historical token.',
  },
  {
    question: 'Are treasury and rarity features available?',
    answer:
      'Not yet. Historical treasury content requires approved dated sources, and the local rarity explorer requires validation of the legacy data and rules. No live balances, ownership or prices are requested.',
  },
] as const;

export const PUBLIC_LINKS = [
  { label: 'Dripperz on X', href: 'https://twitter.com/DripperzCC' },
] as const;
