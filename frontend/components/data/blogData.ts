export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  author: string;
  category: string;
  content: string;
}

export const allPosts: BlogPost[] = [
  {
    slug: '10-tips-for-modern-web-design',
    title: '10 Tips for Modern Web Design',
    excerpt: 'Discover the key principles of creating a stunning and effective website in today\'s digital landscape.',
    imageUrl: 'https://picsum.photos/seed/blog1/1200/800',
    date: 'Oct 10, 2024',
    author: 'Jane Doe',
    category: 'Design',
    content: `
      <p class="lead">In the fast-paced world of web design, staying current is key. Here are ten tips to ensure your website is modern, user-friendly, and effective, blending aesthetic appeal with functional excellence.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">1. Simplicity and Minimalism</h3>
      <p>A clean, uncluttered design is easier for users to navigate and helps focus their attention on what's important. Use ample white space, which creates a sense of balance and calm, allowing your content to breathe. A limited, well-chosen color palette and clean, readable typography are the cornerstones of modern minimalist design.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">2. Mobile-First Approach</h3>
      <p>With more users browsing on mobile devices than ever before, designing for mobile first is no longer optional—it's essential. This approach forces you to prioritize content and functionality for the smallest screens, resulting in a more focused and efficient design that can then be scaled up for larger devices. Ensure your site is fully responsive and provides a seamless experience across all screen sizes.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">3. Fast Loading Times</h3>
      <p>Page speed is a critical factor for user experience and SEO. Users expect pages to load in under two seconds. To achieve this, optimize images without sacrificing quality, leverage browser caching to store static assets, and minify CSS and JavaScript files to reduce their size. A fast website reduces bounce rates and improves user satisfaction.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">4. Engaging Visuals</h3>
      <p>High-quality images, videos, and illustrations can make your site more engaging and help communicate your message more effectively. Avoid generic stock photos and opt for custom visuals that reflect your brand's unique personality. Authentic imagery builds trust and makes your site more memorable.</p>
      
      <h3 class="text-2xl font-bold mt-8 mb-4">5. Clear Call-to-Actions (CTAs)</h3>
      <p>Your CTAs should be prominent and clearly communicate the desired action. Use contrasting colors to make them stand out, and employ action-oriented, compelling copy (e.g., "Get Started for Free," "Download Now") to encourage users to click. The placement and design of your CTAs can dramatically impact conversion rates.</p>
    `
  },
  {
    slug: 'the-future-of-digital-marketing',
    title: 'The Future of Digital Marketing',
    excerpt: 'Explore emerging trends in SEO, social media, and content marketing that will shape the industry.',
    imageUrl: 'https://picsum.photos/seed/blog2/1200/800',
    date: 'Oct 05, 2024',
    author: 'John Smith',
    category: 'Marketing',
    content: `
        <p class="lead">The digital marketing landscape is in a constant state of flux. To stay ahead, marketers must embrace new technologies and strategies. This article explores the key trends that will define the future of the industry.</p>

        <h3 class="text-2xl font-bold mt-8 mb-4">Artificial Intelligence (AI)</h3>
        <p>AI is revolutionizing marketing by enabling personalization at scale. From AI-powered chatbots providing instant customer service to predictive analytics that identify customer behavior, AI helps marketers deliver more relevant and timely messages. It automates repetitive tasks, freeing up marketers to focus on strategy and creativity.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Voice Search Optimization</h3>
        <p>With the rise of smart speakers and voice assistants, optimizing for voice search is crucial. Voice queries are typically longer and more conversational than text-based searches. Marketers need to adapt their SEO strategies to target these natural language queries and focus on providing direct, concise answers to common questions.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Video Marketing</h3>
        <p>Video content continues to dominate online engagement. Short-form videos on platforms like TikTok and Instagram Reels, as well as live streaming, are incredibly effective for capturing audience attention. Interactive video formats will also become more prevalent, allowing for a more engaging and personalized viewing experience.</p>
    `
  },
  {
    slug: 'why-your-business-needs-a-mobile-app',
    title: 'Why Your Business Needs a Mobile App',
    excerpt: 'Learn how a dedicated mobile app can boost customer engagement and drive sales for your business.',
    imageUrl: 'https://picsum.photos/seed/blog3/1200/800',
    date: 'Sep 28, 2024',
    author: 'Emily Jones',
    category: 'Development',
    content: `
        <p class="lead">In a mobile-first world, a website is no longer enough. A dedicated mobile app can be a powerful tool for businesses to connect with their customers on a deeper level. Here's why you should consider developing one.</p>

        <h3 class="text-2xl font-bold mt-8 mb-4">Direct Communication Channel</h3>
        <p>A mobile app provides a direct and personal line of communication to your customers. Push notifications, for example, can be used to deliver targeted promotions, reminders, and updates directly to a user's device, achieving much higher engagement rates than email.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Enhanced Customer Experience</h3>
        <p>Apps can offer a superior user experience compared to mobile websites. They can be faster, more interactive, and can leverage device features like the camera, GPS, and contacts to provide personalized and convenient functionality for your users.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Build Brand Loyalty</h3>
        <p>An app on a user's phone serves as a constant brand reminder. By providing value and a seamless experience, you can foster customer loyalty and encourage repeat business. Loyalty programs and exclusive in-app content are great ways to reward your most dedicated customers.</p>
    `
  },
  {
    slug: 'mastering-the-art-of-brand-storytelling',
    title: 'Mastering the Art of Brand Storytelling',
    excerpt: 'Craft a compelling brand narrative that resonates with your audience and builds lasting loyalty.',
    imageUrl: 'https://picsum.photos/seed/blog4/1200/800',
    date: 'Sep 21, 2024',
    author: 'Michael Brown',
    category: 'Branding',
    content: `
        <p class="lead">In a crowded marketplace, a strong brand story is what sets you apart. It's more than just what you sell; it's about the values you represent and the connection you build with your audience.</p>

        <h3 class="text-2xl font-bold mt-8 mb-4">Find Your "Why"</h3>
        <p>Every great brand story starts with a clear purpose. Why does your company exist beyond making a profit? What problem are you solving? Your "why" is the emotional core of your narrative and what will ultimately connect with your customers on a human level.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Know Your Audience</h3>
        <p>To tell a story that resonates, you must deeply understand who you're talking to. What are their hopes, fears, and aspirations? Tailor your narrative to speak directly to their experiences and show them how your brand fits into their story.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Be Authentic and Consistent</h3>
        <p>Authenticity is key. Your story should be genuine and reflected in every aspect of your business, from your marketing campaigns to your customer service. Consistency across all channels builds trust and reinforces your brand identity in the minds of consumers.</p>
    `
  },
  {
    slug: 'a-guide-to-secure-cloud-infrastructure',
    title: 'A Guide to Secure Cloud Infrastructure',
    excerpt: 'Best practices for designing and maintaining a secure and scalable cloud environment for your applications.',
    imageUrl: 'https://picsum.photos/seed/blog5/1200/800',
    date: 'Sep 15, 2024',
    author: 'John Smith',
    category: 'IT Solutions',
    content: `
        <p class="lead">As more businesses migrate to the cloud, ensuring the security of your infrastructure is paramount. A security breach can be catastrophic, so it's essential to adopt a proactive and multi-layered approach to cloud security.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Implement the Principle of Least Privilege</h3>
        <p>Grant users and services only the permissions they absolutely need to perform their tasks. This minimizes the potential damage if an account is compromised. Regularly review and audit permissions to ensure they are still appropriate.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Encrypt Data at Rest and in Transit</h3>
        <p>All sensitive data should be encrypted, both when it's stored on disk (at rest) and when it's moving across the network (in transit). Use strong encryption protocols like TLS for data in transit and leverage the encryption services provided by your cloud provider for data at rest.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Regular Security Audits and Monitoring</h3>
        <p>Continuously monitor your cloud environment for suspicious activity. Use logging and monitoring tools to detect and alert on potential security threats in real-time. Regular security audits and penetration testing can help you identify and remediate vulnerabilities before they can be exploited.</p>
    `
  },
  {
    slug: 'video-marketing-the-ultimate-engagement-tool',
    title: 'Video Marketing: The Ultimate Engagement Tool',
    excerpt: 'Leverage the power of video to capture attention, convey your message, and convert viewers into customers.',
    imageUrl: 'https://picsum.photos/seed/blog6/1200/800',
    date: 'Sep 08, 2024',
    author: 'Emily Jones',
    category: 'Multimedia',
    content: `
        <p class="lead">Video is no longer just one part of your marketing plan; it's central to your outreach and campaign efforts. If you're not using video, you're likely falling behind.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Why Video is So Effective</h3>
        <p>Video is a powerful medium because it combines visuals, sound, and storytelling to create an emotional connection with the viewer. It's highly engaging, easily shareable, and can explain complex topics more effectively than text alone. Videos on landing pages can increase conversion rates by over 80%.</p>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Types of Marketing Videos</h3>
        <p>There are many types of videos you can create, depending on your goals. Some popular formats include:</p>
        <ul class="list-disc list-inside space-y-2 mt-4">
            <li><strong>Explainer Videos:</strong> To simplify a complex product or service.</li>
            <li><strong>Testimonial Videos:</strong> To build social proof and trust.</li>
            <li><strong>Behind-the-Scenes Videos:</strong> To humanize your brand and show your company culture.</li>
            <li><strong>Tutorials and How-To Videos:</strong> To provide value and establish your brand as an expert.</li>
        </ul>
        
        <h3 class="text-2xl font-bold mt-8 mb-4">Optimizing for Success</h3>
        <p>To maximize the impact of your videos, ensure they are optimized for each platform. Pay attention to video length, aspect ratios, and whether sound is on by default. Always include a clear call-to-action to guide viewers on what to do next.</p>
    `
  },
];

/** Get a static post by slug (for fallback when API is unavailable). */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}
