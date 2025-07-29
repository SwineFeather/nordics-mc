export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'review';
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  order: number;
  githubPath?: string; // Store the original GitHub file path
  // New hierarchical page support
  parentPageId?: string;
  depth?: number;
  children?: WikiPage[];
  // New customization options
  icon?: string;
  color?: string;
  isExpanded?: boolean;
  // New metadata
  description?: string;
  tags?: string[];
  lastEditedBy?: string;
  lastEditedAt?: string;
  // Collaboration features
  allowComments?: boolean;
  allowEditing?: boolean;
  requireApproval?: boolean;
  commentCount?: number;
  suggestedEditCount?: number;
  // Subcategory support
  isSubcategory?: boolean;
  subcategoryPages?: WikiPage[];
}

export interface WikiCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  parent_id?: string;
  depth?: number;
  children?: WikiCategory[];
  pages: WikiPage[];
  // New customization options
  icon?: string;
  color?: string;
  isExpanded?: boolean;
  // New metadata
  lastEditedBy?: string;
  lastEditedAt?: string;
  pageCount?: number;
  subcategoryCount?: number;
}

export interface WikiSummary {
  categories: WikiCategory[];
  lastUpdated: string;
}

export type UserRole = 'admin' | 'moderator' | 'editor' | 'member';

export interface WikiPermissions {
  canRead: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canPublish: boolean;
  canManageStructure: boolean;
  canManageUsers: boolean;
  canModifyTheme: boolean;
}

// New types for drag and drop operations
export interface DragItem {
  id: string;
  type: 'category' | 'page';
  categoryId?: string;
  parentId?: string;
  depth?: number;
  sourceIndex?: number;
}

export interface DropResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  };
  draggableId: string;
  type: 'category' | 'page';
}

// New types for icons and colors
export interface WikiIcon {
  name: string;
  icon: string;
  category: 'general' | 'navigation' | 'content' | 'media' | 'communication' | 'development' | 'gaming';
}

export interface WikiColor {
  name: string;
  value: string;
  category: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
}

// New types for settings
export interface WikiPageSettings {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  tags?: string[];
}

export interface WikiCategorySettings {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

// New types for hierarchical operations
export interface HierarchicalMove {
  itemId: string;
  itemType: 'category' | 'page';
  newParentId: string | null;
  newIndex: number;
  oldParentId?: string;
  oldIndex?: number;
}

export interface HierarchicalReorder {
  parentId: string | null;
  itemType: 'category' | 'page';
  startIndex: number;
  endIndex: number;
}

export const getRolePermissions = (role: UserRole): WikiPermissions => {
  switch (role) {
    case 'admin':
      return {
        canRead: true,
        canEdit: true,
        canCreate: true,
        canDelete: true,
        canPublish: true,
        canManageStructure: true,
        canManageUsers: true,
        canModifyTheme: true,
      };
    case 'moderator':
      return {
        canRead: true,
        canEdit: true,
        canCreate: true,
        canDelete: true,
        canPublish: true,
        canManageStructure: true,
        canManageUsers: false,
        canModifyTheme: false,
      };
    case 'editor':
      return {
        canRead: true,
        canEdit: true,
        canCreate: true,
        canDelete: false,
        canPublish: false,
        canManageStructure: false,
        canManageUsers: false,
        canModifyTheme: false,
      };
    case 'member':
    default:
      return {
        canRead: true,
        canEdit: false,
        canCreate: false,
        canDelete: false,
        canPublish: false,
        canManageStructure: false,
        canManageUsers: false,
        canModifyTheme: false,
      };
  }
};

// Collaboration Types
export interface WikiComment {
  id: string;
  page_id: string;
  author_id: string | null;
  parent_id: string | null;
  content: string;
  is_resolved: boolean;
  is_pinned: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields for UI
  author_name?: string;
  author_avatar?: string;
  replies?: WikiComment[];
  reply_count?: number;
}

export interface WikiSuggestedEdit {
  id: string;
  pageId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'merged';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WikiEditSession {
  id: string;
  pageId: string;
  userId: string;
  userName: string;
  sessionToken: string;
  lastActivity: string;
  isActive: boolean;
  createdAt: string;
}

export interface WikiCollaborationNotification {
  id: string;
  userId: string;
  notificationType: 'page_edited' | 'comment_added' | 'comment_replied' | 'suggested_edit_submitted' | 'suggested_edit_reviewed' | 'edit_conflict' | 'page_published' | 'page_review_requested';
  pageId?: string;
  pageTitle?: string;
  commentId?: string;
  suggestedEditId?: string;
  actorId?: string;
  actorName?: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface WikiPageSubscription {
  id: string;
  userId: string;
  pageId: string;
  notificationTypes: string[];
  createdAt: string;
}

export interface EditConflict {
  conflictUserId: string;
  conflictUserName: string;
  lastActivity: string;
}
