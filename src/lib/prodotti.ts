import { supabase } from '@/lib/supabase'

export interface ProdottoDigitale {
  id: string
  user_id: string
  titolo: string
  descrizione: string | null
  prezzo: number
  slug: string
  link_preview: string | null
  link_download: string
  attivo: boolean
  created_at: string
}

export interface ProdottoPubblico {
  id: string
  titolo: string
  descrizione: string | null
  prezzo: number
  slug: string
  link_preview: string | null
  attivo: boolean
}

export interface AcquistoProdotto {
  id: string
  prodotto_id: string
  email_cliente: string
  stripe_session_id: string
  pagato: boolean
  created_at: string
}

export interface CreaProdottoInput {
  user_id: string
  titolo: string
  descrizione?: string | null
  prezzo: number
  link_preview?: string | null
  link_download: string
  attivo?: boolean
}

export interface AggiornaProdottoInput {
  titolo?: string
  descrizione?: string | null
  prezzo?: number
  link_preview?: string | null
  link_download?: string
  attivo?: boolean
}

const CAMPI_PUBBLICI =
  'id, titolo, descrizione, prezzo, slug, link_preview, attivo'

export function generaSlug(titolo: string): string {
  const base = titolo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'prodotto'
  const shortId = crypto.randomUUID().split('-')[0]
  return `${base}-${shortId}`
}

export async function getProdottiUtente(
  userId: string
): Promise<ProdottoDigitale[]> {
  const { data, error } = await supabase
    .from('prodotti_digitali')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ProdottoDigitale[]
}

export async function getProdottoBySlug(
  slug: string
): Promise<ProdottoPubblico | null> {
  const { data, error } = await supabase
    .from('prodotti_digitali')
    .select(CAMPI_PUBBLICI)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data as ProdottoPubblico | null
}

export async function creaProdotto(
  data: CreaProdottoInput
): Promise<ProdottoDigitale> {
  const slug = generaSlug(data.titolo)

  const { data: prodotto, error } = await supabase
    .from('prodotti_digitali')
    .insert({
      user_id: data.user_id,
      titolo: data.titolo,
      descrizione: data.descrizione ?? null,
      prezzo: data.prezzo,
      slug,
      link_preview: data.link_preview ?? null,
      link_download: data.link_download,
      attivo: data.attivo ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return prodotto as ProdottoDigitale
}

export async function aggiornaProdotto(
  id: string,
  data: AggiornaProdottoInput
): Promise<ProdottoDigitale> {
  const { data: prodotto, error } = await supabase
    .from('prodotti_digitali')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return prodotto as ProdottoDigitale
}

export async function eliminaProdotto(id: string): Promise<void> {
  const { error } = await supabase
    .from('prodotti_digitali')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function creaAcquisto(
  prodottoId: string,
  emailCliente: string,
  sessionId: string
): Promise<AcquistoProdotto> {
  const { data, error } = await supabase
    .from('acquisti_prodotti')
    .insert({
      prodotto_id: prodottoId,
      email_cliente: emailCliente,
      stripe_session_id: sessionId,
      pagato: false,
    })
    .select()
    .single()

  if (error) throw error
  return data as AcquistoProdotto
}

export async function confermaAcquisto(
  sessionId: string
): Promise<string | null> {
  const { data: acquisto, error: acquistoError } = await supabase
    .from('acquisti_prodotti')
    .select('id, prodotto_id, pagato')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (acquistoError) throw acquistoError
  if (!acquisto) return null

  if (!acquisto.pagato) {
    const { error: updateError } = await supabase
      .from('acquisti_prodotti')
      .update({ pagato: true })
      .eq('stripe_session_id', sessionId)

    if (updateError) throw updateError
  }

  const { data: prodotto, error: prodottoError } = await supabase
    .from('prodotti_digitali')
    .select('link_download')
    .eq('id', acquisto.prodotto_id)
    .single()

  if (prodottoError) throw prodottoError
  return prodotto.link_download as string
}

export async function getAcquistiProdotto(
  prodottoId: string
): Promise<AcquistoProdotto[]> {
  const { data, error } = await supabase
    .from('acquisti_prodotti')
    .select('*')
    .eq('prodotto_id', prodottoId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AcquistoProdotto[]
}
