import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { AuthProvider, RequireAuth, RequireRole } from "@/lib/auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { MediaPage } from "@/pages/MediaPage";
import { MensajesPage } from "@/pages/MensajesPage";
import { NoticiaFormPage, NoticiasListPage } from "@/pages/NoticiasPage";
import { DocumentoFormPage, DocumentosListPage } from "@/pages/DocumentosPage";
import { ConvocatoriaFormPage, ConvocatoriasListPage } from "@/pages/ConvocatoriasPage";
import { ProyectoFormPage, ProyectoListPage } from "@/pages/ProyectoPages";
import { DimensionFormPage, DimensionesListPage } from "@/pages/DimensionesPage";
import { AjustesPage } from "@/pages/AjustesPage";
import { UsuariosPage } from "@/pages/UsuariosPage";
import {
  CategoriasPage,
  EntidadesPage,
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

        <Route path="/convocatorias" element={<ConvocatoriasListPage />} />
        <Route path="/convocatorias/nuevo" element={<ConvocatoriaFormPage />} />
        <Route path="/convocatorias/:id" element={<ConvocatoriaFormPage />} />

        <Route path="/proyecto" element={<ProyectoListPage />} />
        <Route path="/proyecto/nuevo" element={<ProyectoFormPage />} />
        <Route path="/proyecto/:id" element={<ProyectoFormPage />} />

        <Route path="/dimensiones" element={<DimensionesListPage />} />
        <Route path="/dimensiones/nuevo" element={<DimensionFormPage />} />
        <Route path="/dimensiones/:id" element={<DimensionFormPage />} />

        <Route path="/configuracion" element={<AjustesPage />} />
        <Route path="/configuracion/estadisticas" element={<EstadisticasPage />} />
        <Route path="/configuracion/entidades" element={<EntidadesPage />} />
        <Route path="/configuracion/talleres" element={<TalleresPage />} />
        <Route path="/configuracion/categorias" element={<CategoriasPage />} />
        <Route
          path="/configuracion/galeria"
          element={
            <RequireRole role="admin">
              <MediaPage />
            </RequireRole>
          }
        />
        <Route
          path="/configuracion/usuarios"
          element={
            <RequireRole role="admin">
              <UsuariosPage />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
    </AuthProvider>
  );
}