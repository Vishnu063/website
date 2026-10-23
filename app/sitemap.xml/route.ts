export function GET() {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      ["", "/arena", "/power", "/community", "/privacy", "/terms"]
        .map(
          (p) =>
            "<url><loc>https://yoru-anime-vishnu.vishnukushwaha63.chatgpt.site" +
            p +
            "</loc></url>",
        )
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
}
