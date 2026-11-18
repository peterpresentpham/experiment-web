import { Metadata, Viewport } from 'next';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';
import { ReactNode } from 'react';
import EffectBox from 'src/components/Layouts/EffectBox';
import { Toaster } from 'src/components/shadcn/sonner';
import { APP_NAME, GTM_ID, SITE_URL } from 'src/configs/constance';
import { LocaleProvider } from 'src/i18n/client';
import { LOCALES } from 'src/i18n/config';
import { commonMessages } from 'src/i18n/messages/common';
import { getLocale, getMessages } from 'src/i18n/server';
import { THEME_INIT_SCRIPT } from 'src/lib/theme';
import { cn } from 'src/lib/utils';
import 'src/styles/globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// Only English and Vietnamese exist; any other first segment is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { site } = await getMessages(commonMessages);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
    description: site.description,
    applicationName: APP_NAME,
    openGraph: {
      type: 'website',
      siteName: APP_NAME,
      title: APP_NAME,
      description: site.description,
      url: '/',
      locale: locale == 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: { card: 'summary_large_image', creator: '@PhamHon08928762' },
  };
}

export const viewport: Viewport = {
  themeColor: '#d9531e',
  colorScheme: 'light dark',
};

type TProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: TProps) {
  const locale = await getLocale();

  return (
    // The init script sets the theme class before hydration, so the attributes differ on purpose.
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
        <LocaleProvider locale={locale}>
          <EffectBox>
            <Toaster expand={true} position="top-right" richColors />
            {children}
          </EffectBox>
        </LocaleProvider>
      </body>
    </html>
  );
}
