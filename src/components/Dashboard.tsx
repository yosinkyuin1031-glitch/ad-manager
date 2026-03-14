"use client";

import { useState } from "react";
import { DailyMetrics, ManualInputData } from "@/lib/types";

interface Props {
  metrics: DailyMetrics[];
  manualData: ManualInputData[];
}

export default function Dashboard({ metrics, manualData }: Props) {
  const [viewDays, setViewDays] = useState<7 | 30>(7);
  const [hoveredBar, setHoveredBar] = useState<{ index: number; type: string } | null>(null);

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

  // 期間データ
  const recentData = metrics.slice(-viewDays);
  const rCost = recentData.reduce((s, d) => s + d.cost, 0);
  const rClicks = recentData.reduce((s, d) => s + d.clicks, 0);
  const rConv = recentData.reduce((s, d) => s + d.conversions, 0);

  const kpiCards = [
    { label: "総表示回数", value: totalImpressions.toLocaleString(), sub: "回", color: "bg-blue-50 text-blue-700" },
    { label: "総クリック数", value: totalClicks.toLocaleString(), sub: "回", color: "bg-green-50 text-green-700" },
    { label: "総CV数", value: totalConversions.toLocaleString(), sub: "件", color: "bg-purple-50 text-purple-700" },
    { label: "総コスト", value: `¥${Math.round(totalCost).toLocaleString()}`, sub: "", color: "bg-red-50 text-red-700" },
    { label: "平均CTR", value: `${avgCtr.toFixed(2)}%`, sub: "目安3-5%", color: "bg-cyan-50 text-cyan-700" },
    { label: "平均CPC", value: `¥${Math.round(avgCpc).toLocaleString()}`, sub: "目安100-500円", color: "bg-orange-50 text-orange-700" },
    { label: "平均CVR", value: `${avgCvr.toFixed(2)}%`, sub: "目安3-8%", color: "bg-indigo-50 text-indigo-700" },
    { label: "平均CPA", value: totalConversions > 0 ? `¥${Math.round(avgCpa).toLocaleString()}` : "—", sub: totalConversions > 0 ? "目安3,000-10,000円" : "CV未発生", color: "bg-pink-50 text-pink-700" },
  ];

  // チャート用データ
  const chartData = recentData;
  const maxCost = Math.max(...chartData.map((m) => m.cost), 1);
  const maxClicks = Math.max(...chartData.map((m) => m.clicks), 1);
  const maxConv = Math.max(...chartData.map((m) => m.conversions), 1);

  // Y軸の目盛り計算
  const calcTicks = (max: number, count: number) => {
    const step = Math.ceil(max / count);
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(step * i);
    }
    return ticks;
  };

  const costTicks = calcTicks(maxCost, 4);
  const clickTicks = calcTicks(maxClicks, 4);

  // CSV Export
  const handleExportCSV = () => {
    if (manualData.length === 0) return;
    const headers = ["日付", "キャンペーン名", "表示回数", "クリック数", "CV数", "コスト(円)", "メモ"];
    const rows = manualData.map((d) => [
      d.date,
      d.campaignName,
      d.impressions,
      d.clicks,
      d.conversions,
      d.cost,
      d.memo || "",
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* CSV Export button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportCSV}
          disabled={manualData.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <span>📥</span> CSVエクスポート
        </button>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl p-4 ${kpi.color}`}>
            <p className="text-xs font-medium opacity-70">{kpi.label}</p>
            <p className="text-xl font-bold mt-1">{kpi.value}<span className="text-xs font-normal ml-1">{kpi.sub}</span></p>
          </div>
        ))}
      </div>

      {/* 期間サマリー */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">直近{viewDays}日間</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setViewDays(7)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${viewDays === 7 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              7日
            </button>
            <button
              onClick={() => setViewDays(30)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${viewDays === 30 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              30日
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">¥{Math.round(rCost).toLocaleString()}</p>
            <p className="text-xs text-gray-500">コスト</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{rClicks}</p>
            <p className="text-xs text-gray-500">クリック</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{rConv}</p>
            <p className="text-xs text-gray-500">CV</p>
          </div>
        </div>
      </div>

      {/* コストチャート */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">日別コスト推移</h3>
        <div className="relative" style={{ height: "220px" }}>
          {/* グリッド線とY軸ラベル */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ left: "60px", right: "8px", top: "0", bottom: "28px" }}>
            {costTicks.slice().reverse().map((tick, i) => (
              <div key={i} className="relative w-full">
                <div className="absolute border-t border-gray-100 w-full" />
                <span className="absolute text-[10px] text-gray-400" style={{ left: "-58px", top: "-6px" }}>¥{tick.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {/* バー */}
          <div className="absolute flex items-end gap-[2px]" style={{ left: "60px", right: "8px", bottom: "28px", top: "0" }}>
            {chartData.map((m, i) => {
              const height = maxCost > 0 ? (m.cost / maxCost) * 100 : 0;
              const isHovered = hoveredBar?.index === i && hoveredBar?.type === "cost";
              return (
                <div key={m.date} className="flex-1 flex flex-col items-center justify-end h-full relative"
                  onMouseEnter={() => setHoveredBar({ index: i, type: "cost" })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                      {m.date}<br />¥{Math.round(m.cost).toLocaleString()}
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t transition-all duration-150 ${isHovered ? "bg-red-400" : "bg-red-300"}`}
                    style={{ height: `${height}%`, minHeight: m.cost > 0 ? "2px" : "0" }}
                  />
                </div>
              );
            })}
          </div>
          {/* X軸ラベル */}
          <div className="absolute flex" style={{ left: "60px", right: "8px", bottom: "0", height: "24px" }}>
            {chartData.map((m, i) => (
              <div key={m.date} className="flex-1 text-center">
                {(chartData.length <= 10 || i % Math.ceil(chartData.length / 10) === 0) && (
                  <span className="text-[9px] text-gray-400">{m.date.slice(5)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* クリック & CVチャート */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">日別クリック・CV推移</h3>
        <div className="flex gap-4 text-xs mb-3">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-300"></span>クリック</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-purple-400"></span>CV</span>
        </div>
        <div className="relative" style={{ height: "220px" }}>
          {/* グリッド線とY軸ラベル */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ left: "40px", right: "8px", top: "0", bottom: "28px" }}>
            {clickTicks.slice().reverse().map((tick, i) => (
              <div key={i} className="relative w-full">
                <div className="absolute border-t border-gray-100 w-full" />
                <span className="absolute text-[10px] text-gray-400" style={{ left: "-38px", top: "-6px" }}>{tick}</span>
              </div>
            ))}
          </div>
          {/* バー */}
          <div className="absolute flex items-end gap-[2px]" style={{ left: "40px", right: "8px", bottom: "28px", top: "0" }}>
            {chartData.map((m, i) => {
              const clickHeight = maxClicks > 0 ? (m.clicks / maxClicks) * 100 : 0;
              const convHeight = maxConv > 0 ? (m.conversions / maxConv) * 100 : 0;
              const isHovered = hoveredBar?.index === i && hoveredBar?.type === "click";
              return (
                <div key={m.date} className="flex-1 flex items-end justify-center gap-[1px] h-full relative"
                  onMouseEnter={() => setHoveredBar({ index: i, type: "click" })}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                      {m.date}<br />クリック: {m.clicks} / CV: {m.conversions}
                    </div>
                  )}
                  <div
                    className={`flex-1 rounded-t transition-all duration-150 ${isHovered ? "bg-green-400" : "bg-green-300"}`}
                    style={{ height: `${clickHeight}%`, minHeight: m.clicks > 0 ? "2px" : "0" }}
                  />
                  <div
                    className={`flex-1 rounded-t transition-all duration-150 ${isHovered ? "bg-purple-500" : "bg-purple-400"}`}
                    style={{ height: `${convHeight}%`, minHeight: m.conversions > 0 ? "2px" : "0" }}
                  />
                </div>
              );
            })}
          </div>
          {/* X軸ラベル */}
          <div className="absolute flex" style={{ left: "40px", right: "8px", bottom: "0", height: "24px" }}>
            {chartData.map((m, i) => (
              <div key={m.date} className="flex-1 text-center">
                {(chartData.length <= 10 || i % Math.ceil(chartData.length / 10) === 0) && (
                  <span className="text-[9px] text-gray-400">{m.date.slice(5)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 日別推移テーブル */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">日別データ一覧</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
            <span className="col-span-2">日付</span>
            <span className="col-span-1 text-right">表示</span>
            <span className="col-span-2 text-right">コスト</span>
            <span className="col-span-1 text-right">クリック</span>
            <span className="col-span-1 text-right">CV</span>
            <span className="col-span-1 text-right">CTR</span>
            <span className="col-span-1 text-right">CPC</span>
            <span className="col-span-1 text-right">CVR</span>
            <span className="col-span-2 text-right">CPA</span>
          </div>
          {metrics.slice().reverse().map((m) => {
            const cpaDisplay = m.conversions > 0 ? `¥${Math.round(m.cpa).toLocaleString()}` : "—";
            return (
              <div key={m.date} className="grid grid-cols-12 gap-2 text-xs items-center px-1 py-1.5 hover:bg-gray-50 rounded">
                <span className="col-span-2 font-medium text-gray-700">{m.date.slice(5)}</span>
                <span className="col-span-1 text-right text-gray-600">{m.impressions.toLocaleString()}</span>
                <span className="col-span-2 text-right text-gray-600">¥{Math.round(m.cost).toLocaleString()}</span>
                <span className="col-span-1 text-right text-gray-600">{m.clicks}</span>
                <span className="col-span-1 text-right font-medium text-purple-600">{m.conversions}</span>
                <span className="col-span-1 text-right text-gray-600">{m.ctr.toFixed(1)}%</span>
                <span className="col-span-1 text-right text-gray-600">¥{Math.round(m.cpc)}</span>
                <span className="col-span-1 text-right text-gray-600">{m.cvr.toFixed(1)}%</span>
                <span className="col-span-2 text-right text-gray-600">{cpaDisplay}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
