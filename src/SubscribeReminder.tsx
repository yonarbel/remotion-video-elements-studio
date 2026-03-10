import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { whoosh, whip, mouseClick, ding } from "@remotion/sfx";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: sans } = loadSans("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const YT_RED = "#FF0000";
const BELL_GOLD = "#FFD700";

const CL = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const SubscribeReminderSchema = z.object({
  size: z.enum(["small", "medium", "large"]),
});

const SIZE_CONFIG = {
  small:  { pad: "20px 32px", btnFont: 14, btnPad: "8px 20px", btnRadius: 22, icon: 26, cursor: 32, gap: 20, divH: 32, radius: 16, notif: 10 },
  medium: { pad: "28px 44px", btnFont: 18, btnPad: "12px 28px", btnRadius: 28, icon: 34, cursor: 40, gap: 28, divH: 40, radius: 20, notif: 13 },
  large:  { pad: "36px 56px", btnFont: 22, btnPad: "14px 36px", btnRadius: 34, icon: 44, cursor: 50, gap: 36, divH: 50, radius: 24, notif: 16 },
} as const;

/* ─── Bell SVG ─── */
const BellSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

/* ─── Like (thumbs up) SVG — outline ─── */
const LikeOutlineSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
  </svg>
);

/* ─── Like (thumbs up) SVG — filled ─── */
const LikeFilledSvg: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
  </svg>
);

/* ─── Cursor SVG ─── */
const CursorSvg: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M5 3l14 8.5-6.2 1.4-3.4 5.6L5 3z" stroke="#000" strokeWidth="1" strokeLinejoin="round" fill="#fff" />
  </svg>
);

export const SubscribeReminder: React.FC<
  z.infer<typeof SubscribeReminderSchema>
