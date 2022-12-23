import {
  Injectable,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { AddProjectDto } from 'src/dto/project.dto';
import { UserDto } from 'src/dto/user.dto';
import { ProjectDocument } from 'src/schema/project.schema';
import { AxiosResponse } from 'axios';
import { ServiceDiscovery } from 'src/provider/service.discovery.provider';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Sprint } from 'src/schema/sprint.schema';
import { OutboxMessageDocument } from 'src/schema/outbox.message.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project')
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel('OutboxMessage')
    private readonly outboxMessageModel: Model<OutboxMessageDocument>,
    private readonly serviceDiscovery: ServiceDiscovery,
    private readonly httpService: HttpService,
  ) {}

  async addNewProject(addProject: AddProjectDto) {
    if (!addProject.title || !addProject.description || !addProject.authorId) {
      throw new BadRequestException();
    }
    if (!addProject.memberIds) {
      addProject.memberIds = [];
    }
    let users = [];
    try {
      const acumulateduserIds = [addProject.authorId, ...addProject.memberIds];
      users = await this.getUserInformationForIds(acumulateduserIds);
      if (users.length !== acumulateduserIds.length) {
        Logger.warn(
          `Fetched user information: ${users} -s length doesn't match input id-s length: ${acumulateduserIds}`,
        );
        throw new ServiceUnavailableException({
          message:
            'Problem with getting information of users, please try again later',
        });
      }
    } catch (e) {
      Logger.warn(e);
      const response = e.response as AxiosResponse;
      Logger.warn(response.data.message);
      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException({
          message:
            'memberIds and authorId must all be correct to add new project',
        });
      } else {
        throw new InternalServerErrorException({
          message: 'Please try again later',
        });
      }
    }
    if (users.length > 0) {
      const { passwordHash, ...rest } = users.shift();
      const newProject = new this.projectModel({
        title: addProject.title,
        description: addProject.description,
        author: rest,
        members: users.map(({ passwordHash, ...others }) => others),
      });
      const result = await newProject.save();
      const outboxMessage = new this.outboxMessageModel({
        header: {
          title: 'PROJECT_ADDED',
          description: 'New project was added',
        },
        payload: { project: result },
        type: 'PROJECT_ADDED',
      });
      await outboxMessage.save();
      return result;
    }
  }

  async addSprintToProject(projectId: string, sprint: Sprint) {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new BadRequestException({
        message: "Couldn't find project with specified id",
      });
    }
    project.sprints.push(sprint);
    return await project.save();
  }

  async getProjectById(projectId: string): Promise<ProjectDocument> {
    return this.projectModel.findById(projectId).exec();
  }

  async getAllProjects(): Promise<Array<ProjectDocument>> {
    return await this.projectModel.find().exec();
  }

  private async getUserInformationForIds(
    userIds: Array<string>,
  ): Promise<Array<UserDto>> {
    const url = await this.serviceDiscovery.getNextUrlForService(
      'AUTHENTICATION_SERVICE',
    );
    const fullPath = `${url}/api/user/users/batch`;
    const result: AxiosResponse<any> = await firstValueFrom(
      this.httpService.get(fullPath, { params: { userIds: userIds } }),
    );
    const users: Array<UserDto> = result.data;
    return users;
  }
}
