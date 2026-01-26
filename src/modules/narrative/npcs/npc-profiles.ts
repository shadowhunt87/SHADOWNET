import { NpcId, NpcProfile } from '../interfaces/npc.interface';

export const NPC_PROFILES: Record<NpcId, NpcProfile> = {
  [NpcId.BOSS]: {
    id: NpcId.BOSS,
    name: 'The Boss',
    role: 'Commander',
    personality: 'Cold, calculating, demands perfection. Rarely shows emotion.',
    color: '#FF0000',
  },
  [NpcId.ZERO]: {
    id: NpcId.ZERO,
    name: 'Zero',
    role: 'Technical Instructor',
    personality: 'Patient mentor, methodical, encourages learning through doing.',
    color: '#00FF88',
  },
  [NpcId.SALLY]: {
    id: NpcId.SALLY,
    name: 'Sally',
    role: 'Intelligence Analyst',
    personality: 'Strategic thinker, focuses on objectives, appreciates clean work.',
    color: '#00FFE0',
  },
  [NpcId.VIPER]: {
    id: NpcId.VIPER,
    name: 'Viper',
    role: 'Rival Operative',
    personality: 'Aggressive, competitive, seeks to undermine your operations.',
    color: '#9B59B6',
  },
  [NpcId.GHOST]: {
    id: NpcId.GHOST,
    name: 'Ghost',
    role: 'Anonymous Helper',
    personality: 'Mysterious, appears randomly with cryptic advice.',
    color: '#7F8C8D',
  },
  // ✅ AGREGAR STIRLING
  [NpcId.STIRLING]: {
    id: NpcId.STIRLING,
    name: 'Agent Stirling',
    role: 'FBI Cyber Crimes Division',
    personality: 'Relentless investigator. Professional, methodical, takes satisfaction in catching hackers. Never gloats, just states facts coldly.',
    color: '#1E3A8A', // Azul FBI
  },
  [NpcId.SYSTEM]: {
    id: NpcId.SYSTEM,
    name: 'SYSTEM',
    role: 'Network Interface',
    personality: 'Automated responses, technical feedback.',
    color: '#FFFFFF',
  },
};