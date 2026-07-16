import { blogPosts } from "@/data/blog";
import { site } from "@/data/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const items = blogPosts
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${site.url}/blog/${post.slug}</link>
  <guid>${site.url}/blog/${post.slug}</guid>
  <pubDate>${new Date(`${post.date}T00:00:00.000Z`).toUTCString()}</pubDate>
  <category>${escapeXml(post.category)}</category>
  <description>${escapeXml(post.description)}</description>
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${escapeXml(site.name)} Blog</title>
  <link>${site.url}/blog</link>
  <description>${escapeXml(site.description)}</description>
  ${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
