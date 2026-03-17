import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { stripe } from '@/lib/stripe';
import { toLexicalDescription } from '@/lib/lexical';

type RefundPolicy = '7_days' | '14_days' | '30_days' | '60_days' | 'no_refund';

interface CategoryDef {
  name: string;
  slug: string;
  color?: string;
  subcategories?: { name: string; slug: string }[];
}

interface ProductDef {
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  refundPolicy: RefundPolicy;
  picsumId: number;
}

interface TenantDef {
  name: string;
  slug: string;
  products: ProductDef[];
}

interface UserDef {
  username: string;
  email: string;
  password: string;
  roles: ('super-admin' | 'user')[];
  tenantSlug?: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Business & Money',
    slug: 'business-money',
    color: '#FFB347',
    subcategories: [
      { name: 'Entrepreneurship', slug: 'entrepreneurship' },
      { name: 'Marketing & Sales', slug: 'marketing-sales' },
      { name: 'Investing', slug: 'investing' },
    ],
  },
  {
    name: 'Software Development',
    slug: 'software-development',
    color: '#7EC8E3',
    subcategories: [
      { name: 'Web Development', slug: 'web-development' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Mobile Development', slug: 'mobile-development' },
    ],
  },
  {
    name: 'Design',
    slug: 'design',
    color: '#B5B9FF',
    subcategories: [
      { name: 'UI/UX', slug: 'ui-ux' },
      { name: 'Graphic Design', slug: 'graphic-design' },
      { name: 'Typography', slug: 'typography' },
    ],
  },
  {
    name: 'Self Improvement',
    slug: 'self-improvement',
    color: '#96E6B3',
    subcategories: [
      { name: 'Productivity', slug: 'productivity' },
      { name: 'Mindfulness', slug: 'mindfulness' },
      { name: 'Career Growth', slug: 'career-growth' },
    ],
  },
  {
    name: 'Writing & Publishing',
    slug: 'writing-publishing',
    color: '#D8B5FF',
    subcategories: [
      { name: 'Copywriting', slug: 'copywriting' },
      { name: 'Fiction', slug: 'fiction' },
      { name: 'Blogging', slug: 'blogging' },
    ],
  },
  {
    name: 'Photography',
    slug: 'photography',
    color: '#FF6B6B',
    subcategories: [
      { name: 'Portrait', slug: 'portrait' },
      { name: 'Landscape', slug: 'landscape' },
      { name: 'Street Photography', slug: 'street-photography' },
    ],
  },
];

