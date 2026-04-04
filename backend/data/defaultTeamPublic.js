/** Public GET /api/team payload when no TeamPage document exists (matches admin defaults). */
export const defaultTeamPublicPayload = {
  hero: {
    eyebrow: 'Our Team',
    heading: 'Meet the People Behind Jinubify',
    subtitle:
      'We are a passionate team of innovators, creators, and problem-solvers dedicated to building innovative tech and creative solutions that drive success.',
  },
  ceoFounder: {
    enabled: false,
    eyebrow: 'Leadership',
    sectionTitle: 'CEO & Founder',
    name: '',
    title: '',
    imageUrl: '',
    bio: '',
    detailedBio: '',
    quote: '',
    social: { linkedin: '', twitter: '', website: '' },
  },
  stripHeading: 'Browse team',
  members: [],
};
