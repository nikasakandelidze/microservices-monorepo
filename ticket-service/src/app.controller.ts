import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AddSprintDto } from './dto/sprint.dto';
import {
  AddTicketDto,
  AssignTicketDto,
  TicketStatusUpdateDto,
} from './dto/ticket.dto';
import { SprintService } from './provider/sprint.provider';
import { TicketService } from './provider/ticket.provider';
import { AddCommentDto } from './dto/comment.dto';
import { CommentService } from './provider/comment.provider';
import { AddProjectDto } from './dto/project.dto';
import { ProjectService } from './provider/project.provider';

@Controller('api')
export class AppController {
  constructor(
    private readonly sprintService: SprintService,
    private readonly ticketService: TicketService,
    private readonly commentService: CommentService,
    private readonly projectService: ProjectService,
  ) {}

  @Post('sprint')
  async addNewSprint(@Body() sprint: AddSprintDto) {
    return await this.sprintService.addSprint(sprint);
  }

  @Get('sprint')
  async getAllSprints() {
    return await this.sprintService.getAllSprints();
  }

  @Get('sprint/:id')
  async getSprintById(@Param('id') sprintId: string) {
    return await this.sprintService.getSprintById(sprintId);
  }
  @Post('ticket')
  async addNewTicket(@Body() sprint: AddTicketDto) {
    return await this.ticketService.addTicket(sprint);
  }

  @Get('ticket/:id')
  async getTicketById(@Param('id') ticketId: string) {
    return await this.ticketService.getTicketById(ticketId);
  }

  @Post('comment')
  async addNewComment(@Body() comment: AddCommentDto) {
    return await this.commentService.addComment(comment);
  }

  @Get('comment/:id')
  async getCommentById(@Param('id') commentId: string) {
    return await this.commentService.getCommentById(commentId);
  }

  @Get('ticket/user/:userId')
  async getTicketsForSpecificUser(
    @Param('userId') userId: string,
    @Query('includeComments') includeComments?: boolean,
  ) {
    return await this.ticketService.getTicketByUserId(userId, includeComments);
  }

  @Post('ticket/assign')
  async assignTicketToUser(@Body() ticketAssignment: AssignTicketDto) {
    return await this.ticketService.assignTicketToUser(ticketAssignment);
  }

  @Post('ticket/status')
  async assignNewStatusToTicket(
    @Body() ticketStatusUpdate: TicketStatusUpdateDto,
  ) {
    return await this.ticketService.updateStatusOfTicket(ticketStatusUpdate);
  }

  @Post('project')
  async addNewProject(@Body() addProject: AddProjectDto) {
    return await this.projectService.addNewProject(addProject);
  }

  @Get('project')
  async getAllProjects() {
    return await this.projectService.getAllProjects();
  }
}
