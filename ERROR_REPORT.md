# Koyoi アプリケーション エラー報告書

## 報告日時
2025年11月11日

## エラー概要

**エラーメッセージ**: 「初期化に失敗しました。Invalid LIFF ID」

**発生箇所**: LINEからプロフィール登録ボタンをクリックしてLIFFアプリを開いた際

**影響範囲**: すべてのユーザーがプロフィール登録機能を利用できない（重大）

---

## 技術的な詳細

### 1. 根本原因

Viteでビルドされたフロントエンドアプリケーションにおいて、環境変数 `VITE_LIFF_ID` が **ビルド時に `undefined` として埋め込まれている**ことが原因です。

#### ビルド結果の検証

ビルドされたJavaScriptファイルを解析した結果:

```javascript
const fE=void 0  // LIFF_ID が undefined
const Tv="http://localhost:3000/api"  // API_URL も未設定

// LIFF初期化時
await Vi.init({liffId:fE})  // undefined が渡される
```

`fE=void 0` は `const LIFF_ID = undefined` を意味しており、環境変数が正しく埋め込まれていないことを示しています。

### 2. Viteの環境変数の仕組み

Viteでは以下の仕様があります:

1. **ビルド時に環境変数が埋め込まれる** - 実行時ではなく、ビルド時に `import.meta.env.VITE_*` が静的な値に置き換えられる
2. **`VITE_` プレフィックスが必須** - セキュリティのため、`VITE_` で始まる環境変数のみがクライアント側で利用可能
3. **Vercelでの環境変数設定** - Vercel Dashboardで設定した環境変数は、ビルドプロセス中に利用される

### 3. 現在の状況

| 項目 | 状態 | 備考 |
|------|------|------|
| Vercel環境変数設定 | ✅ 完了 | `VITE_LIFF_ID` と `VITE_API_URL` が設定済み |
| 環境変数の環境 | ❓ 要確認 | Production環境に設定されているか不明 |
| 再デプロイ | ✅ 実行済み | 2025年11月11日 21:23頃 |
| ビルド結果 | ❌ 問題あり | 環境変数が `undefined` として埋め込まれている |
| Vercelログ | 304 Not Modified | キャッシュからの応答 |

### 4. 考えられる原因

#### 原因A: 環境変数の環境設定ミス（最も可能性が高い）

Vercel Dashboardで環境変数を設定する際、以下の環境を選択できます:

- **Production** - 本番デプロイ時に使用
- **Preview** - プレビューデプロイ時に使用
- **Development** - ローカル開発時に使用

**問題**: 環境変数が「Preview」や「Development」にのみ設定されており、「Production」に設定されていない可能性があります。

#### 原因B: Vercelのビルドキャッシュ

Vercelは高速化のため、依存関係やビルド結果をキャッシュします。環境変数を追加した後でも、古いキャッシュが使用されている可能性があります。

#### 原因C: GitHubリポジトリとの連携問題

Vercelがデプロイ時に参照しているブランチやコミットが古い可能性があります。

---

## 対処方法

### 【推奨】方法1: Vercel環境変数の環境設定を確認・修正

#### 手順

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト「frontend」を選択
3. 「Settings」→「Environment Variables」に移動
4. `VITE_LIFF_ID` と `VITE_API_URL` の各環境変数について:
   - 右側の「Environment」列を確認
   - **「Production」にチェックが入っているか確認**
   - チェックが入っていない場合は、編集して「Production」を追加
5. 保存後、「Deployments」タブに移動
6. 最新のデプロイの右側メニューから「Redeploy」を選択
7. **「Use existing Build Cache」のチェックを外す**
8. 「Redeploy」を実行

#### 確認方法

再デプロイ後、以下のURLにアクセスしてビルド結果を確認:

```
https://frontend-wheat-kappa-47.vercel.app/assets/index-*.js
```

ブラウザの開発者ツールで `2008407270-AWoJGo5k` という文字列が含まれているか検索してください。

### 方法2: Vercel CLIで環境変数を再設定

