import { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import MobileSidebar from '../sidebar/MobileSidebar';
import { Menu } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1">
        {/* Top bar */}
        <header className="md:hidden flex items-center p-4 shadow bg-white">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
