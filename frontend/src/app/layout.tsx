import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MedLearn",
  description: "A healthcare research ecosystem web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground antialiased text-black/90">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
