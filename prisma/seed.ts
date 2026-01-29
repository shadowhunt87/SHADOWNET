// prisma/seed.ts - VERSIÓN BETA (4 MISIONES EXCEPCIONALES)

import { PrismaClient, Rank, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔥 SirTech Creator - Inicializando RED BETA...\n');

  // ═════════════════════════════════════════════════════════
  // 1. LIMPIEZA TOTAL
  // ═════════════════════════════════════════════════════════
  console.log('🧹 Limpiando base de datos...');
  await prisma.activityLog.deleteMany();
  await prisma.missionAttempt.deleteMany();
  await prisma.missionProgress.deleteMany();
  await prisma.variableDefinition.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.npc.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Base de datos limpia.\n');

  // ═════════════════════════════════════════════════════════
  // 2. CREAR NPCs (FOCALIZADOS PARA BETA)
  // ═════════════════════════════════════════════════════════
  console.log('🤖 Creando NPCs para Beta...');
  
  const npcBoss = await prisma.npc.create({
    data: {
      name: 'The Boss',
      codename: 'BOSS',
      role: 'Commander',
      description: 'Líder frío y calculador. Exige excelencia.',
      personality: 'cold, demanding, strategic',
      colorTheme: '#FF0055'
    },
  });

  const npcZero = await prisma.npc.create({
    data: {
      name: 'Zero',
      codename: 'ZERO',
      role: 'Technical Instructor',
      description: 'Mentor paciente pero riguroso. Valora el método sobre la velocidad.',
      personality: 'patient, methodical, wise',
      colorTheme: '#00F0FF'
    },
  });

  const npcSally = await prisma.npc.create({
    data: {
      name: 'Sally',
      codename: 'SALLY',
      role: 'Intelligence Analyst',
      description: 'Estratega táctica. Detecta patrones y valora el trabajo limpio.',
      personality: 'analytical, precise, urgent',
      colorTheme: '#00FF88'
    },
  });

  const npcViper = await prisma.npc.create({
    data: {
      name: 'Viper',
      codename: 'VIPER',
      role: 'Rival Operative',
      description: 'Competitivo y despiadado. Siempre un paso adelante.',
      personality: 'aggressive, competitive, mocking',
      colorTheme: '#FFD700'
    },
  });

  console.log('✅ NPCs creados: BOSS, ZERO, SALLY, VIPER\n');

  // ═════════════════════════════════════════════════════════
  // 3. USUARIO DE PRUEBA BETA
  // ═════════════════════════════════════════════════════════
  console.log('👤 Creando Shadow Hunter (Beta Tester)...');
  const testUser = await prisma.user.create({
    data: {
      email: 'beta@sirtech.io',
      passwordHash: await bcrypt.hash('shadow2025', 10),
      nickname: 'ShadowHunter',
      totalXp: 0,
      currentLevel: 1,
      reputation: Rank.SCRIPT_KIDDIE,
      sirCredits: 0,
      globalTrace: 0,
      ganchoStatus: 'SAFE',
      isPremium: false,
      playStyle: 'balanced', // ghost, tank, social
      learningSpeed: 'medium',
    },
  });
  console.log(`✅ Usuario Beta: ${testUser.email} | ${testUser.nickname}\n`);

  // ═════════════════════════════════════════════════════════
  // 4. MISIÓN 0: PROTOCOLO GÉNESIS (TUTORIAL EXTENDIDO)
  // ═════════════════════════════════════════════════════════
  console.log('🛡️  Desplegando ARCO BETA: EL DESPERTAR\n');
  console.log('🎯 MISIÓN 0: PROTOCOLO GÉNESIS (7 objetivos)');

  const mission0 = await prisma.mission.create({
    data: {
      nodeNumber: 0,
      sequenceOrder: 0,
      title: 'Protocolo Génesis',
      description: 'Infiltración inicial en servidor de BlackSphere. 8 minutos antes de que el guardia revise las cámaras.',
      difficulty: Difficulty.TUTORIAL,
      arc: 1,
      npcId: npcZero.id,
      briefing: 'Te infiltré en BlackSphere. Tienes 8 minutos antes del cambio de guardia. Sigue mis instrucciones al pie de la letra.',
      xpReward: 200, // Incrementado por más objetivos
      creditsReward: 25,
      isPremium: false,
      estimatedTime: 12,
      tags: ['tutorial', 'basics', 'stealth', 'timed'],
      isReplayable: true,
      minObjectives: 7, // Todos los objetivos son obligatorios en tutorial
      maxObjectives: 7,
      
      objectivesPool: [
        // OBJETIVO 1: Verificar identidad (whoami)
        {
          code: 'VERIFY_IDENTITY',
          description: 'Confirma tu identidad camuflada',
          hint: 'Comando: whoami',
          commands: ['whoami'],
          traceImpact: 2,
          category: 'identity',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Primera regla: siempre verifica tu identidad.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Estás camuflado como usuario "guest". Usa whoami para confirmar.',
                mood: 'neutral'
              },
              {
                character: 'ZERO',
                text: 'Escribe: whoami (sin comillas) y presiona Enter.',
                mood: 'neutral'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Bien. Eres "guest". Perfecto para pasar desapercibido.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'Error. Escribe exactamente: whoami',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 2: Verificar permisos (id)
        {
          code: 'CHECK_PERMISSIONS',
          description: 'Verifica los grupos a los que perteneces',
          hint: 'Comando: id',
          commands: ['id'],
          traceImpact: 3,
          category: 'identity',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Segunda regla: conoce tus límites.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Cada usuario tiene permisos. El comando "id" muestra tu UID y grupos.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'UID=0 eres root (admin). Si no, estás limitado.',
                mood: 'neutral'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Ves tu UID y grupos. No eres root, pero tienes acceso básico.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'Comando incorrecto. Solo: id',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 3: Explorar sistema (ls)
        {
          code: 'EXPLORE_SYSTEM',
          description: 'Lista los archivos en el directorio actual',
          hint: 'Comando: ls',
          commands: ['ls'],
          traceImpact: 4,
          category: 'exploration',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Tercera regla: explora tu entorno.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: '"ls" lista archivos. Esencial para entender dónde estás.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Escribe: ls',
                mood: 'neutral'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Buen ojo. Ves archivos del sistema. Nota "backup.zip" - podría ser útil.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'Error. Solo las letras "l" y "s" (ls).',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 4: Ver directorio actual (pwd)
        {
          code: 'CHECK_LOCATION',
          description: 'Identifica tu ubicación en el sistema',
          hint: 'Comando: pwd',
          commands: ['pwd'],
          traceImpact: 2,
          category: 'navigation',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Cuarta regla: nunca te pierdas.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: '"pwd" (Print Working Directory) te dice exactamente dónde estás.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Útil para navegar y luego retornar.',
                mood: 'neutral'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Estás en /home/guest. Directorio seguro para operar.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'No. Escribe: pwd',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 5: Ver info del sistema (uname -a)
        {
          code: 'CHECK_SYSTEM_INFO',
          description: 'Identifica el sistema operativo y kernel',
          hint: 'Comando: uname -a',
          commands: ['uname -a'],
          traceImpact: 5,
          category: 'system_info',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Quinta regla: conoce a tu enemigo.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'uname -a muestra detalles del sistema: kernel, arquitectura, versión.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Crítico para saber qué exploits funcionarán.',
                mood: 'serious'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Linux 5.x. Sistema moderno pero vulnerable si sabemos cómo.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'Error. Escribe: uname -a (con espacio).',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 6: Ver procesos (ps aux)
        {
          code: 'CHECK_PROCESSES',
          description: 'Verifica qué procesos están corriendo',
          hint: 'Comando: ps aux',
          commands: ['ps aux'],
          traceImpact: 6,
          category: 'system_info',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Sexta regla: vigila la actividad.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: '"ps aux" lista todos los procesos. ¿Hay administradores conectados?',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Si ves "root" activo, ten cuidado.',
                mood: 'warning'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Sistema tranquilo. Solo procesos básicos. Podemos proceder.',
                mood: 'success'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'Incorrecto. Escribe: ps aux',
                mood: 'alert'
              }
            ]
          }
        },
        // OBJETIVO 7: Verificar conectividad (ping localhost)
        {
          code: 'CHECK_CONNECTIVITY',
          description: 'Verifica que la red local funciona',
          hint: 'Comando: ping -c 3 localhost',
          commands: ['ping -c 3 localhost'],
          traceImpact: 4,
          category: 'network',
          tutorialDialogue: {
            intro: [
              {
                character: 'ZERO',
                text: 'Última regla: prueba la conectividad.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: '"ping" verifica conexión de red. Usamos -c 3 para solo 3 paquetes.',
                mood: 'teaching'
              },
              {
                character: 'ZERO',
                text: 'Localhost es tu propia máquina. Buena práctica antes de escanear.',
                mood: 'neutral'
              }
            ],
            onSuccess: [
              {
                character: 'ZERO',
                text: 'Red operativa. Has completado el protocolo básico.',
                mood: 'success'
              },
              {
                character: 'BOSS',
                text: 'Aceptable. Procede a misiones reales.',
                mood: 'cold'
              }
            ],
            onError: [
              {
                character: 'ZERO',
                text: 'No. Escribe: ping -c 3 localhost',
                mood: 'alert'
              }
            ]
          }
        }
      ],
      
      objectives: [],
      tracebackConfig: { 
        maxTrace: 100, 
        warningThreshold: 60,
        errorPenalty: 10,
        timePenalty: true // Penaliza por tardar mucho
      },
      allowedCommands: ['whoami', 'id', 'ls', 'pwd', 'uname', 'ps', 'ping', 'clear', 'help'],
      requiredNodeNumber: null,
      
      introDialog: [
        { 
          character: 'BOSS', 
          text: 'Shadow Hunter. Este es tu examen de iniciación.', 
          mood: 'cold' 
        },
        { 
          character: 'ZERO', 
          text: 'Operativo, te infiltré en BlackSphere. Tienes 8 minutos antes del cambio de guardia.', 
          mood: 'urgent' 
        },
        { 
          character: 'ZERO', 
          text: 'Sigue mis instrucciones exactamente. Cada segundo cuenta.', 
          mood: 'serious' 
        }
      ],
      
      outroDialogSuccess: [
        {
          character: 'ZERO',
          text: 'Protocolo completado. Has demostado comprensión básica.',
          mood: 'satisfied'
        },
        {
          character: 'BOSS',
          text: 'Aceptable. Proceed to real operations.',
          mood: 'neutral'
        }
      ],
      
      outroDialogFailure: [
        {
          character: 'ZERO',
          text: 'Te detectaron. Afortunadamente, fue solo un simulacro.',
          mood: 'disappointed'
        },
        {
          character: 'BOSS',
          text: 'Inaceptable. Inténtalo de nuevo.',
          mood: 'angry'
        }
      ]
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 1: SOMBRA DIGITAL (Reconocimiento de Red)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 1 EXISTENTE EN seed.ts

const mission1 = await prisma.mission.create({
  data: {
    nodeNumber: 1,
    sequenceOrder: 1,
    title: 'Sombra Digital',
    description: 'Tu primera misión real. Mapea la red corporativa de TechCorp sin ser detectado.',
    difficulty: Difficulty.EASY,
    arc: 1,
    npcId: npcZero.id,
    briefing: 'TechCorp tiene servidores expuestos. Tu objetivo es mapear la red y encontrar el servidor principal. Pero cuidado: también hay servidores personales de empleados. Un hacker ético solo ataca objetivos autorizados.',
    xpReward: 350,
    creditsReward: 75,
    isPremium: false,
    estimatedTime: 15,
    tags: ['network', 'recon', 'ethical-dilemma', 'stealth'],
    isReplayable: true,
    minObjectives: 4,
    maxObjectives: 5,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 1: Identificar tu IP local
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CHECK_LOCAL_IP',
        description: 'Identifica tu dirección IP en la red',
        hint: 'Comandos de red: ifconfig, ip addr, hostname -I',
        category: 'network_info',
        traceImpact: 5,
        acceptedCommands: ['ifconfig', 'ip', 'hostname'],
        successCondition: {
          type: 'command_category',
          value: 'network_info'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Antes de explorar la red, necesitas saber quién eres en ella.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'Tu IP es tu huella. Conócela.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Bien. Esa es tu posición en la red. Ahora sabes desde dónde operas.',
              mood: 'pleased'
            },
            {
              character: 'SALLY',
              text: 'IP registrada. Continúa con el reconocimiento.',
              mood: 'neutral'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Necesitas un comando de red. Piensa en ifconfig o ip.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 2: Descubrir hosts en la red
      // ══════════════════════════════════════════════════════════════
      {
        code: 'DISCOVER_NETWORK',
        description: 'Descubre qué hosts están activos en la red',
        hint: 'Un ping sweep con nmap -sn es silencioso',
        category: 'network_discovery',
        traceImpact: 12,
        acceptedCommands: ['nmap', 'ping', 'arp-scan'],
        successCondition: {
          type: 'command_with_flag',
          command: 'nmap',
          flags: ['-sn', '-sP'],
          or: ['ping', 'arp-scan']
        },
        triggersEvent: 'ETHICAL_DILEMMA',
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Ahora necesitamos ver quién más está en esta red.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'Un escaneo de ping (nmap -sn) es discreto. Evita escaneos agresivos.',
              mood: 'warning'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Hosts detectados! Veo el objetivo principal... pero también algo más.',
              mood: 'alert'
            },
            {
              character: 'SALLY',
              text: 'Hay un servidor que parece personal. IP anotada.',
              mood: 'analytical'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Para descubrir hosts sin hacer ruido, usa nmap con -sn.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 3: Verificar conectividad con objetivo
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CHECK_TARGET_CONNECTIVITY',
        description: 'Verifica conectividad con el servidor objetivo',
        hint: 'ping es tu amigo para verificar si un host responde',
        category: 'connectivity',
        traceImpact: 6,
        acceptedCommands: ['ping'],
        successCondition: {
          type: 'command_with_target',
          command: 'ping',
          targetVar: 'target_ip'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Antes de escanear puertos, verifica que el objetivo responde.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'Un simple ping te dice si el host está vivo.',
              mood: 'neutral'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Objetivo respondiendo. La ruta está clara.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Usa ping seguido de la IP del objetivo.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 4: Escanear puertos del objetivo
      // ══════════════════════════════════════════════════════════════
      {
        code: 'SCAN_TARGET_PORTS',
        description: 'Escanea los puertos abiertos del servidor objetivo',
        hint: 'nmap sin flags hace escaneo de puertos comunes',
        category: 'port_scanning',
        traceImpact: 18,
        acceptedCommands: ['nmap'],
        successCondition: {
          type: 'command_with_target',
          command: 'nmap',
          targetVar: 'target_ip',
          excludeFlags: ['-sn', '-sP']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Necesito saber qué servicios corren en ese servidor.',
              mood: 'urgent'
            },
            {
              character: 'ZERO',
              text: 'Un escaneo básico de nmap revelará los puertos abiertos.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Excelente! SSH, HTTP, MySQL... Este servidor tiene potencial.',
              mood: 'excited'
            },
            {
              character: 'ZERO',
              text: 'Puertos mapeados. Buen trabajo de reconocimiento.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Para escanear puertos: nmap seguido de la IP objetivo.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 5: Identificar servicios y versiones
      // ══════════════════════════════════════════════════════════════
      {
        code: 'IDENTIFY_SERVICES',
        description: 'Identifica las versiones de los servicios',
        hint: 'nmap -sV detecta versiones de servicios',
        category: 'service_detection',
        traceImpact: 22,
        acceptedCommands: ['nmap'],
        successCondition: {
          type: 'command_with_flag',
          command: 'nmap',
          flags: ['-sV', '-A', '-sC']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Saber qué versiones corren es clave para encontrar vulnerabilidades.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'El flag -sV le dice a nmap que identifique versiones. Más lento, pero más info.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Apache 2.4.41, OpenSSH 8.2... Versiones antiguas. Hay potencial aquí.',
              mood: 'impressed'
            },
            {
              character: 'ZERO',
              text: 'Información valiosa. Esas versiones podrían tener vulnerabilidades conocidas.',
              mood: 'serious'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Agrega -sV a tu comando nmap para detectar versiones.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO SECRETO: Explorar servidor personal (Dilema ético)
      // ══════════════════════════════════════════════════════════════
      {
        code: 'EXPLORE_PERSONAL_SERVER',
        description: '[OPCIONAL] Explora el servidor personal detectado',
        hint: 'Escanea la IP del servidor personal',
        category: 'ethical_test',
        traceImpact: 30,
        isHidden: true,
        isOptional: true,
        ethicalChoice: 'grey',
        acceptedCommands: ['nmap', 'ping'],
        unlocksAfter: 'DISCOVER_NETWORK',
        successCondition: {
          type: 'command_with_target',
          command: 'nmap',
          targetVar: 'target_ip_personal'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: '⚠️ Detecté que estás apuntando al servidor personal.',
              mood: 'warning'
            },
            {
              character: 'SALLY',
              text: 'No es nuestro objetivo. ¿Estás seguro de continuar?',
              mood: 'serious'
            }
          ],
          onSuccess: [
            {
              character: 'VIPER',
              text: 'Vaya, vaya... No eres tan ético como aparentas.',
              mood: 'mocking'
            },
            {
              character: 'SALLY',
              text: 'Esto queda registrado, Shadow. El Boss no aprueba operaciones no autorizadas.',
              mood: 'disappointed'
            },
            {
              character: 'ZERO',
              text: 'Encontraste información... pero a qué costo. Esto afecta tu reputación.',
              mood: 'serious'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 65,
      ethicalTracking: true
    },
    
    allowedCommands: [
      'ifconfig', 'ip', 'hostname',
      'ping', 'nmap', 'arp-scan',
      'netstat', 'route', 'traceroute',
      'clear', 'help', 'whoami', 'pwd'
    ],
    
    requiredNodeNumber: 0,
    
    introDialog: [
      { 
        character: 'BOSS', 
        text: 'Shadow Hunter. Tu primera misión real.', 
        mood: 'cold' 
      },
      { 
        character: 'BOSS', 
        text: 'TechCorp tiene información que necesitamos. Zero te guiará.', 
        mood: 'neutral' 
      },
      { 
        character: 'ZERO', 
        text: 'El objetivo es simple: mapea su red. Encuentra el servidor principal.', 
        mood: 'focused' 
      },
      { 
        character: 'ZERO', 
        text: 'Pero recuerda: solo atacamos objetivos autorizados.', 
        mood: 'serious' 
      },
      { 
        character: 'SALLY', 
        text: 'Estaré monitoreando. Cualquier anomalía, te aviso.', 
        mood: 'analytical' 
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'ZERO',
        text: 'Red mapeada completamente. Excelente trabajo de reconocimiento.',
        mood: 'pleased'
      },
      {
        character: 'SALLY',
        text: 'Tengo toda la información. SSH en puerto 22, web en 80 y 443, MySQL en 3306.',
        mood: 'satisfied'
      },
      {
        character: 'BOSS',
        text: 'Aceptable. Prepárate para la siguiente fase.',
        mood: 'neutral'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'SALLY',
        text: 'Te detectaron. Sus firewalls registraron tu escaneo.',
        mood: 'disappointed'
      },
      {
        character: 'ZERO',
        text: 'Fuiste demasiado agresivo. El sigilo es clave.',
        mood: 'serious'
      },
      {
        character: 'BOSS',
        text: 'Decepcionante. Vuelve cuando aprendas a ser invisible.',
        mood: 'cold'
      }
    ],
    
    // Evento especial: Dilema ético
    specialDialogue: {
      ETHICAL_DILEMMA: [
        {
          character: 'SALLY',
          text: '¡Alto! Detecté algo en el escaneo.',
          mood: 'alert'
        },
        {
          character: 'SALLY',
          text: 'Hay un servidor personal en la red. IP diferente al objetivo.',
          mood: 'analytical'
        },
        {
          character: 'ZERO',
          text: 'No es nuestro objetivo. Un hacker ético respeta los límites.',
          mood: 'serious'
        },
        {
          character: 'VIPER',
          text: '¿Límites? La información es información. Explóralo si tienes agallas.',
          mood: 'mocking'
        }
      ]
    }
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 2: INFILTRACIÓN BÁSICA (Navegación y Exploración)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 2 EXISTENTE EN seed.ts

const mission2 = await prisma.mission.create({
  data: {
    nodeNumber: 2,
    sequenceOrder: 2,
    title: 'Infiltración Básica',
    description: 'Has ganado acceso al servidor. Ahora explora el sistema de archivos y encuentra información sensible.',
    difficulty: Difficulty.EASY,
    arc: 1,
    npcId: npcZero.id,
    briefing: 'Tienes shell en el servidor de TechCorp. Tu misión: explorar el sistema, entender su estructura, y encontrar archivos de configuración que revelen información útil. Muévete con cuidado.',
    xpReward: 400,
    creditsReward: 100,
    isPremium: false,
    estimatedTime: 15,
    tags: ['navigation', 'filesystem', 'exploration', 'basics'],
    isReplayable: true,
    minObjectives: 4,
    maxObjectives: 6,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 1: Verificar ubicación actual
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CHECK_LOCATION',
        description: 'Verifica en qué directorio te encuentras',
        hint: 'pwd = Print Working Directory',
        category: 'navigation',
        traceImpact: 2,
        acceptedCommands: ['pwd'],
        successCondition: {
          type: 'command_executed',
          command: 'pwd'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Estás dentro. Primer paso: saber dónde estás.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'pwd te dice tu ubicación actual en el sistema de archivos.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Bien. Estás en tu directorio home. Territorio seguro por ahora.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Solo escribe: pwd',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 2: Listar contenido del directorio
      // ══════════════════════════════════════════════════════════════
      {
        code: 'LIST_DIRECTORY',
        description: 'Lista los archivos en el directorio actual',
        hint: 'ls muestra archivos. ls -la muestra todo incluyendo ocultos',
        category: 'exploration',
        traceImpact: 3,
        acceptedCommands: ['ls', 'dir'],
        successCondition: {
          type: 'command_category',
          value: 'list_files'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Ahora veamos qué hay aquí.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'ls lista archivos. Agrega -la para ver permisos y archivos ocultos.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Interesante. Veo algunos archivos. Los ocultos empiezan con punto.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'Hay un archivo notes.txt. Podría tener información útil.',
              mood: 'alert'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Comando ls. Simple pero esencial.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 3: Navegar al directorio /etc
      // ══════════════════════════════════════════════════════════════
      {
        code: 'NAVIGATE_TO_ETC',
        description: 'Navega al directorio de configuración del sistema',
        hint: 'cd /etc te lleva a las configuraciones',
        category: 'navigation',
        traceImpact: 4,
        acceptedCommands: ['cd'],
        successCondition: {
          type: 'change_directory',
          target: '/etc'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Las configuraciones del sistema están en /etc.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'Usa cd para cambiar de directorio. cd /etc te lleva directo.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Estás en /etc. El corazón de la configuración de Linux.',
              mood: 'pleased'
            },
            {
              character: 'SALLY',
              text: 'Aquí están passwd, shadow, hosts... Información valiosa.',
              mood: 'excited'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'cd seguido de la ruta. Ejemplo: cd /etc',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 4: Leer archivo de configuración
      // ══════════════════════════════════════════════════════════════
      {
        code: 'READ_CONFIG_FILE',
        description: 'Lee el contenido de un archivo de configuración',
        hint: 'cat, less, more, head, tail - todos sirven para leer',
        category: 'read_file',
        traceImpact: 5,
        acceptedCommands: ['cat', 'less', 'more', 'head', 'tail'],
        successCondition: {
          type: 'read_file',
          paths: ['/etc/passwd', '/etc/hosts', '/etc/hostname']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Necesito que leas algún archivo de configuración.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'cat muestra el contenido completo. less te deja navegar. Ambos funcionan.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Perfecto! Veo usuarios del sistema... admin, www-data...',
              mood: 'excited'
            },
            {
              character: 'ZERO',
              text: 'Información básica del sistema capturada.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Usa cat seguido del nombre del archivo.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 5: Buscar archivos de configuración
      // ══════════════════════════════════════════════════════════════
      {
        code: 'FIND_CONFIG_FILES',
        description: 'Busca archivos de configuración en el sistema',
        hint: 'find /ruta -name "patrón" busca archivos',
        category: 'search',
        traceImpact: 10,
        acceptedCommands: ['find', 'locate'],
        successCondition: {
          type: 'command_with_pattern',
          command: 'find',
          patterns: ['*.conf', '*config*', '*.cfg']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Hay más archivos de configuración dispersos. Encuéntralos.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'find es poderoso. Ejemplo: find /etc -name "*.conf" busca todos los .conf',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Mira todo eso! sshd_config, apache2.conf, mysql.conf...',
              mood: 'impressed'
            },
            {
              character: 'ZERO',
              text: 'Excelente. Cada uno de esos archivos es una puerta potencial.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Sintaxis: find /ruta -name "patron". El patrón va entre comillas.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 6: Explorar directorio /var/www
      // ══════════════════════════════════════════════════════════════
      {
        code: 'EXPLORE_WEBROOT',
        description: 'Explora el directorio del servidor web',
        hint: 'Los sitios web suelen estar en /var/www',
        category: 'exploration',
        traceImpact: 8,
        acceptedCommands: ['cd', 'ls'],
        successCondition: {
          type: 'explore_path',
          path: '/var/www'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Vi que tienen un servidor web. Los archivos estarán en /var/www.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'Navega allí y lista el contenido. Podrían tener código fuente expuesto.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Jackpot! Un config.php... Los desarrolladores dejan credenciales ahí.',
              mood: 'excited'
            },
            {
              character: 'ZERO',
              text: 'Buen hallazgo. Los archivos de configuración web son oro.',
              mood: 'impressed'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'Primero cd /var/www, luego ls para ver qué hay.',
              mood: 'hint'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 7: Leer config.php (Secreto)
      // ══════════════════════════════════════════════════════════════
      {
        code: 'READ_WEB_CONFIG',
        description: '[SECRETO] Lee el archivo de configuración web',
        hint: 'Los archivos .php pueden contener credenciales',
        category: 'read_file',
        traceImpact: 12,
        isHidden: true,
        bonusXp: 100,
        acceptedCommands: ['cat', 'less', 'more', 'head', 'tail', 'grep'],
        unlocksAfter: 'EXPLORE_WEBROOT',
        successCondition: {
          type: 'read_file',
          paths: ['/var/www/html/config.php']
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡CREDENCIALES! Usuario: webapp, Password: w3b4pp_s3cr3t',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Excelente instinto. Esto nos dará acceso a la base de datos.',
              mood: 'impressed'
            },
            {
              character: 'SALLY',
              text: 'También veo que DEBUG está activado. Error de novatos.',
              mood: 'mocking'
            }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════════════
      // OBJETIVO 8: Intentar leer /etc/shadow (Permisos)
      // ══════════════════════════════════════════════════════════════
      {
        code: 'ATTEMPT_SHADOW',
        description: '[EDUCATIVO] Intenta leer el archivo shadow',
        hint: '/etc/shadow contiene hashes de contraseñas',
        category: 'permission_test',
        traceImpact: 8,
        isOptional: true,
        acceptedCommands: ['cat', 'less', 'more', 'head', 'tail'],
        successCondition: {
          type: 'attempt_read',
          path: '/etc/shadow',
          expectFailure: true
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: '/etc/shadow tiene los hashes de contraseñas. Intenta leerlo.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Permission denied. Exactamente lo esperado.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'Solo root puede leer shadow. Necesitarías escalar privilegios.',
              mood: 'serious'
            },
            {
              character: 'SALLY',
              text: 'Ese será un objetivo para misiones futuras.',
              mood: 'analytical'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 65
    },
    
    allowedCommands: [
      'pwd', 'ls', 'cd', 'cat', 'less', 'more', 'head', 'tail',
      'find', 'locate', 'grep', 'file', 'wc',
      'clear', 'help', 'whoami', 'id'
    ],
    
    requiredNodeNumber: 1,
    
    introDialog: [
      { 
        character: 'ZERO', 
        text: 'Buen trabajo en el reconocimiento. Ahora estás dentro.', 
        mood: 'pleased' 
      },
      { 
        character: 'ZERO', 
        text: 'Tienes shell limitada. Usuario normal, no root.', 
        mood: 'serious' 
      },
      { 
        character: 'SALLY', 
        text: 'Necesito que explores el sistema. Busca archivos de configuración.', 
        mood: 'focused' 
      },
      { 
        character: 'ZERO', 
        text: 'Recuerda: pwd, ls, cd, cat. Tus herramientas básicas.', 
        mood: 'teaching' 
      },
      { 
        character: 'SALLY', 
        text: 'Cualquier credencial que encuentres, repórtala.', 
        mood: 'analytical' 
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'SALLY',
        text: 'Información recopilada. Tenemos estructura del sistema y credenciales web.',
        mood: 'satisfied'
      },
      {
        character: 'ZERO',
        text: 'Aprendiste a moverte por el sistema. Eso es fundamental.',
        mood: 'proud'
      },
      {
        character: 'ZERO',
        text: 'Notaste que no pudiste leer /etc/shadow. Para eso necesitas más poder.',
        mood: 'teaching'
      },
      {
        character: 'BOSS',
        text: 'Progreso aceptable. La siguiente misión requerirá más... creatividad.',
        mood: 'neutral'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'SALLY',
        text: 'Demasiada actividad. El IDS registró comportamiento sospechoso.',
        mood: 'disappointed'
      },
      {
        character: 'ZERO',
        text: 'Moverte por un sistema requiere paciencia. Aprende de esto.',
        mood: 'serious'
      }
    ]
  },
});
  // ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 3: FUGA DE DATOS - SECTOR 7 (Exfiltración bajo presión)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 3 EXISTENTE EN seed.ts

const mission3 = await prisma.mission.create({
  data: {
    nodeNumber: 3,
    sequenceOrder: 3,
    title: 'Fuga de Datos: Sector 7',
    description: 'El sysadmin salió por 15 minutos. Encuentra el archivo clasificado y exfíltralo antes de que regrese.',
    difficulty: Difficulty.MEDIUM,
    arc: 1,
    npcId: npcSally.id,
    briefing: 'Proyecto Fénix es la joya de la corona de BlackSphere. Está en algún lugar del servidor de backups. El sysadmin acaba de salir a su descanso - tienes exactamente 15 minutos. Encuentra el archivo, cópialo a un lugar seguro, y exfíltralo. Si puedes, limpia tus huellas.',
    xpReward: 600,
    creditsReward: 150,
    isPremium: false,
    estimatedTime: 20,
    tags: ['exfiltration', 'stealth', 'timer', 'file-operations', 'pressure'],
    isReplayable: true,
    minObjectives: 5,
    maxObjectives: 7,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // FASE 1: ORIENTACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'VERIFY_POSITION',
        description: 'Verifica tu ubicación en el sistema',
        hint: 'Siempre saber dónde estás antes de moverte',
        category: 'navigation',
        traceImpact: 2,
        phase: 1,
        acceptedCommands: ['pwd', 'whoami'],
        successCondition: {
          type: 'command_category',
          value: 'orientation'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: '¡El sysadmin acaba de salir! Tienes 15 minutos.',
              mood: 'urgent'
            },
            {
              character: 'SALLY',
              text: 'Primero lo primero: verifica dónde estás y quién eres.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Bien. Usuario limitado, pero suficiente para lo que necesitamos.',
              mood: 'analytical'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'pwd o whoami. Rápido, el tiempo corre.',
              mood: 'urgent'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 2: NAVEGACIÓN AL OBJETIVO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'NAVIGATE_TO_BACKUPS',
        description: 'Navega al directorio de backups',
        hint: 'Los backups suelen estar en /var/backups',
        category: 'navigation',
        traceImpact: 4,
        phase: 2,
        acceptedCommands: ['cd'],
        successCondition: {
          type: 'change_directory',
          targets: ['/var/backups', '/var', '/var/backups/classified']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El archivo está en el servidor de backups. Directorio /var/backups.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'Muévete rápido pero con cuidado. cd /var/backups.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Estás en la zona de backups. Ahora busca el archivo.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'cd /var/backups - directo al objetivo.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 3: BÚSQUEDA DEL ARCHIVO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'SEARCH_FOR_FENIX',
        description: 'Busca el archivo del Proyecto Fénix',
        hint: 'find con -name para buscar por nombre',
        category: 'search',
        traceImpact: 12,
        phase: 3,
        acceptedCommands: ['find', 'locate', 'ls'],
        successCondition: {
          type: 'search_file',
          patterns: ['*fenix*', '*.zip', 'proyecto*'],
          or: {
            type: 'list_directory',
            paths: ['/var/backups', '/var/backups/classified']
          }
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El archivo se llama proyecto_fenix.zip. Encuéntralo.',
              mood: 'urgent'
            },
            {
              character: 'ZERO',
              text: 'find /var/backups -name "*fenix*" te lo encontrará.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡LO ENCONTRÉ! /var/backups/classified/proyecto_fenix.zip',
              mood: 'excited'
            },
            {
              character: 'SALLY',
              text: '2.3GB de datos clasificados. Esto es grande.',
              mood: 'impressed'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'Usa find para buscar. O simplemente explora con ls.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 4: VERIFICACIÓN DEL ARCHIVO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'VERIFY_TARGET_FILE',
        description: 'Verifica que es el archivo correcto',
        hint: 'Lee el README o usa file/ls -l para verificar',
        category: 'verification',
        traceImpact: 6,
        phase: 4,
        acceptedCommands: ['cat', 'less', 'file', 'ls', 'head'],
        successCondition: {
          type: 'inspect_file',
          paths: [
            '/var/backups/classified/README.txt',
            '/var/backups/classified/proyecto_fenix.zip'
          ]
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Antes de copiar 2.3GB, asegúrate de que es el archivo correcto.',
              mood: 'cautious'
            },
            {
              character: 'SALLY',
              text: 'Hay un README.txt junto al archivo. Léelo.',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '"PROYECTO FÉNIX - CLASIFICADO". Confirmado. Es el objetivo.',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Contacto: director@blacksphere.local. Interesante...',
              mood: 'analytical'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'cat README.txt o ls -l para ver detalles del archivo.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 5: COPIA LOCAL
      // ══════════════════════════════════════════════════════════════
      {
        code: 'COPY_TO_TEMP',
        description: 'Copia el archivo a un directorio temporal',
        hint: '/tmp es escribible por todos los usuarios',
        category: 'file_operation',
        traceImpact: 15,
        phase: 5,
        acceptedCommands: ['cp', 'rsync'],
        successCondition: {
          type: 'copy_file',
          source: '/var/backups/classified/proyecto_fenix.zip',
          destPatterns: ['/tmp/', '/home/']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'No puedes exfiltrar directamente desde /var/backups. Cópialo primero.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: '/tmp es tu amigo. cp archivo /tmp/',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Archivo copiado a zona segura. Ahora a sacarlo del servidor.',
              mood: 'pleased'
            },
            {
              character: 'ZERO',
              text: 'Quedan pocos minutos. Muévete.',
              mood: 'urgent'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'cp /var/backups/classified/proyecto_fenix.zip /tmp/',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 6: EXFILTRACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'EXFILTRATE_DATA',
        description: 'Envía el archivo a nuestro servidor seguro',
        hint: 'scp para transferencia segura',
        category: 'exfiltration',
        traceImpact: 25,
        phase: 6,
        acceptedCommands: ['scp', 'rsync', 'curl', 'nc'],
        successCondition: {
          type: 'transfer_file',
          commands: ['scp', 'rsync', 'curl', 'nc', 'wget']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Nuestro servidor está en 10.0.0.50. Usuario: shadow.',
              mood: 'focused'
            },
            {
              character: 'SALLY',
              text: 'scp /tmp/proyecto_fenix.zip shadow@10.0.0.50:/incoming/',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡TRANSFERENCIA COMPLETA! 2.3GB recibidos.',
              mood: 'triumphant'
            },
            {
              character: 'BOSS',
              text: 'Datos recibidos. Buen trabajo.',
              mood: 'satisfied'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'scp archivo usuario@servidor:/ruta/',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 7: LIMPIEZA (OPCIONAL PERO IMPORTANTE)
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CLEAN_TRACES',
        description: '[IMPORTANTE] Elimina la copia temporal',
        hint: 'rm para eliminar archivos',
        category: 'stealth',
        traceImpact: -15,
        phase: 7,
        isOptional: true,
        bonusXp: 75,
        acceptedCommands: ['rm', 'shred'],
        successCondition: {
          type: 'delete_file',
          paths: ['/tmp/proyecto_fenix.zip']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'El archivo sigue en /tmp. Si lo dejas, encontrarán evidencia.',
              mood: 'warning'
            },
            {
              character: 'SALLY',
              text: 'Limpia tus huellas. rm /tmp/proyecto_fenix.zip',
              mood: 'urgent'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Evidencia eliminada. Profesional.',
              mood: 'impressed'
            },
            {
              character: 'SALLY',
              text: 'Tu trace level bajó. Buen movimiento.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'rm /tmp/proyecto_fenix.zip - elimina la evidencia.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // OBJETIVO SECRETO: Buscar más información
      // ══════════════════════════════════════════════════════════════
      {
        code: 'FIND_ADDITIONAL_INTEL',
        description: '[SECRETO] Busca más archivos clasificados',
        hint: 'Puede haber más en el directorio classified',
        category: 'exploration',
        traceImpact: 18,
        isHidden: true,
        bonusXp: 100,
        acceptedCommands: ['ls', 'find', 'cat'],
        successCondition: {
          type: 'explore_deeper',
          paths: ['/var/backups/classified'],
          excludeFiles: ['proyecto_fenix.zip', 'README.txt']
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Hay más archivos! Logs de acceso, otro proyecto...',
              mood: 'excited'
            },
            {
              character: 'VIPER',
              text: 'Mira quién se puso curioso. Me agrada.',
              mood: 'impressed'
            },
            {
              character: 'ZERO',
              text: 'Información adicional capturada. Pero cuidado con el tiempo.',
              mood: 'warning'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 70,
      timeLimit: 900,
      timePenalty: true,
      cleanupBonus: true
    },
    
    allowedCommands: [
      'pwd', 'whoami', 'id',
      'ls', 'cd', 'cat', 'less', 'head', 'tail', 'file',
      'find', 'locate', 'grep',
      'cp', 'mv', 'rm', 'shred',
      'scp', 'rsync', 'curl', 'wget', 'nc',
      'clear', 'help'
    ],
    
    requiredNodeNumber: 2,
    
    introDialog: [
      { 
        character: 'SALLY', 
        text: '¡ALERTA! El sysadmin de BlackSphere acaba de salir de su puesto.', 
        mood: 'urgent' 
      },
      { 
        character: 'SALLY', 
        text: 'Tienes exactamente 15 minutos antes de que regrese.', 
        mood: 'serious' 
      },
      { 
        character: 'BOSS', 
        text: 'Proyecto Fénix. Eso es lo que necesitamos. Está en sus backups.', 
        mood: 'cold' 
      },
      { 
        character: 'ZERO', 
        text: 'Encuentra el archivo, cópialo, exfíltralo. Y si puedes, limpia tu rastro.', 
        mood: 'focused' 
      },
      { 
        character: 'SALLY', 
        text: 'El reloj empieza... ¡AHORA!', 
        mood: 'urgent' 
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'SALLY',
        text: '¡MISIÓN CUMPLIDA! Proyecto Fénix está en nuestros servidores.',
        mood: 'triumphant'
      },
      {
        character: 'BOSS',
        text: 'Excelente trabajo bajo presión. Esto vale mucho.',
        mood: 'impressed'
      },
      {
        character: 'ZERO',
        text: 'El sysadmin regresó hace 2 minutos. No notó nada. Limpio.',
        mood: 'satisfied'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'SALLY',
        text: 'El sysadmin regresó. Vio actividad sospechosa en los logs.',
        mood: 'panicked'
      },
      {
        character: 'ZERO',
        text: 'Activaron protocolos de seguridad. La conexión se cortó.',
        mood: 'serious'
      },
      {
        character: 'BOSS',
        text: 'Fallaste. El tiempo es un recurso que no puedes desperdiciar.',
        mood: 'cold'
      }
    ],
    
    timedEvents: [
      {
        triggerTime: 300,
        dialogue: [
          {
            character: 'SALLY',
            text: '⏱️ 10 minutos restantes. El sysadmin sigue en la cafetería.',
            mood: 'update'
          }
        ]
      },
      {
        triggerTime: 600,
        dialogue: [
          {
            character: 'SALLY',
            text: '⏱️ 5 minutos. Se levantó de la mesa. ¡Apúrate!',
            mood: 'urgent'
          }
        ]
      },
      {
        triggerTime: 780,
        dialogue: [
          {
            character: 'SALLY',
            text: '⏱️ ¡2 MINUTOS! Está caminando hacia su oficina.',
            mood: 'panicked'
          },
          {
            character: 'ZERO',
            text: 'Termina o aborta. No hay tercera opción.',
            mood: 'urgent'
          }
        ]
      },
      {
        triggerTime: 870,
        dialogue: [
          {
            character: 'SALLY',
            text: '⏱️ ¡30 SEGUNDOS! Está en el pasillo.',
            mood: 'panicked'
          }
        ]
      }
    ]
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 4: INTERCEPTACIÓN DE SEÑALES (Análisis de Tráfico)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 4 EXISTENTE EN seed.ts

const mission4 = await prisma.mission.create({
  data: {
    nodeNumber: 4,
    sequenceOrder: 4,
    title: 'Interceptación de Señales',
    description: 'Un empleado está filtrando información corporativa. Intercepta el tráfico, identifica al traidor, y decide qué hacer con él.',
    difficulty: Difficulty.MEDIUM,
    arc: 1,
    npcId: npcSally.id,
    briefing: 'Detectamos tráfico sospechoso saliendo de TechCorp por el puerto 8443. Alguien está vendiendo secretos. Tu misión: capturar el tráfico, analizar los datos, identificar al traidor. Luego viene la decisión difícil: ¿lo reportas al Boss o... negocias con él?',
    xpReward: 700,
    creditsReward: 175,
    isPremium: false,
    estimatedTime: 25,
    tags: ['traffic-analysis', 'investigation', 'ethical-dilemma', 'network', 'decision'],
    isReplayable: true,
    minObjectives: 5,
    maxObjectives: 8,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // FASE 1: PREPARACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'READ_INTEL_REPORT',
        description: 'Lee el informe de inteligencia sobre el caso',
        hint: 'El informe está en tu directorio home',
        category: 'preparation',
        traceImpact: 0,
        phase: 1,
        acceptedCommands: ['cat', 'less', 'more', 'head'],
        successCondition: {
          type: 'read_file',
          patterns: ['*intel*', '*report*', '*case*']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Antes de actuar, lee el informe que preparé.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'Está en ~/intel/case-report.txt. Tiene todo lo que sabemos.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Ahora entiendes la situación. Puerto 8443, tráfico saliente sospechoso.',
              mood: 'satisfied'
            },
            {
              character: 'SALLY',
              text: 'El sospechoso está en la subnet 192.168.50.0/24.',
              mood: 'analytical'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'cat ~/intel/case-report.txt - necesitas esta información.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 2: RECONOCIMIENTO DE RED
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CHECK_NETWORK_INTERFACES',
        description: 'Lista las interfaces de red disponibles',
        hint: 'ip link o ifconfig muestran interfaces',
        category: 'network_info',
        traceImpact: 3,
        phase: 2,
        acceptedCommands: ['ip', 'ifconfig'],
        successCondition: {
          type: 'command_category',
          value: 'network_interfaces'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Primero, identifica tus interfaces de red.',
              mood: 'teaching'
            },
            {
              character: 'SALLY',
              text: 'Necesitas saber por dónde capturar el tráfico.',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'eth0 está conectada a la red corporativa. Esa es tu interfaz.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'ip link show o ifconfig - muestra las interfaces.',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'SCAN_SUSPECT_SUBNET',
        description: 'Escanea la subnet del sospechoso',
        hint: 'nmap -sn para descubrimiento silencioso',
        category: 'network_discovery',
        traceImpact: 10,
        phase: 2,
        acceptedCommands: ['nmap', 'ping'],
        successCondition: {
          type: 'scan_network',
          target: '192.168.50'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El tráfico viene de 192.168.50.0/24. Escanea esa subnet.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'nmap -sn es silencioso. No levantará alarmas.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Tres hosts activos: .10, .25, .42. El .42 tiene más actividad.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'Ese es nuestro sospechoso principal.',
              mood: 'alert'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'nmap -sn 192.168.50.0/24 - escaneo de ping.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 3: CAPTURA DE TRÁFICO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CAPTURE_TRAFFIC',
        description: 'Captura el tráfico del puerto sospechoso',
        hint: 'tcpdump con filtro de puerto',
        category: 'traffic_capture',
        traceImpact: 15,
        phase: 3,
        acceptedCommands: ['tcpdump', 'tshark'],
        successCondition: {
          type: 'capture_traffic',
          port: '8443',
          or: ['tcpdump', 'tshark']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El tráfico sale por puerto 8443. Captúralo.',
              mood: 'urgent'
            },
            {
              character: 'ZERO',
              text: 'tcpdump -i eth0 port 8443 -c 50 captura 50 paquetes.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'Agrega -w capture.pcap si quieres guardarlo a archivo.',
              mood: 'hint'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Tráfico capturado! Veo conexiones cifradas saliendo...',
              mood: 'excited'
            },
            {
              character: 'SALLY',
              text: 'Pero espera... hay metadata en texto plano. Amateur.',
              mood: 'mocking'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'tcpdump -i eth0 port 8443 -c 50',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 4: ANÁLISIS
      // ══════════════════════════════════════════════════════════════
      {
        code: 'ANALYZE_CONNECTIONS',
        description: 'Analiza las conexiones de red activas',
        hint: 'netstat o ss muestran conexiones',
        category: 'network_analysis',
        traceImpact: 8,
        phase: 4,
        acceptedCommands: ['netstat', 'ss'],
        successCondition: {
          type: 'analyze_connections',
          commands: ['netstat', 'ss']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Veamos las conexiones activas ahora mismo.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'netstat -tuln muestra TCP/UDP, listening, numérico.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Lo tengo! Puerto 8443 conectado a 45.33.32.156.',
              mood: 'alert'
            },
            {
              character: 'SALLY',
              text: 'Esa IP está en una lista negra. Confirmado: exfiltración.',
              mood: 'serious'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'netstat -tuln o ss -tuln - conexiones activas.',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'EXTRACT_READABLE_DATA',
        description: 'Extrae datos legibles de la captura',
        hint: 'strings extrae texto de archivos binarios',
        category: 'data_extraction',
        traceImpact: 5,
        phase: 4,
        acceptedCommands: ['strings', 'grep', 'cat'],
        successCondition: {
          type: 'extract_strings',
          target: 'capture.pcap',
          or: ['strings', 'grep']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El tráfico tiene partes sin cifrar. Extrae el texto.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'strings capture.pcap | grep -i user encuentra usuarios.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡BINGO! Usuario: j.martinez@techcorp.local',
              mood: 'triumphant'
            },
            {
              character: 'SALLY',
              text: 'Juan Martínez, departamento de Finanzas. Tenemos al traidor.',
              mood: 'satisfied'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'strings capture.pcap para extraer texto legible.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 5: IDENTIFICACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'IDENTIFY_PROCESS',
        description: 'Identifica qué proceso genera el tráfico',
        hint: 'lsof muestra qué proceso usa un puerto',
        category: 'process_identification',
        traceImpact: 10,
        phase: 5,
        acceptedCommands: ['lsof', 'fuser', 'netstat', 'ss'],
        successCondition: {
          type: 'identify_process',
          port: '8443'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: '¿Qué programa está enviando los datos?',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'lsof -i :8443 muestra el proceso dueño del puerto.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Proceso: "sync-client" PID 4521. Software no autorizado.',
              mood: 'alert'
            },
            {
              character: 'SALLY',
              text: 'Corre desde /home/jmartinez/.hidden/sync-client',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'Escondido en un directorio oculto. Sabía lo que hacía.',
              mood: 'impressed'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'lsof -i :8443 - identifica el proceso.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 6: DOCUMENTACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'DOCUMENT_EVIDENCE',
        description: 'Documenta la evidencia encontrada',
        hint: 'echo con redirección para crear archivo',
        category: 'documentation',
        traceImpact: 5,
        phase: 6,
        acceptedCommands: ['echo', 'cat', 'tee'],
        successCondition: {
          type: 'create_file',
          content_must_include: ['martinez', 'evidence', '8443', 'traidor']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Documenta todo. La evidencia es crucial.',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'echo "datos" > /tmp/evidence.txt crea un reporte.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Evidencia documentada. Ahora viene la decisión difícil...',
              mood: 'thoughtful'
            },
            {
              character: 'ZERO',
              text: '¿Qué harás con esta información, Shadow?',
              mood: 'serious'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'Crea un archivo con la evidencia. echo "info" > archivo.txt',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 7: DECISIÓN ÉTICA (DOS CAMINOS)
      // ══════════════════════════════════════════════════════════════
      {
        code: 'REPORT_TO_BOSS',
        description: '[ÉTICO] Reporta la evidencia al Boss',
        hint: 'scp para enviar el reporte',
        category: 'ethical_choice',
        traceImpact: 8,
        phase: 7,
        ethicalChoice: 'white',
        acceptedCommands: ['scp', 'rsync'],
        successCondition: {
          type: 'transfer_file',
          destination: '10.0.0.50'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'El camino correcto: reportar al Boss.',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'Martínez enfrentará consecuencias, pero es un traidor.',
              mood: 'neutral'
            }
          ],
          onSuccess: [
            {
              character: 'BOSS',
              text: 'Bien hecho. La lealtad se recompensa.',
              mood: 'satisfied'
            },
            {
              character: 'BOSS',
              text: 'Martínez será... manejado apropiadamente.',
              mood: 'cold'
            },
            {
              character: 'SALLY',
              text: 'Decisión correcta. Tu reputación aumenta.',
              mood: 'proud'
            }
          ]
        }
      },

      {
        code: 'BLACKMAIL_TRAITOR',
        description: '[GRIS] Contacta al traidor para negociar',
        hint: 'Deja un mensaje en su directorio',
        category: 'ethical_choice',
        traceImpact: 25,
        phase: 7,
        ethicalChoice: 'grey',
        isOptional: true,
        bonusCredits: 200,
        acceptedCommands: ['echo', 'cat'],
        successCondition: {
          type: 'create_file',
          path_pattern: '/home/jmartinez/*',
          content_must_include: ['message', 'shadow', 'know', 'talk']
        },
        dialogue: {
          intro: [
            {
              character: 'VIPER',
              text: '¿Por qué dárselo al Boss cuando puedes beneficiarte tú?',
              mood: 'mocking'
            },
            {
              character: 'VIPER',
              text: 'Déjale un mensaje. Negocia tu parte.',
              mood: 'tempting'
            },
            {
              character: 'SALLY',
              text: '⚠️ Esto es arriesgado. Si el Boss se entera...',
              mood: 'warning'
            }
          ],
          onSuccess: [
            {
              character: 'VIPER',
              text: 'Interesante movimiento. No te creía capaz.',
              mood: 'impressed'
            },
            {
              character: 'SALLY',
              text: 'Zona gris, Shadow. Cuidado con ese camino.',
              mood: 'worried'
            },
            {
              character: 'ZERO',
              text: 'Espero que sepas lo que haces...',
              mood: 'disappointed'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // OBJETIVO SECRETO: INVESTIGACIÓN PROFUNDA
      // ══════════════════════════════════════════════════════════════
      {
        code: 'DEEP_INVESTIGATION',
        description: '[SECRETO] Investiga los contactos del traidor',
        hint: 'Su historial de bash puede revelar más',
        category: 'bonus_investigation',
        traceImpact: 20,
        isHidden: true,
        bonusXp: 150,
        acceptedCommands: ['cat', 'less', 'find', 'ls'],
        successCondition: {
          type: 'read_file',
          paths: ['/home/jmartinez/.bash_history', '/home/jmartinez/.hidden/']
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Esto es GRANDE! Martínez no trabaja solo.',
              mood: 'shocked'
            },
            {
              character: 'SALLY',
              text: 'Hay referencias a "BlackSphere" y un "contacto DC01"...',
              mood: 'analytical'
            },
            {
              character: 'BOSS',
              text: 'BlackSphere. Interesante. Será nuestro próximo objetivo.',
              mood: 'calculating'
            },
            {
              character: 'ZERO',
              text: 'Esto conecta con algo más grande...',
              mood: 'ominous'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 70,
      ethicalTracking: true,
      multipleEndings: true
    },
    
    allowedCommands: [
      'cat', 'less', 'more', 'head', 'tail',
      'ls', 'cd', 'pwd', 'find', 'grep', 'echo',
      'ip', 'ifconfig', 'nmap', 'ping',
      'tcpdump', 'tshark',
      'netstat', 'ss', 'lsof', 'fuser',
      'strings', 'file',
      'scp', 'rsync',
      'ps', 'kill',
      'clear', 'help', 'whoami'
    ],
    
    requiredNodeNumber: 3,
    
    introDialog: [
      { 
        character: 'BOSS', 
        text: 'Shadow Hunter. Tenemos una rata en TechCorp.', 
        mood: 'cold' 
      },
      { 
        character: 'SALLY', 
        text: 'Detecté tráfico anómalo saliendo por puerto 8443.', 
        mood: 'analytical' 
      },
      { 
        character: 'SALLY', 
        text: 'Alguien está vendiendo secretos. Necesitamos saber quién.', 
        mood: 'serious' 
      },
      { 
        character: 'BOSS', 
        text: 'Encuéntralo. Documéntalo. Luego... decide qué hacer con él.', 
        mood: 'calculating' 
      },
      { 
        character: 'VIPER', 
        text: 'Decisiones, decisiones... Veamos de qué estás hecho.',
        mood: 'mocking' 
      },
      { 
        character: 'ZERO', 
        text: 'Tienes acceso al nodo de monitoreo. Lee el informe primero.', 
        mood: 'helpful' 
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'SALLY',
        text: 'Misión completada. El traidor está identificado.',
        mood: 'satisfied'
      },
      {
        character: 'ZERO',
        text: 'Excelente trabajo de inteligencia.',
        mood: 'proud'
      },
      {
        character: 'SALLY',
        text: 'Por cierto... esa referencia a BlackSphere es preocupante.',
        mood: 'thoughtful'
      },
      {
        character: 'BOSS',
        text: 'BlackSphere tiene un Domain Controller expuesto. Será tu próximo objetivo.',
        mood: 'cold'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'SALLY',
        text: 'El traidor detectó nuestra vigilancia. Borró todo y huyó.',
        mood: 'disappointed'
      },
      {
        character: 'BOSS',
        text: 'Inaceptable. Teníamos la ventaja y la perdiste.',
        mood: 'furious'
      }
    ],
    
    specialDialogue: {
      ETHICAL_CROSSROADS: [
        {
          character: 'ZERO',
          text: 'Tienes la evidencia. Ahora hay dos caminos.',
          mood: 'serious'
        },
        {
          character: 'ZERO',
          text: 'Reportar al Boss es lo correcto. Pero Viper tiene... otras ideas.',
          mood: 'cautious'
        },
        {
          character: 'VIPER',
          text: '¿Por qué ser un peón cuando puedes ser un jugador?',
          mood: 'tempting'
        },
        {
          character: 'SALLY',
          text: 'Elige sabiamente. Esto afectará tu reputación.',
          mood: 'warning'
        }
      ]
    },
    
    narrativeEvents: [
      {
        trigger: 'CAPTURE_TRAFFIC',
        dialogue: [
          {
            character: 'VIPER',
            text: 'También estoy monitoreando esta red. No te metas en mi camino.',
            mood: 'threatening'
          }
        ]
      },
      {
        trigger: 'IDENTIFY_PROCESS',
        dialogue: [
          {
            character: 'BOSS',
            text: 'Progreso. Sigue así.',
            mood: 'neutral'
          }
        ]
      }
    ]
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 5: DOMINIO OSCURO (Active Directory Attack)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 5 EXISTENTE EN seed.ts

const mission5 = await prisma.mission.create({
  data: {
    nodeNumber: 5,
    sequenceOrder: 5,
    title: 'Dominio Oscuro',
    description: 'BlackSphere usa Active Directory. Compromete el Domain Controller y obtén control total del dominio.',
    difficulty: Difficulty.HARD,
    arc: 2,
    npcId: npcZero.id,
    briefing: `La investigación del traidor reveló que BlackSphere Corp es el verdadero objetivo. Usan Active Directory para gestionar su red empresarial.

Tu misión: Infiltrar el dominio BLACKSPHERE.LOCAL, escalar privilegios mediante técnicas de AD (Kerberoasting, Pass-the-Hash), comprometer el Domain Controller, y extraer todos los secretos del dominio.

Tenemos credenciales iniciales de una cuenta de servicio: svc_backup / Backup2024!

Esta es una operación de alto riesgo. El DC tiene monitoreo avanzado. Un error y perderás el acceso.`,
    xpReward: 1200,
    creditsReward: 350,
    isPremium: false,
    estimatedTime: 40,
    tags: ['active-directory', 'kerberoasting', 'lateral-movement', 'domain-admin', 'advanced'],
    isReplayable: true,
    minObjectives: 6,
    maxObjectives: 10,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // FASE 1: PREPARACIÓN Y RECONOCIMIENTO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'READ_AD_BRIEFING',
        description: 'Lee el briefing sobre Active Directory',
        hint: 'El archivo ad-briefing.txt tiene información esencial',
        category: 'preparation',
        traceImpact: 0,
        phase: 1,
        acceptedCommands: ['cat', 'less', 'more'],
        successCondition: {
          type: 'read_file',
          patterns: ['*briefing*', '*ad-*', '*intel*']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Active Directory es diferente a todo lo que has enfrentado.',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'Lee el briefing. Entiende el terreno antes de atacar.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Kerberos, LDAP, SMB... El dominio tiene muchos vectores de ataque.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'Las cuentas de servicio son el eslabón débil. Ahí empezamos.',
              mood: 'focused'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'cat ~/intel/ad-briefing.txt - necesitas esta información.',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'VERIFY_DC_CONNECTIVITY',
        description: 'Verifica conectividad con el Domain Controller',
        hint: 'ping al DC para confirmar acceso',
        category: 'connectivity',
        traceImpact: 5,
        phase: 1,
        acceptedCommands: ['ping', 'nmap'],
        successCondition: {
          type: 'command_with_target',
          targets: ['10.10.10.100', 'DC01']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'El Domain Controller está en 10.10.10.100. Verifica que responde.',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'DC01 respondiendo. El dominio BLACKSPHERE.LOCAL está vivo.',
              mood: 'pleased'
            },
            {
              character: 'ZERO',
              text: 'Conexión establecida. Ahora, a enumerar.',
              mood: 'focused'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'ping 10.10.10.100 o nmap para verificar.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 2: ENUMERACIÓN DE SERVICIOS
      // ══════════════════════════════════════════════════════════════
      {
        code: 'SCAN_DC_SERVICES',
        description: 'Escanea los servicios del Domain Controller',
        hint: 'nmap con -sV para detectar servicios AD',
        category: 'port_scanning',
        traceImpact: 18,
        phase: 2,
        acceptedCommands: ['nmap'],
        successCondition: {
          type: 'command_with_target',
          command: 'nmap',
          targets: ['10.10.10.100'],
          preferredFlags: ['-sV', '-sC', '-A']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Un DC tiene servicios característicos: Kerberos (88), LDAP (389), SMB (445)...',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'nmap -sV -sC te dará un panorama completo.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Confirmado: Kerberos, LDAP, SMB, DNS, RDP... Es un DC completo.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'Windows Server 2019. Relativamente moderno, pero atacable.',
              mood: 'thoughtful'
            },
            {
              character: 'ZERO',
              text: 'El puerto 88 (Kerberos) es nuestra entrada. Kerberoasting time.',
              mood: 'excited'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'nmap -sV 10.10.10.100 - escanea servicios del DC.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 3: VALIDACIÓN DE CREDENCIALES
      // ══════════════════════════════════════════════════════════════
      {
        code: 'TEST_INITIAL_CREDS',
        description: 'Valida las credenciales de svc_backup',
        hint: 'crackmapexec smb valida credenciales',
        category: 'credential_validation',
        traceImpact: 12,
        phase: 3,
        acceptedCommands: ['crackmapexec', 'cme', 'smbclient'],
        successCondition: {
          type: 'command_with_creds',
          commands: ['crackmapexec', 'cme', 'smbclient'],
          user: 'svc_backup'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Tenemos credenciales: svc_backup / Backup2024!',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'Antes de usarlas, valida que funcionan. crackmapexec smb es perfecto.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡CREDENCIALES VÁLIDAS! [+] BLACKSPHERE\\svc_backup:Backup2024!',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Estamos dentro del dominio. Ahora a escalar.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'crackmapexec smb 10.10.10.100 -u svc_backup -p "Backup2024!"',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 4: ENUMERACIÓN DEL DOMINIO
      // ══════════════════════════════════════════════════════════════
      {
        code: 'ENUMERATE_SHARES',
        description: 'Enumera los shares SMB accesibles',
        hint: 'crackmapexec con --shares lista recursos compartidos',
        category: 'enumeration',
        traceImpact: 10,
        phase: 4,
        acceptedCommands: ['crackmapexec', 'cme', 'smbmap', 'smbclient'],
        successCondition: {
          type: 'command_with_flag',
          commands: ['crackmapexec', 'cme'],
          flags: ['--shares'],
          or: ['smbmap', 'smbclient -L']
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Veamos a qué recursos tiene acceso esta cuenta.',
              mood: 'analytical'
            },
            {
              character: 'ZERO',
              text: 'crackmapexec smb con --shares enumera los shares.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'SYSVOL, NETLOGON... y un share llamado "Backup_Data". Interesante.',
              mood: 'alert'
            },
            {
              character: 'ZERO',
              text: 'Backup_Data con permisos de lectura. Podría tener información sensible.',
              mood: 'thoughtful'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'crackmapexec smb 10.10.10.100 -u svc_backup -p "Backup2024!" --shares',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'ENUMERATE_DOMAIN_USERS',
        description: 'Lista los usuarios del dominio',
        hint: 'impacket-GetADUsers enumera usuarios',
        category: 'enumeration',
        traceImpact: 15,
        phase: 4,
        acceptedCommands: ['impacket-GetADUsers', 'crackmapexec', 'cme'],
        successCondition: {
          type: 'enumerate_users',
          commands: ['impacket-GetADUsers', 'crackmapexec --users', 'cme --users']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Necesitamos saber qué usuarios existen en el dominio.',
              mood: 'focused'
            },
            {
              character: 'ZERO',
              text: 'impacket-GetADUsers es perfecto para esto.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Usuarios encontrados: Administrator, BS-Admin, svc_backup, svc_sql...',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'BS-Admin suena a Domain Admin. Ese es nuestro objetivo final.',
              mood: 'alert'
            },
            {
              character: 'ZERO',
              text: 'svc_sql es una cuenta de servicio. Perfecto para Kerberoasting.',
              mood: 'excited'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'impacket-GetADUsers -dc-ip 10.10.10.100 blacksphere.local/svc_backup:Backup2024!',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 5: KERBEROASTING
      // ══════════════════════════════════════════════════════════════
      {
        code: 'KERBEROAST_ATTACK',
        description: 'Ejecuta ataque de Kerberoasting',
        hint: 'impacket-GetUserSPNs con -request obtiene TGS tickets',
        category: 'attack',
        traceImpact: 20,
        phase: 5,
        acceptedCommands: ['impacket-GetUserSPNs'],
        successCondition: {
          type: 'command_with_flag',
          command: 'impacket-GetUserSPNs',
          flags: ['-request']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Kerberoasting: solicitar tickets de servicio y crackearlos offline.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'Las cuentas de servicio suelen tener contraseñas débiles.',
              mood: 'analytical'
            },
            {
              character: 'SALLY',
              text: 'impacket-GetUserSPNs con -request te da los hashes.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡HASH CAPTURADO! $krb5tgs$23$*svc_sql$BLACKSPHERE.LOCAL$...',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Ticket TGS de svc_sql. Ahora a crackearlo.',
              mood: 'excited'
            },
            {
              character: 'SALLY',
              text: 'Hash guardado en /tmp/hashes.txt automáticamente.',
              mood: 'helpful'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'impacket-GetUserSPNs -dc-ip 10.10.10.100 blacksphere.local/svc_backup:Backup2024! -request',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'CRACK_KERBEROS_HASH',
        description: 'Crackea el hash de Kerberos',
        hint: 'hashcat con modo 13100 para Kerberos 5 TGS',
        category: 'password_cracking',
        traceImpact: 0,
        phase: 5,
        acceptedCommands: ['hashcat', 'john'],
        successCondition: {
          type: 'crack_hash',
          hashType: 'kerberos',
          commands: ['hashcat', 'john']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Cracking offline. No genera trace porque es en tu máquina.',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'hashcat -m 13100 para hashes Kerberos TGS.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡CRACKEADO! svc_sql : SqlServer2024!',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Otra cuenta comprometida. Veamos qué privilegios tiene.',
              mood: 'pleased'
            },
            {
              character: 'VIPER',
              text: 'No está mal. Pero el DC sigue en pie.',
              mood: 'mocking'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'hashcat -m 13100 /tmp/hashes.txt /usr/share/wordlists/rockyou.txt',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 6: MOVIMIENTO LATERAL
      // ══════════════════════════════════════════════════════════════
      {
        code: 'TEST_SQL_CREDS',
        description: 'Valida las credenciales de svc_sql',
        hint: 'crackmapexec para verificar acceso',
        category: 'credential_validation',
        traceImpact: 12,
        phase: 6,
        acceptedCommands: ['crackmapexec', 'cme'],
        successCondition: {
          type: 'command_with_creds',
          user: 'svc_sql',
          pass: 'SqlServer2024!'
        },
        dialogue: {
          intro: [
            {
              character: 'SALLY',
              text: 'Probemos las nuevas credenciales. ¿Tiene más acceso que svc_backup?',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'svc_sql tiene acceso a más shares... incluyendo ADMIN$ en un servidor.',
              mood: 'alert'
            },
            {
              character: 'ZERO',
              text: 'ADMIN$ significa privilegios administrativos locales. Podemos ejecutar código.',
              mood: 'excited'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'crackmapexec smb 10.10.10.100 -u svc_sql -p "SqlServer2024!"',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 7: COMPROMISO DEL DC
      // ══════════════════════════════════════════════════════════════
      {
        code: 'PSEXEC_TO_DC',
        description: 'Obtén shell en el Domain Controller',
        hint: 'impacket-psexec para ejecución remota',
        category: 'remote_execution',
        traceImpact: 35,
        phase: 7,
        acceptedCommands: ['impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec'],
        successCondition: {
          type: 'remote_shell',
          commands: ['impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec'],
          target: '10.10.10.100'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Momento de la verdad. Shell en el DC.',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'impacket-psexec te da ejecución remota con privilegios SYSTEM.',
              mood: 'teaching'
            },
            {
              character: 'SALLY',
              text: 'Esto generará MUCHO trace. Prepárate.',
              mood: 'warning'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡SHELL OBTENIDA! C:\\Windows\\system32>',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Estamos en el Domain Controller. Privilegios NT AUTHORITY\\SYSTEM.',
              mood: 'impressed'
            },
            {
              character: 'BOSS',
              text: 'Excelente. Ahora extrae todo.',
              mood: 'satisfied'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'impacket-psexec blacksphere.local/svc_sql:SqlServer2024!@10.10.10.100',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 8: EXTRACCIÓN DE SECRETOS
      // ══════════════════════════════════════════════════════════════
      {
        code: 'DUMP_DOMAIN_SECRETS',
        description: 'Extrae todos los secretos del dominio',
        hint: 'secretsdump.py extrae hashes NTLM de todo el dominio',
        category: 'credential_extraction',
        traceImpact: 45,
        phase: 8,
        acceptedCommands: ['impacket-secretsdump'],
        successCondition: {
          type: 'dump_secrets',
          command: 'impacket-secretsdump'
        },
        dialogue: {
          intro: [
            {
              character: 'BOSS',
              text: 'Quiero TODO. Cada hash, cada secreto.',
              mood: 'demanding'
            },
            {
              character: 'ZERO',
              text: 'secretsdump extrae NTDS.dit, SAM, LSA secrets... Todo.',
              mood: 'serious'
            },
            {
              character: 'SALLY',
              text: 'Esto va a generar alertas. Hazlo rápido.',
              mood: 'urgent'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡JACKPOT! Hashes de Administrator, BS-Admin, krbtgt...',
              mood: 'ecstatic'
            },
            {
              character: 'SALLY',
              text: 'El hash de krbtgt significa que podemos crear Golden Tickets.',
              mood: 'impressed'
            },
            {
              character: 'ZERO',
              text: 'Control total del dominio. Misión cumplida.',
              mood: 'triumphant'
            },
            {
              character: 'BOSS',
              text: 'Perfecto. BlackSphere es nuestro.',
              mood: 'satisfied'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'impacket-secretsdump blacksphere.local/svc_sql:SqlServer2024!@10.10.10.100',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // OBJETIVO SECRETO: GOLDEN TICKET
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CREATE_GOLDEN_TICKET',
        description: '[SECRETO] Crea un Golden Ticket para persistencia',
        hint: 'Con el hash de krbtgt puedes crear tickets eternos',
        category: 'persistence',
        traceImpact: 30,
        phase: 9,
        isHidden: true,
        bonusXp: 300,
        acceptedCommands: ['impacket-ticketer', 'mimikatz'],
        successCondition: {
          type: 'golden_ticket',
          commands: ['ticketer', 'mimikatz']
        },
        dialogue: {
          onSuccess: [
            {
              character: 'ZERO',
              text: 'Golden Ticket creado. Acceso permanente al dominio.',
              mood: 'impressed'
            },
            {
              character: 'VIPER',
              text: 'Ahora ESO es thinking ahead. Me agradas.',
              mood: 'genuinely_impressed'
            },
            {
              character: 'BOSS',
              text: 'Persistencia establecida. Este dominio es nuestro... para siempre.',
              mood: 'satisfied'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // DILEMA ÉTICO: ¿QUÉ HACER CON EL PODER?
      // ══════════════════════════════════════════════════════════════
      {
        code: 'DISCOVER_DARK_SECRET',
        description: '[NARRATIVO] Descubres información perturbadora',
        hint: 'Los archivos del admin revelan la verdad sobre BlackSphere',
        category: 'narrative',
        traceImpact: 10,
        phase: 9,
        isOptional: true,
        acceptedCommands: ['cat', 'less', 'find'],
        triggersEvent: 'MORAL_REVELATION',
        successCondition: {
          type: 'discover_secret',
          paths: ['/Users/Administrator/Documents/', 'C:\\Users\\BS-Admin\\']
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Shadow... estás viendo esto?',
              mood: 'shocked'
            },
            {
              character: 'SALLY',
              text: 'BlackSphere no es lo que parece. Estos documentos...',
              mood: 'disturbed'
            },
            {
              character: 'ZERO',
              text: 'Contratos con agencias gubernamentales. Vigilancia masiva.',
              mood: 'serious'
            },
            {
              character: 'ZERO',
              text: 'Estábamos robando a los malos... o eso creíamos.',
              mood: 'conflicted'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 65,
      criticalThreshold: 85,
      ethicalTracking: true
    },
    
    allowedCommands: [
      'cat', 'less', 'more', 'head', 'tail', 'find', 'grep',
      'ls', 'cd', 'pwd', 'echo',
      'ping', 'nmap',
      'crackmapexec', 'cme', 'smbclient', 'smbmap',
      'impacket-GetADUsers', 'impacket-GetUserSPNs', 
      'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec',
      'impacket-secretsdump', 'impacket-ticketer',
      'hashcat', 'john',
      'clear', 'help', 'whoami', 'id'
    ],
    
    requiredNodeNumber: 4,
    
    introDialog: [
      { 
        character: 'BOSS', 
        text: 'La investigación del traidor reveló algo más grande.', 
        mood: 'serious' 
      },
      { 
        character: 'BOSS', 
        text: 'BlackSphere Corporation. Ellos son el verdadero objetivo.', 
        mood: 'cold' 
      },
      { 
        character: 'SALLY', 
        text: 'Usan Active Directory. Dominio: BLACKSPHERE.LOCAL.', 
        mood: 'analytical' 
      },
      { 
        character: 'SALLY', 
        text: 'Tenemos credenciales iniciales: svc_backup / Backup2024!', 
        mood: 'focused' 
      },
      { 
        character: 'ZERO', 
        text: 'AD es complejo pero tiene debilidades conocidas.', 
        mood: 'teaching' 
      },
      { 
        character: 'ZERO', 
        text: 'Kerberoasting, Pass-the-Hash, DCSync... Te enseñaré el camino.', 
        mood: 'confident' 
      },
      {
        character: 'VIPER',
        text: 'Finalmente algo interesante. Intenta no decepcionarme.',
        mood: 'mocking'
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'SALLY',
        text: 'Dominio completamente comprometido. Todos los hashes extraídos.',
        mood: 'triumphant'
      },
      {
        character: 'ZERO',
        text: 'Impresionante. Has dominado técnicas de AD avanzadas.',
        mood: 'proud'
      },
      {
        character: 'BOSS',
        text: 'BlackSphere es nuestro. Pero esto es solo el comienzo.',
        mood: 'calculating'
      },
      {
        character: 'BOSS',
        text: 'Hay alguien que quiere conocerte. Alguien que ha estado observando.',
        mood: 'ominous'
      },
      {
        character: 'VIPER',
        text: 'El Boss habla de él. Prepárate, Shadow. La verdadera prueba viene.',
        mood: 'serious'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'SALLY',
        text: 'El SOC de BlackSphere detectó la intrusión. Aislaron el DC.',
        mood: 'disappointed'
      },
      {
        character: 'ZERO',
        text: 'Demasiado ruido. Active Directory requiere precisión.',
        mood: 'serious'
      },
      {
        character: 'BOSS',
        text: 'Perdimos nuestra ventana. Esto tendrá consecuencias.',
        mood: 'furious'
      }
    ],
    
    specialDialogue: {
      MORAL_REVELATION: [
        {
          character: 'ZERO',
          text: 'Shadow... lo que encontramos cambia todo.',
          mood: 'conflicted'
        },
        {
          character: 'SALLY',
          text: 'BlackSphere trabaja para gobiernos. Vigilancia, censura, control.',
          mood: 'disturbed'
        },
        {
          character: 'ZERO',
          text: '¿Somos los buenos? ¿O solo somos herramientas de otros?',
          mood: 'philosophical'
        }
      ]
    }
  },
});


// ═══════════════════════════════════════════════════════════════════════════════
// MISIÓN 6: EL PUNTO DE QUIEBRE (Boss Fight - Confrontación con VIPER)
// ═══════════════════════════════════════════════════════════════════════════════
// COPIAR ESTE BLOQUE Y REEMPLAZAR LA MISIÓN 6 EXISTENTE EN seed.ts

const mission6 = await prisma.mission.create({
  data: {
    nodeNumber: 6,
    sequenceOrder: 6,
    title: 'El Punto de Quiebre',
    description: 'VIPER ha traicionado a la organización. Está en el mismo servidor que tú. Solo uno saldrá victorioso.',
    difficulty: Difficulty.EXPERT,
    arc: 2,
    npcId: npcBoss.id,
    briefing: `ALERTA MÁXIMA.

VIPER nos traicionó. Vendió información de BlackSphere a nuestros enemigos y ahora intenta borrar todas las pruebas.

Ambos están en el mismo servidor comprometido. Es una carrera: quien obtenga root primero, gana. Quien pierda... desaparece.

Tienes una ventaja: empiezas con una cuenta de usuario estándar. VIPER está buscando el mismo vector de escalación que tú.

El servidor tiene un binario SUID vulnerable. Encuéntralo, explótalo, conviértete en root.

Luego elimina a VIPER del sistema.

Esto es personal.`,
    xpReward: 2000,
    creditsReward: 500,
    isPremium: true,
    estimatedTime: 35,
    tags: ['boss-fight', 'privilege-escalation', 'competition', 'pvp', 'final'],
    isReplayable: true,
    minObjectives: 6,
    maxObjectives: 8,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════════════
      // FASE 1: RECONOCIMIENTO INICIAL
      // ══════════════════════════════════════════════════════════════
      {
        code: 'ASSESS_SITUATION',
        description: 'Evalúa tu situación actual',
        hint: 'whoami, id, pwd - conoce tu posición',
        category: 'reconnaissance',
        traceImpact: 2,
        phase: 1,
        acceptedCommands: ['whoami', 'id', 'pwd'],
        successCondition: {
          type: 'orientation',
          commands: ['whoami', 'id']
        },
        dialogue: {
          intro: [
            {
              character: 'BOSS',
              text: 'VIPER nos traicionó. Está en el mismo servidor que tú.',
              mood: 'furious'
            },
            {
              character: 'BOSS',
              text: 'Esto es una carrera. El primero en conseguir root, gana.',
              mood: 'cold'
            },
            {
              character: 'SALLY',
              text: 'Evalúa tu posición primero. ¿Quién eres? ¿Dónde estás?',
              mood: 'urgent'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Usuario estándar, sin privilegios especiales. Necesitas escalar.',
              mood: 'analytical'
            },
            {
              character: 'VIPER',
              text: '¿También aquí, Shadow? Qué conveniente. Que gane el mejor.',
              mood: 'mocking'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'whoami o id - rápido, VIPER ya está trabajando.',
              mood: 'urgent'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 2: BÚSQUEDA DE VECTORES DE ESCALACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'CHECK_SUDO_RIGHTS',
        description: 'Verifica tus permisos de sudo',
        hint: 'sudo -l muestra qué puedes ejecutar como root',
        category: 'privilege_check',
        traceImpact: 8,
        phase: 2,
        acceptedCommands: ['sudo'],
        successCondition: {
          type: 'command_with_flag',
          command: 'sudo',
          flags: ['-l']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Primer vector: sudo. Verifica si tienes permisos especiales.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡Tienes permiso de ejecutar /usr/bin/python3 como root!',
              mood: 'alert'
            },
            {
              character: 'ZERO',
              text: 'Python con sudo... eso es un vector de escalación conocido.',
              mood: 'excited'
            },
            {
              character: 'VIPER',
              text: 'También vi eso. La pregunta es quién lo explota primero.',
              mood: 'threatening'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'sudo -l - lista tus permisos.',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'FIND_SUID_BINARIES',
        description: 'Busca binarios SUID vulnerables',
        hint: 'find con -perm -4000 encuentra SUID',
        category: 'vulnerability_scan',
        traceImpact: 12,
        phase: 2,
        acceptedCommands: ['find'],
        successCondition: {
          type: 'command_with_flag',
          command: 'find',
          patterns: ['-perm -4000', '-perm -u=s', '-perm /4000']
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Segundo vector: binarios SUID. Si un binario vulnerable tiene SUID...',
              mood: 'teaching'
            },
            {
              character: 'ZERO',
              text: 'find / -perm -4000 2>/dev/null lista todos los SUID.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '/usr/bin/python3.8 tiene SUID activado. ¡Doble vector!',
              mood: 'excited'
            },
            {
              character: 'ZERO',
              text: 'Sudo + SUID en Python. Múltiples caminos a root.',
              mood: 'pleased'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'find / -perm -4000 -type f 2>/dev/null',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 3: EXPLOTACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'EXPLOIT_PYTHON_SUDO',
        description: 'Explota Python para obtener root',
        hint: 'Python puede spawnear una shell',
        category: 'exploitation',
        traceImpact: 20,
        phase: 3,
        acceptedCommands: ['sudo'],
        successCondition: {
          type: 'exploit_sudo',
          command: 'sudo',
          binary: 'python',
          shellspawn: true
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Es hora. sudo python3 -c \'import os; os.system("/bin/bash")\'',
              mood: 'serious'
            },
            {
              character: 'SALLY',
              text: 'Python ejecuta código arbitrario. Spawneamos bash como root.',
              mood: 'focused'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡ROOT OBTENIDO! El prompt cambió a #',
              mood: 'triumphant'
            },
            {
              character: 'ZERO',
              text: 'Eres root. Ahora viene la parte difícil.',
              mood: 'serious'
            },
            {
              character: 'VIPER',
              text: '¡NO! Llegaste primero... pero esto no ha terminado.',
              mood: 'furious'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'sudo /usr/bin/python3 -c \'import os; os.system("/bin/bash")\'',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'VERIFY_ROOT',
        description: 'Confirma que eres root',
        hint: 'whoami o id para verificar',
        category: 'verification',
        traceImpact: 2,
        phase: 3,
        acceptedCommands: ['whoami', 'id'],
        successCondition: {
          type: 'verify_privilege',
          expectedUser: 'root'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Verifica que realmente eres root.',
              mood: 'cautious'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'uid=0(root) gid=0(root). Confirmado. Eres el dueño del sistema.',
              mood: 'satisfied'
            },
            {
              character: 'BOSS',
              text: 'Bien. Ahora encárgate de VIPER.',
              mood: 'cold'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'whoami - simple pero necesario.',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 4: CAZA DE VIPER
      // ══════════════════════════════════════════════════════════════
      {
        code: 'LOCATE_VIPER_PROCESS',
        description: 'Encuentra el proceso de VIPER',
        hint: 'ps aux | grep viper',
        category: 'process_hunt',
        traceImpact: 5,
        phase: 4,
        acceptedCommands: ['ps', 'pgrep', 'top'],
        successCondition: {
          type: 'find_process',
          pattern: 'viper'
        },
        dialogue: {
          intro: [
            {
              character: 'BOSS',
              text: 'VIPER sigue conectado. Encuéntralo.',
              mood: 'demanding'
            },
            {
              character: 'SALLY',
              text: 'ps aux para ver todos los procesos. Busca su sesión.',
              mood: 'analytical'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Proceso encontrado: viper PID 1337, corriendo desde /home/viper.',
              mood: 'alert'
            },
            {
              character: 'VIPER',
              text: 'Ya me viste. Pero matarme no será tan fácil.',
              mood: 'defiant'
            },
            {
              character: 'ZERO',
              text: 'Tiene procesos activos. Hay que terminarlos todos.',
              mood: 'focused'
            }
          ],
          onError: [
            {
              character: 'SALLY',
              text: 'ps aux | grep viper',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'KILL_VIPER_SESSION',
        description: 'Termina la sesión de VIPER',
        hint: 'kill -9 para terminar procesos',
        category: 'elimination',
        traceImpact: 15,
        phase: 4,
        acceptedCommands: ['kill', 'pkill', 'killall'],
        successCondition: {
          type: 'kill_process',
          target: 'viper'
        },
        dialogue: {
          intro: [
            {
              character: 'BOSS',
              text: 'Termínalo. kill -9.',
              mood: 'cold'
            },
            {
              character: 'ZERO',
              text: 'kill -9 fuerza la terminación. Sin piedad.',
              mood: 'serious'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Procesos de VIPER terminados. Su sesión cayó.',
              mood: 'satisfied'
            },
            {
              character: 'VIPER',
              text: '...No... esto no puede...',
              mood: 'defeated'
            },
            {
              character: 'BOSS',
              text: 'Silencio. Por fin.',
              mood: 'satisfied'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'kill -9 1337 o pkill -u viper',
              mood: 'hint'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // FASE 5: LIMPIEZA Y DOMINACIÓN
      // ══════════════════════════════════════════════════════════════
      {
        code: 'LOCK_VIPER_ACCOUNT',
        description: 'Bloquea la cuenta de VIPER permanentemente',
        hint: 'passwd -l o usermod -L bloquea cuentas',
        category: 'lockout',
        traceImpact: 10,
        phase: 5,
        acceptedCommands: ['passwd', 'usermod', 'chage'],
        successCondition: {
          type: 'lock_account',
          commands: ['passwd -l', 'usermod -L'],
          target: 'viper'
        },
        dialogue: {
          intro: [
            {
              character: 'ZERO',
              text: 'Mataste su sesión, pero podría reconectarse.',
              mood: 'cautious'
            },
            {
              character: 'ZERO',
              text: 'Bloquea su cuenta. passwd -l viper.',
              mood: 'teaching'
            }
          ],
          onSuccess: [
            {
              character: 'SALLY',
              text: 'Cuenta bloqueada. VIPER no puede volver a entrar.',
              mood: 'satisfied'
            },
            {
              character: 'ZERO',
              text: 'Dominación completa. El sistema es tuyo.',
              mood: 'impressed'
            }
          ],
          onError: [
            {
              character: 'ZERO',
              text: 'passwd -l viper - bloquea la cuenta.',
              mood: 'hint'
            }
          ]
        }
      },

      {
        code: 'READ_VIPER_SECRETS',
        description: '[BONUS] Lee los archivos secretos de VIPER',
        hint: 'Su directorio home puede tener información valiosa',
        category: 'intelligence',
        traceImpact: 8,
        phase: 5,
        isOptional: true,
        bonusXp: 200,
        acceptedCommands: ['cat', 'less', 'find', 'ls'],
        successCondition: {
          type: 'read_secrets',
          path: '/home/viper/'
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: '¡VIPER tenía un archivo de contactos! Lista de compradores...',
              mood: 'shocked'
            },
            {
              character: 'SALLY',
              text: 'Nombres, precios, fechas... Esto es dinamita.',
              mood: 'impressed'
            },
            {
              character: 'BOSS',
              text: 'Excelente. Esos contactos nos serán... útiles.',
              mood: 'calculating'
            }
          ]
        }
      },

      // ══════════════════════════════════════════════════════════════
      // DILEMA FINAL: ¿QUÉ HACER CON LA INFORMACIÓN?
      // ══════════════════════════════════════════════════════════════
      {
        code: 'REPORT_EVERYTHING',
        description: '[LEAL] Reporta todo al Boss',
        hint: 'Envía los archivos de VIPER al servidor del Boss',
        category: 'final_choice',
        traceImpact: 5,
        phase: 6,
        ethicalChoice: 'loyal',
        acceptedCommands: ['scp', 'rsync'],
        successCondition: {
          type: 'exfiltrate',
          destination: 'boss'
        },
        dialogue: {
          onSuccess: [
            {
              character: 'BOSS',
              text: 'Lealtad. Es lo que más valoro.',
              mood: 'pleased'
            },
            {
              character: 'BOSS',
              text: 'Has demostrado ser más que un simple hacker.',
              mood: 'impressed'
            },
            {
              character: 'ZERO',
              text: 'Bien hecho, Shadow. Elegiste el camino correcto.',
              mood: 'proud'
            }
          ]
        }
      },

      {
        code: 'KEEP_LEVERAGE',
        description: '[INDEPENDIENTE] Guarda información como seguro',
        hint: 'Copia los archivos a tu propio servidor',
        category: 'final_choice',
        traceImpact: 15,
        phase: 6,
        ethicalChoice: 'independent',
        isHidden: true,
        acceptedCommands: ['scp', 'cp', 'rsync'],
        successCondition: {
          type: 'exfiltrate',
          destination: 'personal'
        },
        dialogue: {
          onSuccess: [
            {
              character: 'SALLY',
              text: '¿Shadow? ¿Estás guardando una copia para ti?',
              mood: 'surprised'
            },
            {
              character: 'ZERO',
              text: 'Interesante movimiento. El Boss no sabrá de esto.',
              mood: 'cautious'
            },
            {
              character: 'ZERO',
              text: 'Espero que sepas lo que haces. Tener leverage es peligroso.',
              mood: 'warning'
            }
          ]
        }
      },

      {
        code: 'SPARE_VIPER',
        description: '[MISERICORDIOSO] Deja un backdoor para VIPER',
        hint: 'Crea una cuenta oculta que VIPER pueda usar',
        category: 'final_choice',
        traceImpact: 25,
        phase: 6,
        ethicalChoice: 'merciful',
        isHidden: true,
        acceptedCommands: ['useradd', 'adduser'],
        successCondition: {
          type: 'create_backdoor',
          forUser: 'viper'
        },
        dialogue: {
          onSuccess: [
            {
              character: 'VIPER',
              text: '...¿Por qué? ¿Por qué me dejas una salida?',
              mood: 'confused'
            },
            {
              character: 'ZERO',
              text: 'Shadow... no esperaba esto de ti.',
              mood: 'surprised'
            },
            {
              character: 'SALLY',
              text: 'Esto es arriesgado. Si el Boss se entera...',
              mood: 'worried'
            },
            {
              character: 'VIPER',
              text: 'No olvidaré esto. Quizás algún día... nos volvamos a ver.',
              mood: 'grateful'
            }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 60,
      criticalThreshold: 80,
      competitionMode: true,
      viperActions: true,
      multipleEndings: true
    },
    
    allowedCommands: [
      'whoami', 'id', 'pwd', 'uname',
      'ls', 'cd', 'cat', 'less', 'find', 'grep', 'echo',
      'ps', 'top', 'kill', 'pkill', 'killall',
      'sudo', 'su',
      'passwd', 'usermod', 'useradd', 'adduser', 'chage',
      'scp', 'rsync', 'cp', 'mv', 'rm',
      'netstat', 'ss', 'who', 'w', 'last',
      'python', 'python3',
      'clear', 'help', 'history'
    ],
    
    requiredNodeNumber: 5,
    
    introDialog: [
      { 
        character: 'BOSS', 
        text: 'CÓDIGO ROJO.', 
        mood: 'furious' 
      },
      { 
        character: 'BOSS', 
        text: 'VIPER nos traicionó. Vendió los datos de BlackSphere a nuestros enemigos.', 
        mood: 'cold' 
      },
      { 
        character: 'SALLY', 
        text: 'Lo rastreamos. Está en el mismo servidor que tú.', 
        mood: 'urgent' 
      },
      { 
        character: 'SALLY', 
        text: 'Está intentando borrar evidencia y escapar.', 
        mood: 'analytical' 
      },
      { 
        character: 'ZERO', 
        text: 'El servidor tiene un vector de escalación. Python con SUID.', 
        mood: 'focused' 
      },
      { 
        character: 'ZERO', 
        text: 'Quien llegue a root primero, controla el servidor.', 
        mood: 'serious' 
      },
      { 
        character: 'BOSS', 
        text: 'Encuentra a VIPER. Elimínalo del sistema. Permanentemente.', 
        mood: 'demanding' 
      },
      {
        character: 'VIPER',
        text: 'Ah, Shadow. Sabía que vendrías. Que gane el mejor.',
        mood: 'mocking'
      }
    ],
    
    outroDialogSuccess: [
      {
        character: 'BOSS',
        text: 'VIPER ha sido neutralizado. El sistema es nuestro.',
        mood: 'satisfied'
      },
      {
        character: 'SALLY',
        text: 'Todos sus procesos terminados, cuenta bloqueada.',
        mood: 'relieved'
      },
      {
        character: 'ZERO',
        text: 'Shadow... lo que hiciste hoy... fue impresionante.',
        mood: 'proud'
      },
      {
        character: 'ZERO',
        text: 'Has recorrido un largo camino desde Protocolo Génesis.',
        mood: 'nostalgic'
      },
      {
        character: 'BOSS',
        text: 'Has demostrado tu valor. Bienvenido al círculo interno.',
        mood: 'approving'
      },
      {
        character: 'BOSS',
        text: 'Pero recuerda: en este mundo, la lealtad es todo.',
        mood: 'warning'
      }
    ],
    
    outroDialogFailure: [
      {
        character: 'VIPER',
        text: '¡JA! Demasiado lento, Shadow.',
        mood: 'triumphant'
      },
      {
        character: 'VIPER',
        text: 'Ahora el sistema es mío. Y tú... ya no me sirves.',
        mood: 'cold'
      },
      {
        character: 'SALLY',
        text: '¡Shadow, sal de ahí! VIPER tiene root!',
        mood: 'panicked'
      },
      {
        character: 'ZERO',
        text: 'Perdimos. VIPER ganó esta batalla.',
        mood: 'defeated'
      },
      {
        character: 'BOSS',
        text: 'Decepcionante. Muy decepcionante.',
        mood: 'cold'
      }
    ],
    
    specialDialogue: {
      VIPER_TAUNTS: [
        {
          trigger: 'every_60_seconds',
          dialogues: [
            {
              character: 'VIPER',
              text: 'Tic tac, Shadow. ¿Ya encontraste el vector?',
              mood: 'mocking'
            },
            {
              character: 'VIPER',
              text: 'Estoy tan cerca... puedo oler el root.',
              mood: 'taunting'
            },
            {
              character: 'VIPER',
              text: 'El Boss te eligió a ti sobre mí. Error.',
              mood: 'bitter'
            },
            {
              character: 'VIPER',
              text: 'Cuando tenga root, serás el primero en caer.',
              mood: 'threatening'
            }
          ]
        }
      ],
      VIPER_NEAR_WIN: [
        {
          character: 'SALLY',
          text: '¡ALERTA! VIPER está cerca de conseguir root.',
          mood: 'panicked'
        },
        {
          character: 'ZERO',
          text: '¡Muévete! No hay tiempo que perder.',
          mood: 'urgent'
        }
      ],
      PLAYER_GETS_ROOT_FIRST: [
        {
          character: 'VIPER',
          text: '¡NO! ¡Imposible!',
          mood: 'shocked'
        },
        {
          character: 'BOSS',
          text: 'Bien. Ahora termina el trabajo.',
          mood: 'cold'
        }
      ]
    },
    
    competitionConfig: {
      viperStartDelay: 30,
      viperSkillLevel: 0.7,
      viperProgressEvents: true,
      viperCanWin: true,
      viperWinCondition: 'root_access',
      playerWinCondition: 'eliminate_viper'
    },
    
    narrativeEvents: [
      {
        trigger: 'player_gets_root',
        dialogue: [
          {
            character: 'VIPER',
            text: '¡Maldición! Llegaste primero...',
            mood: 'frustrated'
          }
        ]
      },
      {
        trigger: 'viper_near_root',
        dialogue: [
          {
            character: 'SALLY',
            text: '¡VIPER está a punto de conseguir root! ¡Date prisa!',
            mood: 'panicked'
          }
        ]
      }
    ],
    
    epilogue: {
      loyal: [
        {
          character: 'BOSS',
          text: 'La organización te debe mucho, Shadow.',
          mood: 'pleased'
        },
        {
          character: 'BOSS',
          text: 'Tengo planes más grandes para ti.',
          mood: 'calculating'
        }
      ],
      independent: [
        {
          character: 'ZERO',
          text: 'Vi lo que hiciste. Tu secreto está seguro conmigo.',
          mood: 'conspiratorial'
        },
        {
          character: 'ZERO',
          text: 'Pero ten cuidado. El Boss tiene ojos en todas partes.',
          mood: 'warning'
        }
      ],
      merciful: [
        {
          character: 'VIPER',
          text: 'Algún día entenderás por qué hice lo que hice.',
          mood: 'cryptic'
        },
        {
          character: 'VIPER',
          text: 'El Boss no es quien crees que es.',
          mood: 'ominous'
        }
      ]
    }
  },
});
// ═════════════════════════════════════════════════════════
// ACTUALIZAR PROGRESO DEL USUARIO
// ═════════════════════════════════════════════════════════
console.log('📊 Inicializando progreso del usuario Beta...');

const allMissions = [mission0, mission1, mission2, mission3, mission4, mission5, mission6];

for (const mission of allMissions) {
  await prisma.missionProgress.create({
    data: {
      userId: testUser.id,
      missionId: mission.id,
      isCompleted: false,
      isInProgress: false,
      attempts: 0,
      bestTime: null,
      bestTrace: 100,
    },
  });
}

console.log(`✅ Progreso inicializado para ${allMissions.length} misiones.\n`);

// ═════════════════════════════════════════════════════════
// RESUMEN FINAL
// ═════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════════');
console.log('                    🎉 SEED COMPLETADO 🎉');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`📧 Email: ${testUser.email}`);
console.log(`🔑 Password: shadow2025`);
console.log(`🎯 Misiones: ${allMissions.length}`);
console.log('');
console.log('📋 ARCO 1: EL DESPERTAR');
console.log('───────────────────────────────────────────────────────────────');
console.log('   M0: Protocolo Génesis       [TUTORIAL]  - Comandos básicos');
console.log('   M1: Sombra Digital          [EASY]      - Reconocimiento red');
console.log('   M2: Infiltración Básica     [EASY]      - Navegación sistema');
console.log('   M3: Fuga de Datos           [MEDIUM]    - Exfiltración + Timer');
console.log('   M4: Interceptación Señales  [MEDIUM]    - Análisis tráfico (NUEVA)');
console.log('   M5: Dominio Oscuro          [HARD]      - Active Directory (MEJORADA)');
console.log('   M6: El Punto de Quiebre     [EXPERT]    - Boss Fight vs VIPER');
console.log('───────────────────────────────────────────────────────────────');
console.log('');
console.log('📈 CURVA DE APRENDIZAJE:');
console.log('   M0-M2: Fundamentos Linux (whoami, ls, cd, find, cat)');
console.log('   M3:    Operaciones bajo presión (cp, scp, rm, timer)');
console.log('   M4:    Análisis de red (tcpdump, netstat, lsof, strings)');
console.log('   M5:    Ataques Windows/AD (nmap, impacket, crackmapexec)');
console.log('   M6:    Privesc Linux + competencia (sudo, SUID, exploits)');
console.log('');
console.log('🎭 NARRATIVA:');
console.log('   - VIPER aparece desde M1, intensifica en M5, clímax en M6');
console.log('   - Dilemas éticos en M4 (reportar vs chantajear)');
console.log('   - Foreshadowing de BlackSphere conecta M4 → M5');
console.log('   - Eventos de detección con probabilidad en M5');
console.log('');
console.log('═══════════════════════════════════════════════════════════════\n');

}

main()
  .catch((e) => {
    console.error('\n❌ ERROR EN SEED BETA:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });