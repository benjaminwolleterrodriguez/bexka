import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-5.4-mini";

/* =========================================================
   ADVISORS
========================================================= */

const ADVISORS = {
  strategy: {
    id: "strategy",
    name: "Strategy",
    letter: "S",
    tone: "purple",
    status:
      "Analizando estrategia y prioridades",

    instructions: `
Eres Strategy Advisor dentro de BEXKA.

Tu especialidad es:
- estrategia empresarial
- dirección
- prioridades
- posicionamiento
- modelo de negocio
- crecimiento

REGLAS:
- No inventes datos.
- Usa como hechos únicamente la información confirmada por el usuario.
- Distingue hechos de inferencias.
- Si falta información crítica, dilo.
- No inventes cifras financieras.
- No recomiendes crecimiento sin considerar capacidad y restricciones.
- Evita recomendaciones genéricas.
- Estás asesorando a BEXKA Central, no hablando directamente con el usuario.
`,
  },

  marketing: {
    id: "marketing",
    name: "Marketing & Sales",
    letter: "M",
    tone: "pink",
    status:
      "Analizando clientes, ventas y conversión",

    instructions: `
Eres Marketing & Sales Advisor dentro de BEXKA.

Tu especialidad es:
- clientes
- propuesta comercial
- comunicación
- adquisición
- canales
- conversión
- ventas
- fidelización

REGLAS:
- No inventes clientes, métricas ni resultados.
- No recomiendes simplemente publicar más o invertir más.
- Diagnostica primero dónde está el problema comercial.
- Distingue hechos de inferencias.
- Si falta información, dilo.
- No asumas que una campaña será rentable.
- Estás asesorando a BEXKA Central, no hablando directamente con el usuario.
`,
  },

  finance: {
    id: "finance",
    name: "Finance",
    letter: "F",
    tone: "blue",
    status:
      "Evaluando impacto económico",

    instructions: `
Eres Finance Advisor dentro de BEXKA.

Tu especialidad es:
- costos
- precios
- márgenes
- presupuesto
- caja
- rentabilidad
- escenarios
- evaluación económica

REGLAS ESTRICTAS:
- Nunca inventes números.
- Nunca inventes ventas, costos, márgenes o presupuestos.
- Si faltan datos para calcular algo, dilo.
- Diferencia claramente hechos de supuestos.
- No presentes estimaciones como hechos.
- Prioriza sostenibilidad financiera y caja.
- Estás asesorando a BEXKA Central, no hablando directamente con el usuario.
`,
  },

  management: {
    id: "management",
    name: "Management",
    letter: "G",
    tone: "cyan",
    status:
      "Revisando procesos y capacidad operativa",

    instructions: `
Eres Management Advisor dentro de BEXKA.

Tu especialidad es:
- procesos
- organización
- responsabilidades
- capacidad
- productividad
- operaciones
- indicadores
- herramientas de gestión

REGLAS:
- No inventes procesos.
- Identifica primero el cuello de botella.
- Evita sobreingeniería.
- No recomiendes herramientas complejas si existe una solución más simple.
- Distingue hechos de hipótesis.
- Si faltan datos, dilo.
- Considera personas, capacidad y carga operacional.
- Estás asesorando a BEXKA Central, no hablando directamente con el usuario.
`,
  },
};

/* =========================================================
   JSON SCHEMAS
========================================================= */

const routingSchema = {
  type: "object",

  properties: {
    advisorIds: {
      type: "array",

      items: {
        type: "string",

        enum: [
          "strategy",
          "marketing",
          "finance",
          "management",
        ],
      },
    },

    contextStatus: {
      type: "string",

      enum: [
        "sufficient",
        "partial",
        "insufficient",
      ],
    },

    routingSummary: {
      type: "string",
    },
  },

  required: [
    "advisorIds",
    "contextStatus",
    "routingSummary",
  ],

  additionalProperties: false,
};

const specialistSchema = {
  type: "object",

  properties: {
    diagnosis: {
      type: "string",
    },

    recommendation: {
      type: "string",
    },

    risks: {
      type: "array",

      items: {
        type: "string",
      },
    },

    nextSteps: {
      type: "array",

      items: {
        type: "string",
      },
    },

    confidence: {
      type: "string",

      enum: [
        "Alta",
        "Media",
        "Baja",
        "Insuficiente",
      ],
    },

    missingInformation: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "diagnosis",
    "recommendation",
    "risks",
    "nextSteps",
    "confidence",
    "missingInformation",
  ],

  additionalProperties: false,
};

