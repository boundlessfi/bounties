declare module "@tabler/icons-react" {
  import * as React from "react";
  export const IconMenu2: React.FC<React.SVGProps<SVGSVGElement>>;
  export const IconX: React.FC<React.SVGProps<SVGSVGElement>>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "motion/react" {
  import { RefObject } from "react";

  // Relaxed typing for motion to avoid build-time type issues in environments
  // where `motion/react` types are not available. Using `any` here is a small
  // compromise to let the build proceed; we keep it local to this project.
  export const motion: any;
  export const AnimatePresence: any;

  export function useScroll(options?: {
    target?: RefObject<Element | null>;
    offset?: string[];
  }): { scrollY: { get(): number } };

  export function useMotionValueEvent<T = number>(
    motionValue: { get(): T },
    eventName: string,
    handler: (latest: T) => void,
  ): void;
}
