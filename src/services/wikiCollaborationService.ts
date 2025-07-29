import { supabase } from '@/integrations/supabase/client';
import { 
  WikiComment, 
  WikiSuggestedEdit, 
  WikiEditSession, 
  WikiCollaborationNotification, 
  WikiPageSubscription,
  EditConflict 
} from '@/types/wiki';

export class WikiCollaborationService {
  // Comments Management
  async getComments(pageId: string): Promise<WikiComment[]> {
    const { data, error } = await supabase
      .from('wiki_comments')
      .select(`
        *,
        author:profiles!wiki_comments_author_id_fkey(full_name)
      `)
      .eq('page_id', pageId)
      .eq('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform and add replies
    const comments = data.map(comment => ({
      id: comment.id,
      pageId: comment.page_id,
      authorId: comment.author_id,
      authorName: comment.author?.full_name || 'Unknown',
      parentId: comment.parent_id,
      content: comment.content,
      isResolved: comment.is_resolved,
      isPinned: comment.is_pinned,
      isModerated: comment.is_moderated,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      replies: []
    }));

    // Get replies for each comment
    for (const comment of comments) {
      const { data: replies } = await supabase
        .from('wiki_comments')
        .select(`
          *,
          author:profiles!wiki_comments_author_id_fkey(full_name)
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      comment.replies = replies?.map(reply => ({
        id: reply.id,
        pageId: reply.page_id,
        authorId: reply.author_id,
        authorName: reply.author?.full_name || 'Unknown',
        parentId: reply.parent_id,
        content: reply.content,
        isResolved: reply.is_resolved,
        isPinned: reply.is_pinned,
        isModerated: reply.is_moderated,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at
      })) || [];
    }

    return comments;
  }

  async addComment(pageId: string, content: string, parentId?: string): Promise<WikiComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wiki_comments')
      .insert({
        page_id: pageId,
        author_id: user.id,
        parent_id: parentId,
        content
      })
      .select(`
        *,
        author:profiles!wiki_comments_author_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    // Notify page subscribers
    await this.notifyPageSubscribers(
      pageId,
      parentId ? 'comment_replied' : 'comment_added',
      user.id,
      parentId ? 'New reply to comment' : 'New comment added',
      parentId ? 'Someone replied to a comment on this page' : 'Someone added a new comment to this page'
    );

    return {
      id: data.id,
      pageId: data.page_id,
      authorId: data.author_id,
      authorName: data.author?.full_name || 'Unknown',
      parentId: data.parent_id,
      content: data.content,
      isResolved: data.is_resolved,
      isPinned: data.is_pinned,
      isModerated: data.is_moderated,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_comments')
      .update({ content })
      .eq('id', commentId);

    if (error) throw error;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  async resolveComment(commentId: string, resolved: boolean): Promise<void> {
    const { error } = await supabase
      .from('wiki_comments')
      .update({ is_resolved: resolved })
      .eq('id', commentId);

    if (error) throw error;
  }

  // Suggested Edits Management
  async getSuggestedEdits(pageId: string): Promise<WikiSuggestedEdit[]> {
    const { data, error } = await supabase
      .from('wiki_suggested_edits')
      .select(`
        *,
        author:profiles!wiki_suggested_edits_author_id_fkey(full_name),
        reviewer:profiles!wiki_suggested_edits_reviewed_by_fkey(full_name)
      `)
      .eq('page_id', pageId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(edit => ({
      id: edit.id,
      pageId: edit.page_id,
      authorId: edit.author_id,
      authorName: edit.author?.full_name || 'Unknown',
      title: edit.title,
      content: edit.content,
      description: edit.description,
      status: edit.status,
      reviewNotes: edit.review_notes,
      reviewedBy: edit.reviewed_by,
      reviewedAt: edit.reviewed_at,
      createdAt: edit.created_at,
      updatedAt: edit.updated_at
    }));
  }

  async submitSuggestedEdit(pageId: string, title: string, content: string, description?: string): Promise<WikiSuggestedEdit> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wiki_suggested_edits')
      .insert({
        page_id: pageId,
        author_id: user.id,
        title,
        content,
        description
      })
      .select(`
        *,
        author:profiles!wiki_suggested_edits_author_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    // Notify page subscribers
    await this.notifyPageSubscribers(
      pageId,
      'suggested_edit_submitted',
      user.id,
      'New suggested edit submitted',
      'Someone submitted a suggested edit for this page'
    );

    return {
      id: data.id,
      pageId: data.page_id,
      authorId: data.author_id,
      authorName: data.author?.full_name || 'Unknown',
      title: data.title,
      content: data.content,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async reviewSuggestedEdit(editId: string, status: 'approved' | 'rejected' | 'merged', reviewNotes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('wiki_suggested_edits')
      .update({
        status,
        review_notes: reviewNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', editId);

    if (error) throw error;

    // Get the suggested edit to notify the author
    const { data: edit } = await supabase
      .from('wiki_suggested_edits')
      .select('author_id, page_id')
      .eq('id', editId)
      .single();

    if (edit) {
      await this.createNotification(
        edit.author_id,
        'suggested_edit_reviewed',
        edit.page_id,
        user.id,
        'Your suggested edit was reviewed',
        `Your suggested edit was ${status}${reviewNotes ? `: ${reviewNotes}` : ''}`
      );
    }
  }

  // Edit Session Management
  async startEditSession(pageId: string): Promise<WikiEditSession> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const sessionToken = `session_${Date.now()}_${Math.random()}`;

    const { data, error } = await supabase
      .from('wiki_edit_sessions')
      .insert({
        page_id: pageId,
        user_id: user.id,
        session_token: sessionToken
      })
      .select(`
        *,
        user:profiles!wiki_edit_sessions_user_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      pageId: data.page_id,
      userId: data.user_id,
      userName: data.user?.full_name || 'Unknown',
      sessionToken: data.session_token,
      lastActivity: data.last_activity,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  }

  async updateEditSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_edit_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) throw error;
  }

  async endEditSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_edit_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) throw error;
  }

  async checkEditConflicts(pageId: string, userId: string): Promise<EditConflict[]> {
    const { data, error } = await supabase.rpc('check_edit_conflicts', {
      page_id_param: pageId,
      user_id_param: userId
    });

    if (error) throw error;

    return data.map((conflict: any) => ({
      conflictUserId: conflict.conflict_user_id,
      conflictUserName: conflict.conflict_user_name,
      lastActivity: conflict.last_activity
    }));
  }

  // Notifications Management
  async getCollaborationNotifications(): Promise<WikiCollaborationNotification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wiki_collaboration_notifications')
      .select(`
        *,
        page:wiki_pages!wiki_collaboration_notifications_page_id_fkey(title),
        actor:profiles!wiki_collaboration_notifications_actor_id_fkey(full_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data.map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      notificationType: notification.notification_type,
      pageId: notification.page_id,
      pageTitle: notification.page?.title,
      commentId: notification.comment_id,
      suggestedEditId: notification.suggested_edit_id,
      actorId: notification.actor_id,
      actorName: notification.actor?.full_name || 'Unknown',
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.is_read,
      createdAt: notification.created_at
    }));
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('wiki_collaboration_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllNotificationsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('wiki_collaboration_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  }

  async createNotification(
    userId: string,
    notificationType: string,
    pageId: string,
    actorId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase.rpc('create_wiki_collaboration_notification', {
      user_id_param: userId,
      notification_type_param: notificationType,
      page_id_param: pageId,
      actor_id_param: actorId,
      title_param: title,
      message_param: message,
      data_param: data
    });

    if (error) throw error;
  }

  async notifyPageSubscribers(
    pageId: string,
    notificationType: string,
    actorId: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const { error } = await supabase.rpc('notify_page_subscribers', {
      page_id_param: pageId,
      notification_type_param: notificationType,
      actor_id_param: actorId,
      title_param: title,
      message_param: message,
      data_param: data
    });

    if (error) throw error;
  }

  // Page Subscriptions Management
  async subscribeToPage(pageId: string, notificationTypes: string[] = ['page_edited', 'comment_added', 'suggested_edit_submitted']): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('wiki_page_subscriptions')
      .upsert({
        user_id: user.id,
        page_id: pageId,
        notification_types: notificationTypes
      });

    if (error) throw error;
  }

  async unsubscribeFromPage(pageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('wiki_page_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('page_id', pageId);

    if (error) throw error;
  }

  async getPageSubscription(pageId: string): Promise<WikiPageSubscription | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wiki_page_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('page_id', pageId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      pageId: data.page_id,
      notificationTypes: data.notification_types,
      createdAt: data.created_at
    };
  }

  // Utility methods
  async getCommentCount(pageId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wiki_comments')
      .select('*', { count: 'exact', head: true })
      .eq('page_id', pageId);

    if (error) throw error;
    return count || 0;
  }

  async getSuggestedEditCount(pageId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wiki_suggested_edits')
      .select('*', { count: 'exact', head: true })
      .eq('page_id', pageId)
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  }

  async getUnreadNotificationCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('wiki_collaboration_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }
}

export const wikiCollaborationService = new WikiCollaborationService(); 