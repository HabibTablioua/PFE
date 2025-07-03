export interface Incident {
  id: number;
  title: string;
  dateTime: string;
  description: string;
  status?: string;
  username?: string;
  userId?: number;
} 