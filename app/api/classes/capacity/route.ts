import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET endpoint to retrieve class capacity
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const searchParams = new URL(request.url).searchParams;
  const classId = searchParams.get('classId');

  if (!classId) {
    return new Response('Class ID is required', { status: 400 });
  }

  const { data, error } = await supabase
    .from('classes')
    .select('capacity, current_enrollment:class_enrollments(count)')
    .eq('id', classId)
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

// PUT endpoint to update class capacity
export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { classId, capacity } = await request.json();

  if (!classId || !capacity) {
    return new Response('Class ID and capacity are required', { status: 400 });
  }

  // Verify user is a teacher
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profileError || profile?.role !== 'teacher') {
    return new Response('Unauthorized', { status: 403 });
  }

  const { data, error } = await supabase
    .from('classes')
    .update({ capacity })
    .eq('id', classId)
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
