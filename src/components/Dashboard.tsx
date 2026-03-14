"use client";

import { DailyMetrics } from "@/lib/types";

interface Props {
  metrics: DailyMetrics[];
}

export default function Dashboard({ metrics }: Props) {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">📊</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">データがありません</h2>
        <p className="text-sm text-gray-500">
          「手動入力」タブからデータを入力するか、CSVをインポートしてください
        </p>
      </div>
    );
  }

  // 集計
  const totalImpressions = metrics.reduce((s, d) => s + d.impressions, 0);
  const totalClicks = metrics.reduce((s, d) => s + d.clicks, 0);
  const totalConversions = metrics.reduce((s, d) => s + d.conversions, 0);
  const totalCost = metrics.reduce((s, d) => s + d.cost, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0;
  const avgCvr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const avgCpa = totalConversions > 0 ? totalCost / totalConversions : 0;

  // 直近7日
  const recent7 = metrics.slice(-7);
  const r7Cost = recent7.reduce((s, d) => s + d.cost, 0);
  const r7Clicks = recent7.reduce((s, d) => s + d.clicks, 0);
  const r7Conv = recent7.reduce((s, d) => s + d.conversions, 0);

  const kpiCards = [
    { label: "総表示回数", value: totalImpressions.toLocaleString(), sub: "回", color: "bg-blue-50 text-blue-700" },
    { label: "総クリック数", value: totalClicks.toLocaleString(), sub: "回", color: "bg-green-50 text-green-700" },
    { label: "総CV数", value: totalConversions.toLocaleString(), sub: "件", color: "bg-purple-50 text-purple-700" },
    { label: "総コスト", value: `¥${Math.round(totalCost).toLocaleString()}`, sub: "", color: "bg-red-50 text-red-700" },
    { label: "平均CTR", value: `${avgCtr.toFixed(2)}%`, sub: "目安3-5%", color: "bg-cyan-50 text-cyan-700" },
    { label: "平均CPC", value: `¥${Math.round(avgCpc).toLocaleString()}`, sub: "目安100-500円", color: "bg-orange-50 text-orange-700" },
    { label: "平均CVR", value: `${avgCvr.toFixed(2)}%`, sub: "目安3-8%", color: "bg-indigo-50 text-indigo-700" },
    { label: "平均CPA", value: `¥${Math.round(avgCpa).toLocaleString()}`, sub: "目安3,000-10,000円", color: "bg-pink-50 text-pink-700" },
  ];

  // 簡易バーチャート用
  const maxCost = Math.max(...metrics.map((m) => m.cost), 1);
  const maxClicks = Math.max(...metrics.map((m) => m.clicks), 1);

  return (
    <div className="space-y-6">
      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-4 ${kpi.color}`}>
            <p className="text-xs font-medium opacity-70">{kpi.label}</p>
            <p className="text-xl font-bold mt-1">{kpi.value}<span className="text-xs font-normal ml-1">{kpi.sub}</span></p>
          </div>
        ))}
      </div>

      {/* 直近7日サマリー */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">直近7日間</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">¥{Math.round(r7Cost).toLocaleString()}</p>
            <p className="text-xs text-gray-500">コスト</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{r7Clicks}</p>
            <p className="text-xs text-gray-500">クリック</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{r7Conv}</p>
            <p className="text-xs text-gray-500">CV</p>
          </div>
        </div>
      </div>

      {/* 日別推移（簡易バー） */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">日別推移</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
            <span className="col-span-2">日付</span>
            <span className="col-span-3">コスト</span>
            <span className="col-span-3">クリック</span>
            <span className="col-span-1 text-right">CV</span>
            <span className="col-span-1 text-right">CTR</span>
            <span className="col-span-1 text-right">CPC</span>
            <span className="col-span-1 text-right">CVR</span>
          </div>
          {metrics.slice().reverse().map((m) => (
            <div key={m.date} className="grid grid-cols-12 gap-2 text-xs items-center px-1 py-1.5 hover:bg-gray-50 rounded">
              <span className="col-span-2 font-medium text-gray-700">{m.date.slice(5)}</span>
              <div className="col-span-3 flex items-center gap-1">
                <div className="h-3 bg-red-200 rounded" style={{ width: `${(m.cost / maxCost) * 100}%`, minWidth: "2px" }} />
                <span className="text-gray-600">¥{Math.round(m.cost).toLocaleString()}</span>
              </div>
              <div className="col-span-3 flex items-center gap-1">
                <div className="h-3 bg-green-200 rounded" style={{ width: `${(m.clicks / maxClicks) * 100}%`, minWidth: "2px" }} />
                <span className="text-gray-600">{m.clicks}</span>
              </div>
              <span className="col-span-1 text-right font-medium text-purple-600">{m.conversions}</span>
              <span className="col-span-1 text-right text-gray-600">{m.ctr.toFixed(1)}%</span>
              <span className="col-span-1 text-right text-gray-600">¥{Math.round(m.cpc)}</span>
              <span className="col-span-1 text-right text-gray-600">{m.cvr.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
