import { Request, Response, NextFunction } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpStatus } from '@nestjs/common';

export function authMiddleware(
  httpService: HttpService,
  configService: ConfigService,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/internal-apis')) {
      return next();
    }

    if (req.url.startsWith('/api-docs')) {
      return next();
    }
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        error: {
          code: 'HTTP_UNAUTHENTICATED',
          message: 'Credentials are not valid',
        },
      });
    }

    const url = `${configService.get('META_AUTH_URL')}/auth/me`;

    try {
      const authResponse = await lastValueFrom(
        httpService.get(url, {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const response = authResponse.data.data.data;
      const permissionNames = response.permissions.map(
        (permission) => permission.name,
      );

      req['user'] = {
        permissions: permissionNames,
        id: response.id,
        isAdmin: response.isAdmin,
        email: response.email,
      };
      next();
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        success: false,
        error: {
          code: 'HTTP_UNAUTHENTICATED',
          message: 'Credentials are not valid',
        },
      });
    }
  };
}
