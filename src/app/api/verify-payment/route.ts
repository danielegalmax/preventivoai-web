import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

async function confermaAcquisto(
  supabaseAdmin: SupabaseClient,
  sessionId: string
): Promise<{ titolo: string; email_cliente: string } | null> {
  const { data: acquisto, error: acquistoError } = await supabaseAdmin
    .from('acquisti_prodotti')
    .select('id, prodotto_id, pagato, email_cliente')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (acquistoError) throw acquistoError
  if (!acquisto) return null

  if (!acquisto.pagato) {
    const { error: updateError } = await supabaseAdmin
      .from('acquisti_prodotti')
      .update({ pagato: true })
      .eq('stripe_session_id', sessionId)

    if (updateError) throw updateError
  }

  const { data: prodotto, error: prodottoError } = await supabaseAdmin
    .from('prodotti_digitali')
    .select('titolo')
    .eq('id', acquisto.prodotto_id)
    .single()

  if (prodottoError) throw prodottoError

  return {
    titolo: prodotto.titolo as string,
    email_cliente: acquisto.email_cliente,
  }
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { session_id } = await req.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id obbligatorio' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Pagamento non completato', pagato: false },
        { status: 402 }
      )
    }

    const risultato = await confermaAcquisto(supabaseAdmin, session_id)

    if (!risultato) {
      return NextResponse.json(
        { error: 'Acquisto non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      pagato: true,
      titolo: risultato.titolo,
      email: risultato.email_cliente,
    })
  } catch (err) {
    console.error('verify-payment error:', err)
    return NextResponse.json(
      { error: 'Errore nella verifica del pagamento' },
      { status: 500 }
    )
  }
}
