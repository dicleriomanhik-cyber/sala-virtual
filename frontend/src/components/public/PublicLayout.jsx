import Navbar from './Navbar';
import FooterCompleto from './FooterCompleto';
import { useConfig } from '../../context/ConfigContext';

export default function PublicLayout({ children }) {
  const config = useConfig();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-10 md:py-10 lg:px-16 lg:py-14">
        {children}
      </main>

      <FooterCompleto />
    </div>
  );
}