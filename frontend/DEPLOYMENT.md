# Koyoi フロントエンド デプロイメントガイド

## Vercel環境変数の設定

Vercelにデプロイする際は、以下の環境変数を設定する必要があります。

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_LIFF_ID` | LINE LIFF ID | `2008407270-AWoJGo5k` |
| `VITE_API_URL` | バックエンドAPI URL | `https://koyoi-backend-production.up.railway.app/api` |

### Vercel CLIでの設定方法

```bash
# Production環境に設定
vercel env add VITE_LIFF_ID production
# 値を入力: 2008407270-AWoJGo5k

vercel env add VITE_API_URL production
# 値を入力: https://koyoi-backend-production.up.railway.app/api
```

### Vercel Dashboardでの設定方法

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト「frontend」を選択
3. 「Settings」→「Environment Variables」に移動
4. 以下の変数を追加:
   - `VITE_LIFF_ID`: `2008407270-AWoJGo5k`
   - `VITE_API_URL`: `https://koyoi-backend-production.up.railway.app/api`
5. 環境を「Production」に設定
6. 保存後、再デプロイ

### 再デプロイ

環境変数を設定した後、必ず再デプロイしてください:

```bash
vercel --prod
```

または、Vercel Dashboardから「Deployments」→「Redeploy」を実行してください。

## トラブルシューティング

### 「Invalid LIFF ID」エラー

このエラーは、環境変数 `VITE_LIFF_ID` が正しく設定されていないか、ビルド時に埋め込まれていない場合に発生します。

**解決方法**:
1. Vercelの環境変数が正しく設定されているか確認
2. 環境変数の環境が「Production」に設定されているか確認
3. 再デプロイを実行

### ローカル開発

ローカルで開発する場合は、`.env` ファイルを作成してください:

```bash
cp .env.example .env
```

`.env` ファイルを編集して、実際の値を設定:

```
VITE_LIFF_ID=2008407270-AWoJGo5k
VITE_API_URL=https://koyoi-backend-production.up.railway.app/api
```

開発サーバーを起動:

```bash
npm run dev
```

## 注意事項

- `.env` ファイルは `.gitignore` に含まれており、Gitにコミットされません
- 環境変数は **ビルド時** に埋め込まれるため、変更後は必ず再ビルド・再デプロイが必要です
- Viteでは `VITE_` プレフィックスが付いた環境変数のみがクライアント側で利用可能です
