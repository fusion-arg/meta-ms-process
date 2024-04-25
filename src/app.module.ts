import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CommandModule } from './commands/command.module';
import { TypeOrmModule } from './modules/typeorm/typeorm.module';
import { HttpModule } from '@nestjs/axios';
import { SelectedFutureProcessModule } from './modules/selected-future-process/selected-future-process.module';
import { ReviewStatusModule } from './modules/review-status/review-status.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { PresentationModule } from './modules/presentation/presentation.module';
import { CurrentProcessStateModule } from './modules/current-process-state/current-process-state.module';
import { ProjectAclMiddleware } from './middlewares/project-acl.middleware';
import { ProcessMappingModule } from './modules/process-mapping/process-mapping.module';
import { ApiServiceModule } from './api-service/api-service.module';
import { ProcessStepModule } from './modules/process-step/process-step.module';
import { InternalApiModule } from './modules/internal-api/internal-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule,
    CommandModule,
    HttpModule,
    SelectedFutureProcessModule,
    ReviewStatusModule,
    FileStorageModule,
    PresentationModule,
    CurrentProcessStateModule,
    ProcessStepModule,
    ProcessMappingModule,
    InternalApiModule,
    ApiServiceModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        always: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProjectAclMiddleware).forRoutes('projects/:projectId*');
  }
}
