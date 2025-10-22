# 使用 MongoDB Atlas 的完整步驟指南

## 📋 目前已完成的工作

✅ 建立了後端 API 伺服器程式碼（`backend/` 資料夾）
✅ 建立了 API 配置檔案（`api-config.js`）
✅ 備份了原本的 localStorage 版本（`script-localStorage.js`）

---

## 🚀 完整部署步驟

### 步驟一：設定 MongoDB Atlas

1. **註冊並建立集群**
   - 前往 https://www.mongodb.com/cloud/atlas
   - 註冊免費帳號
   - 建立免費集群（選擇離您最近的區域，如 Tokyo 或 Singapore）

2. **建立資料庫使用者**
   - Database Access → Add New Database User
   - 使用者名稱：`jiaojiao_user`（可自訂）
   - 密碼：設定強密碼並記下
   - 權限：Read and write to any database

3. **設定網路存取**
   - Network Access → Add IP Address
   - 選擇 "Allow Access from Anywhere"（0.0.0.0/0）

4. **取得連接字串**
   - Database → Connect → Connect your application
   - 複製連接字串，格式類似：
     ```
     mongodb+srv://jiaojiao_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 將 `<password>` 替換為您的密碼

---

### 步驟二：本地測試後端

1. **安裝 Node.js**
   - 前往 https://nodejs.org/
   - 下載並安裝 LTS 版本

2. **設定後端**
   ```bash
   cd backend
   npm install
   ```

3. **建立環境變數檔案**
   - 複製 `.env.example` 為 `.env`
   - 編輯 `.env`：
   ```env
   MONGODB_URI=mongodb+srv://jiaojiao_user:你的密碼@cluster0.xxxxx.mongodb.net/jiaojiao?retryWrites=true&w=majority
   PORT=3000
   FRONTEND_URL=http://localhost:5500
   ```

4. **啟動後端伺服器**
   ```bash
   npm start
   ```

   看到以下訊息表示成功：
   ```
   ✅ MongoDB 連接成功
   🚀 伺服器運行在 http://localhost:3000
   ```

5. **測試 API**
   - 在瀏覽器開啟：http://localhost:3000
   - 應該會看到 API 資訊

---

### 步驟三：部署後端到 Render.com（免費）

1. **準備 GitHub Repository**
   - 在 GitHub 建立新的 repository
   - 將 `backend` 資料夾推送到 GitHub
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的帳號/你的倉庫.git
   git push -u origin main
   ```

2. **部署到 Render**
   - 前往 https://render.com 註冊
   - 點擊 "New +" → "Web Service"
   - 連接您的 GitHub repository
   - 設定：
     - **Name**: `jiaojiao-api`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - 新增環境變數（Environment Variables）：
     - `MONGODB_URI`: 您的 MongoDB 連接字串
     - `FRONTEND_URL`: `*`（或您的前端網址）
   - 點擊 "Create Web Service"

3. **記下 API 網址**
   - 部署完成後會得到網址，例如：
     `https://jiaojiao-api.onrender.com`

---

### 步驟四：修改前端連接 API

1. **編輯 `api-config.js`**
   - 將 `BASE_URL` 改為您的後端網址：
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'https://jiaojiao-api.onrender.com/api',
       // ...
   };
   ```

2. **如果要使用 MongoDB 版本**
   - 目前前端仍使用 localStorage
   - 需要修改 `script.js` 改為呼叫 API
   - 我可以為您建立一個完整的 MongoDB 版本

---

### 步驟五：部署前端

#### 選項 A：Netlify（最簡單）
1. 前往 https://www.netlify.com
2. 拖放整個 `家教` 資料夾
3. 網站立即上線

#### 選項 B：GitHub Pages
1. 將前端推送到 GitHub
2. Settings → Pages → 啟用 GitHub Pages
3. 網站會發布在 `https://你的帳號.github.io/倉庫名稱/`

---

## ⚠️ 重要提醒

### 關於前端程式碼

**目前狀態：**
- ✅ 後端 API 已準備完成
- ✅ API 配置檔案已建立
- ⚠️ 前端仍使用 localStorage（未連接 API）

**要完全切換到 MongoDB，需要：**
1. 修改 `script.js` 中的所有 localStorage 操作改為 API 呼叫
2. 這是一個較大的修改，涉及約 20 個函數

---

## 🔄 兩種使用模式

### 模式一：純 localStorage（目前）
- ✅ 無需後端
- ✅ 完全免費
- ❌ 資料只存在瀏覽器本地
- ❌ 換電腦/瀏覽器資料會遺失

### 模式二：MongoDB + API（需修改）
- ✅ 資料存在雲端
- ✅ 多裝置同步
- ✅ 資料永久保存
- ❌ 需要後端伺服器
- ⚠️ Render 免費版閒置會休眠

---

## 📝 下一步決定

請告訴我您想要：

### 選項 A：保持 localStorage 版本
- 優點：簡單、免費、無需後端
- 缺點：資料只在本地

### 選項 B：完整切換到 MongoDB
- 我會為您修改 `script.js`，讓所有功能都使用 API
- 需要先完成步驟一~三的後端部署

### 選項 C：混合模式
- 提供開關讓使用者選擇使用 localStorage 或 MongoDB
- 彈性最大但程式較複雜

---

## 🛠️ 測試清單

後端部署完成後，請測試：
- [ ] 瀏覽器開啟 `https://你的API網址.onrender.com`
- [ ] 能看到 API 資訊頁面
- [ ] 測試新增教具：`POST /api/materials`
- [ ] 測試取得教具：`GET /api/materials`

---

## 📞 需要協助？

如果您在任何步驟遇到問題，請告訴我：
1. 目前進行到哪個步驟
2. 遇到什麼錯誤訊息
3. 您想使用哪種模式（localStorage 或 MongoDB）

我會提供詳細的協助！
