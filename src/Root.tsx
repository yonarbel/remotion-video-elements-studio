import "./index.css";
import { Composition } from "remotion";
import { InstallSkillFlow } from "./InstallSkillFlow";
import { PublishSkillFlow } from "./PublishSkillFlow";
import { FlowDiagrams } from "./FlowDiagrams";
import { TerminalSkillInstall } from "./TerminalSkillInstall";
import { SplitScreenSecure } from "./SplitScreenSecure";
import { MaliciousSkillDemo } from "./MaliciousSkillDemo";
import { SkillLifecycle } from "./SkillLifecycle";
import { LowerThirdGeneric, LowerThirdSchema } from "./LowerThirdPublish";
import { TitleCard, TitleCardSchema } from "./TitleCard";
import { CalloutBox, CalloutBoxSchema } from "./CalloutBox";
import { CommandOverlay, CommandOverlaySchema } from "./CommandOverlay";
import { StepProgressBar, StepProgressBarSchema } from "./StepProgressBar";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="InstallSkillFlow"
        component={InstallSkillFlow}
        durationInFrames={510}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="PublishSkillFlow"
        component={PublishSkillFlow}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FlowDiagrams"
        component={FlowDiagrams}
        durationInFrames={510}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TerminalSkillInstall"
        component={TerminalSkillInstall}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SplitScreenSecure"
        component={SplitScreenSecure}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MaliciousSkillDemo"
        component={MaliciousSkillDemo}
        durationInFrames={810}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SkillLifecycle"
        component={SkillLifecycle}
        durationInFrames={510}
        fps={30}
        width={800}
        height={450}
      />
      <Composition
        id="LowerThird"
        component={LowerThirdGeneric}
        schema={LowerThirdSchema}
        defaultProps={{
          title: "Your Title Here",
          subtitle: "Your subtitle here",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TitleCard"
        component={TitleCard}
        schema={TitleCardSchema}
        defaultProps={{
          title: "Your Video Title",
          subtitle: "A short description of what this video covers",
        }}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CalloutBox"
        component={CalloutBox}
        schema={CalloutBoxSchema}
        defaultProps={{
          type: "tip",
          position: "top-right",
          text: "Always verify skill signatures before installing in production.",
        }}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CommandOverlay"
        component={CommandOverlay}
        schema={CommandOverlaySchema}
        defaultProps={{
          command: "jf skill publish --sign --evidence",
          label: "Terminal",
          prompt: "»",
          style: "terminal",
          showLastLogin: false,
        }}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StepProgressBar"
        component={StepProgressBar}
        schema={StepProgressBarSchema}
        defaultProps={{
          steps: "Create Skill, Sign & Publish, Install, Execute",
          position: "top",
          celebrate: true,
          celebrationHold: 2,
        }}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
