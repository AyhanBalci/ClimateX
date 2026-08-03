import {
  GoogleAdsAccount,
  Campaign,
  AdGroup,
  KeywordRow,
  SearchTermRow,
  ResponsiveSearchAd,
} from '@/lib/agents/types'

// In productie: deze module wordt vervangen door een server-side proxy
// die de Google Ads API (google-ads-node / GAQL) bevraagt. Zie
// app/lib/agents/googleAdsApi.ts voor het integratiecontract.

export const ACCOUNTS: GoogleAdsAccount[] = [
  { id: 'acc-1', name: 'ClimateX — Nederland', customerId: '412-556-7890', currency: 'EUR' },
  { id: 'acc-2', name: 'ClimateX — België', customerId: '778-221-4453', currency: 'EUR' },
]

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'Airco Installatie — Search Brand',
    status: 'Actief',
    dailyBudget: 45,
    bidStrategy: 'Doel-ROAS',
    targetRoas: 6,
    clicks: 1284,
    impressions: 9840,
    cost: 1642.18,
    conversions: 96,
    conversionValue: 14832,
    service: 'Airco installatie',
    location: 'Randstad',
  },
  {
    id: 'c2',
    name: 'Airco Installatie — Search Generiek',
    status: 'Actief',
    dailyBudget: 120,
    bidStrategy: 'Doel-CPA',
    clicks: 5310,
    impressions: 88200,
    cost: 9874.55,
    conversions: 142,
    conversionValue: 21948,
    service: 'Airco installatie',
    location: 'Nationaal',
  },
  {
    id: 'c3',
    name: 'Onderhoud & Service Contracten',
    status: 'Actief',
    dailyBudget: 35,
    bidStrategy: 'Maximaliseer conversies',
    clicks: 1890,
    impressions: 24600,
    cost: 2114.30,
    conversions: 61,
    conversionValue: 7930,
    service: 'Onderhoudscontract',
    location: 'Nationaal',
  },
  {
    id: 'c4',
    name: 'Multi-split Systemen — Zakelijk',
    status: 'Actief',
    dailyBudget: 60,
    bidStrategy: 'Handmatige CPC',
    clicks: 742,
    impressions: 15680,
    cost: 3218.40,
    conversions: 9,
    conversionValue: 5940,
    service: 'Zakelijke airco',
    location: 'Randstad',
  },
  {
    id: 'c5',
    name: 'Warmtepomp Advies',
    status: 'Actief',
    dailyBudget: 25,
    bidStrategy: 'Maximaliseer klikken',
    clicks: 2140,
    impressions: 61200,
    cost: 1988.70,
    conversions: 14,
    conversionValue: 3220,
    service: 'Warmtepomp',
    location: 'Nationaal',
  },
  {
    id: 'c6',
    name: 'Airco Reparatie Spoed',
    status: 'Actief',
    dailyBudget: 20,
    bidStrategy: 'Maximaliseer conversies',
    clicks: 980,
    impressions: 7420,
    cost: 1104.60,
    conversions: 58,
    conversionValue: 8990,
    service: 'Reparatie',
    location: 'Nationaal',
  },
  {
    id: 'c7',
    name: 'Display — Remarketing',
    status: 'Gepauzeerd',
    dailyBudget: 15,
    bidStrategy: 'Handmatige CPC',
    clicks: 3040,
    impressions: 412000,
    cost: 612.10,
    conversions: 3,
    conversionValue: 447,
    service: 'Airco installatie',
    location: 'Nationaal',
  },
]

export const AD_GROUPS: AdGroup[] = [
  { id: 'ag1', campaignId: 'c2', name: 'Airco laten installeren', clicks: 2210, impressions: 34200, cost: 4310.80, conversions: 71, ctr: 6.46, avgCpc: 1.95 },
  { id: 'ag2', campaignId: 'c2', name: 'Split unit airco', clicks: 1840, impressions: 29800, cost: 3560.20, conversions: 52, ctr: 6.17, avgCpc: 1.93 },
  { id: 'ag3', campaignId: 'c2', name: 'Airco kopen', clicks: 1260, impressions: 24200, cost: 2003.55, conversions: 19, ctr: 5.20, avgCpc: 1.59 },
  { id: 'ag4', campaignId: 'c4', name: 'Multi-split kantoor', clicks: 412, impressions: 8420, cost: 1780.20, conversions: 6, ctr: 4.89, avgCpc: 4.32 },
  { id: 'ag5', campaignId: 'c4', name: 'VRF systemen bedrijfspand', clicks: 330, impressions: 7260, cost: 1438.20, conversions: 3, ctr: 4.55, avgCpc: 4.36 },
  { id: 'ag6', campaignId: 'c5', name: 'Warmtepomp subsidie', clicks: 1420, impressions: 38900, cost: 1298.40, conversions: 11, ctr: 3.65, avgCpc: 0.91 },
  { id: 'ag7', campaignId: 'c5', name: 'Hybride warmtepomp', clicks: 720, impressions: 22300, cost: 690.30, conversions: 3, ctr: 3.23, avgCpc: 0.96 },
]

