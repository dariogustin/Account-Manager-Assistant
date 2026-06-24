/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Solution, SectorData } from "./types";

export const PORTFOLIO_SOLUTIONS: Solution[] = [
  {
    id: "colaboracion",
    name: "Colaboración",
    category: "Colaboracion",
    brandAssociation: "Avaya / Teams / Yealink",
    description: "Sistemas de telefonía IP PBX tradicionales y en la nube con troncales SIP, integrando salas híbridas modernas con Microsoft Teams y Zoom.",
    keyBenefits: [
      "Reducción sustancial de costos telefónicos de larga distancia",
      "IVR automatizado que clasifica llamadas eficientemente hacia áreas de negocio",
      "Continuidad operativa absoluta ante fallos de conectividad física"
    ]
  },
  {
    id: "ciberseguridad",
    name: "Ciberseguridad",
    category: "Seguridad",
    brandAssociation: "Fortinet Authorized Channel",
    description: "Protección perimetral FortiGate, SD-WAN seguro, seguridad de APIs y bases de datos críticas, respaldado por un NGSOC gestionado 24/7.",
    keyBenefits: [
      "Monitoreo proactivo continuo contra ransomware y robo de información comercial",
      "Ingenieros especializados dedicados a la mitigación de brechas en tiempo real",
      "SD-WAN robusto para la interconectividad cifrada de sucursales"
    ]
  },
  {
    id: "ia",
    name: "IA",
    category: "IA",
    brandAssociation: "S&S AI Engine",
    description: "Consultoría de madurez digital, desarrollo de asistentes virtuales entrenados con datos del cliente y automatización de procesos (RPA + IA).",
    keyBenefits: [
      "Reducción de procesos operativos manuales de oficina",
      "Diagnóstico preciso de la madurez digital corporativa",
      "Agentes conversacionales inteligentes con modelos de lenguaje integrados"
    ]
  }
];

