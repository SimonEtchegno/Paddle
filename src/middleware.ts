import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
