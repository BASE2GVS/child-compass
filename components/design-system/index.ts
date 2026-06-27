/**
 * Child Compass 3.0 — Emotional Design System
 * Presentation layer exports. Import from `@/components/design-system`.
 */

/* Legacy + unified tokens */
export { ds, space } from "./tokens";

/* Token modules */
export {
  palette,
  colorVars,
  fontFamily,
  typeScale,
  spacing,
  layoutSpace,
  touchTarget,
  radius,
  shadows,
  duration,
  easing,
  motion,
  stagger,
} from "./tokens/index";

/* Layout */
export {
  PageHeader,
  SectionHeader,
  FormSection,
  PageShell,
  ContentSection,
} from "./layout";

/* Card hierarchy */
export {
  HeroCard,
  PrimaryCard,
  SecondaryCard,
  SupportingCard,
  MicroCard,
  PageHero,
  PremiumCard,
  GlassCard,
  MetricCard,
  ActionTile,
  ReportCard,
  TimelineCard,
  AIInsightCard,
} from "./cards";

/* Buttons */
export {
  EmotionalButton,
  EmotionalButtonLink,
  FloatingActionButton,
} from "./buttons";

/* Primitives */
export {
  Button,
  Input,
  Textarea,
  Select,
  Label,
  Banner,
  StatusBadge,
} from "./primitives";

/* Forms */
export { FormField, FormSuccess } from "./forms";

/* Feedback & loading */
export {
  EmptyState,
  ShimmerBlock,
  SkeletonLoader,
  SkeletonCard,
  SkeletonChart,
  SkeletonReport,
  SkeletonPage,
  LoadingPulse,
  ProgressBar,
  ProgressRing,
  StepProgress,
} from "./feedback";

/* Navigation */
export { navTokens, NavLink, SidebarNavLink, NavSectionLabel } from "./navigation";

/* Status */
export { StatusChip, DotIndicator } from "./status-chips";

/* Icons & illustrations */
export { Icon, type IconName } from "./icons";
export { EditorialIllustration, type IllustrationName } from "./illustrations";

/* Motion */
export { AnimatedSection, Breathe, StaggerChildren, StaggerItem, CountUp } from "./motion";
