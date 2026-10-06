import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { CatalogoPage } from "@/pages/CatalogoPage";
import { FichaPage } from "@/pages/FichaPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/documento/:id" element={<FichaPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}