import type { Metadata } from "next";
// import { Inter, Poppins } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Haris",
  description: "By saudi pentesting company",
};

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/InterVariable.ttf',
      weight: '100 900', 
      style: 'normal',
    },
    {
      path: '../../public/fonts/InterVariable-Italic.ttf',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = localFont({
  src: [
    {
      path: '../../public/fonts/PoppinsVariable.otf',
      weight: '100 900', 
      style: 'normal',
    },
    {
      path: '../../public/fonts/PoppinsVariable-Italic.otf',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        {children}
        <Toaster richColors/>
      </body>
    </html>
  );
}
