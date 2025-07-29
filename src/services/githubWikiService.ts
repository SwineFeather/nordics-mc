
import { WikiCategory, WikiPage } from '@/types/wiki';
import { parseSummaryMd, generateSummaryMd } from '@/utils/summaryParser';
import { supabase } from '@/integrations/supabase/client';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'SwineFeather';
const REPO_NAME = 'Nordics';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

interface GitHubCommitResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

export class GitHubWikiService {
  private async getGitHubToken(): Promise<string> {
    console.log('🔑 Attempting to get GitHub token...');
    try {
      const { data, error } = await supabase.functions.invoke('get-github-token');
      if (error) {
        console.error('❌ Error getting GitHub token from edge function:', error);
        throw new Error(`Failed to get GitHub authentication token: ${error.message}`);
      }
      if (!data?.token) {
        console.error('❌ No token returned from edge function');
        throw new Error('No GitHub token received from authentication service');
      }
      console.log('✅ GitHub token retrieved successfully');
      return data.token;
    } catch (error) {
      console.error('❌ Exception getting GitHub token:', error);
      throw new Error('Failed to authenticate with GitHub. Please check your token configuration.');
    }
  }

  private async fetchFromGitHub(path: string, authenticated: boolean = true): Promise<any> {
    console.log(`🔍 Fetching from GitHub: ${path} (authenticated: ${authenticated})`);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Nordics-Wiki-App'
    };

    if (authenticated) {
      try {
        const token = await this.getGitHubToken();
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Added authentication header');
      } catch (error) {
        console.error('❌ Failed to get token for authenticated request:', error);
        throw error;
      }
    }

    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    console.log(`📡 Making request to: ${url}`);

