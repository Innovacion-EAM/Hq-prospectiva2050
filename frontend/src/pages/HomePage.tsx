import { useEffect, useState } from "react";
import { HomeHero } from "@/components/home-hero";
import { HomeProject } from "@/components/home-project";
import { HomeRepo } from "@/components/home-repo";
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
      <HomeDocuments />
      <HomeRepo />
      <HomeNews news={news} />
      <HomeContact />
    </>
  );
}

