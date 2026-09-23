import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  Boxes,
  CalendarDays,
  FileStack,
  FolderOpen,
  Home,
  Inbox,
  Megaphone,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ListChecks,
  SlidersHorizontal,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Panel",
    items: [
      { to: "/", label: "Inicio", icon: Home, end: true },
      { to: "/mensajes", label: "Mensajes", icon: Inbox },
    ],
  },
  {
    title: "Contenido",
    items: [
      { to: "/noticias", label: "Noticias", icon: Newspaper },
      { to: "/documentos", label: "Documentos", icon: FileStack },
      { to: "/convocatorias", label: "Convocatorias", icon: Megaphone },
    ],
  },
  {
    title: "Páginas",
    items: [
      { to: "/proyecto", label: "El proyecto", icon: BookOpen },
      { to: "/dimensiones", label: "Dimensiones", icon: Boxes },
    ],
  },
  {
    title: "Configuración",
    items: [
      { to: "/configuracion", label: "Ajustes del sitio", icon: Settings, end: true },
      { to: "/configuracion/estadisticas", label: "Estadísticas", icon: ListChecks },
      { to: "/configuracion/entidades", label: "Entidades aliadas", icon: Users },
      { to: "/configuracion/talleres", label: "Talleres y eventos", icon: CalendarDays },
      { to: "/configuracion/categorias", label: "Categorías de documentos", icon: FolderOpen },
    ],
  },
];

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime font-display text-lg font-extrabold text-lime-fg">
        Q
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-bold text-paper">Horizonte Quindío</p>
        <p className="text-[0.68rem] font-medium text-mist">Backoffice · 2050</p>
      </div>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-2 scrollbar-thin">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-2 pb-1.5 text-[0.62rem] font-semibold tracking-widest text-mist/60 uppercase">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.82rem] font-medium transition-colors no-underline",
                        isActive
                          ? "bg-lime text-lime-fg"
                          : "text-mist hover:bg-ink-mid hover:text-paper",
                      )
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="pt-2">
        <a
          href={import.meta.env.VITE_SITE_URL || "http://localhost:5173"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.82rem] font-medium text-mist no-underline transition-colors hover:bg-ink-mid hover:text-paper"
        >
          <ExternalLink className="size-4 shrink-0" />
          Ver el sitio
        </a>
      </div>
    </nav>
  );
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-fog">
      {/* Sidebar escritorio */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col bg-ink-deep transition-all duration-300 lg:flex",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
        )}
      >
        <div className={cn("flex items-center justify-between gap-2", collapsed ? "px-3" : "px-4")}>
          {collapsed ? (
            <div className="grid size-10 place-items-center rounded-2xl bg-lime font-display text-lg font-extrabold text-lime-fg">
              Q
            </div>
          ) : (
            <Brand />
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            className="grid size-8 place-items-center rounded-lg text-mist/70 transition-colors hover:bg-ink-mid hover:text-paper"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {!collapsed && <SidebarNav onNavigate={() => {}} />}
          {collapsed && (
            <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto px-2 pt-4">
              {SECTIONS.flatMap((s) =>
                s.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={item.label}
                      className={({ isActive }) =>
                        cn(
                          "grid size-10 place-items-center rounded-xl transition-colors",
                          isActive ? "bg-lime text-lime-fg" : "text-mist hover:bg-ink-mid hover:text-paper",
                        )
                      }
                    >
                      <Icon className="size-4" />
                    </NavLink>
                  );
                }),
              )}
            </nav>
          )}
        </div>
        {collapsed ? (
          <a
            href={import.meta.env.VITE_SITE_URL || "http://localhost:5173"}
            target="_blank"
            rel="noreferrer"
            aria-label="Ver el sitio"
            className="grid size-10 place-items-center self-center rounded-xl text-mist transition-colors hover:bg-ink-mid hover:text-paper"
          >
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-ink-deep shadow-xl">
            <Brand />
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      {/* Contenido */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-64")}>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-stone bg-paper/90 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg text-ink hover:bg-fog lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted" />
              <span className="font-display text-sm font-semibold text-ink">Administración</span>
            </div>
          </div>
          <a
            href={import.meta.env.VITE_SITE_URL || "http://localhost:5173"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-pill bg-ink px-3.5 py-1.5 font-display text-[0.7rem] font-semibold text-paper no-underline transition-colors hover:bg-ink-mid"
          >
            <ExternalLink className="size-3.5" /> Ver el sitio
          </a>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{<Outlet />}</main>
      </div>
    </div>
  );
}