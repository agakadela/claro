import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

async function fetchImageBuffer(picsumId: number): Promise<Buffer> {
  const response = await fetch(`https://picsum.photos/id/${picsumId}/800/600`);
  if (!response.ok) {
    // Fallback to random image if specific ID fails
    const fallback = await fetch('https://picsum.photos/800/600');
    return Buffer.from(await fallback.arrayBuffer());
  }
  return Buffer.from(await response.arrayBuffer());
}

const categories = [
  {
    name: 'Business & Money',
    color: '#FFB347',
    slug: 'business-money',
    subcategories: [
      { name: 'Accounting', slug: 'accounting' },
      {
        name: 'Entrepreneurship',
        slug: 'entrepreneurship',
      },
      { name: 'Gigs & Side Projects', slug: 'gigs-side-projects' },
      { name: 'Investing', slug: 'investing' },
      { name: 'Management & Leadership', slug: 'management-leadership' },
      {
        name: 'Marketing & Sales',
        slug: 'marketing-sales',
      },
      { name: 'Networking, Careers & Jobs', slug: 'networking-careers-jobs' },
      { name: 'Personal Finance', slug: 'personal-finance' },
      { name: 'Real Estate', slug: 'real-estate' },
    ],
  },
  {
    name: 'Software Development',
    color: '#7EC8E3',
    slug: 'software-development',
    subcategories: [
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Mobile Development', slug: 'mobile-development' },
      { name: 'Game Development', slug: 'game-development' },
      { name: 'Programming Languages', slug: 'programming-languages' },
      { name: 'DevOps', slug: 'devops' },
    ],
  },
  {
    name: 'Writing & Publishing',
    color: '#D8B5FF',
    slug: 'writing-publishing',
    subcategories: [
      { name: 'Fiction', slug: 'fiction' },
      { name: 'Non-Fiction', slug: 'non-fiction' },
      { name: 'Blogging', slug: 'blogging' },
      { name: 'Copywriting', slug: 'copywriting' },
      { name: 'Self-Publishing', slug: 'self-publishing' },
    ],
  },
  {
    name: 'Other',
    slug: 'other',
  },
  {
    name: 'Education',
    color: '#FFE066',
    slug: 'education',
    subcategories: [
      { name: 'Online Courses', slug: 'online-courses' },
      { name: 'Tutoring', slug: 'tutoring' },
      { name: 'Test Preparation', slug: 'test-preparation' },
      { name: 'Language Learning', slug: 'language-learning' },
    ],
  },
  {
    name: 'Self Improvement',
    color: '#96E6B3',
    slug: 'self-improvement',
    subcategories: [
      { name: 'Productivity', slug: 'productivity' },
      { name: 'Personal Development', slug: 'personal-development' },
      { name: 'Mindfulness', slug: 'mindfulness' },
      { name: 'Career Growth', slug: 'career-growth' },
    ],
  },
  {
    name: 'Fitness & Health',
    color: '#FF9AA2',
    slug: 'fitness-health',
    subcategories: [
      { name: 'Workout Plans', slug: 'workout-plans' },
      { name: 'Nutrition', slug: 'nutrition' },
      { name: 'Mental Health', slug: 'mental-health' },
      { name: 'Yoga', slug: 'yoga' },
    ],
  },
  {
    name: 'Design',
    color: '#B5B9FF',
    slug: 'design',
    subcategories: [
      { name: 'UI/UX', slug: 'ui-ux' },
      { name: 'Graphic Design', slug: 'graphic-design' },
      { name: '3D Modeling', slug: '3d-modeling' },
      { name: 'Typography', slug: 'typography' },
    ],
  },
  {
    name: 'Drawing & Painting',
    color: '#FFCAB0',
    slug: 'drawing-painting',
    subcategories: [
      { name: 'Watercolor', slug: 'watercolor' },
      { name: 'Acrylic', slug: 'acrylic' },
      { name: 'Oil', slug: 'oil' },
      { name: 'Pastel', slug: 'pastel' },
      { name: 'Charcoal', slug: 'charcoal' },
    ],
  },
  {
    name: 'Music',
    color: '#FFD700',
    slug: 'music',
    subcategories: [
      { name: 'Songwriting', slug: 'songwriting' },
      { name: 'Music Production', slug: 'music-production' },
      { name: 'Music Theory', slug: 'music-theory' },
      { name: 'Music History', slug: 'music-history' },
    ],
  },
  {
    name: 'Photography',
    color: '#FF6B6B',
    slug: 'photography',
    subcategories: [
      { name: 'Portrait', slug: 'portrait' },
      { name: 'Landscape', slug: 'landscape' },
      { name: 'Street Photography', slug: 'street-photography' },
      { name: 'Nature', slug: 'nature' },
      { name: 'Macro', slug: 'macro' },
    ],
  },
];

