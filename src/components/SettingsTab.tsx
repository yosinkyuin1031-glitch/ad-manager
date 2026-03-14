"use client";

import { useState, useEffect } from "react";
import { KPISettings, DEFAULT_KPI_SETTINGS } from "@/lib/types";
import { getKPISettings, saveKPISettings, getAdsConfig, saveAdsConfig } from "@/lib/storage";

export default function SettingsTab() {
  const [kpi, setKpi] = useState<KPISettings>(DEFAULT_KPI_SETTINGS);
  const [googleAds, setGoogleAds] = useState({
    customerId: "",
    refreshToken: "",
    clientId: "",
    clientSecret: "",
  });
  const [saved, setSaved] = useState(false);
  const [adsSaved, setAdsSaved] = useState(false);

  useEffect(() => {
    setKpi(getKPISettings());
    const config = getAdsConfig();
    if (config) {
      setGoogleAds({
        customerId: config.customerId || "",
        refreshToken: config.refreshToken || "",
        clientId: config.clientId || "",
        clientSecret: config.clientSecret || "",
      });
    }
  }, []);

  const handleSaveKPI = () => {
    saveKPISettings(kpi);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetKPI = () => {
    setKpi(DEFAULT_KPI_SETTINGS);
    saveKPISettings(DEFAULT_KPI_SETTINGS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAds = () => {
    saveAdsConfig({
      customerId: googleAds.customerId,
      refreshToken: googleAds.refreshToken,
      clientId: googleAds.clientId,
      clientSecret: googleAds.clientSecret,
    });
    setAdsSaved(true);
    setTimeout(() => setAdsSaved(false), 2000);
  };

  const kpiFields: { key: keyof KPISettings; label: string; unit: string; desc: string }[] = [
    { key: "ctr_good", label: "CTR 良好ライン", unit: "%", desc: "この値以上なら良好と判定" },
    { key: "ctr_warn", label: "CTR 警告ライン", unit: "%", desc: "この値未満なら危険と判定" },
    { key: "cpc_warn", label: "CPC 警告ライン", unit: "円", desc: "この値を超えると注意" },
    { key: "cpc_bad", label: "CPC 危険ライン", unit: "円", desc: "この値を超えると危険" },
    { key: "cvr_good", label: "CVR 良好ライン", unit: "%", desc: "この値以上なら良好と判定" },
    { key: "cvr_warn", label: "CVR 警告ライン", unit: "%", desc: "この値未満なら危険と判定" },
    { key: "cpa_warn", label: "CPA 警告ライン", unit: "円", desc: "この値を超えると注意" },
    { key: "cpa_bad", label: "CPA 危険ライン", unit: "円", desc: "この値を超えると危険" },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* KPI設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">KPI基準値設定</h3>
          <button
            onClick={handleResetKPI}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            デフォルトに戻す
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          広告パフォーマンスチェックの判定基準をカスタマイズできます。業界・エリアに合わせて調整してください。
        </p>

        <div className="space-y-3">
          {kpiFields.map((field) => (
            <div key={field.key} className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">{field.label}</label>
                <p className="text-[10px] text-gray-400">{field.desc}</p>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={kpi[field.key]}
                  onChange={(e) => setKpi({ ...kpi, [field.key]: Number(e.target.value) })}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-right"
                  step={field.unit === "%" ? 0.5 : 100}
                />
                <span className="text-xs text-gray-500 w-6">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveKPI}
          className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {saved ? "保存しました" : "KPI設定を保存"}
        </button>
      </div>

      {/* Google広告API設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Google広告API連携</h3>
        <p className="text-xs text-gray-500 mb-4">
          Google広告アカウントを連携すると、キャンペーンデータを自動取得できます。
          設定後は「手動入力」タブの「API取得」ボタンからデータを取得してください。
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">アカウントID（Customer ID）</label>
            <input
              type="text"
              value={googleAds.customerId}
              onChange={(e) => setGoogleAds({ ...googleAds, customerId: e.target.value })}
              placeholder="123-456-7890"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">OAuth Client ID</label>
            <input
              type="text"
              value={googleAds.clientId}
              onChange={(e) => setGoogleAds({ ...googleAds, clientId: e.target.value })}
              placeholder="xxxx.apps.googleusercontent.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">OAuth Client Secret</label>
            <input
              type="password"
              value={googleAds.clientSecret}
              onChange={(e) => setGoogleAds({ ...googleAds, clientSecret: e.target.value })}
              placeholder="••••••••"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Refresh Token</label>
            <input
              type="password"
              value={googleAds.refreshToken}
              onChange={(e) => setGoogleAds({ ...googleAds, refreshToken: e.target.value })}
              placeholder="••••••••"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSaveAds}
          className="mt-4 w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {adsSaved ? "保存しました" : "API設定を保存"}
        </button>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800 font-medium mb-1">Google Ads APIの取得方法</p>
          <ol className="text-[10px] text-yellow-700 list-decimal list-inside space-y-0.5">
            <li>Google Cloud Consoleでプロジェクトを作成</li>
            <li>Google Ads APIを有効化</li>
            <li>OAuth 2.0クライアントIDを作成</li>
            <li>Google Ads開発者トークンを申請</li>
            <li>OAuth同意画面でRefresh Tokenを取得</li>
          </ol>
        </div>
      </div>

      {/* Anthropic API */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">AI広告文チェック</h3>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">APIキーは環境変数で設定済み</p>
          <p className="text-xs text-green-600">
            Anthropic APIキーはサーバー側の環境変数で安全に管理されています。
          </p>
        </div>
      </div>

      {/* 使い方 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">使い方</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800 mb-1">1. データ入力</p>
            <p className="text-xs text-blue-600">
              Google広告の管理画面から数値をコピーして「手動入力」タブに入力するか、CSVをインポートします。
              API連携設定済みの場合は自動取得も可能です。
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="font-medium text-green-800 mb-1">2. ダッシュボード</p>
            <p className="text-xs text-green-600">
              入力したデータがグラフやKPIカードで可視化されます。
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-800 mb-1">3. 自動チェック</p>
            <p className="text-xs text-purple-600">
              設定したKPI基準値と比較して問題点を自動検出します。
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="font-medium text-orange-800 mb-1">4. 広告文AIチェック</p>
            <p className="text-xs text-orange-600">
              広告の見出し・説明文を貼り付けると、AIが改善点を分析します。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
