import { Header } from '@/components/layout/header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
    </>
  );
}
