import type { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'Meraki',
    template: '%s · Meraki',
  },
  description: 'Gestão inteligente para clínicas de saúde e bem-estar.',
  applicationName: 'Meraki',
  robots: {
    index: false,
    follow: false,
  },
};
