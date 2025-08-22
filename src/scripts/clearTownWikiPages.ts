import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearTownWikiPages() {
  try {
    console.log('🗑️ Starting to clear all town wiki pages content...');
    
    let totalCleared = 0;

    // 1. Clear pages in towns category
    console.log('🔍 Looking for towns category...');
    const { data: townsCategory, error: categoryError } = await supabase
      .from('wiki_categories')
      .select('id')
      .eq('slug', 'towns')
      .single();

    if (categoryError && categoryError.code !== 'PGRST116') {
      console.error('❌ Error finding towns category:', categoryError);
      return;
    }

    if (townsCategory) {
      console.log('✅ Found towns category, clearing pages...');
      const { data: townsPages, error: townsError } = await supabase
        .from('wiki_pages')
        .update({ 
          content: '',
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('category_id', townsCategory.id)
        .select('id');

      if (townsError) {
        console.error('❌ Error clearing towns category pages:', townsError);
      } else {
        totalCleared += townsPages?.length || 0;
        console.log(`✅ Cleared ${townsPages?.length || 0} pages in towns category`);
      }
    } else {
      console.log('⚠️ No towns category found');
    }

    // 2. Clear pages with town-related slugs
    console.log('🔍 Clearing pages with town-related slugs...');
    const { data: slugPages, error: slugError } = await supabase
      .from('wiki_pages')
      .update({ 
        content: '',
        last_edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .or('slug.like.town-%,slug.like.%-town')
      .select('id');

    if (slugError) {
      console.error('❌ Error clearing slug-based town pages:', slugError);
    } else {
      totalCleared += slugPages?.length || 0;
      console.log(`✅ Cleared ${slugPages?.length || 0} pages with town-related slugs`);
    }

    // 3. Clear pages that match town names
    console.log('🔍 Fetching town names from database...');
    const { data: towns, error: townsError } = await supabase
      .from('towns')
      .select('name');

    if (townsError) {
      console.error('❌ Error fetching town names:', townsError);
    } else if (towns && towns.length > 0) {
      console.log(`🔍 Found ${towns.length} towns, clearing matching pages...`);
      const townNames = towns.map(t => t.name);
      
      const { data: titlePages, error: titleError } = await supabase
        .from('wiki_pages')
        .update({ 
          content: '',
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('title', townNames)
        .select('id');

      if (titleError) {
        console.error('❌ Error clearing title-based town pages:', titleError);
      } else {
        totalCleared += titlePages?.length || 0;
        console.log(`✅ Cleared ${titlePages?.length || 0} pages with town names as titles`);
      }
    }

    // 4. Clear pages in town-related subcategories
    console.log('🔍 Looking for town-related subcategories...');
    const { data: townsSubcategories, error: subcatError } = await supabase
      .from('wiki_categories')
      .select('id')
      .or('title.ilike.%town%,slug.ilike.%town%');

    if (subcatError) {
      console.error('❌ Error finding town subcategories:', subcatError);
    } else if (townsSubcategories && townsSubcategories.length > 0) {
      console.log(`🔍 Found ${townsSubcategories.length} town-related subcategories, clearing pages...`);
      const subcategoryIds = townsSubcategories.map(cat => cat.id);
      
      const { data: subcatPages, error: subcatPagesError } = await supabase
        .from('wiki_pages')
        .update({ 
          content: '',
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('category_id', subcategoryIds)
        .select('id');

      if (subcatPagesError) {
        console.error('❌ Error clearing town subcategory pages:', subcatPagesError);
      } else {
        totalCleared += subcatPages?.length || 0;
        console.log(`✅ Cleared ${subcatPages?.length || 0} pages in town subcategories`);
      }
    }

    console.log(`\n🎉 Successfully cleared content for ${totalCleared} town wiki pages!`);
    console.log('📝 All town pages now have empty content and can be edited fresh.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the function
clearTownWikiPages()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });







