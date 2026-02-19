import { CheckoutNavbar } from '@/modules/checkout/ui/components/navbar';
import { TenantFooter } from '@/modules/tenants/ui/components/footer';

export default async function CheckoutLayout({
  children,
  params,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <CheckoutNavbar tenantSlug={slug} />
      <div className='flex-1 bg-gray-50'>
        <div className='max-w-(--breakpoint-2xl) mx-auto'>{children}</div>
      </div>
      <TenantFooter />
    </div>
  );
}
