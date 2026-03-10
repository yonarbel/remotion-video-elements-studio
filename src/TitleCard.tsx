import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";
const BG = "#0a0c10";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const LOGO_SIZE = {
  small: { img: 56, glow: 400, mb: 24, accentW: 90 },
  medium: { img: 80, glow: 600, mb: 32, accentW: 120 },
  large: { img: 110, glow: 800, mb: 40, accentW: 160 },
} as const;

export const TitleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  titleFontSize: z.number().min(12).max(120),
  subtitleFontSize: z.number().min(10).max(80),
  logoSize: z.enum(["small", "medium", "large"]),
});

export const TitleCard: React.FC<z.infer<typeof TitleCardSchema>> = ({
  title,
  subtitle,
  titleFontSize,
  subtitleFontSize,
  logoSize = "medium",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const exitStart = durationInFrames - Math.round(fps * 0.6);

  // ── Enter ──
  const bgFade = interpolate(frame, [0, Math.round(fps * 0.3)], [0, 1], CL);

  const accentLineWidth = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.15),
    config: { damping: 18, stiffness: 100 },
  });

  const logoScale = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.3),
    config: { damping: 14, stiffness: 120 },
  });

  const titleUp = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.55),
    config: { damping: 14, stiffness: 100 },
  });

  const subtitleUp = spring({
    frame,
    fps,
    delay: Math.round(fps * 0.75),
    config: { damping: 14, stiffness: 100 },
  });

  // ── Exit ──
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], CL);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], CL);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.96], CL);

  const logo = LOGO_SIZE[logoSize] ?? LOGO_SIZE.medium;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: sans,
        opacity: bgFade * exitOpacity,
        transform: `scale(${exitScale})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: logo.glow,
          height: logo.glow,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${JFROG_GREEN}08 0%, transparent 70%)`,
          opacity: logoScale,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <div
          style={{
            opacity: logoScale,
            transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
            marginBottom: logo.mb,
          }}
        >
          <Img
            src={staticFile("jfrog_logo.svg")}
            style={{ width: logo.img, height: logo.img }}
          />
        </div>

        <div
          style={{
            width: interpolate(accentLineWidth, [0, 1], [0, logo.accentW]),
            height: 3,
            backgroundColor: JFROG_GREEN,
            borderRadius: 2,
            marginBottom: 36,
            boxShadow: `0 0 16px ${JFROG_GREEN}50`,
          }}
        />

        <div
          style={{
            fontSize: titleFontSize,
            fontWeight: 800,
            color: "#ffffff",
            opacity: titleUp,
            transform: `translateY(${interpolate(titleUp, [0, 1], [24, 0])}px)`,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 1200,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: subtitleFontSize,
              fontWeight: 400,
              color: JFROG_GREEN,
              opacity: subtitleUp,
              transform: `translateY(${interpolate(subtitleUp, [0, 1], [18, 0])}px)`,
              marginTop: 16,
              textAlign: "center",
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
