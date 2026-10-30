import { Metadata, Viewport } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';
import { ReactNode } from 'react';
import EffectBox from 'src/components/Layouts/EffectBox';
import { Toaster } from 'src/components/shadcn/sonner';
import { APP_NAME, GTM_ID, SITE_DESCRIPTION, SITE_URL } from 'src/configs/constance';
import { cn } from 'src/lib/utils';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: { card: 'summary_large_image', creator: '@PhamHon08928762' },
};

export const viewport: Viewport = {
  themeColor: '#d9531e',
};

type TProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: TProps) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, geistMono.variable, 'font-sans antialiased')}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <EffectBox>
          <Toaster expand={true} position="top-right" richColors />
          {children}
        </EffectBox>
      </body>
    </html>
  );
}
