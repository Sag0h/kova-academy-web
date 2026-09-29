"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/slots", label: "Turnos" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Administración">
      {links.map((link) => (
        <Link className={pathname.startsWith(link.href) ? "active" : ""} href={link.href} key={link.href} onClick={onNavigate}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
