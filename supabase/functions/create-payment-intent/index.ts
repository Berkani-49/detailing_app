// supabase/functions/create-payment-intent/index.ts
// Crée un PaymentIntent Stripe.
// Si stripe_account_id est fourni, le paiement est routé vers le compte
// Connect du nettoyeur (transfer_data.destination). La plateforme peut
// optionnellement prélever une commission via application_fee_amount.

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

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
    const {
      amount,             // montant en euros (ex : 79.00)
      description,        // description lisible (ex : "Lavage Pro — Brussels Auto Detail")
      stripe_account_id,  // ID du compte Connect du nettoyeur (ex : acct_xxxx) — optionnel
      platform_fee_pct,   // % de commission plateforme (ex : 5 = 5%) — optionnel, défaut 0
    } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Montant invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const amountCents    = Math.round(Number(amount) * 100)
    const feePct         = Number(platform_fee_pct) || 0
    const applicationFee = feePct > 0 ? Math.round(amountCents * feePct / 100) : undefined

    // Paramètres de base du PaymentIntent
    const params: Stripe.PaymentIntentCreateParams = {
      amount:   amountCents,
      currency: 'eur',
      description,
      // Méthodes de paiement européennes courantes
      payment_method_types: ['card', 'bancontact', 'ideal'],
    }

    // ── Stripe Connect : routage vers le compte du nettoyeur ────────────────
    if (stripe_account_id) {
      params.transfer_data = { destination: stripe_account_id }
      if (applicationFee) {
        params.application_fee_amount = applicationFee
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(params)

    return new Response(
      JSON.stringify({ client_secret: paymentIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('create-payment-intent error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
