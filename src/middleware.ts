import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Definir los dominios que NO son clubes (tu página principal de venta o localhost limpio)
  const excludeList = [
    'localhost:3000',
    'padelmanager.com', // Tu dominio principal futuro
    'paddle-main.vercel.app' // Cambia esto por tu URL de Vercel real si quieres
  ];

  // 2. Extraer el subdominio (ej: penarol.padelmanager.com -> penarol)
  let slug = '';
  
  // Si estamos en Vercel o producción
  if (!excludeList.includes(hostname)) {
    // Si el hostname termina en .vercel.app o .tudominio.com
    const parts = hostname.split('.');
    if (parts.length > 2) {
      slug = parts[0]; // El primer pedacito es el slug del club
    }
  }

  // 3. Pasar el slug detectado a la aplicación mediante un header personalizado
  const response = NextResponse.next();
  if (slug) {
    response.headers.set('x-active-club-slug', slug);
  }

  return response;
}

// Configurar en qué rutas se ejecuta el middleware (queremos que sea en casi todas)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
