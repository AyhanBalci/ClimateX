/**
 * ClimateX CRM Agent — AI-provider
 *
 * ARCHITECTUUR
 * ────────────
 * De agent draait op twee lagen die los van elkaar staan:
 *
 *   1. Redeneerlaag (deterministisch, in dit project)
 *      Alle beslissingen die geld of klantcontact raken — welk product past,
 *      wat de prijs is, hoe urgent een lead is — komen uit expliciete regels
 *      in `leadAnalyse.ts`, `offerteConcept.ts` en `planningAdvies.ts`. Die
 *      regels zijn te lezen, te testen en te verantwoorden richting een klant.
 *
 *   2. Taallaag (optioneel, extern)
 *      Een taalmodel maakt van die uitkomsten lopende tekst voor een e-mail of
 *      WhatsApp-bericht. Zonder sleutel gebruikt de agent sjablonen die
 *      hetzelfde zeggen, alleen minder soepel geformuleerd.
 *
 * Waarom die scheiding: een taalmodel dat zelf prijzen bepaalt of urgentie
 * inschat, geeft bij dezelfde invoer niet altijd hetzelfde antwoord en kan
 * getallen verzinnen. Voor een offerte is dat onacceptabel. Voor de toon van
 * een begeleidende e-mail is het juist een verbetering.
 *
 * KOPPELEN VAN EEN TAALMODEL
 * ──────────────────────────
 * 1. Zet in de omgeving:
 *      AI_PROVIDER=openai            (of: anthropic)
 *      OPENAI_API_KEY=...            (of: ANTHROPIC_API_KEY=...)
 *      AI_MODEL=gpt-4o-mini          (optioneel, anders de standaard hieronder)
 * 2. De sleutel mag uitsluitend server-side gelezen worden. Roep de agent
 *    daarom altijd aan via een route handler onder app/api/agent/, nooit
 *    rechtstreeks vanuit een component.
 * 3. Meer is er niet nodig: `maakAiProvider()` kiest zelf de juiste
 *    implementatie en valt terug op sjablonen zodra er geen sleutel is.
 */

export interface AiBericht {
  rol: 'systeem' | 'gebruiker'
  inhoud: string
}

export interface AiProvider {
  /** Naam voor in de logging en op het scherm, zodat zichtbaar is wat er draait. */
  naam: string
  /** Waar of er een echt taalmodel achter zit. Is dit onwaar, dan komt alles uit sjablonen. */
  isTaalmodel: boolean
  /**
   * Zet een reeks berichten om in tekst. Faalt de aanroep, dan geeft deze
   * functie null terug in plaats van een fout: de agent moet altijd een
   * bruikbaar concept opleveren, ook als het model onbereikbaar is.
   */
  genereerTekst(berichten: AiBericht[]): Promise<string | null>
}

/**
 * Terugvalprovider zonder extern model. Geeft altijd null, waarna de aanroeper
 * zijn eigen sjabloon gebruikt.
 */
export const SJABLOON_PROVIDER: AiProvider = {
  naam: 'Sjablonen (geen taalmodel gekoppeld)',
  isTaalmodel: false,
  async genereerTekst() {
    return null
  },
}

const STANDAARD_MODELLEN: Record<string, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-5',
}

/** Hoe lang we op het model wachten voordat we terugvallen op een sjabloon. */
const TIJDSLIMIET_MS = 20_000

function rolNaarOpenai(rol: AiBericht['rol']): 'system' | 'user' {
  return rol === 'systeem' ? 'system' : 'user'
}

