import type { ElementType, ReactNode } from "react";
import { frameworkType } from "./framework-tokens";

type FrameworkTextProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
};

function Text({
  as: Tag = "p",
  className = "",
  styleClass,
  children,
  id,
}: FrameworkTextProps & { styleClass: string }) {
  return (
    <Tag id={id} className={`${styleClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

/** One typography system — five levels only */
export function DisplayText(props: FrameworkTextProps) {
  return <Text {...props} as={props.as ?? "h1"} styleClass={frameworkType.display} />;
}

export function HeroTitle(props: FrameworkTextProps) {
  return <Text {...props} as={props.as ?? "h1"} styleClass={frameworkType.heroTitle} />;
}

export function SectionTitle(props: FrameworkTextProps) {
  return <Text {...props} as={props.as ?? "h2"} styleClass={frameworkType.sectionTitle} />;
}

export function BodyText(props: FrameworkTextProps) {
  return <Text {...props} styleClass={frameworkType.body} />;
}

export function CaptionText(props: FrameworkTextProps) {
  return <Text {...props} styleClass={frameworkType.caption} />;
}
