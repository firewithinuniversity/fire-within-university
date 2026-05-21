import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fire Within University — Igniting hearts for Jesus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(145deg, #2a1506 0%, #3d1f0a 45%, #5c2e0f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "760px", height: "420px", background: "radial-gradient(ellipse, rgba(232,160,32,0.22) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "260px", height: "260px", background: "radial-gradient(ellipse at top right, rgba(196,94,26,0.25) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "260px", height: "260px", background: "radial-gradient(ellipse at bottom left, rgba(196,94,26,0.20) 0%, transparent 70%)" }} />

        <div style={{ display: "flex", border: "1.5px solid rgba(232,160,32,0.5)", borderRadius: "999px", padding: "8px 28px", marginBottom: "36px", color: "#e8a020", fontSize: "18px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "rgba(232,160,32,0.08)" }}>
          Ministry · Teaching · Discipleship
        </div>

        <div style={{ color: "#FDF6EC", fontSize: "86px", fontWeight: 700, fontFamily: "Georgia, serif", letterSpacing: "-0.01em", lineHeight: 1, marginBottom: "24px", textAlign: "center" }}>
          Fire Within University
        </div>

        <div style={{ width: "72px", height: "3px", background: "linear-gradient(90deg, transparent, #e8a020, transparent)", marginBottom: "24px", borderRadius: "2px" }} />

        <div style={{ color: "#E8A020", fontSize: "30px", fontStyle: "italic", fontFamily: "Georgia, serif", letterSpacing: "0.02em", textAlign: "center" }}>
          Igniting hearts for Jesus
        </div>
      </div>
    ),
    { ...size }
  );
}
