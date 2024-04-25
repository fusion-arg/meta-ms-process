import { SelectedFutureProcessData } from '../../../src/data/selected-future-process.data';
import { mockPagination } from '../pagination/pagination';

export const mockItem = {
  id: '22b70727-24f7-44a2-8e3b-9425fddbf587',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
  futureProcessId: '55b7c1ae-2bd4-4495-b9c6-d8d6ee7957aa',
  code: '123',
  spcName: 'Onboarding',
  futureProcessName: 'Onboarding',
  visibleCode: '0100.0123',
  status: 'in process',
  parent: {
    id: '7925cd44-3f80-45e0-9cb1-0515604fc3a0',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    futureProcessId: 'ac8a778d-4077-4a58-8583-ac33ed40546f',
    code: '100',
    spcName: 'HCM',
    futureProcessName: 'HCM',
    visibleCode: '0100',
  },
  children: [],
};

export const mockPathInfo = [
  {
    code: '0100',
    name: 'HCM',
  },
];

export const mockExpectedResponse = {
  data: [
    {
      id: '22b70727-24f7-44a2-8e3b-9425fddbf587',
      futureProcessName: 'Onboarding',
      code: '123',
      spcName: 'Onboarding',
      mappedTo: null,
      branchCode: '0100.0123',
      hasChildren: false,
      status: 'in process',
    },
  ],
  path: mockPathInfo,
  meta: mockPagination,
};

export const mockFindOneResponse = {
  data: {
    futureProcessName: 'Onboarding',
    processId: '0100.0123',
    spc: 'Onboarding',
    parentProcessName: 'HCM (0100)',
    subProcess: [],
    status: 'in process',
    createdAt: '2024-01-12T23:12:40.008Z',
    updateAt: '2024-01-18T18:50:02.000Z',
  },
};

export const mockBodySyncProjectData: SelectedFutureProcessData[] = [
  {
    futureProcessId: '71bb61a3-7ee4-4be5-a3a3-7e7b0754a877',
    code: '200',
    visibleCode: '0200',
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    spcName: 'Finance',
    futureProcessName: 'Finance',
    parent: null,
    isSelected: false,
  },
  {
    futureProcessId: 'ac8a778d-4077-4a58-8583-ac33ed40546f',
    code: '100',
    visibleCode: '0100',
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    spcName: 'HCM',
    futureProcessName: 'HCM',
    parent: null,
    isSelected: true,
  },
  {
    futureProcessId: '87e8229f-f6fc-4056-b7a3-db802fbfa3fb',
    code: '101',
    visibleCode: '0100.0101',
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    spcName: 'Recruiting',
    futureProcessName: 'Recruiting',
    parent: 'ac8a778d-4077-4a58-8583-ac33ed40546f',
    isSelected: true,
  },
  {
    futureProcessId: '2411a82f-fbb6-4b0a-8b1a-13963c6537d2',
    code: '102',
    visibleCode: '0100.0101.0102',
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    spcName: 'Plan Recruiting',
    futureProcessName: 'Plan Recruiting',
    parent: '87e8229f-f6fc-4056-b7a3-db802fbfa3fb',
    isSelected: true,
  },
  {
    futureProcessId: '55b7c1ae-2bd4-4495-b9c6-d8d6ee7957aa',
    code: '123',
    visibleCode: '0100.0123',
    projectId: '743742b2-4bda-4eaf-b63a-5f8b7e317bb8',
    spcName: 'Onboarding',
    futureProcessName: 'Onboarding',
    parent: 'ac8a778d-4077-4a58-8583-ac33ed40546f',
    isSelected: true,
  },
];
