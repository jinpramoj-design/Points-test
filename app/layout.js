import './globals.css';
import { Provider } from '@/lib/auth';
export const metadata = { title: 'Points Arena' };
export default function RootLayout({ children }) {
  return <html lang="th"><body><Provider>{children}</Provider></body></html>;
}