function maakOpenaiProvider(sleutel: string, model: string): AiProvider {
  return {
    naam: `OpenAI ${model}`,
    isTaalmodel: true,
    async genereerTekst(berichten) {
      try {
        const antwoord = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sleutel}`,
          },
          body: JSON.stringify({
            model,
            messages: berichten.map((b) => ({ role: rolNaarOpenai(b.rol), content: b.inhoud })),
            temperature: 0.4,
          }),
          signal: AbortSignal.timeout(TIJDSLIMIET_MS),
        })

        if (!antwoord.ok) {
          console.error(`[aiProvider] OpenAI gaf status ${antwoord.status}`)
          return null
        }

        const data = await antwoord.json()
        const tekst = data?.choices?.[0]?.message?.content
        return typeof tekst === 'string' && tekst.trim() ? tekst.trim() : null
      } catch (fout) {
        console.error('[aiProvider] OpenAI onbereikbaar:', fout instanceof Error ? fout.message : fout)
        return null
      }
    },
  }
}

function maakAnthropicProvider(sleutel: string, model: string): AiProvider {
  return {
    naam: `Anthropic ${model}`,
    isTaalmodel: true,
    async genereerTekst(berichten) {
      // Anthropic verwacht de systeeminstructie als apart veld, niet als bericht.
      const systeem = berichten
        .filter((b) => b.rol === 'systeem')
        .map((b) => b.inhoud)
        .join('\n\n')
      const gesprek = berichten
        .filter((b) => b.rol !== 'systeem')
        .map((b) => ({ role: 'user' as const, content: b.inhoud }))

      try {
        const antwoord = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': sleutel,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 1500,
            system: systeem || undefined,
            messages: gesprek.length > 0 ? gesprek : [{ role: 'user', content: '' }],
          }),
          signal: AbortSignal.timeout(TIJDSLIMIET_MS),
        })

        if (!antwoord.ok) {
          console.error(`[aiProvider] Anthropic gaf status ${antwoord.status}`)
          return null
        }

        const data = await antwoord.json()
        const tekst = data?.content?.[0]?.text
        return typeof tekst === 'string' && tekst.trim() ? tekst.trim() : null
      } catch (fout) {
        console.error('[aiProvider] Anthropic onbereikbaar:', fout instanceof Error ? fout.message : fout)
        return null
      }
    },
  }
}

/**
 * Kiest de provider op basis van de omgeving. Mag uitsluitend server-side
 * aangeroepen worden: hij leest sleutels die nooit in de browser horen.
 */
export function maakAiProvider(): AiProvider {
  const keuze = (process.env.AI_PROVIDER || '').toLowerCase()

  if (keuze === 'openai') {
    const sleutel = process.env.OPENAI_API_KEY
    if (!sleutel) {
      console.warn('[aiProvider] AI_PROVIDER=openai maar OPENAI_API_KEY ontbreekt; sjablonen worden gebruikt.')
      return SJABLOON_PROVIDER
    }
    return maakOpenaiProvider(sleutel, process.env.AI_MODEL || STANDAARD_MODELLEN.openai)
  }

  if (keuze === 'anthropic') {
    const sleutel = process.env.ANTHROPIC_API_KEY
    if (!sleutel) {
      console.warn('[aiProvider] AI_PROVIDER=anthropic maar ANTHROPIC_API_KEY ontbreekt; sjablonen worden gebruikt.')
      return SJABLOON_PROVIDER
    }
    return maakAnthropicProvider(sleutel, process.env.AI_MODEL || STANDAARD_MODELLEN.anthropic)
  }

  return SJABLOON_PROVIDER
}

/**
 * De vaste instructie die elk taalmodel meekrijgt.
 *
 * De grens die hier getrokken wordt is belangrijk: het model mag de toon
 * bepalen, maar geen bedragen, datums of toezeggingen bedenken. Alles wat
 * telbaar is komt uit de meegegeven gegevens.
 */
export const SYSTEEM_INSTRUCTIE = [
  'Je schrijft namens ClimateX, een Nederlands installatiebedrijf voor laadpalen.',
  '',
  'Regels:',
  '- Schrijf in het Nederlands, beleefd en zakelijk, met "u".',
  '- Gebruik UITSLUITEND de gegevens die in het bericht staan.',
  '- Verzin nooit bedragen, datums, termijnen, productnamen of toezeggingen.',
  '- Ontbreekt een gegeven, laat dan letterlijk [invullen: wat er mist] staan.',
  '- Beloof geen levertijden of kortingen die niet in de gegevens staan.',
  '- Geen opsmuk, geen overdrijving, geen uitroeptekens.',
  '- Sluit af met "Met vriendelijke groet, ClimateX".',
].join('\n')
