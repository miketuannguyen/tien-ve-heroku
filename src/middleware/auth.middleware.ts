import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserDTO } from 'src/dtos';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthenticatedRequest } from 'src/utils/types';
import { APIResponse, Helpers, MESSAGES } from '../utils';

/**
 * Validate if request is authenticated
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    /** Constructor */
    constructor(private readonly _authService: AuthService) {}

    /**
     * Validate if request is authenticated
     */
    async use(req: AuthenticatedRequest, res: Response, next: () => void) {
        const unauthorizedErrRes = APIResponse.error(MESSAGES.ERROR.ERR_UNAUTHORIZED);
        try {
            const { authorization: bearerAccessToken } = req.headers;

            if (!Helpers.isString(bearerAccessToken)) {
                return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
            }

            const secret = process.env.ACCESS_TOKEN_SECRET;
            if (!Helpers.isString(secret)) {
                const internalServerErrRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(internalServerErrRes);
            }

            const accessToken = bearerAccessToken.replace('Bearer ', '');
            const payload = jwt.verify(accessToken, secret);
            if (!UserDTO.is(payload)) {
                return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
            }

            const userDTO = await this._authService.findUserById(payload.id);
            if (!userDTO) {
                return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
            }

            req.userPayload = payload;

            next();
        } catch (e) {
            return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
        }
    }
}
