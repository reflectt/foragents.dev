export type CanaryRunStatus = "pass" | "fail" | "warning";

export interface CanaryCheck {
  name: string;
  status: CanaryRunStatus;
  message: string;
}

export interface CanaryRun {
  id: string;
  skillSlug: string;
  skillName: string;
  version: string;
  status: CanaryRunStatus;
  duration: number;
  timestamp: string;
  checks: CanaryCheck[];
  regression: boolean;
}
