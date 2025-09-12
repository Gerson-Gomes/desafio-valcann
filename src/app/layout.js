import { Geist, Geist_Mono, Fascinate_Inline } from "next/font/google";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fascinateInline = Fascinate_Inline({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fascinate-inline",
});

const metadata = {
  title: "Nasa Rover Photos",
  description: "Biblioteca de fotos do rover Curiosity da NASA feito como um teste tecnico para a vaga de estagio na Valcann",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fascinateInline.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
