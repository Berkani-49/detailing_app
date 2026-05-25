// supabase/functions/create-connect-account/index.ts
// Crée (ou récupère) un compte Stripe Connect Express pour un nettoyeur
// et retourne une URL d'onboarding Stripe.

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { detailer_id, email, business_name, country, return_url, refresh_url } = await req.json()

    if (!detailer_id) {
      return new Response(JSON.stringify({ error: 'detailer_id requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Client Supabase avec le service role (contourne la RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Récupérer le stripe_account_id existant du nettoyeur
    const { data: detailer, error: dbErr } = await supabase
      .from('detailers')
      .select('stripe_account_id')
      .eq('id', detailer_id)
      .single()

    if (dbErr) throw new Error('Nettoyeur introuvable')

    let accountId: string = detailer?.stripe_account_id

    if (!accountId) {
      // Créer un nouveau compte Express Stripe Connect
      const account = await stripe.accounts.create({
        type: 'express',
        email: email || undefined,
        business_profile: { name: business_name || 'DetailPro' },
        country: country || 'BE',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      // Sauvegarder l'ID dans la base de données
      await supabase
        .from('detailers')
        .update({ stripe_account_id: accountId })
        .eq('id', detailer_id)
    }

    // Créer un Account Link pour l'onboarding (ou re-onboarding)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refresh_url || 'https://detailpro.app?stripe_connect_refresh=true',
      return_url:  return_url  || 'https://detailpro.app?stripe_connect_return=true',
      type: 'account_onboarding',
    })

    return new Response(JSON.stringify({ url: accountLink.url, account_id: accountId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-connect-account error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
