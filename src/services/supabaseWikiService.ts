import { supabase } from '@/integrations/supabase/client';
import { WikiCategory, WikiPage } from '@/types/wiki';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';


export interface WikiStorageItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export interface WikiFileStructure {
  type: 'file' | 'folder';
  name: string;
  path: string;
  children?: WikiFileStructure[];
  content?: string;
  isGroup?: boolean; // true if folder has no README.md
  isPage?: boolean; // true if folder has README.md or is a .md file
}

export class SupabaseWikiService {
  private static readonly BUCKET_NAME = 'wiki';
  private static readonly BASE_PATH = 'Nordics';
  private static readonly S3_ENDPOINT = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/s3';
  private static readonly REGION = 'eu-north-1';
  private static readonly ACCESS_KEY_ID = '96dbaa973dcb77349745eb36d4e9e93a';
  
  // S3 Client for direct bucket access
  private static s3Client = new S3Client({
    endpoint: 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/s3',
    region: 'eu-north-1',
    credentials: {
      accessKeyId: '96dbaa973dcb77349745eb36d4e9e93a',
      secretAccessKey: import.meta.env.VITE_SUPABASE_S3_SECRET_KEY || 'MISSING_SECRET_KEY'
    },
    forcePathStyle: true
  });

  


  /**
   * Get the complete file structure from the wiki bucket using S3-compatible access
   */
  static async getFileStructure(): Promise<WikiFileStructure[]> {
    try {

      const recursiveStructure = await this.getFileStructureViaPathDiscovery();
      
      if (recursiveStructure.length > 0) {
        console.log('✅ Successfully loaded structure via recursive discovery');
        return recursiveStructure;
      }
      
      // Fallback to S3 if recursive discovery doesn't work
      console.log('🔄 Recursive discovery failed, falling back to S3...');
      const s3Structure = await this.getFileStructureViaS3();
      if (s3Structure.length > 0) {
        console.log('✅ Successfully loaded structure via S3');
        return s3Structure;
      }
      
      console.log('❌ No files found with any method');
      return [];
    } catch (error) {
      console.error('❌ Failed to load wiki structure:', error);
      throw error;
    }
  }

  /**
   * Get file structure using S3-compatible API
   */
  private static async getFileStructureViaS3(): Promise<WikiFileStructure[]> {
    try {
      console.log('🔍 Attempting S3-compatible access...');
      
      // Check if we have the secret key
      if (!import.meta.env.VITE_SUPABASE_S3_SECRET_KEY || import.meta.env.VITE_SUPABASE_S3_SECRET_KEY === 'your_secret_access_key_here') {
        console.log('⚠️ S3 secret key not found in environment variables');
        return [];
      }
      
      // Use S3 ListObjectsV2 to get all objects in the bucket
      const command = new ListObjectsV2Command({
        Bucket: this.BUCKET_NAME,
        MaxKeys: 1000
      });
      
      const response = await this.s3Client.send(command);
      
      if (!response.Contents || response.Contents.length === 0) {

        return [];
      }
      
      // Process S3 objects
      const structure: WikiFileStructure[] = [];
      const fileMap = new Map<string, WikiFileStructure>();
      const folderMap = new Map<string, WikiFileStructure>();
      
      for (const object of response.Contents) {
        if (!object.Key) continue;
        
        const path = object.Key;
        const pathParts = path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        

        
        if (fileName.endsWith('.md')) {
          // This is a markdown file
          const fileStructure: WikiFileStructure = {
            type: 'file',
            name: fileName,
            path: path,
            isPage: true
          };
          
          fileMap.set(path, fileStructure);
          
          // Add parent folders to discovered folders
          for (let i = 0; i < pathParts.length - 1; i++) {
            const folderPath = pathParts.slice(0, i + 1).join('/');
            if (!folderMap.has(folderPath)) {
              const folderName = pathParts[i];
              const folderStructure: WikiFileStructure = {
                type: 'folder',
                name: folderName,
                path: folderPath,
                children: [],
                isGroup: true,
                isPage: false
              };
              folderMap.set(folderPath, folderStructure);
            }
          }
          
          // Add to parent folder or root
          if (pathParts.length > 1) {
            const parentPath = pathParts.slice(0, -1).join('/');
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileStructure);
            }
          } else {
            structure.push(fileStructure);
          }
        }
      }
      
