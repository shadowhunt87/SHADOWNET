import { Injectable } from '@nestjs/common';

@Injectable()
export class IpGenerator {
  /**
   * Genera una IP aleatoria en un rango específico
   * Formato: "random:192.168.1.10-192.168.1.50"
   */
  generateFromRange(rangeString: string): string {
    const match = rangeString.match(/random:(\d+\.\d+\.\d+\.\d+)-(\d+\.\d+\.\d+\.\d+)/);
    
    if (!match) {
      throw new Error(`Invalid IP range format: ${rangeString}`);
    }

    const [, startIp, endIp] = match;
    const start = this.ipToNumber(startIp);
    const end = this.ipToNumber(endIp);
    
    const randomNum = Math.floor(Math.random() * (end - start + 1)) + start;
    
    return this.numberToIp(randomNum);
  }

  /**
   * Genera una IP aleatoria en una subred
   */
  generateInSubnet(subnet: string): string {
    // Ejemplo: "192.168.1.0/24"
    const [baseIp, bits] = subnet.split('/');
    const [a, b, c] = baseIp.split('.').map(Number);
    
    const hostBits = 32 - parseInt(bits);
    const maxHosts = Math.pow(2, hostBits) - 2; // -2 para red y broadcast
    
    const randomHost = Math.floor(Math.random() * maxHosts) + 1;
    
    return `${a}.${b}.${c}.${randomHost}`;
  }

  /**
   * Genera un rango de red completo
   */
  generateNetworkRange(baseIp?: string): string {
    if (!baseIp) {
      const a = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      baseIp = `${a}.${b}.0.0`;
    }
    
    return `${baseIp}/24`;
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet, i) => {
      return acc + parseInt(octet) * Math.pow(256, 3 - i);
    }, 0);
  }

  private numberToIp(num: number): string {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join('.');
  }
}