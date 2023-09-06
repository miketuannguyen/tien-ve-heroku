import Helpers from './helpers';

/** Application constants */
const CONSTANTS = {
    APP_LOG_FOLDER_NAME: 'logs',
    ENVIRONMENTS: {
        DEV: 'DEV',
        STAG: 'STAG',
        PROD: 'PROD',
    },
    /** Total items per page  */
    PAGE_SIZE: 20,
    USER_ROLES: {
        REGULAR: 0,
        ADMIN: 1,
    },
    MYSQL_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    FRONTEND_DIR: 'frontend',
    SETTING_FIELD_NAMES: {
        INVOICE_ADDRESS: 'invoice_address',
        INVOICE_PHONE: 'invoice_phone',
    },
    OTP: {
        LENGTH: 6,
        EXPIRED_SECONDS: 300,
    },
    LOGIN_TYPES: {
        EMAIL: 1,
        PHONE: 2,
    },
    HTTP_REQUEST_TIMEOUT: 10000,
    SMS_SUCCESS_CODE: '100',
    DEBT_ID_FORMAT: {
        PREFIX: 'TV',
        SEPARATOR: '-',
        DATE_FORMAT: 'DDMMYY',
        USER_ID_LENGTH: 5,
        AUTO_INCREMENT_LENGTH: 5,
        LENGTH: 21,
    },
    VN_PHONE_CODE: '84+84',
} as const;
Helpers.deepFreeze(CONSTANTS);

export default CONSTANTS;
