export class NotificationMessageDto {
  _id: string;
  header: object;
  payload: object;
  type: string;
  processed: boolean;
  createdAt: string;
  updatedAt: string;
}
