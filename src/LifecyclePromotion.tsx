import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
} from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { whoosh, ding } from "@remotion/sfx";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const BG = "#0a0e17";
const CARD_BG = "#111827";
const STAGE_BG = "#0f1520";
const STAGE_BORDER = "rgba(255,255,255,0.06)";
const HEADER_BG = "#151d2e";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const RED = "#ef4444";
const TEAL = "#06b6d4";
const WHITE_90 = "rgba(255,255,255,0.9)";
const WHITE_50 = "rgba(255,255,255,0.5)";
const WHITE_30 = "rgba(255,255,255,0.3)";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const STAGE_W = 340;
const STAGE_GAP = 28;
const STAGE_H = 420;
const CARD_W = STAGE_W - 32;
const VERSION = "4.1.9";
const DATE_STR = "7 Jun 2025 8:30 am";

const HouseIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"
      stroke={WHITE_50}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x={3}
      y={4}
      width={18}
      height={18}
      rx={2}
      stroke={WHITE_50}
      strokeWidth={2}
    />
    <path d="M16 2v4M8 2v4M3 10h18" stroke={WHITE_50} strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const ArrowRight: React.FC<{ size?: number; color?: string }> = ({
  size = 14,
  color = WHITE_50,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12h14m-6-6l6 6-6 6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} fill={GREEN} />
    <path
      d="M8 12l2.5 3L16 9"
      stroke="#fff"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx={12} cy={12} r={10} fill={RED} />
    <path
      d="M12 8v4m0 4h.01"
      stroke="#fff"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </svg>
);

const REPO_ICON_SIZE = 20;

interface RepoInfo {
  name: string;
  icon: "npm" | "docker";
}

interface StageProps {
  name: string;
  tag?: string;
  showEntry?: boolean;
  showExit?: boolean;
  opacity: number;
  translateY: number;
  repos: RepoInfo[];
  children?: React.ReactNode;
}

