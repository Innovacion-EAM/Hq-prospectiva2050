import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import { type ColorBoton } from "@/data/site";
import { useSite } from "@/data/site-context";
import { postForm } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "./logo";
import { clasesBoton } from "./portada-colores";
import { SearchDialog } from "./search-dialog";
import { useSearchShortcut } from "@/hooks/use-search";
import { Button } from "./ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  // "/" y Ctrl/Cmd+K abren el buscador desde cualquier página.
  useSearchShortcut(() => setSearchOpen(true));
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

/**
 * ¿El enlace apunta a la página en la que estamos?
 *
 * Se compara con el prefijo para que `/noticias` siga marcado en el detalle de
 * una noticia (`/noticias/alguna-cosa`). La barra final se cuelga a propósito:
 * sin ella, `/noticias` se marcaría activo dentro de `/noticias-mas`, que no
 * existe pero podría existir mañana.
 */
function estaEn(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Un enlace del menú, sea del tipo que sea.
 *
 * El módulo Header acepta direcciones externas (`https://…`) porque a veces hace
 * falta enlazar a algo de otro lado, y ahí `<Link>` de react-router no sirve: en
 * el enrutador interno **todas** las direcciones se tratan como rutas de la
 * aplicación, así que un `https://` se interpreta como una ruta y la navegación
 * se rompe. Para esas se usa un `<a>` normal.
 *
 * Se abre en pestaña nueva: el sitio es una SPA y perder el estado de la página
 * (dónde iba la persona, qué había buscado) por seguir un enlace externo es un
 * coste que no compensa.
 */
function NavEnlace({
  href,
  activo,
  className,
  children,
}: {
  href: string;
  activo: boolean;
  className: string;
  children: ReactNode;
}) {
  if (!href.startsWith("/")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} aria-current={activo ? "page" : undefined} className={className}>
      {children}
    </Link>
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
  // El orden de los enlaces y los textos del logo llegan de la base, editables
  // en Ajustes → Header. `useSite` además cae al menú de respaldo si la lista
  // llegara vacía, así que el encabezado nunca queda sin navegación.
  const { NAV } = useSite();
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo variant="light" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active = estaEn(item.href, pathname);
            return (
              // El resaltado visual no lo anuncia nadie: `aria-current` es lo
              // que le dice al lector de pantalla que esta es la página en la
              // que se está, y es lo único que distingue un enlace activo de
              // uno que solo se ve distinto.
              <NavEnlace
                key={item.href}
                href={item.href}
                activo={active}
                className={cn(
                  "rounded-pill px-4 py-2 font-display text-[0.8rem] font-semibold tracking-wide no-underline transition-colors duration-200",
                  active ? "bg-lime text-lime-fg" : "text-paper hover:bg-paper/10",
                )}
              >
                {item.label}
              </NavEnlace>
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
  const { NAV } = useSite();
  return (
    <nav
      className="border-b border-ink-soft bg-ink px-4 py-4 lg:hidden"
      aria-label="Móvil"
    >
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = estaEn(item.href, pathname);
          return (
            <li key={item.href}>
              <NavEnlace
                href={item.href}
                activo={active}
                className={cn(
                  "block rounded-xl px-4 py-3 font-display text-sm font-semibold no-underline",
                  active ? "bg-lime text-lime-fg" : "text-paper hover:bg-paper/10",
                )}
              >
                {item.label}
              </NavEnlace>
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
  const [consentimiento, setConsentimiento] = useState(false);
  // Las cuatro columnas del pie llegan de la base: tres son fijas y la de las
  // tarjetas de «El proyecto» se elige en Ajustes → Footer (ver `pickFooter`).
  const { SITE, FOOTER } = useSite();

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    try {
      await postForm("boletin", { email: email.trim(), consentimiento: true });
      toast.success("Te suscribiste al canal de noticias.");
      setEmail("");
      setConsentimiento(false);
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
            {FOOTER.map((col, i) => (
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
              <Button
                type="submit"
                variant="lime"
                size="sm"
                className="m-1"
                disabled={sending || !consentimiento}
              >
                {sending ? "…" : "Enviar"}
              </Button>
            </div>
            {/*
              El pie tiene fondo oscuro, así que la casilla no puede usar el
              componente compartido: sus clases están pensadas para papel claro.
              Aquí la variante es `text-mist` y el acento es `lime-btn`, que es el
              único que se lee sobre ese fondo.
            */}
            <label className="flex items-start gap-2 text-[0.7rem] leading-snug text-mist">
              <input
                type="checkbox"
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="mt-0.5 size-3.5 shrink-0 accent-[var(--color-lime-btn)]"
              />
              <span>
                Autorizo el tratamiento de mis datos para recibir novedades.{" "}
                <Link to="/privacidad" className="font-semibold text-lime underline">
                  Aviso de privacidad
                </Link>
                .
              </span>
            </label>
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
        {/* Enlace y no texto plano: es la política de tratamiento de datos, y
            está en la misma página que el aviso al que apunta la casilla de
            autorización de los formularios. El texto queda fijo —es la
            identidad del sitio—, pero el clic tiene que llegar a la política. */}
        <Link to="/privacidad" className="text-mist no-underline transition-colors hover:text-lime">
          Protección y Tratamiento de Datos Personales (Ley 1581 de 2012)
        </Link>
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
  fondo,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  /** Imagen de fondo del hero. La pone solo `/proyecto`, que es donde se edita
   *  desde el panel; el resto de páginas siguen con la del sitio. */
  fondo?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-35">
        <img src={fondo ?? "/images/hero-city.jpg"} alt="" className="h-full w-full object-cover" />
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

/**
 * El botón-verde de "Explorar más" que aparece en las tarjetas.
 *
 * `color` es opcional a propósito: si no se pasa, sale el lima de siempre, que es
 * lo que usan las páginas que no son la portada y no tienen su color editable.
 * En la portada se pasa `PORTADA.proyecto.botonColor`, que es donde se edita desde
 * el panel.
 *
 * Cuando sí se pasa el color, **todas** las clases de fondo y de texto las pone
 * `clasesBoton` y aquí no se repite ninguna. Si se dejara el `bg-lime` de la
 * versión fija, el color elegido nunca ganaría: en Tailwind gana la clase que
 * aparece más tarde en el CSS generado, no la que va más tarde en el atributo, y
 * dos `bg-*` declarados en sitios distintos no se pueden ordenar a gusto.
 */
export function LimeCta({
  to,
  children,
  className,
  color,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  color?: ColorBoton;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-4 py-2 font-display text-xs font-semibold no-underline tap-scale",
        color ? clasesBoton(color) : "bg-lime text-lime-fg hover:bg-lime-deep",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export { LogoMark };
