import { Injectable } from '@nestjs/common';

export interface ParsedCommand {
  baseCommand: string;
  args: string[];
  flags: Record<string, string | boolean>;
  fullCommand: string;
}

@Injectable()
export class CommandParser {
  /**
   * Parsea un comando en sus componentes
   */
  parse(command: string): ParsedCommand {
    const trimmed = command.trim();
    const parts = trimmed.split(/\s+/);
    const baseCommand = parts[0].toLowerCase();
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      if (part.startsWith('-')) {
        // Es un flag
        const flagName = part.replace(/^-+/, '');
        
        // Verificar si el siguiente elemento es el valor del flag
        if (i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
          flags[flagName] = parts[i + 1];
          i++; // Saltar el valor
        } else {
          flags[flagName] = true;
        }
      } else {
        args.push(part);
      }
    }

    return {
      baseCommand,
      args,
      flags,
      fullCommand: trimmed,
    };
  }

  /**
   * Valida que el comando esté en la lista permitida
   */
  isAllowed(command: string, allowedCommands: string[]): boolean {
    const parsed = this.parse(command);
    return allowedCommands.some(allowed => {
      const allowedBase = allowed.split(' ')[0].toLowerCase();
      return parsed.baseCommand === allowedBase;
    });
  }

  /**
   * Extrae variables de un comando template
   * Ejemplo: "nmap {{target_ip}}" → ["target_ip"]
   */
  extractVariables(commandTemplate: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [];
    let match;

    while ((match = regex.exec(commandTemplate)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  /**
   * Reemplaza variables en un comando template
   */
  replaceVariables(
    commandTemplate: string,
    variables: Record<string, any>,
  ): string {
    return commandTemplate.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
      return variables[varName] || `{{${varName}}}`;
    });
  }
}