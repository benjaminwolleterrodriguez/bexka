"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

/* =========================================================
   ADVISORS
========================================================= */

const advisors = [
  {
    id: "strategy",
    area: "ESTRATEGIA",
    shortName: "Strategy",
    name: "Strategy Advisor",
    description:
      "Dirección, prioridades, posicionamiento, modelo de negocio y crecimiento.",
    letter: "S",
    tone: "purple",
    specialty:
      "Estrategia, prioridades, posicionamiento, crecimiento y modelo de negocio.",
  },
  {
    id: "marketing",
    area: "MARKETING & VENTAS",
    shortName: "Marketing & Sales",
    name: "Marketing & Sales Advisor",
    description:
      "Clientes, comunicación, adquisición, conversión, ventas y fidelización.",
    letter: "M",
    tone: "pink",
    specialty:
      "Clientes, comunicación, adquisición, conversión, ventas y fidelización.",
  },
  {
    id: "finance",
    area: "FINANZAS",
    shortName: "Finance",
    name: "Finance Advisor",
    description:
      "Costos, precios, márgenes, presupuesto y evaluación económica.",
    letter: "F",
    tone: "blue",
    specialty:
      "Costos, precios, márgenes, presupuesto, caja y evaluación económica.",
  },
  {
    id: "management",
    area: "GESTIÓN",
    shortName: "Management",
    name: "Management Advisor",
    description:
      "Procesos, organización, capacidad, productividad y funcionamiento interno.",
    letter: "G",
    tone: "cyan",
    specialty:
      "Procesos, organización, capacidad, productividad y funcionamiento interno.",
  },
];

/* =========================================================
   BUSINESS PROFILE
========================================================= */

const emptyBusinessProfile = {
  name: "",
  industry: "",
  description: "",
  products: "",
  targetCustomer: "",
  salesChannels: "",
  goals: "",
  challenges: "",
  country: "Chile",
  currency: "CLP",
  teamSize: "",
  website: "",
  notes: "",
};

/* =========================================================
   HELPERS
========================================================= */

