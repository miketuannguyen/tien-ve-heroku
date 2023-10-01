import { Helpers } from 'src/utils';

const ROUTES = {
    AUTH: {
        MODULE: 'auth',
        REGISTER: 'register',
        LOGIN: 'login',
        SAVE_ACCOUNT: 'save-account',
        CHANGE_PASSWORD: 'change-password',
        VALIDATE_FORGOT_PASSWORD_OTP: 'validate-forgot-password-otp',
        RENEW_PASSWORD: 'renew-password',
    },
    MESSAGE: {
        MODULE: 'message',
        CREATE: '',
        LIST: '',
        UPDATE_DEBT_ID: ':id/update-debt-id',
    },
    USER: {
        MODULE: 'user',
        PROFILE: 'profile',
        GET_BY_EMAIL_PHONE: 'by-email-phone/:email_phone',
    },
    OTP: {
        MODULE: 'otp',
        CREATE: '',
    },
    BANK: {
        MODULE: 'bank',
        LIST: '',
    },
    BANK_ACCOUNT: {
        MODULE: 'bank-account',
        LIST: '',
        DETAIL: ':id',
        CREATE: '',
        UPDATE: ':id',
        DELETE_MULTIPLE: '',
        DELETE: ':id',
    },
    DEBT: {
        MODULE: 'debt',
        LIST: '',
        DETAIL: ':id',
        CREATE_MULTIPLE: 'multiple',
        DELETE: ':id',
    },
} as const;
Helpers.deepFreeze(ROUTES);

export default ROUTES;
