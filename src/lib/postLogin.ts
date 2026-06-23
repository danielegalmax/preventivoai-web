import type { SupabaseClient } from '@supabase/supabase-js'

export async function getPostLoginPath(
  supabase: SupabaseClient,
  fallback = '/dashboard'
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return '/login'

  const { data: prof } = await supabase
    .from('profiles')
    .select('termini_accettati')
    .eq('id', user.id)
    .single()

  if (!prof?.termini_accettati) return '/benvenuto'
  return fallback
}