export const TARGET_SECTORS: SectorData[] = [
  {
    id: "salud",
    name: "Sector Salud",
    emoji: "🏥",
    gradient: "from-blue-600 to-cyan-500",
    representativePains: [
      "Fuga de datos médicos privados o historiales clínicos de pacientes",
      "Caídas críticas imprevistas de los servidores de ERP y software de historias clínicas",
      "Alta saturación, desconexiones y latencia en las redes Wi-Fi de salas de urgencias y pasillos hospitalarios",
      "Saturación de canales telefonía e ineficiente omnicanalidad para atención y asignación de citas médicas",
      "Complejas auditorías y severas normativas colombianas de seguridad de la información hospitalaria"
    ],
    contacts: [
      {
        name: "German Mazuera",
        role: "Gerente de TI",
        company: "Tecnoquímicas",
        painsContext: "Alta demanda en administración de red logística farmacéutica y seguridad perimetral de datos sensibles."
      },
      {
        name: "Angel Ruiz",
        role: "Administrador de Data Center",
        company: "Fundación Valle del Lili / FVL",
        painsContext: "Requisitos de conectividad impecable y redundante para servidores de historias clínicas y red Wi-Fi para alta densidad de especialistas."
      },
      {
        name: "Fernando Carvajal",
        role: "Coordinador de TI",
        company: "Club Noel",
        painsContext: "Atención ágil a familias de pacientes infantiles, saturación en la asignación de citas y necesidad de robustecer telefonía IP."
      }
    ]
  },
  {
    id: "financiero",
    name: "Sector Financiero",
    emoji: "💳",
    gradient: "from-emerald-600 to-teal-500",
    representativePains: [
      "Riesgo latente de ataques de fraude electrónico o ransomware en plataformas transaccionales",
      "Caídas imprevistas y latencia de conexión en la red LAN dedicada a las sucursales bancarias",
      "Decisiones y comités de adquisiciones de infraestructura de conectividad complejos y lentos",
      "Dificultades para cumplir con la regulación estricta en cifrado de datos financieros con múltiples factores de autenticación (MFA)"
    ],
    contacts: [
      {
        name: "Alexandra Martínez",
        role: "Especialista de Redes & Telecomunicaciones",
        company: "Banco de Occidente",
        painsContext: "Migración de arquitecturas heredadas complejas a SD-WAN segura y estabilidad estricta en sucursales a nivel nacional."
      }
    ]
  },
  {
    id: "educacion",
    name: "Educación & Universidades",
    emoji: "🎓",
    gradient: "from-indigo-600 to-purple-500",
    representativePains: [
      "Inestabilidad masiva de la red inalámbrica Wi-Fi por alta densidad de conexiones de estudiantes en campus",
      "Ciberataques en épocas de matrícula escolar dirigidos a derribar bases de datos académicas y notas",
      "Problemas recurrentes en la continuidad de plataformas LMS (como Moodle o Canvas) durante exámenes masivos",
      "Retos de administración y monitoreo de múltiples redes y salas tecnológicas distribuidas en el campus"
    ],
    contacts: [
      {
        name: "Fabian Cortes",
        role: "Líder de TI",
        company: "Universidad Icesi",
        painsContext: "Necesidad de optimizar redes Wi-Fi corporativas de gran ancho de banda para salones interactivos de última generación."
      },
      {
        name: "Patricia Patiño",
        role: "Directora de TI",
        company: "Universidad de San Buenaventura / USB",
        painsContext: "Abordar la unificación de redes VoIP antiguas a una PBX en la nube ágil y reducir interrupciones de acceso remoto."
      },
      {
        name: "Leonardo Botero",
        role: "Jefe de TI",
        company: "Universidad Autónoma de Occidente / UAO",
        painsContext: "Búsqueda constante de integraciones eficientes en aulas digitales con alta tolerancia al fallo en telecomunicaciones."
      },
      {
        name: "Alejandro Toledo",
        role: "Decano",
        company: "Universidad del Cauca / Unicauca",
        painsContext: "Estrategias de innovación académica y actualización de salas de data para proyectos de investigación regionales."
      }
    ]
  },
  {
    id: "industrial",
    name: "Industrial & Manufactura",
    emoji: "🏭",
    gradient: "from-amber-600 to-orange-500",
    representativePains: [
      "Deficiente alcance o inestabilidad del Wi-Fi en amplias bodegas y plantas industriales con alta interferencia metálica",
      "Ineficiencias sustanciales de comunicación e inventario en los flujos logísticos y despachos de productos",
      "Vulnerabilidades críticas de ciberseguridad en redes operativas industriales (OT) no segmentadas",
      "Pérdida de productiva por procesos y reportes repetitivos y lentos gestionados de forma manual"
    ],
    contacts: [
      {
        name: "Juan Pablo Jaramillo",
        role: "Líder de Redes e Infraestructura",
        company: "FANALCA",
        painsContext: "Estabilidad en terminales de escaneo de almacenes e interconexión eficiente de data de ensambles vehiculares."
      },
      {
        name: "Roger Gonzalez",
        role: "Líder de TI",
        company: "Cartones América",
        painsContext: "Mitigación de riesgos de malware industrial en redes OT que pudiesen detener la cadena de extrusores de papel."
      },
      {
        name: "Claudia Acevedo",
        role: "Líder Operativa y Financiera",
        company: "Riopaila / Colombina",
        painsContext: "Automatización de reportes manuales interdepartamentales en conciliaciones fabriles y optimización de facturación."
      }
    ]
  },
  {
    id: "corporativo",
    name: "Sectores Corporativo & Servicios",
    emoji: "💼",
    gradient: "from-slate-700 to-slate-900",
    representativePains: [
      "Falta de visibilidad unificada de embudos de ventas y pérdida sistemática de Leads calificados",
      "Dispersión ineficiente de las herramientas de comunicación interna y de telefonía entre múltiples sucursales",
      "Lentitud generalizada de servicios de red e internet que degradan la productividad diaria de colaboradores",
      "Necesidad de consultoría y adopción estratégica de IA para agilizar y optimizar operaciones internas de oficina"
    ],
    contacts: [
      {
        name: "Mauricio Mora",
        role: "Director de TI",
        company: "Sucroal",
        painsContext: "Integración de tableros de control omnicanal de servicio de soporte logístico."
      },
      {
        name: "Carlos Martin Alvarez",
        role: "Director de TI",
        company: "Enertotal",
        painsContext: "Mantener servicios de atención remota omnicanal sumamente estables para consulta de facturas de energía."
      }
    ]
  }
];
