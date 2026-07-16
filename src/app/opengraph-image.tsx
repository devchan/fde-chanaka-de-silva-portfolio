import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const dynamic = "force-static";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
          <div style={{ fontSize: 30, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: 0,
            }}
          >
            <span>Enterprise AI systems,</span>
            <span>deployed where it matters.</span>
          </div>
          <div style={{ marginTop: 30, maxWidth: 880, fontSize: 30, color: "#a6adbb", lineHeight: 1.35 }}>
            Senior Software Engineer / Forward Deployed Engineering / Solution Architecture
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 24, color: "#a6adbb" }}>
          <span>11+ years</span>
          <span>/</span>
          <span>Enterprise SaaS</span>
          <span>/</span>
          <span>RAG + Agents</span>
        </div>
      </div>
    ),
    size
  );
}
