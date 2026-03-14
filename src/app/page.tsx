"use client";

import { useState, useEffect } from "react";
import { TabType, ManualInputData, DailyMetrics } from "@/lib/types";
import { getManualData, addManualData, deleteManualData, saveManualData, manualDataToDailyMetrics, getAnthropicKey, saveAnthropicKey } from "@/lib/storage";
import Dashboard from "@/components/Dashboard";
import AdCheckTab from "@/components/AdCheckTab";
import ManualInputTab from "@/components/ManualInputTab";
import SettingsTab from "@/components/SettingsTab";

export default function Home() {
  const [tab, setTab] = useState<TabType>("dashboard");
  const [manualData, setManualData] = useState<ManualInputData[]>([]);
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [anthropicKey, setAnthropicKey] = useState("");

  useEffect(() => {
    const data = getManualData();
    setManualData(data);
    setMetrics(manualDataToDailyMetrics(data));
    setAnthropicKey(getAnthropicKey());
  }, []);

  const refreshData = (data: ManualInputData[]) => {
    setManualData(data);
    setMetrics(manualDataToDailyMetrics(data));
  };

  const handleAdd = (entry: ManualInputData) => {
    addManualData(entry);
    refreshData(getManualData());
  };

  const handleDelete = (index: number) => {
    deleteManualData(index);
    refreshData(getManualData());
  };

  const handleBulkImport = (entries: ManualInputData[]) => {
    const existing = getManualData();
    saveManualData([...existing, ...entries]);
    refreshData(getManualData());
  };

  const handleSaveKey = (key: string) => {
    saveAnthropicKey(key);
    setAnthropicKey(key);
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "dashboard", label: "ダッシュボード", icon: "📊" },
    { id: "check", label: "チェック", icon: "🔍" },
    { id: "manual", label: "手動入力", icon: "✏️" },
    { id: "settings", label: "設定", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800">
            <span className="text-blue-600">Ad</span>Manager
            <span className="text-xs text-gray-400 ml-2">広告管理ツール</span>
          </h1>
        </div>
      </header>

      {/* タブナビ */}
      <nav className="bg-white border-b border-gray-200 sticky top-[52px] z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "dashboard" && <Dashboard metrics={metrics} />}
        {tab === "check" && <AdCheckTab metrics={metrics} manualData={manualData} />}
        {tab === "manual" && (
          <ManualInputTab
            data={manualData}
            onAdd={handleAdd}
            onDelete={handleDelete}
            onBulkImport={handleBulkImport}
          />
        )}
        {tab === "settings" && <SettingsTab anthropicKey={anthropicKey} onSaveKey={handleSaveKey} />}
      </main>
    </div>
  );
}
