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

        let currentMonth = start;

        while (currentMonth.isBefore(end, unit) || currentMonth.isSame(end, unit)) {
            dateList.push(currentMonth.format('MM/YYYY'));
            currentMonth = currentMonth.add(1, unit);
        }

        return dateList;
    }
}
