import AppLogger from 'src/logger/logger';

export default class BaseService {
    protected readonly _logger = new AppLogger(this.constructor.name);
}
