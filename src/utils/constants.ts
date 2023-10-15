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
        UPGRADE_NOTE: 'debt_remind_message_template',
        REMIND_MESSAGE_TEMPLATE: 'remind_message_template',
        APP_LINK: 'app_link',
    },
    OTP: {
        LENGTH: 6,
        EXPIRED_SECONDS: 600,
    },
    REGISTER_TYPES: {
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
    ESMS_URL: {
        // ! move to .env
        OTP_SMS: 'http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/',
    },
    BANK_ACCOUNT_STATUSES: {
        /** Ngừng kích hoạt */
        DEACTIVATED: -1,
        /** Chưa kích hoạt */
        NOT_ACTIVATED: 0,
        /** Đã kích hoạt */
        ACTIVATED: 1,
    },
    REMIND_MESSAGE: {
        CHANNEL_TYPE: {
            ZALO: 1,
            SMS: 2,
        },
        STATUS: {
            FAIL: -1,
            SENDING: 0,
            SUCCESS: 1,
        },
    },
    MESSAGE_TEMPLATE_ALIASES: {
        RECEIVER_NAME: 'receiver_name',
        AMOUNT: 'amount',
    },
} as const;
Helpers.deepFreeze(CONSTANTS);

export default CONSTANTS;
