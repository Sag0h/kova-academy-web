import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";
import brandLogo from "@/img/logo.png";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/slots");

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="brand" href="/" aria-label="Volver al sitio público">
          <Image className="login-brand-logo" src={brandLogo} alt="Kova Academy" priority />
        </Link>
        <div>
          <p className="eyebrow">Panel privado</p>
          <h1>Hola, Alai.</h1>
          <p>Ingresá para administrar los turnos publicados.</p>
        </div>
        <LoginForm />
        <Link className="admin-back-link" href="/">← Volver al sitio</Link>
      </section>
    </main>
  );
}
