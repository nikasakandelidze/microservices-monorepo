import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddTicketDto } from 'src/dto/ticket.dto';
import { Comment } from 'src/schema/comment.schema';
import { SprintDocument } from 'src/schema/sprint.schema';
import { TicketDocument } from 'src/schema/ticket.schema';
import { SprintService } from './sprint.provider';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel('Sprint')
    private readonly sprintModel: Model<SprintDocument>,
    @InjectModel('Ticket')
    private readonly ticketModel: Model<TicketDocument>,
    private readonly sprintService: SprintService,
  ) {}

  async addTicket(ticket: AddTicketDto) {
    if (!ticket.authorId || !ticket.content || !ticket.sprintId) {
      throw new BadRequestException();
    }
    const sprint = await this.sprintModel.findById(ticket.sprintId).exec();
    if (!sprint) {
      throw new BadRequestException();
    }
    ticket['sprint'] = sprint;
    const newTicket = new this.ticketModel(ticket);
    const resultTicket = await newTicket.save();
    this.sprintService.addTicketToSprint(resultTicket, ticket.sprintId);
    return resultTicket;
  }

  async addCommentToTicket(comment: Comment, ticketId: string) {
    const ticket = await this.ticketModel.findById(ticketId).exec();
    if (!ticket) {
      throw new BadRequestException();
    }
    ticket.comments.push(comment);
    return await ticket.save();
  }

  async getTicketById(ticketId: string) {
    if (!ticketId) {
      throw new BadRequestException();
    }
    return await this.ticketModel
      .findById(ticketId)
      .populate('comments')
      .exec();
  }
}
