import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ifiustebhfotrmceqnbx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaXVzdGViaGZvdHJtY2VxbmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzEyMjEsImV4cCI6MjA3OTIwNzIyMX0.SYeIKUPeTrNK6sBXuYfVnmEe68GmlFduNd1A9BWdQy4';

export const supabase = createClient(supabaseUrl, supabaseKey);

