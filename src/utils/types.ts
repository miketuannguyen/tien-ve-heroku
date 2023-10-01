import { Request } from 'express';
import { UserDTO } from 'src/dtos';

/**
 * Use values of a object as a union type
 * @example
 * ```
 * const TAB_IDS = { AXIS_TAB: 1, EXTRACT_TAB: 2, DISPLAY_ITEM_TAB: 3, EXECUTE_TAB: 4 } as const;
 * // curTabId: 1 | 2 | 3 | 4
 * const curTabId: ValueOf<typeof this.VALUES.TAB_IDS> = 1;
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Authenticated request has user data and JWT payload
 */
export type AuthenticatedRequest<
    P = {
        [key: string]: string;
    },
    ResBody = any,
    ReqBody = any,
    ReqQuery = qs.ParsedQs,
    Locals extends Record<string, any> = Record<string, any>,
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & {
    /** User data and JWT payload */
    userPayload: UserDTO & {
        iat?: number;
        exp?: number;
    };
};

export type CommonSearchQuery = {
    /** Search keyword */
    keyword?: string;
    /** Page number, start with `1`, set `0` to get all */
    page?: number;
};

export type IdListObject<T extends string | number> = {
    id_list: T[];
};
