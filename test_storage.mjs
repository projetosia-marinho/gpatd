import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://kyfmkjmwhwlepjgibiru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Zm1ram13aHdsZXBqZ2liaXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NzkzMzYsImV4cCI6MjA5NDQ1NTMzNn0.VK5rCje1ctM2pKlvyWsJXREBxSaTmzAV-aOGD9W6aRA';

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
