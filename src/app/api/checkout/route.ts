import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getProdottoBySlug, getStripeAccountArtigiano } from '@/lib/prodotti'
import { checkRateLimit } from '@/lib/rateLimit'

function baseUrl(req: NextRequest): string {
  const origin = req.headers.get('origin')
  if (origin) return origin
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') ?? 'http'
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const allowed = checkRateLimit(`checkout:${ip}`, 5, 60000)
  if (!allowed) {
    return NextResponse.json({ error: 'Troppe richieste' }, { status: 429 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { slug, email } = await req.json()

    if (!slug || !email) {
      return NextResponse.json(
        { error: 'slug e email sono obbligatori' },
        { status: 400 }
      )
    }

    const prodotto = await getProdottoBySlug(slug, supabaseAdmin)
    if (!prodotto || !prodotto.attivo) {
      return NextResponse.json(
        { error: 'Prodotto non trovato o non disponibile' },
        { status: 404 }
      )
    }

    const origin = baseUrl(req)
    const unitAmount = Math.round(prodotto.prezzo * 100)
    const applicationFeeAmount = Math.round(unitAmount * 0.005)
    const stripeAccountId = await getStripeAccountArtigiano(prodotto.user_id, supabaseAdmin)

    const sessionBase: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: prodotto.titolo,
              description: prodotto.descrizione ?? undefined,
            },
          },
        },
      ],
      success_url: `${origin}/store/${slug}/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(email)}`,
      cancel_url: `${origin}/store/${slug}`,
      metadata: {
        prodotto_id: prodotto.id,
        email_cliente: email,
      },
    }

    const session = stripeAccountId
      ? await stripe.checkout.sessions.create({
          ...sessionBase,
          payment_intent_data: {
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
              destination: stripeAccountId,
            },
          },
        })
      : await stripe.checkout.sessions.create(sessionBase)

    if (!session.id) {
      return NextResponse.json(
        { error: 'Errore nella creazione della sessione Stripe' },
        { status: 500 }
      )
    }

    const { error: acquistoError } = await supabaseAdmin
      .from('acquisti_prodotti')
      .insert({
        prodotto_id: prodotto.id,
        email_cliente: email,
        stripe_session_id: session.id,
        pagato: false,
      })

    if (acquistoError) throw acquistoError
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('checkout error:', err)
    return NextResponse.json(
      { error: 'Errore durante il checkout' },
      { status: 500 }
    )
  }
}
