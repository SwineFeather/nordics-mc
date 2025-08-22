const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const STORAGE_BUCKET = 'map-images';
const IMAGES_DIR = path.join(__dirname, '..', 'nyrvalos');
const POLITICAL_MAPS_DIR = path.join(__dirname, '..', 'public', 'lovable-uploads', 'political-map');

const imageFiles = [
  'baselayer-low.jpg',
  'baselayer-med.jpg',
  'baselayer-full.jpg',
  'heightmap-low.png',
  'heightmap-med.png',
  'heightmap-full.png',
  'heightmap.png',
  'terrain-low.png',
  'terrain-med.png',
  'terrain-full.png',
  'misc-low.png',
  'misc-med.png',
  'misc-full.png',
  'heightmapVector-low.png',
  'heightmapVector-med.png',
  'heightmapVector-full.png',
  '2025NordicsMapWeek16small.jpg'
];

const politicalMapFiles = [
  '2025-04-20.jpg',
  '2024-02-24.png',
  '2024-01-06.png',
  '2023-12-21.jpg',
  '2023-11-12.png',
  '2023-10-29.png',
  '2023-10-10.png',
  '2023-10-08.png',
  '2023-10-02.png',
  '2023-10-01.png'
];

async function uploadImages() {
  console.log('Starting image upload to Supabase storage...');
  
  try {
    // Check if bucket exists, create if it doesn't
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${STORAGE_BUCKET}`);
      const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
    }
    
    // Upload nyrvalos images
    console.log('\n=== Uploading Nyrvalos Images ===');
    for (const filename of imageFiles) {
      const filePath = path.join(IMAGES_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      console.log(`Uploading ${filename}...`);
      
      const fileBuffer = fs.readFileSync(filePath);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, fileBuffer, {
          contentType: filename.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Error uploading ${filename}:`, uploadError);
      } else {
        console.log(`✓ Successfully uploaded ${filename}`);
      }
    }
    
    // Upload political map images
    console.log('\n=== Uploading Political Map Images ===');
    for (const filename of politicalMapFiles) {
      const filePath = path.join(POLITICAL_MAPS_DIR, filename);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }
      
      console.log(`Uploading political-maps/${filename}...`);
      
      const fileBuffer = fs.readFileSync(filePath);
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(`political-maps/${filename}`, fileBuffer, {
          contentType: filename.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Error uploading political-maps/${filename}:`, uploadError);
      } else {
        console.log(`✓ Successfully uploaded political-maps/${filename}`);
      }
    }
    
    console.log('\n=== Image Upload Completed! ===');
    
    // List uploaded files
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list();
    
    if (listError) {
      console.error('Error listing files:', listError);
    } else {
      console.log('\nUploaded files:');
      files.forEach(file => {
        const sizeMB = (file.metadata?.size / 1024 / 1024).toFixed(2);
        console.log(`- ${file.name} (${sizeMB} MB)`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the upload
uploadImages();
