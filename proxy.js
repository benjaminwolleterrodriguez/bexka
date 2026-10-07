import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  /* ===============================================
     LOGIN
  =============================================== */

  if (pathname === "/login") {
    /*
      Si ya tiene sesión y trata de abrir
      /login, lo mandamos directamente a BEXKA.
    */

    if (user) {
      const url =
        request.nextUrl.clone();

      url.pathname = "/";

      return NextResponse.redirect(
        url
      );
    }

    return response;
  }

  /* ===============================================
     PUBLIC TEST PAGE

     Puedes eliminar esto después.
  =============================================== */

  if (
    pathname.startsWith(
      "/test-supabase"
    )
  ) {
    return response;
  }

  /* ===============================================
     PRIVATE BEXKA
  =============================================== */

  if (!user) {
    const url =
      request.nextUrl.clone();

    url.pathname = "/login";

    return NextResponse.redirect(
      url
    );
  }

  return response;
}

/* =================================================
   ROUTES WHERE PROXY RUNS
================================================= */

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|bexka-icon.png|bexka-logo.png).*)",
  ],
};