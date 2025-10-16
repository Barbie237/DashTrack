export interface Activity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: string;
  page: string;
  duration?: number;
}
