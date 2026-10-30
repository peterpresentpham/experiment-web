import { MetadataRoute } from 'next';
import { SITE_URL } from 'src/configs/constance';
import { NAV_ITEMS } from 'src/configs/navigation';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL }, ...NAV_ITEMS.map((item) => ({ url: `${SITE_URL}${item.href}` }))];
}
