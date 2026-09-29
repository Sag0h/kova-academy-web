import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface WhatsAppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  message: string;
  number: string;
}

export function WhatsAppLink({ children, message, number, ...props }: WhatsAppLinkProps) {
  return (
    <a href={buildWhatsAppUrl(number, message)} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
}
