import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { weigerZonderDashboardSessie } from '@/lib/dashboardAuth'
import { maakAiProvider } from '@/lib/agents/climatex/aiProvider'
import { draaiAgent } from '@/lib/agents/climatex/agent'
import type { Lead, Planning, Product } from '@/lib/types'

/**
 * Laat de CRM-agent een ronde draaien over de openstaande leads.
 *
 * Deze route draait uitsluitend op de server. Dat is geen detail: de sleutel
 * van het taalmodel wordt hier gelezen en mag nooit in de browser komen. De
 * dashboardsessie is verplicht, want het antwoord bevat klantgegevens en de
 * aanroep kost geld zodra er een taalmodel gekoppeld is.
 */
export async function POST(request: Request) {
  const geweigerd = weigerZonderDashboardSessie(request)
  if (geweigerd) return geweigerd

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'Supabase is niet geconfigureerd.' }, { status: 500 })
  }

  const [leadsRes, productenRes, planningRes] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('producten').select('*').eq('actief', true),
    supabase.from('planning').select('*').gte('datum', new Date().toISOString().slice(0, 10)),
  ])

  const fout = leadsRes.error?.message || productenRes.error?.message || planningRes.error?.message
  if (fout) {
    return NextResponse.json({ error: fout }, { status: 500 })
  }

  const provider = maakAiProvider()

  const rapport = await draaiAgent({
    leads: (leadsRes.data as Lead[]) || [],
    producten: (productenRes.data as Product[]) || [],
    planningen: (planningRes.data as Planning[]) || [],
    provider,
  })

  console.log(
    `[agent] ronde gedraaid motor=${rapport.motor} leads=${rapport.prioriteiten.length} ` +
      `voorstellen=${rapport.voorstellen.length} overgeslagen=${rapport.overgeslagen.length}`
  )

  return NextResponse.json(rapport)
}
