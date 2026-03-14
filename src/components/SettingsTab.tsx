"use client";

import { useState } from "react";

interface Props {
  anthropicKey: string;
  onSaveKey: (key: string) => void;
}

export default function SettingsTab({ anthropicKey, onSaveKey }: Props) {
  const [key, setKey] = useState(anthropicKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">API設定</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anthropic APIキー
            </label>
            <p className="text-xs text-gray-500 mb-2">
              広告文AIチェック機能に使用します。
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                Anthropic Console
              </a>
              で取得してください。
            </p>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? "保存しました" : "保存"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">使い方</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800 mb-1">1. データ入力</p>
            <p className="text-xs text-blue-600">
              Google広告の管理画面から数値をコピーして「手動入力」タブに入力するか、CSVファイルをインポートします。
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="font-medium text-green-800 mb-1">2. ダッシュボード</p>
            <p className="text-xs text-green-600">
              入力したデータがグラフやKPIカードで可視化されます。日別推移も確認できます。
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-800 mb-1">3. 自動チェック</p>
            <p className="text-xs text-purple-600">
              整体院の業界平均と比較して、CTR・CPC・CVR・CPAの問題点を自動検出します。
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="font-medium text-orange-800 mb-1">4. 広告文AIチェック</p>
            <p className="text-xs text-orange-600">
              広告の見出し・説明文を貼り付けると、AIが改善点を分析し、改善案を3パターン提案します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
