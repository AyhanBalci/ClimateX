import { serialiseerJsonLd } from "../../lib/seo";

/**
 * Rendert structured data als <script type="application/ld+json">.
 * De payload wordt ge-escaped in `serialiseerJsonLd`, zodat inhoud met
 * HTML-tekens de script-tag niet kan afsluiten.
 *
 * Meerdere schema's kunnen in één tag: geef dan een array mee.
 */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const payload = Array.isArray(data) ? data.filter(Boolean) : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialiseerJsonLd(payload) }}
    />
  );
}
