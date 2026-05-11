import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumn() {
  console.log('Verificando columna "visible" en tabla torneos...')
  const { data, error } = await supabase
    .from('torneos')
    .select('id, visible')
    .limit(1)

  if (error) {
    console.error('ERROR DETECTADO:', error.message)
    if (error.message.includes('column "visible" does not exist')) {
      console.log('CONFIRMADO: La columna "visible" no existe.')
    }
  } else {
    console.log('La columna existe. El problema es otro.')
    console.log('Data de prueba:', data)
  }
}

checkColumn()
