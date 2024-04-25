import { Test, TestingModule } from '@nestjs/testing';
import { SelectedFutureProcessController } from './selected-future-process.controller';
import { SelectedFutureProcessService } from './selected-future-process.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectedFutureProcessFilter } from '../../helpers/filters/selected-future-process.filter';
import { SelectedFutureProcessSorting } from '../../helpers/sortings/selected-future-process.sorting';
import { SelectedFutureProcess } from './entities/selected-future-process.entity';
import { SelectedFutureProcessSerializer } from '../../serializers/selected-future-process.serializer';
import {
  mockPagination,
  mockPaginationParams,
} from '../../../test/mock/pagination/pagination';
import {
  mockBodySyncProjectData,
  mockExpectedResponse,
  mockFindOneResponse,
  mockItem,
  mockPathInfo,
} from '../../../test/mock/seleceted-future-process/selected-future-process';
import { SelectedFutureProcessDetailSerializer } from '../../serializers/selected-future-process-detail.serializer';

describe('SelectedFutureProcessController', () => {
  let controller: SelectedFutureProcessController;
  let service: SelectedFutureProcessService;
  const mockSelectedFutureProcessRepository = () => ({
    findAll: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SelectedFutureProcessController],
      providers: [
        SelectedFutureProcessService,
        {
          provide: getRepositoryToken(SelectedFutureProcess), // Use getRepositoryToken
          useValue: mockSelectedFutureProcessRepository,
        },
      ],
    }).compile();

    controller = module.get<SelectedFutureProcessController>(
      SelectedFutureProcessController,
    );
    service = module.get<SelectedFutureProcessService>(
      SelectedFutureProcessService,
    );
  });

  describe('changeStatus', () => {
    it('should change the status of a selected future process', async () => {
      const mockChangeStatus = jest.spyOn(service, 'changeStatus');
      mockChangeStatus.mockImplementation((): any => '');

      const projectId = 'project123';
      const id = 'selectedProcess123';
      const status = 'newStatus';
      await controller.changeStatus(projectId, id, status);
      expect(mockChangeStatus).toHaveBeenCalledWith(id, status, projectId);
    });
  });

  describe('findAll', () => {
    it('should return serialized data with correct parameters', async () => {
      const mockFilter = jest.fn();
      const mockSorting = jest.fn();

      const mockProjectId = 'project123';

      jest.spyOn(service, 'filter').mockResolvedValue({
        items: [mockItem],
        pagination: mockPagination,
      });
      jest.spyOn(service, 'getPath').mockResolvedValue(mockPathInfo);

      const respondManyWithPathSpy = jest
        .spyOn(SelectedFutureProcessSerializer.prototype, 'respondManyWithPath')
        .mockReturnValue(mockExpectedResponse);
      const result = await controller.findAll(
        mockFilter as SelectedFutureProcessFilter,
        mockSorting as SelectedFutureProcessSorting,
        mockPaginationParams,
        mockProjectId,
      );

      expect(service.filter).toHaveBeenCalledWith(
        mockProjectId,
        mockFilter,
        mockSorting,
        mockPaginationParams,
      );
      expect(service.getPath).toHaveBeenCalledWith(mockProjectId, mockFilter);

      expect(respondManyWithPathSpy).toHaveBeenCalledWith(
        [mockItem],
        mockPathInfo,
        mockPagination,
      );
      expect(result).toEqual(mockExpectedResponse);
    });
  });

  describe('findOne', () => {
    it('should return serialized data for a specific item', async () => {
      const mockProjectId = 'project123';
      const mockItemId = 'selectedProcess123';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockItem);

      const respond = jest
        .spyOn(SelectedFutureProcessDetailSerializer.prototype, 'respond')
        .mockReturnValue(mockFindOneResponse);

      const result = await controller.findOne(mockProjectId, mockItemId);

      expect(service.findOne).toHaveBeenCalledWith(mockItemId, mockProjectId);

      expect(respond).toHaveBeenCalledWith(mockItem);
      expect(result).toEqual(mockFindOneResponse);
    });
  });

  describe('create', () => {
    it('should create and return a new item', async () => {
      const mockCreatedItem = {
        mockBodySyncProjectData,
      };

      jest
        .spyOn(service, 'create')
        .mockImplementationOnce((): any => mockCreatedItem);

      const result = await controller.create(mockBodySyncProjectData);

      expect(service.create).toHaveBeenCalledWith(mockBodySyncProjectData);
      expect(result).toEqual(mockCreatedItem);
    });
  });
});
