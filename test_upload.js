import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyfmkjmwhwlepjgibiru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Zm1ram13aHdsZXBqZ2liaXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzkzMzYsImV4cCI6MjA5NDQ1NTMzNn0.VK5rCje1ctM2pKlvyWsJXREBxSaTmzAV-aOGD9W6aRA';

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
