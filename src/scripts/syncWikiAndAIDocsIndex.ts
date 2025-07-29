import { createClient } from '@supabase/supabase-js';
import matter from 'gray-matter';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const BUCKETS = ['wiki', 'ai-docs'];

async function listAllFiles(bucket: string, path: string = ''): Promise<string[]> {
  const { data: files, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
  if (error || !files) return [];
  let allFiles: string[] = [];
  for (const file of files) {
    const fullPath = path ? `${path}/${file.name}` : file.name;
    if (!file.metadata) {
      // Folder
      allFiles = allFiles.concat(await listAllFiles(bucket, fullPath));
    } else if (fullPath.endsWith('.md')) {
      allFiles.push(fullPath);
    }
  }
  return allFiles;
}

async function syncDocsIndex() {
  for (const bucket of BUCKETS) {
    console.log(`\n=== Processing ${bucket} bucket ===`);
    const allMdFiles = await listAllFiles(bucket, '');
    console.log(`Found ${allMdFiles.length} .md files in ${bucket}:`);
    allMdFiles.forEach(file => console.log(`  - ${file}`));
    
    for (const filePath of allMdFiles) {
      console.log(`Processing: ${filePath}`);
      const { data, error } = await supabase.storage.from(bucket).download(filePath);
      if (error || !data) {
        console.log(`  Error downloading ${filePath}:`, error);
        continue;
      }
      const text = await data.text();
      const { data: frontmatter, content } = matter(text);
      const title = frontmatter.title || content.split('\n')[0].replace(/^# /, '').trim() || filePath.split('/').pop()?.replace('.md', '');
      const slug = filePath.split('/').pop()?.replace('.md', '');
      
      // Upsert into the index table
      const { error: upsertError } = await supabase
        .from('wiki_pages_index')
        .upsert({
          title,
          slug,
          path: filePath,
          bucket,
          updated_at: new Date().toISOString()
        }, { onConflict: 'path' });
      
      if (upsertError) {
        console.log(`  Error upserting ${filePath}:`, upsertError);
      } else {
        console.log(`  ✓ Indexed: ${title} (${slug})`);
      }
    }
    console.log(`Synced ${bucket} bucket.`);
  }
  console.log('\nWiki and AI docs index sync complete!');
}

syncDocsIndex(); 