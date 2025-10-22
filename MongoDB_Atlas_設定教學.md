# MongoDB Atlas 設定教學

## 重要說明

由於您的網站是純前端（HTML/CSS/JavaScript），無法直接連接 MongoDB Atlas（出於安全考量）。

需要建立一個後端 API 伺服器來處理資料庫操作。

---

## 步驟一：建立 MongoDB Atlas 帳號

1. 前往 https://www.mongodb.com/cloud/atlas
2. 點擊 "Try Free" 註冊免費帳號
3. 選擇 "Free Shared Cluster"（免費方案，512MB 儲存空間）
4. 選擇雲端提供商和區域（建議選擇 AWS - Tokyo 或 Singapore）
5. 集群名稱可以保持預設或改為 "JiaoJiao"
6. 點擊 "Create Cluster"（建立需要 3-5 分鐘）

---

## 步驟二：設定資料庫存取權限

### 1. 建立資料庫使用者
1. 左側選單點擊 "Database Access"
2. 點擊 "Add New Database User"
3. 選擇 "Password" 驗證方式
4. 設定使用者名稱（例如：jiaojiao_user）
5. 設定強密碼（請記下來）
6. Database User Privileges 選擇 "Read and write to any database"
7. 點擊 "Add User"

### 2. 設定網路存取
1. 左側選單點擊 "Network Access"
2. 點擊 "Add IP Address"
3. 選擇 "Allow Access from Anywhere"（開發測試用）
   - IP Address: `0.0.0.0/0`
4. 點擊 "Confirm"

**注意：** 生產環境應該只允許特定 IP 存取

---

## 步驟三：取得連接字串

1. 回到 "Database" 頁面
2. 點擊 "Connect" 按鈕
3. 選擇 "Connect your application"
4. Driver 選擇 "Node.js"
5. 複製連接字串（類似下面格式）：

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. 將 `<username>` 和 `<password>` 替換為您建立的使用者資訊

---

## 步驟四：建立後端 API 伺服器

由於安全性考量，您需要建立一個後端伺服器來處理資料庫操作。

### 技術選擇：

1. **Node.js + Express**（最推薦，最容易）
2. Python + Flask
3. PHP

我已經為您準備了完整的 Node.js 後端程式碼（請參考接下來建立的檔案）。

---

## 下一步

我將為您建立：
1. ✅ 後端 API 伺服器程式碼（Node.js + Express）
2. ✅ 修改前端程式碼以連接 API
3. ✅ 完整的部署說明

請確認您是否：
- [ ] 已建立 MongoDB Atlas 帳號
- [ ] 已取得連接字串
- [ ] 準備好建立後端伺服器

---

## 部署後端的選擇

### 免費後端託管服務：

1. **Render.com**（最推薦）
   - 完全免費
   - 自動部署
   - 支援 Node.js

2. **Railway.app**
   - 免費額度充足
   - 簡單易用

3. **Vercel**（Serverless Functions）
   - 免費
   - 自動擴展

4. **Heroku**（有限免費）
   - 需要信用卡驗證
   - 閒置會休眠

---

## 總架構

```
[前端網站]           [後端 API]              [MongoDB Atlas]
(HTML/CSS/JS)  →→→  (Node.js/Express)  →→→  (雲端資料庫)
  Netlify            Render.com             MongoDB Atlas
```

準備好後，我會為您建立所有需要的程式碼！
