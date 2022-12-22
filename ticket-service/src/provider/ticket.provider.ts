import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { AddTicketDto, AssignTicketDto } from 'src/dto/ticket.dto';
import { Comment } from 'src/schema/comment.schema';
import { SprintDocument } from 'src/schema/sprint.schema';
import { TicketDocument } from 'src/schema/ticket.schema';
import { ServiceDiscovery } from 'src/serviceDiscovery/service.discovery.provider';
import { SprintService } from './sprint.provider';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { UserDto } from 'src/dto/user.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel('Sprint')
    private readonly sprintModel: Model<SprintDocument>,
    @InjectModel('Ticket')
    private readonly ticketModel: Model<TicketDocument>,
    private readonly sprintService: SprintService,
    private readonly serviceDiscovery: ServiceDiscovery,
    private readonly httpService: HttpService,
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

  async getTicketByUserId(userId: string, includeComments: boolean) {
    if (!userId) {
      throw new BadRequestException();
    }
    let query = this.ticketModel.find({ authorId: userId });
    if (includeComments) {
      query = query.populate('comments');
    }
    return await query.exec();
  }

  async assignTicketToUser(userTicketAssignment: AssignTicketDto) {
    if (!userTicketAssignment.ticketId || !userTicketAssignment.userId) {
      throw new BadRequestException();
    }
    let ticket: TicketDocument = undefined;
    try {
      ticket = await this.ticketModel
        .findById(userTicketAssignment.ticketId)
        .exec();
    } catch (e) {
      Logger.warn(e);
      throw new BadRequestException({ message: '' });
    }
    if (!ticket) {
      throw new NotFoundException({
        message: 'Ticket with specified Id not found',
      });
    }

    const url = await this.serviceDiscovery.getNextUrlForService(
      'AUTHENTICATION_SERVICE',
    );

    const fullPath = `${url}/api/user/${userTicketAssignment.userId}`;
    try {
      const result: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(fullPath),
      );
      const user: UserDto = result.data;
      ticket.assigneeId = user._id;
      return await ticket.save();
    } catch (e) {
      const response = e.response as AxiosResponse;
      Logger.warn(response.data.message);
      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException({
          message: 'Provided assign ticket input is not valid',
        });
      } else if (response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException({
          message: 'User not found exception',
        });
      } else {
        throw new InternalServerErrorException({
          message: response.data.message,
        });
      }
    }
  }
}
