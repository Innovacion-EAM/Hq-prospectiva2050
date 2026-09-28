import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/error-boundary";
import { SiteShell } from "@/components/site-shell";
import { ContactosPage } from "@/pages/ContactosPage";
import { DimensionDetailPage } from "@/pages/DimensionDetailPage";
import { DimensionesPage } from "@/pages/DimensionesPage";
import { DocumentoDetallePage } from "@/pages/DocumentoDetallePage";
import { DocumentosCategoriaPage } from "@/pages/DocumentosCategoriaPage";
import { DocumentosPage } from "@/pages/DocumentosPage";
import { HomePage } from "@/pages/HomePage";
import { NoticiasDetailPage } from "@/pages/NoticiasDetailPage";
import { NoticiasPage } from "@/pages/NoticiasPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ParticipaPage } from "@/pages/ParticipaPage";
import { ProyectoDetailPage } from "@/pages/ProyectoDetailPage";
import { PrivacidadPage } from "@/pages/PrivacidadPage";
import { ProyectoPage } from "@/pages/ProyectoPage";

export default function App() {
  return (
    <ErrorBoundary>
      <SiteShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/proyecto" element={<ProyectoPage />} />
          <Route path="/proyecto/:slug" element={<ProyectoDetailPage />} />
          <Route path="/dimensiones" element={<DimensionesPage />} />
          <Route path="/dimensiones/:slug" element={<DimensionDetailPage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/documentos/:categoria" element={<DocumentosCategoriaPage />} />
          <Route path="/documento/:id" element={<DocumentoDetallePage />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/noticias/:slug" element={<NoticiasDetailPage />} />
          <Route path="/participa" element={<ParticipaPage />} />
          <Route path="/contactos" element={<ContactosPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteShell>
    </ErrorBoundary>
  );
}