const Stage: React.FC<StageProps> = ({
  name,
  tag,
  showEntry = true,
  showExit = true,
  opacity,
  translateY,
  repos,
  children,
}) => (
  <div
    style={{
      width: STAGE_W,
      height: STAGE_H,
      background: STAGE_BG,
      borderRadius: 14,
      border: `1px solid ${STAGE_BORDER}`,
      overflow: "hidden",
      opacity,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 48,
        background: HEADER_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: `1px solid ${STAGE_BORDER}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {tag && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
              background: TEAL,
              padding: "2px 8px",
              borderRadius: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {tag}
          </span>
        )}
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: WHITE_90,
            letterSpacing: 0.3,
          }}
        >
          {name}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {showEntry && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              background: BLUE,
              padding: "3px 10px",
              borderRadius: 4,
            }}
          >
            Entry
          </span>
        )}
        {showExit && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              background: BLUE,
              padding: "3px 10px",
              borderRadius: 4,
            }}
          >
            Exit
          </span>
        )}
      </div>
    </div>
    <div style={{ flex: 1, padding: 16, position: "relative" }}>{children}</div>
    {repos.length > 0 && (
      <div
        style={{
          padding: "10px 16px 14px",
          borderTop: `1px solid ${STAGE_BORDER}`,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {repos.map((r) => (
          <div
            key={r.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 6,
              padding: "5px 10px",
              border: `1px solid ${STAGE_BORDER}`,
            }}
          >
            <Img
              src={staticFile(r.icon === "docker" ? "docker_logo.svg" : "npm_logo.svg")}
              style={{ width: REPO_ICON_SIZE, height: REPO_ICON_SIZE, objectFit: "contain" }}
            />
            <span style={{ fontSize: 11, fontWeight: 500, color: WHITE_50 }}>
              {r.name}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface VersionCardProps {
  version: string;
  fromStage: string;
  toStage: string;
  date: string;
  opacity: number;
  scale: number;
  statusBadge?: React.ReactNode;
  borderColor?: string;
  glow?: string;
}

const VersionCard: React.FC<VersionCardProps> = ({
  version,
  fromStage,
  toStage,
  date,
  opacity,
  scale,
  statusBadge,
  borderColor = STAGE_BORDER,
  glow,
}) => (
  <div
    style={{
      width: CARD_W,
      background: CARD_BG,
      borderRadius: 10,
      border: `1.5px solid ${borderColor}`,
      padding: "14px 16px",
      opacity,
      transform: `scale(${scale})`,
      boxShadow: glow
        ? `0 0 20px ${glow}, 0 4px 16px rgba(0,0,0,0.4)`
        : "0 4px 16px rgba(0,0,0,0.4)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color: WHITE_90 }}>
        {version}
      </span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
      }}
    >
      <HouseIcon size={14} />
      <span style={{ fontSize: 13, color: WHITE_50 }}>{fromStage}</span>
      <ArrowRight size={12} />
      <span style={{ fontSize: 13, color: WHITE_50 }}>{toStage}</span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: statusBadge ? 12 : 0,
      }}
    >
      <CalendarIcon size={14} />
      <span style={{ fontSize: 12, color: WHITE_30 }}>{date}</span>
    </div>
    {statusBadge}
  </div>
);

export const LifecyclePromotion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const t = (sec: number) => Math.round(sec * fps);

  // -- Timeline markers --
  const STAGE_ENTER_START = 0;
  const CARD_APPEAR = t(1);
  const PROMO_DEV_QA_START = t(2);
  const PROMO_DEV_QA_END = t(3);
  const SETTLE_QA_START = t(3.2);
  const PROMO_QA_PROD_START = t(5);
  const PROMO_QA_PROD_PEAK = t(6.2);
  const FAIL_START = t(6.8);
  const FAIL_SHAKE_END = t(7.6);
  const BOUNCE_BACK_END = t(8.2);
  const EXIT_START = t(9);

  // -- Stage columns entrance --
  const stageVis = (idx: number) => {
    const delay = STAGE_ENTER_START + idx * t(0.15);
    const s = spring({ frame, fps, delay, config: { damping: 14, stiffness: 100 } });
    return {
      opacity: s,
      translateY: interpolate(s, [0, 1], [40, 0]),
    };
  };

  // -- Card appear in DEV --
  const cardAppear = spring({
    frame,
    fps,
    delay: CARD_APPEAR,
    config: { damping: 14, stiffness: 120 },
  });

  // -- Card left positions inside each stage (padding = 16) --
  const STAGE_PAD = 16;
  const devLeft = STAGE_PAD;
  const qaLeft = STAGE_W + STAGE_GAP + STAGE_PAD;
  const prodLeft = (STAGE_W + STAGE_GAP) * 2 + STAGE_PAD;

  const promoToQA = interpolate(
    frame,
    [PROMO_DEV_QA_START, PROMO_DEV_QA_END],
    [0, 1],
    CL,
  );
  const promoToQASmooth = promoToQA * promoToQA * (3 - 2 * promoToQA);

  // -- QA settle check --
  const qaCheckVis = spring({
    frame,
    fps,
    delay: SETTLE_QA_START,
    config: { damping: 12, stiffness: 100 },
  });

  // -- Promotion QA -> PROD attempt --
  const promoToProd = interpolate(
    frame,
    [PROMO_QA_PROD_START, PROMO_QA_PROD_PEAK],
    [0, 0.7],
    CL,
  );

  // -- Fail: shake --
  const shakeProgress = interpolate(
    frame,
    [FAIL_START, FAIL_SHAKE_END],
    [0, 1],
    CL,
  );
  const shakeX =
    shakeProgress > 0 && shakeProgress < 1
      ? Math.sin(shakeProgress * Math.PI * 8) * 12 * (1 - shakeProgress)
      : 0;

  // -- Bounce back to QA --
  const bounceBack = interpolate(
    frame,
    [FAIL_SHAKE_END, BOUNCE_BACK_END],
    [0, 1],
    CL,
  );
  const bounceBackSmooth = bounceBack * bounceBack * (3 - 2 * bounceBack);

  // -- Compute card left position --
  let cardLeftPos: number;
  if (frame < PROMO_DEV_QA_START) {
    cardLeftPos = devLeft;
  } else if (frame < PROMO_DEV_QA_END) {
    cardLeftPos = devLeft + (qaLeft - devLeft) * promoToQASmooth;
  } else if (frame < PROMO_QA_PROD_START) {
    cardLeftPos = qaLeft;
  } else if (frame < FAIL_SHAKE_END) {
    const targetX = qaLeft + (prodLeft - qaLeft) * promoToProd;
    cardLeftPos = targetX + shakeX;
  } else if (frame < BOUNCE_BACK_END) {
    const failedX = qaLeft + (prodLeft - qaLeft) * 0.7;
    cardLeftPos = failedX + (qaLeft - failedX) * bounceBackSmooth;
  } else {
    cardLeftPos = qaLeft;
  }

  // -- Card state --
  const isFailing = frame >= FAIL_START;
  const isFailed = frame >= FAIL_SHAKE_END;
  const failBannerVis = spring({
    frame,
    fps,
    delay: FAIL_START + t(0.3),
    config: { damping: 14, stiffness: 120 },
  });

  const failBorderOpacity = isFailing
    ? interpolate(frame, [FAIL_START, FAIL_START + t(0.3)], [0, 1], CL)
    : 0;

  // -- Current label --
  let fromStage = "→ DEV";
  let toStage = "";
  if (frame >= PROMO_DEV_QA_END) {
    fromStage = "DEV";
    toStage = "QA";
  }
  if (frame >= PROMO_QA_PROD_START && !isFailed) {
    fromStage = "QA";
    toStage = "PROD";
  }
  if (isFailed) {
    fromStage = "DEV";
    toStage = "QA";
  }

  // -- Promotion success badge in QA --
  const showQABadge = frame >= SETTLE_QA_START && frame < PROMO_QA_PROD_START;

  // -- Loading dots for PROD attempt --
  const showLoading =
    frame >= PROMO_QA_PROD_START + t(0.3) && frame < FAIL_START;
  const dotCount = showLoading
    ? Math.floor(((frame - PROMO_QA_PROD_START) / t(0.3)) % 4)
    : 0;

  // -- Exit --
  const exitProgress = interpolate(
    frame,
    [EXIT_START, durationInFrames],
    [0, 1],
    CL,
  );
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], CL);

  // -- Title bar --
  const titleVis = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 16, stiffness: 100 },
  });

  const cardOffsetY = 16;

  const statusBadge =
    showQABadge ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(59,130,246,0.15)",
          borderRadius: 6,
          padding: "6px 10px",
          opacity: qaCheckVis,
          transform: `translateY(${interpolate(qaCheckVis, [0, 1], [8, 0])}px)`,
        }}
      >
        <CheckIcon size={14} />
        <span style={{ fontSize: 12, color: "rgba(59,130,246,0.9)", fontWeight: 500 }}>
          Promotion to QA Passed
        </span>
        <br />
      </div>
    ) : isFailed ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(239,68,68,0.15)",
          borderRadius: 6,
          padding: "6px 10px",
          opacity: failBannerVis,
          transform: `translateY(${interpolate(failBannerVis, [0, 1], [8, 0])}px)`,
        }}
      >
        <ErrorIcon size={14} />
        <div>
          <div style={{ fontSize: 12, color: RED, fontWeight: 600 }}>
            Promotion to PROD failed
          </div>
          <div style={{ fontSize: 10, color: "rgba(239,68,68,0.6)" }}>
            7 Jun 2025 8:32 am
          </div>
        </div>
      </div>
    ) : undefined;

  const cardBorder = isFailing
    ? `rgba(239,68,68,${failBorderOpacity})`
    : frame >= PROMO_DEV_QA_END && frame < PROMO_QA_PROD_START
      ? `rgba(34,197,94,0.3)`
      : STAGE_BORDER;

  const cardGlow = isFailing
    ? `rgba(239,68,68,${failBorderOpacity * 0.25})`
    : frame >= PROMO_DEV_QA_END && frame < PROMO_QA_PROD_START
      ? "rgba(34,197,94,0.1)"
      : undefined;

  const s0 = stageVis(0);
  const s1 = stageVis(1);
  const s2 = stageVis(2);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Sounds */}
      {frame >= PROMO_DEV_QA_START && frame < PROMO_DEV_QA_START + 2 && (
        <Audio src={whoosh} startFrom={0} volume={0.4} />
      )}
      {frame >= PROMO_QA_PROD_START && frame < PROMO_QA_PROD_START + 2 && (
        <Audio src={whoosh} startFrom={0} volume={0.4} />
      )}
      {frame >= FAIL_START && frame < FAIL_START + 2 && (
        <Audio src={ding} startFrom={0} volume={0.5} />
      )}

      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          opacity: titleVis,
          transform: `translateY(${interpolate(titleVis, [0, 1], [20, 0])}px)`,
        }}
      >
        <CalendarIcon size={22} />
        <span style={{ fontSize: 22, fontWeight: 700, color: WHITE_90 }}>
          Versions &amp; Assets
        </span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginBottom: 24,
          opacity: titleVis,
        }}
      >
        <span style={{ fontSize: 14, color: WHITE_30, fontWeight: 500 }}>
          Code
        </span>
        <span
          style={{
            fontSize: 14,
            color: WHITE_90,
            fontWeight: 600,
            borderBottom: `2px solid ${BLUE}`,
            paddingBottom: 6,
          }}
        >
          Versions Lifecycle
        </span>
      </div>

      {/* Stage columns */}
      <div
        style={{
          display: "flex",
          gap: STAGE_GAP,
          position: "relative",
        }}
      >
        <Stage
          name="DEV"
          showEntry={false}
          opacity={s0.opacity}
          translateY={s0.translateY}
          repos={[
            { name: "dev-npm", icon: "npm" },
            { name: "dev-docker", icon: "docker" },
          ]}
        />
        <Stage
          name="QA"
          tag="Entry"
          opacity={s1.opacity}
          translateY={s1.translateY}
          repos={[
            { name: "qa-npm", icon: "npm" },
            { name: "qa-docker", icon: "docker" },
          ]}
        />
        <Stage
          name="PROD (RELEASE)"
          tag="Release"
          opacity={s2.opacity}
          translateY={s2.translateY}
          repos={[
            { name: "prod-npm", icon: "npm" },
            { name: "prod-docker", icon: "docker" },
          ]}
        />

        {/* Floating version card */}
        <div
          style={{
            position: "absolute",
            top: 48 + cardOffsetY,
            left: cardLeftPos,
            zIndex: 10,
            opacity: cardAppear,
          }}
        >
          <VersionCard
            version={VERSION}
            fromStage={fromStage}
            toStage={toStage}
            date={DATE_STR}
            opacity={1}
            scale={interpolate(cardAppear, [0, 1], [0.8, 1])}
            statusBadge={statusBadge}
            borderColor={cardBorder}
            glow={cardGlow}
          />
        </div>

        {/* Loading indicator during PROD attempt */}
        {showLoading && (
          <div
            style={{
              position: "absolute",
              top: STAGE_H / 2 + 24,
              right: STAGE_W / 2 - 30,
              display: "flex",
              gap: 6,
              zIndex: 5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i < dotCount ? TEAL : WHITE_30,
                  transition: "background 0.1s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
