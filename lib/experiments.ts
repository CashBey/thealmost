export type ExperimentBadge = 'ACTIVE' | 'NEW' | 'RARE';

export type ExperimentCard = {
  title: string;
  subtitle: string;
  href?: string;
  imageSrc: string;
  badge?: ExperimentBadge;
  disabled?: boolean;
};

export type ExperimentLink = {
  href: string;
  title: string;
};

\1  {
    title: 'The Almost Button',
    subtitle: 'It will never do what you expect.',
    href: '/almost-button',
    imageSrc: '/thumbnails/almost-button.png',
    badge: 'NEW',
  },

  {
    title: 'The Choice Engine',
    subtitle: 'Every choice changes who you are.',
    href: '/choice-engine',
    imageSrc: '/thumbnails/choice-engine.png',
    badge: 'ACTIVE',
  },
  {
    title: 'The Almost Choice',
    subtitle: 'You were very close.',
    href: '/almost-choice',
    imageSrc: '/thumbnails/almost-choice.png',
    badge: 'NEW',
  },
  {
    title: 'How Manipulable Are You?',
    subtitle: 'Can you resist the interface?',
    href: '/how-manipulable-are-you',
    imageSrc: '/thumbnails/manipulable.png',
    badge: 'NEW',
  },
  {
    title: 'You Are Not Special',
    subtitle: 'A short experiment about uniqueness.',
    href: '/you-are-not-special',
    imageSrc: '/thumbnails/not-special.png',
    badge: 'NEW',
  },
  {
    title: 'The Waiting Game',
    subtitle: "It won't reward you.",
    href: '/the-waiting-game',
    imageSrc: '/thumbnails/waiting.png',
    badge: 'NEW',
  },
  {
    title: 'The Richest Person Alive',
    subtitle: 'For a moment, you have more money than anyone who has ever lived.',
    href: '/the-richest-person-alive',
    imageSrc: '/thumbnails/spend-satoshi.png',
    badge: 'NEW',
  },

  // placeholders (kept for the home grid)
  {
    title: 'Coming soon',
    subtitle: 'A new experiment is forming.',
    imageSrc: '/thumbnails/placeholder.png',
    disabled: true,
  },
  {
    title: 'Coming soon',
    subtitle: 'We are still calibrating it.',
    imageSrc: '/thumbnails/placeholder.png',
    disabled: true,
  },
  {
    title: 'Coming soon',
    subtitle: 'It is not ready to be seen.',
    imageSrc: '/thumbnails/placeholder.png',
    disabled: true,
  },
];

export const ACTIVE_EXPERIMENTS: ExperimentLink[] = EXPERIMENT_CARDS
  .filter((e) => !!e.href && !e.disabled)
  .map((e) => ({ href: e.href as string, title: e.title }));
