"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";
import brandLogo from "@/img/logo.png";
import { AdminNav } from "./admin-nav";

interface AdminShellProps {
  children: ReactNode;
  userEmail: string;
  userName: string;
}

export function AdminShell({ children, userEmail, userName }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`admin-shell${menuOpen ? " menu-open" : ""}`}>
      <button className="admin-menu-overlay" aria-label="Cerrar menú" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1} type="button" />

      <aside className="admin-sidebar" id="admin-navigation">
        <div className="admin-sidebar-heading">
          <Link className="brand admin-brand" href="/admin/slots" onClick={closeMenu}>
            <Image className="admin-brand-logo" src={brandLogo} alt="Kova Academy" priority />
            <span>Administración</span>
          </Link>
          <button ref={closeButtonRef} className="admin-menu-close" aria-label="Cerrar menú" onClick={closeMenu} type="button">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <AdminNav onNavigate={closeMenu} />

        <div className="admin-user">
          <div>
            <strong>{userName}</strong>
            <small>{userEmail}</small>
          </div>
          <form action={logoutAction}>
            <button type="submit">Cerrar sesión</button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-mobile-header">
          <Link className="admin-mobile-brand" href="/admin/slots" onClick={closeMenu}>
            <Image src={brandLogo} alt="Kova Academy" priority />
            <span>Administración</span>
          </Link>
          <button
            ref={menuButtonRef}
            className="admin-menu-button"
            aria-controls="admin-navigation"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de administración"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
