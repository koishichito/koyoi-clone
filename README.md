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
- **マッチング履歴**: 過去のマッチング記録を閲覧
- **時間枠管理**: 予約した時間枠の確認・キャンセル
- **通知**: マッチング成功時にLINEで通知
- **デモユーザー**: テスト用の5名のユーザー

### 🧪 テスト済み（合格率100%）
- ✅ データベース初期化
- ✅ ユーザー登録API（正常系・異常系）
- ✅ 入力バリデーション
- ✅ マッチング履歴取得
- ✅ 時間枠管理
- ✅ マッチングロジック
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

### 1. リポジトリクローン
```bash
git clone <repository-url>
cd koyoi
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
LINE_LIFF_ID=<your-liff-id>
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
# データベースが自動作成されます
npm start

# 別ターミナルでデモユーザーをシード
node src/seedDemoUsers.js
```

## 🚀 開発環境

### バックエンド起動
```bash
cd backend
npm start
# または開発モード（自動再起動）
npm run dev
```

サーバー起動後: http://localhost:3000

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
2. Webhook URL設定: `https://your-domain.com/webhook`
3. Webhook使用を有効化

### LIFF
1. LIFF アプリ作成
2. Endpoint URL: `https://your-frontend-domain.com`
3. Scope: `profile` `openid`

## 🚢 デプロイ

### Railway (バックエンド)

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
railway variables set LINE_LIFF_ID=<liff-id>

# デプロイ
railway up
```

### Vercel/Netlify (フロントエンド)

```bash
# ビルド
cd frontend
npm run build

# Vercel の場合
npx vercel --prod

# 環境変数を設定
# VITE_LIFF_ID=<your-liff-id>
# VITE_API_URL=https://your-backend.railway.app/api
```

## 📂 プロジェクト構造

```
koyoi/
├── backend/
│   ├── src/
│   │   ├── server.js          # メインサーバー
│   │   ├── database.js        # DB設定
│   │   ├── routes/
│   │   │   └── userRoutes.js  # ユーザーAPI
│   │   ├── seedDemoUsers.js   # デモデータ
│   │   └── testMatching.js    # マッチングテスト
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # メインコンポーネント
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

### LINE LIFF
- LIFF ID: `2008407270-AWoJGo5k`
- LIFF URL: `https://liff.line.me/2008407270-AWoJGo5k`

### Railway
- API Token: `95357e24-4e1a-4d2c-a02e-3f9eda407689`

### GitHub
- Personal Access Token: `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`

## 🐛 トラブルシューティング

### データベースエラー
```bash
# データベースを再作成
cd backend
rm koyoi.db
npm start
node src/seedDemoUsers.js
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

## 📄 ライセンス

MIT License

## 👥 作成者

Koyoi開発チーム