    try {
      const response = await fetch(url, { headers });
      
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GitHub API error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('GitHub authentication failed. Please check your Personal Access Token.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check repository permissions and token scopes.');
        } else if (response.status === 404) {
          throw new Error(`Repository or file not found: ${path}. Please check if the repository exists and is accessible.`);
        } else if (response.status === 429) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Successfully fetched data from GitHub');
      return data;
    } catch (error) {
      console.error('❌ Network error fetching from GitHub:', error);
      throw error;
    }
  }

  private async updateFileOnGitHub(path: string, content: string, message: string, sha?: string): Promise<void> {
    console.log(`📝 Updating file on GitHub: ${path}`);
    
    try {
      const token = await this.getGitHubToken();
      
      const body: any = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        committer: {
          name: 'Nordics Wiki',
          email: 'wiki@nordics.dev'
        }
      };

      if (sha) {
        body.sha = sha;
        console.log('📋 Including existing file SHA for update');
      } else {
        console.log('📄 Creating new file (no SHA provided)');
      }

      const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
      console.log(`📡 PUT request to: ${url}`);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Nordics-Wiki-App'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ GitHub API error updating file:', errorData);
        throw new Error(`Failed to update ${path}: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Successfully updated ${path} on GitHub`);
    } catch (error) {
      console.error(`❌ Error updating ${path}:`, error);
      throw error;
    }
  }

  private async getFileSha(path: string): Promise<string | null> {
    console.log(`🔍 Getting SHA for file: ${path}`);
    try {
      const file = await this.fetchFromGitHub(path, true);
      console.log(`✅ Found SHA for ${path}: ${file.sha}`);
      return file.sha;
    } catch (error) {
      console.log(`ℹ️ File ${path} doesn't exist, will create new`);
      return null;
    }
  }

  private decodeBase64Content(content: string): string {
    try {
      return atob(content.replace(/\n/g, ''));
    } catch (error) {
      console.error('❌ Error decoding base64 content:', error);
      throw new Error('Failed to decode file content from GitHub');
    }
  }

  async checkRepoAccess(): Promise<boolean> {
    console.log('🔍 Checking repository access...');
    try {
      await this.fetchFromGitHub('', true);
      console.log('✅ Repository access confirmed');
      return true;
    } catch (error) {
      console.error('❌ Repository access check failed:', error);
      return false;
    }
  }

  async fetchSummaryMd(): Promise<string> {
    console.log('📖 Fetching SUMMARY.md...');
    try {
      const file = await this.fetchFromGitHub('SUMMARY.md', true);
      const content = this.decodeBase64Content(file.content);
      console.log('✅ SUMMARY.md fetched successfully');
      return content;
    } catch (error) {
      console.error('❌ Error fetching SUMMARY.md:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('SUMMARY.md not found in repository. Please create this file first or check if the repository structure is correct.');
      }
      throw error;
    }
  }

  async fetchMarkdownFile(path: string): Promise<string> {
    console.log(`📄 Fetching markdown file: ${path}`);
    try {
      // Handle different path formats
      let filePath = path;
      if (!filePath.endsWith('.md')) {
        filePath += '.md';
      }
      
      const file = await this.fetchFromGitHub(filePath, true);
      const content = this.decodeBase64Content(file.content);
      console.log(`✅ Successfully fetched ${filePath}`);
      return content;
    } catch (error) {
      console.error(`❌ Error fetching ${path}:`, error);
      const fallbackContent = `# ${path}\n\nContent could not be loaded from GitHub.\nFile path: ${path}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.log(`⚠️ Using fallback content for ${path}`);
      return fallbackContent;
    }
  }

  async syncFromGitHub(): Promise<WikiCategory[]> {
    console.log('🔄 Starting GitHub sync...');
    
    try {
      // First check repository access
      console.log('1️⃣ Checking repository access...');
      const hasAccess = await this.checkRepoAccess();
      if (!hasAccess) {
        throw new Error('Cannot access repository. Please check if the repository exists and your token has the correct permissions.');
      }

      // Fetch SUMMARY.md
      console.log('2️⃣ Fetching SUMMARY.md...');
      const summaryContent = await this.fetchSummaryMd();
      
      // Parse categories
      console.log('3️⃣ Parsing SUMMARY.md...');
      const summaryNodes = parseSummaryMd(summaryContent);
      console.log(`📚 Found ${summaryNodes.length} categories`);

      // Convert SummaryTreeNode[] to WikiCategory[]
      const categories: WikiCategory[] = [];
      
      for (const node of summaryNodes) {
        if (node.type === 'category') {
          const category: WikiCategory = {
            id: node.id,
            title: node.title,
            slug: node.slug,
            description: node.description,
            order: node.order,
            children: [],
            pages: []
          };
          
          // Process children (pages and subcategories)
          for (const child of node.children) {
            if (child.type === 'page') {
              category.pages.push({
                id: child.id,
                title: child.title,
                slug: child.slug,
                content: '', // Will be filled below
                status: 'published',
                authorId: 'system',
                authorName: 'System',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                category: category.id,
                order: child.order,
                githubPath: child.githubPath
              });
            } else if (child.type === 'category') {
              // Handle subcategories if needed
              console.log(`⚠️ Subcategory found: ${child.title} - not yet implemented`);
            }
          }
          
          categories.push(category);
        }
      }

      // Fetch content for each page using GitHub paths
      console.log('4️⃣ Fetching page content...');
      let totalPages = 0;
      let successfulPages = 0;

      for (const category of categories) {
        console.log(`📂 Processing category: ${category.title} (${category.pages.length} pages)`);
        
        for (const page of category.pages) {
          totalPages++;
          try {
            // Use the GitHub path if available, otherwise use slug
            const filePath = page.githubPath || `${page.slug}.md`;
            const content = await this.fetchMarkdownFile(filePath);
            page.content = content;
            successfulPages++;
            console.log(`✅ Loaded content for: ${page.title} from ${filePath}`);
          } catch (error) {
            console.error(`⚠️ Failed to fetch content for ${page.slug}:`, error);
            page.content = `# ${page.title}\n\nContent could not be loaded from GitHub.\nOriginal path: ${page.githubPath || 'unknown'}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
      }

      console.log(`✅ Sync completed! ${successfulPages}/${totalPages} pages loaded successfully`);
      return categories;
      
    } catch (error) {
      console.error('❌ GitHub sync failed:', error);
      throw error;
    }
  }

  async pushToGitHub(categories: WikiCategory[], commitMessage: string = 'Update wiki content'): Promise<void> {
    console.log('📤 Starting GitHub push...');
    
    try {
      // Check repository access first
      console.log('1️⃣ Verifying repository access...');
      const hasAccess = await this.checkRepoAccess();
      if (!hasAccess) {
        throw new Error('Cannot access repository for push. Please check your permissions.');
      }

      // Generate and push SUMMARY.md
      console.log('2️⃣ Updating SUMMARY.md...');
      // Convert WikiCategory[] to SummaryTreeNode[] for the summary generator
      const summaryNodes = categories.map(cat => ({
        id: cat.id,
        type: 'category' as const,
        title: cat.title,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        level: 2,
        children: cat.pages.map(page => ({
          id: page.id,
          type: 'page' as const,
          title: page.title,
          slug: page.slug,
          order: page.order,
          level: 3,
          children: [],
          path: page.githubPath || `${page.slug}.md`,
          githubPath: page.githubPath || `${page.slug}.md`
        }))
      }));
      
      const summaryContent = generateSummaryMd(summaryNodes);
      const summarySha = await this.getFileSha('SUMMARY.md');
      await this.updateFileOnGitHub('SUMMARY.md', summaryContent, `${commitMessage} - Update SUMMARY.md`, summarySha || undefined);
      console.log('✅ SUMMARY.md updated');

      // Push each page file
      console.log('3️⃣ Updating page files...');
      let totalPages = 0;
      let successfulPages = 0;

      for (const category of categories) {
        console.log(`📂 Processing category: ${category.title}`);
        
        for (const page of category.pages) {
          totalPages++;
          const filename = `${page.slug}.md`;
          
          try {
            const pageSha = await this.getFileSha(filename);
            await this.updateFileOnGitHub(
              filename, 
              page.content, 
              `${commitMessage} - Update ${page.title}`,
              pageSha || undefined
            );
            successfulPages++;
            console.log(`✅ Updated ${filename}`);
          } catch (error) {
            console.error(`❌ Failed to update ${filename}:`, error);
            // Continue with other files even if one fails
          }
        }
      }

      console.log(`✅ Push completed! ${successfulPages}/${totalPages} files updated successfully`);
      
    } catch (error) {
      console.error('❌ GitHub push failed:', error);
      throw error;
    }
  }

  // CRUD Operations
  async createPage(pageData: Partial<WikiPage>): Promise<WikiPage> {
    console.log('📝 Creating new page...');
    
    try {
      // Validate required fields
      if (!pageData.title || !pageData.slug || !pageData.content) {
        throw new Error('Title, slug, and content are required');
      }

      // Create the page file on GitHub
      const filename = `${pageData.slug}.md`;
      await this.updateFileOnGitHub(
        filename,
        pageData.content,
        `Add new page: ${pageData.title}`
      );

      // Create the page object
      const newPage: WikiPage = {
        id: `page-${Date.now()}`,
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        status: 'published',
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: pageData.category || 'uncategorized',
        order: pageData.order || 0,
        githubPath: filename
      };

      console.log(`✅ Created page: ${newPage.title}`);
      return newPage;
    } catch (error) {
      console.error('❌ Failed to create page:', error);
      throw error;
    }
  }

  async updatePage(id: string, updates: Partial<WikiPage>): Promise<WikiPage> {
    console.log(`📝 Updating page: ${id}`);
    
    try {
      // For now, we'll need the current page data to update it
      // In a real implementation, you'd fetch the current page first
      const filename = `${updates.slug || id}.md`;
      
      if (updates.content) {
        await this.updateFileOnGitHub(
          filename,
          updates.content,
          `Update page: ${updates.title || id}`
        );
      }

      // Return updated page (in real implementation, you'd merge with existing data)
      const updatedPage: WikiPage = {
        id,
        title: updates.title || 'Unknown',
        slug: updates.slug || id,
        content: updates.content || '',
        status: 'published',
        authorId: 'system',
        authorName: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: updates.category || 'uncategorized',
        order: updates.order || 0,
        githubPath: filename
      };

      console.log(`✅ Updated page: ${updatedPage.title}`);
      return updatedPage;
    } catch (error) {
      console.error('❌ Failed to update page:', error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<void> {
    console.log(`🗑️ Deleting page: ${id}`);
    
    try {
      // Note: GitHub API doesn't support file deletion through the same endpoint
      // This would require using the GitHub API's delete endpoint
      // For now, we'll throw an error indicating this isn't implemented
      throw new Error('Delete page not implemented yet - requires GitHub API delete endpoint');
    } catch (error) {
      console.error('❌ Failed to delete page:', error);
      throw error;
    }
  }

  async createCategory(categoryData: Partial<WikiCategory>): Promise<WikiCategory> {
    console.log('📁 Creating new category...');
    
    try {
      // Validate required fields
      if (!categoryData.title || !categoryData.slug) {
        throw new Error('Title and slug are required');
      }

      // Create the category object
      const newCategory: WikiCategory = {
        id: `category-${Date.now()}`,
        title: categoryData.title,
        slug: categoryData.slug,
        description: categoryData.description,
        order: categoryData.order || 0,
        children: [],
        pages: []
      };

      console.log(`✅ Created category: ${newCategory.title}`);
      return newCategory;
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<WikiCategory>): Promise<WikiCategory> {
    console.log(`📁 Updating category: ${id}`);
    
    try {
      // Return updated category (in real implementation, you'd merge with existing data)
      const updatedCategory: WikiCategory = {
        id,
        title: updates.title || 'Unknown',
        slug: updates.slug || id,
        description: updates.description,
        order: updates.order || 0,
        children: updates.children || [],
        pages: updates.pages || []
      };

      console.log(`✅ Updated category: ${updatedCategory.title}`);
      return updatedCategory;
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    console.log(`🗑️ Deleting category: ${id}`);
    
    try {
      // Note: This would require updating the SUMMARY.md file
      // For now, we'll throw an error indicating this isn't implemented
      throw new Error('Delete category not implemented yet - requires SUMMARY.md update');
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      throw error;
    }
  }
}

export const githubWikiService = new GitHubWikiService();
