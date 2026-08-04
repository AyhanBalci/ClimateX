import { ImageResponse } from "next/og";

export const alt = "ClimateX — laadpalen voor thuis, zakelijk en VvE, vakkundig geïnstalleerd";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(circle at 90% 20%, rgba(16,185,129,0.14), transparent 45%)",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(34,211,238,0.15)",
              color: "#67e8f9",
              fontSize: 34,
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#ffffff" }}>ClimateX</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              letterSpacing: 6,
              color: "#67e8f9",
              marginBottom: 20,
            }}
          >
            LAADPALEN
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: 940,
            }}
          >
            Uw laadpaal, vakkundig geïnstalleerd.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Alfen", "Ratio", "Easee", "Wallbox", "Zaptec"].map((merk) => (
            <div
              key={merk}
              style={{
                display: "flex",
                padding: "12px 26px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
                color: "#cbd5e1",
                fontSize: 26,
              }}
            >
              {merk}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
