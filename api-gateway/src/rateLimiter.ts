import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import moment from 'moment';

export type RateLimitInput = {
  id: string;
};

export type RateLimitOutput = {
  throttled: boolean;
  metadata: string;
};

export type RedisClientType = ReturnType<typeof createClient>;

const REQUESTS_LIMIT = 5;
const TIME_PERIOD_SECONDS = 10;
const TIME_PERIOD_MILLIS = TIME_PERIOD_SECONDS * 1000;

@Injectable()
export class RateLimiter {
  private readonly redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient();
  }

  public async throttleRequest(
    input: RateLimitInput,
  ): Promise<RateLimitOutput> {
    const userId = input.id;
    const now = moment().valueOf();
    const transactionResult = await this.redisClient
      .multi()
      .zRemRangeByScore(userId, 0, now - TIME_PERIOD_MILLIS - 1)
      .zAdd(userId, { score: now, value: now.toString() })
      .zRange(userId, 0, -1)
      .expire(userId, TIME_PERIOD_SECONDS)
      .exec();
    if (transactionResult) {
      const numOfLogs: number = transactionResult[2] as number;
      const throttled = numOfLogs > REQUESTS_LIMIT;
      return {
        throttled,
        metadata:
          'Rate limit exceeded, please wait some time before sending any more requests.',
      };
    } else {
      return { throttled: false, metadata: 'Nothing to say' };
    }
  }
}
