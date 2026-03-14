import { AdCheckResult, ManualInputData, DailyMetrics, KPISettings, DEFAULT_KPI_SETTINGS } from "./types";

// 整体院・鍼灸院向けの広告チェックロジック
export function checkAdPerformance(
  dailyMetrics: DailyMetrics[],
  manualData: ManualInputData[],
  kpi: KPISettings = DEFAULT_KPI_SETTINGS
): AdCheckResult[] {
  const results: AdCheckResult[] = [];

  if (dailyMetrics.length === 0) {
    results.push({
      type: "suggestion",
      category: "データ",
      title: "データがありません",
      detail: "手動入力タブからデータを入力するか、CSVをインポートしてください。",
      impact: "high",
    });
    return results;
  }

  // 全体の集計
  const totalImpressions = dailyMetrics.reduce((s, d) => s + d.impressions, 0);
  const totalClicks = dailyMetrics.reduce((s, d) => s + d.clicks, 0);
  const totalConversions = dailyMetrics.reduce((s, d) => s + d.conversions, 0);
  const totalCost = dailyMetrics.reduce((s, d) => s + d.cost, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const avgCvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const avgCpa = totalConversions > 0 ? totalCost / totalConversions : 0;

  // 1. CTRチェック
  if (avgCtr < kpi.ctr_warn) {
    results.push({
      type: "error",
      category: "CTR（クリック率）",
      title: `CTRが非常に低い: ${avgCtr.toFixed(2)}%`,
      detail: `CTR目安は${kpi.ctr_good}%以上です。広告文の見直し、キーワードの絞り込み、広告表示オプション（電話番号・サイトリンク等）の追加を検討してください。`,
      impact: "high",
    });
  } else if (avgCtr < kpi.ctr_good) {
    results.push({
      type: "warning",
      category: "CTR（クリック率）",
      title: `CTRがやや低い: ${avgCtr.toFixed(2)}%`,
      detail: "CTRの改善余地があります。広告見出しに「地域名+症状名」を入れる、限定感のある表現を試すと効果的です。",
      impact: "medium",
    });
  } else {
    results.push({
      type: "good",
      category: "CTR（クリック率）",
      title: `CTRは良好: ${avgCtr.toFixed(2)}%`,
      detail: "広告文がユーザーに適切に訴求できています。",
      impact: "low",
    });
  }

  // 2. CPCチェック
  if (avgCpc > kpi.cpc_bad) {
    results.push({
      type: "error",
      category: "CPC（クリック単価）",
      title: `クリック単価が高い: ¥${Math.round(avgCpc)}`,
      detail: `CPC目安は¥${kpi.cpc_warn}以下です。ロングテールキーワードの追加や、除外キーワード設定を検討してください。`,
      impact: "high",
    });
  } else if (avgCpc > kpi.cpc_warn) {
    results.push({
      type: "warning",
      category: "CPC（クリック単価）",
      title: `クリック単価がやや高め: ¥${Math.round(avgCpc)}`,
      detail: "入札戦略の見直しや、品質スコア改善でCPC低減が可能です。",
      impact: "medium",
    });
  } else {
    results.push({
      type: "good",
      category: "CPC（クリック単価）",
      title: `クリック単価は適正: ¥${Math.round(avgCpc)}`,
      detail: "効率的にクリックを獲得できています。",
      impact: "low",
    });
  }

  // 3. CVRチェック
  if (totalClicks >= 50) {
    if (avgCvr < kpi.cvr_warn) {
      results.push({
        type: "error",
        category: "CVR（コンバージョン率）",
        title: `CVRが非常に低い: ${avgCvr.toFixed(2)}%`,
        detail: `CVR目安は${kpi.cvr_good}%以上です。LP改善、CTA配置、口コミ掲載、予約フォームの簡素化を検討してください。`,
        impact: "high",
      });
    } else if (avgCvr < kpi.cvr_good) {
      results.push({
        type: "warning",
        category: "CVR（コンバージョン率）",
        title: `CVRに改善余地あり: ${avgCvr.toFixed(2)}%`,
        detail: "LPのファーストビュー改善、CTA配置見直し、患者インタビュー動画の追加が効果的です。",
        impact: "medium",
      });
    } else {
      results.push({
        type: "good",
        category: "CVR（コンバージョン率）",
        title: `CVRは良好: ${avgCvr.toFixed(2)}%`,
        detail: "LPとキーワードの一致度が高く、効率的に予約獲得できています。",
        impact: "low",
      });
    }
  }

  // 4. CPAチェック
  if (totalConversions > 0) {
    if (avgCpa > kpi.cpa_bad) {
      results.push({
        type: "error",
        category: "CPA（獲得単価）",
        title: `獲得単価が非常に高い: ¥${Math.round(avgCpa)}`,
        detail: `CPA目安は¥${kpi.cpa_warn.toLocaleString()}以下です。キーワード見直し、LP改善、予約導線の最適化が急務です。`,
        impact: "high",
      });
    } else if (avgCpa > kpi.cpa_warn) {
      results.push({
        type: "warning",
        category: "CPA（獲得単価）",
        title: `獲得単価がやや高め: ¥${Math.round(avgCpa)}`,
        detail: `CPA目安は¥${kpi.cpa_warn.toLocaleString()}以下です。リピート率が高ければ許容範囲ですが改善の余地があります。`,
        impact: "medium",
      });
    } else {
      results.push({
        type: "good",
        category: "CPA（獲得単価）",
        title: `獲得単価は適正: ¥${Math.round(avgCpa)}`,
        detail: "効率的に予約を獲得できています。",
        impact: "low",
      });
    }
  }

  // 5. 日別トレンドチェック
  if (dailyMetrics.length >= 7) {
    const recent7 = dailyMetrics.slice(-7);
    const prev7 = dailyMetrics.slice(-14, -7);
    if (prev7.length >= 7) {
      const recentCost = recent7.reduce((s, d) => s + d.cost, 0);
      const prevCost = prev7.reduce((s, d) => s + d.cost, 0);
      const recentConv = recent7.reduce((s, d) => s + d.conversions, 0);
      const prevConv = prev7.reduce((s, d) => s + d.conversions, 0);

      if (prevConv > 0 && recentConv < prevConv * 0.5) {
        results.push({
          type: "error",
          category: "トレンド",
          title: "直近7日間のCV数が大幅減少",
          detail: `前週${prevConv}件→今週${recentConv}件。広告の設定変更、予算消化状況、競合の動きを確認してください。`,
          impact: "high",
        });
      }

      if (prevCost > 0 && recentCost > prevCost * 1.5) {
        results.push({
          type: "warning",
          category: "トレンド",
          title: "直近7日間のコストが急増",
          detail: `前週¥${Math.round(prevCost)}→今週¥${Math.round(recentCost)}。予算上限の確認と、無駄なクリックの除外キーワード追加を検討してください。`,
          impact: "medium",
        });
      }
    }
  }

  // 6. キャンペーン別チェック
  const campaigns = new Map<string, { impressions: number; clicks: number; conversions: number; cost: number }>();
  for (const d of manualData) {
    const existing = campaigns.get(d.campaignName) || { impressions: 0, clicks: 0, conversions: 0, cost: 0 };
    existing.impressions += d.impressions;
    existing.clicks += d.clicks;
    existing.conversions += d.conversions;
    existing.cost += d.cost;
    campaigns.set(d.campaignName, existing);
  }

  for (const [name, data] of campaigns) {
    if (data.clicks > 20 && data.conversions === 0) {
      results.push({
        type: "error",
        category: "キャンペーン",
        title: `「${name}」がCV0件`,
        detail: `${data.clicks}クリック・¥${Math.round(data.cost)}消化してCVが0件です。停止または大幅な改善を検討してください。`,
        impact: "high",
      });
    }
  }

  return results;
}

// AI広告文チェック用のプロンプト生成
export function generateAdCopyCheckPrompt(
  adText: string,
  targetArea: string,
  targetSymptom: string,
  clinicName: string
): string {
  return `あなたは整体院・治療院のリスティング広告の専門コンサルタントです。

以下の広告文を分析し、改善点を具体的に指摘してください。

【広告文】
${adText}

【対象情報】
- 院名: ${clinicName}
- エリア: ${targetArea}
- 対象症状: ${targetSymptom}

以下の観点で分析してください：

1. **見出しの訴求力** - 地域名・症状名が入っているか、クリックしたくなるか
2. **説明文の説得力** - 具体的な数字、実績、差別化ポイントがあるか
3. **キーワードとの関連性** - 品質スコアが高くなりそうか
4. **CTA（行動喚起）** - 予約・電話への誘導が明確か
5. **規約違反リスク** - 誇大表現、「治る」等のNG表現がないか
6. **改善提案** - 具体的な改善後の広告文案を3パターン提示

JSON形式で回答してください：
{
  "overallScore": 1-10の評価点,
  "strengths": ["良い点1", "良い点2"],
  "weaknesses": ["改善点1", "改善点2"],
  "riskFlags": ["リスク1"],
  "suggestions": [
    {"headline": "改善見出し", "description": "改善説明文", "reason": "改善理由"}
  ]
}`;
}
