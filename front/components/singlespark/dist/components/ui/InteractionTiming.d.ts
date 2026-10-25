import type { ProcessStep } from './ProcessSteps';
export interface TimingRow {
    id: string;
    key: string;
    started: number;
    duration: number | null;
    status: ProcessStep['status'];
}
export interface InteractionTiming {
    started: number;
    ended: number | null;
    rows: TimingRow[];
}
export interface TimingOptions {
    label: (key: string) => string;
    description?: (key: string) => string;
    groups?: Readonly<Record<string, string>>;
}
/** Only stage names and durations are retained; task results and wallet payloads never enter the trace. */
export declare function createInteractionTiming(onChange?: (timing: InteractionTiming) => void): {
    measure<T>(key: string, task: () => T | Promise<T>): Promise<T>;
    finish(): void;
};
export declare const formatDuration: (ms: number) => string;
export declare function timingSteps(timing: InteractionTiming, options: TimingOptions, now: number): ProcessStep[];
export declare function compactTimingSteps(timing: InteractionTiming, options: TimingOptions, now: number): ProcessStep[];
export declare function useInteractionTimings(timing: InteractionTiming | null | undefined, options: TimingOptions): {
    steps: ProcessStep[];
    details: ProcessStep[];
    elapsed: string;
} | null;
