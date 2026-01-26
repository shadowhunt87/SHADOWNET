export interface SessionVariables {
  // Network
  target_ip?: string;
  local_ip?: string;
  network_range?: string;
  gateway?: string;
  
  // Authentication
  ssh_user?: string;
  ssh_password?: string;
  mysql_password?: string;
  
  // Files
  file_path?: string;
  file_name?: string;
  search_dir?: string;
  
  // System
  username?: string;
  hostname?: string;
  os?: string;
  
  // Mission-specific
  [key: string]: any;
}

export interface VariableGeneratorConfig {
  type: 'random' | 'generate' | 'static';
  value?: any;
  min?: number;
  max?: number;
  options?: string[];
}