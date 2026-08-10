export interface JobPayload<T = any> {
    jobId: string;
    type: string;
    data: T;
    createdAt: Date;
}
export interface IJobProcessor<T = any> {
    process(job: JobPayload<T>): Promise<void>;
}
//# sourceMappingURL=job-processor.interface.d.ts.map