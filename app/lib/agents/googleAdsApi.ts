import { Campaign, GoogleAdsAccount } from '@/lib/agents/types'

/**
 * GOOGLE ADS API — INTEGRATIECONTRACT
 * ────────────────────────────────────
 * De Google Ads API kan NIET rechtstreeks vanuit de browser worden
 * aangeroepen: authenticatie vereist een OAuth2 refresh token + developer
 * token die nooit client-side mogen staan, en Google's CORS-beleid
 * blokkeert directe requests vanaf een front-end.
 *
 * Architectuur voor productie:
 *
 *   Browser (dit dashboard)
 *        │  fetch('/api/google-ads/campaigns?accountId=...')
 *        ▼
 *   Server-side proxy (Next.js Route Handler, zie app/api/)
 *        │  google-ads-api (npm) of GAQL via REST
 *        │  gebruikt developer token + OAuth refresh token per klant
 *        ▼
 *   Google Ads API
 *
 * Stappen om dit te activeren:
 * 1. Vraag een Google Ads developer token aan (Basic of Standard access).
 * 2. Zet OAuth2 op met "offline access" zodat je een refresh token per
 *    gekoppeld account bewaart (versleuteld, server-side).
 * 3. Bouw een Route Handler (app/api/google-ads/.../route.ts) die
 *    GAQL-queries uitvoert, bijvoorbeeld:
 *      SELECT campaign.id, campaign.name, metrics.clicks,
 *             metrics.cost_micros, metrics.conversions,
 *             metrics.conversions_value
 *      FROM campaign
 *      WHERE segments.date DURING LAST_30_DAYS
 * 4. Vervang de functies hieronder door fetch()-aanroepen naar die
 *    endpoints. De return-types blijven identiek, dus de rest van het
 *    dashboard (KPI's, grafieken, aanbevelingen) hoeft niet te wijzigen.
 * 5. Voor meerdere accounts: gebruik een Google Ads "manager account"
 *    (MCC) en itereer over gekoppelde customer ID's via
 *    CustomerService.ListAccessibleCustomers.
 */

export interface GoogleAdsApiClient {
  listAccounts(): Promise<GoogleAdsAccount[]>
  getCampaigns(accountId: string, dateRange: { from: string; to: string }): Promise<Campaign[]>
  applyChange(accountId: string, change: PendingChange): Promise<{ success: boolean; message: string }>
}

export interface PendingChange {
  type: 'budget' | 'keyword_pause' | 'negative_keyword' | 'add_keyword' | 'ad_update'
  campaignId: string
  payload: Record<string, unknown>
}

/**
 * Mock-implementatie voor deze demo-omgeving. Retourneert de statische
 * mock-data uit app/lib/agents/data/mockGoogleAds.ts zodat het dashboard
 * zonder backend te bekijken en te testen is.
 */
export function createMockClient(): GoogleAdsApiClient {
  return {
    async listAccounts() {
      const { ACCOUNTS } = await import('@/lib/agents/data/mockGoogleAds')
      return ACCOUNTS
    },
    async getCampaigns() {
      const { CAMPAIGNS } = await import('@/lib/agents/data/mockGoogleAds')
      return CAMPAIGNS
    },
    async applyChange(_accountId, change) {
      // Belangrijk: de AI mag NOOIT automatisch wijzigingen doorvoeren.
      // Deze functie wordt alleen aangeroepen nadat een gebruiker expliciet
      // op "Toepassen" heeft geklikt in de Optimalisaties-pagina.
      console.info('Wijziging goedgekeurd door gebruiker, klaar om te verzenden naar Google Ads API:', change)
      return { success: true, message: 'Wijziging verwerkt (demo-modus, geen echte API-call).' }
    },
  }
}