```bash
# Vercel CLIでログイン
vercel login

# プロジェクトにリンク
cd /path/to/frontend
vercel link

# 既存の環境変数を削除
vercel env rm VITE_LIFF_ID production
vercel env rm VITE_API_URL production

# 環境変数を再設定
vercel env add VITE_LIFF_ID production
# 入力: 2008407270-AWoJGo5k

vercel env add VITE_API_URL production
# 入力: https://koyoi-backend-production.up.railway.app/api

# キャッシュをクリアして再デプロイ
vercel --prod --force
```

### 方法3: 環境変数をコードに直接埋め込む（緊急対応用）

**注意**: この方法はセキュリティ上推奨されませんが、LIFF IDは公開情報なので一時的な対応として使用可能です。

#### App.jsxを修正

```javascript
// 修正前
const LIFF_ID = import.meta.env.VITE_LIFF_ID;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 修正後
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2008407270-AWoJGo5k';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://koyoi-backend-production.up.railway.app/api';
```

この修正により、環境変数が設定されていない場合でもデフォルト値が使用されます。

---

## 検証手順

### 1. ビルド結果の確認

```bash
# ローカルでビルドして確認
cd frontend
npm run build

# ビルドされたファイルにLIFF IDが含まれているか確認
grep -r "2008407270-AWoJGo5k" dist/
```

期待される結果: LIFF IDが見つかること

### 2. Vercelデプロイログの確認

Vercel Dashboardの「Deployments」→最新のデプロイ→「Building」セクションで以下を確認:

```
Environment Variables:
  VITE_LIFF_ID: 2008407270-AWoJGo5k
  VITE_API_URL: https://koyoi-backend-production.up.railway.app/api
```

### 3. 実機テスト

1. LINEアプリで公式アカウントを開く
2. 「プロフィール登録」ボタンをタップ
3. ブラウザの開発者ツールを開く（可能な場合）
4. コンソールログを確認:
   - `🔄 Initializing LIFF...` が表示される
   - エラーが表示されない
   - プロフィール登録画面が正常に表示される

---

## 予防策

### 1. 環境変数テンプレートの作成

`.env.example` ファイルをリポジトリに追加（完了済み）:

```
VITE_LIFF_ID=your-liff-id-here
VITE_API_URL=https://your-backend-url.com/api
```

### 2. デプロイメントドキュメントの整備

`DEPLOYMENT.md` ファイルを作成（完了済み）して、環境変数の設定手順を明記。

### 3. ビルド前のバリデーション

`vite.config.js` にビルド前チェックを追加:

```javascript
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'validate-env',
      buildStart() {
        if (!process.env.VITE_LIFF_ID) {
          throw new Error('VITE_LIFF_ID is not set!');
        }
        if (!process.env.VITE_API_URL) {
          throw new Error('VITE_API_URL is not set!');
        }
      }
    }
  ],
  // ...
});
```

### 4. フォールバック値の設定

App.jsxで環境変数が未設定の場合のフォールバック値を設定（方法3参照）。

---

## 関連ファイル

- `/home/ubuntu/koyoi-clone/frontend/src/App.jsx` - LIFF初期化コード
- `/home/ubuntu/koyoi-clone/frontend/vite.config.js` - Vite設定
- `/home/ubuntu/koyoi-clone/frontend/.env.example` - 環境変数テンプレート
- `/home/ubuntu/koyoi-clone/frontend/DEPLOYMENT.md` - デプロイメント手順

---

## 参考資料

- [Vite環境変数とモード](https://ja.vitejs.dev/guide/env-and-mode.html)
- [Vercel環境変数](https://vercel.com/docs/projects/environment-variables)
- [LINE LIFF ドキュメント](https://developers.line.biz/ja/docs/liff/)

---

## 次のアクション

1. ✅ エラー報告書の作成（完了）
2. ⏳ Vercel環境変数の環境設定を確認
3. ⏳ キャッシュをクリアして再デプロイ
4. ⏳ ビルド結果の検証
5. ⏳ 実機テスト

---

## 担当者メモ

- LIFF ID: `2008407270-AWoJGo5k`
- API URL: `https://koyoi-backend-production.up.railway.app/api`
- Vercel プロジェクト: `frontend`
- デプロイURL: `https://frontend-wheat-kappa-47.vercel.app`
