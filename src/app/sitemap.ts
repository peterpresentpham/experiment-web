import { MetadataRoute } from 'next';
import { SITE_URL } from 'src/configs/constance';
import {
  BLOG_TOPICS,
  FORMAT_NUMBER_BASE,
  FORMAT_NUMBER_PAGES,
  RUBIK_BASE,
} from 'src/configs/blog.config';
import { NAV_ITEMS } from 'src/configs/navigation';

export default function sitemap(): MetadataRoute.Sitemap {
  const hrefs = [
    ...NAV_ITEMS.map((item) => item.href),
    ...BLOG_TOPICS.map((topic) => topic.href).filter(
      (href) => !href.startsWith(FORMAT_NUMBER_BASE)
    ),
    `${RUBIK_BASE}/f2l`,
    ...FORMAT_NUMBER_PAGES.map((page) => `${FORMAT_NUMBER_BASE}/${page.slug}`),
  ];
  return [{ url: SITE_URL }, ...hrefs.map((href) => ({ url: `${SITE_URL}${href}` }))];
}
