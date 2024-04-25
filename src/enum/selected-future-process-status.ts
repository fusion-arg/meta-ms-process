export enum SelectedFutureProcessStatus {
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

export const FutureProcessStatusList: StatusResponse[] = [
  { id: 1, name: SelectedFutureProcessStatus.NotStarted },
  { id: 2, name: SelectedFutureProcessStatus.InProcess },
  { id: 3, name: SelectedFutureProcessStatus.RouteForReview },
  { id: 4, name: SelectedFutureProcessStatus.Returned },
  { id: 5, name: SelectedFutureProcessStatus.Approved },
];

export function getFutureProcessStatusById(id: string): string | undefined {
  const statusItem = FutureProcessStatusList.find(
    (status) => status.id === parseInt(id),
  );
  return statusItem?.name;
}
