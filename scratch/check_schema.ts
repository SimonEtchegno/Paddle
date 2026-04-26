import { supabase } from './src/lib/supabase';

async function checkSchema() {
  const { data, error } = await supabase.from('torneos').select('*').limit(1);
  if (error) {
    console.error('Error fetching torneos:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in torneos:', Object.keys(data[0]));
  } else {
    console.log('No data in torneos to check columns.');
  }
}

checkSchema();
