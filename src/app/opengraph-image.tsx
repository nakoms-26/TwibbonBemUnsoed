import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Twibbon BEM Unsoed - Platform Twibbon Resmi";
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e0a4a 0%, #2d1b69 50%, #0f0529 100%)",
          padding: "60px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Subtle Decorative Elements */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 92, 191, 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(253, 185, 39, 0.25) 0%, transparent 70%)",
          }}
        />

        {/* Top Header Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              color: "#0a031e",
              fontWeight: 900,
              fontSize: "24px",
              padding: "10px 24px",
              borderRadius: "16px",
              letterSpacing: "1px",
            }}
          >
            TWIBBON
          </div>
          <div
            style={{
              background: "#FDB927",
              color: "#0a031e",
              fontWeight: 900,
              fontSize: "24px",
              padding: "10px 24px",
              borderRadius: "999px",
              letterSpacing: "1px",
            }}
          >
            BEM UNSOED
          </div>
        </div>

        {/* Big Catchy Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "#FDB927",
              letterSpacing: "-1px",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            #BEM UNSOED TWIBBON
          </div>
          <div
            style={{
              fontSize: "30px",
              fontWeight: 700,
              color: "#ffffff",
              marginTop: "16px",
              opacity: 0.95,
            }}
          >
            Platform Twibbon Foto & Video Resmi
          </div>
        </div>

        {/* Bottom Tagline Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "12px 32px",
            borderRadius: "999px",
          }}
        >
          <span
            style={{
              color: "#FDB927",
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: "1px",
            }}
          >
            KABINET KAUSA CIPTA
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "18px" }}>•</span>
          <span
            style={{
              color: "#ede9fe",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            Universitas Jenderal Soedirman
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
