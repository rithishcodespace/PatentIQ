export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: Record<string, any>;
}
export declare class ResponseFormatter {
    static success<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T>;
    static error(error: string, message?: string): ApiResponse<null>;
}
//# sourceMappingURL=response.formatter.d.ts.map