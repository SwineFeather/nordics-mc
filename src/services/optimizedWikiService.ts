import { supabase } from '@/integrations/supabase/client';
import { WikiCategory, WikiPage } from '@/types/wiki';

export interface WikiFileStructure {
  type: 'file' | 'folder';
  name: string;
  path: string;
  children?: WikiFileStructure[];
  isGroup?: boolean;
  isPage?: boolean;
}

export class OptimizedWikiService {
  private static readonly BUCKET_NAME = 'wiki';
  private static readonly BASE_PATH = 'Nordics';

  /**
   * Get only the file structure without loading content (fast)
   */
  static async getFileStructureOnly(): Promise<WikiFileStructure[]> {
    try {
      console.log('📖 Loading wiki structure only (fast)...');
      
      // Use a simplified approach to get file structure
      const structure = await this.getFileStructureViaPathDiscovery();
      
      // If no files found, try the original service as fallback
      if (structure.length === 0) {
        console.log('⚠️ No files found with optimized discovery, trying original service...');
        const { SupabaseWikiService } = await import('./supabaseWikiService');
        const originalStructure = await SupabaseWikiService.getFileStructure();
        console.log('✅ Original service found files:', originalStructure.length);
        return originalStructure;
      }
      
      console.log('✅ Structure loaded:', structure);
      return structure;
    } catch (error) {
      console.error('❌ Failed to load wiki structure:', error);
      
      // Try original service as fallback
      try {
        console.log('🔄 Trying original service as fallback...');
        const { SupabaseWikiService } = await import('./supabaseWikiService');
        const originalStructure = await SupabaseWikiService.getFileStructure();
        console.log('✅ Original service fallback successful:', originalStructure.length);
        return originalStructure;
      } catch (fallbackError) {
        console.error('❌ Original service fallback also failed:', fallbackError);
        throw error;
      }
    }
  }

  /**
   * Get file structure using comprehensive path discovery
   */
  private static async getFileStructureViaPathDiscovery(): Promise<WikiFileStructure[]> {
    console.log('🔍 Using comprehensive file discovery...');
    
    const discoveredFiles: WikiFileStructure[] = [];
    const discoveredFolders = new Set<string>();
    
    // Method 1: Try to list root directory first
    try {
      const { data: rootData, error: rootError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1000 });
      
      if (!rootError && rootData && rootData.length > 0) {
        console.log(`📁 Found ${rootData.length} items in root directory`);
        
        for (const item of rootData) {
          console.log(`📄 Root item: ${item.name} (metadata: ${!!item.metadata})`);
          
          if (item.metadata && item.name.endsWith('.md')) {
            // This is a file
            discoveredFiles.push({
              type: 'file',
              name: item.name,
              path: item.name,
              isPage: true
            });
            console.log(`✅ Found root file: ${item.name}`);
          } else if (!item.metadata) {
            // This is a folder
            discoveredFolders.add(item.name);
            console.log(`📂 Found root folder: ${item.name}`);
            
            // Explore this folder
            await this.exploreFolderRecursively(item.name, discoveredFiles, discoveredFolders);
          }
        }
      }
    } catch (error) {
      console.error('Error listing root directory:', error);
    }
    
    // Method 2: Try known directory paths
    const knownDirectories = [
      'Nordics',
      'Nordics/nations',
      'Nordics/towns',
      'Nordics/server-events'
    ];
    
