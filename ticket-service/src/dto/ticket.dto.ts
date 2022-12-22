import { TicketStatus } from 'src/common/common.types';

export class AddTicketDto {
  content: string;
  authorId: string;
  sprintId: string;
}

export class AssignTicketDto {
  ticketId: string;
  userId: string;
}

export class TicketStatusUpdateDto {
  ticketId: string;
  status: TicketStatus;
}
