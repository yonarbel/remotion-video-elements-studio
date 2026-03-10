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
import { AgendaList, AgendaListSchema } from "./AgendaList";
import {
  SubscribeReminder,
  SubscribeReminderSchema,
} from "./SubscribeReminder";
import {
  StopwatchCounter,
  StopwatchCounterSchema,
  calculateStopwatchDuration,
} from "./StopwatchCounter";
import { CodeSnippet, CodeSnippetSchema } from "./CodeSnippet";

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
          size: "small",
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
          titleFontSize: 52,
          subtitleFontSize: 24,
          logoSize: "medium" as const,
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
          size: "small",
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
          size: "small",
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
          size: "medium",
          celebrate: true,
          celebrationHold: 2,
        }}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AgendaList"
        component={AgendaList}
        schema={AgendaListSchema}
        defaultProps={{
          heading: "Today we'll cover",
          items:
            "Publishing skills to Artifactory, Signing with JFrog Evidence, Secure installation flow, Execution & validation",
          bulletStyle: "number",
          position: "center",
          sizePct: 100,
        }}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SubscribeReminder"
        component={SubscribeReminder}
        schema={SubscribeReminderSchema}
        defaultProps={{
          size: "medium",
        }}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StopwatchCounter"
        component={StopwatchCounter}
        schema={StopwatchCounterSchema}
        calculateMetadata={calculateStopwatchDuration}
        defaultProps={{
          targetMinutes: 2,
          targetSeconds: 30,
          style: "digital" as const,
          size: "medium" as const,
          showMilliseconds: true,
        }}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CodeSnippet"
        component={CodeSnippet}
        schema={CodeSnippetSchema}
        defaultProps={{
          code: `import { skills } from "@jfrog/sdk";\n\nconst result = await skills.publish({\n  name: "frogs-best-practices",\n  repo: "my-skills-repo",\n  sign: true,\n  evidence: true,\n});\n\nconsole.log("Published:", result.version);`,
          language: "typescript" as const,
          theme: "dracula",
          title: "publish-skill.ts",
          showLineNumbers: true,
          highlightLines: "3,4,5,6,7",
          animateHighlight: true,
          singleHighlight: true,
          animation: "line-by-line" as const,
          size: "medium" as const,
        }}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
