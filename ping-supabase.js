// Script para mantener Supabase "despierto" en el plan gratuito
// Requiere Node.js y node-fetch (npm install node-fetch)

const fetch = require('node-fetch');

const SUPABASE_URL = 'https://rtiwwhnoaiiwvgivtcko.supabase.co/rest/v1/reservas?select=id&limit=1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aXd3aG5vYWlpd3ZnaXZ0Y2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTU1MzksImV4cCI6MjA5MjQzMTUzOX0.wHiAM-sCSs_yzBfTDxwBB882lJcw6q-QVo7dcsxXYl8';

async function pingSupabase() {
  try {
    const res = await fetch(SUPABASE_URL, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (res.ok) {
      console.log('Ping exitoso:', new Date().toLocaleString());
    } else {
      console.error('Error en el ping:', res.status);
    }
  } catch (err) {
    console.error('Error de red:', err);
  }
}

setInterval(pingSupabase, 5 * 60 * 1000); // Cada 5 minutos
pingSupabase(); // Primer ping inmediato
