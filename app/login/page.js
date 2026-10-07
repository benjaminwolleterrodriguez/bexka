"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function normalizeUsername(value) {
    return value
      .toLowerCase()
      .trim();
  }

  function usernameToEmail(value) {
    const cleanUsername =
      normalizeUsername(value);

    return `${cleanUsername}@bexka.invalid`;
  }

  function validateUsername(value) {
    const cleanUsername =
      normalizeUsername(value);

    if (!cleanUsername) {
      return "Ingresa tu nombre de usuario.";
    }

    if (
      !/^[a-z0-9_-]+$/.test(
        cleanUsername
      )
    ) {
      return "El nombre de usuario no es válido.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const cleanUsername =
      normalizeUsername(username);

    const usernameError =
      validateUsername(
        cleanUsername
      );

    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (!password) {
      setError(
        "Ingresa tu contraseña."
      );

      return;
    }

    setLoading(true);

    try {
      const supabase =
        createClient();

      const internalEmail =
        usernameToEmail(
          cleanUsername
        );

      console.log(
        "Intentando login con:",
        internalEmail
      );

      const {
        data,
        error: signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              internalEmail,

            password,
          }
        );

      if (signInError) {
        console.error(
          "SUPABASE LOGIN ERROR:",
          signInError
        );

        throw new Error(
          signInError.message
        );
      }

      if (!data?.user) {
        throw new Error(
          "Supabase no devolvió un usuario válido."
        );
      }

      console.log(
        "LOGIN CORRECTO:",
        data.user
      );

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "BEXKA AUTH ERROR:",
        error
      );

      setError(
        error?.message ||
          "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-noise" />
      <div className="login-glow-one" />
      <div className="login-glow-two" />

      <section className="login-layout">
        {/* =============================================
            BRAND
        ============================================= */}

        <div className="login-brand-side">
          <div className="login-brand-logo-wrap">
            <div className="login-brand-aura" />

            <img
              src="/bexka-icon.png"
              alt="BEXKA"
              width="126"
              height="126"
              className="login-logo"
            />
          </div>

          <div className="login-brand-copy">
            <span className="login-brand-name">
              BEXKA
            </span>

            <span className="login-tagline">
              BUSINESS, EVOLVED.
            </span>
          </div>

          <div className="login-brand-statement">
            <h1>
              Inteligencia aplicada
              <br />
              a las decisiones de
              <br />
              <span>
                tu negocio.
              </span>
            </h1>

            <p>
              Un contexto. Distintos advisors.
              Mejores decisiones.
            </p>
          </div>
        </div>

        {/* =============================================
            LOGIN CARD
        ============================================= */}

        <div className="login-auth-side">
          <div className="login-card">
            <div className="login-card-glow" />

            <div className="login-card-header">
              <span className="login-eyebrow">
                ACCESO BEXKA
              </span>

              <h2>
                Bienvenido de vuelta.
              </h2>

              <p>
                Ingresa a tu espacio de trabajo.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={
                handleSubmit
              }
            >
              <label className="login-field">
                <span>
                  Nombre de usuario
                </span>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  autoComplete="username"
                  placeholder="Tu usuario"
                  disabled={loading}
                />
              </label>

              <label className="login-field">
                <span>
                  Contraseña
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </label>

              {error && (
                <div className="login-error">
                  <span className="login-error-dot" />

                  <p>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? "ENTRANDO..."
                  : "ENTRAR"}
              </button>
            </form>

            <div className="login-security">
              <span className="login-security-dot" />

              Acceso privado a BEXKA.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}