const TENANTS: TenantDef[] = [
  {
    name: 'Knowledge Hub',
    slug: 'knowledge-hub',
    products: [
      {
        name: 'The Startup Founders Playbook',
        description:
          'From idea validation to first $10k MRR — a no-fluff entrepreneurship guide.',
        price: 149.99,
        categorySlug: 'entrepreneurship',
        refundPolicy: '30_days',
        picsumId: 20,
      },
      {
        name: 'Digital Marketing That Converts',
        description:
          'SEO, paid ads, and email strategies that turn clicks into paying customers.',
        price: 129.99,
        categorySlug: 'marketing-sales',
        refundPolicy: '30_days',
        picsumId: 96,
      },
      {
        name: 'Index Fund Investing 101',
        description:
          'Build long-term wealth through smart, low-cost index fund strategies.',
        price: 59.99,
        categorySlug: 'investing',
        refundPolicy: '30_days',
        picsumId: 48,
      },
      {
        name: 'Full-Stack TypeScript with Next.js',
        description:
          'End-to-end type-safe applications using Next.js 15, tRPC, and Prisma.',
        price: 149.99,
        categorySlug: 'web-development',
        refundPolicy: '30_days',
        picsumId: 6,
      },
      {
        name: 'DevOps with Docker & Kubernetes',
        description:
          'Container orchestration and CI/CD pipelines for modern applications.',
        price: 109.99,
        categorySlug: 'devops',
        refundPolicy: '30_days',
        picsumId: 5,
      },
      {
        name: 'React Native Mobile Apps',
        description:
          'Build cross-platform iOS and Android apps with a single codebase.',
        price: 99.99,
        categorySlug: 'mobile-development',
        refundPolicy: '14_days',
        picsumId: 2,
      },
      {
        name: 'UI/UX Design Masterclass',
        description:
          'Modern design principles, Figma workflows, and real-world case studies.',
        price: 79.99,
        categorySlug: 'ui-ux',
        refundPolicy: '30_days',
        picsumId: 546,
      },
      {
        name: 'Brand Identity System',
        description:
          'Create cohesive brand identities from logo to full guidelines.',
        price: 99.99,
        categorySlug: 'graphic-design',
        refundPolicy: '30_days',
        picsumId: 550,
      },
      {
        name: 'Typography That Works',
        description:
          'Master font pairing, hierarchy, and readability for any medium.',
        price: 49.99,
        categorySlug: 'typography',
        refundPolicy: '14_days',
        picsumId: 593,
      },
      {
        name: 'Productivity System for Makers',
        description:
          'Time-blocking, deep work, and async-first workflows for builders.',
        price: 29.99,
        categorySlug: 'productivity',
        refundPolicy: '7_days',
        picsumId: 403,
      },
      {
        name: '30-Day Mindfulness Program',
        description:
          'Guided meditation and stress management techniques backed by research.',
        price: 49.99,
        categorySlug: 'mindfulness',
        refundPolicy: '30_days',
        picsumId: 433,
      },
      {
        name: 'Career Pivot Playbook',
        description:
          'Successfully transition into a new industry in 90 days or less.',
        price: 79.99,
        categorySlug: 'career-growth',
        refundPolicy: '30_days',
        picsumId: 447,
      },
      {
        name: 'High-Converting Copywriting',
        description:
          'Write sales pages, email sequences, and ads that close deals.',
        price: 89.99,
        categorySlug: 'copywriting',
        refundPolicy: '30_days',
        picsumId: 160,
      },
      {
        name: 'Write Your First Novel in 90 Days',
        description:
          'Structured approach from blank page to finished manuscript.',
        price: 49.99,
        categorySlug: 'fiction',
        refundPolicy: '30_days',
        picsumId: 24,
      },
      {
        name: 'Professional Blogging System',
        description:
          'Build a content engine that ranks on Google and converts readers.',
        price: 39.99,
        categorySlug: 'blogging',
        refundPolicy: '14_days',
        picsumId: 119,
      },
      {
        name: 'Portrait Photography Essentials',
        description:
          'Master lighting, posing, and post-processing for stunning portraits.',
        price: 59.99,
        categorySlug: 'portrait',
        refundPolicy: '30_days',
        picsumId: 64,
      },
      {
        name: 'Landscape Photography Masterclass',
        description:
          'Capture epic scenery with composition and light management techniques.',
        price: 79.99,
        categorySlug: 'landscape',
        refundPolicy: '30_days',
        picsumId: 10,
      },
      {
        name: 'Street Photography Documentary',
        description:
          'Tell compelling stories through candid, ethical urban photography.',
        price: 49.99,
        categorySlug: 'street-photography',
        refundPolicy: '14_days',
        picsumId: 122,
      },
    ],
  },
  {
    name: 'Creative Corner',
    slug: 'creative-corner',
    products: [
      {
        name: 'Side Hustle to Full-Time Income',
        description:
          'Launch profitable side projects without quitting your day job.',
        price: 39.99,
        categorySlug: 'entrepreneurship',
        refundPolicy: '14_days',
        picsumId: 26,
      },
      {
        name: 'Social Media Sales Funnel',
        description:
          'Turn Instagram and LinkedIn followers into paying customers.',
        price: 69.99,
        categorySlug: 'marketing-sales',
        refundPolicy: '14_days',
        picsumId: 60,
      },
      {
        name: 'Real Estate Investing Basics',
        description:
          'Evaluate deals, understand cash flow, and buy your first property.',
        price: 89.99,
        categorySlug: 'investing',
        refundPolicy: '30_days',
        picsumId: 274,
      },
      {
        name: 'The Complete Web Developer Bootcamp',
        description:
          'HTML, CSS, JavaScript, React, Node.js — everything from scratch.',
        price: 89.99,
        categorySlug: 'web-development',
        refundPolicy: '30_days',
        picsumId: 0,
      },
      {
        name: 'Rust Programming Deep Dive',
        description: 'Master memory safety and fearless concurrency with Rust.',
        price: 79.99,
        categorySlug: 'devops',
        refundPolicy: '14_days',
        picsumId: 4,
      },
      {
        name: 'Unity Game Development',
        description: 'Create 2D and 3D games from scratch using Unity and C#.',
        price: 119.99,
        categorySlug: 'mobile-development',
        refundPolicy: '30_days',
        picsumId: 3,
      },
      {
        name: 'Mobile App Design with Figma',
        description:
          'Design modern iOS and Android apps using Figma component system.',
        price: 69.99,
        categorySlug: 'ui-ux',
        refundPolicy: '30_days',
        picsumId: 602,
      },
      {
        name: 'Print Design Essentials',
        description:
          'Brochures, posters, and packaging design with industry techniques.',
        price: 59.99,
        categorySlug: 'graphic-design',
        refundPolicy: '30_days',
        picsumId: 611,
      },
      {
        name: 'Blender 3D Modeling Complete',
        description:
          'Go from beginner to advanced 3D modeling and photorealistic rendering.',
        price: 129.99,
        categorySlug: 'typography',
        refundPolicy: '60_days',
        picsumId: 569,
      },
      {
        name: 'Deep Work Mastery',
        description:
          'Eliminate distractions and produce your most meaningful work daily.',
        price: 39.99,
        categorySlug: 'productivity',
        refundPolicy: '14_days',
        picsumId: 452,
      },
      {
        name: 'Public Speaking Confidence',
        description:
          'Overcome fear of public speaking and deliver presentations that land.',
        price: 59.99,
        categorySlug: 'mindfulness',
        refundPolicy: '30_days',
        picsumId: 469,
      },
      {
        name: 'Atomic Habits for Creators',
        description:
          'Build daily habits that compound over time into extraordinary results.',
        price: 34.99,
        categorySlug: 'career-growth',
        refundPolicy: '14_days',
        picsumId: 429,
      },
      {
        name: 'Non-Fiction Writing Blueprint',
        description:
          'Research, structure, and write books that people actually finish.',
        price: 59.99,
        categorySlug: 'copywriting',
        refundPolicy: '30_days',
        picsumId: 42,
      },
      {
        name: 'Self-Publishing Success Formula',
        description:
          'Launch and market your book on Amazon KDP for passive income.',
        price: 69.99,
        categorySlug: 'fiction',
        refundPolicy: '30_days',
        picsumId: 180,
      },
      {
        name: 'Story Structure Masterclass',
        description:
          'Three-act structure and character arcs that captivate readers.',
        price: 44.99,
        categorySlug: 'blogging',
        refundPolicy: '14_days',
        picsumId: 201,
      },
      {
        name: 'Macro Photography Deep Dive',
        description:
          'Extreme close-up photography with focus stacking and lighting rigs.',
        price: 69.99,
        categorySlug: 'portrait',
        refundPolicy: '30_days',
        picsumId: 106,
      },
      {
        name: 'Wildlife & Nature Photography',
        description:
          'Patience, timing, and gear selection for breathtaking nature shots.',
        price: 89.99,
        categorySlug: 'landscape',
        refundPolicy: '30_days',
        picsumId: 16,
      },
      {
        name: 'Lightroom & Photoshop Workflow',
        description:
          'Professional photo editing, color grading, and batch export techniques.',
        price: 54.99,
        categorySlug: 'street-photography',
        refundPolicy: '14_days',
        picsumId: 129,
      },
    ],
  },
];

