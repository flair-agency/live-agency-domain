export interface RecognitionPlan {
    operation: 'recognition';
    destination_profile: {
        id: string;
        version: string;
    };
    value_jpy: number;
    transaction_date: string;
    memo: string;
    [key: string]: unknown;
}
export interface PlanningFailure {
    status: 'blocked' | 'invalid';
    issues: string[];
    operation?: string;
}
export interface ReadyRecognition {
    status: 'ready';
    operation: 'recognition';
    plan_sha256: string;
    plan: RecognitionPlan;
}
export type ReadyPlan = ReadyRecognition;
export type PlanResult = ReadyRecognition | PlanningFailure;
/** Pure recognition planning. Exact decimal multiplication and half-up rounding use integer arithmetic. */
export declare function buildPlan(operation: 'recognition', payload: unknown): ReadyRecognition | PlanningFailure;
export declare function buildPlan(operation: string, payload: unknown): PlanResult;
