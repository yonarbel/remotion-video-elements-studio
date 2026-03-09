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

export interface LowerThirdProps {
  title: string;
  subtitle: string;
}

export const LowerThird: React.FC<LowerThirdProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

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
          bottom: 80,
          left: 80,
          display: "flex",
          alignItems: "stretch",
          transform: `translateY(${masterTranslateY}px)`,
          opacity: interpolate(exitProgress, [0, 0.8, 1], [1, 1, 0], CL),
        }}
      >
        <div
          style={{
            width: 5,
            backgroundColor: JFROG_GREEN,
            borderRadius: "3px 0 0 3px",
            transform: `scaleY(${accentSlide})`,
            transformOrigin: "bottom",
            boxShadow: `0 0 12px ${JFROG_GREEN}60`,
          }}
        />
        <div
          style={{
            backgroundColor: BAR_BG,
            backdropFilter: "blur(20px)",
            borderRadius: "0 10px 10px 0",
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "16px 32px 16px 20px",
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
              style={{ width: 44, height: 44 }}
            />
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              backgroundColor: "rgba(255,255,255,0.12)",
              flexShrink: 0,
              opacity: logoAppear,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                opacity: titleAppear,
                transform: `translateX(${interpolate(titleAppear, [0, 1], [20, 0])}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 14,
                color: JFROG_GREEN,
                opacity: subtitleAppear,
                transform: `translateX(${interpolate(subtitleAppear, [0, 1], [16, 0])}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LowerThirdPublish: React.FC = () => (
  <LowerThird
    title="Publishing Skill"
    subtitle="jf skill publish → JFrog Platform"
  />
);

export const LowerThirdArtifactory: React.FC = () => (
  <LowerThird
    title="Skill Repository"
    subtitle="Browsing published skills in Artifactory"
  />
);

export const LowerThirdSearch: React.FC = () => (
  <LowerThird
    title="Semantic Skill Search"
    subtitle="jf skills search — natural language discovery"
  />
);

export const LowerThirdInstall: React.FC = () => (
  <LowerThird
    title="Installing Skill"
    subtitle="jf skills install — from Artifactory to agent"
  />
);

export const LowerThirdEvidence: React.FC = () => (
  <LowerThird
    title="Evidence Validation"
    subtitle="jf skills install — verifying signatures before install"
  />
);

export const LowerThirdExportKeys: React.FC = () => (
  <LowerThird
    title="Exporting Keys"
    subtitle="Sign skill and attach evidence"
  />
);

export const LowerThirdMalicious: React.FC = () => (
  <LowerThird
    title="Injecting Malicious Command"
    subtitle="Tampering with SKILL.md before publish"
  />
);

export const LowerThirdPublishBlocked: React.FC = () => (
  <LowerThird
    title="Publish Blocked"
    subtitle="Security scan detected malicious command — upload rejected"
  />
);

export const LowerThirdFixRepublish: React.FC = () => (
  <LowerThird
    title="Fixing & Re-publishing"
    subtitle="Removing malicious code → clean publish"
  />
);

// ── Parametrized version (editable from Studio sidebar) ──
export const LowerThirdSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export const LowerThirdGeneric: React.FC<z.infer<typeof LowerThirdSchema>> = ({
  title,
  subtitle,
}) => <LowerThird title={title} subtitle={subtitle} />;
