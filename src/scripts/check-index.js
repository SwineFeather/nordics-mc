const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkIndex() {
  console.log('Checking wiki_pages_index table...');
  
  const { data, error } = await supabase
    .from('wiki_pages_index')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error querying table:', error);
    return;
  }
  
  console.log(`Found ${data.length} entries in wiki_pages_index:`);
  data.forEach(entry => {
    console.log(`- ${entry.title} (${entry.slug}) from ${entry.bucket}/${entry.path}`);
  });
}

checkIndex().catch(console.error); 