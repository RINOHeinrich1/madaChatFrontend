// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://meqlbwxqcyeqkvaregpq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcWxid3hxY3llcWt2YXJlZ3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDI0OTgsImV4cCI6MjA2NjQxODQ5OH0.L8bJSsrdbmt6KwCpTduMKPXiJqm6vyhvWWLvAH3sXrI'

export const supabase = createClient(supabaseUrl, supabaseKey)
