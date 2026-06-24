/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  ShieldAlert, 
  Send, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Trash2, 
  Copy, 
  CheckCircle, 
  MessageSquare, 
  Compass, 
  RefreshCw, 
  Building2, 
  User, 
  ArrowRight, 
  Mail, 
  ChevronRight, 
  Check, 
  Lightbulb, 
  MapPin,
  Flame,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Solution, SectorData, ContactInfo, ProspectLog, ChatMessage } from "./types";
import { PORTFOLIO_SOLUTIONS, TARGET_SECTORS } from "./data";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"prospecting" | "history" | "coach">("prospecting");

  // Selection states
  const [selectedSector, setSelectedSector] = useState<SectorData>(TARGET_SECTORS[0]);
  const [selectedSolutions, setSelectedSolutions] = useState<Solution[]>([PORTFOLIO_SOLUTIONS[0]]);

  const toggleSolution = (sol: Solution) => {
    if (selectedSolutions.some(s => s.id === sol.id)) {
      if (selectedSolutions.length > 1) {
        setSelectedSolutions(selectedSolutions.filter(s => s.id !== sol.id));
      } else {
        showToast("Seleccione al menos una solución");
      }
    } else {
      setSelectedSolutions([...selectedSolutions, sol]);
    }
  };
  
  // Custom form inputs
  const [companyName, setCompanyName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactRole, setContactRole] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [emailTone, setEmailTone] = useState<string>("Consultivo Persuaviso");

  // Output generated data
  const [genOutreach, setGenOutreach] = useState<{
    pains: string[];
    emailSubject: string;
    emailBody: string;
  } | null>(null);

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // History system
  const [historyLogs, setHistoryLogs] = useState<ProspectLog[]>([]);
  const [searchHistory, setSearchHistory] = useState<string>("");

  // Coach/Conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    const cached = localStorage.getItem("ss_prospect_history");
    if (cached) {
      try {
        setHistoryLogs(JSON.parse(cached));
      } catch (e) {
        console.error("Error reading cached history:", e);
      }
    } else {
      // Seed initial mock history to show immediate progress in dashboard
      const seedHistory: ProspectLog[] = [
        {
          id: "seed_1",
          companyName: "Fundación Valle del Lili (FVL)",
          contactName: "Angel Ruiz",
          contactRole: "Administrador de Data Center",
          sector: "Sector Salud",
          solution: "Redes Corporativas LAN & WLAN (Ruckus/Fortinet)",
          emailSubject: "Historias clínicas sin cortes: Optimización Wi-Fi en FVL",
          emailBody: "Hola Angel,\n\nConocemos los exigentes requisitos de conectividad en la Fundación Valle del Lili, donde una caída en el acceso a historias clínicas o la latencia Wi-Fi para el personal médico de urgencias impacta de forma crítica la atención de pacientes.\n\nEn S&S IP SAS ayudamos a instituciones de salud complejas a blindar su conectividad con conmutadores FortiSwitch de alta velocidad y Access Points Ruckus diseñados para entornos de alta densidad estructural. Esto estabiliza las rondas médicas y elimina las microdesconexiones en zonas críticas.\n\nMe gustaría proponerle una sesión corta de diagnóstico técnico de 15 minutos la próxima semana para evaluar las métricas de su infraestructura actual sin compromiso. ¿Qué día le queda mejor?\n\nSaludos cordiales.",
          pains: [
            "Inestabilidad en la transmisión móvil de historias clínicas a pie de cama.",
            "Latencia acumulada y zonas frías en la cobertura de Access Points antiguos.",
            "Demanda extrema en el canal por conexión masiva de dispositivos de pacientes y médicos simultáneamente."
          ],
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          tone: "Consultivo Persuaviso"
        }
      ];
      setHistoryLogs(seedHistory);
      localStorage.setItem("ss_prospect_history", JSON.stringify(seedHistory));
    }

    // Default messages for coach
    setChatMessages([
      {
        id: "init_1",
        role: "model",
        text: "¡Hola! Soy **Smart Account Assistant**, su asesor y estratega B2B de S&S IP SAS. \n\nMi meta es ayudarle a acelerar su prospección diaria. Puedo orientarle sobre cómo rebatir objeciones complejas en Colombia (ej: presupuestos, competencia de Cisco/Aruba, centralizar telefonía con Teams, o la seguridad de Fortinet con el NGSOC 24/7). \n\n*¿De qué cliente o sector desea que hablemos hoy para ganar este negocio?*",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  // Sync to local storage
  const saveToHistory = (newLog: ProspectLog) => {
    const updated = [newLog, ...historyLogs];
    setHistoryLogs(updated);
    localStorage.setItem("ss_prospect_history", JSON.stringify(updated));
    showToast("¡Prospecto guardado exitosamente en su bitácora!");
  };

  const deleteHistoryItem = (id: string) => {
    const updated = historyLogs.filter(log => log.id !== id);
    setHistoryLogs(updated);
    localStorage.setItem("ss_prospect_history", JSON.stringify(updated));
    showToast("Draft eliminado de su historial.");
  };

  // Toast system
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Prepopulate form when target contact is chosen
  const handleSelectContact = (contact: ContactInfo) => {
    setCompanyName(contact.company);
    setContactName(contact.name);
    setContactRole(contact.role);
    setAdditionalContext(contact.painsContext);
    showToast(`Datos cargados para ${contact.company}: ${contact.name}`);
  };

  // Cycle loading messages for cool sales feeling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "Identificando dolores sectoriales clave...",
    "Alineando propuestas de valor con el catálogo de S&S IP SAS...",
    "Filtrando robotismos innecesarios y puliendo el gancho comercial colombano...",
    "Listo: Generando Warm Outreach optimizado..."
  ];

  // API Call: Generate Target Elements
  const handleGenerateOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      setErrorMessage("Por favor especifique el nombre de la empresa objetivo.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    setGenOutreach(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          contactRole,
          sector: selectedSector.name,
          solution: selectedSolutions.map(s => `${s.name} (${s.brandAssociation || ""})`).join(", "),
          tone: emailTone,
          additionalContext
        })
      });

      const data = await response.json();
      
      if (response.ok && data.emailBody) {
        setGenOutreach({
          pains: data.pains,
          emailSubject: data.emailSubject,
          emailBody: data.emailBody
        });
      } else {
        throw new Error(data.error || "La generación de modelo no devolvió el formato esperado.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Ocurrió un error en el servidor al generar: ${err.message}. Intentando nuevamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  // API Call: Chat coach
  const handleSendCoachMsg = async (overrideMsg?: string) => {
    const textMsg = overrideMsg || chatInput;
    if (!textMsg.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textMsg,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!overrideMsg) setChatInput("");
    setIsCoachLoading(true);

    // Scroll to bottom
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      // Map history formatted for server
      const serverHistory = chatMessages.slice(-8).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textMsg,
          history: serverHistory
        })
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: "model",
          text: data.text,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(data.error || "No se obtuvo respuesta del coach de ventas.");
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: "model",
        text: `⚠️ **Error en consulta:** ${err.message}. Revise que su conexión esté estable.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsCoachLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  // Helper selectors for copying & mailto triggers
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`¡${label} copiado al portapapeles!`);
  };

  const getMailToLink = () => {
    if (!genOutreach) return "#";
    const subject = encodeURIComponent(genOutreach.emailSubject);
    const body = encodeURIComponent(genOutreach.emailBody);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  // Calculations for Tracker & Goals
  const dailyTarget = 5; // Target prospects per day
  const generatedCount = historyLogs.length;
  // standard prospecting calculated at 35 minutes vs 3 mins with app
  const traditionalMinutes = generatedCount * 35;
  const standardMinutes = generatedCount * 3;
  const timeSavedMinutes = traditionalMinutes - standardMinutes;

  const preBakedPrompts = [
    {
      title: "Rebatir precio Ruckus",
      prompt: "Dame tres argumentos para defender el costo de los Access Points Ruckus frente a competidores baratos (ej: Ubiquiti/Unifi) en el sector educativo."
    },
    {
      title: "Militarización MaxGP",
      prompt: "¿Qué ganchos comerciales directos de MaxGP sobre Kubernetes podemos usar para captar al Director de TI de Enertotal?"
    },
    {
      title: "Objeción 'Ya tengo Fortinet'",
      prompt: "Un prospecto en Cali me dice 'ya tengo firewall FortiGate contratado con otro proveedor local de IT'. ¿Cómo le vendo la auditoría S&S y nuestro NGSOC 24/7 de S&S?"
    },
    {
      title: "Objeción Telefonía IP",
      prompt: "Un hospital mediano teme migrar su telefonía local de Avaya física a la nube por pérdida de continuidad. ¿Cómo rebato esta reticencia usando las ventajas de PBX Cloud S&S?"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans flex flex-col selection:bg-sky-500/30 antialiased">
      
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-[#f1f5f9] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-semibold border border-[#38bdf8]/30"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate S&S IP Header */}
      <header className="sticky top-0 z-30 bg-[#0f172a] border-b border-[#1e293b] shadow-xl backdrop-blur-md bg-[#0f172a]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-[#1e293b] text-white p-2.5 rounded-xl flex items-center justify-center shadow-lg border border-[#334155]">
                <Briefcase className="h-6 w-6 text-[#38bdf8]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#38bdf8]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Smart Account Assistant</h1>
                <span className="bg-[#1e293b] text-[#38bdf8] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-[#334155]">Portafolio S&S 2026</span>
              </div>
              <p className="text-xs text-[#94a3b8] font-medium">
                Consultoría estratégica B2B • Sedes Principales: <span className="text-slate-300">Bogotá y Cali</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Panel / Tab Selector */}
          <div className="flex items-center gap-2 self-start md:self-center overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("prospecting")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "prospecting" 
                  ? "bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/35 shadow-lg shadow-sky-500/5" 
                  : "bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border border-[#1e293b] hover:text-white"
              }`}
            >
              <Compass className="h-4 w-4" />
              Consola Prospección
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
                activeTab === "history" 
                  ? "bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/35 shadow-lg shadow-sky-500/5" 
                  : "bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border border-[#1e293b] hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Bitácora Diaria
              {historyLogs.length > 0 && (
                <span className="bg-[#38bdf8] text-[#0f172a] text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {historyLogs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("coach")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "coach" 
                  ? "bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/35 shadow-lg shadow-sky-500/5" 
                  : "bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border border-[#1e293b] hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Sales Coach AI
            </button>
          </div>

        </div>
      </header>

      {/* Bento Tracker Element: The "30-Min Daily Prospecting Tracker" */}
      <section className="bg-[#0f172a] text-white border-b border-[#1e293b] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-80 h-full bg-[#38bdf8]/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-96 h-20 bg-sky-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            <div className="md:col-span-1.5">
              <div className="flex items-center gap-2 text-[#38bdf8] text-xs font-bold tracking-wider uppercase mb-1.5">
                <Clock className="h-4.5 w-4.5" />
                <span>Bitácora de Ahorro Temporal</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white animate-pulse">Objetivo: Prospección en 30 minutos</h2>
              <p className="text-[#94a3b8] text-xs mt-1 leading-relaxed">
                La automatización de mapeo de dolor de S&S IP SAS reduce el tiempo promedio de redacción por cliente de <strong className="text-[#f1f5f9]">35 minutos</strong> a solo <strong className="text-[#f1f5f9]">3 minutos</strong>.
              </p>
            </div>

            <div className="md:col-span-2.5 grid grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Stat 1 */}
              <div className="bg-[#1e293b]/60 backdrop-blur border border-[#1e293b] p-4 rounded-2xl flex items-start gap-3 shadow-md">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {timeSavedMinutes > 0 ? `~${timeSavedMinutes}m` : "0m"}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300">Tiempo Libre Recuperado</p>
                  <p className="text-[9px] text-[#64748b] font-mono mt-0.5">Evitando horas de teclado</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[#1e293b]/60 backdrop-blur border border-[#1e293b] p-4 rounded-2xl flex items-start gap-3 shadow-md">
                <div className="p-2 bg-sky-500/10 rounded-xl text-[#38bdf8]">
                  <Flame className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-black text-white font-mono flex items-center justify-between">
                    <span>{generatedCount} / {dailyTarget}</span>
                    <span className="text-[10px] text-[#94a3b8] font-normal">Meta</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300">Prospectos Listos Hoy</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-[#1e293b] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#38bdf8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((generatedCount / dailyTarget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Quote Promo Banner */}
              <div className="bg-[#1e293b]/30 border border-[#1e293b] p-4 rounded-2xl hidden lg:block col-span-1 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-bounce" />
                  <span>Tip de Éxito Comercial</span>
                </div>
                <p className="text-[10px] text-[#94a3b8] leading-relaxed mt-1">
                  Aborde a tomadores de TI combinando dolores técnicos (historias clínicas, redundancia de red) con beneficios financieros.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: PROSPECTING WORKSPACE */}
        {activeTab === "prospecting" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start fade-in">
            
            {/* Left Console Configuration Pane (Col span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Sector targeting and automatic contact matrix loader */}
              <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-6 overflow-hidden relative">
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#1e293b] text-[#38bdf8] p-1.5 rounded-lg border border-[#334155]">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">1. Matriz de Sectores y Contactos Objetivo</h3>
                    <p className="text-[11px] text-[#94a3b8]">Seleccione un sector clave colombiano para explorar prospectos e interacciones</p>
                  </div>
                </div>

                {/* Horizontal sector pills scrolling */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                  {TARGET_SECTORS.map((sector) => (
                    <button
                      key={sector.id}
                      onClick={() => setSelectedSector(sector)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                        selectedSector.id === sector.id
                          ? "bg-[#1e293b] text-white border-[#38bdf8] shadow-sm"
                          : "bg-[#020617] text-[#94a3b8] border-[#1e293b] hover:bg-[#1e293b] hover:text-white"
                      }`}
                    >
                      <span>{sector.emoji}</span>
                      <span>{sector.name}</span>
                    </button>
                  ))}
                </div>

                {/* Contact list for selected sector */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
                    <span>Cuentas Pre-Agendadas Corporativas</span>
                    <span className="text-[#38bdf8] text-[10px] lowercase font-normal">{selectedSector.contacts.length} contactos disponibles</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedSector.contacts.map((contact, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectContact(contact)}
                        className="text-left bg-[#1e293b]/50 hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#334155] p-3.5 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#f1f5f9] text-xs">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>{contact.company}</span>
                          </div>
                          
                          <div className="text-[11px] font-medium text-[#cbd5e1] mt-1 flex items-center gap-1">
                            <User className="h-3 w-3 text-[#64748b]" />
                            <span>{contact.name}</span>
                            <span className="text-[#1e293b]">•</span>
                            <span>{contact.role}</span>
                          </div>

                          <div className="text-[10px] text-slate-400 leading-snug font-medium mt-1 truncate max-w-[280px]">
                            {contact.painsContext}
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 bg-[#0f172a] border border-[#334155] h-7 w-7 rounded-full flex items-center justify-center text-[#38bdf8] shadow-sm transition-all shrink-0">
                          <Check className="h-4.5 w-4.5" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Representative structural sector pains warning tracker */}
                  <div className="bg-[#1e293b]/50 border border-[#1e293b] border-l-4 border-l-[#38bdf8] rounded-2xl p-4 mt-4">
                    <div className="flex gap-2">
                      <ShieldAlert className="h-4 w-4 text-[#38bdf8] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Dolores Críticos del Sector {selectedSector.emoji}</h4>
                        <ul className="list-disc list-inside text-[9.5px] text-[#94a3b8] leading-relaxed mt-1 list-none space-y-1">
                          {selectedSector.representativePains.slice(0, 2).map((pain, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1">
                              <span className="text-[#38bdf8] shrink-0 select-none">•</span>
                              <span>{pain}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Form Input fields */}
              <form onSubmit={handleGenerateOutreach} className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-6 space-y-4">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#1e293b] text-[#38bdf8] p-1 rounded-md border border-[#334155]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">2. Detalles de Campaña</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCompanyName("");
                      setContactName("");
                      setContactRole("");
                      setAdditionalContext("");
                    }}
                    className="text-[10px] font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-0.5 cursor-pointer"
                  >
                    Limpiar campos
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3 py-2 text-xs transition-all font-medium text-slate-200"
                      placeholder="Ej: Tecnoquímicas"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Sector Comercial</label>
                    <select
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3 py-2 text-xs transition-all text-slate-200"
                      value={selectedSector.name}
                      onChange={(e) => {
                        const targetSec = TARGET_SECTORS.find(s => s.name === e.target.value);
                        if (targetSec) setSelectedSector(targetSec);
                      }}
                    >
                      {TARGET_SECTORS.map((sec) => (
                        <option key={sec.id} value={sec.name}>{sec.emoji} {sec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Contacto de Decisión</label>
                    <input
                      type="text"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3 py-2 text-xs transition-all font-medium text-slate-200"
                      placeholder="Ej: German Mazuera"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Cargo Directivo</label>
                    <input
                      type="text"
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3 py-2 text-xs transition-all font-medium text-slate-200"
                      placeholder="Ej: Gerente de TI"
                      value={contactRole}
                      onChange={(e) => setContactRole(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Mapeo del Contexto / dolores específicos del cliente</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3 py-2 text-xs transition-all font-medium text-slate-200"
                    placeholder="Ej: Inestabilidad durante la facturación, red lenta en terminal logístico, auditoría de seguridad perimetral retrasada..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </div>

                {/* S&S IP Solutions selection Grid */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">3. Soluciones de S&S IP SAS a ofrecer *</label>
                    <span className="text-[10px] text-[#94a3b8] italic">Seleccione una o varias</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[170px] overflow-y-auto pr-1">
                    {PORTFOLIO_SOLUTIONS.map((sol) => {
                      const isSelected = selectedSolutions.some(s => s.id === sol.id);
                      return (
                        <button
                          key={sol.id}
                          type="button"
                          onClick={() => toggleSolution(sol)}
                          className={`text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#0369a1] text-white border-[#38bdf8] ring-1 ring-[#38bdf8]"
                              : "bg-[#1e293b]/40 text-[#94a3b8] border-[#334155] hover:bg-[#1e293b] hover:text-white"
                          }`}
                        >
                          <div className="pr-2">
                            <div className="font-bold">{sol.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{sol.brandAssociation}</div>
                          </div>
                          {isSelected && (
                            <span className="bg-[#38bdf8] text-[#0f172a] rounded-full p-1 leading-none shrink-0 font-bold animate-scale-in">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Tone customization */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider mb-1">Tono de Mensaje</label>
                    <select
                      className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-2 py-1.5 text-xs transition-all text-slate-200"
                      value={emailTone}
                      onChange={(e) => setEmailTone(e.target.value)}
                    >
                      <option value="Consultivo Persuasivo">Prof. Consultivo</option>
                      <option value="Especialista Tecnico">Especialista Técnico</option>
                      <option value="Vision Directiva C-Level">Visión C-Level</option>
                    </select>
                  </div>
                  <div className="flex items-end text-[10px] text-slate-400 leading-relaxed font-medium">
                    <span>Ajusta el foco comercial de la inteligencia según el tipo de contacto.</span>
                  </div>
                </div>

                {/* Trigger prospecting button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#38bdf8] hover:bg-sky-400 text-[#0f172a] py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2 disabled:bg-[#1e293b] disabled:text-[#64748b] cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      <span>{loadingMessages[loadingStep]}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4.5 w-4.5 text-[#0f172a]" />
                      <span>Generar Email y dolores (Bajo 150 Palabras)</span>
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Right Output generated outreach elements pane (Col span 7) */}
            <div className="lg:col-span-7">
              {errorMessage && (
                <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-2xl p-4 mb-6 flex gap-3 items-start animate-pulse">
                  <div className="bg-red-900/30 text-red-400 p-1 rounded-lg shrink-0 border border-red-800">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-red-300">Error de Servidor</h5>
                    <p className="text-[11px] leading-relaxed mt-1 text-red-400">{errorMessage}</p>
                    <button 
                      onClick={(e) => handleGenerateOutreach(e)}
                      className="text-[10px] font-bold text-red-350 underline mt-2 flex items-center gap-1 hover:text-white"
                    >
                      <RefreshCw className="h-3 w-3" /> Reintentar Procesamiento
                    </button>
                  </div>
                </div>
              )}

              {/* Inactive Empty State */}
              {!genOutreach && !isLoading && (
                <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[500px]">
                  <div className="bg-[#020617] p-6 rounded-full border border-[#1e293b] mb-4 text-[#38bdf8]">
                    <Mail className="h-12 w-12" />
                  </div>
                  <h4 className="text-white text-base font-bold">Consola de Prospectación Inteligente — S&S</h4>
                  <p className="text-xs text-[#94a3b8] max-w-md mx-auto mt-2 leading-relaxed">
                    Personalice una campaña en la columna izquierda o dé click en una de las cuentas recomendadas de Bogotá y Cali para estructurar instantáneamente un Warm Outreach enfocado y un análisis estructurado de dolores.
                  </p>

                  <div className="grid grid-cols-2 gap-4 max-w-lg mt-8 w-full">
                    <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-2xl text-left">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                        <span>Warm Outreach</span>
                      </div>
                      <p className="text-[10px] text-[#94a3b8]">Correos cortos (menos de 150 palabras) ultra-persuasivos y enfocados en el cierre.</p>
                    </div>

                    <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-2xl text-left">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                        <Briefcase className="h-4.5 w-4.5 text-[#38bdf8]" />
                        <span>Dolores Sectoriales</span>
                      </div>
                      <p className="text-[10px] text-[#94a3b8]">Mapeo dinámico que vincula el portafolio S&S con los comités de TI de salud, universidades y banca.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Loading Screen */}
              {isLoading && !genOutreach && (
                <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-12 text-center min-h-[500px] flex flex-col items-center justify-center">
                  
                  {/* Glowing Spinner */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#38bdf8]/15 blur-xl rounded-full scale-110 animate-pulse" />
                    <div className="h-16 w-16 bg-[#020617] border-2 border-[#1e293b] rounded-full flex items-center justify-center shadow-lg relative">
                      <RefreshCw className="h-8 w-8 text-[#38bdf8] animate-spin" />
                    </div>
                  </div>

                  <h4 className="text-white text-sm font-bold animate-pulse">
                    Construyendo propuesta para {companyName || "el prospecto"}...
                  </h4>

                  {/* Progressive loading step items */}
                  <div className="w-full max-w-sm mt-8 space-y-3">
                    {loadingMessages.map((msg, mIdx) => (
                      <div 
                        key={mIdx} 
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all text-xs font-semibold ${
                          loadingStep === mIdx 
                            ? "bg-[#020617] text-white border border-[#38bdf8]/30 shadow-md" 
                            : loadingStep > mIdx 
                              ? "text-emerald-400 opacity-80" 
                              : "text-slate-500"
                        }`}
                      >
                        {loadingStep > mIdx ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
                        ) : loadingStep === mIdx ? (
                          <div className="h-5 w-5 rounded-full animate-spin border-2 border-[#38bdf8] border-t-transparent" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-[#121824] text-slate-600 flex items-center justify-center text-[10px]">{mIdx + 1}</div>
                        )}
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#94a3b8] max-w-xs mx-auto mt-8 leading-snug">
                    Reduciendo 3 horas de prospección comercial a solo segundos mediante procesamiento B2B.
                  </p>
                </div>
              )}

              {/* Active Results Display */}
              {genOutreach && !isLoading && (
                <div className="space-y-6 fade-in">
                  
                  {/* Tab header action row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 shadow-xl">
                    <div>
                      <div className="text-[10px] text-[#38bdf8] font-bold uppercase tracking-wider">Campaña para</div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-[#38bdf8]" />
                        <span>{companyName} {contactName ? `(${contactName})` : ""}</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => {
                          const newLog: ProspectLog = {
                            id: Math.random().toString(),
                            companyName,
                            contactName,
                            contactRole,
                            sector: selectedSector.name,
                            solution: selectedSolutions.map(s => s.name).join(", "),
                            emailSubject: genOutreach.emailSubject,
                            emailBody: genOutreach.emailBody,
                            pains: genOutreach.pains,
                            timestamp: new Date().toISOString(),
                            tone: emailTone
                          };
                          saveToHistory(newLog);
                        }}
                        className="flex-1 sm:flex-initial bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Guardar en Bitácora
                      </button>

                      <a
                        href={getMailToLink()}
                        className="flex-1 sm:flex-initial bg-[#38bdf8] hover:bg-sky-400 text-[#0f172a] rounded-xl px-3.5 py-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        Enviar Email
                      </a>
                    </div>
                  </div>

                  {/* Section 1: Sector Pains Identified */}
                  <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#1e293b] text-[#38bdf8] p-1.5 rounded-lg border border-[#334155]">
                        <ShieldAlert className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-tight text-white uppercase">1. Análisis de Dolor Sectorial</h4>
                        <p className="text-[11px] text-[#94a3b8]">¿Cómo aborda S&S los comités o problemas del tomador de decisiones?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {genOutreach.pains.map((pain, pIdx) => (
                        <div key={pIdx} className="bg-[#1e293b]/50 border border-[#334155] p-4 rounded-2xl flex items-start gap-3">
                          <span className="text-[#38bdf8] text-sm leading-none shrink-0 mt-0.5 font-bold">0{pIdx + 1}.</span>
                          <p className="text-[11.5px] leading-relaxed text-[#cbd5e1] font-medium">{pain}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Simulated Modern Email Composer with Outreach subject + body */}
                  <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl overflow-hidden flex flex-col">
                    
                    {/* Simulated email header UI */}
                    <div className="bg-[#121824] border-b border-[#1e293b] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-3 rounded-full bg-red-500/80 border border-red-950" />
                          <div className="h-3 w-3 rounded-full bg-yellow-500/80 border border-yellow-950" />
                          <div className="h-3 w-3 rounded-full bg-green-500/80 border border-green-950" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">OUTREACH DRAFT • S&S IP SAS</span>
                      </div>

                      <div className="grid grid-cols-12 gap-1 items-center text-xs text-slate-400 mt-2">
                        <span className="col-span-2 font-bold select-none text-[10px] uppercase tracking-wider text-[#38bdf8]">Asunto:</span>
                        <div className="col-span-9 font-bold text-white text-xs px-2 truncate leading-relaxed">
                          {genOutreach.emailSubject}
                        </div>
                        <button
                          onClick={() => copyToClipboard(genOutreach.emailSubject, "Asunto del correo")}
                          className="col-span-1 text-slate-400 hover:text-white p-1 flex justify-end transition cursor-pointer"
                          title="Copiar Asunto"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-1 items-center text-xs text-slate-400">
                        <span className="col-span-2 font-bold select-none text-[10px] uppercase tracking-wider text-[#38bdf8]">Para:</span>
                        <div className="col-span-10 font-medium text-[#cbd5e1] px-2 italic">
                          {contactName ? `${contactName} (${contactRole || "Contacto Key"})` : "Toma de Decisión"} • {companyName}
                        </div>
                      </div>
                    </div>

                    {/* Email composer body */}
                    <div className="p-6 bg-[#0f172a] relative flex-1">
                      <textarea
                        rows={11}
                        className="w-full bg-transparent resize-none border-0 focus:ring-0 p-0 text-slate-200 text-xs leading-relaxed font-sans placeholder-slate-500 focus:outline-none"
                        value={genOutreach.emailBody}
                        onChange={(e) => setGenOutreach(prev => prev ? { ...prev, emailBody: e.target.value } : null)}
                      />

                      {/* Small visual validation elements */}
                      <div className="border-t border-[#1e293b] p-3 flex justify-between items-center text-[10px] font-medium text-slate-400 select-none bg-[#121824] -mx-6 -mb-6 mt-4 font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Listo para copiar</span>
                        </div>
                        <div>
                          Métrica: <strong className="text-[#38bdf8]">{genOutreach.emailBody.split(/\s+/).filter(Boolean).length} palabras</strong> (Límite: 150)
                        </div>
                      </div>
                    </div>

                    {/* Quick helper action drawer */}
                    <div className="bg-[#1e293b] text-white p-4 flex gap-3 justify-between items-center border-t border-[#334155]">
                      <div className="flex gap-2 text-xs font-semibold text-slate-300">
                        <Lightbulb className="h-4.5 w-4.5 text-yellow-400 shrink-0" />
                        <span>Presione 'Enviar Email' para abrir Outlook o Gmail con los datos precargados.</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(genOutreach.emailBody, "Cuerpo del correo")}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar Cuerpo
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: HISTORY LOGS */}
        {activeTab === "history" && (
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-6 fade-in space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-5">
              <div>
                <h3 className="text-base font-bold text-white">Bitácora de Correo Producidos (Historial diario)</h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Guarda un registro permanente de sus drafts de prospección rápidos. Se guarda localmente y calcula su ahorro acumulado.
                </p>
              </div>

              {/* Real-time filters and search */}
              <div className="w-full sm:w-80 relative">
                <input
                  type="text"
                  className="w-full bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-200"
                  placeholder="Buscar por Empresa o Solución..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
            </div>

            {/* Empty stats log */}
            {historyLogs.filter(log => 
              log.companyName.toLowerCase().includes(searchHistory.toLowerCase()) ||
              log.solution.toLowerCase().includes(searchHistory.toLowerCase())
            ).length === 0 ? (
              <div className="text-center py-12 text-[#94a3b8]">
                <p className="text-sm font-semibold text-white">No se encontraron prospectos guardados.</p>
                <p className="text-[11px] text-slate-500 mt-1">Intente buscar otro término o regrese a la consola para generar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyLogs
                  .filter(log => 
                    log.companyName.toLowerCase().includes(searchHistory.toLowerCase()) ||
                    log.solution.toLowerCase().includes(searchHistory.toLowerCase())
                  )
                  .map((log) => (
                    <div key={log.id} className="border border-[#1e293b] bg-[#121824] hover:bg-[#1e293b] rounded-2xl p-5 transition-all flex flex-col md:flex-row justify-between gap-4">
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-[#334155] text-slate-200 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                            {log.sector}
                          </span>
                          <span className="bg-[#1e3a8a]/40 text-[#38bdf8] text-[9px] font-bold px-2 py-0.5 rounded border border-[#1e3a8a]/60">
                            {log.solution}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()} - {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">{log.companyName}</h4>
                          <p className="text-[11px] text-[#cbd5e1]">Contacto: <strong>{log.contactName || "Decisor"}</strong> • Cargo: <strong>{log.contactRole || "Especialista TI"}</strong></p>
                        </div>

                        {/* Collapsed view structure */}
                        <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                          <div className="text-[11px] text-[#cbd5e1] leading-normal whitespace-pre-wrap font-sans">
                            <strong className="text-white font-bold block mb-1">Asunto: {log.emailSubject}</strong>
                            {log.emailBody}
                          </div>
                        </div>

                        {/* Stored Pains */}
                        {log.pains && log.pains.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {log.pains.map((pain, pIdx) => (
                              <span key={pIdx} className="bg-amber-950/25 text-amber-300 border border-amber-900/40 text-[9px] font-semibold px-2 py-0.5 rounded-lg max-w-sm truncate" title={pain}>
                                • {pain}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick history actions */}
                      <div className="flex md:flex-col items-stretch justify-end gap-2 shrink-0 md:w-32 self-end md:self-center">
                        <button
                          onClick={() => copyToClipboard(log.emailBody, "Cuerpo del correo")}
                          className="flex-1 bg-[#1e293b] border border-[#334155] hover:bg-[#334155] text-white rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copiar Email
                        </button>

                        <button
                          onClick={() => deleteHistoryItem(log.id)}
                          className="bg-red-950/30 hover:bg-red-900/30 border border-red-900/50 text-red-400 rounded-xl py-2 px-3 text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                          title="Eliminar de bitácora"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>

                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SMART SALES COACH (CHAT) */}
        {activeTab === "coach" && (
          <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] shadow-xl p-6 fade-in flex flex-col md:flex-row gap-8 min-h-[500px]">
            
            {/* Suggestions & Portfolio Helper Panel */}
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-[#1e293b] pb-6 md:pb-0 md:pr-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Entrenador B2B S&S IP SAS</h3>
                <p className="text-[11px] text-[#94a3b8]">Un consejero comercial entrenado con todo el catálogo premium de S&S para superar cualquier objeción en Colombia.</p>
              </div>

              {/* Presets and prompts */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sugerencias tácticas de chat:</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {preBakedPrompts.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(preset.prompt);
                        handleSelectPreset(preset.prompt);
                      }}
                      className="text-left bg-[#020617] hover:bg-[#1e293b] border border-[#1e293b] hover:border-[#38bdf8] p-3 rounded-xl transition text-xs font-semibold text-[#cbd5e1] flex items-center justify-between group cursor-pointer"
                    >
                      <span>{preset.title}</span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-[#38bdf8] transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Colombia Business Map Quick Facts */}
              <div className="bg-[#020617] text-slate-300 p-4 rounded-2xl space-y-2 border border-[#1e293b]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-400">
                  <MapPin className="h-3.5 w-3.5 text-yellow-500" />
                  <span>Sedes Principales</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Apalánquese de nuestra NGSOC en Bogotá para clientes preocupados por soberanía de datos y monitoreo local 24/7.
                </p>
              </div>
            </div>

            {/* Active Dialogue Area */}
            <div className="flex-1 flex flex-col min-h-[400px]">
              
              {/* Chat timeline message body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[350px] min-h-[300px]">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-sans ${
                        msg.role === "user"
                          ? "bg-[#38bdf8] text-[#0f172a] rounded-br-none font-bold"
                          : "bg-[#1e293b]/70 text-[#cbd5e1] rounded-bl-none border border-[#334155]"
                      }`}
                    >
                      {/* Simplistic formatting block renderer */}
                      <p className="font-medium whitespace-pre-wrap">
                        {msg.text.split("**").map((chunk, cIdx) => (
                          cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-[#38bdf8]">{chunk}</strong> : chunk
                        ))}
                      </p>
                      
                      <div className={`text-[9px] mt-2 font-mono ${msg.role === "user" ? "text-[#0f172a]/70" : "text-slate-400"} flex items-center justify-between`}>
                        <span>{msg.role === "user" ? "Yo" : "Smart Account Assistant"}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {isCoachLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl rounded-bl-none p-4 max-w-[80px] flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 bg-[#38bdf8] rounded-full animate-bounce delay-75" />
                        <div className="h-1.5 w-1.5 bg-[#38bdf8] rounded-full animate-bounce delay-150" />
                        <div className="h-1.5 w-1.5 bg-[#38bdf8] rounded-full animate-bounce delay-225" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Text Input Row */}
              <div className="border-t border-[#1e293b] pt-4 mt-4 flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 bg-[#020617] border border-[#1e293b] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl px-3.5 py-3 text-xs font-semibold text-white placeholder-slate-500"
                  placeholder="Escriba aquí una consulta táctica... o elija una sugerencia de la izquierda"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCoachLoading) {
                      handleSendCoachMsg();
                    }
                  }}
                  disabled={isCoachLoading}
                />
                
                <button
                  onClick={() => handleSendCoachMsg()}
                  disabled={isCoachLoading || !chatInput.trim()}
                  className="bg-[#38bdf8] hover:bg-sky-400 cursor-pointer text-[#0f172a] h-10 w-12 rounded-xl flex items-center justify-center shadow transition-all disabled:bg-[#1e293b] disabled:text-slate-650"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* S&S Footer branding with current date */}
      <footer className="bg-[#020617] text-[#94a3b8] py-6 border-t border-[#1e293b] mt-12 text-center text-[11px] leading-relaxed select-none">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 S&S IP SAS. Todos los derechos reservados. Nit: 900.XXX.XXX-X.</p>
          <p className="text-[#64748b] mt-1">
            Diseñado para uso exclusivo de Gerentes de Cuenta y Ejecutivo Comercial de Telecomunicaciones en Colombia.
          </p>
        </div>
      </footer>

    </div>
  );

  // Helper inside click-to-trigger pre-baked coaches
  function handleSelectPreset(promptVal: string) {
    // Send directly
    setTimeout(() => {
      handleSendCoachMsg(promptVal);
    }, 50);
  }
}
