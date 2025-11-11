# Koyoi アプリケーション インフラ構成図

## 概要

このドキュメントは、Koyoiアプリケーションのインフラストラクチャ、サービス間の連携、およびデプロイフローを視覚的に示したものです。

---

## システム構成図

```mermaid
graph TD
    subgraph LINE Platform
        direction LR
        User[📱 LINE User] --> LIFF_App[LIFF App];
        User --> Messaging_API[Messaging API];
    end

    subgraph Vercel [Frontend]
        direction LR
        LIFF_App -- HTTPS --> Vercel_Frontend[React App (Vite)];
    end

    subgraph Railway [Backend]
        direction LR
        Vercel_Frontend -- API Calls --> Railway_Backend[Node.js/Express API];
        Messaging_API -- Webhook --> Railway_Backend;
        Railway_Backend -- CRUD --> DB[(SQLite Database)];
    end

    subgraph GitHub [Code Repository]
        direction LR
        Developer[👨‍💻 Developer] -- Push --> GitHub_Repo[GitHub Repository];
    end

    GitHub_Repo -- Auto Deploy --> Vercel;
    GitHub_Repo -- Auto Deploy --> Railway;

    style Vercel fill:#f2f2f2,stroke:#333,stroke-width:2px
    style Railway fill:#e6f7ff,stroke:#333,stroke-width:2px
    style LINE Platform fill:#e6ffe6,stroke:#333,stroke-width:2px
    style GitHub fill:#fff0e6,stroke:#333,stroke-width:2px
```

---

## 詳細

### 1. ユーザーフロー

1.  **LINEユーザー**がLINE公式アカウント「Koyoi messagingAPI」と対話します。
2.  「プロフィール登録」ボタンをタップすると、**LIFFアプリ**がLINEの内蔵ブラウザで開きます。
3.  LIFFアプリは**Vercel**にデプロイされたReactアプリケーションです。
4.  LIFFアプリは、ユーザー情報の取得や保存のために**Railway**にデプロイされたバックエンドAPIと通信します。
5.  マッチングが成立すると、バックエンドAPIが**Messaging API**を通じてユーザーに通知を送信します。

### 2. デプロイフロー

1.  **開発者**がコードを**GitHubリポジトリ**にプッシュします。
2.  **Vercel**はGitHubリポジトリの変更を検知し、フロントエンドのビルドとデプロイを自動的に実行します。
3.  **Railway**も同様にGitHubリポジトリの変更を検知し、バックエンドのデプロイを自動的に実行します。

### 3. 各コンポーネントの役割

| コンポーネント | 役割 | ホスティング | URL/ID |
| :--- | :--- | :--- | :--- |
| **Frontend** | ユーザーインターフェース (UI) の提供、LIFF SDKの実行 | Vercel | `koyoi-clone-gz3meddqy-koishichitos-projects.vercel.app` |
| **Backend** | ビジネスロジック、データベース操作、LINE APIとの連携 | Railway | `koyoi-backend-production.up.railway.app` |
| **Database** | ユーザー情報、マッチング情報の永続化 | Railway (SQLite) | - |
| **LINE Messaging API** | Webhookによるイベント受信、プッシュメッセージの送信 | LINE Platform | Channel ID: `2008407179` |
| **LINE LIFF** | LINE内でのWebアプリケーション実行環境 | LINE Platform | LIFF ID: `2008407270-AWoJGo5k` |
| **GitHub** | ソースコード管理、CI/CDのトリガー | GitHub | `koishichito/koyoi-clone` |

---

## ネットワークとセキュリティ

- **通信**: すべての通信はHTTPSで暗号化されています。
- **認証**: LIFFアプリはLINEの認証基盤を利用してユーザーを認証します。
- **環境変数**: APIキーやシークレットなどの機密情報は、VercelおよびRailwayの環境変数として安全に管理されています。
- **CORS**: バックエンドはCORS（Cross-Origin Resource Sharing）に対応しており、Vercelのフロントエンドからのリクエストを許可しています。
- **Deployment Protection**: VercelのDeployment Protectionは無効化されており、LIFFアプリが認証なしでアクセスできるようになっています。
