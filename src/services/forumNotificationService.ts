import { supabase } from '@/integrations/supabase/client';

export interface ForumNotification {
  id: string;
  user_id: string;
  notification_type: 'reply' | 'mention' | 'reaction' | 'quote';
  post_id: string;
  reply_id?: string;
  author_id: string;
  title: string;
  message: string;
  read_at?: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  post?: {
    id: string;
    title: string;
    category_id: string;
  };
}

export class ForumNotificationService {
  private static instance: ForumNotificationService;
  private realtimeSubscription: any = null;

  static getInstance(): ForumNotificationService {
    if (!ForumNotificationService.instance) {
      ForumNotificationService.instance = new ForumNotificationService();
    }
    return ForumNotificationService.instance;
  }

  // Create notification for reply
  async createReplyNotification(
    postId: string,
    replyId: string,
    postAuthorId: string,
    replyAuthorId: string,
    replyContent: string
  ) {
    try {
      // Get post details
      const { data: post } = await supabase
        .from('forum_posts')
        .select('title, category_id')
        .eq('id', postId)
        .single();

      // Get reply author details
      const { data: author } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', replyAuthorId)
        .single();

      if (!post || !author) return;

      const title = `New reply to your post`;
      const message = `${author.full_name || author.email} replied to your post "${post.title}"`;

      // Create forum notification
      const { error } = await supabase
        .from('forum_notifications' as any)
        .insert({
          user_id: postAuthorId,
          notification_type: 'reply',
          post_id: postId,
          reply_id: replyId,
          author_id: replyAuthorId,
          title,
          message,
          priority: 'medium'
        });

      if (error) throw error;

      // Also create main notification
      const { error: mainError } = await supabase
        .from('user_notifications' as any)
        .insert({
          user_id: postAuthorId,
          notification_type: 'forum_reply',
          title,
          message,
          data: { postId, replyId, categoryId: post.category_id },
          priority: 'medium',
          sent_at: new Date().toISOString()
        });

      if (mainError) {
        console.error('Error creating main notification:', mainError);
      } else {
        console.log('Main notification created successfully');
      }
    } catch (error) {
      console.error('Error creating reply notification:', error);
    }
  }

  // Create notification for mention
  async createMentionNotification(
    postId: string,
    mentionedUserId: string,
    authorId: string,
    content: string
  ) {
    try {
      // Get author details
      const { data: author } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', authorId)
        .single();

      if (!author) return;

      const title = `You were mentioned`;
      const message = `${author.full_name || author.email} mentioned you in a post`;

      // Create forum notification
      const { error } = await supabase
        .from('forum_notifications' as any)
        .insert({
          user_id: mentionedUserId,
          notification_type: 'mention',
          post_id: postId,
          author_id: authorId,
          title,
          message,
          priority: 'high'
        });

      if (error) throw error;

      // Also create main notification
      const { error: mainError } = await supabase
        .from('user_notifications' as any)
        .insert({
          user_id: mentionedUserId,
          notification_type: 'forum_mention',
          title,
          message,
          data: { postId },
          priority: 'high',
          sent_at: new Date().toISOString()
        });

      if (mainError) {
        console.error('Error creating main notification:', mainError);
      } else {
        console.log('Main mention notification created successfully');
      }
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  }

  // Create notification for reaction
  async createReactionNotification(
    postId: string,
    postAuthorId: string,
    reactorId: string,
    emoji: string
  ) {
    try {
      // Get post details
      const { data: post } = await supabase
        .from('forum_posts')
        .select('title, category_id')
        .eq('id', postId)
        .single();

      // Get reactor details
      const { data: author } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', reactorId)
        .single();

      if (!post || !author) return;
      if (postAuthorId === reactorId) return; // Don't notify self

      const title = `New reaction to your post`;
      const message = `${author.full_name || author.email} reacted to your post "${post.title}" with ${emoji}`;

      // Create forum notification
      const { error } = await supabase
        .from('forum_notifications' as any)
        .insert({
          user_id: postAuthorId,
          notification_type: 'reaction',
          post_id: postId,
          author_id: reactorId,
          title,
          message,
          priority: 'low'
        });

      if (error) throw error;

      // Also create main notification
      const { error: mainError } = await supabase
        .from('user_notifications' as any)
        .insert({
          user_id: postAuthorId,
          notification_type: 'forum_reaction',
          title,
          message,
          data: { postId, emoji, categoryId: post.category_id },
          priority: 'low',
          sent_at: new Date().toISOString()
        });

      if (mainError) {
        console.error('Error creating main notification:', mainError);
      } else {
        console.log('Main reaction notification created successfully');
      }
    } catch (error) {
      console.error('Error creating reaction notification:', error);
    }
  }

  // Extract mentions from content (@username)
  extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  // Get user ID by username
  async getUserIdByUsername(username: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('minecraft_username', username)
        .single();

      if (error) return null;
      return data?.id || null;
    } catch (error) {
      return null;
    }
  }

  // Process mentions in content
  async processMentions(content: string, postId: string, authorId: string) {
    const mentions = this.extractMentions(content);
    
    for (const username of mentions) {
      const userId = await this.getUserIdByUsername(username);
      if (userId && userId !== authorId) {
        await this.createMentionNotification(postId, userId, authorId, content);
      }
    }
  }

  // Mark notification as read
  async markNotificationRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('forum_notifications' as any)
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get user's forum notifications
  async getUserNotifications(userId: string, limit = 50): Promise<ForumNotification[]> {
    try {
      const { data, error } = await supabase
        .from('forum_notifications' as any)
        .select(`
          *,
          author:profiles(id, full_name, email, avatar_url),
          post:forum_posts(id, title, category_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching forum notifications:', error);
      return [];
    }
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('forum_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Setup real-time notifications
  setupRealtimeNotifications(userId: string, onNotification: (notification: ForumNotification) => void) {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }

    this.realtimeSubscription = supabase
      .channel('forum_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onNotification(payload.new as ForumNotification);
        }
      )
      .subscribe();

    return this.realtimeSubscription;
  }

  // Cleanup
  cleanup() {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }
}

export const forumNotificationService = ForumNotificationService.getInstance(); 