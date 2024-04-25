import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { FutureProcessData } from '../data/api-project/future-process.data';

@Injectable()
export class ApiProjectService {
  private readonly baseUrl = this.config.get('META_PROJECT_URL');
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async put<T>(
    method: string,
    dto: T,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService
        .put(method, dto, config)
        .pipe(map((response) => response))
        .pipe(
          catchError((e) => {
            Logger.error(e, 'Error PUT api-project');
            throw new HttpException('Api error', HttpStatus.BAD_REQUEST);
          }),
        ),
    );
  }

  async get<T>(
    method: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService
        .get<T>(method, config)
        .pipe(map((response) => response))
        .pipe(
          catchError((e) => {
            Logger.error(e, 'Error GET api-project');
            throw new HttpException('Api error', HttpStatus.BAD_REQUEST);
          }),
        ),
    );
  }

  async unSelectedFutureProcess(
    projectId: string,
    data: FutureProcessData,
    token: string,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.put<FutureProcessData>(
      `${this.baseUrl}/project-future-processes/${projectId}`,
      data,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[SYNC-PROJECT-OK]');
        return response.data;
      }
      Logger.debug(JSON.stringify(response.data), '[SYNC-PROJECT-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  async getAllSpcs(token: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.get<FutureProcessData>(`${this.baseUrl}/spcs`, config).then(
      (response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-SPCS-OK]');
          return response.data;
        }
        Logger.debug(JSON.stringify(response.data), '[SYNC-SPCS-ERROR]');
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      },
    );
  }

  async userBelongsToProject(token: string, projectId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.get<any>(`${this.baseUrl}/projects/${projectId}`, config).then(
      (response) => {
        if (response.status === 200) {
          Logger.debug(
            JSON.stringify(response.data),
            '[userBelongsToProject-OK]',
          );
          return response.data;
        }
        Logger.debug(
          JSON.stringify(response.data),
          '[userBelongsToProject-ERROR]',
        );
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      },
    );
  }
}
