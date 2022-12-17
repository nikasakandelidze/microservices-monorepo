import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

declare function require(name: string);

const consul = require('consul');

const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.NAME || 'AUTHENTICATION_SERVICE';

const registerForServiceDiscovery = async () => {
  const serviceId = uuidv4();
  const serviceDiscoveryClient = new consul();
  const register = async () => {
    await serviceDiscoveryClient.agent.service.register({ id: serviceId, name: SERVICE_NAME });
    Logger.log('Service registered in Consul service discovery');
  };

  const unregister = async () => {
    await serviceDiscoveryClient.agent.service.deregister(serviceId);
    Logger.log('Service deregistered in Consul service discovery');
  };

  process.on('exit', unregister);

  process.on('uncaughtException', unregister);

  process.on('SIGINT', unregister);

  await register();
};

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  await app.listen(PORT);
  await registerForServiceDiscovery();
}

bootstrap();
