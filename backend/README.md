# 家教工具庫 - 後端 API

## 安裝步驟

### 1. 安裝 Node.js
前往 https://nodejs.org/ 下載並安裝 Node.js（LTS 版本）

### 2. 安裝依賴套件
在此目錄（backend）下執行：
```bash
npm install
```

### 3. 設定環境變數
1. 複製 `.env.example` 並重新命名為 `.env`
2. 編輯 `.env` 檔案，填入您的 MongoDB 連接字串

```env
MONGODB_URI=mongodb+srv://你的使用者名:你的密碼@cluster0.xxxxx.mongodb.net/jiaojiao?retryWrites=true&w=majority
PORT=3000
FRONTEND_URL=http://localhost:5500
```

### 4. 啟動伺服器

#### 開發模式（自動重啟）：
```bash
npm run dev
```

#### 生產模式：
```bash
npm start
```

伺服器會運行在 `http://localhost:3000`

---

## API 端點

### 教具管理

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/materials` | 取得所有教具 |
| POST | `/api/materials` | 新增教具 |
| PUT | `/api/materials/:id` | 更新教具 |
| DELETE | `/api/materials/:id` | 刪除教具 |

### 選項管理

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/options` | 取得所有選項 |
| PUT | `/api/options` | 更新選項 |

---

## 測試 API

使用瀏覽器或 Postman 測試：

### 取得所有教具
```
GET http://localhost:3000/api/materials
```

### 新增教具
```
POST http://localhost:3000/api/materials
Content-Type: application/json

{
  "name": "數字卡片",
  "developmentStage": "學齡前兒童（3-6歲）",
  "teachingType": "個人教具",
  "material": "紙類",
  "area": "數學區",
  "purposes": ["數學邏輯", "專注力"],
  "description": "1-10的數字認知卡片"
}
```

---

## 部署到 Render.com（免費）

### 1. 建立 GitHub Repository
1. 將 backend 資料夾推送到 GitHub
2. 確保 `.env` 不被上傳（已在 .gitignore 中）

### 2. 部署到 Render
1. 前往 https://render.com 註冊
2. 點擊 "New +" → "Web Service"
3. 連接您的 GitHub Repository
4. 設定：
   - Name: jiaojiao-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 新增環境變數：
   - `MONGODB_URI`: 您的 MongoDB 連接字串
   - `FRONTEND_URL`: 您的前端網址
6. 點擊 "Create Web Service"

部署完成後會得到一個網址，例如：
`https://jiaojiao-api.onrender.com`

---

## 資料庫結構

### Materials Collection
```javascript
{
  _id: ObjectId,
  name: String,
  developmentStage: String,
  teachingType: String,
  material: String,
  area: String,
  purposes: [String],
  description: String,
  photo: String,  // Base64
  createdAt: Date,
  updatedAt: Date
}
```

### Options Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  developmentStages: [String],
  teachingTypes: [String],
  materials: [String],
  areas: [String],
  purposes: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 疑難排解

### 連接 MongoDB 失敗
- 確認 IP 位址已加入白名單（Network Access）
- 確認使用者名稱和密碼正確
- 確認連接字串格式正確

### CORS 錯誤
- 確認 `.env` 中的 `FRONTEND_URL` 設定正確
- 部署後需更新為實際的前端網址

---

## 注意事項

⚠️ **不要將 `.env` 檔案上傳到 GitHub**
⚠️ **照片使用 Base64 儲存，建議限制大小（已設為 10MB）**
⚠️ **免費版 Render 閒置 15 分鐘後會休眠，首次請求需等待啟動**
