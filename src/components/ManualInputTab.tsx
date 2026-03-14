"use client";

import { useState, useRef } from "react";
import { ManualInputData } from "@/lib/types";

interface Props {
  data: ManualInputData[];
  onAdd: (entry: ManualInputData) => void;
  onDelete: (index: number) => void;
  onBulkImport: (entries: ManualInputData[]) => void;
}

export default function ManualInputTab({ data, onAdd, onDelete, onBulkImport }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [campaignName, setCampaignName] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [conversions, setConversions] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!date || !campaignName) return;
    onAdd({
      date,
      campaignName,
      impressions: Number(impressions) || 0,
      clicks: Number(clicks) || 0,
      conversions: Number(conversions) || 0,
      cost: Number(cost) || 0,
      memo: memo || undefined,
    });
    // リセット（日付とキャンペーン名は残す）
    setImpressions("");
    setClicks("");
    setConversions("");
    setCost("");
    setMemo("");
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) return;

      // ヘッダー解析
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const entries: ManualInputData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 4) continue;

        const dateIdx = headers.findIndex((h) => h.includes("日") || h.includes("date"));
        const campIdx = headers.findIndex((h) => h.includes("キャンペーン") || h.includes("campaign"));
        const impIdx = headers.findIndex((h) => h.includes("表示") || h.includes("impression"));
        const clickIdx = headers.findIndex((h) => h.includes("クリック") || h.includes("click"));
        const convIdx = headers.findIndex((h) => h.includes("cv") || h.includes("コンバージョン") || h.includes("conversion"));
        const costIdx = headers.findIndex((h) => h.includes("費用") || h.includes("コスト") || h.includes("cost"));

        entries.push({
          date: cols[dateIdx >= 0 ? dateIdx : 0] || "",
          campaignName: cols[campIdx >= 0 ? campIdx : 1] || "不明",
          impressions: Number(cols[impIdx >= 0 ? impIdx : 2]) || 0,
          clicks: Number(cols[clickIdx >= 0 ? clickIdx : 3]) || 0,
          conversions: Number(cols[convIdx >= 0 ? convIdx : 4]) || 0,
          cost: Number(cols[costIdx >= 0 ? costIdx : 5]?.replace(/[¥,]/g, "")) || 0,
        });
      }

      if (entries.length > 0) {
        onBulkImport(entries);
        alert(`${entries.length}件のデータをインポートしました`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // キャンペーン名一覧（オートコンプリート用）
  const campaignNames = [...new Set(data.map((d) => d.campaignName))];

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">データ手動入力</h3>
        <p className="text-xs text-gray-500 mb-4">
          Google広告の管理画面から数値をコピーして入力してください
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">キャンペーン名</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                list="campaign-names"
                placeholder="キャンペーン名"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="campaign-names">
                {campaignNames.map((n) => <option key={n} value={n} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">表示回数</label>
              <input type="number" value={impressions} onChange={(e) => setImpressions(e.target.value)}
                placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">クリック数</label>
              <input type="number" value={clicks} onChange={(e) => setClicks(e.target.value)}
                placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CV数</label>
              <input type="number" value={conversions} onChange={(e) => setConversions(e.target.value)}
                placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">コスト(円)</label>
              <input type="number" value={cost} onChange={(e) => setCost(e.target.value)}
                placeholder="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleAdd}
            disabled={!date || !campaignName}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            データを追加
          </button>
        </div>
      </div>

      {/* CSVインポート */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">CSVインポート</h3>
        <p className="text-xs text-gray-500 mb-3">
          Google広告からダウンロードしたCSVファイルをインポートできます。
          列名に「日付/date」「キャンペーン/campaign」「表示/impression」「クリック/click」「CV/conversion」「コスト/cost」が含まれていれば自動認識します。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* データ一覧 */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">入力済みデータ ({data.length}件)</h3>
          {data.length > 0 && (
            <button
              onClick={() => {
                if (confirm("全データを削除しますか？")) {
                  for (let i = data.length - 1; i >= 0; i--) onDelete(i);
                }
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              全削除
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">データがありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 px-1">日付</th>
                  <th className="text-left py-2 px-1">キャンペーン</th>
                  <th className="text-right py-2 px-1">表示</th>
                  <th className="text-right py-2 px-1">クリック</th>
                  <th className="text-right py-2 px-1">CV</th>
                  <th className="text-right py-2 px-1">コスト</th>
                  <th className="text-right py-2 px-1">CTR</th>
                  <th className="py-2 px-1"></th>
                </tr>
              </thead>
              <tbody>
                {data.slice().reverse().map((d, i) => {
                  const realIndex = data.length - 1 - i;
                  const ctr = d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0";
                  return (
                    <tr key={realIndex} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-1 text-gray-700">{d.date}</td>
                      <td className="py-2 px-1 text-gray-700 max-w-32 truncate">{d.campaignName}</td>
                      <td className="py-2 px-1 text-right">{d.impressions.toLocaleString()}</td>
                      <td className="py-2 px-1 text-right">{d.clicks.toLocaleString()}</td>
                      <td className="py-2 px-1 text-right font-medium text-purple-600">{d.conversions}</td>
                      <td className="py-2 px-1 text-right">¥{d.cost.toLocaleString()}</td>
                      <td className="py-2 px-1 text-right">{ctr}%</td>
                      <td className="py-2 px-1 text-right">
                        <button onClick={() => onDelete(realIndex)} className="text-red-400 hover:text-red-600">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
