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

async function testInsert() {
  try {
    // 1. Fetch folders
    const { data: folders, error: fError } = await supabase.from('folders').select('*');
    if (fError || !folders || folders.length === 0) {
      console.error('No folders or error', fError);
      return;
    }
    const folder = folders[0];
    console.log('Folder:', folder.id);

    // 2. Insert doc
    const newDoc = {
      folder_id: folder.id,
      name: 'hello.txt',
      type: 'txt',
      size: '1 MB',
      uploadedby: 'Test',
      uploadedat: new Date().toISOString(),
      description: 'Test file',
      drive_link: 'http://test.com'
    };

    const { data: savedDoc, error: dbError } = await supabase.from('documents').insert([newDoc]).select().single();
    if (dbError) {
      console.error('DB Error:', dbError);
    } else {
      console.log('DB Success:', savedDoc);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testInsert();
