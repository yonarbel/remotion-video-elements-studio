import "./index.css";
import { Composition } from "remotion";
import { InstallSkillFlow } from "./InstallSkillFlow";
import { PublishSkillFlow } from "./PublishSkillFlow";
import { FlowDiagrams } from "./FlowDiagrams";
import { TerminalSkillInstall } from "./TerminalSkillInstall";
import { SplitScreenSecure } from "./SplitScreenSecure";
import { MaliciousSkillDemo } from "./MaliciousSkillDemo";
import { SkillLifecycle } from "./SkillLifecycle";
import { LowerThirdPublish, LowerThirdArtifactory, LowerThirdSearch, LowerThirdInstall, LowerThirdEvidence, LowerThirdExportKeys, LowerThirdMalicious, LowerThirdPublishBlocked, LowerThirdFixRepublish, LowerThirdGeneric, LowerThirdSchema } from "./LowerThirdPublish";

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
        id="LowerThirdPublish"
        component={LowerThirdPublish}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdArtifactory"
        component={LowerThirdArtifactory}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdSearch"
        component={LowerThirdSearch}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdInstall"
        component={LowerThirdInstall}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdEvidence"
        component={LowerThirdEvidence}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdExportKeys"
        component={LowerThirdExportKeys}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdMalicious"
        component={LowerThirdMalicious}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdPublishBlocked"
        component={LowerThirdPublishBlocked}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LowerThirdFixRepublish"
        component={LowerThirdFixRepublish}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
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
    </>
  );
};