export const KEYWORDS: KeywordRow[] = [
  { id: 'k1', campaignId: 'c2', adGroupId: 'ag1', keyword: 'airco laten installeren', matchType: 'Woordgroep', clicks: 640, impressions: 8900, cost: 1248.20, conversions: 34, qualityScore: 8, avgCpc: 1.95, status: 'Actief' },
  { id: 'k2', campaignId: 'c2', adGroupId: 'ag1', keyword: 'airco installatiebedrijf', matchType: 'Exact', clicks: 410, impressions: 5200, cost: 799.90, conversions: 22, qualityScore: 9, avgCpc: 1.95, status: 'Actief' },
  { id: 'k3', campaignId: 'c2', adGroupId: 'ag2', keyword: 'split airco unit', matchType: 'Woordgroep', clicks: 380, impressions: 6900, cost: 733.40, conversions: 12, qualityScore: 6, avgCpc: 1.93, status: 'Actief' },
  { id: 'k4', campaignId: 'c2', adGroupId: 'ag3', keyword: 'airco', matchType: 'Ruime targeting', clicks: 890, impressions: 21400, cost: 1415.10, conversions: 4, qualityScore: 3, avgCpc: 1.59, status: 'Aanbevolen: pauzeren' },
  { id: 'k5', campaignId: 'c2', adGroupId: 'ag3', keyword: 'goedkope airco', matchType: 'Ruime targeting', clicks: 510, impressions: 14200, cost: 810.90, conversions: 1, qualityScore: 3, avgCpc: 1.59, status: 'Aanbevolen: pauzeren' },
  { id: 'k6', campaignId: 'c4', adGroupId: 'ag4', keyword: 'multi split airco kantoor', matchType: 'Woordgroep', clicks: 210, impressions: 4100, cost: 907.20, conversions: 5, qualityScore: 7, avgCpc: 4.32, status: 'Actief' },
  { id: 'k7', campaignId: 'c4', adGroupId: 'ag5', keyword: 'vrf systeem bedrijfspand', matchType: 'Exact', clicks: 165, impressions: 3600, cost: 719.40, conversions: 3, qualityScore: 6, avgCpc: 4.36, status: 'Actief' },
  { id: 'k8', campaignId: 'c5', adGroupId: 'ag6', keyword: 'warmtepomp subsidie 2026', matchType: 'Woordgroep', clicks: 780, impressions: 19800, cost: 709.80, conversions: 9, qualityScore: 7, avgCpc: 0.91, status: 'Actief' },
  { id: 'k9', campaignId: 'c5', adGroupId: 'ag7', keyword: 'wat kost een warmtepomp', matchType: 'Ruime targeting', clicks: 520, impressions: 16700, cost: 499.20, conversions: 1, qualityScore: 4, avgCpc: 0.96, status: 'Aanbevolen: pauzeren' },
]

export const SEARCH_TERMS: SearchTermRow[] = [
  { id: 'st1', campaignId: 'c2', term: 'airco installatiebedrijf randstad', clicks: 84, cost: 163.80, conversions: 9, suggestion: 'toevoegen als zoekwoord' },
  { id: 'st2', campaignId: 'c2', term: 'airco zelf installeren handleiding', clicks: 112, cost: 178.10, conversions: 0, suggestion: 'uitsluiten (negatief)' },
  { id: 'st3', campaignId: 'c2', term: 'airco vacature monteur', clicks: 46, cost: 73.20, conversions: 0, suggestion: 'uitsluiten (negatief)' },
  { id: 'st4', campaignId: 'c2', term: 'daikin airco dealer', clicks: 61, cost: 118.90, conversions: 6, suggestion: 'toevoegen als zoekwoord' },
  { id: 'st5', campaignId: 'c5', term: 'warmtepomp subsidie aanvragen gemeente', clicks: 58, cost: 52.80, conversions: 4, suggestion: 'toevoegen als zoekwoord' },
  { id: 'st6', campaignId: 'c5', term: 'gratis warmtepomp folder', clicks: 39, cost: 35.40, conversions: 0, suggestion: 'uitsluiten (negatief)' },
  { id: 'st7', campaignId: 'c4', term: 'airco onderhoud contract kantoor', clicks: 22, cost: 95.10, conversions: 2, suggestion: 'toevoegen als zoekwoord' },
]

