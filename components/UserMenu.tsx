import React, { useEffect, useRef, useState } from 'react';

interface UserMenuProps {
  /** Content of the button that opens the menu (avatar, name, chevron...). */
  trigger: React.ReactNode;
  /** Menu items. Clicking anything inside the panel closes it. */
  children: React.ReactNode;
}

/**
 * Click/tap-toggled dropdown. Replaces the old hover-only menus, which could
 * not be opened on touch devices.
 */
const UserMenu: React.FC<UserMenuProps> = ({ trigger, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 pt-2 z-50" role="menu" onClick={() => setOpen(false)}>
          <div className="w-48 bg-white rounded-xl shadow-2xl py-2 border border-slate-100 overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
