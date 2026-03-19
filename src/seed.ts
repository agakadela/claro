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
  /** Storefront / marketing copy (visible before purchase). */
  description: string;
  /** Post-purchase body (library). Seed catalog sets this on every product; omit only if you want empty buyer content. */
  content?: string;
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
        content:
          'Welcome to your buyer area. Module 1: Problem discovery interviews — scripts and a Notion template. Module 2: Building a waitlist before you code. Module 3: Pricing and your first 10 paying customers. Module 4: Metrics that matter pre–$10k MRR. Download: one-page investor update template (PDF).',
        price: 149.99,
        categorySlug: 'entrepreneurship',
        refundPolicy: '30_days',
        picsumId: 20,
      },
      {
        name: 'Digital Marketing That Converts',
        description:
          'SEO, paid ads, and email strategies that turn clicks into paying customers.',
        content:
          'Your buyer hub: Module 1 — Technical SEO audit spreadsheet and keyword map template. Module 2 — Google Ads search campaign structure (with negative keyword lists). Module 3 — Meta Ads creative testing framework. Module 4 — Email welcome + nurture sequence outlines. Bonus: landing page copy checklist (PDF).',
        price: 129.99,
        categorySlug: 'marketing-sales',
        refundPolicy: '30_days',
        picsumId: 96,
      },
      {
        name: 'Index Fund Investing 101',
        description:
          'Build long-term wealth through smart, low-cost index fund strategies.',
        content:
          'Welcome. Part A: Asset allocation by age and risk — worksheet. Part B: Choosing broad-market ETFs and expense ratios explained. Part C: Tax-advantaged accounts (IRA/401k) decision tree. Part D: Rebalancing rules and dollar-cost averaging calendar. Download: net-worth tracker (Google Sheet).',
        price: 59.99,
        categorySlug: 'investing',
        refundPolicy: '30_days',
        picsumId: 48,
      },
      {
        name: 'Full-Stack TypeScript with Next.js',
        description:
          'End-to-end type-safe applications using Next.js 15, tRPC, and Prisma.',
        content:
          'You now have access to the full course materials. Week 1–2: App Router, Server Components, and data fetching patterns. Week 3–4: tRPC routers, Zod, and TanStack Query on the client. Week 5–6: Prisma schema design, migrations, and production Postgres. Capstone: deploy a typed marketplace clone to Vercel. Repo link and environment checklist are in your welcome email.',
        price: 149.99,
        categorySlug: 'web-development',
        refundPolicy: '30_days',
        picsumId: 6,
      },
      {
        name: 'DevOps with Docker & Kubernetes',
        description:
          'Container orchestration and CI/CD pipelines for modern applications.',
        content:
          'Access unlocked. Lab 1: Dockerfile best practices + multi-stage builds. Lab 2: docker-compose for local stacks. Lab 3: Kubernetes Deployments, Services, Ingress — YAML examples. Lab 4: GitHub Actions pipeline for build, test, deploy. Reference: health checks, resource limits, and secrets handling cheat sheet.',
        price: 109.99,
        categorySlug: 'devops',
        refundPolicy: '30_days',
        picsumId: 5,
      },
      {
        name: 'React Native Mobile Apps',
        description:
          'Build cross-platform iOS and Android apps with a single codebase.',
        content:
          'Course materials: Setup (Expo vs bare workflow). Navigation patterns (stack + tabs). State and data fetching. Native modules overview. Building and shipping to TestFlight / Play Internal Testing. Starter app repo with commented commits per lesson.',
        price: 99.99,
        categorySlug: 'mobile-development',
        refundPolicy: '14_days',
        picsumId: 2,
      },
      {
        name: 'UI/UX Design Masterclass',
        description:
          'Modern design principles, Figma workflows, and real-world case studies.',
        content:
          'Buyer resources: Design thinking workshop slides. Figma auto-layout and component library walkthrough. Heuristic evaluation template. Case study breakdowns (before/after). Accessibility checklist (WCAG-focused) for handoff to dev.',
        price: 79.99,
        categorySlug: 'ui-ux',
        refundPolicy: '30_days',
        picsumId: 546,
      },
      {
        name: 'Brand Identity System',
        description:
          'Create cohesive brand identities from logo to full guidelines.',
        content:
          'Deliverables pack: Logo usage rules (clear space, min size). Color system (primary, secondary, neutrals) with hex codes. Type scale for web and print. Voice & tone one-pager. Brand guidelines PDF template you can duplicate for clients.',
        price: 99.99,
        categorySlug: 'graphic-design',
        refundPolicy: '30_days',
        picsumId: 550,
      },
      {
        name: 'Typography That Works',
        description:
          'Master font pairing, hierarchy, and readability for any medium.',
        content:
          'Your library: Pairing matrix (serif + sans combinations). Hierarchy exercises with annotated examples. Optical sizing and line-length rules. Web font loading notes (FOUT/FOIT). Printable type specimen worksheet.',
        price: 49.99,
        categorySlug: 'typography',
        refundPolicy: '14_days',
        picsumId: 593,
      },
      {
        name: 'Productivity System for Makers',
        description:
          'Time-blocking, deep work, and async-first workflows for builders.',
        content:
          'Included: Weekly planning template (Notion/Markdown). Time-block calendar examples for makers. Async communication policy snippet for teams. “Maker vs manager” day split scenarios. Energy tracking log (simple) for finding your peak hours.',
        price: 29.99,
        categorySlug: 'productivity',
        refundPolicy: '7_days',
        picsumId: 403,
      },
      {
        name: '30-Day Mindfulness Program',
        description:
          'Guided meditation and stress management techniques backed by research.',
        content:
          'Your 30-day calendar is unlocked. Days 1–10: breath and body scan (10 min audio tracks). Days 11–20: working with difficult emotions — journaling prompts included. Days 21–30: integrating practice into a busy schedule. Bonus: printable habit tracker and evening wind-down script.',
        price: 49.99,
        categorySlug: 'mindfulness',
        refundPolicy: '30_days',
        picsumId: 433,
      },
      {
        name: 'Career Pivot Playbook',
        description:
          'Successfully transition into a new industry in 90 days or less.',
        content:
          '90-day roadmap PDF. Week-by-week milestones: skills audit, target role definition, networking scripts, resume + LinkedIn refresh, interview story bank. Informational interview question bank. Salary negotiation talking points.',
        price: 79.99,
        categorySlug: 'career-growth',
        refundPolicy: '30_days',
        picsumId: 447,
      },
      {
        name: 'High-Converting Copywriting',
        description:
          'Write sales pages, email sequences, and ads that close deals.',
        content:
          'Swipe file starter: headline formulas, PAS and AIDA outlines, long-form sales page section order. Email sequence map (5-email launch). Ad hooks by platform. Editing checklist before publish. Example teardown of a high-converting page.',
        price: 89.99,
        categorySlug: 'copywriting',
        refundPolicy: '30_days',
        picsumId: 160,
      },
      {
        name: 'Write Your First Novel in 90 Days',
        description:
          'Structured approach from blank page to finished manuscript.',
        content:
          'Daily word-count tracker. Outline methods (three-act + beat sheet). Character questionnaire. Scene checklist. Revision passes order (structure → scene → line). “Stuck day” prompts list for when momentum drops.',
        price: 49.99,
        categorySlug: 'fiction',
        refundPolicy: '30_days',
        picsumId: 24,
      },
      {
        name: 'Professional Blogging System',
        description:
          'Build a content engine that ranks on Google and converts readers.',
        content:
          'System kit: Content calendar template. Keyword research workflow (free tools). Article brief template (H2 outline, intent, CTA). Internal linking map. Repurposing checklist (blog → newsletter → social). Basic analytics dashboard fields to track monthly.',
        price: 39.99,
        categorySlug: 'blogging',
        refundPolicy: '14_days',
        picsumId: 119,
      },
      {
        name: 'Portrait Photography Essentials',
        description:
          'Master lighting, posing, and post-processing for stunning portraits.',
        content:
          'Resources: Lighting diagrams (key, fill, rim). Posing flow for individuals and couples. Camera settings starting points (aperture for portraits). Lightroom portrait preset starter + brush usage notes. Client prep email template.',
        price: 59.99,
        categorySlug: 'portrait',
        refundPolicy: '30_days',
        picsumId: 64,
      },
      {
        name: 'Landscape Photography Masterclass',
        description:
          'Capture epic scenery with composition and light management techniques.',
        content:
          'Field guide sections: Golden hour planning, filters (ND grad) when to use, composition frameworks (foreground interest, leading lines). Weather and safety checklist. Post: panorama merge and sky recovery basics. Location scouting worksheet.',
        price: 79.99,
        categorySlug: 'landscape',
        refundPolicy: '30_days',
        picsumId: 10,
      },
      {
        name: 'Street Photography Documentary',
        description:
          'Tell compelling stories through candid, ethical urban photography.',
        content:
          'Ethics and consent notes by region (overview). Project ideas (single day, recurring route, theme-based). Sequencing images for a short photo essay. Caption writing prompts. Gear minimal kit list. Gallery of composition examples with notes.',
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
        content:
          'Buyer pack: Idea validation scorecard. Time budget template (evenings/weekends). Pricing experiments for services vs digital products. First 10 customers outreach scripts. Simple P&L sheet for side income vs day job salary.',
        price: 39.99,
        categorySlug: 'entrepreneurship',
        refundPolicy: '14_days',
        picsumId: 26,
      },
      {
        name: 'Social Media Sales Funnel',
        description:
          'Turn Instagram and LinkedIn followers into paying customers.',
        content:
          'Funnel map: Top-of-funnel content pillars. Lead magnet ideas by niche. DM and comment scripts (non-spammy). Email bridge sequence after opt-in. Offer page outline. Metrics to track weekly (reach, saves, leads, sales).',
        price: 69.99,
        categorySlug: 'marketing-sales',
        refundPolicy: '14_days',
        picsumId: 60,
      },
      {
        name: 'Real Estate Investing Basics',
        description:
          'Evaluate deals, understand cash flow, and buy your first property.',
        content:
          'Toolkit: Deal analyzer spreadsheet (inputs for rent, expenses, mortgage). Cap rate and cash-on-cash explained with examples. Inspection red-flags checklist. Financing types comparison. Long-term hold vs flip decision matrix (high level).',
        price: 89.99,
        categorySlug: 'investing',
        refundPolicy: '30_days',
        picsumId: 274,
      },
      {
        name: 'The Complete Web Developer Bootcamp',
        description:
          'HTML, CSS, JavaScript, React, Node.js — everything from scratch.',
        content:
          'Thanks for purchasing — here is what you can access now. Section A: HTML semantics, forms, and accessibility checklist. Section B: CSS layout (Flexbox, Grid) with 12 exercise Figma references. Section C: JavaScript fundamentals through small DOM projects. Section D: React components, hooks, and a mini e-commerce UI. Section E: Node + Express API with JWT auth walkthrough. All starter ZIPs and solution branches are named per lesson.',
        price: 89.99,
        categorySlug: 'web-development',
        refundPolicy: '30_days',
        picsumId: 0,
      },
      {
        name: 'Rust Programming Deep Dive',
        description: 'Master memory safety and fearless concurrency with Rust.',
        content:
          'Modules: Ownership & borrowing drills with solutions. Error handling (Result, ?). Traits and generics patterns. Concurrency (threads, channels, Arc/Mutex) — when to use what. Cargo workspace layout. Exercise repo with increasing difficulty.',
        price: 79.99,
        categorySlug: 'devops',
        refundPolicy: '14_days',
        picsumId: 4,
      },
      {
        name: 'Unity Game Development',
        description: 'Create 2D and 3D games from scratch using Unity and C#.',
        content:
          'Project path: Scene setup, prefabs, physics 2D/3D basics. Player controller patterns. UI canvas and HUD. ScriptableObjects for data. Build settings for desktop/mobile. Mini-game milestones with milestone checklist.',
        price: 119.99,
        categorySlug: 'mobile-development',
        refundPolicy: '30_days',
        picsumId: 3,
      },
      {
        name: 'Mobile App Design with Figma',
        description:
          'Design modern iOS and Android apps using Figma component system.',
        content:
          'Files: iOS/Android frame sizes and safe areas. Component properties and variants for buttons, inputs, nav. Auto-layout screens for key flows. Prototype links for user testing. Handoff checklist for developers (spacing, tokens, exports).',
        price: 69.99,
        categorySlug: 'ui-ux',
        refundPolicy: '30_days',
        picsumId: 602,
      },
      {
        name: 'Print Design Essentials',
        description:
          'Brochures, posters, and packaging design with industry techniques.',
        content:
          'Print specs cheat sheet: bleed, trim, CMYK vs RGB, DPI. Brochure fold types and grid templates. Poster hierarchy example. Packaging dieline terminology. Preflight checklist before sending to printer.',
        price: 59.99,
        categorySlug: 'graphic-design',
        refundPolicy: '30_days',
        picsumId: 611,
      },
      {
        name: 'Blender 3D Modeling Complete',
        description:
          'Go from beginner to advanced 3D modeling and photorealistic rendering.',
        content:
          'Learning path: Interface and navigation. Modeling modifiers stack. UV unwrapping intro. Materials and PBR basics. Lighting setups (three-point, HDRI). Cycles vs Eevee when to use. Final render settings and denoising notes.',
        price: 129.99,
        categorySlug: 'typography',
        refundPolicy: '60_days',
        picsumId: 569,
      },
      {
        name: 'Deep Work Mastery',
        description:
          'Eliminate distractions and produce your most meaningful work daily.',
        content:
          'Buyer resources: the 90-minute deep work block protocol (step-by-step), a “shutdown complete” ritual for ending the day, and a distraction audit worksheet. Includes example calendar templates for makers vs managers and a list of approved shallow-work batch windows so you do not burn out.',
        price: 39.99,
        categorySlug: 'productivity',
        refundPolicy: '14_days',
        picsumId: 452,
      },
      {
        name: 'Public Speaking Confidence',
        description:
          'Overcome fear of public speaking and deliver presentations that land.',
        content:
          'Prep kit: Audience analysis worksheet. Opening hooks (10 types). Story spine for talks. Slide deck rules (one idea per slide). Rehearsal timer blocks. Q&A handling phrases. Pre-talk breathing routine (short script).',
        price: 59.99,
        categorySlug: 'mindfulness',
        refundPolicy: '30_days',
        picsumId: 469,
      },
      {
        name: 'Atomic Habits for Creators',
        description:
          'Build daily habits that compound over time into extraordinary results.',
        content:
          'Creator-focused: Habit stack templates (after coffee → write 200 words). Environment design checklist for deep work. Weekly review prompts. Habit tracker (simple). Failure recovery script when you miss two days.',
        price: 34.99,
        categorySlug: 'career-growth',
        refundPolicy: '14_days',
        picsumId: 429,
      },
      {
        name: 'Non-Fiction Writing Blueprint',
        description:
          'Research, structure, and write books that people actually finish.',
        content:
          'Blueprint: Research capture system (notes → claims → citations). Outline types (problem-solution, chronological). Chapter template with reader outcome per chapter. Introduction formula. Revision pass for clarity and repetition cuts.',
        price: 59.99,
        categorySlug: 'copywriting',
        refundPolicy: '30_days',
        picsumId: 42,
      },
      {
        name: 'Self-Publishing Success Formula',
        description:
          'Launch and market your book on Amazon KDP for passive income.',
        content:
          'KDP walkthrough: Metadata and categories research. Cover brief for designers. Manuscript formatting checklist. Launch week email to list template. Amazon ads basics (keywords, budgets). Review request ethical guidelines.',
        price: 69.99,
        categorySlug: 'fiction',
        refundPolicy: '30_days',
        picsumId: 180,
      },
      {
        name: 'Story Structure Masterclass',
        description:
          'Three-act structure and character arcs that captivate readers.',
        content:
          'Worksheets: Act breaks and midpoint. Character want vs need. Antagonist alignment with theme. Scene sequel (goal, conflict, disaster). Beat sheet blank. Revision questions after first draft.',
        price: 44.99,
        categorySlug: 'blogging',
        refundPolicy: '14_days',
        picsumId: 201,
      },
      {
        name: 'Macro Photography Deep Dive',
        description:
          'Extreme close-up photography with focus stacking and lighting rigs.',
        content:
          'Technical notes: Magnification and working distance. Focus stacking software workflow overview. Diffusion for harsh macro light. Common subjects (insects, products) settings starting points. Gear maintenance for extension tubes and macro lenses.',
        price: 69.99,
        categorySlug: 'portrait',
        refundPolicy: '30_days',
        picsumId: 106,
      },
      {
        name: 'Wildlife & Nature Photography',
        description:
          'Patience, timing, and gear selection for breathtaking nature shots.',
        content:
          'Field playbook: Ethical wildlife distance guidelines. Autofocus modes for birds in flight vs mammals. Weather protection for gear. Hide and blind tips. Backup and card strategy in the field. Sunrise/sunset planning app suggestions.',
        price: 89.99,
        categorySlug: 'landscape',
        refundPolicy: '30_days',
        picsumId: 16,
      },
      {
        name: 'Lightroom & Photoshop Workflow',
        description:
          'Professional photo editing, color grading, and batch export techniques.',
        content:
          'Workflow: Import presets and folder structure. Lightroom develop order (lens, exposure, color, local adjustments). When to round-trip to Photoshop. Batch export settings for web vs print. Soft proofing reminder for print jobs.',
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
    limit: 8,
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
  const ordersPerProduct = [4, 3, 2, 1, 5, 2, 3, 1];
  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i]!;
    const product = productsRes.docs[i];
    const tenantId = typeof product?.tenant === 'string' ? product.tenant : product?.tenant?.id;
    const stripeAccountId = tenantId ? stripeAccountByTenant[tenantId] ?? '' : '';
    const count = ordersPerProduct[i] ?? 1;

    for (let j = 0; j < count; j++) {
      const userId = customerIds[j % customerIds.length]!;
      const sessionId = `cs_seed_${i}_${j}_${productId}`;
      const existing = await payload.find({
        collection: 'orders',
        where: { stripeCheckoutSessionId: { equals: sessionId } },
        limit: 1,
      });
      if (existing.docs.length > 0) continue;

      await payload.create({
        collection: 'orders',
        data: {
          name: `Seed order — product ${i + 1}`,
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
        ...(product.content
          ? { content: toLexicalDescription(product.content) }
          : {}),
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
