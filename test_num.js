import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetchNextNumber() {
  const currentYear = new Date().getFullYear();
  const divShort = 'CMDO';
  let nextNum = 1;

  try {
    const { data: activeData, error: activeErr } = await supabase
      .from('processes')
      .select('patd_number');

    const { data: deletedData, error: deletedErr } = await supabase
      .from('deleted_processes')
      .select('patd_number');

    console.log('activeData:', activeData);
    console.log('deletedData:', deletedData);

    const allNumbers = [
      ...(activeData || []).map((p) => p.patd_number),
      ...(deletedData || []).map((p) => p.patd_number)
    ];

    let maxNum = 0;
    allNumbers.forEach((pStr) => {
      if (!pStr) return;
      const parts = pStr.split('/');
      if (parts.length >= 3) {
        const pDiv = parts[1].toUpperCase();
        const pYear = parseInt(parts[2], 10);
        if (pDiv === divShort && pYear === currentYear) {
          const num = parseInt(parts[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    nextNum = maxNum + 1;
    console.log('nextNum:', nextNum);
    console.log('formatted:', `${String(nextNum).padStart(3, '0')}/${divShort}/${currentYear}`);
  } catch (err) {
    console.error(err);
  }
}

testFetchNextNumber();
