import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ServiceDiscovery } from './provider/service.discovery.provider';

const PORT = 4004;
const SERVICE_NAME = process.env.NAME || 'TICKET_SERVICE';
const ADDRESS = process.env.ADDRESS || 'http://127.0.0.1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  await app
    .get(ServiceDiscovery)
    .registerServiceForDiscovery(SERVICE_NAME, PORT, ADDRESS);
}
bootstrap();
