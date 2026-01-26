import { Injectable } from '@nestjs/common';

@Injectable()
export class FilenameGenerator {
  private readonly prefixes = [
    'proyecto', 'documento', 'informe', 'reporte',
    'backup', 'config', 'secret', 'classified',
    'data', 'export', 'dump', 'archive',
  ];

  private readonly suffixes = [
    'final', 'v2', 'updated', 'new',
    'old', 'temp', 'test', 'prod',
  ];

  private readonly extensions = [
    '.txt', '.pdf', '.zip', '.tar.gz',
    '.sql', '.bak', '.conf', '.log',
  ];

  /**
   * Genera un nombre de archivo realista
   */
  generate(options?: {
    prefix?: string;
    includeDate?: boolean;
    extension?: string;
  }): string {
    const prefix = options?.prefix || this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
    const extension = options?.extension || this.extensions[Math.floor(Math.random() * this.extensions.length)];
    
    let filename = `${prefix}_${suffix}`;
    
    if (options?.includeDate) {
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      filename += `_${dateStr}`;
    }
    
    return filename + extension;
  }

  /**
   * Genera una ruta de archivo completa
   */
  generatePath(baseDir: string = '/var/backups'): string {
    const subdirs = ['classified', 'confidential', 'private', 'secure', 'data'];
    const subdir = subdirs[Math.floor(Math.random() * subdirs.length)];
    const filename = this.generate({ includeDate: true });
    
    return `${baseDir}/${subdir}/${filename}`;
  }

  /**
   * Genera múltiples archivos señuelo
   */
  generateDecoys(count: number = 5): string[] {
    const decoys: string[] = [];
    
    for (let i = 0; i < count; i++) {
      decoys.push(this.generate());
    }
    
    return decoys;
  }
}