import {
  PREVIEW_DESCRIPTION,
  PREVIEW_TITLE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  escapeHtml,
  getPreviewImageProxyUrl,
  getPublicOrigin,
  getPublicPageUrl,
} from "./utils.js";

export const dynamic = "force-dynamic";

export function GET(request) {
  const publicOrigin = getPublicOrigin(request);
  const pageUrl = getPublicPageUrl(request, publicOrigin);
  const imageUrl = getPreviewImageProxyUrl(request, publicOrigin);
  const safeTitle = escapeHtml(PREVIEW_TITLE);
  const safeDescription = escapeHtml(PREVIEW_DESCRIPTION);
  const safeImageUrl = escapeHtml(imageUrl);
  const safePageUrl = escapeHtml(pageUrl);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}">
    <link rel="canonical" href="${safePageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safePageUrl}">
    <meta property="og:image" content="${safeImageUrl}">
    <meta property="og:image:url" content="${safeImageUrl}">
    <meta property="og:image:secure_url" content="${safeImageUrl}">
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}">
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">
    <meta property="og:image:alt" content="${safeTitle}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImageUrl}">
    <meta itemprop="image" content="${safeImageUrl}">
    <meta name="theme-color" content="#ffffff">
    <style>
      * { box-sizing: border-box; }
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #ffffff;
      }
      main {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #ffffff;
      }
      img {
        display: block;
        width: min(100vw, ${OG_IMAGE_WIDTH}px);
        height: auto;
        max-height: 100vh;
        object-fit: contain;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <main>
      <img src="${safeImageUrl}" alt="${safeTitle}">
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
