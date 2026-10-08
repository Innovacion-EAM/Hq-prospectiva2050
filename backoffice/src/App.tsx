import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { AuthProvider, RequireAuth, RequireRole } from "@/lib/auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { MediaPage } from "@/pages/MediaPage";
import { MensajesPage } from "@/pages/MensajesPage";
import PapeleraPage from "@/pages/PapeleraPage";
import { NoticiaFormPage, NoticiasListPage } from "@/pages/NoticiasPage";
import { DocumentoFormPage, DocumentosListPage } from "@/pages/DocumentosPage";
import { RepositorioPage } from "@/pages/RepositorioPage";
import { ConvocatoriaFormPage, ConvocatoriasListPage } from "@/pages/ConvocatoriasPage";
import { ProyectoFormPage, ProyectoListPage } from "@/pages/ProyectoPages";
import { DimensionFormPage, DimensionesListPage } from "@/pages/DimensionesPage";
import { AjustesPage } from "@/pages/AjustesPage";
import { UsuariosPage } from "@/pages/UsuariosPage";
import { RutaNoEncontradaPage } from "@/pages/RutaNoEncontradaPage";
import { MiCuentaPage } from "@/pages/MiCuentaPage";
import {
  CategoriasPage,
  EstadisticasPage,
  TalleresPage,
} from "@/pages/ConfiguracionPages";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/mensajes" element={<MensajesPage />} />

        <Route path="/noticias" element={<NoticiasListPage />} />
        <Route path="/noticias/nuevo" element={<NoticiaFormPage />} />
        <Route path="/noticias/:id" element={<NoticiaFormPage />} />

        <Route path="/documentos" element={<DocumentosListPage />} />
        <Route path="/documentos/nuevo" element={<DocumentoFormPage />} />
        <Route path="/documentos/:id" element={<DocumentoFormPage />} />

        <Route path="/repositorio" element={<RepositorioPage />} />

        <Route path="/convocatorias" element={<ConvocatoriasListPage />} />
        <Route path="/convocatorias/nuevo" element={<ConvocatoriaFormPage />} />
        <Route path="/convocatorias/:id" element={<ConvocatoriaFormPage />} />

        <Route path="/proyecto" element={<ProyectoListPage />} />
        <Route path="/proyecto/nuevo" element={<ProyectoFormPage />} />
        <Route path="/proyecto/:id" element={<ProyectoFormPage />} />

        <Route path="/dimensiones" element={<DimensionesListPage />} />
        <Route path="/dimensiones/nuevo" element={<DimensionFormPage />} />
        <Route path="/dimensiones/:id" element={<DimensionFormPage />} />

        <Route path="/mi-cuenta" element={<MiCuentaPage />} />

        <Route path="/configuracion" element={<AjustesPage />} />
        <Route path="/configuracion/estadisticas" element={<EstadisticasPage />} />
        <Route path="/configuracion/talleres" element={<TalleresPage />} />
        <Route path="/configuracion/categorias" element={<CategoriasPage />} />
        {/* La galería es parte del flujo editorial de noticias y documentos,
            así que la usan tanto admin como editor. Solo el borrado está
            reservado al admin. */}
        <Route path="/configuracion/galeria" element={<MediaPage />} />
        <Route
          path="/configuracion/usuarios"
          element={
            <RequireRole role="admin">
              <UsuariosPage />
            </RequireRole>
          }
        />
        <Route
          path="/papelera"
          element={
            <RequireRole role="admin">
              <PapeleraPage />
            </RequireRole>
          }
        />
        {/* Antes, una ruta inexistente renderizaba la página en blanco. */}
        <Route path="*" element={<RutaNoEncontradaPage />} />
      </Route>
    </Routes>
    </AuthProvider>
  );
}