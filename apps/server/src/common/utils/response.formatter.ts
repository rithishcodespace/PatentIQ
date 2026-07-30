export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

export class ResponseFormatter {
  static success<T>(data: T, message: string = 'Success', meta?: Record<string, any>): ApiResponse<T> {
    const res: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (meta !== undefined) {
      res.meta = meta;
    }
    return res;
  }

  static error(error: string, message: string = 'Error occurred'): ApiResponse<null> {
    return {
      success: false,
      message,
      error,
    };
  }
}
