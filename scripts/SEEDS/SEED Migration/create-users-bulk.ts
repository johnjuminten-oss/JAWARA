import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load env from project root .env.local
dotenv.config({ path: '../../../.env.local' })

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in ../../.env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const teachers: Array<{ email: string; fullName: string; password: string }> = [
  { email: 'Fiqihjuara@gmail.com', fullName: 'Fiqih', password: 'Teacher123!' },
  { email: 'ajeng409@gmail.com', fullName: 'Ajeng', password: 'Teacher123!' },
  { email: 'ulfahpatrusha@gmail.com', fullName: 'Ulfah Fitriah', password: 'Teacher123!' },
  { email: 'munawirawing9@gmail.com', fullName: 'Munawir', password: 'Teacher123!' }
]

const students: Array<{ email: string; fullName: string; password: string }> = [
  { email: 'sarahaquinl06@gmail.com', fullName: 'Sarah Aquinny Lontoh', password: 'Student123!' },
  { email: 'farhan.dhanwar@gmail.com', fullName: 'Farhan Ramadhan Kusumawardhana', password: 'Student123!' },
  { email: 'sorayfatika@gmail.com', fullName: 'Soraya Fatika Arawinda Galela', password: 'Student123!' },
  { email: 'rdyark@gmail.com', fullName: 'Radya Raka Ramadhan', password: 'Student123!' },
  { email: 'agnailmasolihah@gmail.com', fullName: 'Agna Ilma Solihah', password: 'Student123!' },
  { email: 'khalifalihusain30@gmail.com', fullName: 'Khalif Ali Husain', password: 'Student123!' },
  { email: 'finsanurna@gmail.com', fullName: 'Nurna Annisa Finsa', password: 'Student123!' },
  { email: 'muhammad.fabero@gmail.com', fullName: 'Muhammad Fabero Arkana', password: 'Student123!' },
  { email: 'syarifasyahputri@gmail.com', fullName: 'Syarifa Syah Putri', password: 'Student123!' },
  { email: 'salmafatihaputri@gmail.com', fullName: 'Salma Fatiha Putri Rahardian', password: 'Student123!' },
  { email: 'varenwicaksono@gmail.com', fullName: 'Pradhika Varen Wicaksono', password: 'Student123!' },
  { email: 'jovitaf.107@gmail.com', fullName: 'Jovita Fiducia', password: 'Student123!' },
  { email: 'maliqa.indra08@gmail.com', fullName: 'Maliqa Indra Putri', password: 'Student123!' },
  { email: 'alethasofian@gmail.com', fullName: 'Fatima Aletha Zahra', password: 'Student123!' },
  { email: 'karnovakhansa@gmail.com', fullName: 'Khansa Putri Karnova', password: 'Student123!' },
  { email: 'nazararifqa@gmail.com', fullName: 'Nazara Rifqa Rizkyantika', password: 'Student123!' },
  { email: 'aldilaprasastireal@gmail.com', fullName: 'Aldila Prasasti', password: 'Student123!' },
  { email: 'disyazulnasri0610@gmail.com', fullName: 'Disya Az Zahra Zulnasri', password: 'Student123!' },
  { email: 'kaneshavallia@gmail.com', fullName: 'Kanesha Vallia', password: 'Student123!' }
]

async function createUser(email: string, password: string, fullName: string, role: 'teacher' | 'student') {
  try {
    // Fetch up to 1000 users, then match by email
    const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listErr) {
      console.error('List users error:', listErr.message)
      return null
    }
    const existing = usersList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    let userId: string
    if (existing) {
      console.log(`User already exists: ${email}`)
      userId = existing.id
    } else {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })
      if (createErr) {
        console.error(`Create user failed (${email}): ${createErr.message}`)
        return null
      }
      userId = created.user!.id
      console.log(`Created user: ${email}`)
    }

    // Resolve class for students
    let classId: string | null = null
    if (role === 'student') {
      const { data: cls } = await supabase.from('classes').select('id').eq('name', 'Kelas 12-H').maybeSingle()
      classId = (cls as any)?.id ?? null
    }

    const { error: upsertErr } = await supabase.from('profiles').upsert(
      { id: userId, email, full_name: fullName, role, class_id: classId, is_active: true },
      { onConflict: 'id' }
    )
    if (upsertErr) {
      console.error(`Upsert profile failed (${email}): ${upsertErr.message}`)
      return null
    }
    console.log(`Upserted profile: ${email} (${role})`)
    return userId
  } catch (e) {
    console.error(`Error processing ${email}:`, e)
    return null
  }
}

async function createUsersInBatches(users: Array<{ email: string; fullName: string; password: string }>, role: 'teacher' | 'student', batchSize = 5) {
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)
    console.log(`Processing ${role} batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`)
    await Promise.all(batch.map(u => createUser(u.email, u.password, u.fullName, role)))
    if (i + batchSize < users.length) await new Promise(r => setTimeout(r, 800))
  }
}

async function main() {
  console.log('Starting bulk user creation...')
  await createUsersInBatches(teachers, 'teacher')
  await createUsersInBatches(students, 'student')

  const { data: teacherCount } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'teacher')
  const { data: studentCount } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student')
  console.log(`Done. Teachers in profiles: ${teacherCount?.length ?? 0}. Students in profiles: ${studentCount?.length ?? 0}.`)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})


