import { useEffect, useMemo } from 'react';
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  buildCanonicalUrl
} from '../config/site';

interface OpenGraphOptions {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  url?: string;
}

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  openGraph?: OpenGraphOptions;
  structuredData?: object | object[];
  keywords?: string[];
}

type MetaDescriptor = {
  selector: { attr: 'name' | 'property'; value: string };
  content: string | null;
};

const setMetaTag = (
  { selector, content }: MetaDescriptor,
  registry: Array<{ element: HTMLMetaElement; previousContent: string | null; created: boolean }>
) => {
  const { attr, value } = selector;
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  let created = false;
  let previousContent: string | null = null;

  if (!content) {
    if (element) {
      document.head.removeChild(element);
    }
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, value);
    document.head.appendChild(element);
    created = true;
  } else {
    previousContent = element.getAttribute('content');
  }

  element.setAttribute('content', content);
  registry.push({ element, previousContent, created });
};

export const Seo = ({
  title,
  description,
  canonical,
  noindex = false,
  openGraph,
  structuredData,
  keywords
}: SeoProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const canonicalUrl = useMemo(() => {
    if (!canonical) {
      return buildCanonicalUrl('/');
    }
    if (/^https?:\/\//i.test(canonical)) {
      return canonical;
    }
    return buildCanonicalUrl(canonical);
  }, [canonical]);

  const ogOptions = useMemo<Required<OpenGraphOptions>>(
    () => ({
      title: openGraph?.title || fullTitle,
      description: openGraph?.description || finalDescription,
      type: openGraph?.type || 'website',
      image: openGraph?.image || DEFAULT_OG_IMAGE,
      url: openGraph?.url || canonicalUrl
    }),
    [openGraph, fullTitle, finalDescription, canonicalUrl]
  );

  const structuredDataPayload = useMemo(() => {
    if (!structuredData) return null;
    return Array.isArray(structuredData)
      ? structuredData
      : [structuredData];
  }, [structuredData]);

  const keywordsValue = useMemo(() => keywords?.join(', ') || null, [keywords]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousTitle = document.title;
    document.title = fullTitle;

    const registry: Array<{ element: HTMLMetaElement; previousContent: string | null; created: boolean }> = [];

    const metaTags: MetaDescriptor[] = [
      { selector: { attr: 'name', value: 'description' }, content: finalDescription },
      { selector: { attr: 'name', value: 'robots' }, content: noindex ? 'noindex, nofollow' : 'index, follow' },
      { selector: { attr: 'name', value: 'keywords' }, content: keywordsValue },
      { selector: { attr: 'property', value: 'og:title' }, content: ogOptions.title || null },
      { selector: { attr: 'property', value: 'og:description' }, content: ogOptions.description || null },
      { selector: { attr: 'property', value: 'og:type' }, content: ogOptions.type || null },
      { selector: { attr: 'property', value: 'og:url' }, content: ogOptions.url || null },
      { selector: { attr: 'property', value: 'og:site_name' }, content: SITE_NAME },
      { selector: { attr: 'property', value: 'og:image' }, content: ogOptions.image || null },
      { selector: { attr: 'name', value: 'twitter:card' }, content: 'summary_large_image' },
      { selector: { attr: 'name', value: 'twitter:title' }, content: ogOptions.title || null },
      { selector: { attr: 'name', value: 'twitter:description' }, content: ogOptions.description || null },
      { selector: { attr: 'name', value: 'twitter:image' }, content: ogOptions.image || null }
    ];

    metaTags.forEach((meta) => setMetaTag(meta, registry));

    // Canonical
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    let prevCanonical: string | null = null;
    let createdCanonical = false;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
      createdCanonical = true;
    } else {
      prevCanonical = canonicalLink.getAttribute('href');
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Structured data
    const structuredNodes: HTMLScriptElement[] = [];
    if (structuredDataPayload) {
      structuredDataPayload.forEach((schema) => {
        const script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        structuredNodes.push(script);
      });
    }

    return () => {
      document.title = previousTitle;

      registry.forEach(({ element, previousContent, created }) => {
        if (created) {
          element.remove();
        } else if (previousContent !== null) {
          element.setAttribute('content', previousContent);
        } else {
          element.removeAttribute('content');
        }
      });

      if (canonicalLink) {
        if (createdCanonical) {
          canonicalLink.remove();
        } else if (prevCanonical) {
          canonicalLink.setAttribute('href', prevCanonical);
        }
      }

      structuredNodes.forEach((node) => node.remove());
    };
  }, [
    fullTitle,
    finalDescription,
    canonicalUrl,
    noindex,
    ogOptions.title,
    ogOptions.description,
    ogOptions.type,
    ogOptions.url,
    ogOptions.image,
    structuredDataPayload,
    keywordsValue
  ]);

  return null;
};
