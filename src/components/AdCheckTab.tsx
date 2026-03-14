"use client";

import { useState } from "react";
import { AdCheckResult, DailyMetrics, ManualInputData } from "@/lib/types";
import { checkAdPerformance, generateAdCopyCheckPrompt } from "@/lib/adChecker";
import { getAnthropicKey } from "@/lib/storage";

interface Props {
  metrics: DailyMetrics[];
  manualData: ManualInputData[];
}

interface AdCopyResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  riskFlags: string[];
  suggestions: Array<{ headline: string; description: string; reason: string }>;
}

export default function AdCheckTab({ metrics, manualData }: Props) {
  const [adText, setAdText] = useState("");
  const [targetArea, setTargetArea] = useState("");
  const [targetSymptom, setTargetSymptom] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [checking, setChecking] = useState(false);
  const [copyResult, setCopyResult] = useState<AdCopyResult | null>(null);
  const [copyError, setCopyError] = useState("");

  // パフォーマンスチェック
  const perfResults = checkAdPerformance(metrics, manualData);

  const handleAdCopyCheck = async () => {
    if (!adText.trim()) return;
    const apiKey = getAnthropicKey();
    if (!apiKey) {
      setCopyError("設定タブでAnthropic APIキーを入力してください");
      return;
    }

    setChecking(true);
    setCopyError("");
    setCopyResult(null);

    try {
      const prompt = generateAdCopyCheckPrompt(adText, targetArea, targetSymptom, clinicName);
      const res = await fetch("/api/check-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.result) {
        setCopyResult(data.result);
      } else {
        setCopyError("分析結果を取得できませんでした");
      }
    } catch (e) {
      setCopyError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setChecking(false);
    }
  };

  const typeIcon = (type: AdCheckResult["type"]) => {
    switch (type) {
      case "error": return "🔴";
      case "warning": return "🟡";
      case "suggestion": return "💡";
      case "good": return "🟢";
    }
  };

  return (
    <div className="space-y-6">
      {/* パフォーマンス自動チェック */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">広告パフォーマンス自動チェック</h3>
        <p className="text-xs text-gray-500 mb-4">
          入力済みデータを元に、整体院・治療院の業界平均と比較して自動診断します
        </p>

        {perfResults.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">チェック項目がありません</p>
        ) : (
          <div className="space-y-3">
            {perfResults.sort((a, b) => {
              const order = { high: 0, medium: 1, low: 2 };
              return order[a.impact] - order[b.impact];
            }).map((r, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  r.type === "error" ? "bg-red-50 border-red-200"
                  : r.type === "warning" ? "bg-yellow-50 border-yellow-200"
                  : r.type === "good" ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{typeIcon(r.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mr-2">{r.category}</span>
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{r.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 広告文チェック（AI） */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">広告文AIチェック</h3>
        <p className="text-xs text-gray-500 mb-4">
          広告の見出し・説明文を入力すると、AIが改善点を分析し、改善案を提案します
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="院名"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
              placeholder="エリア（大阪市住吉区）"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={targetSymptom}
              onChange={(e) => setTargetSymptom(e.target.value)}
              placeholder="対象症状（腰痛）"
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            rows={5}
            placeholder={`広告文を貼り付けてください\n\n例:\n見出し1: 長居の腰痛専門整体\n見出し2: 初回限定3,980円\n説明文: 10年以上の実績。根本改善を目指す施術。`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button
            onClick={handleAdCopyCheck}
            disabled={checking || !adText.trim()}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {checking ? "AIが分析中..." : "広告文をAIチェック"}
          </button>

          {copyError && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{copyError}</p>
          )}

          {copyResult && (
            <div className="space-y-4 mt-4">
              {/* スコア */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                  copyResult.overallScore >= 7 ? "bg-green-500"
                  : copyResult.overallScore >= 4 ? "bg-yellow-500"
                  : "bg-red-500"
                }`}>
                  {copyResult.overallScore}
                </div>
                <div>
                  <p className="font-bold text-gray-800">総合スコア: {copyResult.overallScore}/10</p>
                  <p className="text-xs text-gray-500">
                    {copyResult.overallScore >= 7 ? "良い広告文です" : copyResult.overallScore >= 4 ? "改善の余地があります" : "大幅な改善が必要です"}
                  </p>
                </div>
              </div>

              {/* 良い点 */}
              {copyResult.strengths.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">良い点</p>
                  <ul className="space-y-1">
                    {copyResult.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-1">
                        <span>✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 改善点 */}
              {copyResult.weaknesses.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">改善点</p>
                  <ul className="space-y-1">
                    {copyResult.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-yellow-700 flex items-start gap-1">
                        <span>!</span><span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* リスク */}
              {copyResult.riskFlags.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">リスク・注意点</p>
                  <ul className="space-y-1">
                    {copyResult.riskFlags.map((r, i) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                        <span>⚠</span><span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 改善案 */}
              {copyResult.suggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-800">改善案</p>
                  {copyResult.suggestions.map((s, i) => (
                    <div key={i} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-bold text-blue-800">案{i + 1}: {s.headline}</p>
                      <p className="text-xs text-blue-700 mt-1">{s.description}</p>
                      <p className="text-xs text-gray-500 mt-2 italic">理由: {s.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
