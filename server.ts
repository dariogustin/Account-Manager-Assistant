import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: geminiApiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Robust helper function with retry and model fallback to handle 503 (model overloaded) and other transient errors
async function generateContentWithFallback(params: any, retries = 3, delayMs = 1000): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    let attemptParams = { ...params, model };
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Gemini] Attempting generateContent with model "${model}" (attempt ${attempt}/${retries})...`);
        const response = await ai.models.generateContent(attemptParams);
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Error with model "${model}" (attempt ${attempt}/${retries}):`, err.message || err);
        
        // If it's a 4xx client error (except rate limit 429), it's a bad request, so try next model or throw
        if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
          break; // break the attempt loop to try the next model
        }
        
        if (attempt < retries) {
          const sleepTime = delayMs * attempt;
          console.log(`[Gemini] Sleeping for ${sleepTime}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, sleepTime));
        }
      }
    }
  }
  throw lastError || new Error("Failed to generate content with all available models.");
}

async function sendChatMessageWithFallback(
  message: string,
  history: any[],
  systemInstruction: string,
  retries = 3,
  delayMs = 1000
): Promise<any> {
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Gemini Chat] Attempting chat.sendMessage with model "${model}" (attempt ${attempt}/${retries})...`);
        const chat = ai.chats.create({
          model,
          config: {
            systemInstruction,
            temperature: 0.7
          },
          history
        });
        const response = await chat.sendMessage({ message });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Chat] Error with model "${model}" (attempt ${attempt}/${retries}):`, err.message || err);
        
        if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
          break; // break the attempt loop to try the next model
        }
        
        if (attempt < retries) {
          const sleepTime = delayMs * attempt;
          console.log(`[Gemini Chat] Sleeping for ${sleepTime}ms before retrying...`);
          await new Promise((resolve) => setTimeout(resolve, sleepTime));
        }
      }
    }
  }
  throw lastError || new Error("Failed to send chat message with all available models.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and static files size handling
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.GEMINI_API_KEY
    });
  });

  // 1. Prospecting Generator endpoint
  app.post("/api/generate", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { companyName, contactName, contactRole, sector, solution, tone, additionalContext } = req.body;

      if (!companyName || !sector || !solution) {
         res.status(400).json({ error: "Faltan campos obligatorios: empresa, sector y solución." });
         return;
      }

      const prompt = `
        Genera el análisis de dolor sectorial y la propuesta de correo Warm Outreach según los siguientes datos de prospección:
        - Empresa: "${companyName}"
        - Persona de Contacto/Cargo: "${contactName || "No especificado"} - ${contactRole || "No especificado"}"
        - Sector de Negocio: "${sector}"
        - Solución de S&S IP SAS a ofrecer: "${solution}"
        - Tono del Correo: "${tone || "Consultivo Persuaviso"}"
        - Contexto adicional opcional: "${additionalContext || "Ninguno"}"
      `;

      const systemInstruction = `
        Eres "Smart Account Assistant", un consultor comercial experto en tecnología B2B y prospección estratégica para la empresa S&S IP SAS en Colombia (sedes principales en Bogotá y Cali). Tu objetivo es ayudar al Gerente de Cuenta comercial a reducir su tiempo de prospección estructurando correos de aproximación (Warm Outreach) altamente persuasivos e identificando dolores sectoriales clave.

        Conectas de forma inteligente la solución de S&S IP SAS seleccionada con los problemas típicos del sector del prospecto.

        ESTRUCTURA DEL NEGOCIO DE S&S IP SAS:
        1. Colaboración: Sistemas de telefonía IP PBX tradicionales y en la nube con troncales SIP, integrando salas híbridas modernas con Microsoft Teams y Zoom (Avaya / Teams / Yealink).
        2. Ciberseguridad: Canal Oficial Fortinet Platinum. NGSOC (SOC administrado) 24/7 propio de S&S IP SAS, seguridad perimetral FortiGate, SD-WAN seguro, seguridad de APIs y protección de bases de datos críticas.
        3. IA: Consultoría de madurez digital, desarrollo de asistentes virtuales entrenados con datos del cliente y automatización de procesos (RPA + IA).

        REGLAS DE RESPUESTA:
        Debes responder estrictamente en un formato JSON estructurado con el siguiente esquema exacto de propiedades:
        {
          "pains": [ "dolor explicativo 1", "dolor explicativo 2", "dolor explicativo 3" ],
          "emailSubject": "Asunto comercial atractivo",
          "emailBody": "Texto completo del correo Warm Outreach..."
        }

        REGLAS PARA EL ANÁLISIS DE DOLORES ("pains"):
        - Genera exactamente 3 viñetas dinámicas explicativas de dolor sectorial.
        - Cada viñeta debe conectar un dolor específico del tomador de decisiones (ej: interrupciones de red, fuga de datos médicos, ineficiencia operativa, caídas de CRM) con el beneficio concreto que aporta la solución seleccionada de S&S.
        - Sé claro, conciso, utilizando lenguaje de negocios de alto nivel.

        REGLAS PARA EL CORREO ("emailBody" y "emailSubject"):
        - El asunto ("emailSubject") debe ser sumamente enganchador, corto y directo, libre de frases robotizadas.
        - El correo ("emailBody") debe ser hiper-personalizado, utilizando el nombre de la persona (o su cargo si no fue provisto).
        - Debe usar un trato profesional de "usted" y modismos propios del ámbito B2B corporativo colombiano, evitando robotismos ("estimado", "le escribo con el fin de", "espero se encuentre bien").
        - Debe de entrada mencionar el dolor latente del sector o de la empresa.
        - Debe presentar la solución elegida de S&S como el alivio idóneo a ese dolor.
        - Debe terminar con un llamado a la acción (CTA) de baja fricción proponiendo una breve sesión de diagnóstico de 15 minutos.
        - REGLA CRÍTICA DE EXTENSIÓN: El cuerpo del correo ("emailBody") debe tener MENOS DE 150 PALABRAS. Es un correo súper ágil, directo al punto y de alto impacto. No lo hagas largo ni sobrecargado.
      `;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pains: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactamente 3 viñetas concisas que conectan dolores con los beneficios de S&S IP SAS."
              },
              emailSubject: {
                type: Type.STRING,
                description: "Asunto del correo Warm Outreach. Atractivo, corto, sin robotismos."
              },
              emailBody: {
                type: Type.STRING,
                description: "Cuerpo del correo en español colombiano profesional, < 150 palabras."
              }
            },
            required: ["pains", "emailSubject", "emailBody"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No se pudo obtener una respuesta válida del modelo de lenguaje.");
      }

      const parsedData = JSON.parse(responseText.trim());
       res.json(parsedData);
    } catch (error: any) {
      console.error("Error generating outreach content:", error);
       res.status(500).json({
        error: "Error interno al procesar el análisis de prospecto.",
        details: error.message
      });
    }
  });

  // 2. Adviser Consulting Coach Session chat endpoint
  app.post("/api/chat", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { message, history } = req.body;

      if (!message) {
         res.status(400).json({ error: "El mensaje es obligatorio." });
         return;
      }

      const systemInstruction = `
        Eres "Smart Account Assistant", un consultor estratégico senior de ventas B2B y asesor táctico para el equipo comercial de S&S IP SAS en Colombia (Bogotá y Cali). Sueles aconsejar de manera brillante para destrabar comités de compras tecnológicos lentos, rebatir objeciones clásicas (como "está muy caro", "ya tenemos Fortinet con otro canal", "Ruckus contra Aruba/Unifi", "por qué MaxGP es mejor que HubSpot/Salesforce" o "por qué migrar PBX a la nube").

        PORTAFOLIO DE S&S IP SAS CON RELACIÓN A COMPROMISOS Y COMPETENCIAS:
        - Colaboración: Telefonía IP flexible, PBX (Avaya, Teams, Yealink), integraciones de videoconferencias colaborativas estables e integrales.
        - Ciberseguridad: Canal Oficial Fortinet Platinum. Servicio NGSOC (SOC administrado) 24/7 propio de S&S IP SAS, protección contra ransomware y fugas de datos.
        - IA: Soluciones de Inteligencia Artificial aplicada, RPA (automatización robótica de procesos) de oficina y agentes conversacionales entrenados con bases de conocimiento locales.

        DIRECTRICES DE COMUNICACIÓN:
        - Tono: Altamente constructivo, táctico, persuasivo, conocedor del mercado colombiano (negocios en Cali, Bogotá, Medellín).
        - Estructura: Divide tus respuestas en puntos sumamente prácticos con viñetas claras. Utiliza negritas para enfatizar.
        - Proporciona "Argumentos de Valor directos", "Un gancho comercial para decir de viva voz" y "Cómo manejar la objeción específica".
        - Brinda valor comercial real sobre el portafolio de S&S o sobre estrategias de ventas de TI corporativas.
      `;

      // Map chat history correctly
      const mappedHistory = history ? history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.parts[0]?.text || msg.text || "" }]
      })) : [];

      const response = await sendChatMessageWithFallback(message, mappedHistory, systemInstruction);
       res.json({
        text: response.text
      });
    } catch (error: any) {
      console.error("Error in sales coaching advisor chat:", error);
       res.status(500).json({
        error: "Error interno en el chat asesor comercial.",
        details: error.message
      });
    }
  });

  // Serve Frontend with Vite Middleware in Devon / Static assets in Production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with active Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Account Assistant backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Failed to boot Express application server:", err);
});
