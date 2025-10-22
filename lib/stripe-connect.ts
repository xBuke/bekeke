import { stripe } from './stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createConnectedAccount(providerId: string, email: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'HR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    
    // Spremi account ID u bazu
    await supabase
      .from('service_providers')
      .update({ stripe_account_id: account.id })
      .eq('id', providerId);
    
    return account;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
}

export async function createAccountLink(accountId: string, _providerId: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj/stripe-refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pruzatelj/stripe-success`,
      type: 'account_onboarding',
    });
    
    return accountLink.url;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}
