import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

@Injectable()
export class ApiOrganizationService {
  private readonly baseUrl = this.config.get('META_ORGANIZATION_URL');
  private readonly clientId = this.config.get('OAUTH_CLIENT_ID');
  private readonly clientSecret = this.config.get('OAUTH_CLIENT_SECRET');

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

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
            Logger.error(e, 'Error GET api-organization');
            throw new HttpException('Api error', HttpStatus.BAD_REQUEST);
          }),
        ),
    );
  }

  async getAllDepartmentsByProject(
    token: string,
    projectId: string,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    return this.get<any>(
      `${this.baseUrl}/projects/${projectId}/departments/list-all`,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[GET-DEPARTMENTS-OK]');
        return response.data.data;
      }
      Logger.debug(JSON.stringify(response.data), '[GET-DEPARTMENTS-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  async getAllMappersByProject(projectId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        'client-id': this.clientId,
        'client-secret': this.clientSecret,
      },
    };
    return this.get<any>(
      `${this.baseUrl}/internal-apis/projects/${projectId}/mappers-for-process-capturing`,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[GET-MAPPERS-OK]');
        return response.data;
      }
      Logger.debug(JSON.stringify(response.data), '[GET-MAPPERS-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }

  async getDepartments(
    ids: Array<string>,
    projectId: string,
    token: string,
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {
        authorization: `Bearer ${token}`,
      },
      params: {
        departmentIds: ids,
      },
    };

    return this.get<any>(
      `${this.baseUrl}/projects/${projectId}/departments/list-by-ids`,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[SYNC-DEPARTMENTS-OK]');
        return response.data;
      }
      Logger.debug(JSON.stringify(response.data), '[SYNC-DEPARTMENTS-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
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

  async getSprint(sprintId: string): Promise<any> {
    const config: AxiosRequestConfig = {
      headers: {},
    };

    return this.get<object>(
      `${this.baseUrl}/public/sprints/${sprintId}`,
      config,
    )
      .then((response) => {
        if (response.status === 200) {
          Logger.debug(JSON.stringify(response.data), '[SYNC-SPRINT-OK]');
          return response.data;
        }
        Logger.debug(JSON.stringify(response.data), '[SYNC-SPRINT-ERROR]');
        throw new HttpException(
          'Api error: Invalid status code',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((error) => {
        const message = error.response?.data?.message || error.message;
        const statusCode =
          error.response?.data?.statusCode || HttpStatus.BAD_REQUEST;
        Logger.error(error, 'Error getSprint');
        throw new HttpException(message, statusCode);
      });
  }
}
