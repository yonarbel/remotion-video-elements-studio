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
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const JFROG_GREEN = "#40BE46";
const BAR_BG = "rgba(10, 12, 16, 0.92)";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const SIZE_CONFIG = {
  small:  { logo: 44, divH: 40, titleFont: 22, subFont: 14, pad: "16px 32px 16px 20px", gap: 20, textGap: 4, accentW: 5, radius: 10, bottom: 80, left: 80 },
  medium: { logo: 60, divH: 54, titleFont: 30, subFont: 18, pad: "22px 44px 22px 28px", gap: 28, textGap: 6, accentW: 6, radius: 14, bottom: 80, left: 80 },
  large:  { logo: 80, divH: 70, titleFont: 40, subFont: 24, pad: "30px 56px 30px 36px", gap: 36, textGap: 8, accentW: 7, radius: 16, bottom: 80, left: 80 },
} as const;

export interface LowerThirdProps {
  title: string;
  subtitle: string;
  size: "small" | "medium" | "large";
}

export const LowerThird: React.FC<LowerThirdProps> = ({ title, subtitle, size = "small" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sz = SIZE_CONFIG[size] ?? SIZE_CONFIG.small;

  const exitStart = durationInFrames - Math.round(fps * 0.8);

  const accentSlide = spring({ frame, fps, delay: 0, config: { damping: 16, stiffness: 180 } });
  const panelExpand = spring({ frame, fps, delay: Math.round(fps * 0.15), config: { damping: 14, stiffness: 120 } });
  const logoAppear = spring({ frame, fps, delay: Math.round(fps * 0.35), config: { damping: 14, stiffness: 140 } });
  const titleAppear = spring({ frame, fps, delay: Math.round(fps * 0.5), config: { damping: 14, stiffness: 120 } });
  const subtitleAppear = spring({ frame, fps, delay: Math.round(fps * 0.7), config: { damping: 14, stiffness: 120 } });

  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], CL);
  const masterTranslateY = interpolate(exitProgress, [0, 1], [0, 120], CL);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom: sz.bottom,
          left: sz.left,
          display: "flex",
          alignItems: "stretch",
          transform: `translateY(${masterTranslateY}px)`,
          opacity: interpolate(exitProgress, [0, 0.8, 1], [1, 1, 0], CL),
        }}
      >
        <div
          style={{
            width: sz.accentW,
            backgroundColor: JFROG_GREEN,
            borderRadius: `${sz.radius / 3}px 0 0 ${sz.radius / 3}px`,
            transform: `scaleY(${accentSlide})`,
            transformOrigin: "bottom",
            boxShadow: `0 0 12px ${JFROG_GREEN}60`,
          }}
        />
        <div
          style={{
            backgroundColor: BAR_BG,
            backdropFilter: "blur(20px)",
            borderRadius: `0 ${sz.radius}px ${sz.radius}px 0`,
            display: "flex",
            alignItems: "center",
            gap: sz.gap,
            padding: sz.pad,
            transform: `scaleX(${panelExpand})`,
            transformOrigin: "left",
            overflow: "hidden",
            boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              opacity: logoAppear,
              transform: `scale(${interpolate(logoAppear, [0, 1], [0.6, 1])})`,
              flexShrink: 0,
            }}
          >
            <Img
              src={staticFile("jfrog_logo.svg")}
              style={{ width: sz.logo, height: sz.logo }}
            />
          </div>
          <div
            style={{
              width: 1,
              height: sz.divH,
              backgroundColor: "rgba(255,255,255,0.12)",
              flexShrink: 0,
              opacity: logoAppear,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: sz.textGap }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: sz.titleFont,
                fontWeight: 700,
                color: "#ffffff",
                opacity: titleAppear,
                transform: `translateX(${interpolate(titleAppear, [0, 1], [20, 0])}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontFamily: mono,
                  fontSize: sz.subFont,
                  fontWeight: 400,
                  color: JFROG_GREEN,
                  opacity: subtitleAppear,
                  transform: `translateX(${interpolate(subtitleAppear, [0, 1], [16, 0])}px)`,
                  whiteSpace: "nowrap",
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Parametrized version (editable from Studio sidebar) ──
export const LowerThirdSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  size: z.enum(["small", "medium", "large"]),
});

export const LowerThirdGeneric: React.FC<z.infer<typeof LowerThirdSchema>> = ({
  title,
  subtitle,
  size,
}) => <LowerThird title={title} subtitle={subtitle} size={size} />;
