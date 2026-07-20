import { ImageResponse } from "next/og";
import { blogPosts, getPost } from "@/data/blog";
import { site } from "@/data/site";

export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — blog article`;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Article";
  const eyebrow = post ? `${post.category} · ${post.readingTime}` : "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 15% 20%, rgba(34,211,238,0.35), transparent 32%), radial-gradient(circle at 80% 12%, rgba(129,140,248,0.35), transparent 34%), #06060b",
          color: "#ededf2",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "linear-gradient(135deg,#22d3ee,#818cf8,#34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            CD
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: "#22d3ee",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 56 : 68,
              lineHeight: 1.08,
              fontWeight: 800,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{ display: "flex", fontSize: 26, color: "#9a9db0", fontWeight: 500 }}
        >
          chanakadesilva.dev/blog
        </div>
      </div>
    ),
    size,
  );
}
