export interface GoogleAdsConfig {
  customerId: string; // Google広告アカウントID
  developerToken?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface CampaignData {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  budget: number;
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // クリック率
  cpc: number; // クリック単価
  cvr: number; // コンバージョン率
  cpa: number; // 獲得単価
  date: string;
}

export interface AdGroupData {
  id: string;
  campaignId: string;
  campaignName: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  cvr: number;
}

export interface AdData {
  id: string;
  adGroupId: string;
  adGroupName: string;
  campaignName: string;
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  qualityScore?: number;
}

export interface KeywordData {
  id: string;
  adGroupName: string;
  campaignName: string;
  keyword: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  status: "ENABLED" | "PAUSED" | "REMOVED";
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  qualityScore?: number;
  searchImpressionShare?: number;
}

export interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  cvr: number;
  cpa: number;
}

export interface AdCheckResult {
  type: "warning" | "error" | "suggestion" | "good";
  category: string;
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
}

export interface ManualInputData {
  date: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  memo?: string;
}

export interface KPISettings {
  ctr_good: number;    // CTR良好ライン (%)
  ctr_warn: number;    // CTR警告ライン (%)
  cpc_warn: number;    // CPC警告ライン (円)
  cpc_bad: number;     // CPC危険ライン (円)
  cvr_good: number;    // CVR良好ライン (%)
  cvr_warn: number;    // CVR警告ライン (%)
  cpa_warn: number;    // CPA警告ライン (円)
  cpa_bad: number;     // CPA危険ライン (円)
}

export const DEFAULT_KPI_SETTINGS: KPISettings = {
  ctr_good: 3,
  ctr_warn: 2,
  cpc_warn: 300,
  cpc_bad: 500,
  cvr_good: 4,
  cvr_warn: 2,
  cpa_warn: 8000,
  cpa_bad: 15000,
};

export interface BudgetSettings {
  monthlyBudget: number;       // 月額予算（円）
  alertThreshold: number;      // アラート閾値（%）例: 80 → 80%で通知
  avgRevenuePerVisit: number;  // 来院1件あたり平均売上（円）
}

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  monthlyBudget: 100000,
  alertThreshold: 80,
  avgRevenuePerVisit: 8000,
};

export interface MonthlyReport {
  month: string;             // "2026-03"
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCvr: number;
  avgCpa: number;
  estimatedRevenue: number;
  roi: number;               // (売上 - 広告費) / 広告費 * 100
  campaignBreakdown: Array<{
    name: string;
    cost: number;
    clicks: number;
    conversions: number;
  }>;
}

export type TabType = "dashboard" | "roi" | "report" | "check" | "manual" | "settings";
