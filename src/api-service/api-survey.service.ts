import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestPresentationDto } from 'src/api-service/dto/surveys-for-reques-presentation.dto';

@Injectable()
export class ApiSurveyService {
  private readonly baseUrl = this.config.get('META_SURVEY_URL');
  private readonly clientId = this.config.get('OAUTH_CLIENT_ID');
  private readonly clientSecret = this.config.get('OAUTH_CLIENT_SECRET');

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async post<T>(
    method: string,
    dto: T,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<any, any>> {
    return await lastValueFrom(
      this.httpService
        .post(method, dto, config)
        .pipe(map((response) => response)),
    );
  }

  async sendSurveyForRequestPresentation(
    projectId: string,
    payload: RequestPresentationDto[],
  ) {
    const config: AxiosRequestConfig = {
      headers: {
        'client-id': this.clientId,
        'client-secret': this.clientSecret,
      },
    };
    const data = { requestPresentation: payload };
    return this.post<object>(
      `${this.baseUrl}/internal-apis/projects/${projectId}/surveys-for-request-presentation`,
      data,
      config,
    ).then((response) => {
      if (response.status === 200) {
        Logger.debug(JSON.stringify(response.data), '[SYNC-SURVEY-OK]');
        return response.data.data;
      }
      Logger.debug(JSON.stringify(response.data), '[SYNC-SURVEY-ERROR]');
      throw new HttpException(
        'Api error: Invalid status code',
        HttpStatus.BAD_REQUEST,
      );
    });
  }
}
