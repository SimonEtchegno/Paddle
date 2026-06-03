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
import { SocialChatWidget } from "@/components/SocialChatWidget";
import { supabase } from "@/lib/supabase";
import { cookies, headers } from "next/headers";
import { ProfileProvider } from "@/hooks/useGuestProfile";
import { SportProvider } from "@/hooks/useSport";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Complejo Peñarol";
  let description = "Reserva tu turno en segundos.";
  let appleTitle = "Complejo Peñarol";
  let appleIcon = "/logo.jpg";

  try {
    const headerList = await headers();
    const cookieStore = await cookies();
    const activeSlug = headerList.get('x-active-club-slug') ||
      cookieStore.get('active_club_slug')?.value ||
      'peñarol';

    const { data } = await supabase
      .from('clubes')
      .select('*')
      .eq('slug', activeSlug)
      .single();

    if (data) {
      title = data.nombre;
      appleTitle = data.nombre;
      if (data.logo_url) {
        appleIcon = data.logo_url;
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title,
    description,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: appleTitle,
    },
    icons: {
      icon: "/icon?v=4",
      apple: appleIcon,
    },
  };
}

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
      'peñarol';

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col pb-20 md:pb-0"
        suppressHydrationWarning
        data-original-primary={primaryColor}
        style={{
          // @ts-ignore
          '--primary': primaryColor,
          // @ts-ignore
          '--glass': `${primaryColor}14`, // 8% de opacidad para el glass
          // @ts-ignore
          '--border': `${primaryColor}40`, // 25% de opacidad para bordes
        }}
      >
        <script
          id="sw-unregister"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister().then(function(success) {
                      if (success) {
                        console.log('Old Service Worker unregistered successfully.');
                      }
                    });
                  }
                });
              }
            `
          }}
        />
        <SportProvider>
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
            <SocialChatWidget />
          </ProfileProvider>
        </SportProvider>

      </body>
    </html>
  );
}
