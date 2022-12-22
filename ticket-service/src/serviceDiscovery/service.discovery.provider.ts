import { Injectable, Logger } from '@nestjs/common';
import { Consul } from 'consul';
import { v4 as uuidv4 } from 'uuid';

// This was needed for consul library specifically since it wasn't working with "import" statement
declare function require(name: string);
const consul = require('consul');

@Injectable()
export class ServiceDiscovery {
  private readonly serviceDiscoveryClient: Consul = new consul();

  public async registerServiceForDiscovery(
    serviceName: string,
    port: number,
    address: string,
  ) {
    const serviceId = uuidv4();
    const register = async () => {
      await this.serviceDiscoveryClient.agent.service.register({
        id: serviceId,
        name: serviceName,
        port: port,
        address: address,
      });
      Logger.log('Service registered in Consul service discovery');
    };

    const unregister = async () => {
      await this.serviceDiscoveryClient.agent.service.deregister(serviceId);
      Logger.log('Service deregistered in Consul service discovery');
    };

    process.on('exit', unregister);

    process.on('uncaughtException', unregister);

    process.on('SIGINT', unregister);

    await register();
  }

  public getNextUrlForService = async (serviceName: string) => {
    const servicesList: Array<any> =
      await this.serviceDiscoveryClient.agent.service.list();
    const servers = Object.values(servicesList).filter(
      (service: any) => service.Service === serviceName,
    );
    // change this logic below with some stateful decision making
    const server = servers[0];
    const url = `${server.Address}:${server.Port}`;
    return url;
  };
}
