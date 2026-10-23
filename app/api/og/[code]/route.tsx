import { ImageResponse } from "next/og";
import { resultFromCode } from "../../../../lib/power";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params,
      h = resultFromCode(code);
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 70,
            background: "linear-gradient(120deg,#161428,#253639)",
            color: "#f5f1ff",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              color: h.color,
              fontSize: 25,
              letterSpacing: 5,
            }}
          >
            ANIMEVERSE / ORIGINAL HERO
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              marginTop: 60,
              fontWeight: 700,
            }}
          >
            {h.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              marginTop: 25,
              color: h.color,
            }}
          >
            {h.power} · {h.faction}
          </div>
          <div style={{ display: "flex", fontSize: 25, marginTop: "auto" }}>
            Discover your power. Meet your rival. Begin your story.
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: { "Cache-Control": "public,max-age=86400" },
      },
    );
  } catch {
    return new Response("Invalid hero", { status: 404 });
  }
}
