export class ResponseFormatter {
    static success(data, message = 'Success', meta) {
        const res = {
            success: true,
            message,
            data,
        };
        if (meta !== undefined) {
            res.meta = meta;
        }
        return res;
    }
    static error(error, message = 'Error occurred') {
        return {
            success: false,
            message,
            error,
        };
    }
}
//# sourceMappingURL=response.formatter.js.map