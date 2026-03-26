"use client";

import { useState, useEffect } from "react";
import { ManualInputData, MonthlyReport, BudgetSettings, DEFAULT_BUDGET_SETTINGS } from "@/lib/types";
import { getBudgetSettings, generateMonthlyReports } from "@/lib/storage";

interface Props {
  manualData: ManualInputData[];
}

export default function MonthlyReportTab({ manualData }: Props) {
  const [budget, setBudget] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    setBudget(getBudgetSettings());
  }, []);

  const reports = generateMonthlyReports(manualData, budget.avgRevenuePerVisit);

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">📋</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">レポートデータがありません</h2>
        <p className="text-sm text-gray-500">
          「手動入力」タブからデータを入力してください
        </p>
      </div>
    );
  }

  const selected = selectedMonth
    ? reports.find((r) => r.month === selectedMonth) || reports[0]
    : reports[0];

  // レポートCSVエクスポート
  const handleExportReportCSV = (report: MonthlyReport) => {
    const headers = ["月", "総広告費", "表示回数", "クリック数", "CV数", "CTR(%)", "CPC(円)", "CVR(%)", "CPA(円)", "推定売上", "ROI(%)"];
    const row = [
      report.month,
      Math.round(report.totalCost),
      report.totalImpressions,
      report.totalClicks,
      report.totalConversions,
      report.avgCtr.toFixed(2),
      Math.round(report.avgCpc),
      report.avgCvr.toFixed(2),
      Math.round(report.avgCpa),
      Math.round(report.estimatedRevenue),
      Math.round(report.roi),
    ];

    // キャンペーン別データも追加
    const campHeaders = ["", "キャンペーン名", "コスト(円)", "クリック数", "CV数"];
    const campRows = report.campaignBreakdown.map((c) => [
      "",
      c.name,
      Math.round(c.cost),
      c.clicks,
      c.conversions,
    ]);

    const bom = "\uFEFF";
    const lines = [
      headers.join(","),
      row.join(","),
      "",
      campHeaders.join(","),
      ...campRows.map((r) => r.join(",")),
    ];
    const csv = bom + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-report-${report.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 全月一括CSVエクスポート
  const handleExportAllCSV = () => {
    const headers = ["月", "総広告費", "表示回数", "クリック数", "CV数", "CTR(%)", "CPC(円)", "CVR(%)", "CPA(円)", "推定売上", "ROI(%)"];
    const rows = reports.map((r) => [
      r.month,
      Math.round(r.totalCost),
      r.totalImpressions,
      r.totalClicks,
      r.totalConversions,
      r.avgCtr.toFixed(2),
      Math.round(r.avgCpc),
      r.avgCvr.toFixed(2),
      Math.round(r.avgCpa),
      Math.round(r.estimatedRevenue),
      Math.round(r.roi),
    ]);

    const bom = "\uFEFF";
    const csv = bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-monthly-reports-all.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roiColor = (roi: number) => roi >= 100 ? "text-green-700" : roi >= 0 ? "text-blue-700" : "text-red-700";
  const roiBg = (roi: number) => roi >= 100 ? "bg-green-50" : roi >= 0 ? "bg-blue-50" : "bg-red-50";

  return (
    <div className="space-y-6">
      {/* 月選択 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {reports.map((r) => (
            <button
              key={r.month}
              onClick={() => setSelectedMonth(r.month)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selected.month === r.month
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r.month}
            </button>
          ))}
        </div>
        <button
          onClick={handleExportAllCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          全月CSV
        </button>
      </div>

      {/* 選択月のサマリー */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">{selected.month} 月次レポート</h3>
          <button
            onClick={() => handleExportReportCSV(selected)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100"
          >
            CSVエクスポート
          </button>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-[10px] text-red-600 font-medium">広告費</p>
            <p className="text-lg font-bold text-red-700">¥{Math.round(selected.totalCost).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-[10px] text-blue-600 font-medium">来院数(CV)</p>
            <p className="text-lg font-bold text-blue-700">{selected.totalConversions}<span className="text-xs ml-1">件</span></p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-[10px] text-purple-600 font-medium">推定売上</p>
            <p className="text-lg font-bold text-purple-700">¥{Math.round(selected.estimatedRevenue).toLocaleString()}</p>
          </div>
          <div className={`rounded-lg p-3 ${roiBg(selected.roi)}`}>
            <p className={`text-[10px] font-medium ${roiColor(selected.roi)}`}>ROI</p>
            <p className={`text-lg font-bold ${roiColor(selected.roi)}`}>
              {selected.roi >= 0 ? "+" : ""}{Math.round(selected.roi)}%
            </p>
          </div>
        </div>

        {/* 詳細KPI */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500">表示回数</p>
            <p className="text-sm font-bold text-gray-700">{selected.totalImpressions.toLocaleString()}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500">クリック数</p>
            <p className="text-sm font-bold text-gray-700">{selected.totalClicks.toLocaleString()}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500">CTR</p>
            <p className="text-sm font-bold text-gray-700">{selected.avgCtr.toFixed(2)}%</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500">CPA</p>
            <p className="text-sm font-bold text-gray-700">
              {selected.totalConversions > 0 ? `¥${Math.round(selected.avgCpa).toLocaleString()}` : "---"}
            </p>
          </div>
        </div>

        {/* 利益サマリー */}
        <div className={`p-4 rounded-lg ${roiBg(selected.roi)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">利益（推定売上 - 広告費）</p>
              <p className={`text-xl font-bold ${roiColor(selected.roi)}`}>
                ¥{Math.round(selected.estimatedRevenue - selected.totalCost).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">来院単価設定</p>
              <p className="text-sm font-medium text-gray-700">¥{budget.avgRevenuePerVisit.toLocaleString()}/件</p>
            </div>
          </div>
        </div>
      </div>

      {/* キャンペーン別内訳 */}
      {selected.campaignBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">キャンペーン別内訳</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 px-1">キャンペーン</th>
                  <th className="text-right py-2 px-1">コスト</th>
                  <th className="text-right py-2 px-1">クリック</th>
                  <th className="text-right py-2 px-1">CV</th>
                  <th className="text-right py-2 px-1">CPA</th>
                  <th className="text-right py-2 px-1">コスト比率</th>
                </tr>
              </thead>
              <tbody>
                {selected.campaignBreakdown
                  .sort((a, b) => b.cost - a.cost)
                  .map((c) => {
                    const cpa = c.conversions > 0 ? Math.round(c.cost / c.conversions) : 0;
                    const costRatio = selected.totalCost > 0 ? (c.cost / selected.totalCost) * 100 : 0;
                    return (
                      <tr key={c.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-1 text-gray-700 max-w-40 truncate">{c.name}</td>
                        <td className="py-2 px-1 text-right">¥{Math.round(c.cost).toLocaleString()}</td>
                        <td className="py-2 px-1 text-right">{c.clicks.toLocaleString()}</td>
                        <td className="py-2 px-1 text-right font-medium text-purple-600">{c.conversions}</td>
                        <td className="py-2 px-1 text-right">{cpa > 0 ? `¥${cpa.toLocaleString()}` : "---"}</td>
                        <td className="py-2 px-1 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${costRatio}%` }} />
                            </div>
                            <span>{Math.round(costRatio)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 月別一覧テーブル */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">月別サマリー一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 px-1">月</th>
                <th className="text-right py-2 px-1">広告費</th>
                <th className="text-right py-2 px-1">CV</th>
                <th className="text-right py-2 px-1">推定売上</th>
                <th className="text-right py-2 px-1">ROI</th>
                <th className="text-right py-2 px-1">CPA</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.month}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selected.month === r.month ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedMonth(r.month)}
                >
                  <td className="py-2 px-1 font-medium text-gray-700">{r.month}</td>
                  <td className="py-2 px-1 text-right">¥{Math.round(r.totalCost).toLocaleString()}</td>
                  <td className="py-2 px-1 text-right font-medium text-purple-600">{r.totalConversions}</td>
                  <td className="py-2 px-1 text-right">¥{Math.round(r.estimatedRevenue).toLocaleString()}</td>
                  <td className={`py-2 px-1 text-right font-medium ${roiColor(r.roi)}`}>
                    {r.roi >= 0 ? "+" : ""}{Math.round(r.roi)}%
                  </td>
                  <td className="py-2 px-1 text-right">
                    {r.totalConversions > 0 ? `¥${Math.round(r.avgCpa).toLocaleString()}` : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
