import { ValidatorHomepage } from '@/components/validator/ValidatorHomepage';
import { Seo } from '@/components/Seo';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, SITE_TAGLINE } from '@/config/site';

export default function Home() {
  return (
    <>
      <Seo
        title="Crxa Validator Documentation"
        description={DEFAULT_DESCRIPTION}
        canonical="/"
        openGraph={{
          type: 'website',
          url: SITE_URL,
          title: `${SITE_NAME} - Cosmos Validator Documentation`,
          description: DEFAULT_DESCRIPTION,
          image: `${SITE_URL}/api/og?title=${encodeURIComponent('Cosmos Validator Documentation')}&subtitle=${encodeURIComponent(SITE_TAGLINE)}`
        }}
        keywords={[
          'crxanode',
          'cosmos validator documentation',
          'validator service',
          'cosmos node guide',
          'rpc endpoints',
          'snapshot service'
        ]}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION,
            logo: `${SITE_URL}/logo.png`
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            description: DEFAULT_DESCRIPTION
          }
        ]}
      />
      <ValidatorHomepage />
    </>
  );
}

export { Home };
