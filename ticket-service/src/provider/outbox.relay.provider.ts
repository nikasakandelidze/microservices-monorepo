import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import { OutboxMessageDocument } from 'src/schema/outbox.message.schema';

@Injectable()
export class OutboxRelayService {
  constructor(
    @InjectModel('OutboxMessage')
    private readonly outboxMessageModel: Model<OutboxMessageDocument>,
    @InjectQueue('notification-queue')
    private readonly outboxQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleOutboxMessages() {
    const messages = await this.outboxMessageModel
      .find({ processed: false })
      .exec();
    Logger.log(`Outbox relay sending new job(s). total of: ${messages.length}`);
    const deletionResult = Promise.all(
      messages.map(async (message: OutboxMessageDocument) => {
        const job = await this.outboxQueue.add(message);
        if (job) {
          await this.outboxMessageModel
            .updateOne({ _id: message._id }, { $set: { processed: true } })
            .exec();
        }
      }),
    );
    await deletionResult;
  }
}