const SUPER_ADMIN: UserDef = {
  username: 'superadmin',
  email: 'admin@demo.com',
  password: 'Admin1234!',
  roles: ['super-admin'],
};

const TENANT_ADMINS: UserDef[] = [
  {
    username: 'knowledge-admin',
    email: 'admin@knowledge-hub.com',
    password: 'Admin1234!',
    roles: ['user'],
    tenantSlug: 'knowledge-hub',
  },
  {
    username: 'creative-admin',
    email: 'admin@creative-corner.com',
    password: 'Admin1234!',
    roles: ['user'],
    tenantSlug: 'creative-corner',
  },
];

const CUSTOMERS: UserDef[] = [
  {
    username: 'alice-johnson',
    email: 'alice@example.com',
    password: 'Customer1234!',
    roles: ['user'],
    tenantSlug: 'knowledge-hub',
  },
  {
    username: 'bob-smith',
    email: 'bob@example.com',
    password: 'Customer1234!',
    roles: ['user'],
    tenantSlug: 'knowledge-hub',
  },
  {
    username: 'carol-white',
    email: 'carol@example.com',
    password: 'Customer1234!',
    roles: ['user'],
    tenantSlug: 'knowledge-hub',
  },
  {
    username: 'david-lee',
    email: 'david@example.com',
    password: 'Customer1234!',
    roles: ['user'],
    tenantSlug: 'creative-corner',
  },
  {
    username: 'eva-martin',
    email: 'eva@example.com',
    password: 'Customer1234!',
    roles: ['user'],
    tenantSlug: 'creative-corner',
  },
];

