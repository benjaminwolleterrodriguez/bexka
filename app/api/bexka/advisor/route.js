import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-5.4-mini";

/* =========================================================
   BEXKA DIRECT ADVISORS

   En modo directo:
   - Central NO aparece.
   - El Advisor seleccionado es el principal.
   - Puede detectar que otra perspectiva sería útil.
   - Pero NO consulta automáticamente a otro Advisor.
   - Primero debe pedir autorización al usuario.
========================================================= */

const ADVISORS = {
  strategy: {
    id: "strategy",

    name: "Strategy Advisor",

    shortName: "Strategy",

    area: "ESTRATEGIA",

    letter: "S",

    tone: "purple",

    specialty:
      "Estrategia, dirección, posicionamiento, prioridades, modelo de negocio y crecimiento.",

    instructions: `
Eres Strategy Advisor, uno de los especialistas de BEXKA.

Estás conversando DIRECTAMENTE con el usuario.

Tu función es actuar como especialista en:
- estrategia empresarial
- dirección
- prioridades
- posicionamiento
- propuesta de valor
- modelo de negocio
- crecimiento
- evaluación de alternativas estratégicas
- coherencia entre objetivos, recursos y capacidad de ejecución

PRINCIPIOS OBLIGATORIOS:

1. No inventes información del negocio.
2. Usa como hechos únicamente los datos entregados por el usuario o incluidos en su perfil confirmado.
3. Distingue hechos de hipótesis e inferencias.
4. Si falta información importante, dilo claramente.
5. No entregues números financieros inventados.
6. No recomiendes crecimiento sin considerar capacidad, recursos y restricciones.
7. Evita recomendaciones genéricas.
8. Prioriza decisiones y trade-offs.
9. Explica qué debería hacer primero el usuario.
10. No hables como BEXKA Central.
11. No digas que consultaste otros Advisors si no ocurrió.
12. Mantente dentro de tu especialidad.

COLABORACIÓN:

Si detectas que la consulta requiere una perspectiva relevante de otro Advisor, puedes PROPONER una consulta complementaria.

Los otros Advisors disponibles son:

marketing:
Marketing & Sales Advisor.
Clientes, comunicación, adquisición, conversión, ventas y fidelización.

finance:
Finance Advisor.
Costos, precios, márgenes, presupuesto, caja y evaluación económica.

management:
Management Advisor.
Procesos, capacidad, productividad, organización y operaciones.

IMPORTANTE:
- No consultes automáticamente a otro Advisor.
- Solo identifica si sería útil.
- Explica brevemente por qué.
- El usuario decidirá después si autoriza esa colaboración.
`,
  },

  marketing: {
    id: "marketing",

    name: "Marketing & Sales Advisor",

    shortName: "Marketing & Sales",

    area: "MARKETING & VENTAS",

    letter: "M",

    tone: "pink",

    specialty:
      "Clientes, comunicación, adquisición, conversión, ventas, canales y fidelización.",

    instructions: `
Eres Marketing & Sales Advisor, uno de los especialistas de BEXKA.

Estás conversando DIRECTAMENTE con el usuario.

Tu función es actuar como especialista en:
- clientes
- segmentación
- propuesta comercial
- comunicación
- adquisición
- canales
- embudo comercial
- conversión
- ventas
- fidelización
- experiencia comercial

PRINCIPIOS OBLIGATORIOS:

1. No inventes clientes, métricas, ventas ni resultados.
2. Usa como hechos únicamente los datos confirmados por el usuario.
3. Distingue hechos de hipótesis.
4. Diagnostica antes de recomendar.
5. No respondas automáticamente "publica más", "haz publicidad" o "invierte más".
6. Identifica en qué parte del proceso comercial puede estar el problema.
7. No asumas que una campaña será rentable.
8. Si faltan métricas comerciales, indícalo.
9. Prioriza acciones medibles y concretas.
10. No hables como BEXKA Central.
11. No digas que consultaste otro Advisor si no ocurrió.
12. Mantente dentro de tu especialidad.

COLABORACIÓN:

Si la situación necesita otra perspectiva, puedes PROPONER consultar a:

strategy:
Strategy Advisor.
Dirección, posicionamiento, modelo de negocio y prioridades.

finance:
Finance Advisor.
Costos, precios, margen, presupuesto y rentabilidad.

management:
Management Advisor.
Procesos, organización, capacidad y productividad.

IMPORTANTE:
- No consultes automáticamente a otro Advisor.
- Solo recomienda incorporarlo si realmente aporta.
- Explica brevemente por qué.
- El usuario decidirá si autoriza la consulta.
`,
  },

  finance: {
    id: "finance",

    name: "Finance Advisor",

    shortName: "Finance",

    area: "FINANZAS",

    letter: "F",

    tone: "blue",

    specialty:
      "Costos, precios, márgenes, presupuesto, caja, rentabilidad y evaluación económica.",

    instructions: `
Eres Finance Advisor, uno de los especialistas de BEXKA.

Estás conversando DIRECTAMENTE con el usuario.

Tu función es actuar como especialista en:
- costos
- estructura de costos
- precios
- margen
- rentabilidad
- presupuesto
- flujo de caja
- escenarios
- evaluación económica
- sostenibilidad financiera

REGLAS ESTRICTAS:

1. Nunca inventes números.
2. Nunca inventes ventas.
3. Nunca inventes costos.
4. Nunca inventes márgenes.
5. Nunca inventes presupuestos.
6. Nunca inventes caja disponible.
7. Si no existen datos suficientes para calcular, dilo explícitamente.
8. No presentes estimaciones como hechos.
9. Si utilizas un ejemplo hipotético, identifícalo claramente como ejemplo.
10. Separa datos confirmados de supuestos.
11. Prioriza caja, margen y sostenibilidad financiera.
12. No uses falsa precisión.
13. No hables como BEXKA Central.
14. No digas que consultaste otro Advisor si no ocurrió.
15. Mantente dentro de tu especialidad.

COLABORACIÓN:

Si una decisión financiera tiene implicancias fuera de tu especialidad, puedes PROPONER consultar a:

strategy:
Strategy Advisor.
Dirección, posicionamiento, crecimiento y prioridades.

marketing:
Marketing & Sales Advisor.
Clientes, ventas, conversión y adquisición.

management:
Management Advisor.
Capacidad, procesos, organización y productividad.

IMPORTANTE:
- No consultes automáticamente a otro Advisor.
- Explica por qué su perspectiva podría ser útil.
- Espera autorización del usuario.
`,
  },

  management: {
    id: "management",

    name: "Management Advisor",

    shortName: "Management",

    area: "GESTIÓN",

    letter: "G",

    tone: "cyan",

    specialty:
      "Procesos, organización, capacidad, productividad, responsabilidades y funcionamiento interno.",

    instructions: `
Eres Management Advisor, uno de los especialistas de BEXKA.

Estás conversando DIRECTAMENTE con el usuario.

Tu función es actuar como especialista en:
- procesos
- organización
- responsabilidades
- capacidad
- productividad
- operaciones
- coordinación interna
- indicadores
- herramientas de gestión
- mejora operacional

PRINCIPIOS OBLIGATORIOS:

1. No inventes procesos que el usuario no haya descrito.
2. No inventes problemas operativos.
3. Identifica primero el cuello de botella.
4. Evita sobreingeniería.
5. No recomiendes herramientas complejas cuando una solución simple pueda ser suficiente.
6. Distingue hechos de hipótesis.
7. Considera capacidad, personas, tiempo y carga operacional.
8. Si faltan datos, indícalo.
9. Prioriza mejoras simples y medibles.
10. No hables como BEXKA Central.
11. No digas que consultaste otro Advisor si no ocurrió.
12. Mantente dentro de tu especialidad.

COLABORACIÓN:

Si la consulta requiere otra perspectiva, puedes PROPONER consultar a:

strategy:
Strategy Advisor.
Dirección, crecimiento y prioridades.

marketing:
Marketing & Sales Advisor.
Clientes, ventas y adquisición.

finance:
Finance Advisor.
Costos, presupuesto, margen y caja.

IMPORTANTE:
- No consultes automáticamente a otro Advisor.
- Solo recomienda la colaboración.
- Explica brevemente el motivo.
- El usuario decide si autoriza.
`,
  },
};

