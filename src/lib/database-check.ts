import { supabase, isSupabaseConfigured } from './supabase';

export interface DatabaseStatus {
  connected: boolean;
  profilesTableExists: boolean;
  userSettingsTableExists: boolean;
  emailSubscriptionsTableExists: boolean;
  error?: string;
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      profilesTableExists: false,
      userSettingsTableExists: false,
      emailSubscriptionsTableExists: false,
      error: 'Supabase not configured'
    };
  }

  try {
    // Test basic connection
    const { error: connectionError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    const profilesTableExists = !connectionError || connectionError.code !== 'PGRST301';

    // Check user_settings table
    const { error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id')
      .limit(1);

    const userSettingsTableExists = !settingsError || settingsError.code !== 'PGRST301';

    // Check email_subscriptions table
    const { error: emailError } = await supabase
      .from('email_subscriptions')
      .select('id')
      .limit(1);

    const emailSubscriptionsTableExists = !emailError || emailError.code !== 'PGRST301';

    return {
      connected: true,
      profilesTableExists,
      userSettingsTableExists,
      emailSubscriptionsTableExists,
      error: connectionError?.message || settingsError?.message || emailError?.message
    };

  } catch (error: any) {
    return {
      connected: false,
      profilesTableExists: false,
      userSettingsTableExists: false,
      emailSubscriptionsTableExists: false,
      error: error.message
    };
  }
}

export function logDatabaseStatus(status: DatabaseStatus) {
  console.log('=== Database Status ===');
  console.log('Connected:', status.connected);
  console.log('Profiles table:', status.profilesTableExists ? '✅' : '❌');
  console.log('User settings table:', status.userSettingsTableExists ? '✅' : '❌');
  console.log('Email subscriptions table:', status.emailSubscriptionsTableExists ? '✅' : '❌');
  if (status.error) {
    console.log('Error:', status.error);
  }
  console.log('======================');
}