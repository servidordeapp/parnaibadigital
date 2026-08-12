import type { APIRoute } from "astro";

import { absoluteUrl, categoryHref, client } from "../lib/site";
import { urlSet, xmlResponse } from "../lib/seo/xml";

/** Uma entrada por editoria. Editoria nova entra sozinha (FR-030). */
export const GET: APIRoute = async () => {
  const categories = await client.categories.list();

  return xmlResponse(
    urlSet(
      categories.map((category) => ({
        loc: absoluteUrl(categoryHref(category.slug)),
        changefreq: "daily" as const,
        priority: 0.7,
      })),
    ),
  );
};
