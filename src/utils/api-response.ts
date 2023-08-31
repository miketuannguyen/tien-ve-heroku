import MESSAGES from './messages';
import { ValueOf } from './types';

export class APIResponse<T> {
    /** Response message */
    public message: ValueOf<typeof MESSAGES.SUCCESS> | ValueOf<typeof MESSAGES.ERROR> = MESSAGES.SUCCESS.SUCCESS;
    /** Response data */
    public data?: T;
    /** Validation error */
    public errors?: { [key: string]: string };
    /** List of validation error */
    public error_list?: { [key: string]: string }[];

    /**
     * Create a successful response
     * @param message - successful response message, `MESSAGES.SUCCESS.SUCCESS` by default
     * @param data - response data
     */
    public static success<T>(message: ValueOf<typeof MESSAGES.SUCCESS> = MESSAGES.SUCCESS.SUCCESS, data?: T) {
        const res = new APIResponse<T>();
        res.message = message;
        res.data = data;
        return res;
    }

    /**
     * Create an error response
     * @param message - error response message from API
     * @param data - error data
     * @param errors - validation errors
     */
    public static error<T = undefined>(
        message: ValueOf<typeof MESSAGES.ERROR>,
        data?: T,
        errors?: { [key: string]: string },
        errorList?: { [key: string]: string }[],
    ) {
        const res = new APIResponse<T>();
        res.message = message;
        res.data = data;
        res.errors = errors;
        res.error_list = errorList;
        return res;
    }
}

export class APIListResponse<T> {
    /** Response message */
    public message: ValueOf<typeof MESSAGES.SUCCESS> | ValueOf<typeof MESSAGES.ERROR> = MESSAGES.SUCCESS.SUCCESS;

    /** Response list data */
    public data = {
        list: [] as T[],
        total: 0,
    };

    /**
     * Create a successful list response
     * @param message - successful response message, `MESSAGES.SUCCESS.SUCCESS` by default
     * @param list - data list
     * @param total - total data count
     */
    public static success<T>(message: ValueOf<typeof MESSAGES.SUCCESS> = MESSAGES.SUCCESS.SUCCESS, list: T[] = [], total = 0) {
        const res = new APIListResponse<T>();
        res.message = message;
        res.data = { list, total };
        return res;
    }

    /**
     * Create an error list response
     * @param message - error response message from API
     * @param list - data list, empty by default
     * @param total - total data count, 0 by default
     */
    public static error<T = null>(message: ValueOf<typeof MESSAGES.ERROR>, list: T[] = [], total = 0) {
        const res = new APIListResponse<T>();
        res.message = message;
        res.data = { list, total };
        return res;
    }
}
