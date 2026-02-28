export interface TeamMember {
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
    detailedBio: string;
    department?: string;
    social: {
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
}

export const teamMembers: TeamMember[] = [
    {
        name: 'Ruot Maliah',
        role: 'Chief Strategy & Technology Lead',
        department: 'Strategy & Vision',
        imageUrl: '/Ruot-Maliah.jpg',
        bio: 'Company vision, product direction, tech architecture, innovation, and growth strategy.',
        detailedBio: 'Ruot Maliah leads strategy and technology at Jinubify, shaping company vision, product direction, and technical architecture. With a blend of software engineering, digital marketing, and systems thinking, Ruot drives innovation, growth strategy, and partnerships while building scalable systems that deliver exceptional results for clients worldwide.',
        social: { linkedin: '#', twitter: '#', website: '#' },
    },
    {
        name: 'Marcus Johnson',
        role: 'Growth, Marketing & Sales Lead',
        department: 'Growth & Revenue',
        imageUrl: 'https://picsum.photos/seed/marcus/400/400',
        bio: 'Client acquisition, campaigns, funnels, sales, and revenue pipelines.',
        detailedBio: 'Marcus Johnson leads growth, marketing, and sales at Jinubify. He focuses on client acquisition, data-driven campaigns, funnels, and brand growth. Marcus drives revenue pipelines and strategic partnerships, helping the company scale visibility and deliver measurable results for clients.',
        social: { linkedin: '#', twitter: '#', website: '#' },
    },
    {
        name: 'Elena Rodriguez',
        role: 'Creative & Brand Lead',
        department: 'Creative & Brand',
        imageUrl: 'https://picsum.photos/seed/elena/400/400',
        bio: 'Brand consistency, visual quality, design systems, and creative direction.',
        detailedBio: 'Elena Rodriguez leads creative and brand at Jinubify. She ensures brand consistency, visual quality, and design systems across all client work. Elena drives creative direction, content quality, and marketing materials that strengthen brand identity and resonate with audiences.',
        social: { linkedin: '#', twitter: '#', website: '#' },
    },
    {
        name: 'Sarah Chen',
        role: 'Engineering, Systems & IT Lead',
        department: 'Engineering & Systems',
        imageUrl: 'https://picsum.photos/seed/sarah/400/400',
        bio: 'System stability, development delivery, performance, security, and scalability.',
        detailedBio: 'Sarah Chen leads engineering, systems, and IT at Jinubify. She oversees development delivery, infrastructure, and system stability. Sarah focuses on performance, security, and scalability, ensuring robust and maintainable solutions from backend and frontend through cloud and API systems.',
        social: { linkedin: '#', twitter: '#', website: '#' },
    },
    {
        name: 'Jordan Taylor',
        role: 'Operations, Production & Logistics Lead',
        department: 'Operations & Delivery',
        imageUrl: 'https://picsum.photos/seed/jordan/400/400',
        bio: 'Execution, timelines, delivery, quality, and process efficiency.',
        detailedBio: 'Jordan Taylor leads operations, production, and logistics at Jinubify. Jordan ensures execution excellence, timelines, and client delivery through project management, vendor coordination, and workflow systems. Focused on quality control, support operations, and process efficiency, Jordan drives client satisfaction and service delivery.',
        social: { linkedin: '#', twitter: '#', website: '#' },
    },
];