const products = [
  // Business & Money (6 products)
  {
    name: 'QuickBooks Mastery for Small Business',
    description:
      'Complete accounting system setup and management for entrepreneurs.',
    price: 79.99,
    categorySlug: 'accounting',
    refundPolicy: '30_days' as const,
    picsumId: 1,
  },
  {
    name: 'The Startup Founders Playbook',
    description:
      'From idea validation to Series A - a comprehensive entrepreneurship guide.',
    price: 149.99,
    categorySlug: 'entrepreneurship',
    refundPolicy: '30_days' as const,
    picsumId: 20,
  },
  {
    name: 'Side Hustle Accelerator',
    description: 'Launch profitable side projects while keeping your day job.',
    price: 39.99,
    categorySlug: 'gigs-side-projects',
    refundPolicy: '14_days' as const,
    picsumId: 26,
  },
  {
    name: 'Stock Market Investing 101',
    description: 'Build wealth through smart index fund and ETF strategies.',
    price: 59.99,
    categorySlug: 'investing',
    refundPolicy: '30_days' as const,
    picsumId: 48,
  },
  {
    name: 'Leadership in the Modern Workplace',
    description:
      'Develop essential management skills for remote and hybrid teams.',
    price: 89.99,
    categorySlug: 'management-leadership',
    refundPolicy: '30_days' as const,
    picsumId: 60,
  },
  {
    name: 'Digital Marketing Masterclass',
    description: 'SEO, social media, and paid ads strategies that convert.',
    price: 129.99,
    categorySlug: 'marketing-sales',
    refundPolicy: '60_days' as const,
    picsumId: 96,
  },

  // Software Development (6 products)
  {
    name: 'The Complete Web Developer Bootcamp',
    description: 'Master HTML, CSS, JavaScript, React, Node.js and more.',
    price: 89.99,
    categorySlug: 'web-development',
    refundPolicy: '30_days' as const,
    picsumId: 0,
  },
  {
    name: 'React Native Mobile Apps',
    description: 'Build cross-platform iOS and Android apps with React Native.',
    price: 99.99,
    categorySlug: 'mobile-development',
    refundPolicy: '30_days' as const,
    picsumId: 2,
  },
  {
    name: 'Unity Game Development Essentials',
    description: 'Create 2D and 3D games from scratch using Unity and C#.',
    price: 119.99,
    categorySlug: 'game-development',
    refundPolicy: '30_days' as const,
    picsumId: 3,
  },
  {
    name: 'Rust Programming Language Deep Dive',
    description: 'Master memory safety and concurrency with Rust.',
    price: 79.99,
    categorySlug: 'programming-languages',
    refundPolicy: '14_days' as const,
    picsumId: 4,
  },
  {
    name: 'DevOps with Docker and Kubernetes',
    description: 'Container orchestration and CI/CD pipelines for modern apps.',
    price: 109.99,
    categorySlug: 'devops',
    refundPolicy: '30_days' as const,
    picsumId: 5,
  },
  {
    name: 'Full-Stack TypeScript Development',
    description: 'End-to-end type-safe applications with Next.js and tRPC.',
    price: 149.99,
    categorySlug: 'web-development',
    refundPolicy: '60_days' as const,
    picsumId: 6,
  },

  // Writing & Publishing (6 products)
  {
    name: 'Write Your First Novel',
    description: 'From blank page to finished manuscript in 90 days.',
    price: 49.99,
    categorySlug: 'fiction',
    refundPolicy: '30_days' as const,
    picsumId: 24,
  },
  {
    name: 'Non-Fiction Writing Blueprint',
    description: 'Research, structure, and write compelling non-fiction books.',
    price: 59.99,
    categorySlug: 'non-fiction',
    refundPolicy: '30_days' as const,
    picsumId: 42,
  },
  {
    name: 'Professional Blogging System',
    description: 'Build a profitable blog with consistent content strategies.',
    price: 39.99,
    categorySlug: 'blogging',
    refundPolicy: '14_days' as const,
    picsumId: 119,
  },
  {
    name: 'High-Converting Copywriting',
    description: 'Write sales pages, emails, and ads that convert.',
    price: 89.99,
    categorySlug: 'copywriting',
    refundPolicy: '30_days' as const,
    picsumId: 160,
  },
  {
    name: 'Self-Publishing Success Formula',
    description: 'Launch and market your book on Amazon KDP.',
    price: 69.99,
    categorySlug: 'self-publishing',
    refundPolicy: '30_days' as const,
    picsumId: 180,
  },
  {
    name: 'Story Structure Masterclass',
    description:
      'The three-act structure and character arcs that captivate readers.',
    price: 44.99,
    categorySlug: 'fiction',
    refundPolicy: '14_days' as const,
    picsumId: 201,
  },

  // Other (6 products)
  {
    name: 'Life Organization System',
    description: 'Digital and physical systems for a clutter-free life.',
    price: 29.99,
    categorySlug: 'other',
    refundPolicy: '7_days' as const,
    picsumId: 239,
  },
  {
    name: 'Home Automation Guide',
    description: 'Smart home setup with Home Assistant and IoT devices.',
    price: 49.99,
    categorySlug: 'other',
    refundPolicy: '14_days' as const,
    picsumId: 250,
  },
  {
    name: 'Pet Training Fundamentals',
    description: 'Positive reinforcement techniques for dogs and cats.',
    price: 34.99,
    categorySlug: 'other',
    refundPolicy: '30_days' as const,
    picsumId: 237,
  },
  {
    name: 'Travel Hacking Secrets',
    description: 'Fly business class and stay in luxury hotels for less.',
    price: 59.99,
    categorySlug: 'other',
    refundPolicy: '30_days' as const,
    picsumId: 274,
  },
  {
    name: 'DIY Home Repair Basics',
    description: 'Essential repairs every homeowner should know.',
    price: 39.99,
    categorySlug: 'other',
    refundPolicy: '14_days' as const,
    picsumId: 277,
  },
  {
    name: 'Gardening for Beginners',
    description: 'Grow vegetables and herbs in any space.',
    price: 24.99,
    categorySlug: 'other',
    refundPolicy: '7_days' as const,
    picsumId: 292,
  },

  // Education (6 products)
  {
    name: 'Create Engaging Online Courses',
    description: 'Course design, filming, and launch strategies.',
    price: 129.99,
    categorySlug: 'online-courses',
    refundPolicy: '60_days' as const,
    picsumId: 306,
  },
  {
    name: 'Private Tutoring Business Blueprint',
    description: 'Build a six-figure tutoring practice.',
    price: 79.99,
    categorySlug: 'tutoring',
    refundPolicy: '30_days' as const,
    picsumId: 318,
  },
  {
    name: 'SAT/ACT Prep Complete Guide',
    description: 'Score in the 99th percentile with proven strategies.',
    price: 99.99,
    categorySlug: 'test-preparation',
    refundPolicy: '30_days' as const,
    picsumId: 338,
  },
  {
    name: 'Spanish Fluency in 6 Months',
    description: 'Immersive language learning with native speakers.',
    price: 149.99,
    categorySlug: 'language-learning',
    refundPolicy: '60_days' as const,
    picsumId: 355,
  },
  {
    name: 'GRE Math Domination',
    description: 'Master quantitative reasoning for graduate school admission.',
    price: 69.99,
    categorySlug: 'test-preparation',
    refundPolicy: '30_days' as const,
    picsumId: 366,
  },
  {
    name: 'Japanese for Busy Professionals',
    description: 'Learn conversational Japanese in 15 minutes a day.',
    price: 89.99,
    categorySlug: 'language-learning',
    refundPolicy: '30_days' as const,
    picsumId: 392,
  },

  // Self Improvement (6 products)
  {
    name: 'Productivity System for Developers',
    description: 'Time management and focus techniques for busy professionals.',
    price: 29.99,
    categorySlug: 'productivity',
    refundPolicy: '7_days' as const,
    picsumId: 403,
  },
  {
    name: 'Atomic Habits Implementation Guide',
    description: 'Build lasting habits with practical daily systems.',
    price: 34.99,
    categorySlug: 'personal-development',
    refundPolicy: '14_days' as const,
    picsumId: 429,
  },
  {
    name: 'Mindfulness Meditation Course',
    description: '30-day guided meditation program for stress relief.',
    price: 49.99,
    categorySlug: 'mindfulness',
    refundPolicy: '30_days' as const,
    picsumId: 433,
  },
  {
    name: 'Career Pivot Playbook',
    description: 'Successfully transition to a new industry or role.',
    price: 79.99,
    categorySlug: 'career-growth',
    refundPolicy: '30_days' as const,
    picsumId: 447,
  },
  {
    name: 'Deep Work Mastery',
    description: 'Eliminate distractions and produce meaningful work.',
    price: 39.99,
    categorySlug: 'productivity',
    refundPolicy: '14_days' as const,
    picsumId: 452,
  },
  {
    name: 'Public Speaking Confidence',
    description: 'Overcome fear and deliver compelling presentations.',
    price: 59.99,
    categorySlug: 'personal-development',
    refundPolicy: '30_days' as const,
    picsumId: 469,
  },

  // Fitness & Health (6 products)
  {
    name: '12-Week Strength Training Program',
    description: 'Progressive overload workout plan with video demos.',
    price: 49.99,
    categorySlug: 'workout-plans',
    refundPolicy: '30_days' as const,
    picsumId: 473,
  },
  {
    name: 'Macro-Based Nutrition Guide',
    description: 'Flexible dieting for sustainable fat loss.',
    price: 39.99,
    categorySlug: 'nutrition',
    refundPolicy: '14_days' as const,
    picsumId: 488,
  },
  {
    name: 'Anxiety Management Toolkit',
    description: 'CBT techniques and coping strategies for anxiety.',
    price: 59.99,
    categorySlug: 'mental-health',
    refundPolicy: '30_days' as const,
    picsumId: 493,
  },
  {
    name: 'Yoga for Flexibility & Strength',
    description: '60-day progressive yoga program for all levels.',
    price: 44.99,
    categorySlug: 'yoga',
    refundPolicy: '30_days' as const,
    picsumId: 516,
  },
  {
    name: 'HIIT Home Workout Series',
    description: 'No-equipment high-intensity workouts in 20 minutes.',
    price: 29.99,
    categorySlug: 'workout-plans',
    refundPolicy: '7_days' as const,
    picsumId: 525,
  },
  {
    name: 'Plant-Based Nutrition Masterclass',
    description: 'Complete guide to thriving on a vegan diet.',
    price: 54.99,
    categorySlug: 'nutrition',
    refundPolicy: '30_days' as const,
    picsumId: 535,
  },

  // Design (6 products)
  {
    name: 'UI/UX Design Masterclass',
    description:
      'Learn modern design principles, Figma, and create stunning interfaces.',
    price: 79.99,
    categorySlug: 'ui-ux',
    refundPolicy: '30_days' as const,
    picsumId: 546,
  },
  {
    name: 'Brand Identity Design System',
    description: 'Create cohesive brand identities from logo to guidelines.',
    price: 99.99,
    categorySlug: 'graphic-design',
    refundPolicy: '30_days' as const,
    picsumId: 550,
  },
  {
    name: 'Blender 3D Modeling Complete',
    description: 'From basics to advanced 3D modeling and rendering.',
    price: 129.99,
    categorySlug: '3d-modeling',
    refundPolicy: '60_days' as const,
    picsumId: 569,
  },
  {
    name: 'Typography Fundamentals',
    description: 'Master font pairing, hierarchy, and readability.',
    price: 49.99,
    categorySlug: 'typography',
    refundPolicy: '14_days' as const,
    picsumId: 593,
  },
  {
    name: 'Mobile App Design with Figma',
    description: 'Design iOS and Android apps with modern patterns.',
    price: 69.99,
    categorySlug: 'ui-ux',
    refundPolicy: '30_days' as const,
    picsumId: 602,
  },
  {
    name: 'Print Design Essentials',
    description: 'Brochures, posters, and packaging design techniques.',
    price: 59.99,
    categorySlug: 'graphic-design',
    refundPolicy: '30_days' as const,
    picsumId: 611,
  },

  // Drawing & Painting (6 products)
  {
    name: 'Watercolor Landscapes',
    description: 'Capture nature with loose, expressive watercolor techniques.',
    price: 54.99,
    categorySlug: 'watercolor',
    refundPolicy: '30_days' as const,
    picsumId: 15,
  },
  {
    name: 'Acrylic Painting Fundamentals',
    description: 'Color mixing, brushwork, and composition basics.',
    price: 44.99,
    categorySlug: 'acrylic',
    refundPolicy: '30_days' as const,
    picsumId: 16,
  },
  {
    name: 'Oil Painting Portrait Course',
    description: 'Classical techniques for lifelike oil portraits.',
    price: 89.99,
    categorySlug: 'oil',
    refundPolicy: '30_days' as const,
    picsumId: 17,
  },
  {
    name: 'Soft Pastel Florals',
    description: 'Create vibrant flower paintings with soft pastels.',
    price: 39.99,
    categorySlug: 'pastel',
    refundPolicy: '14_days' as const,
    picsumId: 18,
  },
  {
    name: 'Charcoal Drawing Mastery',
    description: 'Value, texture, and dramatic contrast techniques.',
    price: 49.99,
    categorySlug: 'charcoal',
    refundPolicy: '30_days' as const,
    picsumId: 19,
  },
  {
    name: 'Urban Sketching with Watercolor',
    description: 'Quick on-location sketching and painting methods.',
    price: 59.99,
    categorySlug: 'watercolor',
    refundPolicy: '30_days' as const,
    picsumId: 21,
  },

  // Music (6 products)
  {
    name: 'Songwriting Workshop',
    description: 'Write memorable melodies and compelling lyrics.',
    price: 69.99,
    categorySlug: 'songwriting',
    refundPolicy: '30_days' as const,
    picsumId: 145,
  },
  {
    name: 'Music Production From Zero to Hero',
    description: 'Create professional tracks using Ableton Live.',
    price: 149.99,
    categorySlug: 'music-production',
    refundPolicy: '60_days' as const,
    picsumId: 152,
  },
  {
    name: 'Music Theory Essentials',
    description: 'Scales, chords, and progressions for any musician.',
    price: 49.99,
    categorySlug: 'music-theory',
    refundPolicy: '30_days' as const,
    picsumId: 164,
  },
  {
    name: 'History of Jazz',
    description: 'From New Orleans to modern jazz fusion.',
    price: 34.99,
    categorySlug: 'music-history',
    refundPolicy: '14_days' as const,
    picsumId: 177,
  },
  {
    name: 'Logic Pro X Complete Guide',
    description: 'Professional music production on Mac.',
    price: 119.99,
    categorySlug: 'music-production',
    refundPolicy: '30_days' as const,
    picsumId: 193,
  },
  {
    name: 'Advanced Chord Progressions',
    description: 'Jazz voicings and extended harmonies.',
    price: 59.99,
    categorySlug: 'music-theory',
    refundPolicy: '30_days' as const,
    picsumId: 214,
  },

  // Photography (6 products)
  {
    name: 'Portrait Photography Essentials',
    description: 'Master lighting, composition, and post-processing.',
    price: 59.99,
    categorySlug: 'portrait',
    refundPolicy: '30_days' as const,
    picsumId: 64,
  },
  {
    name: 'Landscape Photography Masterclass',
    description: 'Capture stunning vistas with advanced techniques.',
    price: 79.99,
    categorySlug: 'landscape',
    refundPolicy: '30_days' as const,
    picsumId: 10,
  },
  {
    name: 'Street Photography Documentary',
    description: 'Tell stories through candid urban photography.',
    price: 49.99,
    categorySlug: 'street-photography',
    refundPolicy: '14_days' as const,
    picsumId: 122,
  },
  {
    name: 'Wildlife & Nature Photography',
    description: 'Patience, timing, and gear for nature shots.',
    price: 89.99,
    categorySlug: 'nature',
    refundPolicy: '30_days' as const,
    picsumId: 433,
  },
  {
    name: 'Macro Photography Deep Dive',
    description: 'Extreme close-ups with focus stacking techniques.',
    price: 69.99,
    categorySlug: 'macro',
    refundPolicy: '30_days' as const,
    picsumId: 106,
  },
  {
    name: 'Lightroom & Photoshop Workflow',
    description: 'Professional photo editing and color grading.',
    price: 54.99,
    categorySlug: 'portrait',
    refundPolicy: '14_days' as const,
    picsumId: 129,
  },
];

