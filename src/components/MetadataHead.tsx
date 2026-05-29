import Script from 'next/script';
import { APP_NAME, siteMetadata } from 'src/configs/constance';
import { TPageMetadata } from 'src/types/global';

export function MetadataHead(props: Pick<TPageMetadata, 'title' | 'description'>) {
  const { title, description, url, siteName, icon, image, twitterHandle, keywords } = siteMetadata;

  const realTitle = props.title ? `${APP_NAME} | ${props.title}` : title;
  const realDescription = props.description || description;

  return (
    <head>
      <title>{realTitle}</title>
      <link rel="icon" href={icon} />

      {/* Basic metadata */}
      <meta name="description" content={realDescription} key="description" />
      <meta name="keywords" key="keywords" content={keywords} />
      <meta name="application-name" content={siteName} />

      {/* Open Graph metadata */}
      <meta property="og:title" content={realTitle} key="title" />
      <meta property="og:description" content={realDescription} key="ogdescription" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} key="ogimage" />

      {/* Twitter metadata */}
      <meta name="twitter:card" content="summary_large_image" key="twittercard" />
      <meta name="twitter:site" content={`https://x.com/${twitterHandle}`} key="twittersite" />
      <meta name="twitter:title" content={realTitle} key="twittertitle" />
      <meta name="twitter:description" content={realDescription} key="twitterdescription" />
      <meta name="twitter:image" content={image} key="twitterimage" />
      <meta name="twitter:image:alt" content="cover image" key="twitteralt" />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-W3M57J7H');
  `,
        }}
      />
    </head>
  );
}
