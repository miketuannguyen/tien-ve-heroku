import { Helpers } from 'src/utils';

const ROUTES = {
    AUTH: {
        MODULE: 'auth',
        LOGIN: 'login',
    },
    MESSAGE: {
        MODULE: 'message',
        CREATE: '',
    },
} as const;
Helpers.deepFreeze(ROUTES);

export default ROUTES;