function analysisToHistoryText(analysis) {
  if (!analysis) return "";

  const parts = [];

  if (analysis.diagnosis) {
    parts.push(`Diagnóstico: ${analysis.diagnosis}`);
  }

  if (analysis.recommendation) {
    parts.push(
      `Recomendación: ${analysis.recommendation}`
    );
  }

  if (
    Array.isArray(analysis.nextSteps) &&
    analysis.nextSteps.length > 0
  ) {
    parts.push(
      `Siguientes pasos: ${analysis.nextSteps.join(
        " | "
      )}`
    );
  }

  if (
    Array.isArray(analysis.risks) &&
    analysis.risks.length > 0
  ) {
    parts.push(
      `Riesgos: ${analysis.risks.join(" | ")}`
    );
  }

  if (
    Array.isArray(
      analysis.missingInformation
    ) &&
    analysis.missingInformation.length > 0
  ) {
    parts.push(
      `Información faltante: ${analysis.missingInformation.join(
        " | "
      )}`
    );
  }

  if (analysis.confidence) {
    parts.push(
      `Confianza: ${analysis.confidence}`
    );
  }

  return parts.join("\n");
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Home() {
  const router = useRouter();

  const [screen, setScreen] =
    useState("home");

  /* =========================================================
     BUSINESS PROFILE
  ========================================================= */

  const [
    businessProfile,
    setBusinessProfile,
  ] = useState(emptyBusinessProfile);

  const [
    profileDraft,
    setProfileDraft,
  ] = useState(emptyBusinessProfile);

  const [
    profileReturnScreen,
    setProfileReturnScreen,
  ] = useState("home");

  const [
    profileSaved,
    setProfileSaved,
  ] = useState(false);

  const profileFields = [
    businessProfile.name,
    businessProfile.industry,
    businessProfile.description,
    businessProfile.products,
    businessProfile.targetCustomer,
    businessProfile.salesChannels,
    businessProfile.goals,
    businessProfile.challenges,
    businessProfile.country,
    businessProfile.currency,
    businessProfile.teamSize,
  ];

  const completedProfileFields =
    profileFields.filter((value) =>
      String(value || "").trim()
    ).length;

  const profileProgress =
    Math.round(
      (completedProfileFields /
        profileFields.length) *
        100
    );

  const hasBusinessContext =
    businessProfile.name.trim() !== "";

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    try {
      const savedProfile =
        window.localStorage.getItem(
          "bexka-business-profile"
        );

      if (savedProfile) {
        const parsedProfile =
          JSON.parse(savedProfile);

        const normalizedProfile = {
          ...emptyBusinessProfile,
          ...parsedProfile,
        };

        setBusinessProfile(
          normalizedProfile
        );

        setProfileDraft(
          normalizedProfile
        );
      }
    } catch (error) {
      console.error(
        "No se pudo cargar el perfil BEXKA:",
        error
      );
    }
  }, []);

  /* =========================================================
     BEXKA INTEGRAL
  ========================================================= */

  const [
    integralInput,
    setIntegralInput,
  ] = useState("");

  const [
    integralQuestion,
    setIntegralQuestion,
  ] = useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [
    integralLoading,
    setIntegralLoading,
  ] = useState(false);

  const [
    integralError,
    setIntegralError,
  ] = useState("");

  /* =========================================================
     DIRECT ADVISORS
  ========================================================= */

  const [
    selectedAdvisorId,
    setSelectedAdvisorId,
  ] = useState(null);

  const [
    advisorInput,
    setAdvisorInput,
  ] = useState("");

  const [
    advisorSessions,
    setAdvisorSessions,
  ] = useState({});

  const selectedAdvisor =
    advisors.find(
      (advisor) =>
        advisor.id === selectedAdvisorId
    ) || null;

  const currentAdvisorSession =
    selectedAdvisorId
      ? advisorSessions[
          selectedAdvisorId
        ] || null
      : null;

  const advisorLoading =
    currentAdvisorSession?.loading ||
    false;

  const advisorError =
    currentAdvisorSession?.error ||
    "";

  /* =========================================================
     AUTH
  ========================================================= */

  async function handleLogout() {
    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Error cerrando sesión en BEXKA:",
        error
      );
    }
  }

  /* =========================================================
     PROFILE FUNCTIONS
  ========================================================= */

  function openProfile() {
    setProfileReturnScreen(screen);

    setProfileDraft(
      businessProfile
    );

    setProfileSaved(false);

    setScreen("profile");
  }

  function closeProfile() {
    setProfileDraft(
      businessProfile
    );

    setProfileSaved(false);

    if (
      profileReturnScreen === "profile"
    ) {
      setScreen("home");
      return;
    }

    setScreen(
      profileReturnScreen
    );
  }

  function updateProfileField(
    field,
    value
  ) {
    setProfileDraft(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setProfileSaved(false);
  }

  function saveBusinessProfile() {
    const normalizedProfile = {
      ...emptyBusinessProfile,
      ...profileDraft,
    };

    setBusinessProfile(
      normalizedProfile
    );

    try {
      window.localStorage.setItem(
        "bexka-business-profile",
        JSON.stringify(
          normalizedProfile
        )
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el perfil BEXKA:",
        error
      );
    }

    setProfileSaved(true);
  }

  function clearBusinessProfile() {
    setProfileDraft(
      emptyBusinessProfile
    );

    setBusinessProfile(
      emptyBusinessProfile
    );

    setProfileSaved(false);

    try {
      window.localStorage.removeItem(
        "bexka-business-profile"
      );
    } catch (error) {
      console.error(
        "No se pudo limpiar el perfil BEXKA:",
        error
      );
    }
  }

  /* =========================================================
     BEXKA INTEGRAL — REAL AI
  ========================================================= */

  async function sendIntegralMessage() {
    const cleanMessage =
      integralInput.trim();

    if (
      !cleanMessage ||
      integralLoading
    ) {
      return;
    }

    setIntegralQuestion(
      cleanMessage
    );

    setIntegralInput("");
    setIntegralError("");
    setAnalysis(null);
    setIntegralLoading(true);

    try {
      const response =
        await fetch(
          "/api/bexka/integral",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message:
                cleanMessage,

              businessProfile,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "BEXKA no pudo completar el análisis."
        );
      }

      if (!data?.analysis) {
        throw new Error(
          "El servidor no devolvió un análisis válido."
        );
      }

      setAnalysis(
        data.analysis
      );
    } catch (error) {
      console.error(
        "Error en BEXKA Integral:",
        error
      );

      setIntegralError(
        error?.message ||
          "Ocurrió un error al consultar BEXKA."
      );
    } finally {
      setIntegralLoading(false);
    }
  }

  function resetIntegralAnalysis() {
    setIntegralQuestion("");
    setIntegralInput("");
    setAnalysis(null);
    setIntegralError("");
    setIntegralLoading(false);
  }

  /* =========================================================
     OPEN DIRECT ADVISOR
  ========================================================= */

  function openAdvisor(
    advisorId
  ) {
    setSelectedAdvisorId(
      advisorId
    );

    setAdvisorInput("");
    setScreen("advisor");
  }

  /* =========================================================
     DIRECT ADVISOR — REAL AI
  ========================================================= */

  async function sendAdvisorMessage() {
    if (
      !selectedAdvisorId ||
      advisorLoading
    ) {
      return;
    }

    const cleanMessage =
      advisorInput.trim();

    if (!cleanMessage) {
      return;
    }

    const previousSession =
      advisorSessions[
        selectedAdvisorId
      ] || {
        messages: [],
      };

    const previousMessages =
      Array.isArray(
        previousSession.messages
      )
        ? previousSession.messages
        : [];

    const historyForApi =
      previousMessages.slice(-10);

    setAdvisorInput("");

    setAdvisorSessions(
      (previousSessions) => ({
        ...previousSessions,

        [selectedAdvisorId]: {
          ...(previousSessions[
            selectedAdvisorId
          ] || {}),

          question:
            cleanMessage,

          loading: true,

          error: "",

          consultedAdvisor:
            null,
        },
      })
    );

    try {
      const response =
        await fetch(
          "/api/bexka/advisor",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              advisorId:
                selectedAdvisorId,

              message:
                cleanMessage,

              businessProfile,

              history:
                historyForApi,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "El Advisor no pudo completar el análisis."
        );
      }

      if (!data?.analysis) {
        throw new Error(
          "El servidor no devolvió un análisis válido."
        );
      }

      const advisorHistoryText =
        analysisToHistoryText(
          data.analysis
        );

      setAdvisorSessions(
        (previousSessions) => {
          const existingSession =
            previousSessions[
              selectedAdvisorId
            ] || {};

          const existingMessages =
            Array.isArray(
              existingSession.messages
            )
              ? existingSession.messages
              : [];

          return {
            ...previousSessions,

            [selectedAdvisorId]: {
              ...existingSession,

              question:
                cleanMessage,

              analysis:
                data.analysis,

              messages: [
                ...existingMessages,
                {
                  role: "user",
                  content:
                    cleanMessage,
                },
                {
                  role:
                    "assistant",
                  content:
                    advisorHistoryText,
                },
              ],

              loading: false,
              error: "",
              consultedAdvisor:
                null,
            },
          };
        }
      );
    } catch (error) {
      console.error(
        "BEXKA Direct Advisor:",
        error
      );

      setAdvisorSessions(
        (previousSessions) => ({
          ...previousSessions,

          [selectedAdvisorId]: {
            ...(previousSessions[
              selectedAdvisorId
            ] || {}),

            question:
              cleanMessage,

            loading: false,

            error:
              error?.message ||
              "Ocurrió un error al consultar al Advisor.",
          },
        })
      );
    }
  }

  /* =========================================================
     RESET DIRECT ADVISOR
  ========================================================= */

  function resetAdvisorConversation() {
    if (!selectedAdvisorId) {
      return;
    }

    setAdvisorSessions(
      (previousSessions) => ({
        ...previousSessions,

        [selectedAdvisorId]:
          null,
      })
    );

    setAdvisorInput("");
  }

  /* =========================================================
     CROSS-ADVISOR DEMO
  ========================================================= */

  function acceptAdvisorConsultation() {
    if (
      !selectedAdvisorId ||
      !currentAdvisorSession?.analysis
    ) {
      return;
    }

    const suggestedAdvisor =
      currentAdvisorSession
        .analysis
        .suggestedAdvisor;

    if (!suggestedAdvisor) {
      return;
    }

    setAdvisorSessions(
      (previousSessions) => ({
        ...previousSessions,

        [selectedAdvisorId]: {
          ...previousSessions[
            selectedAdvisorId
          ],

          consultedAdvisor: {
            id:
              suggestedAdvisor.id,

            name:
              suggestedAdvisor.shortName,

            letter:
              suggestedAdvisor.letter,

            tone:
              suggestedAdvisor.tone,

            contribution:
              "Colaboración autorizada. La consulta real entre Advisors se incorporará en una etapa posterior del prototipo.",
          },
        },
      })
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="bexka-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="noise" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="topbar">
        {screen === "home" ? (
          <div className="home-brand">
            <strong>BEXKA</strong>

            <span>
              BUSINESS, EVOLVED.
            </span>
          </div>
        ) : (
          <button
            className="bexka-brand"
            onClick={() =>
              setScreen("home")
            }
            aria-label="Volver al inicio"
          >
            <img
              src="/bexka-icon.png"
              alt=""
              width="38"
              height="38"
              style={{
                width: "38px",
                height: "38px",
                maxWidth: "38px",
                objectFit: "contain",
              }}
            />

            <span>BEXKA</span>
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            className={`profile-button ${
              hasBusinessContext
                ? "profile-button-ready"
                : ""
            }`}
            onClick={openProfile}
            aria-label="Abrir perfil del negocio"
          >
            {businessProfile.name
              ? businessProfile.name
                  .charAt(0)
                  .toUpperCase()
              : "B"}
          </button>

          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            style={{
              height: "38px",
              padding: "0 15px",
              borderRadius: "11px",
              border:
                "1px solid rgba(255,255,255,0.08)",
              background:
                "rgba(255,255,255,0.025)",
              color:
                "rgba(255,255,255,0.52)",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "180ms ease",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section
        className={`content ${
          screen === "integral" ||
          screen === "advisor" ||
          screen === "profile"
            ? "content-workspace"
            : ""
        }`}
      >
        {/* ===================================================
            HOME
        ==================================================== */}

        {screen === "home" && (
          <div className="home-screen screen-enter">
            <div className="home-logo-stage">
              <div className="home-logo-glow glow-xl" />
              <div className="home-logo-glow glow-md" />
              <div className="home-logo-glow glow-core" />

              <div className="home-light-line line-a" />
              <div className="home-light-line line-b" />

              <img
                src="/bexka-icon.png"
                alt="BEXKA"
                className="home-main-logo"
                width="215"
                height="215"
                style={{
                  width: "215px",
                  height: "215px",
                  maxWidth: "215px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="home-copy">
              <h1>
                ¿En qué trabajamos{" "}
                <span>hoy?</span>
              </h1>

              <p>
                Inteligencia aplicada a las
                decisiones de tu negocio.
              </p>
            </div>

            <button
              className="enter-button"
              onClick={() =>
                setScreen("mode")
              }
            >
              ENTRAR
            </button>

            <p className="home-note">
              Un contexto. Distintos advisors.
              Mejores decisiones.
            </p>
          </div>
        )}

        {/* ===================================================
            MODE
        ==================================================== */}

        {screen === "mode" && (
          <div className="mode-screen screen-enter">
            <button
              className="back-button"
              onClick={() =>
                setScreen("home")
              }
            >
              <span>←</span>
              Volver
            </button>

            <div className="mode-visual">
              <div className="mode-orbit orbit-a" />
              <div className="mode-orbit orbit-b" />
              <div className="mode-logo-glow" />

              <img
                src="/bexka-icon.png"
                alt="BEXKA"
                className="mode-logo"
                width="118"
                height="118"
                style={{
                  width: "118px",
                  height: "118px",
                  maxWidth: "118px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div className="mode-heading">
              <span className="mode-kicker">
                ELIGE TU EXPERIENCIA
              </span>

              <h2>
                ¿Cómo quieres
                <br />
                trabajar{" "}
                <span>hoy?</span>
              </h2>

              <p>
                Puedes trabajar con BEXKA de
                forma integral o entrar
                directamente a un advisor
                especializado.
              </p>
            </div>

            <div className="experience-grid">
              <button
                className="experience-card experience-integral"
                onClick={() =>
                  setScreen("integral")
                }
              >
                <div className="card-light card-light-purple" />
                <div className="card-ring card-ring-purple" />

                <div className="card-copy">
                  <h3>BEXKA Integral</h3>

                  <p>
                    Cuéntame qué está pasando.
                    BEXKA analizará la situación,
                    seleccionará a los advisors
                    necesarios y reunirá sus
                    perspectivas en una sola
                    respuesta clara y accionable.
                  </p>
                </div>
              </button>

              <button
                className="experience-card experience-advisor"
                onClick={() =>
                  setScreen("advisors")
                }
              >
                <div className="card-light card-light-blue" />
                <div className="card-ring card-ring-blue" />

                <div className="card-copy">
                  <h3>
                    Advisor especializado
                  </h3>

                  <p>
                    Entra directamente al área que
                    necesitas y conversa con un
                    especialista en Strategy,
                    Marketing & Sales, Finance o
                    Management.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            BUSINESS PROFILE
        ==================================================== */}

        {screen === "profile" && (
          <div className="business-profile-screen screen-enter">
            <aside className="profile-sidebar">
              <button
                className="profile-back"
                onClick={closeProfile}
              >
                <span>←</span>
                Volver
              </button>

              <div className="profile-brand">
                <div className="profile-logo-wrap">
                  <div className="profile-logo-glow" />

                  <img
                    src="/bexka-icon.png"
                    alt="BEXKA"
                    width="48"
                    height="48"
                    style={{
                      width: "48px",
                      height: "48px",
                      maxWidth: "48px",
                      objectFit: "contain",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </div>

                <div>
                  <strong>BEXKA</strong>

                  <span>
                    BUSINESS PROFILE
                  </span>
                </div>
              </div>

              <div className="profile-progress-block">
                <div className="profile-progress-header">
                  <span>
                    CONTEXTO CONFIGURADO
                  </span>

                  <strong>
                    {profileProgress}%
                  </strong>
                </div>

                <div className="profile-progress-track">
                  <div
                    className="profile-progress-value"
                    style={{
                      width: `${profileProgress}%`,
                    }}
                  />
                </div>

                <p>
                  Mientras más contexto confirmes,
                  más precisas podrán ser las
                  recomendaciones de BEXKA.
                </p>
              </div>

              <div className="profile-context-info">
                <span className="profile-small-label">
                  CONTEXTO COMPARTIDO
                </span>

                <div className="profile-context-item">
                  <span className="context-live-dot" />

                  <div>
                    <strong>
                      BEXKA Integral
                    </strong>

                    <small>
                      Acceso al contexto confirmado
                    </small>
                  </div>
                </div>

                <div className="profile-context-item">
                  <span className="context-live-dot" />

                  <div>
                    <strong>
                      Advisors
                    </strong>

                    <small>
                      Solo información relevante
                    </small>
                  </div>
                </div>
              </div>

              <div className="profile-sidebar-note">
                BEXKA separa los datos confirmados
                de las inferencias de los agentes.
              </div>
            </aside>

            <section className="profile-main">
              <div className="profile-main-inner">
                <div className="profile-heading">
                  <span>
                    CONTEXTO DEL NEGOCIO
                  </span>

                  <h1>
                    Cuéntale a BEXKA
                    <br />

                    <strong>
                      cómo funciona tu negocio.
                    </strong>
                  </h1>

                  <p>
                    Este perfil será la base
                    compartida para BEXKA Integral
                    y tus Advisors. Solo guarda
                    información que tú confirmes.
                  </p>
                </div>

                <div className="profile-form">
                  <div className="profile-section">
                    <div className="profile-section-heading">
                      <span>01</span>

                      <div>
                        <h2>
                          Identidad del negocio
                        </h2>

                        <p>
                          Información base para
                          identificar el contexto.
                        </p>
                      </div>
                    </div>

                    <div className="profile-fields profile-fields-two">
                      <label className="profile-field">
                        <span>
                          Nombre del negocio
                        </span>

                        <input
                          value={
                            profileDraft.name
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "name",
                              event.target.value
                            )
                          }
                          placeholder="Ej: Dulzura"
                        />
                      </label>

                      <label className="profile-field">
                        <span>Rubro</span>

                        <input
                          value={
                            profileDraft.industry
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "industry",
                              event.target.value
                            )
                          }
                          placeholder="Ej: Pastelería"
                        />
                      </label>
                    </div>

                    <label className="profile-field profile-field-large">
                      <span>
                        Descripción breve
                      </span>

                      <textarea
                        value={
                          profileDraft.description
                        }
                        onChange={(event) =>
                          updateProfileField(
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Describe qué hace el negocio, qué vende y qué lo diferencia."
                      />
                    </label>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-heading">
                      <span>02</span>

                      <div>
                        <h2>
                          Oferta y clientes
                        </h2>

                        <p>
                          Qué vendes, para quién y
                          cómo llega al cliente.
                        </p>
                      </div>
                    </div>

                    <label className="profile-field profile-field-large">
                      <span>
                        Productos o servicios
                      </span>

                      <textarea
                        value={
                          profileDraft.products
                        }
                        onChange={(event) =>
                          updateProfileField(
                            "products",
                            event.target.value
                          )
                        }
                        placeholder="Describe tus principales productos, servicios o líneas de negocio."
                      />
                    </label>

                    <div className="profile-fields profile-fields-two">
                      <label className="profile-field">
                        <span>
                          Cliente objetivo
                        </span>

                        <textarea
                          value={
                            profileDraft.targetCustomer
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "targetCustomer",
                              event.target.value
                            )
                          }
                          placeholder="¿A quién le vendes principalmente?"
                        />
                      </label>

                      <label className="profile-field">
                        <span>
                          Canales de venta
                        </span>

                        <textarea
                          value={
                            profileDraft.salesChannels
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "salesChannels",
                              event.target.value
                            )
                          }
                          placeholder="Instagram, tienda física, web, WhatsApp..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-heading">
                      <span>03</span>

                      <div>
                        <h2>
                          Prioridades actuales
                        </h2>

                        <p>
                          Qué quieres conseguir y
                          qué está dificultándolo.
                        </p>
                      </div>
                    </div>

                    <div className="profile-fields profile-fields-two">
                      <label className="profile-field">
                        <span>
                          Objetivos actuales
                        </span>

                        <textarea
                          value={
                            profileDraft.goals
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "goals",
                              event.target.value
                            )
                          }
                          placeholder="Ej: aumentar ventas, ordenar costos, crecer..."
                        />
                      </label>

                      <label className="profile-field">
                        <span>
                          Principales desafíos
                        </span>

                        <textarea
                          value={
                            profileDraft.challenges
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "challenges",
                              event.target.value
                            )
                          }
                          placeholder="Ej: baja conversión, falta de tiempo, márgenes..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-heading">
                      <span>04</span>

                      <div>
                        <h2>Operación</h2>

                        <p>
                          Datos generales que ayudan
                          a interpretar correctamente
                          las recomendaciones.
                        </p>
                      </div>
                    </div>

                    <div className="profile-fields profile-fields-three">
                      <label className="profile-field">
                        <span>
                          País / mercado
                        </span>

                        <input
                          value={
                            profileDraft.country
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "country",
                              event.target.value
                            )
                          }
                          placeholder="Chile"
                        />
                      </label>

                      <label className="profile-field">
                        <span>Moneda</span>

                        <select
                          value={
                            profileDraft.currency
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "currency",
                              event.target.value
                            )
                          }
                        >
                          <option value="CLP">
                            CLP
                          </option>

                          <option value="USD">
                            USD
                          </option>

                          <option value="EUR">
                            EUR
                          </option>

                          <option value="ARS">
                            ARS
                          </option>

                          <option value="PEN">
                            PEN
                          </option>

                          <option value="MXN">
                            MXN
                          </option>
                        </select>
                      </label>

                      <label className="profile-field">
                        <span>
                          Tamaño del equipo
                        </span>

                        <select
                          value={
                            profileDraft.teamSize
                          }
                          onChange={(event) =>
                            updateProfileField(
                              "teamSize",
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            Seleccionar
                          </option>

                          <option value="Solo">
                            Solo/a
                          </option>

                          <option value="2-5">
                            2-5 personas
                          </option>

                          <option value="6-15">
                            6-15 personas
                          </option>

                          <option value="16-50">
                            16-50 personas
                          </option>

                          <option value="50+">
                            Más de 50
                          </option>
                        </select>
                      </label>
                    </div>

                    <label className="profile-field">
                      <span>
                        Sitio web
                        <small>
                          opcional
                        </small>
                      </span>

                      <input
                        value={
                          profileDraft.website
                        }
                        onChange={(event) =>
                          updateProfileField(
                            "website",
                            event.target.value
                          )
                        }
                        placeholder="www.tunegocio.cl"
                      />
                    </label>
                  </div>

                  <div className="profile-section">
                    <div className="profile-section-heading">
                      <span>05</span>

                      <div>
                        <h2>
                          Información adicional
                        </h2>

                        <p>
                          Cualquier dato que BEXKA
                          debería considerar al
                          analizar tu negocio.
                        </p>
                      </div>
                    </div>

                    <label className="profile-field profile-field-large">
                      <span>
                        Notas adicionales
                        <small>
                          opcional
                        </small>
                      </span>

                      <textarea
                        value={
                          profileDraft.notes
                        }
                        onChange={(event) =>
                          updateProfileField(
                            "notes",
                            event.target.value
                          )
                        }
                        placeholder="Restricciones, particularidades, temporadas, decisiones recientes..."
                      />
                    </label>
                  </div>

                  <div className="profile-actions">
                    <div className="profile-save-status">
                      {profileSaved ? (
                        <>
                          <span className="profile-save-dot" />
                          Perfil guardado
                        </>
                      ) : (
                        <>
                          <span className="profile-unsaved-dot" />
                          Los cambios aún no se han guardado
                        </>
                      )}
                    </div>

                    <div className="profile-action-buttons">
                      {hasBusinessContext && (
                        <button
                          className="profile-clear-button"
                          onClick={
                            clearBusinessProfile
                          }
                        >
                          Limpiar perfil
                        </button>
                      )}

                      <button
                        className="profile-save-button"
                        onClick={
                          saveBusinessProfile
                        }
                      >
                        Guardar contexto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================================================
            ADVISOR SELECTOR
        ==================================================== */}

        {screen === "advisors" && (
          <div className="inner-screen screen-enter">
            <button
              className="back-button inner-back"
              onClick={() =>
                setScreen("mode")
              }
            >
              <span>←</span>
              Volver
            </button>

            <span className="inner-kicker">
              TU EQUIPO BEXKA
            </span>

            <h2 className="inner-title">
              ¿Con quién quieres
              <br />
              <span>trabajar?</span>
            </h2>

            <p className="inner-description">
              Entra directamente al Advisor que
              necesitas. Cada especialista conserva
              su propia conversación y utiliza el
              contexto relevante de tu negocio.
            </p>

            <div className="advisor-grid">
              {advisors.map((advisor) => (
                <button
                  className={`advisor-card advisor-selector-card advisor-selector-${advisor.tone}`}
                  key={advisor.id}
                  onClick={() =>
                    openAdvisor(
                      advisor.id
                    )
                  }
                >
                  <div
                    className={`advisor-selector-light advisor-selector-light-${advisor.tone}`}
                  />

                  <div
                    className={`advisor-selector-mark advisor-selector-mark-${advisor.tone}`}
                  >
                    {advisor.letter}
                  </div>

                  <span className="advisor-area">
                    {advisor.area}
                  </span>

                  <h3>
                    {advisor.name}
                  </h3>

                  <p>
                    {advisor.description}
                  </p>

                  <div className="advisor-selector-enter">
                    Entrar al workspace
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================
            DIRECT ADVISOR WORKSPACE
        ==================================================== */}

        {screen === "advisor" &&
          selectedAdvisor && (
            <div
              className={`advisor-workspace advisor-workspace-${selectedAdvisor.tone} screen-enter`}
            >
              <aside className="advisor-workspace-sidebar">
                <button
                  className="workspace-back"
                  onClick={() =>
                    setScreen(
                      "advisors"
                    )
                  }
                >
                  <span>←</span>
                  Cambiar Advisor
                </button>

                <div className="active-advisor-brand">
                  <div
                    className={`active-advisor-brand-mark active-advisor-brand-${selectedAdvisor.tone}`}
                  >
                    {selectedAdvisor.letter}
                  </div>

                  <div>
                    <strong>
                      {selectedAdvisor.name}
                    </strong>

                    <span>
                      {selectedAdvisor.area}
                    </span>
                  </div>
                </div>

                <div className="advisor-sidebar-section">
                  <span className="advisor-sidebar-label">
                    SESIÓN
                  </span>

                  <button
                    className="advisor-sidebar-button advisor-sidebar-button-active"
                    onClick={
                      resetAdvisorConversation
                    }
                  >
                    Nueva conversación
                  </button>

                  <button className="advisor-sidebar-button">
                    Historial
                  </button>
                </div>

                <div className="advisor-sidebar-section">
                  <span className="advisor-sidebar-label">
                    CONTEXTO
                  </span>

                  <button
                    className="advisor-context-card advisor-context-card-button"
                    onClick={
                      openProfile
                    }
                  >
                    <div>
                      <span className="context-live-dot" />

                      {hasBusinessContext
                        ? businessProfile.name
                        : "Configurar negocio"}
                    </div>

                    <p>
                      {hasBusinessContext
                        ? `${profileProgress}% del contexto configurado.`
                        : "Agrega información de tu negocio para mejorar la precisión."}
                    </p>
                  </button>
                </div>

                <div className="advisor-sidebar-section">
                  <span className="advisor-sidebar-label">
                    ESPECIALIDAD
                  </span>

                  <p className="advisor-specialty-copy">
                    {selectedAdvisor.specialty}
                  </p>
                </div>

                <button
                  className="switch-to-integral"
                  onClick={() =>
                    setScreen(
                      "integral"
                    )
                  }
                >
                  <img
                    src="/bexka-icon.png"
                    alt=""
                    width="22"
                    height="22"
                    style={{
                      width: "22px",
                      height: "22px",
                      maxWidth: "22px",
                      objectFit: "contain",
                    }}
                  />

                  <div>
                    <strong>
                      BEXKA Integral
                    </strong>

                    <span>
                      Cambiar a análisis multiadvisor
                    </span>
                  </div>
                </button>

                <div className="advisor-sidebar-version">
                  BEXKA · Direct Advisor · AI
                </div>
              </aside>

              <section className="advisor-workspace-main">
                {advisorLoading ? (
                  <div className="advisor-empty-state">
                    <div
                      className={`advisor-hero-mark advisor-hero-${selectedAdvisor.tone}`}
                    >
                      <div className="advisor-hero-aura" />

                      <span>
                        {selectedAdvisor.letter}
                      </span>
                    </div>

                    <span
                      className={`advisor-workspace-kicker advisor-kicker-${selectedAdvisor.tone}`}
                    >
                      {selectedAdvisor.area}
                    </span>

                    <h1>
                      Analizando tu consulta.
                    </h1>

                    <p className="advisor-workspace-intro">
                      {selectedAdvisor.name} está
                      revisando el contexto de tu
                      negocio y preparando una
                      recomendación desde su
                      especialidad.
                    </p>

                    <div
                      className="advisor-context-card"
                      style={{
                        width: "100%",
                        maxWidth: "520px",
                        marginTop: "24px",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <span className="context-live-dot" />
                        Consulta en proceso
                      </div>

                      <p>
                        Contexto del negocio → análisis especializado → recomendación
                      </p>
                    </div>
                  </div>
                ) : !currentAdvisorSession?.analysis ? (
                  <div className="advisor-empty-state">
                    <div
                      className={`advisor-hero-mark advisor-hero-${selectedAdvisor.tone}`}
                    >
                      <div className="advisor-hero-aura" />

                      <span>
                        {selectedAdvisor.letter}
                      </span>
                    </div>

                    <span
                      className={`advisor-workspace-kicker advisor-kicker-${selectedAdvisor.tone}`}
                    >
                      {selectedAdvisor.area}
                    </span>

                    <h1>
                      {selectedAdvisor.name}
                    </h1>

                    <p className="advisor-workspace-intro">
                      Trabaja directamente con este
                      especialista. Si tu consulta
                      necesita otra perspectiva, el
                      Advisor te lo propondrá antes
                      de incorporar a otro miembro
                      del equipo.
                    </p>

                    {!hasBusinessContext && (
                      <button
                        className="context-warning"
                        onClick={
                          openProfile
                        }
                      >
                        <span>
                          Contexto del negocio sin configurar
                        </span>

                        <strong>
                          Configurar perfil
                        </strong>
                      </button>
                    )}

                    {advisorError && (
                      <div
                        className="advisor-context-card"
                        style={{
                          width: "100%",
                          maxWidth: "620px",
                          marginTop: "20px",
                          textAlign: "left",
                          borderColor:
                            "rgba(255, 100, 130, 0.18)",
                        }}
                      >
                        <div>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background:
                                "rgba(255, 100, 130, 0.8)",
                            }}
                          />

                          No se pudo completar el análisis
                        </div>

                        <p>
                          {advisorError}
                        </p>
                      </div>
                    )}

                    <div className="advisor-composer">
                      <textarea
                        value={
                          advisorInput
                        }
                        onChange={(event) =>
                          setAdvisorInput(
                            event.target.value
                          )
                        }
                        placeholder={`Escribe tu consulta para ${selectedAdvisor.name}...`}
                      />

                      <div className="advisor-composer-footer">
                        <div className="advisor-context-indicator">
                          <span className="context-live-dot" />

                          {hasBusinessContext
                            ? `Contexto activo · ${businessProfile.name}`
                            : "Sin contexto de negocio"}
                        </div>

                        <button
                          className={`advisor-send-button advisor-send-${selectedAdvisor.tone}`}
                          onClick={
                            sendAdvisorMessage
                          }
                          disabled={
                            advisorLoading ||
                            !advisorInput.trim()
                          }
                        >
                          Consultar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="advisor-analysis">
                    <div className="advisor-analysis-header">
                      <div>
                        <span
                          className={`advisor-workspace-kicker advisor-kicker-${selectedAdvisor.tone}`}
                        >
                          {selectedAdvisor.area}
                        </span>

                        <h2>
                          {selectedAdvisor.name}
                        </h2>
                      </div>

                      <button
                        className="new-analysis-button"
                        onClick={
                          resetAdvisorConversation
                        }
                      >
                        Nueva conversación
                      </button>
                    </div>

                    <div className="advisor-user-question">
                      <span>
                        TU CONSULTA
                      </span>

                      <p>
                        {
                          currentAdvisorSession.question
                        }
                      </p>
                    </div>

                    <div
                      className={`advisor-response advisor-response-${selectedAdvisor.tone}`}
                    >
                      <div className="advisor-response-header">
                        <div
                          className={`advisor-response-avatar advisor-response-avatar-${selectedAdvisor.tone}`}
                        >
                          {selectedAdvisor.letter}
                        </div>

                        <div>
                          <strong>
                            {selectedAdvisor.name}
                          </strong>

                          <span>
                            Análisis especializado
                          </span>
                        </div>

                        <span
                          className="demo-chip advisor-demo-chip"
                          style={{
                            color:
                              "rgba(171, 231, 255, 0.9)",
                            borderColor:
                              "rgba(91, 194, 255, 0.18)",
                            background:
                              "rgba(73, 164, 255, 0.06)",
                          }}
                        >
                          IA REAL
                        </span>
                      </div>

                      <div className="advisor-response-section">
                        <span>
                          DIAGNÓSTICO
                        </span>

                        <p>
                          {
                            currentAdvisorSession
                              .analysis
                              .diagnosis
                          }
                        </p>
                      </div>

                      <div className="advisor-response-section">
                        <span>
                          RECOMENDACIÓN
                        </span>

                        <h3>
                          {
                            currentAdvisorSession
                              .analysis
                              .recommendation
                          }
                        </h3>
                      </div>

                      {Array.isArray(
                        currentAdvisorSession
                          .analysis
                          .nextSteps
                      ) &&
                        currentAdvisorSession
                          .analysis
                          .nextSteps.length > 0 && (
                          <div className="advisor-response-section">
                            <span>
                              SIGUIENTES PASOS
                            </span>

                            <div className="advisor-next-steps">
                              {currentAdvisorSession.analysis.nextSteps.map(
                                (
                                  step,
                                  index
                                ) => (
                                  <div
                                    key={`${step}-${index}`}
                                  >
                                    <b>
                                      {String(
                                        index + 1
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                    </b>

                                    <span>
                                      {step}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {Array.isArray(
                        currentAdvisorSession
                          .analysis
                          .risks
                      ) &&
                        currentAdvisorSession
                          .analysis
                          .risks.length > 0 && (
                          <div className="advisor-response-section">
                            <span>
                              RIESGOS A CONSIDERAR
                            </span>

                            <div className="advisor-next-steps">
                              {currentAdvisorSession.analysis.risks.map(
                                (
                                  risk,
                                  index
                                ) => (
                                  <div
                                    key={`${risk}-${index}`}
                                  >
                                    <b>!</b>

                                    <span>
                                      {risk}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {Array.isArray(
                        currentAdvisorSession
                          .analysis
                          .missingInformation
                      ) &&
                        currentAdvisorSession
                          .analysis
                          .missingInformation
                          .length > 0 && (
                          <div className="advisor-response-section">
                            <span>
                              INFORMACIÓN QUE FALTA
                            </span>

                            <div className="advisor-next-steps">
                              {currentAdvisorSession.analysis.missingInformation.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={`${item}-${index}`}
                                  >
                                    <b>?</b>

                                    <span>
                                      {item}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      <div className="advisor-response-section">
                        <span>
                          CONFIANZA
                        </span>

                        <p>
                          {
                            currentAdvisorSession
                              .analysis
                              .confidence
                          }
                        </p>
                      </div>
                    </div>

                    {currentAdvisorSession
                      .analysis
                      .collaborationNeeded &&
                      currentAdvisorSession
                        .analysis
                        .suggestedAdvisor &&
                      !currentAdvisorSession
                        .consultedAdvisor && (
                        <div className="advisor-consultation-card">
                          <div className="consultation-heading">
                            <span>
                              COLABORACIÓN
                            </span>

                            <h3>
                              ¿Quieres incorporar otra perspectiva?
                            </h3>
                          </div>

                          <p>
                            {
                              currentAdvisorSession
                                .analysis
                                .suggestedAdvisor
                                .reason
                            }
                          </p>

                          <div className="consultation-actions">
                            <button
                              className="consultation-accept"
                              onClick={
                                acceptAdvisorConsultation
                              }
                            >
                              Consultar{" "}
                              {
                                currentAdvisorSession
                                  .analysis
                                  .suggestedAdvisor
                                  .shortName
                              }
                            </button>

                            <button className="consultation-decline">
                              Continuar solo con{" "}
                              {selectedAdvisor.shortName}
                            </button>
                          </div>
                        </div>
                      )}

                    {currentAdvisorSession.consultedAdvisor && (
                      <div className="consulted-advisor-card">
                        <span className="consulted-label">
                          COLABORACIÓN AUTORIZADA
                        </span>

                        <div className="consulted-advisor-heading">
                          <div
                            className={`consulted-advisor-avatar consulted-${currentAdvisorSession.consultedAdvisor.tone}`}
                          >
                            {
                              currentAdvisorSession
                                .consultedAdvisor
                                .letter
                            }
                          </div>

                          <strong>
                            {
                              currentAdvisorSession
                                .consultedAdvisor
                                .name
                            }
                          </strong>
                        </div>

                        <p>
                          {
                            currentAdvisorSession
                              .consultedAdvisor
                              .contribution
                          }
                        </p>
                      </div>
                    )}

                    <div className="advisor-followup">
                      <input
                        value={
                          advisorInput
                        }
                        onChange={(event) =>
                          setAdvisorInput(
                            event.target.value
                          )
                        }
                        placeholder={`Continúa con ${selectedAdvisor.shortName}...`}
                        disabled={
                          advisorLoading
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                              "Enter" &&
                            !event.shiftKey &&
                            advisorInput.trim()
                          ) {
                            event.preventDefault();

                            sendAdvisorMessage();
                          }
                        }}
                      />

                      <button
                        onClick={
                          sendAdvisorMessage
                        }
                        disabled={
                          advisorLoading ||
                          !advisorInput.trim()
                        }
                      >
                        Enviar
                      </button>
                    </div>

                    {advisorError && (
                      <div
                        className="consulted-advisor-card"
                        style={{
                          borderColor:
                            "rgba(255, 100, 130, 0.18)",
                        }}
                      >
                        <span className="consulted-label">
                          ERROR
                        </span>

                        <p>
                          {advisorError}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}

        {/* ===================================================
            BEXKA INTEGRAL
        ==================================================== */}

        {screen === "integral" && (
          <div className="integral-workspace screen-enter">
            <aside className="integral-sidebar">
              <div className="sidebar-top">
                <button
                  className="workspace-back"
                  onClick={() =>
                    setScreen("mode")
                  }
                >
                  <span>←</span>
                  Volver
                </button>

                <div className="workspace-brand">
                  <div className="workspace-brand-logo">
                    <div className="workspace-brand-glow" />

                    <img
                      src="/bexka-icon.png"
                      alt=""
                      width="46"
                      height="46"
                      style={{
                        width: "46px",
                        height: "46px",
                        maxWidth: "46px",
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 2,
                      }}
                    />
                  </div>

                  <div>
                    <span>BEXKA</span>

                    <small>
                      INTEGRAL
                    </small>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <span className="sidebar-label">
                  SESIÓN
                </span>

                <button
                  className="sidebar-item sidebar-item-active"
                  onClick={
                    resetIntegralAnalysis
                  }
                >
                  Nueva consulta
                </button>

                <button className="sidebar-item">
                  Historial
                </button>
              </div>

              <div className="sidebar-section">
                <span className="sidebar-label">
                  CONTEXTO
                </span>

                <button
                  className="business-context-card business-context-button"
                  onClick={openProfile}
                >
                  <div className="context-card-top">
                    <span className="context-live-dot" />

                    <span>
                      {hasBusinessContext
                        ? businessProfile.name
                        : "Configurar negocio"}
                    </span>
                  </div>

                  <p>
                    {hasBusinessContext
                      ? `${profileProgress}% del contexto del negocio está configurado.`
                      : "Agrega información confirmada para personalizar los análisis."}
                  </p>
                </button>
              </div>

              <div className="sidebar-advisors">
                <span className="sidebar-label">
                  ADVISORS
                </span>

                <div className="mini-advisor">
                  <i className="advisor-dot advisor-purple" />
                  Strategy
                </div>

                <div className="mini-advisor">
                  <i className="advisor-dot advisor-pink" />
                  Marketing & Sales
                </div>

                <div className="mini-advisor">
                  <i className="advisor-dot advisor-blue" />
                  Finance
                </div>

                <div className="mini-advisor">
                  <i className="advisor-dot advisor-cyan" />
                  Management
                </div>
              </div>

              <div className="sidebar-version">
                BEXKA Integral · AI
              </div>
            </aside>

            <section className="integral-main">
              {integralLoading ? (
                <div className="integral-empty-state">
                  <div className="integral-center-logo">
                    <div className="integral-center-aura" />

                    <img
                      src="/bexka-icon.png"
                      alt="BEXKA"
                      width="88"
                      height="88"
                      style={{
                        width: "88px",
                        height: "88px",
                        maxWidth: "88px",
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 2,
                      }}
                    />
                  </div>

                  <span className="integral-status">
                    BEXKA CENTRAL
                  </span>

                  <h1>
                    Analizando
                    <br />
                    <span>
                      tu negocio.
                    </span>
                  </h1>

                  <p className="integral-intro">
                    BEXKA Central está interpretando
                    tu consulta, seleccionando los
                    Advisors necesarios y preparando
                    una respuesta integrada.
                  </p>

                  <div
                    className="business-context-card"
                    style={{
                      marginTop: "26px",
                      maxWidth: "520px",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <div className="context-card-top">
                      <span className="context-live-dot" />

                      <span>
                        Análisis en proceso
                      </span>
                    </div>

                    <p>
                      Contexto → Routing → Advisors → Síntesis
                    </p>
                  </div>
                </div>
              ) : !analysis ? (
                <div className="integral-empty-state">
                  <div className="integral-center-logo">
                    <div className="integral-center-aura" />

                    <img
                      src="/bexka-icon.png"
                      alt="BEXKA"
                      width="88"
                      height="88"
                      style={{
                        width: "88px",
                        height: "88px",
                        maxWidth: "88px",
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 2,
                      }}
                    />
                  </div>

                  <span className="integral-status">
                    BEXKA INTEGRAL
                  </span>

                  <h1>
                    ¿Qué necesitas
                    <br />

                    <span>
                      resolver?
                    </span>
                  </h1>

                  <p className="integral-intro">
                    Describe una situación de tu
                    negocio. BEXKA Central
                    identificará qué Advisors
                    necesita consultar antes de
                    construir una recomendación
                    integrada.
                  </p>

                  {!hasBusinessContext && (
                    <button
                      className="context-warning"
                      onClick={
                        openProfile
                      }
                    >
                      <span>
                        Contexto del negocio sin configurar
                      </span>

                      <strong>
                        Configurar perfil
                      </strong>
                    </button>
                  )}

                  {integralError && (
                    <div
                      className="business-context-card"
                      style={{
                        marginTop: "20px",
                        maxWidth: "620px",
                        width: "100%",
                        textAlign: "left",
                        borderColor:
                          "rgba(255, 100, 130, 0.18)",
                      }}
                    >
                      <div className="context-card-top">
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background:
                              "rgba(255, 100, 130, 0.8)",
                          }}
                        />

                        <span>
                          No se pudo completar el análisis
                        </span>
                      </div>

                      <p>
                        {integralError}
                      </p>
                    </div>
                  )}

                  <div className="integral-composer">
                    <textarea
                      value={
                        integralInput
                      }
                      onChange={(event) =>
                        setIntegralInput(
                          event.target.value
                        )
                      }
                      placeholder="Ej: Las ventas bajaron este mes y no sé si invertir más en publicidad o reducir costos..."
                    />

                    <div className="composer-bottom">
                      <div className="composer-context">
                        <span className="context-live-dot" />

                        {hasBusinessContext
                          ? `Contexto activo · ${businessProfile.name}`
                          : "Sin contexto de negocio"}
                      </div>

                      <button
                        className="composer-send"
                        onClick={
                          sendIntegralMessage
                        }
                        disabled={
                          integralLoading ||
                          !integralInput.trim()
                        }
                      >
                        Analizar
                      </button>
                    </div>
                  </div>

                  <div className="integral-suggestions">
                    <button
                      onClick={() =>
                        setIntegralInput(
                          "Mis ventas bajaron y quiero entender qué debería priorizar."
                        )
                      }
                    >
                      Ventas y prioridades
                    </button>

                    <button
                      onClick={() =>
                        setIntegralInput(
                          "Quiero saber si puedo bajar mis precios sin dañar demasiado mi margen."
                        )
                      }
                    >
                      Precio y margen
                    </button>

                    <button
                      onClick={() =>
                        setIntegralInput(
                          "Estoy recibiendo más pedidos, pero mi operación está desordenada."
                        )
                      }
                    >
                      Capacidad y procesos
                    </button>
                  </div>
                </div>
              ) : (
                <div className="analysis-workspace">
                  <div className="analysis-topbar">
                    <div>
                      <span className="analysis-label">
                        BEXKA INTEGRAL
                      </span>

                      <h2>
                        Análisis completado
                      </h2>
                    </div>

                    <button
                      className="new-analysis-button"
                      onClick={
                        resetIntegralAnalysis
                      }
                    >
                      Nueva consulta
                    </button>
                  </div>

                  <div className="user-query-card">
                    <span className="query-label">
                      TU CONSULTA
                    </span>

                    <p>
                      {integralQuestion}
                    </p>
                  </div>

                  <div className="advisor-activity">
                    <div className="activity-heading">
                      <div>
                        <span className="analysis-label">
                          COORDINACIÓN
                        </span>

                        <h3>
                          Advisors consultados
                        </h3>
                      </div>

                      <span
                        className="demo-chip"
                        style={{
                          color:
                            "rgba(171, 231, 255, 0.9)",
                          borderColor:
                            "rgba(91, 194, 255, 0.18)",
                          background:
                            "rgba(73, 164, 255, 0.06)",
                        }}
                      >
                        IA REAL
                      </span>
                    </div>

                    <div className="active-advisors">
                      {analysis.advisors.map(
                        (advisor) => (
                          <div
                            className="active-advisor"
                            key={
                              advisor.id
                            }
                          >
                            <span
                              className={`active-advisor-icon ${
                                advisor.tone ===
                                "blue"
                                  ? "finance-icon"
                                  : ""
                              }`}
                            >
                              {advisor.letter}
                            </span>

                            <div>
                              <strong>
                                {advisor.name}
                              </strong>

                              <small>
                                {advisor.status}
                              </small>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bexka-response">
                    <div className="response-header">
                      <div className="response-logo">
                        <img
                          src="/bexka-icon.png"
                          alt=""
                          width="34"
                          height="34"
                          style={{
                            width: "34px",
                            height: "34px",
                            maxWidth: "34px",
                            objectFit: "contain",
                          }}
                        />
                      </div>

                      <div>
                        <strong>BEXKA</strong>

                        <span>
                          Análisis integrado
                        </span>
                      </div>
                    </div>

                    <div className="response-section">
                      <span>
                        OBSERVACIÓN
                      </span>

                      <p>
                        {analysis.observation}
                      </p>
                    </div>

                    <div className="response-section">
                      <span>
                        PRIORIDAD
                      </span>

                      <h3>
                        {analysis.priority}
                      </h3>
                    </div>

                    {analysis.recommendation && (
                      <div className="response-section">
                        <span>
                          RECOMENDACIÓN
                        </span>

                        <p>
                          {analysis.recommendation}
                        </p>
                      </div>
                    )}

                    <div className="response-section">
                      <span>
                        SIGUIENTES PASOS
                      </span>

                      <div className="next-step-list">
                        {analysis.nextSteps.map(
                          (
                            step,
                            index
                          ) => (
                            <div
                              key={`${step}-${index}`}
                            >
                              <b>
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </b>

                              {step}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {Array.isArray(
                      analysis.missingInformation
                    ) &&
                      analysis
                        .missingInformation
                        .length > 0 && (
                        <div className="response-section">
                          <span>
                            INFORMACIÓN QUE FALTA
                          </span>

                          <div className="next-step-list">
                            {analysis.missingInformation.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${item}-${index}`}
                                >
                                  <b>?</b>

                                  {item}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div className="response-section">
                      <span>
                        CONFIANZA
                      </span>

                      <p>
                        {analysis.confidence}
                      </p>
                    </div>

                    <div className="response-disclaimer">
                      Análisis generado por BEXKA
                      Central utilizando el contexto
                      proporcionado por el usuario y
                      las perspectivas de los Advisors
                      seleccionados.
                    </div>
                  </div>

                  <div className="followup-composer">
                    <input
                      value={
                        integralInput
                      }
                      onChange={(event) =>
                        setIntegralInput(
                          event.target.value
                        )
                      }
                      placeholder="Haz otra consulta relacionada..."
                      disabled={
                        integralLoading
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          integralInput.trim()
                        ) {
                          event.preventDefault();

                          sendIntegralMessage();
                        }
                      }}
                    />

                    <button
                      onClick={
                        sendIntegralMessage
                      }
                      disabled={
                        integralLoading ||
                        !integralInput.trim()
                      }
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {screen !== "integral" &&
        screen !== "advisor" &&
        screen !== "profile" && (
          <footer className="footer">
            <span>BEXKA</span>

            <span className="footer-center">
              <i />
              BUSINESS, EVOLVED.
            </span>

            <span>v0.1</span>
          </footer>
        )}
    </main>
  );
}