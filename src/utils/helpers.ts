import { CONSTANTS } from 'src/utils';
import * as dayjs from 'dayjs';
import { AnySchema, ArraySchema, ObjectSchema } from 'joi';

export default class Helpers {
    /**
     * Make all properties of an object immutable including nested objects
     * @param obj - this can contain nested objects
     * @returns a readonly version of `obj`
     */
    public static deepFreeze<T extends { [key: string]: any }>(obj: T) {
        Object.keys(obj).forEach((prop) => {
            if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
                Helpers.deepFreeze(obj[prop]);
            }
        });
        return Object.freeze(obj);
    }

    /**
     * Check if array contains element or not
     * @param arr - any variable
     */
    public static isFilledArray(arr: any): arr is any[] {
        return Array.isArray(arr) && arr.length > 0;
    }

    /**
     * Check if a variable is a filled string or not
     * @param str - any variable
     */
    public static isString(str: any): str is string {
        return str !== null && typeof str === 'string' && str.trim().length > 0;
    }

    /**
     * Check if object is empty or null or undefined
     * @param obj - any variable
     * @returns object is empty or null or undefined
     */
    public static isEmptyObject(obj: any) {
        if (obj === null) return true;
        if (typeof obj === 'undefined') return true;
        if (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            Object.keys(obj).length === 0 &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            obj.constructor === Object
        )
            return true;
        return false;
    }

    /**
     * Check if function is async or not
     * @param obj - any function
     * @returns - function is async or not
     */
    public static isAsync(obj: Function) {
        return obj.constructor.name === 'AsyncFunction';
    }

    /**
     * Validate object data with schema
     * @param schema - `Joi` schema
     * @param data - object data
     * @returns key - error message object, `null` if there is no error
     */
    public static validate<T extends { [key: string]: any }>(schema: ObjectSchema<T>, data: T) {
        const validationResult = schema.validate(data);
        if (!validationResult.error) return null;

        const errors: { [k: string]: string } = {};
        validationResult.error.details.forEach((errItem) => {
            if (errItem.context && Helpers.isString(errItem.context.key)) {
                errors[errItem.context.key] = errItem.message;
            }
        });
        return errors;
    }

    /**
     * Check if a Joi schema is a `ArraySchema`
     * @param schema - a Joi schema
     * @returns - `schema` is a `ArraySchema` or not
     */
    public static isArraySchema(schema: AnySchema): schema is ArraySchema {
        return !!(schema as ArraySchema).items;
    }

    /**
     * Format date
     * @param date - date input
     * @param toFormat - the designated format
     * @returns formatted date string
     */
    static formatDate(date: Date | string | number, toFormat = 'DD/MM/YYYY') {
        return dayjs(date).format(toFormat);
    }

    static getDateListInRange(startDate: string, endDate: string, toFormat = 'DD/MM/YYYY', unit: 'day' | 'month' = 'day') {
        const start = dayjs(startDate).startOf(unit);
        const end = dayjs(endDate).startOf(unit);

        const dateList: string[] = [];

        let currentMonthDay = start;

        while (currentMonthDay.isBefore(end, unit) || currentMonthDay.isSame(end, unit)) {
            dateList.push(currentMonthDay.format(toFormat));
            currentMonthDay = currentMonthDay.add(1, unit);
        }

        return dateList;
    }

    static generateOTP(length = CONSTANTS.OTP.LENGTH): string {
        const digits = '0123456789';
        let otp = '';

        for (let i = 0; i < length; i++) {
            // ! use crypto random here because math.random is not cryptically secured
            const randomIndex = Math.floor(Math.random() * digits.length);
            otp += digits[randomIndex];
        }

        return otp;
    }

    /**
     * Extract all numbers in a string by using regex to replace non-numeric characters
     * @param str - any string or number (which maybe set to string during runtime), not being mutated
     * @returns a number that is a combination of all numbers in the sequence from left to right, 0 if error
     * @example
     * ```typescript
     * const str = "110ab122cd";
     * const num = Lib.extractNumberFromString(str); //110122
     * ```
     */
    public static extractNumberFromString(str: string | number | null | undefined): number {
        if (typeof str === 'number') return str;
        if (!Helpers.isString(str)) return 0;

        const copy = str ? String(str) : '';
        const result = copy.replace(/[^0-9.]*/g, '');
        const resultNum = Number(result) ? Number(result) : 0;
        return String(str).startsWith('-') ? -resultNum : resultNum;
    }

    public static getSubstringBetweenStartEnd(inputString: string, start: string, end: string): string | null {
        const startIdx = inputString.indexOf(start);
        if (startIdx === -1) return null;

        const endIdx = inputString.substring(startIdx + start.length).indexOf(end);
        if (endIdx === -1) return null;

        return inputString.substring(startIdx + start.length, startIdx + start.length + endIdx);
    }

    public static getSubstringFromStart(inputString: string, start: string, length: number): string | null {
        const startIdx = inputString.indexOf(start);

        if (startIdx !== -1) {
            return inputString.substring(startIdx, startIdx + 1 + length);
        }

        return null;
    }

    /**
     * Check if value is one of object values using strict and narrow comparison
     * @param val - the value
     * @param obj - the object
     * @returns - value is one of object values or not
     */
    public static isObjectValue(val: any, obj: { [key: string]: any }) {
        const values = Object.values(obj);
        return values.includes(val);
    }

    /**
     * Get the string which is the formatted number
     * @param num - any number
     * @returns formatted number
     */
    static formatNumber(num: number): string {
        if (!num) return '0';
        const _moneyAmount = parseFloat(`${num}`);
        return new Intl.NumberFormat('en-US').format(_moneyAmount);
    }
}
