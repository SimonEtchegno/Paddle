import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { SupportButton } from "@/components/SupportButton";
import { supabase } from "@/lib/supabase";
import { cookies, headers } from "next/headers";
import { ProfileProvider } from "@/hooks/useGuestProfile";

export const metadata: Metadata = {
  title: "Peñarol Pádel",
  description: "Reserva tu turno de pádel en segundos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peñarol Pádel",
  },
  icons: {
    apple: "/logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let club = null;
  let primaryColor = '#8882dc';

  try {
    // 1. Detectamos el slug del club
    const headerList = await headers();
    const cookieStore = await cookies();
    
    // Prioridad: 1. El subdominio (Vercel) | 2. La cookie de Vista Previa | 3. Peñarol por defecto
    const activeSlug = headerList.get('x-active-club-slug') || 
                      cookieStore.get('active_club_slug')?.value || 
                      'penarol';

    // 2. Obtenemos los datos del club de la base de datos
    const { data } = await supabase
      .from('clubes')
      .select('*')
      .eq('slug', activeSlug)
      .single();
    
    if (data) {
      club = data;
      primaryColor = data.color_principal || '#8882dc';
    }
  } catch (error) {
    console.error('Error cargando el tema del club:', error);
  }

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body 
        className="min-h-full flex flex-col pb-20 md:pb-0"
        style={{ 
          // @ts-ignore
          '--primary': primaryColor,
          // @ts-ignore
          '--glass': `${primaryColor}14`, // 8% de opacidad para el glass
          // @ts-ignore
          '--border': `${primaryColor}40`, // 25% de opacidad para bordes
        }}
      >
        <ProfileProvider>
          <Navbar club={club} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a2235',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
          <SupportButton />
        </ProfileProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
