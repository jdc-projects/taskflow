export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number;
  deleted: boolean;
  deletedAt?: number;
}