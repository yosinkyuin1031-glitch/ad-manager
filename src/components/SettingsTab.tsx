"use client";

export default function SettingsTab() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">API設定</h3>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">APIキーは環境変数で設定済み</p>
          <p className="text-xs text-green-600">
            Anthropic APIキーはサーバー側の環境変数（<code className="bg-green-100 px-1 rounded">.env.local</code>）で安全に管理されています。
            フロントエンドにAPIキーが露出することはありません。
          </p>
          <p className="text-xs text-gray-500 mt-2">
            キーの変更が必要な場合は、<code className="bg-gray-100 px-1 rounded">.env.local</code> ファイルの
            <code className="bg-gray-100 px-1 rounded">ANTHROPIC_API_KEY</code> を更新してください。
          </p>
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
