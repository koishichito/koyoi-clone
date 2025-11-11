# Koyoi アプリケーション 完全セットアップガイド

このガイドは、Koyoiアプリケーションをゼロから構築し、デプロイするまでの完全な手順を説明します。

---

## 1. 必要なアカウントとツール

- **GitHubアカウント**: ソースコード管理
- **LINE Developersアカウント**: Messaging APIとLIFFの利用
- **Vercelアカウント**: フロントエンドのホスティング
- **Railwayアカウント**: バックエンドのホスティング
- **Node.js**: v18以上
- **Git**: バージョン管理システム
- **Vercel CLI**: `npm install -g vercel`
- **Railway CLI**: `npm install -g @railway/cli`

---

## 2. LINE Developers Consoleでの設定

### 2.1. プロバイダーの作成

1. [LINE Developers Console](https://developers.line.biz/console/)にログインします。
2. 新規プロバイダーを作成します（例: `Koyoi Project`）。

### 2.2. Messaging APIチャネルの作成

1. 作成したプロバイダー内で、「Create a new channel」→「Messaging API」を選択します。
2. 必要な情報を入力してチャネルを作成します（例: `Koyoi Messaging API`）。
3. **Basic settings** タブで以下の情報をメモします:
   - `Channel ID`
   - `Channel secret`
4. **Messaging API** タブで、「Issue」ボタンをクリックして **Channel access token (long-lived)** を発行し、メモします。

### 2.3. LIFFアプリの作成

1. 作成したMessaging APIチャネル内で、「LIFF」タブを開きます。
2. 「Add」ボタンをクリックして新しいLIFFアプリを作成します。
3. 以下の情報を設定します:
   - **LIFF app name**: `Koyoi Profile`
   - **Size**: `Full`
   - **Endpoint URL**: (この時点ではダミーのURLでOK。例: `https://example.com`)
   - **Scopes**: `profile`, `openid` を有効化
   - **Bot link feature**: `On (Aggressive)`
4. 作成後、`LIFF ID` をメモします。

---

## 3. GitHubリポジトリの準備

1. このプロジェクトをフォークするか、新しいリポジトリにコードをプッシュします。
2. `SECRETS.md` を参考に、リポジトリの **Settings** → **Secrets and variables** → **Actions** で以下のリポジトリシークレットを設定します（オプション、CI/CD用）。
   - `VERCEL_TOKEN`
   - `RAILWAY_API_TOKEN`

---

## 4. バックエンドのデプロイ (Railway)

1. ターミナルで `railway login` を実行してRailwayにログインします。
2. リポジトリのルートディレクトリで `railway init` を実行し、新しいプロジェクトを作成します。
3. Railwayのダッシュボードで、プロジェクトの **Variables** に以下の環境変数を設定します:
   - `LINE_CHANNEL_ACCESS_TOKEN`: (2.2で取得した値)
   - `LINE_CHANNEL_SECRET`: (2.2で取得した値)
   - `LINE_LIFF_ID`: (2.3で取得した値)
4. Railwayは自動的にデプロイを開始します。デプロイが完了したら、**Settings** タブで生成された **Public URL** をメモします（例: `https://koyoi-backend-production.up.railway.app`）。

### 4.1. Webhook URLの設定

1. LINE Developers Consoleに戻り、Messaging APIチャネルの **Messaging API** タブを開きます。
2. **Webhook URL** に、Railwayで取得したURLに `/webhook` を追加したものを設定します。
   - 例: `https://koyoi-backend-production.up.railway.app/webhook`
3. 「Use webhook」を有効にします。

---

## 5. フロントエンドのデプロイ (Vercel)

1. ターミナルで `vercel login` を実行してVercelにログインします。
2. リポジトリのルートディレクトリで `vercel link` を実行し、新しいプロジェクトとしてリンクします。
3. Vercelのダッシュボードで、プロジェクトの **Settings** → **Environment Variables** に以下の環境変数を設定します:
   - `VITE_LIFF_ID`: (2.3で取得した値)
   - `VITE_API_URL`: (4で取得したバックエンドURLに `/api` を追加したもの。例: `https://koyoi-backend-production.up.railway.app/api`)
4. `vercel --prod` を実行して本番環境にデプロイします。
5. デプロイが完了したら、生成された **Production URL** をメモします（例: `https://koyoi-clone-gz3meddqy-koishichitos-projects.vercel.app`）。

### 5.1. LIFF Endpoint URLの更新

1. LINE Developers Consoleに戻り、LIFFアプリの設定を開きます。
2. **Endpoint URL** を、Vercelで取得したProduction URLに更新します。

### 5.2. Deployment Protectionの無効化

1. Vercelのダッシュボードで、プロジェクトの **Settings** → **Deployment Protection** を開きます。
2. **Vercel Authentication** を **Disabled** に設定し、保存します。

---

## 6. 最終確認

1. LINEアプリを再起動します。
2. Messaging APIチャネルの公式アカウントを開きます。
3. 「プロフィール登録」ボタンをタップし、LIFFアプリが正常に表示され、操作できることを確認します。

以上で、Koyoiアプリケーションの完全なセットアップは完了です。
