import { redirect } from 'next/navigation';
import { FORMAT_NUMBER_BASE, FORMAT_NUMBER_PAGES } from 'src/configs/blog.config';

export default function FormatNumber() {
  redirect(`${FORMAT_NUMBER_BASE}/${FORMAT_NUMBER_PAGES[0].slug}`);
}
