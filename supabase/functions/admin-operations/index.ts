
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use secure defaults
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'https://www.nordics.world',
  'https://nordics.world',
  'http://localhost:3000',
  'http://localhost:5173'
];

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    return new Response(null, { headers: corsHeaders(origin) });
  }

  try {
    // Validate origin
    const origin = req.headers.get('Origin');
    if (!allowedOrigins.includes(origin || '')) {
      return new Response(
        JSON.stringify({ error: 'Origin not allowed' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Insufficient permissions - admin role required');
    }

    const { operation, userId, newRole, password } = await req.json();

    let result;
    
    switch (operation) {
      case 'delete_user':
        if (!userId) throw new Error('User ID required for deletion');
        
        // Log the admin action for audit trail
        await supabase
          .from('admin_audit_log')
          .insert({
            admin_id: user.id,
            action: 'delete_user',
            target_user_id: userId,
            timestamp: new Date().toISOString()
          });

        // Delete the user account
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;
        
        result = { success: true, message: 'User deleted successfully' };
        break;
        
      case 'update_role':
        if (!userId || !newRole) throw new Error('User ID and new role required');
        
        // Log the admin action
        await supabase
          .from('admin_audit_log')
          .insert({
            admin_id: user.id,
            action: 'update_role',
            target_user_id: userId,
            details: { new_role: newRole },
            timestamp: new Date().toISOString()
          });

        // Update user role
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
          
        if (roleError) throw roleError;
        
        result = { success: true, message: 'Role updated successfully' };
        break;
        
      default:
        throw new Error('Invalid operation');
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Admin operation error:', error);
    const origin = req.headers.get('Origin');
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );
  }
});