    for (const dirPath of knownDirectories) {
      try {
        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .list(dirPath, { limit: 100 });
        
        if (!error && data && data.length > 0) {
          console.log(`📁 Found ${data.length} items in ${dirPath}`);
          discoveredFolders.add(dirPath);
          
          for (const item of data) {
            const itemPath = `${dirPath}/${item.name}`;
            
            if (item.metadata && item.name.endsWith('.md')) {
              discoveredFiles.push({
                type: 'file',
                name: item.name,
                path: itemPath,
                isPage: true
              });
              console.log(`✅ Found file: ${itemPath}`);
            } else if (!item.metadata) {
              discoveredFolders.add(itemPath);
              console.log(`📂 Found subfolder: ${itemPath}`);
              
              // Explore subfolder
              await this.exploreFolderRecursively(itemPath, discoveredFiles, discoveredFolders);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not list directory ${dirPath}:`, error);
      }
    }
    
    // Method 3: Try to download known files to confirm they exist
    const knownFiles = [
      'Nordics/README.md',
      'Nordics/nations/README.md',
      'Nordics/towns/README.md',
      'Nordics/nations/constellation.md',
      'Nordics/towns/garvia/README.md',
      'Nordics/towns/sogndalsfjorden.md',
      'Nordics/towns/kingdom_of_albion/england/lundenwic.md',
      'Nordics/towns/northstar/README.md',
      'Nordics/server-events/terrain-incidents/northstar-forest-fire.md',
      'Nordics/server-events/terrain-incidents/the-sapmi-forest-fire.md'
    ];
    
    for (const filePath of knownFiles) {
      try {
        const { data, error } = await supabase.storage
          .from(this.BUCKET_NAME)
          .download(filePath);
        
        if (!error && data) {
          console.log(`✅ Confirmed file exists: ${filePath}`);
          
          // Add to discovered files if not already there
          const existingFile = discoveredFiles.find(f => f.path === filePath);
          if (!existingFile) {
            const fileName = filePath.split('/').pop() || '';
            discoveredFiles.push({
              type: 'file',
              name: fileName,
              path: filePath,
              isPage: true
            });
          }
          
          // Add parent folders
          const pathParts = filePath.split('/');
          for (let i = 0; i < pathParts.length - 1; i++) {
            const folderPath = pathParts.slice(0, i + 1).join('/');
            discoveredFolders.add(folderPath);
          }
        } else {
          console.log(`❌ File not found: ${filePath} (${error?.message || 'No data'})`);
        }
      } catch (error) {
        console.log(`❌ Error checking file ${filePath}:`, error);
      }
    }
    
    // Build folder structure
    const folders: WikiFileStructure[] = [];
    for (const folderPath of discoveredFolders) {
      const pathParts = folderPath.split('/');
      const folderName = pathParts[pathParts.length - 1];
      
      const folderStructure: WikiFileStructure = {
        type: 'folder',
        name: folderName,
        path: folderPath,
        children: [],
        isGroup: true,
        isPage: false
      };
      
      folders.push(folderStructure);
    }
    
    // Build hierarchical structure
    const structure = this.buildHierarchicalStructure(discoveredFiles, folders);
    
    // Method 4: Try alternative path variations
    if (discoveredFiles.length === 0) {
      console.log('🔄 No files found, trying alternative paths...');
      
      const alternativePaths = [
        'README.md',
        'the-world/README.md',
        'the-world/nations/README.md',
        'the-world/towns/README.md',
        'the-world/nations/constellation.md',
        'the-world/towns/garvia/README.md'
      ];
      
      for (const filePath of alternativePaths) {
        try {
          const { data, error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .download(filePath);
          
          if (!error && data) {
            console.log(`✅ Found file with alternative path: ${filePath}`);
            
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
        } catch (error) {
          console.log(`❌ Alternative path also failed: ${filePath}`);
        }
      }
    }
    
    console.log(`✅ Discovered ${discoveredFiles.length} files and ${folders.length} folders`);
    console.log('📁 Files:', discoveredFiles.map(f => f.path));
    console.log('📂 Folders:', Array.from(discoveredFolders));
    
    return structure;
  }

  /**
   * Recursively explore a folder and discover files and subfolders
   */
  private static async exploreFolderRecursively(
    folderPath: string, 
    discoveredFiles: WikiFileStructure[], 
    discoveredFolders: Set<string>
  ): Promise<void> {
    try {
      console.log(`🔍 Exploring folder: ${folderPath}`);
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderPath, { limit: 1000 });

      if (error) {
        console.error(`Error listing folder ${folderPath}:`, error);
        return;
      }

      if (!data || data.length === 0) {
        console.log(`📭 No items found in folder: ${folderPath}`);
        return;
      }

      console.log(`📁 Found ${data.length} items in folder: ${folderPath}`);

      for (const item of data) {
        const itemPath = `${folderPath}/${item.name}`;
        
        if (item.metadata && item.name.endsWith('.md')) {
          // This is a file
          discoveredFiles.push({
            type: 'file',
            name: item.name,
            path: itemPath,
            isPage: true
          });
          console.log(`✅ Found file: ${itemPath}`);
        } else if (!item.metadata) {
          // This is a folder
          discoveredFolders.add(itemPath);
          console.log(`📂 Found subfolder: ${itemPath}`);
          
          // Recursively explore this subfolder
          await this.exploreFolderRecursively(itemPath, discoveredFiles, discoveredFolders);
        }
      }
    } catch (error) {
      console.error(`❌ Error exploring folder ${folderPath}:`, error);
    }
  }

  /**
   * Build hierarchical structure from files and folders
   */
  private static buildHierarchicalStructure(files: WikiFileStructure[], folders: WikiFileStructure[]): WikiFileStructure[] {
    console.log('🔨 Building hierarchical structure...');
    console.log('📁 Input files:', files.length);
    console.log('📂 Input folders:', folders.length);
    
    const structure: WikiFileStructure[] = [];
    const folderMap = new Map<string, WikiFileStructure>();
    
    // Sort folders by depth (shallowest first) to ensure parents are processed before children
    folders.sort((a, b) => a.path.split('/').length - b.path.split('/').length);
    
    // Create folder map
    for (const folder of folders) {
      folderMap.set(folder.path, folder);
      console.log(`📁 Created folder: ${folder.name} at ${folder.path}`);
    }
    
    // Add files to their parent folders
    for (const file of files) {
      const pathParts = file.path.split('/');
      if (pathParts.length > 1) {
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(file);
          console.log(`📄 Added file ${file.name} to folder ${parentPath}`);
        } else {
          console.log(`⚠️ Parent folder not found for file ${file.path}: ${parentPath}`);
          // Add to root structure if parent not found
          structure.push(file);
        }
      } else {
        // Root level file
        structure.push(file);
        console.log(`📄 Added root file: ${file.name}`);
      }
    }
    
    // Add folders to structure (root folders first, then nested)
    for (const folder of folders) {
      const pathParts = folder.path.split('/');
      if (pathParts.length === 1) {
        // Root folder
        structure.push(folder);
        console.log(`📁 Added root folder: ${folder.name}`);
      } else {
        // Nested folder - add to parent
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = folderMap.get(parentPath);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(folder);
          console.log(`📁 Added nested folder ${folder.name} to ${parentPath}`);
        } else {
          console.log(`⚠️ Parent folder not found for nested folder ${folder.path}: ${parentPath}`);
          // Add to root structure if parent not found
          structure.push(folder);
        }
      }
    }
    
    // Sort structure
    const sortedStructure = structure.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('✅ Final structure:', sortedStructure.map(item => `${item.type}: ${item.name} (${item.children?.length || 0} children)`));
    
    return sortedStructure;
  }

  /**
   * Convert file structure to wiki categories with minimal page data (no content)
   */
  static async convertToWikiDataMinimal(structure: WikiFileStructure[]): Promise<WikiCategory[]> {
    console.log('🔄 Converting structure to wiki data (minimal)...');
    
    const categories: WikiCategory[] = [];
    
    // Recursively process all folders in the structure
    const processFolder = async (folder: WikiFileStructure): Promise<WikiCategory | null> => {
      const pages: WikiPage[] = [];
      
      if (folder.children) {
        for (const child of folder.children) {
          if (child.type === 'file' && child.name.endsWith('.md')) {
            const page = await this.convertFileToPageMinimal(child, folder.path);
            if (page) {
              pages.push(page);
            }
          } else if (child.type === 'folder') {
            // Recursively process subfolders
            const subCategory = await processFolder(child);
            if (subCategory) {
              // Add subcategory pages to this category
              pages.push(...(subCategory.pages || []));
            }
          }
        }
      }
      
      if (pages.length === 0) return null;
      
      return {
        id: folder.path,
        title: this.formatTitle(folder.name),
        slug: folder.name.toLowerCase().replace(/\s+/g, '-'),
        description: `Pages in ${folder.name}`,
        order: 0,
        pages: pages.sort((a, b) => a.order - b.order)
      };
    };
    
    // Process all root folders
    for (const item of structure) {
      if (item.type === 'folder') {
        const category = await processFolder(item);
        if (category) {
          categories.push(category);
          console.log(`📁 Created category: ${category.title} with ${category.pages?.length || 0} pages`);
        }
      }
    }
    
    console.log(`✅ Converted to ${categories.length} categories`);
    return categories;
  }



  /**
   * Convert file to page with minimal data (no content)
   */
  private static async convertFileToPageMinimal(file: WikiFileStructure, categoryId: string): Promise<WikiPage | null> {
    if (!file.name.endsWith('.md')) return null;
    
    const title = this.formatTitle(file.name.replace('.md', ''));
    
    // Create a unique slug based on the full path to avoid duplicates
    const pathParts = file.path.split('/');
    const uniqueSlug = pathParts.join('-').replace('.md', '');
    
    return {
      id: file.path,
      title: title,
      slug: uniqueSlug, // Use unique slug instead of just filename
      content: '', // No content loaded initially
      status: 'published' as const,
      authorId: 'system',
      authorName: 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: categoryId,
      order: 0,
      githubPath: file.path
    };
  }

  /**
   * Load page content on-demand
   */
  static async getPageContent(pageId: string): Promise<string | null> {
    try {
      console.log(`📄 Loading content for: ${pageId}`);
      
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(pageId);

      if (error) {
        console.error(`Error downloading file ${pageId}:`, error);
        return null;
      }

      if (!data) {
        console.error(`File ${pageId} not found`);
        return null;
      }

      const content = await data.text();
      console.log(`✅ Content loaded: ${pageId} (${content.length} characters)`);
      
      return content;
    } catch (error) {
      console.error(`❌ Failed to load content for ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Get page by path (with content)
   */
  static async getPageByPath(path: string): Promise<WikiPage | null> {
    try {
      const content = await this.getPageContent(path);
      if (!content) return null;
      
      const { frontmatter, markdown } = this.parseFrontmatter(content);
      const fileName = path.split('/').pop() || '';
      
      return {
        id: path,
        title: frontmatter?.title || this.formatTitle(fileName.replace('.md', '')),
        slug: fileName.replace('.md', ''),
        content: markdown,
        status: 'published' as const,
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: path.split('/').slice(0, -1).join('/'),
        order: 0,
        githubPath: path
      };
    } catch (error) {
      console.error('Failed to get page by path:', error);
      return null;
    }
  }

  /**
   * Search pages (only searches titles and metadata)
   */
  static async searchPages(query: string): Promise<WikiPage[]> {
    try {
      const structure = await this.getFileStructureOnly();
      const allPages: WikiPage[] = [];
      
      // Recursively find all pages
      const findPages = async (items: WikiFileStructure[]) => {
        for (const item of items) {
          if (item.type === 'file' && item.name.endsWith('.md')) {
            const page: WikiPage = {
              id: item.path,
              title: this.formatTitle(item.name.replace('.md', '')),
              slug: item.name.replace('.md', ''),
              content: '', // No content for search
              status: 'published' as const,
              authorId: 'system',
              authorName: 'System',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              category: item.path.split('/').slice(0, -1).join('/'),
              order: 0
            };
            
            allPages.push(page);
          } else if (item.type === 'folder' && item.children) {
            await findPages(item.children);
          }
        }
      };
      
      await findPages(structure);
      
      // Filter pages based on query (title only)
      const lowercaseQuery = query.toLowerCase();
      return allPages.filter(page => 
        page.title.toLowerCase().includes(lowercaseQuery) ||
        page.slug.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Failed to search pages:', error);
      return [];
    }
  }

  /**
   * Get file content (for compatibility)
   */
  static async getFileContent(path: string): Promise<string> {
    const content = await this.getPageContent(path);
    if (!content) {
      throw new Error(`File ${path} not found`);
    }
    return content;
  }

  /**
   * Parse frontmatter from markdown content
   */
  private static parseFrontmatter(content: string): { frontmatter?: any; markdown: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        const frontmatterStr = match[1];
        const markdown = match[2];
        
        // Simple YAML parsing (basic)
        const frontmatter: any = {};
        frontmatterStr.split('\n').forEach(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            frontmatter[key] = value;
          }
        });
        
        return { frontmatter, markdown };
      } catch (error) {
        console.error('Failed to parse frontmatter:', error);
      }
    }
    
    return { markdown: content };
  }

  /**
   * Format title from filename
   */
  private static formatTitle(name: string): string {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }
} 