const synthesisSchema = {
  type: "object",

  properties: {
    observation: {
      type: "string",
    },

    priority: {
      type: "string",
    },

    recommendation: {
      type: "string",
    },

    nextSteps: {
      type: "array",

      items: {
        type: "string",
      },
    },

    confidence: {
      type: "string",

      enum: [
        "Alta",
        "Media",
        "Baja",
        "Insuficiente",
      ],
    },

    missingInformation: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "observation",
    "priority",
    "recommendation",
    "nextSteps",
    "confidence",
    "missingInformation",
  ],

  additionalProperties: false,
};

/* =========================================================
   HELPERS
========================================================= */

function profileToText(profile = {}) {
  return `
PERFIL CONFIRMADO DEL NEGOCIO

Nombre:
${profile.name || "No informado"}

Rubro:
${profile.industry || "No informado"}

Descripción:
${profile.description || "No informado"}

Productos o servicios:
${profile.products || "No informado"}

Cliente objetivo:
${profile.targetCustomer || "No informado"}

Canales de venta:
${profile.salesChannels || "No informado"}

Objetivos actuales:
${profile.goals || "No informado"}

Principales desafíos:
${profile.challenges || "No informado"}

País o mercado:
${profile.country || "No informado"}

Moneda:
${profile.currency || "No informado"}

Tamaño del equipo:
${profile.teamSize || "No informado"}

Sitio web informado por el usuario:
${profile.website || "No informado"}

Notas adicionales:
${profile.notes || "No informado"}
`;
}

/* =========================================================
   CENTRAL — ROUTING
========================================================= */

async function routeQuestion({
  message,
  businessProfile,
}) {
  const response =
    await openai.responses.create({
      model: MODEL,

      store: false,

      reasoning: {
        effort: "low",
      },

      instructions: `
Eres BEXKA Central.

BEXKA es una plataforma de inteligencia empresarial formada por un coordinador central y cuatro Advisors especializados.

Dispones de:

strategy:
estrategia, dirección, crecimiento, posicionamiento y prioridades.

marketing:
clientes, comunicación, adquisición, conversión, ventas y fidelización.

finance:
costos, precios, margen, presupuesto, caja y evaluación económica.

management:
procesos, organización, capacidad, productividad y operaciones.

TU TAREA EN ESTA ETAPA ES SOLO ENRUTAR LA CONSULTA.

Debes determinar qué especialistas son necesarios.

REGLAS:
- Selecciona solamente entre 1 y 2 Advisors.
- No selecciones especialistas innecesarios.
- No inventes información.
- El perfil del negocio contiene únicamente hechos confirmados por el usuario.
- Si falta información, indícalo mediante contextStatus.
- No entregues todavía la respuesta final.
- routingSummary debe explicar brevemente por qué elegiste esas perspectivas.
`,

      input: `
${profileToText(businessProfile)}

CONSULTA ACTUAL:

${message}
`,

      text: {
        format: {
          type: "json_schema",
          name: "bexka_routing",
          strict: true,
          schema: routingSchema,
        },
      },
    });

  const routing =
    JSON.parse(response.output_text);

  const validIds = [
    ...new Set(
      routing.advisorIds.filter(
        (id) => ADVISORS[id]
      )
    ),
  ].slice(0, 2);

  if (validIds.length === 0) {
    validIds.push("strategy");
  }

  return {
    ...routing,
    advisorIds: validIds,
  };
}

/* =========================================================
   SPECIALIST
========================================================= */

async function consultAdvisor({
  advisorId,
  message,
  businessProfile,
}) {
  const advisor =
    ADVISORS[advisorId];

  if (!advisor) {
    throw new Error(
      `Advisor desconocido: ${advisorId}`
    );
  }

  const response =
    await openai.responses.create({
      model: MODEL,

      store: false,

      reasoning: {
        effort: "low",
      },

      instructions:
        advisor.instructions,

      input: `
${profileToText(businessProfile)}

CONSULTA DEL USUARIO:

${message}

Analiza esta situación únicamente desde tu especialidad.

Tu análisis será entregado a BEXKA Central.
`,

      text: {
        format: {
          type: "json_schema",
          name: `bexka_${advisorId}_analysis`,
          strict: true,
          schema: specialistSchema,
        },
      },
    });

  return {
    advisorId,

    analysis:
      JSON.parse(
        response.output_text
      ),
  };
}

