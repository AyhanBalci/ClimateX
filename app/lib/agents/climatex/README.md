# ClimateX CRM Agent

Een agent die het voorbereidende CRM-werk doet: leads prioriteren,
conceptoffertes opstellen, klantvragen beantwoorden, werkbonnen voorbereiden,
planning voorstellen en berichten opstellen.

## De regel die alles bepaalt

**De agent legt niets vast en verstuurt niets.** Alles wat hij oplevert is een
voorstel met onderbouwing en controlepunten, dat een medewerker bekijkt en
bevestigt. Het gaat om offertes, prijzen en klantcontact; een fout die ongezien
naar buiten gaat kost geld of vertrouwen.

## Twee lagen

```
┌─────────────────────────────────────────────────────────┐
│  Redeneerlaag — expliciete regels, in dit project        │
│                                                          │
│  leadAnalyse.ts        score, urgentie, volgende stap    │
│  offerteConcept.ts     productkeuze en prijsopbouw       │
│  planningAdvies.ts     vrije momenten in de agenda       │
│  werkbonVoorbereiding  materiaal en tijdsinschatting     │
│  klantvragen.ts        antwoord uit dossier/kennisbank   │
│                                                          │
│  Deterministisch. Zelfde invoer = zelfde uitkomst.       │
│  Elk getal is te herleiden. Werkt zonder externe sleutel.│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Taallaag — optioneel, extern                            │
│                                                          │
│  berichten.ts + aiProvider.ts                            │
│  Maakt van de uitkomsten lopende tekst.                  │
│  Zonder sleutel: sjablonen met dezelfde inhoud.          │
└─────────────────────────────────────────────────────────┘
```

**Waarom die scheiding.** Een taalmodel dat zelf prijzen bepaalt of urgentie
inschat, geeft bij dezelfde invoer niet altijd hetzelfde antwoord en kan
getallen verzinnen. Voor een offerte is dat onacceptabel. Voor de toon van een
begeleidende e-mail is het juist een verbetering. Daarom mag het model wél de
formulering doen en nooit de feiten.

## Modules

| Bestand | Doet | Getest met |
|---|---|---|
| `aiProvider.ts` | Provider-seam (OpenAI/Anthropic/sjablonen) | via `berichten` |
| `leadAnalyse.ts` | Score 0-100, urgentie, ontbrekende gegevens | 20 assertions |
| `offerteConcept.ts` | Productkeuze en prijsopbouw | 24 assertions |
| `berichten.ts` | E-mail- en WhatsApp-concepten | 40 assertions |
| `werkbonVoorbereiding.ts` | Materiaallijst en urenschatting | 35 assertions |
| `planningAdvies.ts` | Vrije momenten per monteur | (idem) |
| `klantvragen.ts` | Antwoord uit dossier of kennisbank | 30 assertions |
| `integraties/` | Contracten voor agenda, e-mail, WhatsApp | 20 assertions |
| `agent.ts` | Orkestratie tot één werklijst | 25 assertions |

## Gebruik

Vanuit het dashboard: tabblad **Agent** → *Analyseer leads*.

Achter de schermen loopt dat via `POST /api/agent/analyse`. Die route:
- vereist een geldige dashboardsessie (het antwoord bevat klantgegevens, en de
  aanroep kost geld zodra er een taalmodel gekoppeld is);
- draait uitsluitend server-side, want daar wordt de modelsleutel gelezen;
- haalt leads, actieve producten en toekomstige planning op en geeft die door
  aan `draaiAgent`.

`draaiAgent` werkt alleen op gegevens die hij meekrijgt. Daardoor is de hele
werkstroom te controleren zonder database, en kan dezelfde logica later ook
vanuit een geplande taak draaien.

## Koppelingen aanzetten

Alle koppelingen zijn optioneel. Zonder sleutels blijft de agent volledig
werken; er komt dan alleen een concept dat een medewerker met de hand
overneemt. Zie `.env.example` voor de variabelen en de bestanden in
`integraties/` voor de precieze stappen per dienst.

| Koppeling | Nodig | Zonder koppeling |
|---|---|---|
| Taalmodel | `AI_PROVIDER` + API-sleutel | Sjabloonteksten |
| Google Calendar | Serviceaccount + agenda-id | Planner zet het zelf in de agenda |
| Gmail | Gmail API + afzender | Verloopt via Resend, of handmatig |
| WhatsApp Business | Meta phone number ID + token | Medewerker appt zelf |

## Grenzen

Wat deze agent bewust **niet** doet:

- Niets wegschrijven in de database.
- Niets versturen naar een klant.
- Reistijd tussen adressen inschatten. Zonder routeservice is dat niet te
  bepalen, en een schatting die ernaast zit geeft een monteur een planning die
  hij niet haalt. Wat wél meeweegt: werkt iemand die dag al in dezelfde plaats.
- Antwoorden verzinnen. Vindt hij geen bron, dan zegt hij dat en gaat de vraag
  naar een collega. Bij subsidiebedragen is een plausibel klinkend maar
  verzonnen antwoord schadelijker dan geen antwoord.
- Bedragen of datums in teksten laten bedenken door een taalmodel. Die worden
  vooraf ingevuld; het model krijgt ze mee als de enige toegestane bron.
