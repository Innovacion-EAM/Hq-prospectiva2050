import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import { FOOTER_COLS, NAV, SITE } from "@/data/site";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "./logo";
import { SearchDialog } from "./search-dialog";
import { Button } from "./ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-body">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-pill focus:bg-lime focus:px-4 focus:py-2 focus:text-ink"
      >
        Saltar al contenido
      </a>
      <Header
        pathname={pathname}
        onSearch={() => setSearchOpen(true)}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((v) => !v)}
      />
      {menuOpen ? (
        <MobileNav pathname={pathname} onSearch={() => setSearchOpen(true)} />
      ) : null}
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

function Header({
  pathname,
  onSearch,
  menuOpen,
  onMenu,
}: {
  pathname: string;
  onSearch: () => void;
  menuOpen: boolean;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo variant="light" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.match}/`);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-pill px-4 py-2 font-display text-[0.8rem] font-semibold tracking-wide no-underline transition-colors duration-200",
                  active ? "bg-lime text-lime-fg" : "text-paper hover:bg-paper/10",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onSearch}
            className="ml-1 grid size-10 place-items-center rounded-full text-paper hover:bg-paper/10"
            aria-label="Buscar"
          >
            <Search className="size-5" />
          </button>
        </nav>
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={onSearch}
            className="grid size-11 place-items-center rounded-full text-paper hover:bg-paper/10"
            aria-label="Buscar"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="grid size-11 place-items-center rounded-full text-paper hover:bg-paper/10"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileNav({
  pathname,
  onSearch,
}: {
  pathname: string;
  onSearch: () => void;
}) {
  return (
    <nav
      className="border-b border-ink-soft bg-ink px-4 py-4 lg:hidden"
      aria-label="Móvil"
    >
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.match}/`);
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "block rounded-xl px-4 py-3 font-display text-sm font-semibold no-underline",
                  active ? "bg-lime text-lime-fg" : "text-paper hover:bg-paper/10",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onSearch}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-3 font-display text-sm font-semibold text-paper hover:bg-paper/10"
          >
            <Search className="size-4" /> Buscar
          </button>
        </li>
      </ul>
    </nav>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    try {
      await postForm("boletin", { email: email.trim() });
      toast.success("Te suscribiste al canal de noticias.");
      setEmail("");
    } catch {
      toast.error("No pudimos procesar tu suscripción. Inténtalo de nuevo más tarde.");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="bg-footer text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-display text-sm font-semibold tracking-wide">Mapa del sitio</p>
          <div className="mt-5 grid gap-6 text-sm text-mist sm:grid-cols-3">
            {FOOTER_COLS.map((col, i) => (
              <ul key={i} className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      to={link.href}
                      className="text-mist no-underline transition-colors hover:text-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <form onSubmit={subscribe} className="flex flex-col gap-3">
            <label htmlFor="boletin" className="font-display text-sm font-semibold">
              Suscríbete a nuestro canal de noticias
            </label>
            <div className="flex overflow-hidden rounded-pill bg-paper">
              <input
                id="boletin"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
              />
              <Button type="submit" variant="lime" size="sm" className="m-1" disabled={sending}>
                {sending ? "…" : "Enviar"}
              </Button>
            </div>
          </form>
          <div>
            <p className="font-display text-sm font-semibold">Síguenos en redes</p>
            <div className="mt-3 flex gap-3">
              <Social href={SITE.social.facebook} label="Facebook">
                f
              </Social>
              <Social href={SITE.social.instagram} label="Instagram">
                <InstagramIcon />
              </Social>
              <Social href={SITE.social.x} label="X">
                𝕏
              </Social>
            </div>
            <p className="mt-5 text-sm text-mist">{SITE.address}</p>
            <p className="text-sm text-mist">{SITE.city}</p>
            <p className="mt-1 text-sm text-mist">{SITE.phone}</p>
          </div>
          <div className="mt-auto flex justify-end">
            <Logo variant="light" compact />
          </div>
        </div>
      </div>
      <div className="border-t border-paper/10 px-4 py-4 text-center text-xs text-mist flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl mx-auto">
        <span>Horizonte Quindío 2050 — Todos los derechos reservados</span>
        <span>Protección y Tratamiento de Datos Personales (Ley 1581 de 2012)</span>
      </div>
    </footer>
  );
}


function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-paper/20 text-sm text-paper no-underline transition-colors hover:border-lime hover:text-lime"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function PageHero({
  kicker,
  title,
  intro,
}: {
  kicker?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <img src="/images/hero-city.jpg" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {kicker ? (
          <p className="font-display text-xs font-semibold tracking-[0.22em] text-lime uppercase">
            {kicker}
          </p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-display text-display font-extrabold tracking-tight text-paper">
          {title}
        </h1>
        {intro ? <p className="mt-4 max-w-2xl text-base text-mist sm:text-lg">{intro}</p> : null}
      </div>
    </section>
  );
}

export function LimeCta({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill bg-lime px-4 py-2 font-display text-xs font-semibold text-lime-fg no-underline tap-scale hover:bg-lime-deep",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export { LogoMark };
