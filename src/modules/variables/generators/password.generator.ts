import { Injectable } from '@nestjs/common';

@Injectable()
export class PasswordGenerator {
  private readonly weakPasswords = [
    'admin',
    'password',
    'admin123',
    'password123',
    '12345678',
    'qwerty',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    '123456',
    'root',
    'toor',
    'admin1',
    'Pass123',
  ];

  private readonly commonWords = [
    'summer', 'winter', 'spring', 'fall',
    'shadow', 'cyber', 'digital', 'matrix',
    'ghost', 'phantom', 'hacker', 'system',
  ];

  /**
   * Genera una contraseña débil realista
   */
  generateWeak(): string {
    const strategies = [
      () => this.weakPasswords[Math.floor(Math.random() * this.weakPasswords.length)],
      () => this.commonWords[Math.floor(Math.random() * this.commonWords.length)] + Math.floor(Math.random() * 100),
      () => 'admin' + Math.floor(Math.random() * 1000),
      () => 'pass' + Math.floor(Math.random() * 10000),
    ];

    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    return strategy();
  }

  /**
   * Genera una contraseña de nivel medio
   */
  generateMedium(): string {
    const word = this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    const num = Math.floor(Math.random() * 1000);
    const special = ['!', '@', '#', '$'][Math.floor(Math.random() * 4)];
    
    return `${word}${num}${special}`;
  }

  /**
   * Genera una contraseña fuerte (para misiones difíciles)
   */
  generateStrong(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }

  /**
   * Genera contraseña basada en tipo
   */
  generate(type: 'weak' | 'medium' | 'strong' = 'weak'): string {
    switch (type) {
      case 'weak':
        return this.generateWeak();
      case 'medium':
        return this.generateMedium();
      case 'strong':
        return this.generateStrong();
      default:
        return this.generateWeak();
    }
  }
}