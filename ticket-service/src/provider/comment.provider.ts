import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddCommentDto } from 'src/dto/comment.dto';
import { CommentDocument } from 'src/schema/comment.schema';
import { Ticket, TicketDocument } from 'src/schema/ticket.schema';
import { TicketService } from './ticket.provider';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel('Ticket')
    private readonly ticketModel: Model<TicketDocument>,
    private readonly ticketService: TicketService,
  ) {}

  async addComment(comment: AddCommentDto) {
    if (!comment.authorId || !comment.content || !comment.ticketId) {
      throw new BadRequestException();
    }
    const ticket: Ticket = await this.ticketModel
      .findById(comment.ticketId)
      .exec();
    if (!ticket) {
      throw new BadRequestException();
    }
    comment['ticket'] = ticket;
    const newComment = new this.commentModel(comment);
    const resultComment = await newComment.save();
    return await this.ticketService.addCommentToTicket(
      resultComment,
      comment.ticketId,
    );
  }

  async getCommentById(id: string) {
    return await this.commentModel.findById(id).exec();
  }
}
