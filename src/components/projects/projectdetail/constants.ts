// Constants cho project detail components

export const STATUS_COLOR: Record<string, string> = {
  PLANNING: 'blue',
  IN_PROGRESS: 'green',
  COMPLETED: 'gold',
  CANCELLED: 'red',
};

export const TASK_STATUS_COLOR: Record<string, string> = {
  todo: 'default',
  'in-progress': 'processing',
  done: 'success',
};

export const TASK_STATUS_TEXT: Record<string, string> = {
  todo: 'Chưa làm',
  'in-progress': 'Đang làm',
  done: 'Hoàn thành',
};

