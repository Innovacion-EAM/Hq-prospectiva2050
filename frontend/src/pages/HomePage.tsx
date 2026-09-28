import { useEffect, useState } from "react";
import { HomeHero } from "@/components/home-hero";
import { HomeProject } from "@/components/home-project";
import { MunicipiosStrip } from "@/components/municipios-section";
import { HomeContact, HomeDocuments, HomeNews, HomeStats } from "@/components/shared-sections";
import { fetchNoticias, toNewsItem, type NewsItem } from "@/lib/api";

export function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNoticias({ perPage: 3 })
      .then((res) => setNews(res.data.map(toNewsItem)))
      .catch(() => setNews([]));
  }, []);

  return (
    <>
      <HomeHero />
      <HomeStats />
      <HomeProject />
      {/* Va justo después de contar el proyecto: la cobertura territorial es la
          respuesta a «¿y el resto del departamento?», y ahí es donde la pregunta
          aparece. La versión con texto vive en /proyecto. */}
      <MunicipiosStrip />
      <HomeDocuments />
      <HomeNews news={news} />
      <HomeContact />
    </>
  );
}

