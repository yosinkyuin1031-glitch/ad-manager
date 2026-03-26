import { GoogleAdsConfig, ManualInputData, DailyMetrics, KPISettings, DEFAULT_KPI_SETTINGS, BudgetSettings, DEFAULT_BUDGET_SETTINGS, MonthlyReport } from "./types";

const STORAGE_KEYS = {
  config: "ad-manager-config",
  manualData: "ad-manager-manual-data",
  kpiSettings: "ad-manager-kpi-settings",
  budgetSettings: "ad-manager-budget-settings",
};

// Google広告設定
export function getAdsConfig(): GoogleAdsConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.config);
  return raw ? JSON.parse(raw) : null;
}

export function saveAdsConfig(config: GoogleAdsConfig) {
  localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(config));
}

// 手動入力データ
export function getManualData(): ManualInputData[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.manualData);
  return raw ? JSON.parse(raw) : [];
}

export function saveManualData(data: ManualInputData[]) {
  localStorage.setItem(STORAGE_KEYS.manualData, JSON.stringify(data));
}

export function addManualData(entry: ManualInputData) {
  const existing = getManualData();
  existing.push(entry);
  saveManualData(existing);
}

export function deleteManualData(index: number) {
  const existing = getManualData();
  existing.splice(index, 1);
  saveManualData(existing);
}

// KPI設定
export function getKPISettings(): KPISettings {
  if (typeof window === "undefined") return DEFAULT_KPI_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.kpiSettings);
  return raw ? { ...DEFAULT_KPI_SETTINGS, ...JSON.parse(raw) } : DEFAULT_KPI_SETTINGS;
}

export function saveKPISettings(settings: KPISettings) {
  localStorage.setItem(STORAGE_KEYS.kpiSettings, JSON.stringify(settings));
}

// 予算設定
export function getBudgetSettings(): BudgetSettings {
  if (typeof window === "undefined") return DEFAULT_BUDGET_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.budgetSettings);
  return raw ? { ...DEFAULT_BUDGET_SETTINGS, ...JSON.parse(raw) } : DEFAULT_BUDGET_SETTINGS;
}

export function saveBudgetSettings(settings: BudgetSettings) {
  localStorage.setItem(STORAGE_KEYS.budgetSettings, JSON.stringify(settings));
}

// 手動データからDailyMetricsに変換
export function manualDataToDailyMetrics(data: ManualInputData[]): DailyMetrics[] {
  const grouped: Record<string, DailyMetrics> = {};
  for (const d of data) {
    if (!grouped[d.date]) {
      grouped[d.date] = {
        date: d.date,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0,
        ctr: 0,
        cpc: 0,
        cvr: 0,
        cpa: 0,
      };
    }
    const g = grouped[d.date];
    g.impressions += d.impressions;
    g.clicks += d.clicks;
    g.conversions += d.conversions;
    g.cost += d.cost;
  }
  // 計算値を算出
  return Object.values(grouped)
    .map((g) => ({
      ...g,
      ctr: g.impressions > 0 ? (g.clicks / g.impressions) * 100 : 0,
      cpc: g.clicks > 0 ? g.cost / g.clicks : 0,
      cvr: g.clicks > 0 ? (g.conversions / g.clicks) * 100 : 0,
      cpa: g.conversions > 0 ? g.cost / g.conversions : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 月別レポート生成
export function generateMonthlyReports(data: ManualInputData[], avgRevenuePerVisit: number): MonthlyReport[] {
  const grouped: Record<string, ManualInputData[]> = {};
  for (const d of data) {
    const month = d.date.slice(0, 7); // "2026-03"
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(d);
  }

  return Object.entries(grouped)
    .map(([month, items]) => {
      const totalImpressions = items.reduce((s, d) => s + d.impressions, 0);
      const totalClicks = items.reduce((s, d) => s + d.clicks, 0);
      const totalConversions = items.reduce((s, d) => s + d.conversions, 0);
      const totalCost = items.reduce((s, d) => s + d.cost, 0);
      const estimatedRevenue = totalConversions * avgRevenuePerVisit;
      const roi = totalCost > 0 ? ((estimatedRevenue - totalCost) / totalCost) * 100 : 0;

      // キャンペーン別集計
      const campMap: Record<string, { cost: number; clicks: number; conversions: number }> = {};
      for (const d of items) {
        if (!campMap[d.campaignName]) campMap[d.campaignName] = { cost: 0, clicks: 0, conversions: 0 };
        campMap[d.campaignName].cost += d.cost;
        campMap[d.campaignName].clicks += d.clicks;
        campMap[d.campaignName].conversions += d.conversions;
      }

      return {
        month,
        totalCost,
        totalImpressions,
        totalClicks,
        totalConversions,
        avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        avgCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        avgCvr: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        avgCpa: totalConversions > 0 ? totalCost / totalConversions : 0,
        estimatedRevenue,
        roi,
        campaignBreakdown: Object.entries(campMap).map(([name, v]) => ({ name, ...v })),
      };
    })
    .sort((a, b) => b.month.localeCompare(a.month));
}
