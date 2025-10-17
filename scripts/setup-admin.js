require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl ? 'exists' : 'missing');
console.log('SUPABASE_KEY:', supabaseKey ? 'exists' : 'missing');

// For development, skip Supabase setup and just log success
if (process.env.NODE_ENV !== 'production') {
  console.log('Development mode: Skipping Supabase admin user setup');
  console.log('Admin user will be handled by mock authentication');
  process.exit(0);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    const email = 'joeinduluth@gmail.com';
    const password = 'Two1Eight';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      console.log('Admin user already exists with role:', existingUser.role);
      
      // Update to super_admin if needed
      if (existingUser.role !== 'super_admin') {
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error('Error updating admin role:', updateError);
        } else {
          console.log('Updated user role to super_admin');
        }
      }
      return;
    }

    // Create the admin user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        name: 'Joe Induluth',
        role: 'super_admin',
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      process.exit(1);
    }

    console.log('Admin user created successfully:', data.email);
    console.log('Email: joeinduluth@gmail.com');
    console.log('Password: Two1Eight');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupAdminUser();
