import { permanentRedirect } from 'next/navigation';
import { RUBIK_BASE } from 'src/configs/blog.config';

/** The 41 F2L cases moved to the algorithm lookup page. */
export default function F2L() {
  permanentRedirect(`${RUBIK_BASE}/algorithms?type=f2l`);
}
