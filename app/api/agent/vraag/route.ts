import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { weigerZonderDashboardSessie } from '@/lib/dashboardAuth'
import { beantwoordKlantvraag, type KlantDossier } from '@/lib/agents/climatex/klantvragen'
import type { Factuur, Offerte, Planning, Werkbon } from '@/lib/types'

/**
 * Beantwoordt een klantvraag, eventueel met het dossier van een specifieke
 * lead erbij. Zonder leadId worden alleen algemene vragen beantwoord.
 *
 * De sessie is verplicht omdat het antwoord klantgegevens kan bevatten.
 */
export async function POST(request: Request) {
  const geweigerd = weigerZonderDashboardSessie(request)
  if (geweigerd) return geweigerd

  let body: { vraag?: string; leadId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag.' }, { status: 400 })
  }

  const vraag = (body.vraag || '').trim()
  if (!vraag) {
    return NextResponse.json({ error: 'Geen vraag meegegeven.' }, { status: 400 })
  }

  let dossier: KlantDossier | null = null

  if (body.leadId) {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ error: 'Supabase is niet geconfigureerd.' }, { status: 500 })
    }

    const [leadRes, offertesRes, werkbonnenRes, facturenRes, planningRes] = await Promise.all([
      supabase.from('leads').select('naam').eq('id', body.leadId).maybeSingle(),
      supabase.from('offertes').select('*').eq('lead_id', body.leadId),
      supabase.from('werkbonnen').select('*').eq('lead_id', body.leadId),
      supabase.from('facturen').select('*').eq('lead_id', body.leadId),
      supabase.from('planning').select('*').eq('lead_id', body.leadId),
    ])

    dossier = {
      klantnaam: (leadRes.data as { naam?: string } | null)?.naam || '',
      offertes: (offertesRes.data as Offerte[]) || [],
      werkbonnen: (werkbonnenRes.data as Werkbon[]) || [],
      facturen: (facturenRes.data as Factuur[]) || [],
      planningen: (planningRes.data as Planning[]) || [],
    }
  }

  return NextResponse.json(beantwoordKlantvraag(vraag, dossier))
}
