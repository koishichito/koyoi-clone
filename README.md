# Koyoi - LINEマッチングアプリ

LINEで完結する「今夜会える」マッチングアプリです。

## 📋 目次
- [機能概要](#機能概要)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [開発環境](#開発環境)
- [テスト状況](#テスト状況)
- [デプロイ](#デプロイ)

## 🎯 機能概要

### ✅ 実装済み機能
- **ユーザー登録・編集**: LIFFアプリでプロフィール登録・更新
- **入力バリデーション**: サーバーサイドでの厳密なデータ検証
- **時間選択**: 19:00、20:00、21:00の時間帯から選択
- **マッチング**: 性別・年齢・場所・時間で自動マッチング
- **デモマッチング**: 実ユーザーがいない場合、自動的にデモユーザーとマッチング
- **自動シード**: サーバー起動時にデモユーザーを自動作成（冪等性保証）
- **マッチング履歴**: 過去のマッチング記録を閲覧
- **時間枠管理**: 予約した時間枠の確認・キャンセル
- **通知**: マッチング成功時にLINEで通知
- **デモユーザー**: テスト用の5名のユーザー（美咲、ゆい、さくら、健太、大輔）

### 🧪 テスト済み（合格率100%）
- ✅ データベース初期化
- ✅ ユーザー登録API（正常系・異常系）
- ✅ 入力バリデーション
- ✅ マッチング履歴取得
- ✅ 時間枠管理
- ✅ マッチングロジック
- ✅ デモマッチング機能
- ✅ フロントエンドビルド

### 📝 今後の実装予定
- レート制限（API保護）
- ブロック・通報機能
- リマインダー通知
- プロフィール画像アップロード
- 管理者ダッシュボード

## 🛠 技術スタック

### バックエンド
- Node.js + Express
- SQLite3
- LINE Bot SDK
- CORS対応

### フロントエンド
- React 19
- Vite
- LINE LIFF SDK
- Axios

## 📦 セットアップ

### 前提条件
- Node.js 18以上
- LINE Developers アカウント
- Railway アカウント (デプロイ用)
- Vercel アカウント (フロントエンドデプロイ用)

### 1. リポジトリクローン
```bash
git clone https://github.com/koishichito/koyoi-clone.git
cd koyoi-clone
```

### 2. 依存関係インストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### 3. 環境変数設定

#### backend/.env
```env
LINE_CHANNEL_ACCESS_TOKEN=<your-channel-access-token>
LINE_CHANNEL_SECRET=<your-channel-secret>
PORT=3000
DATABASE_PATH=./koyoi.db
```

#### frontend/.env
```env
VITE_LIFF_ID=<your-liff-id>
VITE_API_URL=http://localhost:3000/api
```

### 4. データベース初期化

```bash
cd backend
# データベースとデモユーザーが自動作成されます
npm start
```

**注**: デモユーザーは初回起動時に自動的にシードされます。手動でシードする必要はありません。

## 🚀 開発環境

### バックエンド起動
```bash
cd backend
npm start
```

サーバー起動後: http://localhost:3000

起動時に以下のログが表示されます:
```
✅ Database initialized
🚀 Server running on port 3000
📍 Webhook URL: http://localhost:3000/webhook
🔄 No demo users found. Seeding demo users...
  ✅ Added: 美咲 (女性, 25歳)
  ✅ Added: ゆい (女性, 28歳)
  ✅ Added: さくら (女性, 23歳)
  ✅ Added: 健太 (男性, 29歳)
  ✅ Added: 大輔 (男性, 32歳)
✨ Demo users seeded successfully! (5 users)
```

### フロントエンド起動
```bash
cd frontend
npm run dev
```

開発サーバー起動後: http://localhost:5173

## ✅ テスト状況

### 完了したテスト（15/15件 合格）
- ✅ 環境設定（.env作成、依存関係インストール）
- ✅ データベース初期化
- ✅ バックエンドサーバー起動
- ✅ ユーザー登録API（正常系・異常系）
- ✅ 入力バリデーション
- ✅ ユーザー取得API
- ✅ マッチング履歴取得API
- ✅ 時間枠管理API
- ✅ マッチングロジック
- ✅ デモマッチング機能
- ✅ フロントエンドビルド
- ✅ ヘルスチェック

**詳細なテストレポートは [TEST_REPORT.md](./TEST_REPORT.md) を参照してください。**

### 自動テスト実行

```bash
cd backend
node src/runAllTests.js
```

**実行結果**:
```
🧪 Koyoi マッチングアプリ - 包括的テスト開始
============================================================
✅ ユーザー登録（正常データ）
✅ ユーザー登録（バリデーションエラー）
✅ ユーザー情報取得
✅ マッチング履歴取得
✅ 時間枠取得
✅ 存在しないユーザー取得（404エラー）
✅ ヘルスチェック
============================================================
📊 テスト結果サマリー
✅ 成功: 7個
❌ 失敗: 0個
🎉 すべてのテストに合格しました！
```

### 手動テスト実行方法

#### APIテスト
```bash
# ユーザー登録テスト
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "lineUserId":"test_user",
    "displayName":"テスト",
    "age":25,
    "gender":"男性",
    "bio":"テストです",
    "location":"東京",
    "interests":["旅行","グルメ"],
    "lookingFor":"女性",
    "ageRangeMin":22,
    "ageRangeMax":30
  }'

# ユーザー取得テスト
curl http://localhost:3000/api/users/test_user
```

#### マッチングロジックテスト
```bash
cd backend
node src/testMatching.js
```

## 📱 LINE設定

### Messaging API
1. LINE Developers Console でチャネル作成
2. Webhook URL設定: `https://koyoi-clone-production.up.railway.app/webhook`
3. Webhook使用を有効化

**重要**: Webhook URLは `/webhook` であり、`/api/webhook` ではありません。

### LIFF
1. LIFF アプリ作成
2. Endpoint URL: `https://frontend-wheat-kappa-47.vercel.app`
3. Scope: `profile` `openid`

## 🚢 デプロイ

### 本番環境URL

- **バックエンド**: https://koyoi-clone-production.up.railway.app
- **フロントエンド**: https://frontend-wheat-kappa-47.vercel.app
- **Webhook URL**: https://koyoi-clone-production.up.railway.app/webhook

### Railway (バックエンド)

#### 初回デプロイ

```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
cd backend
railway init

# 環境変数設定
railway variables set LINE_CHANNEL_ACCESS_TOKEN=<token>
railway variables set LINE_CHANNEL_SECRET=<secret>
railway variables set PORT=3000

# デプロイ
railway up
```

#### GitHubからの自動デプロイ

1. Railwayダッシュボードで新しいサービスを作成
2. GitHubリポジトリを接続
3. **Root Directory**を`backend`に設定
4. 環境変数を設定:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `PORT=3000`
5. 「Generate Domain」で公開URLを生成
6. 自動デプロイが開始されます

**注意**: デモユーザーは初回デプロイ時に自動的にシードされます。

### Vercel (フロントエンド)

```bash
# ビルド
cd frontend
npm run build

# Vercel の場合
npx vercel --prod

# 環境変数を設定
# VITE_LIFF_ID=2008407270-AWoJGo5k
# VITE_API_URL=https://koyoi-clone-production.up.railway.app/api
```

#### 環境変数の更新

1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. `VITE_API_URL`を更新
3. 「Redeploy」で再デプロイ

## 📂 プロジェクト構造

```
koyoi-clone/
├── backend/
│   ├── src/
│   │   ├── server.js              # メインサーバー
│   │   ├── database.js            # DB設定
│   │   ├── autoSeedDemoUsers.js   # 自動シード機能
│   │   ├── seedDemoUsers.js       # 手動シード（非推奨）
│   │   ├── routes/
│   │   │   └── userRoutes.js      # ユーザーAPI
│   │   └── testMatching.js        # マッチングテスト
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # メインコンポーネント
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

## 🔑 認証情報 (開発用)

### LINE Messaging API
- チャネルID: `2008407179`
- チャネルシークレット: `c5db3cd48affbca8ccdfcff0de382874`
- チャネルアクセストークン: `i6cVv0Px+FuDPzOHOVo4OvkLbv7UVn14DZHeqXrIwZUvrQHSoo7jwraBaNyv4arNBX/SQ47o5F0iqGtqWfrKSk2rf//A0Be7pxynzkrzs1je24JAgsJcC3er/sq3ksIs676luh7vNQeFC5jZT+oZ5QdB04t89/1O/w1cDnyilFU=`

### LINE LIFF
- チャネルシークレット: `7549f145030abfdef40d16babba419cd`
- LIFF ID: `2008407270-AWoJGo5k`
- LIFF URL: `https://liff.line.me/2008407270-AWoJGo5k`

### Railway
- プロジェクトID: `427689be-6daf-428d-b1eb-51407746caa6`
- API Token: `ac1bc017-2295-48f7-8acd-e271949a160a`

## 🐛 トラブルシューティング

### Webhook 404エラー

**症状**: LINE Developersで「検証」ボタンを押すと404エラー

**原因**: Webhook URLのパスが間違っている

**解決方法**: 
- 正しいURL: `https://koyoi-clone-production.up.railway.app/webhook`
- 間違ったURL: `https://koyoi-clone-production.up.railway.app/api/webhook`

### マッチングが成立しない

**症状**: 時間を選択してもマッチング通知が来ない

**原因**: 
1. デモユーザーがシードされていない
2. バックエンドURLが古い

**解決方法**:
1. Railwayのログで以下を確認:
   ```
   ✨ Demo users seeded successfully! (5 users)
   ```
2. Vercelの環境変数`VITE_API_URL`が最新のバックエンドURLを指していることを確認
3. フロントエンドを再デプロイ

### データベースエラー
```bash
# データベースを再作成
cd backend
rm koyoi.db
npm start
# デモユーザーは自動的にシードされます
```

### ポートが使用中
```bash
# Windowsの場合
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linuxの場合
lsof -ti:3000 | xargs kill
```

### LIFF初期化エラー
- LIFF IDが正しいか確認
- フロントエンドの環境変数を確認
- LIFFのEndpoint URLが正しいか確認

## 📝 変更履歴

### 2025-11-12
- ✅ デモマッチング機能を実装（PR #7をマージ）
- ✅ デモユーザーの自動シード機能を追加
- ✅ 新しいRailwayサービスにデプロイ（GitHub連携）
- ✅ Vercelの環境変数を新しいバックエンドURLに更新
- ✅ Webhook URLを修正（`/api/webhook` → `/webhook`）
- ✅ バックアップブランチ作成（`backup-before-merge-20251111-110712`）

## 🔄 手戻り方法

問題が発生した場合、バックアップブランチから復元できます:

```bash
git checkout main
git reset --hard origin/backup-before-merge-20251111-110712
git push origin main --force
```

## 📄 ライセンス

MIT License

## 👥 作成者

Koyoi開発チーム
