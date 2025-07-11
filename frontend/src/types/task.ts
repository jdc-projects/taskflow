export interface Task {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
  deleted: boolean;
  deletedAt?: number;
}