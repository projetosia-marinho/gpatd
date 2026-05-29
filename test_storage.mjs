import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão definidas no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  try {
    const fileContent = 'Hello World';
    const { data, error } = await supabase.storage
      .from('documents')
      .upload('test.txt', fileContent, {
        upsert: true
      });

    if (error) {
      console.error('Storage Error:', error);
    } else {
      console.log('Storage Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testStorage();