      // Add folders to structure
      for (const [folderPath, folder] of folderMap) {
        const pathParts = folderPath.split('/');
        if (pathParts.length === 1) {
          // Root folder
          structure.push(folder);
        } else {
          // Child folder - add to parent
          const parentPath = pathParts.slice(0, -1).join('/');
          const parent = folderMap.get(parentPath);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(folder);
          }
        }
      }
      
      // Update folder flags based on README presence
      this.updateFolderFlags(structure);
      

      return structure;
    } catch (error) {
      console.error('❌ S3 access failed:', error);
      return [];
    }
  }

  /**
   * Test method to check if we can list the root directory
   */
  private static async testRootDirectory(): Promise<void> {
    console.log('🧪 Testing root directory listing...');
    
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 10 });
      
      console.log('🧪 Root directory test result:', { data, error });
      
      if (data && data.length > 0) {
        console.log('🧪 Root directory contents:', data);
      }
    } catch (error) {
      console.log('🧪 Root directory test error:', error);
    }
  }

  /**
   * Comprehensive directory discovery - try multiple approaches
   */
  private static async comprehensiveDirectoryDiscovery(): Promise<{ files: WikiFileStructure[], folders: Set<string> }> {
    console.log('🔍 Starting comprehensive directory discovery...');
    
    const discoveredFiles: WikiFileStructure[] = [];
    const discoveredFolders = new Set<string>();
    
    // Try different root directory names
    const possibleRoots = ['', 'Nordics', 'nordics', 'Nordics/', 'nordics/', 'wiki', 'Wiki'];
    
    for (const root of possibleRoots) {
      console.log(`🔍 Testing root: "${root}"`);
      
      try {
        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list(root, { limit: 1000 });
        
        if (error) {
          console.log(`❌ Error listing "${root}":`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`✅ Found ${data.length} items in "${root}":`, data);
          
          // Add root to discovered folders if it's not empty
          if (root) {
            discoveredFolders.add(root);
          }
          
          // Process each item
          for (const item of data) {
            const fullPath = root ? `${root}/${item.name}` : item.name;
            
            if (item.metadata) {
              // This is a file
              if (item.name.endsWith('.md')) {
                console.log(`📄 Found markdown file: ${fullPath}`);
                discoveredFiles.push({
                  type: 'file',
                  name: item.name,
                  path: fullPath,
                  isPage: true
                });
              }
            } else {
              // This is a directory
              console.log(`📂 Found directory: ${fullPath}`);
              discoveredFolders.add(fullPath);
              
              // Recursively explore this directory
              await this.exploreDirectoryRecursively(fullPath, discoveredFiles, discoveredFolders);
            }
          }
          
          // If we found items in this root, we can stop trying other roots
          break;
        } else {
          console.log(`📭 No items found in "${root}"`);
        }
      } catch (error) {
        console.log(`❌ Exception listing "${root}":`, error);
      }
    }
    
    return { files: discoveredFiles, folders: discoveredFolders };
  }

  /**
   * Get file structure using comprehensive file discovery
   */
  private static async getFileStructureViaPathDiscovery(): Promise<WikiFileStructure[]> {
    console.log('🔍 Using comprehensive directory discovery...');
    
    // Test root directory first
    await this.testRootDirectory();
    
    // Use comprehensive discovery
    const { files: discoveredFiles, folders: discoveredFolders } = await this.comprehensiveDirectoryDiscovery();
    
    // Also try HTTP discovery as a fallback
    console.log('🔍 Trying HTTP discovery as fallback...');
    const httpFiles = await this.discoverFilesViaHttp();
    for (const filePath of httpFiles) {
      const fileName = filePath.split('/').pop() || '';
      discoveredFiles.push({
        type: 'file',
        name: fileName,
        path: filePath,
        isPage: true
      });
      
      // Add parent folders
      const pathParts = filePath.split('/');
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i + 1).join('/');
        discoveredFolders.add(folderPath);
      }
    }
    
    // Build hierarchical structure from discovered items
    const structure = this.buildHierarchicalStructure(discoveredFiles, Array.from(discoveredFolders));
    
    console.log('✅ Wiki structure loaded via recursive discovery:', structure);
    console.log('📁 Discovered files:', discoveredFiles.length);
    console.log('📂 Discovered folders:', discoveredFolders.size);
    console.log('📋 Raw discovered files:', discoveredFiles);
    console.log('📂 Raw discovered folders:', Array.from(discoveredFolders));
    
    return structure;
  }

  /**
   * Build hierarchical structure from discovered files and folders
   */
  private static buildHierarchicalStructure(files: WikiFileStructure[], folders: string[]): WikiFileStructure[] {
    console.log('🔨 Building hierarchical structure...');
    console.log('📁 Input files:', files);
    console.log('📂 Input folders:', folders);
    
    const structure: WikiFileStructure[] = [];
    const folderMap = new Map<string, WikiFileStructure>();
    
    // Sort folders by depth (shallowest first)
    folders.sort((a, b) => a.split('/').length - b.split('/').length);
    console.log('📂 Sorted folders:', folders);
    
    // Create folder structures
    for (const folderPath of folders) {
      const pathParts = folderPath.split('/');
      const folderName = pathParts[pathParts.length - 1];
      
      const folder: WikiFileStructure = {
        type: 'folder',
        name: folderName,
        path: folderPath,
        children: [],
        isGroup: true, // Will be updated when we check for README
        isPage: false
      };
      
      folderMap.set(folderPath, folder);
      console.log(`📁 Created folder: ${folderName} at ${folderPath}`);
      
      // Add to parent folder or root structure
      if (pathParts.length === 1) {
        structure.push(folder);
        console.log(`📁 Added root folder: ${folderName}`);
      } else {
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(folder);
          console.log(`📁 Added child folder: ${folderName} to ${parentPath}`);
        } else {
          console.log(`⚠️ Parent folder not found: ${parentPath} for ${folderName}`);
        }
      }
    }
    
    // Add files to their respective folders
    for (const file of files) {
      const pathParts = file.path.split('/');
      if (pathParts.length === 1) {
        // File in root
        structure.push(file);
        console.log(`📄 Added root file: ${file.name}`);
      } else {
        // File in folder
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(file);
          console.log(`📄 Added file: ${file.name} to ${parentPath}`);
        } else {
          console.log(`⚠️ Parent folder not found: ${parentPath} for file ${file.name}`);
          // Add to root if parent not found
          structure.push(file);
        }
      }
    }
    
    // Update isGroup/isPage flags based on README presence
    this.updateFolderFlags(structure);
    
    console.log('✅ Final structure:', structure);
    return structure;
  }

  /**
   * Update folder flags based on README presence
   */
  private static updateFolderFlags(items: WikiFileStructure[]) {
    for (const item of items) {
      if (item.type === 'folder' && item.children) {
        const hasReadme = item.children.some(child => child.name === 'README.md');
        item.isGroup = !hasReadme;
        item.isPage = hasReadme;
        
        // Recursively update children
        this.updateFolderFlags(item.children);
      }
    }
  }

  /**
   * Discover files by trying HTTP requests to public URLs
   */
  private static async discoverFilesViaHttp(): Promise<string[]> {
    const discoveredFiles: string[] = [];
    const baseUrl = 'https://erdconvorgecupvavlwv.supabase.co/storage/v1/object/public/wiki';
    
    // Reduced list of files to test via HTTP (focusing on most likely ones)
    const filesToTest = [
      // Known working files
      'Nordics/nations/constellation.md',
      'Nordics/towns/garvia/README.md',
      
      // Files mentioned in README content
      'Nordics/towns/sogndalsfjorden.md',
      'Nordics/towns/kingdom_of_albion/england/lundenwic.md',
      'Nordics/towns/northstar/README.md',
      'Nordics/server-events/terrain-incidents/northstar-forest-fire.md',
      'Nordics/server-events/terrain-incidents/the-sapmi-forest-fire.md',
      
      // Common README files
      'Nordics/towns/README.md',
      'Nordics/nations/README.md',
      'Nordics/README.md',
      
      // A few additional potential files
      'Nordics/towns/garvia/history.md',
      'Nordics/towns/garvia/economy.md',
      'Nordics/towns/garvia/culture.md',
      'Nordics/about.md'
    ];
    
    console.log(`🌐 Testing ${filesToTest.length} files via HTTP...`);
    
    for (const filePath of filesToTest) {
      try {
        const url = `${baseUrl}/${filePath}`;
        
        const response = await fetch(url);
        if (response.ok) {
          console.log(`✅ Found via HTTP: ${filePath}`);
          discoveredFiles.push(filePath);
        }
        // Don't log 400 errors as they're expected for non-existent files
      } catch (error) {
        // Silently handle network errors
      }
    }
    
    console.log(`✅ HTTP discovery complete. Found ${discoveredFiles.length} files.`);
    return discoveredFiles;
  }

  /**
   * Explore a directory recursively and build the file structure
   */
  private static async exploreDirectory(path: string): Promise<WikiFileStructure[]> {
    try {
      console.log(`🔍 Exploring directory: ${path}`);
      
      // List files in the current directory
      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path, { limit: 1000 });

      console.log(`📂 Files in ${path}:`, files);
      console.log(`❌ Error for ${path}:`, error);

      if (error) {
        console.error(`Error listing directory ${path}:`, error);
        return [];
      }

      if (!files || files.length === 0) {
        console.log(`📭 No files found in ${path}`);
        return [];
      }

      const structure: WikiFileStructure[] = [];

      for (const file of files) {
        const fullPath = path === this.BASE_PATH ? file.name : `${path}/${file.name}`;
        
        if (file.metadata) {
          // This is a file
          if (file.name.endsWith('.md')) {
            structure.push({
              type: 'file',
              name: file.name,
              path: fullPath,
              isPage: true
            });
          }
        } else {
          // This is a folder
          const children = await this.exploreDirectory(fullPath);
          
          // Check if this folder has a README.md file
          const hasReadme = children.some(child => 
            child.type === 'file' && child.name === 'README.md'
          );
          
          structure.push({
            type: 'folder',
            name: file.name,
            path: fullPath,
            children,
            isGroup: !hasReadme,
            isPage: hasReadme
          });
        }
      }

      return structure;
    } catch (error) {
      console.error(`Error exploring directory ${path}:`, error);
      return [];
    }
  }

  /**
   * Explore a directory recursively and collect all files and folders
   */
  private static async exploreDirectoryRecursively(
    path: string, 
    discoveredFiles: WikiFileStructure[], 
    discoveredFolders: Set<string>
  ): Promise<void> {
    console.log(`🔍 Recursively exploring directory: ${path}`);
    
    try {
      console.log(`📡 Making Supabase storage list request for: ${path}`);
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path, { limit: 1000 });
      
      console.log(`📡 Supabase response for ${path}:`, { data, error });
      
      if (error) {
        console.log(`❌ Failed to list directory ${path}:`, error);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log(`📁 Directory ${path} is empty`);
        return;
      }
      
      console.log(`✅ Found ${data.length} items in ${path}:`, data);
      
      // Add current directory to discovered folders
      discoveredFolders.add(path);
      
      for (const item of data) {
        const fullPath = `${path}/${item.name}`;
        console.log(`📄 Processing item: ${item.name} (metadata: ${!!item.metadata}) at ${fullPath}`);
        
        if (item.metadata) {
          // This is a file
          if (item.name.endsWith('.md')) {
            console.log(`📄 Found markdown file: ${fullPath}`);
            discoveredFiles.push({
              type: 'file',
              name: item.name,
              path: fullPath,
              isPage: true
            });
          } else {
            console.log(`📄 Found non-markdown file: ${fullPath}`);
          }
        } else {
          // This is a directory - recursively explore it
          console.log(`📂 Found subdirectory: ${fullPath} - exploring recursively`);
          await this.exploreDirectoryRecursively(fullPath, discoveredFiles, discoveredFolders);
        }
      }
    } catch (error) {
      console.log(`❌ Error exploring directory ${path}:`, error);
    }
  }

  /**
   * Get the content of a specific file
   */
  static async getFileContent(path: string): Promise<string> {
    try {
      console.log(`📄 Loading file content: ${path}`);
      
      // Check if this should use live data
      const { LiveWikiDataService } = await import('./liveWikiDataService');
      const liveContent = await LiveWikiDataService.getLiveContent(path);
      
      if (liveContent) {
        console.log(`✅ Live content loaded: ${path} (${liveContent.length} characters)`);
        return liveContent;
      }
      
      // Fall back to static content
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(path);

      if (error) {
        console.error(`Error downloading file ${path}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`File ${path} not found`);
      }

      const content = await data.text();
      console.log(`✅ Static file content loaded: ${path} (${content.length} characters)`);
      
      return content;
    } catch (error) {
      console.error(`❌ Failed to load file content ${path}:`, error);
      throw error;
    }
  }

  /**
   * Get file content with metadata about whether it's live data
   */
  static async getFileContentWithMetadata(path: string): Promise<{ content: string; isLiveData: boolean; lastUpdated?: string }> {
    try {
      console.log(`📄 Loading file content with metadata: ${path}`);
      
      // Check if this should use live data
      const { LiveWikiDataService } = await import('./liveWikiDataService');
      
      if (LiveWikiDataService.shouldUseLiveData(path)) {
        const { entityType, entityName } = LiveWikiDataService.extractEntityInfo(path);
        
        if (entityType && entityName) {
          try {
            const liveData = await LiveWikiDataService.getLiveWikiData(entityType, entityName);
            console.log(`✅ Live content loaded: ${path} (${liveData.content.length} characters)`);
            return {
              content: liveData.content,
              isLiveData: true,
              lastUpdated: liveData.lastUpdated
            };
          } catch (error) {
            console.warn(`⚠️ Live data failed, falling back to static: ${path}`, error);
          }
        }
      }
      
      // Fall back to static content
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(path);

      if (error) {
        console.error(`Error downloading file ${path}:`, error);
        throw error;
      }

      if (!data) {
        throw new Error(`File ${path} not found`);
      }

      const content = await data.text();
      console.log(`✅ Static file content loaded: ${path} (${content.length} characters)`);
      
      return {
        content,
        isLiveData: false
      };
    } catch (error) {
      console.error(`❌ Failed to load file content ${path}:`, error);
      throw error;
    }
  }

  /**
   * Convert file structure to wiki categories and pages
   */
  static async convertToWikiData(structure: WikiFileStructure[]): Promise<WikiCategory[]> {
    const categories: WikiCategory[] = [];
    
    console.log('🔄 Converting structure to wiki data...');
    console.log('📁 Input structure:', structure);
    
    // Process all items recursively
    for (const item of structure) {
      if (item.type === 'folder') {
        // Special handling for "Nordics" folder - extract its children directly
        if (item.name === 'Nordics' && item.children) {
          console.log('🔄 Processing Nordics folder - extracting children directly...');
          
          for (const child of item.children) {
            if (child.type === 'folder') {
              const category = await this.convertFolderToCategory(child);
              if (category) {
                categories.push(category);
                console.log(`✅ Converted Nordics child folder to category: ${category.title} with ${category.pages?.length || 0} pages and ${category.children?.length || 0} subcategories`);
              }
            } else if (child.type === 'file' && child.name.endsWith('.md')) {
              // Handle files directly under Nordics - create individual categories for each
              const page = await this.convertFileToPageMinimal(child, 'nordics-root');
              if (page) {
                // Create a category for each Nordics root file
                const nordicsRootCategory: WikiCategory = {
                  id: `nordics-root-${page.slug}`,
                  title: page.title,
                  slug: page.slug,
                  description: `Nordics documentation: ${page.title}`,
                  parent_id: null,
                  order: 0,
                  children: [],
                  pages: [page]
                };
                categories.push(nordicsRootCategory);
                console.log(`✅ Created category for Nordics root file (meta only): ${page.title}`);
              }
            }
          }
        } else {
          // Normal folder processing for non-Nordics folders
          const category = await this.convertFolderToCategory(item);
          if (category) {
            categories.push(category);
            console.log(`✅ Converted folder to category: ${category.title} with ${category.pages?.length || 0} pages and ${category.children?.length || 0} subcategories`);
          }
        }
      } else if (item.type === 'file' && item.name.endsWith('.md')) {
        // Handle standalone files at root level
        const page = await this.convertFileToPageMinimal(item, 'root');
        if (page) {
          // Create a category for standalone files
          const standaloneCategory: WikiCategory = {
            id: 'standalone-files',
            title: 'Standalone Files',
            slug: 'standalone-files',
            description: 'Files at root level',
            parent_id: null,
            order: 0,
            children: [],
            pages: [page]
          };
          categories.push(standaloneCategory);
          console.log(`✅ Converted standalone file to page (meta only): ${page.title}`);
        }
      }
    }

    console.log(`✅ Conversion complete: ${categories.length} categories created`);
    return categories;
  }

  /**
   * Convert a folder to a wiki category
   */
  private static async convertFolderToCategory(folder: WikiFileStructure): Promise<WikiCategory | null> {
    console.log(`🔄 Converting folder: ${folder.name} (${folder.path})`);
    console.log(`📁 Folder children:`, folder.children?.length || 0);
    
    const category: WikiCategory = {
      id: folder.path,
      title: this.formatTitle(folder.name),
      slug: folder.name,
      description: folder.isGroup ? `Group: ${this.formatTitle(folder.name)}` : undefined,
      parent_id: null,
      order: 0,
      children: [],
      pages: []
    };

    if (folder.children) {
      console.log(`📁 Processing ${folder.children.length} children in ${folder.name}`);
      
      for (const child of folder.children) {
        console.log(`📄 Processing child: ${child.type} - ${child.name}`);
        
        if (child.type === 'file' && child.name.endsWith('.md')) {
          // This is a page (metadata only; content loaded on demand)
          const page = await this.convertFileToPageMinimal(child, category.id);
          if (page) {
            category.pages?.push(page);
            console.log(`✅ Added page (meta only): ${page.title} to category ${category.title}`);
          }
        } else if (child.type === 'folder') {
          // This is a subcategory
          const subcategory = await this.convertFolderToCategory(child);
          if (subcategory) {
            category.children?.push(subcategory);
            console.log(`✅ Added subcategory: ${subcategory.title} to category ${category.title}`);
          }
        }
      }
    }

    console.log(`✅ Finished converting folder ${folder.name}: ${category.pages?.length || 0} pages, ${category.children?.length || 0} subcategories`);
    return category;
  }

  /**
   * Convert a file to a wiki page
   */
  private static async convertFileToPage(file: WikiFileStructure, content: string, categoryId: string): Promise<WikiPage | null> {
    try {
      // Parse frontmatter if present
      const { frontmatter, markdown } = this.parseFrontmatter(content);
      
      const page: WikiPage = {
        id: file.path,
        title: frontmatter?.title || this.formatTitle(file.name.replace('.md', '')),
        slug: file.name.replace('.md', ''),
        content: markdown,
        status: 'published',
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: categoryId,
        order: 0,
        description: frontmatter?.description,
        tags: frontmatter?.tags || []
      };

      return page;
    } catch (error) {
      console.error(`Failed to convert file to page ${file.path}:`, error);
      return null;
    }
  }

  /**
   * Create a minimal page object without loading content (for fast initial render)
   */
  private static async convertFileToPageMinimal(file: WikiFileStructure, categoryId: string): Promise<WikiPage | null> {
    try {
      const title = this.formatTitle(file.name.replace('.md', ''));
      const page: WikiPage = {
        id: file.path,
        title,
        slug: file.name.replace('.md', ''),
        content: '',
        status: 'published',
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: categoryId,
        order: 0,
      };
      return page;
    } catch (error) {
      console.error(`Failed to convert file to minimal page ${file.path}:`, error);
      return null;
    }
  }

  /**
   * Parse frontmatter from markdown content
   */
  private static parseFrontmatter(content: string): { frontmatter?: any; markdown: string } {
    // Match ALL frontmatter blocks and merge them
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/g;
    const matches = [...content.matchAll(frontmatterRegex)];
    
    if (matches.length > 0) {
      try {
        // Merge all frontmatter blocks
        const mergedFrontmatter: any = {};
        
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          const frontmatterStr = match[1];
          
          const lines = frontmatterStr.split('\n');
          
          for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
              const key = line.substring(0, colonIndex).trim();
              let value = line.substring(colonIndex + 1).trim();
              
              // Remove quotes if present
              if ((value.startsWith('"') && value.endsWith('"')) || 
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
              }
              
              // Later frontmatter blocks override earlier ones
              mergedFrontmatter[key] = value;
            }
          }
        }
        
        // Remove all frontmatter blocks from content to get just the markdown
        const markdown = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/g, '');
        
        return { frontmatter: mergedFrontmatter, markdown };
      } catch (error) {
        console.error('Failed to parse frontmatter:', error);
      }
    }
    
    return { markdown: content };
  }

  /**
   * Public method to parse frontmatter for testing
   */
  static parseFrontmatterPublic(content: string): { frontmatter?: any; markdown: string } {
    return this.parseFrontmatter(content);
  }

  /**
   * Format a filename or folder name to a readable title
   */
  private static formatTitle(name: string): string {
    // Remove file extension
    const withoutExt = name.replace(/\.(md|txt)$/, '');
    
    // Replace hyphens and underscores with spaces
    const withSpaces = withoutExt.replace(/[-_]/g, ' ');
    
    // Capitalize first letter of each word
    return withSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Get a specific page by path
   */
  static async getPageByPath(path: string): Promise<WikiPage | null> {
    try {
      const content = await this.getFileContent(path);
      const { frontmatter, markdown } = this.parseFrontmatter(content);
      
      const page: WikiPage = {
        id: path,
        title: frontmatter?.title || this.formatTitle(path.split('/').pop()?.replace('.md', '') || ''),
        slug: path.split('/').pop()?.replace('.md', '') || '',
        content: markdown,
        status: 'published',
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: path.split('/').slice(0, -1).join('/'),
        order: 0,
        description: frontmatter?.description,
        tags: frontmatter?.tags || []
      };

      return page;
    } catch (error) {
      console.error(`Failed to get page ${path}:`, error);
      return null;
    }
  }

  /**
   * Search for pages in the wiki
   */
  static async searchPages(query: string): Promise<WikiPage[]> {
    try {
      const structure = await this.getFileStructure();
      const allPages: WikiPage[] = [];
      
      // Recursively find all pages
      const findPages = async (items: WikiFileStructure[]) => {
        for (const item of items) {
          if (item.type === 'file' && item.name.endsWith('.md')) {
            try {
              const content = await this.getFileContent(item.path);
              const { frontmatter, markdown } = this.parseFrontmatter(content);
              
              const page: WikiPage = {
                id: item.path,
                title: frontmatter?.title || this.formatTitle(item.name.replace('.md', '')),
                slug: item.name.replace('.md', ''),
                content: markdown,
                status: 'published',
                authorId: 'system',
                authorName: 'System',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                category: item.path.split('/').slice(0, -1).join('/'),
                order: 0,
                description: frontmatter?.description,
                tags: frontmatter?.tags || [],
                icon: frontmatter?.icon !== undefined && frontmatter?.icon !== null ? frontmatter.icon : '📄' // Extract icon from frontmatter
              };
              
              allPages.push(page);
            } catch (error) {
              console.error(`Failed to load page ${item.path}:`, error);
            }
          } else if (item.type === 'folder' && item.children) {
            await findPages(item.children);
          }
        }
      };
      
      await findPages(structure);
      
      // Filter pages based on query
      const lowercaseQuery = query.toLowerCase();
      return allPages.filter(page => 
        page.title.toLowerCase().includes(lowercaseQuery) ||
        page.content.toLowerCase().includes(lowercaseQuery) ||
        page.description?.toLowerCase().includes(lowercaseQuery) ||
        page.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Failed to search pages:', error);
      return [];
    }
  }

  /**
   * Test storage bucket access and permissions
   */
  static async testStorageAccess(): Promise<{ success: boolean; error?: string; details?: any }> {
    console.log('🔍 Starting comprehensive storage test...');
    console.log('🔍 Bucket name:', this.BUCKET_NAME);
    
    try {
      // Check authentication
      console.log('🔍 Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Authentication failed:', { authError, user: !!user });
        return { 
          success: false, 
          error: 'Authentication failed', 
          details: { authError, user: !!user } 
        };
      }
      
      console.log('✅ User authenticated:', user.email);
      
      // Test bucket listing
      console.log('🔍 Testing bucket listing...');
      const { data: listData, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 5 });
      
      if (listError) {
        console.error('❌ Bucket listing failed:', listError);
        return { 
          success: false, 
          error: 'Bucket listing failed', 
          details: { listError } 
        };
      }
      
      console.log('✅ Bucket listing successful:', listData?.length || 0, 'items found');
      
      // Test file upload (small test file)
      console.log('🔍 Testing file upload...');
      const testContent = 'Test file for permissions check';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testPath = `test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(testPath, testBlob, {
          contentType: 'text/plain',
          upsert: true
        });
      
      if (uploadError) {
        console.error('❌ File upload test failed:', uploadError);
        return { 
          success: false, 
          error: 'File upload test failed', 
          details: { uploadError } 
        };
      }
      
      console.log('✅ File upload test successful');
      
      // Clean up test file
      console.log('🔍 Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([testPath]);
      
      if (deleteError) {
        console.warn('⚠️ Failed to clean up test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up successfully');
      }
      
      return { 
        success: true, 
        details: { 
          user: user.email, 
          bucketItems: listData?.length || 0,
          testUpload: 'successful',
          testDelete: deleteError ? 'failed' : 'successful'
        } 
      };
      
    } catch (error) {
      console.error('❌ Storage test failed with exception:', error);
      return { 
        success: false, 
        error: 'Storage test failed', 
        details: { error } 
      };
    }
  }

  /**
   * Save a wiki page to Supabase storage
   */
  static async savePage(path: string, content: string, title?: string): Promise<void> {
    // First, let's test if we can access the storage bucket
    try {
      console.log(`🔍 Testing storage bucket access: ${this.BUCKET_NAME}`);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Authentication error:', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('No authenticated user found');
      }
      
      console.log('✅ User authenticated:', user.email);
      
      const { data: testData, error: testError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (testError) {
        console.error('❌ Storage bucket access test failed:', testError);
        console.error('❌ This might be due to missing RLS policies. Please run the migration: 20250116000000_fix_wiki_storage_rls.sql');
        throw new Error(`Storage bucket access failed: ${testError.message}`);
      }
      
      console.log('✅ Storage bucket access test passed');
    } catch (testError) {
      console.error('❌ Storage bucket access test failed:', testError);
      throw testError;
    }
    try {
      console.log(`💾 Saving wiki page: ${path}`);
      console.log(`💾 Content length: ${content.length}`);
      console.log(`💾 Title: ${title || 'No title provided'}`);
      
      // Create the content with frontmatter if title is provided
      let fileContent = content;
      if (title) {
        fileContent = `---
title: "${title}"
updated_at: "${new Date().toISOString()}"
---

${content}`;
      }

      console.log(`💾 Final content length: ${fileContent.length}`);
      console.log(`💾 Bucket name: ${this.BUCKET_NAME}`);

      // Convert content to Blob
      const blob = new Blob([fileContent], { type: 'text/markdown' });
      console.log(`💾 Blob size: ${blob.size}`);
      
      // Upload to Supabase storage
      console.log(`💾 Attempting to upload to path: ${path}`);
      console.log(`💾 Bucket: ${this.BUCKET_NAME}`);
      console.log(`💾 Blob size: ${blob.size} bytes`);
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: 'text/markdown',
          upsert: true
        });

      if (error) {
        console.error('❌ Failed to save wiki page:', error);
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name,
          statusCode: (error as any).statusCode,
          statusMessage: (error as any).statusMessage
        });
        
        // Check if it's a permissions error
        if (error.message.includes('policy') || error.message.includes('permission')) {
          console.error('❌ This appears to be a permissions issue. Please check:');
          console.error('❌ 1. RLS policies are properly set up');
          console.error('❌ 2. User is authenticated');
          console.error('❌ 3. Storage bucket exists and is accessible');
        }
        
        throw new Error(`Failed to save wiki page: ${error.message}`);
      }

      console.log(`✅ Successfully saved wiki page: ${path}`);
    } catch (error) {
      console.error('❌ Error saving wiki page:', error);
      throw error;
    }
  }

  /**
   * Save a wiki page to database using the new function
   */
  static async savePageToDatabase(
    pageSlug: string,
    pageTitle: string,
    pageContent: string,
    pageStatus: string = 'published',
    pageCategoryId?: string,
    pageDescription?: string,
    pageTags?: string[]
  ): Promise<any> {
    try {
      console.log(`💾 Saving wiki page to database: ${pageSlug}`);
      
      const { data, error } = await (supabase as any).rpc('save_wiki_page_to_db', {
        page_slug: pageSlug,
        page_title: pageTitle,
        page_content: pageContent,
        page_status: pageStatus,
        page_category_id: pageCategoryId,
        page_description: pageDescription,
        page_tags: pageTags || []
      });

      if (error) {
        console.error('❌ Database save error:', error);
        throw new Error(`Failed to save page to database: ${error.message}`);
      }

      console.log('✅ Database save successful:', data);
      return data;
    } catch (error) {
      console.error('❌ Error saving page to database:', error);
      throw error;
    }
  }

  /**
   * Create a new wiki page
   */
  static async createPage(path: string, title: string, content: string, category?: string): Promise<void> {
    try {
      console.log(`📝 Creating new wiki page: ${path}`);
      
      // Create the content with frontmatter
      const fileContent = `---
title: "${title}"
category: "${category || ''}"
created_at: "${new Date().toISOString()}"
updated_at: "${new Date().toISOString()}"
---

${content}`;

      // Convert content to Blob
      const blob = new Blob([fileContent], { type: 'text/markdown' });
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, blob, {
          contentType: 'text/markdown',
          upsert: false // Don't overwrite existing files
        });

      if (error) {
        console.error('❌ Failed to create wiki page:', error);
        throw new Error(`Failed to create wiki page: ${error.message}`);
      }

      console.log(`✅ Successfully created wiki page: ${path}`);
    } catch (error) {
      console.error('❌ Error creating wiki page:', error);
      throw error;
    }
  }

  /**
   * Delete a wiki page
   */
  static async deletePage(path: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting wiki page: ${path}`);
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('❌ Failed to delete wiki page:', error);
        throw new Error(`Failed to delete wiki page: ${error.message}`);
      }

      console.log(`✅ Successfully deleted wiki page: ${path}`);
    } catch (error) {
      console.error('❌ Error deleting wiki page:', error);
      throw error;
    }
  }

  /**
   * Check if a user has permission to edit wiki pages
   */
  static async checkEditPermission(userId?: string): Promise<boolean> {
    // For now, we'll allow editing for authenticated users
    // In the future, this could check against a permissions table
    return !!userId;
  }

  /**
   * Fetch all towns from the database and create wiki pages
   */
  static async createTownsWikiPages(): Promise<void> {
    try {
      const { data: towns, error } = await supabase
        .from('towns')
        .select('*')
        .order('name');

      if (error) {
        console.error('Failed to fetch towns:', error);
        return;
      }

      if (!towns || towns.length === 0) {
        console.log('No towns found in database');
        return;
      }

      // Create Towns folder if it doesn't exist
      const townsFolderPath = `${this.BASE_PATH}/Towns`;
      
      // Create individual town pages
      for (const town of towns) {
        const townFileName = town.name.replace(/[^a-zA-Z0-9]/g, '_');
        const townPath = `${townsFolderPath}/${townFileName}.md`;
        
        const placeholderContent = this.generateTownPlaceholderContent(town);
        
        try {
          await this.savePage(townPath, placeholderContent, town.name);
          console.log(`Created wiki page for town: ${town.name}`);
        } catch (saveError) {
          console.error(`Failed to create wiki page for town ${town.name}:`, saveError);
        }
      }

      // Create Towns index page
      const townsIndexContent = this.generateTownsIndexContent(towns);
      const townsIndexPath = `${townsFolderPath}/README.md`;
      
      try {
        await this.savePage(townsIndexPath, townsIndexContent, 'Towns');
        console.log('Created Towns index page');
      } catch (saveError) {
        console.error('Failed to create Towns index page:', saveError);
      }

    } catch (error) {
      console.error('Failed to create towns wiki pages:', error);
    }
  }

  /**
   * Fetch all nations from the database and create wiki pages
   */
  static async createNationsWikiPages(): Promise<void> {
    try {
      const { data: nations, error } = await supabase
        .from('nations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Failed to fetch nations:', error);
        return;
      }

      if (!nations || nations.length === 0) {
        console.log('No nations found in database');
        return;
      }

      // Create Nations folder if it doesn't exist
      const nationsFolderPath = `${this.BASE_PATH}/Nations`;
      
      // Create individual nation pages
      for (const nation of nations) {
        const nationFileName = nation.name.replace(/[^a-zA-Z0-9]/g, '_');
        const nationPath = `${nationsFolderPath}/${nationFileName}.md`;
        
        const placeholderContent = this.generateNationPlaceholderContent(nation);
        
        try {
          await this.savePage(nationPath, placeholderContent, nation.name);
          console.log(`Created wiki page for nation: ${nation.name}`);
        } catch (saveError) {
          console.error(`Failed to create wiki page for nation ${nation.name}:`, saveError);
        }
      }

      // Create Nations index page
      const nationsIndexContent = this.generateNationsIndexContent(nations);
      const nationsIndexPath = `${nationsFolderPath}/README.md`;
      
      try {
        await this.savePage(nationsIndexPath, nationsIndexContent, 'Nations');
        console.log('Created Nations index page');
      } catch (saveError) {
        console.error('Failed to create Nations index page:', saveError);
      }

    } catch (error) {
      console.error('Failed to create nations wiki pages:', error);
    }
  }

  /**
   * Generate placeholder content for a town wiki page
   */
  private static generateTownPlaceholderContent(town: any): string {
    const balance = town.balance || town.balance === 0 ? `$${Number(town.balance).toLocaleString()}` : 'Unknown';
    const population = town.residents_count || town.population || 0;
    const mayor = town.mayor_name || town.mayor || 'Unknown';
    const nation = town.nation_name || 'Independent';
    const status = town.is_open ? 'Open' : 'Closed';
    const type = town.type || 'Town';
    const founded = town.created_at ? new Date(town.created_at).toLocaleDateString() : 'Unknown';
    const level = town.level || 1;
    const totalXp = town.total_xp || 0;

    return `---
title: "${town.name}"
updated_at: "${new Date().toISOString()}"
---

# ${town.name}

## Overview
**${town.name}** is a ${type} located in the world of Nordics.

## Quick Stats
- **Mayor:** ${mayor}
- **Population:** ${population} residents
- **Balance:** ${balance}
- **Nation:** ${nation}
- **Status:** ${status}
- **Type:** ${type}
- **Founded:** ${founded}
- **Level:** ${level}
- **Total XP:** ${totalXp.toLocaleString()}

## Location
- **World:** ${town.world_name || 'world'}
- **Coordinates:** X: ${town.location_x || 'Unknown'}, Z: ${town.location_z || 'Unknown'}
- **Spawn Point:** X: ${town.spawn_x || 'Unknown'}, Y: ${town.spawn_y || 'Unknown'}, Z: ${town.spawn_z || 'Unknown'}

## Town Information
<!-- Start writing your content here -->

### Description
[Add a description of the town here]

### History
[Add the town's history here]

### Notable Locations
[Add notable buildings, landmarks, or areas here]

### Economy
[Add information about the town's economy, shops, and trade here]

### Government
[Add information about the town's government structure here]

### Culture
[Add information about the town's culture, traditions, and community here]

## Town Board
${town.board || '[Town board message will appear here]'}

## Additional Information
- **Tag:** ${town.tag || 'None'}
- **Max Residents:** ${town.max_residents || 'Unlimited'}
- **Max Plots:** ${town.max_plots || 'Unlimited'}
- **Plot Price:** ${town.plot_price ? `$${Number(town.plot_price).toLocaleString()}` : 'Free'}
- **Taxes:** ${town.taxes ? `${Number(town.taxes)}%` : 'None'}
- **Plot Tax:** ${town.plot_tax ? `${Number(town.plot_tax)}%` : 'None'}
- **Shop Tax:** ${town.shop_tax ? `${Number(town.shop_tax)}%` : 'None'}
- **Embassy Tax:** ${town.embassy_tax ? `${Number(town.embassy_tax)}%` : 'None'}

---
*This page was automatically generated from the town database. Editors can modify this content as needed.*
`;
  }

  /**
   * Generate placeholder content for a nation wiki page
   */
  private static generateNationPlaceholderContent(nation: any): string {
    const balance = nation.balance || nation.balance === 0 ? `$${Number(nation.balance).toLocaleString()}` : 'Unknown';
    const population = nation.residents_count || nation.population || 0;
    const leader = nation.leader_name || nation.leader || 'Unknown';
    const capital = nation.capital_town_name || nation.capital || 'Unknown';
    const townsCount = nation.towns_count || 0;
    const allyCount = nation.ally_count || 0;
    const enemyCount = nation.enemy_count || 0;
    const founded = nation.created_at ? new Date(nation.created_at).toLocaleDateString() : 'Unknown';

    return `---
title: "${nation.name}"
updated_at: "${new Date().toISOString()}"
---

# ${nation.name}

## Overview
**${nation.name}** is a nation in the world of Nordics.

## Quick Stats
- **Leader:** ${leader}
- **Capital:** ${capital}
- **Population:** ${population} residents
- **Balance:** ${balance}
- **Towns:** ${townsCount} towns
- **Allies:** ${allyCount}
- **Enemies:** ${enemyCount}
- **Founded:** ${founded}
- **Type:** ${nation.type || 'Nation'}
- **Government:** ${nation.government || 'Unknown'}

## Nation Information
<!-- Start writing your content here -->

### Description
${nation.description || '[Add a description of the nation here]'}

### History
${nation.history || '[Add the nation\'s history here]'}

### Government
${nation.government ? `**Government Type:** ${nation.government}` : '[Add information about the government structure here]'}

### Capital
${capital !== 'Unknown' ? `**Capital:** ${capital}` : '[Add information about the capital here]'}

### Economy
[Add information about the nation's economy here]

### Military
[Add information about the nation's military and defense here]

### Diplomacy
[Add information about the nation's allies, enemies, and diplomatic relations here]

### Culture
[Add information about the nation's culture, traditions, and values here]

## Nation Board
${nation.board || '[Nation board message will appear here]'}

## Additional Information
- **Motto:** ${nation.motto || 'None'}
- **Tag:** ${nation.tag || 'None'}
- **Color:** ${nation.color || 'None'}
- **Daily Upkeep:** ${nation.daily_upkeep || 'Unknown'}
- **Max Towns:** ${nation.max_towns || 'Unlimited'}
- **Taxes:** ${nation.taxes ? `${Number(nation.taxes)}%` : 'None'}
- **Town Tax:** ${nation.town_tax ? `${Number(nation.town_tax)}%` : 'None'}
- **Activity Score:** ${nation.activity_score || 0}
- **Growth Rate:** ${nation.growth_rate ? `${Number(nation.growth_rate)}%` : '0%'}

## Specialties
${nation.specialties && nation.specialties.length > 0 ? nation.specialties.map((specialty: string) => `- ${specialty}`).join('\n') : '[Add nation specialties here]'}

---
*This page was automatically generated from the nation database. Editors can modify this content as needed.*
`;
  }

  /**
   * Generate index content for all towns
   */
  private static generateTownsIndexContent(towns: any[]): string {
    const independentTowns = towns.filter(town => !town.nation_name);
    const nationTowns = towns.filter(town => town.nation_name);
    
    const nations = [...new Set(nationTowns.map(town => town.nation_name))].sort();

    return `---
title: "Towns"
updated_at: "${new Date().toISOString()}"
---

# Towns of Nordics

This page lists all towns in the Nordics world, organized by nation.

## Independent Towns
${independentTowns.length > 0 ? independentTowns.map(town => `- [${town.name}](./${town.name.replace(/[^a-zA-Z0-9]/g, '_')}.md) - Mayor: ${town.mayor_name || town.mayor || 'Unknown'}, Population: ${town.residents_count || town.population || 0}`).join('\n') : 'No independent towns found.'}

## Towns by Nation
${nations.map(nation => {
  const nationTownsList = nationTowns.filter(town => town.nation_name === nation);
  const townsList = nationTownsList.map(town => 
    `- [${town.name}](./${town.name.replace(/[^a-zA-Z0-9]/g, '_')}.md) - Mayor: ${town.mayor_name || town.mayor || 'Unknown'}, Population: ${town.residents_count || town.population || 0}`
  ).join('\n');
  return `### ${nation}\n${townsList}`;
}).join('\n\n')}

## Statistics
- **Total Towns:** ${towns.length}
- **Independent Towns:** ${independentTowns.length}
- **Nation Towns:** ${nationTowns.length}
- **Total Population:** ${towns.reduce((sum, town) => sum + (town.residents_count || town.population || 0), 0).toLocaleString()}

---
*This page was automatically generated from the town database.*
`;
  }

  /**
   * Generate index content for all nations
   */
  private static generateNationsIndexContent(nations: any[]): string {
    return `---
title: "Nations"
updated_at: "${new Date().toISOString()}"
---

# Nations of Nordics

This page lists all nations in the Nordics world.

## All Nations
${nations.map(nation => `- [${nation.name}](./${nation.name.replace(/[^a-zA-Z0-9]/g, '_')}.md) - Leader: ${nation.leader_name || nation.leader || 'Unknown'}, Capital: ${nation.capital_town_name || nation.capital || 'Unknown'}, Population: ${nation.residents_count || nation.population || 0}`).join('\n')}

## Statistics
- **Total Nations:** ${nations.length}
- **Total Population:** ${nations.reduce((sum, nation) => sum + (nation.residents_count || nation.population || 0), 0).toLocaleString()}
- **Total Towns:** ${nations.reduce((sum, nation) => sum + (nation.towns_count || 0), 0)}

## Nation Types
${[...new Set(nations.map(nation => nation.type))].sort().map(type => `- **${type}:** ${nations.filter(nation => nation.type === type).length} nations`).join('\n')}

---
*This page was automatically generated from the nation database.*
`;
  }

  /**
   * Create initial Towns and Nations folders with placeholder content
   */
  static async createInitialWikiFolders(): Promise<void> {
    try {
      console.log('Creating initial Towns and Nations folders...');

      // Create Towns folder with initial content
      const townsFolderPath = `${this.BASE_PATH}/Towns`;
      const townsIndexContent = `---
title: "Towns"
updated_at: "${new Date().toISOString()}"
---

# Towns of Nordics

This page lists all towns in the Nordics world, organized by nation.

## Independent Towns
No independent towns found.

## Towns by Nation
No nations with towns found.

## Statistics
- **Total Towns:** 0
- **Independent Towns:** 0
- **Nation Towns:** 0
- **Total Population:** 0

---
*This page will be automatically updated when town data is available.*
`;

      // Create Nations folder with initial content
      const nationsFolderPath = `${this.BASE_PATH}/Nations`;
      const nationsIndexContent = `---
title: "Nations"
updated_at: "${new Date().toISOString()}"
---

# Nations of Nordics

This page lists all nations in the Nordics world.

## All Nations
No nations found.

## Statistics
- **Total Nations:** 0
- **Total Population:** 0
- **Total Towns:** 0

## Nation Types
No nation types found.

---
*This page will be automatically updated when nation data is available.*
`;

      // Create a sample town page
      const sampleTownContent = `---
title: "Sample Town"
updated_at: "${new Date().toISOString()}"
---

# Sample Town

## Overview
**Sample Town** is a town located in the world of Nordics.

## Quick Stats
- **Mayor:** Unknown
- **Population:** 0 residents
- **Balance:** Unknown
- **Nation:** Independent
- **Status:** Unknown
- **Type:** Town
- **Founded:** Unknown
- **Level:** 1
- **Total XP:** 0

## Location
- **World:** world
- **Coordinates:** X: Unknown, Z: Unknown
- **Spawn Point:** X: Unknown, Y: Unknown, Z: Unknown

## Town Information
<!-- Start writing your content here -->

### Description
[Add a description of the town here]

### History
[Add the town's history here]

### Notable Locations
[Add notable buildings, landmarks, or areas here]

### Economy
[Add information about the town's economy, shops, and trade here]

### Government
[Add information about the town's government structure here]

### Culture
[Add information about the town's culture, traditions, and community here]

## Town Board
[Town board message will appear here]

## Additional Information
- **Tag:** None
- **Max Residents:** Unlimited
- **Max Plots:** Unlimited
- **Plot Price:** Free
- **Taxes:** None
- **Plot Tax:** None
- **Shop Tax:** None
- **Embassy Tax:** None

---
*This is a sample page. Replace with actual town data when available.*
`;

      // Create a sample nation page
      const sampleNationContent = `---
title: "Sample Nation"
updated_at: "${new Date().toISOString()}"
---

# Sample Nation

## Overview
**Sample Nation** is a nation in the world of Nordics.

## Quick Stats
- **Leader:** Unknown
- **Capital:** Unknown
- **Population:** 0 residents
- **Balance:** Unknown
- **Towns:** 0 towns
- **Allies:** 0
- **Enemies:** 0
- **Founded:** Unknown
- **Type:** Nation
- **Government:** Unknown

## Nation Information
<!-- Start writing your content here -->

### Description
[Add a description of the nation here]

### History
[Add the nation's history here]

### Government
[Add information about the government structure here]

### Capital
[Add information about the capital here]

### Economy
[Add information about the nation's economy here]

### Military
[Add information about the nation's military and defense here]

### Diplomacy
[Add information about the nation's allies, enemies, and diplomatic relations here]

### Culture
[Add information about the nation's culture, traditions, and values here]

## Nation Board
[Nation board message will appear here]

## Additional Information
- **Motto:** None
- **Tag:** None
- **Color:** None
- **Daily Upkeep:** Unknown
- **Max Towns:** Unlimited
- **Taxes:** None
- **Town Tax:** None
- **Activity Score:** 0
- **Growth Rate:** 0%

## Specialties
[Add nation specialties here]

---
*This is a sample page. Replace with actual nation data when available.*
`;

      // Save the initial pages
      try {
        await this.savePage(`${townsFolderPath}/README.md`, townsIndexContent, 'Towns');
        console.log('Created Towns index page');
        
        await this.savePage(`${nationsFolderPath}/README.md`, nationsIndexContent, 'Nations');
        console.log('Created Nations index page');
        
        await this.savePage(`${townsFolderPath}/Sample_Town.md`, sampleTownContent, 'Sample Town');
        console.log('Created sample town page');
        
        await this.savePage(`${nationsFolderPath}/Sample_Nation.md`, sampleNationContent, 'Sample Nation');
        console.log('Created sample nation page');
        
      } catch (saveError) {
        console.error('Failed to create initial wiki folders:', saveError);
      }

    } catch (error) {
      console.error('Failed to create initial wiki folders:', error);
    }
  }


}