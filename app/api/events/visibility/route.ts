import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = new URL(request.url).searchParams;
  const scope = searchParams.get('scope') || 'personal';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('events')
    .select('*, class:classes(name)');

  // Apply visibility scope filter
  switch (scope) {
    case 'personal':
      query = query.eq('user_id', user.id);
      break;
    case 'class':
      if (profile?.role === 'student') {
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .eq('student_id', user.id);
        
        const classIds = enrollments?.map(e => e.class_id) || [];
        query = query
          .eq('visibility_scope', 'class')
          .in('class_id', classIds);
      }
      break;
    case 'schoolwide':
      query = query.eq('visibility_scope', 'schoolwide');
      break;
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { eventId, visibility_scope } = await request.json();

  if (!eventId || !visibility_scope) {
    return new Response(JSON.stringify({ error: 'Event ID and visibility scope are required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify user owns the event
  const { data: event } = await supabase
    .from('events')
    .select('user_id')
    .eq('id', eventId)
    .single();

  if (event?.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized - You do not own this event' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await supabase
    .from('events')
    .update({ visibility_scope })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