> = ({ size }) => {
  const sz = SIZE_CONFIG[size];
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Timeline ──
  // Phase 1: cursor appears, moves to like
  const CURSOR_START = Math.round(fps * 0.8);
  const LIKE_CLICK = Math.round(fps * 1.5);

  // Phase 2: cursor moves from like to bell
  const BELL_MOVE_START = LIKE_CLICK + Math.round(fps * 0.4);
  const BELL_CLICK = BELL_MOVE_START + Math.round(fps * 0.6);
  const BELL_SHAKE_START = BELL_CLICK + Math.round(fps * 0.1);
  const SUBSCRIBED_FRAME = BELL_CLICK + Math.round(fps * 0.25);

  const exitStart = durationInFrames - Math.round(fps * 0.5);

  // ── Entrance ──
  const enterSpring = spring({ frame, fps, delay: 0, config: { damping: 14, stiffness: 140 } });
  const enterY = interpolate(enterSpring, [0, 1], [140, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 1], CL);

  // ── Like state ──
  const isLiked = frame >= LIKE_CLICK;
  const likePop = spring({ frame, fps, delay: LIKE_CLICK, config: { damping: 10, stiffness: 200 } });

  // ── Subscribe state ──
  const isSubscribed = frame >= SUBSCRIBED_FRAME;
  const subscribePop = spring({ frame, fps, delay: SUBSCRIBED_FRAME, config: { damping: 10, stiffness: 200 } });

  // ── Cursor position ──
  // Phase 1: enter from bottom-right → like button (target offset from center)
  // Phase 2: like → bell
  // Using relative offsets from the bell icon position (rightmost element)
  const cursorAppear = spring({ frame, fps, delay: CURSOR_START, config: { damping: 14, stiffness: 120 } });

  // Cursor X/Y relative to its anchor near the bell
  // Like is roughly 3 elements left of bell: subscribe btn + gap + like
  const likeOffsetX = -(sz.icon + sz.gap + 120 + sz.gap); // approx distance from bell to like
  const bellOffsetX = 0;

  let cursorX: number;
  let cursorY: number;

  if (frame < CURSOR_START) {
    cursorX = 250;
    cursorY = 100;
  } else if (frame < LIKE_CLICK) {
    // Moving toward like
    cursorX = interpolate(frame, [CURSOR_START, LIKE_CLICK], [250, likeOffsetX], CL);
    cursorY = interpolate(frame, [CURSOR_START, LIKE_CLICK], [100, 0], CL);
  } else if (frame < BELL_MOVE_START) {
    // Resting on like
    cursorX = likeOffsetX;
    cursorY = 0;
  } else if (frame < BELL_CLICK) {
    // Moving from like to bell
    cursorX = interpolate(frame, [BELL_MOVE_START, BELL_CLICK], [likeOffsetX, bellOffsetX], CL);
    cursorY = 0;
  } else {
    // Resting on bell
    cursorX = bellOffsetX;
    cursorY = 0;
  }

  // Click press effects
  const likePress =
    frame >= LIKE_CLICK && frame < LIKE_CLICK + 4
      ? interpolate(frame, [LIKE_CLICK, LIKE_CLICK + 2, LIKE_CLICK + 4], [1, 0.85, 1], CL)
      : 1;

  const bellPress =
    frame >= BELL_CLICK && frame < BELL_CLICK + 4
      ? interpolate(frame, [BELL_CLICK, BELL_CLICK + 2, BELL_CLICK + 4], [1, 0.85, 1], CL)
      : 1;

  const clickPress = frame < BELL_MOVE_START ? likePress : bellPress;

  // Cursor fade out after bell click
  const cursorFadeStart = BELL_CLICK + Math.round(fps * 0.5);
  const cursorFade =
    frame >= cursorFadeStart
      ? interpolate(frame, [cursorFadeStart, cursorFadeStart + Math.round(fps * 0.3)], [1, 0], CL)
      : 1;

  // ── Bell shake ──
  let bellRotation = 0;
  if (frame >= BELL_SHAKE_START) {
    const elapsed = frame - BELL_SHAKE_START;
    const shakeDuration = Math.round(fps * 0.6);
    if (elapsed < shakeDuration) {
      const decay = interpolate(elapsed, [0, shakeDuration], [1, 0], CL);
      bellRotation = Math.sin(elapsed * 2.2) * 20 * decay;
    }
  }

  const bellColorSpring = spring({ frame, fps, delay: BELL_SHAKE_START, config: { damping: 12, stiffness: 160 } });
  const bellColor = bellColorSpring > 0.5 ? BELL_GOLD : "rgba(255,255,255,0.7)";

  // ── Notification dot ──
  const notifPop = spring({ frame, fps, delay: BELL_SHAKE_START + Math.round(fps * 0.2), config: { damping: 10, stiffness: 200 } });

  // ── Exit ──
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], CL);
  const exitY = interpolate(exitProgress, [0, 1], [0, 140], CL);
  const exitOpacity = interpolate(exitProgress, [0, 0.7, 1], [1, 1, 0], CL);

  const likeIconSize = Math.round(sz.icon * 0.85);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {/* Entrance */}
      <Sequence from={0} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>

      {/* Like click sound */}
      <Sequence from={LIKE_CLICK} layout="none">
        <Audio src={mouseClick} volume={0.4} />
      </Sequence>

      {/* Bell click sound */}
      <Sequence from={BELL_CLICK} layout="none">
        <Audio src={mouseClick} volume={0.4} />
      </Sequence>

      {/* Bell ding */}
      <Sequence from={BELL_SHAKE_START} layout="none">
        <Audio src={ding} volume={0.35} />
      </Sequence>

      {/* Exit */}
      <Sequence from={exitStart - Math.round(fps * 0.1)} layout="none">
        <Audio src={whip} volume={0.3} />
      </Sequence>

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${enterY + exitY}px)`,
          opacity: enterOpacity * exitOpacity,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10, 12, 16, 0.95)",
            backdropFilter: "blur(24px)",
            borderRadius: sz.radius,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: sz.pad,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: sz.gap,
            position: "relative",
          }}
        >
          {/* Channel logo */}
          <Img
            src={staticFile("jfrog_logo.svg")}
            style={{ height: sz.icon, width: sz.icon }}
          />

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: sz.divH,
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          />

          {/* Like button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              transform: `scale(${isLiked ? interpolate(likePop, [0, 1], [1.3, 1]) : 1})`,
            }}
          >
            {isLiked ? (
              <LikeFilledSvg size={likeIconSize} color={YT_RED} />
            ) : (
              <LikeOutlineSvg size={likeIconSize} color="rgba(255,255,255,0.7)" />
            )}
          </div>

          {/* Subscribe button */}
          <div
            style={{
              backgroundColor: isSubscribed ? "rgba(255,255,255,0.1)" : YT_RED,
              borderRadius: sz.btnRadius,
              padding: sz.btnPad,
              fontFamily: sans,
              fontSize: sz.btnFont,
              fontWeight: 700,
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              transform: isSubscribed
                ? `scale(${interpolate(subscribePop, [0, 1], [1.15, 1])})`
                : "scale(1)",
              whiteSpace: "nowrap",
            }}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </div>

          {/* Bell icon */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotate(${bellRotation}deg)`,
              transformOrigin: "top center",
            }}
          >
            <BellSvg size={sz.icon} color={bellColor} />

            {notifPop > 0.01 && (
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: sz.notif,
                  height: sz.notif,
                  borderRadius: "50%",
                  backgroundColor: YT_RED,
                  transform: `scale(${interpolate(notifPop, [0, 1], [0, 1])})`,
                  boxShadow: `0 0 6px ${YT_RED}80`,
                }}
              />
            )}
          </div>

          {/* Animated cursor — positioned relative to the bell (last element, right side) */}
          {cursorAppear > 0.01 && cursorFade > 0.01 && (
            <div
              style={{
                position: "absolute",
                right: parseInt(sz.pad.split(" ")[1]) + sz.icon / 2,
                top: "50%",
                transform: `translate(${cursorX}px, ${cursorY}px) scale(${clickPress})`,
                opacity: cursorAppear * cursorFade,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <CursorSvg size={sz.cursor} />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
