import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowUpRight, Database, LayoutGrid, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Inicio", icon: LineChart, end: true },
  { to: "/catalogo", label: "Catálogo", icon: LayoutGrid },
];

export function Layout({ children }: { children: ReactNode }) {
  const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) || "http://localhost:5173";

  return (
    <div className="min-h-screen bg-petro-deep">
      <header className="sticky top-0 z-30 border-b border-line bg-petro-deep/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="grid size-10 place-items-center rounded-2xl border border-line bg-petro-mid">
              <Database className="size-5 text-neon" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-extrabold tracking-tight text-paper">
                Repositorio de Información
              </span>
              <span className="block text-[0.68rem] font-medium text-muted">
                Horizonte Quindío · Prospectiva 2050
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-2 rounded-pill px-4 py-2 font-display text-xs font-semibold no-underline transition-colors",
                      isActive ? "bg-neon text-petro-deep" : "text-mist hover:bg-petro-mid hover:text-paper",
                    )
                  }
                >
                  <Icon className="size-3.5" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-petro-mid px-3.5 py-2 font-display text-[0.7rem] font-semibold text-mist no-underline transition-colors hover:border-neon/50 hover:text-paper"
          >
            <span>Prospectiva 2050</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </header>

      {/* Nav móvil */}
      <nav className="sticky top-16 z-20 flex border-b border-line bg-petro-deep/90 backdrop-blur-sm md:hidden">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 items-center justify-center gap-2 py-3 font-display text-xs font-semibold no-underline",
                isActive ? "text-neon" : "text-mist",
              )
            }
          >
            <link.icon className="size-3.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p className="text-xs text-muted">
            Repositorio de información del proceso prospectivo del Quindío al 2050.
          </p>
          <p className="text-xs text-muted">
            Horizonte Quindío 2050 · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}