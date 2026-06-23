import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function normalizeDownloadUrl(link: string): string {  return link.startsWith('http') ? link : `https://${link}`
}

async function confermaAcquisto(
  supabaseAdmin: SupabaseClient,
  sessionId: string
): Promise<{
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
  const titoloSafe = titolo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pagamento completato</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F8FA;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
          <tr>
            <td style="background-color:#0D1B2A;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Preventivo<span style="color:#2DD4BF;">AI</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 20px;font-size:40px;line-height:1;">✅</p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0D1B2A;line-height:1.3;">
                Pagamento completato!
              </h1>
              <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#4B5563;">
                Il tuo prodotto <strong style="color:#0D1B2A;">${titoloSafe}</strong> è pronto.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:8px;background-color:#0E9F8E;">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Scarica il prodotto
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#9CA3AF;">
                Salva questo link, potrai usarlo in qualsiasi momento.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#999999;">
                Email inviata da PreventivoAI · Questo acquisto è protetto da Stripe
              </p>
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.5px;color:#635BFF;">
                stripe
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

async function inviaEmailDownload(
  resend: any,  emailCliente: string,
  titolo: string,
  linkDownload: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY non configurata, email non inviata')
    return
  }

  const { data, error } = await resend.emails.send({
    from: 'PreventivoAI <onboarding@resend.dev>',
    to: emailCliente,
    subject: `Il tuo acquisto è pronto — ${titolo}`,
    html: buildDownloadEmailHtml(titolo, linkDownload),
  })
  console.log('Resend result:', JSON.stringify(data))
  console.log('Resend error:', JSON.stringify(error))

  if (error) {
    throw new Error(error.message)
  }
}

export async function POST(req: NextRequest) {
  console.log('Webhook ricevuto')

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const skipVerificaFirma =
      !webhookSecret || webhookSecret === 'placeholder'

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const body = await req.text()
    let event: Stripe.Event

    if (skipVerificaFirma) {
      console.log('Debug: verifica firma webhook skippata')
      event = JSON.parse(body) as Stripe.Event
    } else {
      const signature = req.headers.get('stripe-signature')

      if (!signature) {
        console.error('webhook error: firma mancante')
        return NextResponse.json({ error: 'Firma mancante' }, { status: 400 })
      }

      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error('webhook signature error:', err)
        return NextResponse.json({ error: 'Firma non valida' }, { status: 400 })
      }
    }

    console.log('Firma verificata, evento:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Processando checkout:', session.id)

      if (session.payment_status === 'paid' && session.id) {
        try {
          const risultato = await confermaAcquisto(supabaseAdmin, session.id)

          if (risultato && !risultato.giaConfermato) {
            try {
              await inviaEmailDownload(
                resend,
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
  } catch (err) {
    console.error('webhook error:', err)
    return NextResponse.json({ error: 'Errore webhook' }, { status: 500 })
  }
}