async function seed() {
  const payload = await getPayload({ config: configPromise });

  await payload.create({
    collection: 'users',
    data: {
      username: 'admin',
      password: 'admin',
      email: 'admin@admin.com',
      roles: ['super-admin'],
    },
  });

  const seedTenant = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: 'demo-store' } },
    limit: 1,
  });

  let tenantId: string;
  if (seedTenant.docs.length === 0) {
    const newTenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Demo Store',
        slug: 'demo-store',
        stripeConnectAccountId: 'acct_demo_seed',
        stripeDetailsSubmitted: true,
      },
    });
    tenantId = newTenant.id;
  } else {
    tenantId = seedTenant.docs[0]!.id;
  }

  for (const category of categories) {
    const existingParent = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: category.slug,
        },
        parent: {
          exists: false,
        },
      },
      limit: 1,
    });

    let parentCategory;
    if (existingParent.docs.length > 0) {
      parentCategory = existingParent.docs[0];
    } else {
      parentCategory = await payload.create({
        collection: 'categories',
        data: {
          name: category.name,
          slug: category.slug,
          color: category.color,
          parent: null,
        },
      });
    }

    for (const subcategory of category.subcategories ?? []) {
      const existingSubcategory = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: subcategory.slug,
          },
          parent: {
            equals: parentCategory?.id,
          },
        },
        limit: 1,
      });

      if (existingSubcategory.docs.length === 0) {
        await payload.create({
          collection: 'categories',
          data: {
            name: subcategory.name,
            slug: subcategory.slug,
            parent: parentCategory?.id,
          },
        });
      }
    }
  }

  for (const product of products) {
    const existingProduct = await payload.find({
      collection: 'products',
      where: {
        name: {
          equals: product.name,
        },
      },
      limit: 1,
    });

    if (existingProduct.docs.length === 0) {
      const category = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: product.categorySlug,
          },
        },
        limit: 1,
      });

      let imageId: string | undefined;

      try {
        console.log(`Downloading image for: ${product.name}`);
        const imageBuffer = await fetchImageBuffer(product.picsumId);
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: product.name,
          },
          file: {
            data: imageBuffer,
            name: `product-${product.picsumId}.jpg`,
            mimetype: 'image/jpeg',
            size: imageBuffer.length,
          },
        });
        imageId = media.id;
      } catch (error) {
        console.error(`Failed to upload image for ${product.name}:`, error);
      }

      await payload.create({
        collection: 'products',
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: category.docs[0]?.id,
          refundPolicy: product.refundPolicy,
          tenant: tenantId,
          image: imageId,
        },
      });
    }
  }
}

try {
  await seed();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
