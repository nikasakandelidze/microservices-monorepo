export class AddTicketDto {
  content: string;
  authorId: string;
  sprintId: string;
}

export class AssignTicketDto {
  ticketId: string;
  userId: string;
}
