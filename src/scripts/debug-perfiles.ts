import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtiwwhnoaiiwvgivtcko.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aXd3aG5vYWlpd3ZnaXZ0Y2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTU1MzksImV4cCI6MjA5MjQzMTUzOX0.wHiAM-sCSs_yzBfTDxwBB882lJcw6q-QVo7dcsxXYl8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFinal() {
  console.log('Probando insertar en perfiles con ID de texto...')
  const { error } = await supabase.from('perfiles').insert({
    id: 'test-user-text-id',
    nombre: 'Prueba',
    apellido: 'Final',
    telefono: '1122334455',
    last_seen: new Date().toISOString()
  })

  if (error) {
    console.log('ERROR_FINAL:', error.message)
    console.log('CODE:', error.code)
  } else {
    console.log('SUCCESS: ¡Ya se puede insertar!')
    // No borramos para que el usuario pueda verlo en el admin
  }
}

testFinal()
