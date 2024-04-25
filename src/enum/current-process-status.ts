export enum CurrentProcessStatus {
  NotStarted = 'not started',
  InProcess = 'in process',
  RouteForReview = 'route for review',
  Returned = 'returned',
  Approved = 'approved',
}
export interface StatusResponse {
  id: number;
  name: string;
}

export const CurrentProcessStatusList: StatusResponse[] = [
  { id: 1, name: CurrentProcessStatus.NotStarted },
  { id: 2, name: CurrentProcessStatus.InProcess },
  { id: 3, name: CurrentProcessStatus.RouteForReview },
  { id: 4, name: CurrentProcessStatus.Returned },
  { id: 5, name: CurrentProcessStatus.Approved },
];

export function getCurrentProcessStatusById(id: string): string | undefined {
  const statusItem = CurrentProcessStatusList.find(
    (status) => status.id === parseInt(id),
  );
  return statusItem?.name;
}
