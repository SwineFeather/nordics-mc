
import { WikiCategory, WikiPage } from '@/types/wiki';

// New: General tree node type for summary
export interface SummaryTreeNode {
  id: string;
  type: 'category' | 'page';
  title: string;
  slug: string;
  description?: string;
  content?: string; // Add content property for pages
  order: number;
  level: number;
  path?: string;
  children: SummaryTreeNode[];
  parentId?: string;
  githubPath?: string;
}

// New parser for arbitrary depth and sub-pages with proper indentation support
export const parseSummaryMd = (content: string): SummaryTreeNode[] => {
  const lines = content.split('\n');
  const root: SummaryTreeNode = {
    id: generateId(),
    type: 'category',
    title: 'root',
    slug: 'root',
    order: 0,
    level: 1,
    children: []
  };
  const stack: SummaryTreeNode[] = [root];
  let orderCounter: number[] = [0];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('# ')) continue;

    // Calculate indentation level (number of spaces before the asterisk)
    const indentationMatch = line.match(/^(\s*)\*/);
    const indentationLevel = indentationMatch ? Math.floor(indentationMatch[1].length / 2) : 0;

    // Heading (##, ###, ####, etc.)
    const headingMatch = trimmed.match(/^(#+)\s+(.+)/);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const title = headingMatch[2];
      const level = hashes.length;
      // Only treat headings of level >= 2 as nodes
      if (level >= 2) {
        // Pop stack to the parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
          orderCounter.pop();
        }
        const node: SummaryTreeNode = {
          id: generateId(),
          type: 'category',
          title,
          slug: generateSlug(title),
          order: orderCounter[orderCounter.length - 1]++,
          level,
          children: [],
          parentId: stack[stack.length - 1]?.id
        };
        stack[stack.length - 1].children.push(node);
        stack.push(node);
        orderCounter.push(0);
      }
      continue;
    }

    // Page (* [Title](path)) with indentation support
    const pageMatch = trimmed.match(/^\* \[(.+?)\]\((.+?)\)/);
    if (pageMatch) {
      const title = pageMatch[1];
      const path = pageMatch[2];
      const slug = extractSlugFromPath(path);
      
      // Pop stack to the correct level based on indentation
      while (stack.length > 1 && stack[stack.length - 1].level > indentationLevel) {
        stack.pop();
        orderCounter.pop();
      }
      
      // Parent is the last node on the stack
      const parent = stack[stack.length - 1];
      const node: SummaryTreeNode = {
        id: generateId(),
        type: 'page',
        title,
        slug,
        order: orderCounter[orderCounter.length - 1]++,
        level: indentationLevel,
        path,
        children: [],
        parentId: parent.id,
        githubPath: path
      };
      parent.children.push(node);
      
      // Add this page to the stack so its children can be added to it
      stack.push(node);
      orderCounter.push(0);
      continue;
    }

    // Description (any non-heading, non-page line)
    if (stack.length > 1) {
      const parent = stack[stack.length - 1];
      if (!parent.description) parent.description = trimmed;
      else parent.description += '\n' + trimmed;
    }
  }

  // Return the children of the root node (top-level categories)
  return root.children;
};

function extractSlugFromPath(path: string): string {
  // Handle README.md files
  if (path.endsWith('README.md')) {
    const parts = path.split('/');
    return parts[parts.length - 2] || 'readme';
  }
  
  // Extract filename without extension
  const filename = path.split('/').pop() || path;
  let slug = filename.replace(/\.md$/, '');
  
  // Handle special characters properly
  slug = slug
    .toLowerCase()
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ü/g, 'u')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/ë/g, 'e')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ô/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/û/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    // Remove other special characters but keep hyphens
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
  return slug;
}

export const generateSummaryMd = (nodes: SummaryTreeNode[]): string => {
  let content = '# Summary\n\n';
  
  const renderNode = (node: SummaryTreeNode, depth: number = 0): string => {
    const indent = '  '.repeat(depth);
    let result = '';
    
    if (node.type === 'category') {
      // Add category header
      const hashes = '#'.repeat(node.level);
      result += `${indent}${hashes} ${node.title}\n\n`;
      
      // Add description if present
      if (node.description) {
        result += `${indent}${node.description}\n\n`;
      }
      
      // Add children
      if (node.children && node.children.length > 0) {
        node.children
          .sort((a, b) => a.order - b.order)
          .forEach(child => {
            result += renderNode(child, depth + (child.type === 'page' ? 0 : 1));
          });
      }
    } else if (node.type === 'page') {
      // Add page link with proper indentation
      result += `${indent}* [${node.title}](${node.githubPath || node.path || `${node.slug}.md`})\n`;
      
      // Add children (sub-pages) with increased indentation
      if (node.children && node.children.length > 0) {
        node.children
          .sort((a, b) => a.order - b.order)
          .forEach(child => {
            result += renderNode(child, depth + 1);
          });
      }
    }
    
    return result;
  };
  
  // Sort nodes by order and render each
  nodes
    .sort((a, b) => a.order - b.order)
    .forEach(node => {
      content += renderNode(node);
    });

  return content;
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    // Handle special characters properly
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ü/g, 'u')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/ë/g, 'e')
    .replace(/à/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ô/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/û/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    // Remove other special characters but keep spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Utility: Convert SummaryTreeNode[] to WikiCategory[]
export function summaryTreeToWikiCategories(nodes: SummaryTreeNode[]): WikiCategory[] {
  return nodes.filter(n => n.type === 'category').map((catNode, i) => treeNodeToCategory(catNode, i));
}

function treeNodeToCategory(node: SummaryTreeNode, order: number): WikiCategory {
  // Get all pages from this category and its subcategories
  const allPages: WikiPage[] = [];
  
  // Recursively collect all pages from this category tree
  const collectPages = (categoryNode: SummaryTreeNode, parentCategoryId: string) => {
    // Add pages from this category
    categoryNode.children
      .filter(n => n.type === 'page')
      .forEach((pageNode, i) => {
        allPages.push(treeNodeToPage(pageNode, i, parentCategoryId, categoryNode.level + 1));
      });
    
    // Recursively process subcategories
    categoryNode.children
      .filter(n => n.type === 'category')
      .forEach((subCatNode, i) => {
        collectPages(subCatNode, parentCategoryId);
      });
  };
  
  collectPages(node, node.id);
  
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    description: node.description,
    order,
    parent_id: node.parentId,
    depth: node.level,
    icon: undefined,
    color: undefined,
    isExpanded: false,
    children: node.children.filter(n => n.type === 'category').map((c, i) => treeNodeToCategory(c, i)),
    pages: allPages,
  };
}

function treeNodeToPage(node: SummaryTreeNode, order: number, categoryId: string, depth: number): WikiPage {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    content: node.content || '',
    status: 'published',
    authorId: '',
    authorName: '',
    createdAt: '',
    updatedAt: '',
    category: categoryId,
    order,
    githubPath: node.githubPath,
    parentPageId: node.parentId,
    depth,
    children: node.children.filter(n => n.type === 'page').map((c, i) => treeNodeToPage(c, i, categoryId, depth + 1)),
    icon: undefined,
    color: undefined,
    isExpanded: false,
    description: node.description,
    tags: [],
    lastEditedBy: '',
    lastEditedAt: '',
    allowComments: true,
    allowEditing: true,
    requireApproval: false,
    commentCount: 0,
    suggestedEditCount: 0,
    isSubcategory: false,
    subcategoryPages: [],
  };
}