async function fetchImageBuffer(picsumId: number): Promise<Buffer> {
  const res = await fetch(`https://picsum.photos/id/${picsumId}/800/600`);
  if (!res.ok) {
    const fallback = await fetch('https://picsum.photos/800/600');
    return Buffer.from(await fallback.arrayBuffer());
  }
  return Buffer.from(await res.arrayBuffer());
}

function log(section: string, msg: string) {
  console.log(`[${section}] ${msg}`);
}

const REVIEW_DESCRIPTIONS = [
  'Exactly what I needed. Clear and actionable.',
  'Solid content, well structured. Would recommend.',
  'Good value for the price. Learned a lot.',
  'Helpful course with practical examples.',
  'Best purchase I made this year.',
];

async function seedReviews(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantIdMap: Record<string, string>,
) {
  const knowledgeHubId = tenantIdMap['knowledge-hub'];
  if (!knowledgeHubId) return;

  const productsRes = await payload.find({
    collection: 'products',
    where: { tenant: { equals: knowledgeHubId } },
    limit: 6,
    pagination: false,
  });
  const productIds = productsRes.docs.map((p) => p.id);

  const usersRes = await payload.find({
    collection: 'users',
    where: {
      email: {
        in: [
          'alice@example.com',
          'bob@example.com',
          'carol@example.com',
          'admin@knowledge-hub.com',
          'admin@creative-corner.com',
        ],
      },
    },
    limit: 5,
    pagination: false,
  });
  const userIds = usersRes.docs.map((u) => u.id);
  if (productIds.length === 0 || userIds.length === 0) return;

  let created = 0;
  const reviewsPerProduct = [5, 4, 3, 2, 1, 0];
  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i]!;
    const count = reviewsPerProduct[i] ?? 0;
    for (let j = 0; j < count; j++) {
      const userId = userIds[j % userIds.length]!;
      const existing = await payload.find({
        collection: 'reviews',
        where: { product: { equals: productId }, user: { equals: userId } },
        limit: 1,
      });
      if (existing.docs.length > 0) continue;

      await payload.create({
        collection: 'reviews',
        data: {
          description: REVIEW_DESCRIPTIONS[j % REVIEW_DESCRIPTIONS.length]!,
          rating: 3 + (j % 3),
          product: productId,
          user: userId,
        },
        overrideAccess: true,
      });
      created++;
    }
  }
  log('reviews', `  created ${created} reviews across ${productIds.length} products`);
}

