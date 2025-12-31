import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sidebarItems } from './sidebarItems';
import { getUserFromToken } from '../utils/auth';
import { navItemClass } from './navItemClass';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';


interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: Props) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const user = getUserFromToken();
  const location = useLocation();

  useEffect(() => {
    if (open) onClose();}, [location.pathname, open, onClose]);
    

  // 🔐 Focus trap
  useEffect(() => {
    if (!open) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusable = sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    sidebar.addEventListener('keydown', handleKeyDown);
    return () => sidebar.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // 🧱 Prevent body scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ⌨ Escape to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // ✅ SAFE early render guard (after hooks)
  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-64 bg-gray-900 z-50"
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
          >
            <nav className="mt-6 space-y-1">
              {sidebarItems
                .filter(item => item.roles.includes(user.role))
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }: { isActive: boolean }) =>
                        navItemClass(isActive, true)
                        }

                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
