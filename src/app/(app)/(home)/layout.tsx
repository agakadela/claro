import { Navbar } from './navbar';
import { Footer } from './footer';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <div className='flex-1 bg-gray-50'>{children}</div>
      <Footer />
    </div>
  );
}