async function seedOrders(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantIdMap: Record<string, string>,
  customerIds: string[],
) {
  const tenantIds = Object.values(tenantIdMap);
  if (tenantIds.length === 0 || customerIds.length === 0) return;

  const productsRes = await payload.find({
    collection: 'products',
    where: { tenant: { in: tenantIds } },
    limit: 6,
    pagination: false,
  });
  const productIds = productsRes.docs.map((p) => p.id);
  if (productIds.length === 0) return;

  const tenantsRes = await payload.find({
    collection: 'tenants',
    where: { id: { in: tenantIds } },
    limit: 10,
    pagination: false,
  });
  const stripeAccountByTenant = Object.fromEntries(
    tenantsRes.docs.map((t) => [t.id, t.stripeConnectAccountId ?? '']),
  );

  let created = 0;
  const ordersPerProduct = [4, 3, 2, 1, 5, 0];
  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i]!;
    const product = productsRes.docs[i];
    const tenantId = typeof product?.tenant === 'string' ? product.tenant : product?.tenant?.id;
    const stripeAccountId = tenantId ? stripeAccountByTenant[tenantId] ?? '' : '';
    const count = ordersPerProduct[i] ?? 0;

    for (let j = 0; j < count; j++) {
      const userId = customerIds[j % customerIds.length]!;
      const sessionId = `cs_seed_${Date.now()}_${i}_${j}_${productId}`;
      const existing = await payload.find({
        collection: 'orders',
        where: { stripeCheckoutSessionId: { equals: sessionId } },
        limit: 1,
      });
      if (existing.docs.length > 0) continue;

      await payload.create({
        collection: 'orders',
        data: {
          name: `Order ${j + 1} for product`,
          user: userId,
          product: productId,
          stripeCheckoutSessionId: sessionId,
          ...(stripeAccountId ? { stripeAccountId } : {}),
        },
        overrideAccess: true,
      });
      created++;
    }
  }
  log('orders', `  created ${created} orders across ${productIds.length} products`);
}

async function seedCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  log('categories', 'Seeding...');

  for (const cat of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug }, parent: { exists: false } },
      limit: 1,
    });

    let parentId: string;

    if (existing.docs.length > 0) {
      parentId = existing.docs[0]!.id;
      log('categories', `  skip: ${cat.name}`);
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          name: cat.name,
          slug: cat.slug,
          color: cat.color ?? null,
          parent: null,
        },
      });
      parentId = created.id;
      log('categories', `  created: ${cat.name}`);
    }

    for (const sub of cat.subcategories ?? []) {
      const existingSub = await payload.find({
        collection: 'categories',
        where: { slug: { equals: sub.slug }, parent: { equals: parentId } },
        limit: 1,
      });
      if (existingSub.docs.length === 0) {
        await payload.create({
          collection: 'categories',
          data: { name: sub.name, slug: sub.slug, parent: parentId },
        });
        log('categories', `    created sub: ${sub.name}`);
      }
    }
  }
}

async function seedTenant(
  payload: Awaited<ReturnType<typeof getPayload>>,
  def: TenantDef,
): Promise<string> {
  const existing = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: def.slug } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    log('tenants', `skip: ${def.name}`);
    return existing.docs[0]!.id;
  }

  const account = await stripe.accounts.create({});
  if (!account)
    throw new Error(`Stripe account creation failed for ${def.name}`);

  const tenant = await payload.create({
    collection: 'tenants',
    data: {
      name: def.name,
      slug: def.slug,
      stripeConnectAccountId: account.id,
      stripeDetailsSubmitted: true,
    },
  });

  log('tenants', `created: ${def.name}`);
  return tenant.id;
}

