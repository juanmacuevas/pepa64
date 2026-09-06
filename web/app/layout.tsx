import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "pepa64 · Un número, muchas voces";
const description =
  "Un experimento abierto sobre cómo pronunciamos y entendemos números. Presta tu voz o escucha y transcribe.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/og.png",
          width: 1536,
          height: 1024,
          alt: "pepa64 social preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
