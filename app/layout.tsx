import type { Metadata } from "next";
import type { ReactNode } from "react";
import favicon from "@/img/ico.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kova Academy | Manicuría y Nail Art",
  description: "Servicios de manicuría, trabajos y turnos disponibles de Kova Academy.",
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
