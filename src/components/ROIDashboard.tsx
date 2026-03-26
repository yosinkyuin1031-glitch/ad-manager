"use client";

import { useState, useEffect } from "react";
import { ManualInputData, BudgetSettings, DEFAULT_BUDGET_SETTINGS } from "@/lib/types";
import { getBudgetSettings, generateMonthlyReports } from "@/lib/storage";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface Props {
  manualData: ManualInputData[];
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function ROIDashboard({ manualData }: Props) {
  const [budget, setBudget] = useState<BudgetSettings>(DEFAULT_BUDGET_SETTINGS);

  useEffect(() => {
    setBudget(getBudgetSettings());
  }, []);

  const reports = generateMonthlyReports(manualData, budget.avgRevenuePerVisit);

  if (manualData.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4">📈</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">ROIデータがありません</h2>
        <p className="text-sm text-gray-500">
          「手動入力」タブからデータを入力してください
        </p>
      </div>
    );
  }

  // 月別のROI推移データ（時系列順）
  const roiChartData = [...reports].reverse().map((r) => ({
    month: r.month.slice(2), // "26-03"
    広告費: Math.round(r.totalCost),
    推定売上: Math.round(r.estimatedRevenue),
    ROI: Math.round(r.roi),
  }));

  // 月別のコスト vs CV数
  const costVsConvData = [...reports].reverse().map((r) => ({
    month: r.month.slice(2),
    広告費: Math.round(r.totalCost),
    来院数: r.totalConversions,
    CPA: Math.round(r.avgCpa),
  }));

  // 最新月のキャンペーン別割合
  const latestReport = reports[0];
  const pieData = latestReport?.campaignBreakdown.map((c) => ({
    name: c.name.length > 10 ? c.name.slice(0, 10) + "..." : c.name,
    value: Math.round(c.cost),
  })) || [];

  // 当月の予算消化率
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthData = manualData.filter((d) => d.date.startsWith(currentMonth));
  const currentMonthCost = currentMonthData.reduce((s, d) => s + d.cost, 0);
  const budgetUsagePercent = budget.monthlyBudget > 0
    ? (currentMonthCost / budget.monthlyBudget) * 100
    : 0;
  const isOverBudget = budgetUsagePercent >= 100;
  const isNearBudget = budgetUsagePercent >= budget.alertThreshold;

  // 全期間サマリー
  const totalCost = manualData.reduce((s, d) => s + d.cost, 0);
  const totalConv = manualData.reduce((s, d) => s + d.conversions, 0);
  const totalRevenue = totalConv * budget.avgRevenuePerVisit;
  const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 予算アラート */}
      {isNearBudget && (
        <div className={`p-4 rounded-xl border-2 ${
          isOverBudget
            ? "bg-red-50 border-red-300"
            : "bg-yellow-50 border-yellow-300"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isOverBudget ? "🚨" : "⚠️"}</span>
            <div>
              <p className={`text-sm font-bold ${isOverBudget ? "text-red-800" : "text-yellow-800"}`}>
                {isOverBudget ? "予算超過" : "予算アラート"}
              </p>
              <p className={`text-xs ${isOverBudget ? "text-red-600" : "text-yellow-600"}`}>
                今月の広告費: ¥{Math.round(currentMonthCost).toLocaleString()} / 予算: ¥{budget.monthlyBudget.toLocaleString()}
                （消化率: {Math.round(budgetUsagePercent)}%）
              </p>
            </div>
          </div>
          {/* 予算バー */}
          <div className="mt-3 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? "bg-red-500" : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ROI概要カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600">総広告費</p>
          <p className="text-xl font-bold text-blue-700 mt-1">¥{Math.round(totalCost).toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs font-medium text-green-600">総来院数(CV)</p>
          <p className="text-xl font-bold text-green-700 mt-1">{totalConv}<span className="text-xs ml-1">件</span></p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs font-medium text-purple-600">推定売上</p>
          <p className="text-xl font-bold text-purple-700 mt-1">¥{Math.round(totalRevenue).toLocaleString()}</p>
          <p className="text-[10px] text-purple-500 mt-0.5">@¥{budget.avgRevenuePerVisit.toLocaleString()}/件</p>
        </div>
        <div className={`rounded-xl p-4 ${totalROI >= 0 ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`text-xs font-medium ${totalROI >= 0 ? "text-green-600" : "text-red-600"}`}>ROI</p>
          <p className={`text-xl font-bold mt-1 ${totalROI >= 0 ? "text-green-700" : "text-red-700"}`}>
            {totalROI >= 0 ? "+" : ""}{Math.round(totalROI)}%
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {totalROI >= 0 ? "黒字" : "赤字"}（利益: ¥{Math.round(totalRevenue - totalCost).toLocaleString()}）
          </p>
        </div>
      </div>

      {/* 予算消化状況（アラートが出てない場合も表示） */}
      {!isNearBudget && budget.monthlyBudget > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3">今月の予算消化状況</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              ¥{Math.round(currentMonthCost).toLocaleString()} / ¥{budget.monthlyBudget.toLocaleString()}
              （{Math.round(budgetUsagePercent)}%）
            </span>
          </div>
        </div>
      )}

      {/* 広告費 vs 推定売上（月別） */}
      {roiChartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">月別 広告費 vs 推定売上</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => `¥${Number(value).toLocaleString()}`}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="広告費" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="推定売上" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ROI推移 */}
      {roiChartData.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">月別 ROI推移</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={roiChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                formatter={(value) => `${Number(value)}%`}
                contentStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="ROI" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* CPA推移 & CV数 */}
      {costVsConvData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">月別 来院数 & CPA</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costVsConvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="来院数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="CPA" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* キャンペーン別コスト配分（円グラフ） */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">
            最新月（{latestReport.month}）キャンペーン別コスト配分
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
              >
                {pieData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
