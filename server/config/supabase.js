<<<<<<< HEAD

=======
>>>>>>> 0c44fbdb1dff562c883b76efa54fc2dc491daaf8
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nyhsxdvwnltrriyylvyl.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase;