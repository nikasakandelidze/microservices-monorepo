import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddSprintDto } from 'src/dto/sprint.dto';
import { SprintDocument } from 'src/schema/sprint.schema';
import { Ticket } from 'src/schema/ticket.schema';

@Injectable()
export class SprintService {
  constructor(
    @InjectModel('Sprint') private readonly sprintModel: Model<SprintDocument>,
  ) {}
  async addSprint(sprint: AddSprintDto) {
    if (!sprint.authorId || !sprint.description || !sprint.title) {
      throw new BadRequestException();
    }
    const newSprint = new this.sprintModel(sprint);
    return await newSprint.save();
  }

  async addTicketToSprint(ticket: Ticket, sprintId: string) {
    const sprint = await this.sprintModel.findById(sprintId).exec();
    if (!sprint) {
      throw new BadRequestException();
    }
    sprint.tickets.push(ticket);
    return await sprint.save();
  }

  async getAllSprints() {
    return await this.sprintModel.find().exec();
  }

  async getSprintById(sprintId: string) {
    return await this.sprintModel
      .findById(sprintId)
      .populate({
        path: 'tickets',
        populate: {
          path: 'comments',
          model: 'Comment',
        },
      })
      .exec();
  }
}
