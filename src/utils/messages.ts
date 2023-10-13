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
        ERR_OTP_USED: 'err_otp_used',
        ERR_OTP_EXPIRED: 'err_otp_expired',
        ERR_OTP_NOT_VALID: 'err_otp_not_valid',
        ERR_CHECK_OTP: 'err_check_otp',
        ERR_EMAIL_EXISTS: 'err_email_exists',
        ERR_PHONE_EXISTS: 'err_phone_exists',
        ERR_NOT_BANK_SMS: 'err_not_bank_sms',
        ERR_SMS_AMOUNT_NOT_POSITIVE: 'err_sms_amount_not_positive',
        ERR_SEND_DEBT_ANNOUNCEMENT: 'err_send_debt_announcement',
        ERR_EMAIL_PHONE_EXISTS: 'err_email_phone_exists',
        ERR_PASSWORD_NOT_CORRECT: 'err_password_not_correct',
        ERR_OVER_MAX_REMIND_COUNT: 'err_over_max_remind_count',
        ERR_NO_DEBT_NOT_PAID: 'err_no_debt_not_paid',
    },
} as const;

Helpers.deepFreeze(MESSAGES);
export default MESSAGES;
