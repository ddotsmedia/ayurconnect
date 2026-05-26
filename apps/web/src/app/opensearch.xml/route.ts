// OpenSearch description — lets browsers (Chrome, Firefox, Edge, Safari) add
// AyurConnect as a search engine and surface it in the address-bar suggest
// dropdown. Discovery is via <link rel="search"> in the root layout.
import { SITE_URL, SITE_NAME } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                      xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${SITE_NAME}</ShortName>
  <Description>Search verified Ayurveda doctors, hospitals, herbs, treatments, and articles on AyurConnect.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image height="16" width="16" type="image/svg+xml">${SITE_URL}/icon.svg</Image>
  <Image height="64" width="64" type="image/svg+xml">${SITE_URL}/icon.svg</Image>
  <Url type="text/html" method="get" template="${SITE_URL}/search?q={searchTerms}" />
  <Url type="application/opensearchdescription+xml" rel="self" template="${SITE_URL}/opensearch.xml" />
  <moz:SearchForm>${SITE_URL}/search</moz:SearchForm>
  <Language>en-IN</Language>
  <Language>ml-IN</Language>
  <Developer>${SITE_NAME}</Developer>
  <Contact>support@ayurconnect.com</Contact>
  <Attribution>${SITE_NAME} — Kerala's #1 Ayurveda Platform</Attribution>
  <SyndicationRight>open</SyndicationRight>
  <AdultContent>false</AdultContent>
</OpenSearchDescription>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
