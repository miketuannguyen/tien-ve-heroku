import AppLogger from 'src/logger/logger';

export default class BaseController {
    protected readonly _logger = new AppLogger(this.constructor.name);
}
