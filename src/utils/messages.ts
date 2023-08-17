import Helpers from './helpers';

/** Application messages */
const MESSAGES = {
    SUCCESS: {
        SUCCESS: 'success',
        /** Used when there is no action processed by the API */
        NO_ACTION: 'no_action',
    },
    ERROR: {
        /** "404 Not Found" error message */
        ERR_RESOURCE_NOT_FOUND: 'err_resource_not_found',
        /** "500 Internal Server Error" error message */
        ERR_INTERNAL_SERVER_ERROR: 'err_internal_server_error',
        ERR_NO_DATA: 'err_no_data',
        ERR_VALIDATION: 'err_validation',
        ERR_LOGIN: 'err_login',
        ERR_UNAUTHENTICATED: 'err_unauthenticated',
        ERR_UNAUTHORIZED: 'err_unauthorized',
        ERR_CREATE: 'err_create',
        ERR_NOT_FOUND: 'err_not_found',
        ERR_BAD_REQUEST: 'err_bad_request',
        ERR_INVALID_REQUEST_BODY: 'err_invalid_request_body',
        ERR_USERNAME_EXISTED: 'err_username_existed',
        ERR_USER_DEACTIVATED: 'err_user_deactivated',
    },
} as const;

Helpers.deepFreeze(MESSAGES);
export default MESSAGES;
