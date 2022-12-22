import { Injectable } from '@nestjs/common';
import { Consul } from 'consul';

declare function require(name: string);
const consul = require('consul');

@Injectable()
export class ServiceDiscovery {
  private readonly serviceDiscoveryClient: Consul = new consul();

  getNextUrlForService = async (serviceName: string) => {
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
