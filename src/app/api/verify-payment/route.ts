import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function confermaAcquisto(sessionId: string): Promise<string | null> {
  const { data: acquisto, error: acquistoError } = await supabaseAdmin
    .from('acquisti_prodotti')
    .select('id, prodotto_id, pagato')
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
    .select('link_download')
    .eq('id', acquisto.prodotto_id)
    .single()

  if (prodottoError) throw prodottoError
  return prodotto.link_download as string
}

export async function POST(req: NextRequest) {
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

    const linkDownload = await confermaAcquisto(session_id)

    if (!linkDownload) {
      return NextResponse.json(
        { error: 'Acquisto non trovato' },
        { status: 404 }
      )
    }

    const url = linkDownload.startsWith('http')
      ? linkDownload
      : `https://${linkDownload}`

    return NextResponse.json({ pagato: true, link_download: url })
  } catch (err) {
    console.error('verify-payment error:', err)
    return NextResponse.json(
      { error: 'Errore nella verifica del pagamento' },
      { status: 500 }
    )
  }
}
