import { NextResponse } from 'next/server';

export const revalidate = 604800; // Cache por 1 semana (60 * 60 * 24 * 7 segundos)

export async function GET() {
  const SPREADSHEET_ID = '17GtQnbVYhJYb0X0R80SLfC_S796-x9vB';
  const categories = ['4TA', '5TA', '6TA', '7MA'];
  const newRankingData: Record<string, any[]> = {};

  try {
    for (const cat of categories) {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${cat}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Error fetching ${cat}`);
      }
      
      const csvText = await res.text();
      const lines = csvText.split('\n');
      const parsedCat = [];
      
      for (const line of lines) {
        // gviz csv format: "VAL1","VAL2","VAL3"
        const cols = line.split('","').map(c => c.replace(/(^"|"$)/g, ''));
        if (cols.length >= 3) {
           const pos = parseInt(cols[0]);
           let pts = parseInt(cols[2]);
           const name = (cols[1] || '').trim().toUpperCase();
           
           if (!isNaN(pts) && name && name !== 'JUGADORES' && !name.includes('PUNTAJES')) {
             parsedCat.push({
               pos: isNaN(pos) ? 0 : pos,
               name,
               pts
             });
           }
        }
      }
      
      // Aseguramos que el nombre del key sea en minúsculas (ej: '4ta') para mantener compatibilidad
      newRankingData[cat.toLowerCase()] = parsedCat;
    }
    
    return NextResponse.json(newRankingData);
  } catch (error) {
    console.error('API Ranking Error:', error);
    return NextResponse.json({ error: 'Failed to fetch ranking' }, { status: 500 });
  }
}
