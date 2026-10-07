import "./globals.css";
import "./advisors.css";
import "./profile.css";

export const metadata = {
  title: "BEXKA — Business, evolved.",
  description:
    "Plataforma inteligente para la gestión y toma de decisiones empresariales.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}