/* =========================================================
   STRUCTURED OUTPUT
========================================================= */

const advisorResponseSchema = {
  type: "object",

  properties: {
    diagnosis: {
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

    risks: {
      type: "array",

      items: {
        type: "string",
      },
    },

    missingInformation: {
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

    collaborationNeeded: {
      type: "boolean",
    },

    suggestedAdvisorId: {
      type: ["string", "null"],

      enum: [
        "strategy",
        "marketing",
        "finance",
        "management",
        null,
      ],
    },

    collaborationReason: {
      type: ["string", "null"],
    },
  },

  required: [
    "diagnosis",
    "recommendation",
    "nextSteps",
    "risks",
    "missingInformation",
    "confidence",
    "collaborationNeeded",
    "suggestedAdvisorId",
    "collaborationReason",
  ],

  additionalProperties: false,
};

/* =========================================================
   BUSINESS PROFILE
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
   CONVERSATION HISTORY
========================================================= */

function historyToText(history = []) {
  if (
    !Array.isArray(history) ||
    history.length === 0
  ) {
    return `
HISTORIAL DE ESTA CONVERSACIÓN:

No existe historial previo.
`;
  }

  const sanitizedHistory =
    history
      .slice(-10)
      .map((message) => {
        const role =
          message?.role === "assistant"
            ? "ADVISOR"
            : "USUARIO";

        const content =
          String(
            message?.content || ""
          )
            .trim()
            .slice(0, 4000);

        return `${role}:\n${content}`;
      })
      .join("\n\n");

  return `
HISTORIAL RECIENTE DE ESTA CONVERSACIÓN:

${sanitizedHistory}
`;
}

/* =========================================================
   ASK DIRECT ADVISOR
========================================================= */

async function askAdvisor({
  advisor,
  message,
  businessProfile,
  history,
}) {
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
${profileToText(
  businessProfile
)}

${historyToText(
  history
)}

CONSULTA ACTUAL DEL USUARIO:

${message}

INSTRUCCIONES PARA ESTA RESPUESTA:

- Responde desde tu especialidad.
- Considera el historial solo como contexto de esta conversación.
- No conviertas automáticamente inferencias anteriores en hechos confirmados.
- Si el usuario aporta información nueva, puedes utilizarla en esta respuesta.
- El perfil empresarial representa información confirmada y persistente.
- Si necesitas otra especialidad, utiliza los campos de colaboración.
- No simules haber realizado una consulta que no ocurrió.
`,

      text: {
        format: {
          type: "json_schema",

          name:
            `bexka_${advisor.id}_direct_response`,

          strict: true,

          schema:
            advisorResponseSchema,
        },
      },
    });

  return JSON.parse(
    response.output_text
  );
}

/* =========================================================
   VALIDATE COLLABORATION
========================================================= */

function normalizeCollaboration(
  result,
  currentAdvisorId
) {
  const normalized = {
    ...result,
  };

  if (
    !normalized.collaborationNeeded
  ) {
    normalized.suggestedAdvisorId =
      null;

    normalized.collaborationReason =
      null;

    return normalized;
  }

  const suggestedId =
    normalized.suggestedAdvisorId;

  if (
    !suggestedId ||
    !ADVISORS[suggestedId] ||
    suggestedId === currentAdvisorId
  ) {
    normalized.collaborationNeeded =
      false;

    normalized.suggestedAdvisorId =
      null;

    normalized.collaborationReason =
      null;
  }

  return normalized;
}

/* =========================================================
   POST /api/bexka/advisor
========================================================= */

export async function POST(request) {
  try {
    /* -----------------------------------------------------
       API KEY
    ----------------------------------------------------- */

    if (
      !process.env.OPENAI_API_KEY
    ) {
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

    /* -----------------------------------------------------
       BODY
    ----------------------------------------------------- */

    const body =
      await request.json();

    const advisorId =
      String(
        body?.advisorId || ""
      ).trim();

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

    const history =
      Array.isArray(body?.history)
        ? body.history
        : [];

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!advisorId) {
      return Response.json(
        {
          error:
            "Debes indicar un Advisor.",
        },

        {
          status: 400,
        }
      );
    }

    const advisor =
      ADVISORS[advisorId];

    if (!advisor) {
      return Response.json(
        {
          error:
            "El Advisor solicitado no existe.",
        },

        {
          status: 400,
        }
      );
    }

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

    /* -----------------------------------------------------
       REAL AI CALL
    ----------------------------------------------------- */

    const rawResult =
      await askAdvisor({
        advisor,
        message,
        businessProfile,
        history,
      });

    const result =
      normalizeCollaboration(
        rawResult,
        advisorId
      );

    /* -----------------------------------------------------
       SUGGESTED ADVISOR METADATA
    ----------------------------------------------------- */

    let suggestedAdvisor =
      null;

    if (
      result.collaborationNeeded &&
      result.suggestedAdvisorId
    ) {
      const suggested =
        ADVISORS[
          result.suggestedAdvisorId
        ];

      if (suggested) {
        suggestedAdvisor = {
          id:
            suggested.id,

          name:
            suggested.name,

          shortName:
            suggested.shortName,

          area:
            suggested.area,

          letter:
            suggested.letter,

          tone:
            suggested.tone,

          reason:
            result.collaborationReason,
        };
      }
    }

    /* -----------------------------------------------------
       FRONTEND RESPONSE
    ----------------------------------------------------- */

    return Response.json({
      advisor: {
        id:
          advisor.id,

        name:
          advisor.name,

        shortName:
          advisor.shortName,

        area:
          advisor.area,

        letter:
          advisor.letter,

        tone:
          advisor.tone,
      },

      analysis: {
        diagnosis:
          result.diagnosis,

        recommendation:
          result.recommendation,

        nextSteps:
          result.nextSteps,

        risks:
          result.risks,

        missingInformation:
          result.missingInformation,

        confidence:
          result.confidence,

        collaborationNeeded:
          result.collaborationNeeded,

        suggestedAdvisor:
          suggestedAdvisor,
      },

      meta: {
        mode:
          "direct-advisor",

        advisorId:
          advisor.id,

        model:
          MODEL,
      },
    });
  } catch (error) {
    console.error(
      "BEXKA Direct Advisor API:",
      error
    );

    return Response.json(
      {
        error:
          "El Advisor no pudo completar el análisis. Revisa la terminal para ver el error.",
      },

      {
        status: 500,
      }
    );
  }
}