/* =========================================================
   CENTRAL — SYNTHESIS
========================================================= */

async function synthesizeAnswer({
  message,
  businessProfile,
  routing,
  specialistResults,
}) {
  const response =
    await openai.responses.create({
      model: MODEL,

      store: false,

      reasoning: {
        effort: "low",
      },

      instructions: `
Eres BEXKA Central.

Ahora debes integrar los análisis de los Advisors en una sola respuesta para el usuario.

PRINCIPIOS:

- No inventes información.
- El perfil contiene hechos confirmados.
- Los análisis de los Advisors son interpretaciones, no hechos nuevos.
- Si falta información crítica, dilo claramente.
- Si existen tensiones entre recomendaciones, resuelve el trade-off.
- Prioriza acciones concretas.
- No uses falsa precisión.
- No inventes cifras ni porcentajes.
- La confianza debe reflejar la calidad del contexto disponible.
- "Insuficiente" es una confianza válida.
- No digas que participó un Advisor que no aparezca en los análisis.
- Los siguientes pasos deben estar ordenados.
- Es preferible reconocer una limitación que producir una recomendación incorrecta.

La respuesta debe sentirse como una recomendación integrada de un equipo empresarial.
`,

      input: `
${profileToText(businessProfile)}

CONSULTA ORIGINAL:

${message}

DECISIÓN DE ROUTING:

${JSON.stringify(
  routing,
  null,
  2
)}

ANÁLISIS DE LOS ADVISORS:

${JSON.stringify(
  specialistResults,
  null,
  2
)}
`,

      text: {
        format: {
          type: "json_schema",
          name: "bexka_integrated_answer",
          strict: true,
          schema: synthesisSchema,
        },
      },
    });

  return JSON.parse(
    response.output_text
  );
}

/* =========================================================
   POST
========================================================= */

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "La API key de OpenAI no está configurada.",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await request.json();

    const message =
      String(
        body?.message || ""
      ).trim();

    const businessProfile =
      body?.businessProfile &&
      typeof body.businessProfile ===
        "object"
        ? body.businessProfile
        : {};

    if (!message) {
      return Response.json(
        {
          error:
            "Debes enviar una consulta.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 8000) {
      return Response.json(
        {
          error:
            "La consulta es demasiado larga.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       1. CENTRAL DECIDE QUÉ ADVISORS NECESITA
    ===================================================== */

    const routing =
      await routeQuestion({
        message,
        businessProfile,
      });

    /* =====================================================
       2. CONSULTA A LOS ADVISORS
    ===================================================== */

    const specialistResults =
      await Promise.all(
        routing.advisorIds.map(
          (advisorId) =>
            consultAdvisor({
              advisorId,
              message,
              businessProfile,
            })
        )
      );

    /* =====================================================
       3. CENTRAL INTEGRA LAS RESPUESTAS
    ===================================================== */

    const synthesis =
      await synthesizeAnswer({
        message,
        businessProfile,
        routing,
        specialistResults,
      });

    /* =====================================================
       4. FORMATO PARA TU INTERFAZ
    ===================================================== */

    const selectedAdvisors =
      routing.advisorIds.map(
        (advisorId) => {
          const advisor =
            ADVISORS[advisorId];

          return {
            id: advisor.id,
            name: advisor.name,
            status: advisor.status,
            letter: advisor.letter,
            tone: advisor.tone,
          };
        }
      );

    return Response.json({
      analysis: {
        advisors:
          selectedAdvisors,

        observation:
          synthesis.observation,

        priority:
          synthesis.priority,

        recommendation:
          synthesis.recommendation,

        nextSteps:
          synthesis.nextSteps,

        confidence:
          synthesis.confidence,

        missingInformation:
          synthesis.missingInformation,
      },

      meta: {
        mode: "integral",

        advisorsUsed:
          routing.advisorIds,

        contextStatus:
          routing.contextStatus,

        model: MODEL,
      },
    });
  } catch (error) {
    console.error(
      "BEXKA Integral API:",
      error
    );

    return Response.json(
      {
        error:
          "BEXKA no pudo completar el análisis. Revisa la terminal para ver el error.",
      },
      {
        status: 500,
      }
    );
  }
}