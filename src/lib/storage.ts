import { GoogleAdsConfig, ManualInputData, DailyMetrics } from "./types";

const STORAGE_KEYS = {
  config: "ad-manager-config",
  manualData: "ad-manager-manual-data",
  anthropicKey: "ad-manager-anthropic-key",
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

// Anthropic APIキー
export function getAnthropicKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.anthropicKey) || "";
}

export function saveAnthropicKey(key: string) {
  localStorage.setItem(STORAGE_KEYS.anthropicKey, key);
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