export const RSA_ADS: ResponsiveSearchAd[] = [
  {
    id: 'rsa1',
    campaignId: 'c2',
    adGroupId: 'ag1',
    headlines: ['Airco Laten Installeren', 'Erkend Installatiebedrijf', 'Binnen 1 Week Gemonteerd', 'Vraag Gratis Offerte Aan'],
    descriptions: ['Vakkundige installatie door F-gassen gecertificeerde monteurs.', 'Vaste prijs, geen verrassingen. Plan vandaag een adviesgesprek.'],
    ctr: 6.9,
    conversions: 34,
    strength: 'Uitstekend',
  },
  {
    id: 'rsa2',
    campaignId: 'c2',
    adGroupId: 'ag3',
    headlines: ['Airco Kopen', 'Ruim Assortiment', 'Scherpe Prijzen'],
    descriptions: ['Bekijk ons aanbod airconditioners voor woning en kantoor.'],
    ctr: 2.1,
    conversions: 4,
    strength: 'Slecht',
  },
  {
    id: 'rsa3',
    campaignId: 'c4',
    adGroupId: 'ag4',
    headlines: ['Multi-split Airco Zakelijk', 'Voor Kantoren En Bedrijfspanden', 'Offerte Op Maat', 'Landelijke Dekking'],
    descriptions: ['Complete klimaatoplossingen voor uw bedrijfspand.', 'Van advies tot onderhoud — één aanspreekpunt.'],
    ctr: 4.9,
    conversions: 5,
    strength: 'Goed',
  },
  {
    id: 'rsa4',
    campaignId: 'c5',
    adGroupId: 'ag6',
    headlines: ['Warmtepomp Subsidie 2026', 'Check Uw Voordeel', 'Gratis Adviesgesprek'],
    descriptions: ['Ontdek hoeveel subsidie u kunt ontvangen op een warmtepomp.'],
    ctr: 3.9,
    conversions: 9,
    strength: 'Gemiddeld',
  },
]

// Apparaat- en tijdstipverdeling (geaggregeerd, voor analysepagina)
export const DEVICE_BREAKDOWN = [
  { device: 'Mobiel', clicks: 8420, cost: 11240.30, conversions: 210, share: 0.61 },
  { device: 'Desktop', clicks: 4380, cost: 8120.10, conversions: 148, share: 0.32 },
  { device: 'Tablet', clicks: 980, cost: 1480.20, conversions: 15, share: 0.07 },
]

export const HOUR_OF_DAY = [
  { hour: '06-09', conversions: 18, cpa: 24.4 },
  { hour: '09-12', conversions: 62, cpa: 19.8 },
  { hour: '12-15', conversions: 54, cpa: 21.1 },
  { hour: '15-18', conversions: 71, cpa: 18.2 },
  { hour: '18-21', conversions: 88, cpa: 16.9 },
  { hour: '21-24', conversions: 24, cpa: 27.6 },
  { hour: '00-06', conversions: 3, cpa: 41.2 },
]

export const COMPETITION = [
  { metric: 'Impressiedeel (search)', value: '58%', trend: 'down' as const },
  { metric: 'Verlies impressiedeel (budget)', value: '19%', trend: 'up' as const },
  { metric: 'Verlies impressiedeel (rang)', value: '23%', trend: 'flat' as const },
  { metric: 'Gem. positie t.o.v. concurrenten', value: '#2 van 6', trend: 'flat' as const },
]

export const DAILY_TREND = Array.from({ length: 30 }).map((_, i) => {
  const day = i + 1
  const seasonal = 1 + 0.15 * Math.sin(i / 4)
  const cost = Math.round((520 + Math.random() * 180) * seasonal)
  const conv = Math.round((11 + Math.random() * 6) * seasonal)
  return { day: `${day}/07`, cost, conversions: conv, roas: +(((conv * 155) / cost) || 0).toFixed(2) }
})
