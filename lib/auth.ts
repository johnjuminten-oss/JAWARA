import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      redirect('/auth/login')
    }

    const supabase = await createClient()
    
    // First check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      
      // If profile doesn't exist or there's a duplicate key error, handle gracefully
      if (error.code === 'PGRST116') {
        console.log('Profile not found, attempting to fetch or create for user:', user.id)
        
        // First try to fetch again to handle race conditions
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!fetchError && existingProfile) {
          return existingProfile
        }

        // If still no profile, try to create one with upsert
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || 'New User',
              role: 'student', // Default role
              created_at: new Date().toISOString()
            }
          ], {
            onConflict: 'id',
            ignoreDuplicates: true
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create/update profile:', createError)
          if (createError.code === '23505') { // Duplicate key error
            // Try one last time to fetch the profile
            const { data: finalProfile, error: finalError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
              
            if (!finalError && finalProfile) {
              return finalProfile
            }
          }
          redirect('/auth/sign-up?error=profile_creation_failed')
        }

        return newProfile
      }
      
      console.error('Profile fetch failed:', error)
      redirect('/auth/login?error=profile_error')
    }

    if (!profile) {
      redirect('/auth/login?error=profile_not_found')
    }

    if (!allowedRoles.includes(profile.role)) {
      redirect(`/${profile.role}/dashboard`)
    }

    return profile
  } catch (error) {
    console.error('Error in requireRole:', error)
    redirect('/auth/login?error=unknown_error')
  }
}
