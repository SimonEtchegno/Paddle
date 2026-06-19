import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ADMINS = ['setchegno@etman.com.ar', 'octavioducos24@gmail.com'];

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // 1. Extraer el subdominio (ej: penarol.padelmanager.com -> penarol)
  let slug = '';
  
  const parts = hostname.split('.');
  
  if (parts.length > 1) {
    // Si es localhost y tiene subdominio (ej: penarol.localhost:3000)
    if (hostname.includes('localhost') && parts.length === 2) {
      slug = parts[0];
    } else if (!hostname.includes('localhost') && parts.length > 2) {
      // Para dominios de producción (ej: penarol.padelmanager.com o penarol.vercel.app)
      // Excluir subdominio "www" si existe
      if (parts[0] !== 'www') {
        slug = parts[0];
      }
    }
  }

  // 2. Pasar el slug detectado en los headers de la petición para que layout.tsx pueda leerlo
  const requestHeaders = new Headers(request.headers);
  if (slug) {
    requestHeaders.set('x-active-club-slug', slug);
  }

  // 3. Proteger la ruta de admin verificando el JWT (CRIT-02)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin-login') {
    const token = request.cookies.get('sb-access-token')?.value;
    let isAuthorized = false;

    if (token) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtiwwhnoaiiwvgivtcko.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aXd3aG5vYWlpd3ZnaXZ0Y2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTU1MzksImV4cCI6MjA5MjQzMTUzOX0.wHiAM-sCSs_yzBfTDxwBB882lJcw6q-QVo7dcsxXYl8';
      
      try {
        const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
          },
        });
        
        if (res.ok) {
          const user = await res.json();
          if (user && user.email && ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
            isAuthorized = true;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    }

    if (!isAuthorized) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configurar rutas donde corre el middleware
export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de la página excepto:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico y archivos con extensiones (imágenes, logos, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