async function seedProducts(
  payload: Awaited<ReturnType<typeof getPayload>>,
  tenantId: string,
  products: ProductDef[],
) {
  log('products', `Seeding ${products.length} products...`);

  for (const product of products) {
    const existing = await payload.find({
      collection: 'products',
      where: {
        name: { equals: product.name },
        tenant: { equals: tenantId },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      log('products', `  skip: ${product.name}`);
      continue;
    }

    const categoryResult = await payload.find({
      collection: 'categories',
      where: { slug: { equals: product.categorySlug } },
      limit: 1,
    });
    const categoryId = categoryResult.docs[0]?.id;

    let imageId: string | undefined;
    try {
      const buffer = await fetchImageBuffer(product.picsumId);
      const media = await payload.create({
        collection: 'media',
        data: { alt: product.name },
        file: {
          data: buffer,
          name: `product-${product.picsumId}-${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
          size: buffer.length,
        },
      });
      imageId = media.id;
    } catch (err) {
      console.warn(
        `  [products] image upload failed for "${product.name}":`,
        err,
      );
    }

    await payload.create({
      collection: 'products',
      data: {
        name: product.name,
        description: toLexicalDescription(product.description),
        price: product.price,
        category: categoryId,
        refundPolicy: product.refundPolicy,
        tenant: tenantId,
        ...(imageId ? { image: imageId } : {}),
      },
    });

    log('products', `  created: ${product.name}`);
  }
}

async function seedUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: UserDef,
  tenantIdMap: Record<string, string>,
): Promise<string> {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: user.email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    log('users', `  skip: ${user.email}`);
    return existing.docs[0]!.id;
  }

  const tenantId = user.tenantSlug ? tenantIdMap[user.tenantSlug] : undefined;

  const created = await payload.create({
    collection: 'users',
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
      roles: user.roles,
      ...(tenantId ? { tenants: [{ tenant: tenantId }] } : {}),
    },
  });

  log(
    'users',
    `  created: ${user.email} [${user.roles.join(', ')}]${user.tenantSlug ? ` → ${user.tenantSlug}` : ''}`,
  );
  return created.id;
}

async function seed() {
  const payload = await getPayload({ config: configPromise });

  console.log('\n══════════════════════════════');
  console.log('  CLARO SEED');
  console.log('══════════════════════════════\n');

  await seedCategories(payload);

  log('users', 'Seeding super admin...');
  const superAdminId = await seedUser(payload, SUPER_ADMIN, {});

  const tenantIdMap: Record<string, string> = {};
  for (const tenantDef of TENANTS) {
    const tenantId = await seedTenant(payload, tenantDef);
    tenantIdMap[tenantDef.slug] = tenantId;
    await seedProducts(payload, tenantId, tenantDef.products);
  }

  await payload.update({
    collection: 'users',
    id: superAdminId,
    data: {
      tenants: Object.values(tenantIdMap).map((id) => ({ tenant: id })),
    },
  });
  log(
    'users',
    `super-admin assigned to: ${Object.keys(tenantIdMap).join(', ')}`,
  );

  log('users', 'Seeding tenant admins...');
  for (const admin of TENANT_ADMINS) {
    await seedUser(payload, admin, tenantIdMap);
  }

  log('users', 'Seeding customers...');
  const customerIds: string[] = [];
  for (const customer of CUSTOMERS) {
    const id = await seedUser(payload, customer, tenantIdMap);
    customerIds.push(id);
  }

  log('reviews', 'Seeding reviews...');
  await seedReviews(payload, tenantIdMap);

  log('orders', 'Seeding orders...');
  await seedOrders(payload, tenantIdMap, customerIds);

  const totalProducts = TENANTS.reduce((acc, t) => acc + t.products.length, 0);
  const totalSubs = CATEGORIES.reduce(
    (acc, c) => acc + (c.subcategories?.length ?? 0),
    0,
  );

  console.log('\n══════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('══════════════════════════════');
  console.log(`  Tenants      ${TENANTS.length}`);
  console.log(
    `  Categories   ${CATEGORIES.length} parent + ${totalSubs} subcategories`,
  );
  console.log(
    `  Products     ${totalProducts} total (${totalProducts / TENANTS.length} per tenant)`,
  );
  console.log(
    `  Users        1 super-admin + ${TENANT_ADMINS.length} tenant-admins + ${CUSTOMERS.length} customers`,
  );
  console.log('  Reviews & Orders  seeded with varying counts (trending/bestsellers)');
  console.log('\n  Credentials');
  console.log(`    ${SUPER_ADMIN.email}  /  ${SUPER_ADMIN.password}`);
  TENANT_ADMINS.forEach((u) =>
    console.log(`    ${u.email}  /  ${u.password}  [${u.tenantSlug}]`),
  );
  console.log(`    alice@example.com ... eva@example.com  /  Customer1234!`);
  console.log('══════════════════════════════\n');
}

try {
  await seed();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
