import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

function normalizeDownloadUrl(link: string): string {
  return link.startsWith('http') ? link : `https://${link}`
}

async function confermaAcquisto(sessionId: string): Promise<{
  email_cliente: string
  link_download: string
  titolo: string
  giaConfermato: boolean
} | null> {
  const { data: acquisto, error: acquistoError } = await supabaseAdmin
    .from('acquisti_prodotti')
    .select('id, prodotto_id, pagato, email_cliente')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (acquistoError) throw acquistoError
  if (!acquisto) return null

  const giaConfermato = acquisto.pagato

  if (!acquisto.pagato) {
    const { error: updateError } = await supabaseAdmin
      .from('acquisti_prodotti')
      .update({ pagato: true })
      .eq('stripe_session_id', sessionId)

    if (updateError) throw updateError
  }

  const { data: prodotto, error: prodottoError } = await supabaseAdmin
    .from('prodotti_digitali')
    .select('link_download, titolo')
    .eq('id', acquisto.prodotto_id)
    .single()

  if (prodottoError) throw prodottoError

  return {
    email_cliente: acquisto.email_cliente,
    link_download: prodotto.link_download as string,
    titolo: prodotto.titolo as string,
    giaConfermato,
  }
}

function buildDownloadEmailHtml(titolo: string, linkDownload: string): string {
  const url = normalizeDownloadUrl(linkDownload)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
      <h1 style="font-size: 22px; margin-bottom: 16px;">Grazie per il tuo acquisto!</h1>
      <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        Il tuo prodotto <strong>${titolo}</strong> è pronto per il download.
      </p>
      <p style="margin-bottom: 32px;">
        <a href="${url}" style="display: inline-block; background: #0E9F8E; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
          Scarica ora
        </a>
      </p>
      <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 16px;">
        Questo link ti è stato inviato dopo il pagamento. Conservalo.
      </p>
    </div>
  `
}

async function inviaEmailDownload(
  emailCliente: string,
  titolo: string,
  linkDownload: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY non configurata, email non inviata')
    return
  }

  const { error } = await resend.emails.send({
    from: 'PreventivoAI <onboarding@resend.dev>',
    to: emailCliente,
    subject: `Il tuo acquisto è pronto — ${titolo}`,
    html: buildDownloadEmailHtml(titolo, linkDownload),
  })

  if (error) {
    console.error('Resend error:', error)
    throw new Error(error.message)
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || webhookSecret === 'placeholder') {
    return NextResponse.json({ received: true })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Firma mancante' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('webhook signature error:', err)
    return NextResponse.json({ error: 'Firma non valida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === 'paid' && session.id) {
      try {
        const risultato = await confermaAcquisto(session.id)

        if (risultato && !risultato.giaConfermato) {
          try {
            await inviaEmailDownload(
              risultato.email_cliente,
              risultato.titolo,
              risultato.link_download
            )
          } catch (err) {
            console.error('webhook inviaEmailDownload error:', err)
          }
        }
      } catch (err) {
        console.error('webhook confermaAcquisto error:', err)
        return NextResponse.json(
          { error: 'Errore conferma acquisto' },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
