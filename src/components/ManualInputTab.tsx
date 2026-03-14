"use client";

import { useState, useRef } from "react";
import { ManualInputData } from "@/lib/types";

interface Props {
  data: ManualInputData[];
  onAdd: (entry: ManualInputData) => void;
  onDelete: (index: number) => void;
  onBulkImport: (entries: ManualInputData[]) => void;
}

interface ValidationErrors {
  date?: string;
  campaignName?: string;
  impressions?: string;
  clicks?: string;
  conversions?: string;
  cost?: string;
}

export default function ManualInputTab({ data, onAdd, onDelete, onBulkImport }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [campaignName, setCampaignName] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [conversions, setConversions] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Date validation
    if (!date) {
      newErrors.date = "日付を入力してください";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      newErrors.date = "日付の形式が正しくありません（YYYY-MM-DD）";
    } else {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        newErrors.date = "無効な日付です";
      }
    }

    // Campaign name validation
    if (!campaignName.trim()) {
      newErrors.campaignName = "キャンペーン名を入力してください";
    }

    // Number validations - prevent negative
    if (impressions && Number(impressions) < 0) {
      newErrors.impressions = "0以上の数値を入力してください";
    }
    if (clicks && Number(clicks) < 0) {
      newErrors.clicks = "0以上の数値を入力してください";
    }
    if (conversions && Number(conversions) < 0) {
      newErrors.conversions = "0以上の数値を入力してください";
    }
    if (cost && Number(cost) < 0) {
      newErrors.cost = "0以上の数値を入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;

    onAdd({
      date,
      campaignName: campaignName.trim(),
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
    setErrors({});
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
          impressions: Math.max(0, Number(cols[impIdx >= 0 ? impIdx : 2]) || 0),
          clicks: Math.max(0, Number(cols[clickIdx >= 0 ? clickIdx : 3]) || 0),
          conversions: Math.max(0, Number(cols[convIdx >= 0 ? convIdx : 4]) || 0),
          cost: Math.max(0, Number(cols[costIdx >= 0 ? costIdx : 5]?.replace(/[¥,]/g, "")) || 0),
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

  // CSV Export
  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ["日付", "キャンペーン名", "表示回数", "クリック数", "CV数", "コスト(円)", "メモ"];
    const rows = data.map((d) => [
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

  // キャンペーン名一覧（オートコンプリート用）
  const campaignNames = [...new Set(data.map((d) => d.campaignName))];

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

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
              <label className="block text-xs font-medium text-gray-600 mb-1">日付 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors((prev) => ({ ...prev, date: undefined })); }}
                className={inputClass("date")}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">キャンペーン名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => { setCampaignName(e.target.value); if (errors.campaignName) setErrors((prev) => ({ ...prev, campaignName: undefined })); }}
                list="campaign-names"
                placeholder="キャンペーン名"
                className={inputClass("campaignName")}
              />
              <datalist id="campaign-names">
                {campaignNames.map((n) => <option key={n} value={n} />)}
              </datalist>
              {errors.campaignName && <p className="text-xs text-red-500 mt-1">{errors.campaignName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">表示回数</label>
              <input type="number" min="0" value={impressions}
                onChange={(e) => { setImpressions(e.target.value); if (errors.impressions) setErrors((prev) => ({ ...prev, impressions: undefined })); }}
                placeholder="0" className={inputClass("impressions")} />
              {errors.impressions && <p className="text-xs text-red-500 mt-1">{errors.impressions}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">クリック数</label>
              <input type="number" min="0" value={clicks}
                onChange={(e) => { setClicks(e.target.value); if (errors.clicks) setErrors((prev) => ({ ...prev, clicks: undefined })); }}
                placeholder="0" className={inputClass("clicks")} />
              {errors.clicks && <p className="text-xs text-red-500 mt-1">{errors.clicks}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CV数</label>
              <input type="number" min="0" value={conversions}
                onChange={(e) => { setConversions(e.target.value); if (errors.conversions) setErrors((prev) => ({ ...prev, conversions: undefined })); }}
                placeholder="0" className={inputClass("conversions")} />
              {errors.conversions && <p className="text-xs text-red-500 mt-1">{errors.conversions}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">コスト(円)</label>
              <input type="number" min="0" value={cost}
                onChange={(e) => { setCost(e.target.value); if (errors.cost) setErrors((prev) => ({ ...prev, cost: undefined })); }}
                placeholder="0" className={inputClass("cost")} />
              {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}
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
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
          <div className="flex gap-2">
            {data.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  📥 CSVエクスポート
                </button>
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
              </>
            )}
          </div>
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
