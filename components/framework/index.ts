/**
 * Child Compass 3.0 Application Framework
 * Every authenticated page inherits this system automatically via AppShell.
 */

export { default as AppContainer, AppPageSection } from "./AppContainer";
export {
  default as FrameworkCard,
  HeroCard,
  PrimaryCard,
  SecondaryCard,
  SupportingCard,
} from "./FrameworkCard";
export { FrameworkButton, FrameworkButtonLink } from "./FrameworkButton";
export { DisplayText, HeroTitle, SectionTitle, BodyText, CaptionText } from "./FrameworkTypography";
export { Icon, NavIcon, type IconName } from "./FrameworkIcon";
export {
  FrameworkEmptyState,
  FrameworkSuccess,
  FrameworkError,
  ShimmerBlock,
  SkeletonLoader,
  SkeletonCard,
  SkeletonChart,
  SkeletonPage,
  SkeletonReport,
  LoadingPulse,
} from "./FrameworkFeedback";
export {
  frameworkRhythm,
  frameworkRadius,
  frameworkShadow,
  frameworkType,
  frameworkButton,
  frameworkCard,
  frameworkMotion,
  FRAMEWORK_MAX_WIDTH,
} from "./framework-tokens";
export type {
  FrameworkRhythmSlot,
  FrameworkCardVariant,
  FrameworkButtonVariant,
} from "./framework-tokens";

/* Shell chrome — direct imports to avoid circular deps */
export { default as AppEnvironmentBackground } from "@/components/shell/AppEnvironmentBackground";
export { default as AppShellTransition } from "@/components/shell/AppShellTransition";
export { default as AppTopNav } from "@/components/shell/AppTopNav";

/* Design-system aliases — canonical four-card / four-button API */
export {
  EmotionalButton,
  EmotionalButtonLink,
  EmptyState,
} from "@/components/design-system";
