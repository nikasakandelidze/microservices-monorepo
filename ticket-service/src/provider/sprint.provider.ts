import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddSprintDto } from 'src/dto/sprint.dto';
import { SprintDocument } from 'src/schema/sprint.schema';
import { Ticket } from 'src/schema/ticket.schema';
import { ProjectService } from './project.provider';

@Injectable()
export class SprintService {
  constructor(
    @InjectModel('Sprint') private readonly sprintModel: Model<SprintDocument>,
    private readonly projectService: ProjectService,
  ) {}
  async addSprint(sprint: AddSprintDto) {
    if (
      !sprint.authorId ||
      !sprint.description ||
      !sprint.title ||
      !sprint.projectId
    ) {
      throw new BadRequestException({
        message: 'all mandatory fields for adding new sprint must be present',
      });
    }
    const project = await this.projectService.getProjectById(sprint.projectId);
    if (!project) {
      throw new BadRequestException({
        message: `Project with specified id: ${sprint.projectId} is not present`,
      });
    }
    sprint['project'] = project;
    const newSprint: SprintDocument = new this.sprintModel(sprint);
    const resultSprint = await newSprint.save();
    await this.projectService.addSprintToProject(
      sprint.projectId,
      resultSprint,
    );
    return resultSprint;
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
