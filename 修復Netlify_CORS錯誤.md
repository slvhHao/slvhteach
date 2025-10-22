# 修復 Netlify 網站 CORS 錯誤

## 🔴 問題說明

當您在 Netlify 開啟網站時出現錯誤：
```
載入教材失敗，請檢查網路連線
```

這是因為後端 API（Render.com）的 **CORS 設定** 不允許來自 Netlify 的請求。

---

## 🔧 快速修復步驟（5 分鐘）

### 步驟 1: 找到您的 Netlify 網址

1. 登入 Netlify (https://app.netlify.com)
2. 點選您的網站
3. 複製網站網址，格式類似：
   ```
   https://your-site-name.netlify.app
   ```
   或
   ```
   https://random-name-123456.netlify.app
   ```

### 步驟 2: 更新 Render.com 環境變數

1. **登入 Render.com**
   - 前往 https://dashboard.render.com

2. **選擇您的服務**
   - 點選 `slvhteach`（或您的服務名稱）

3. **進入環境變數設定**
   - 點選左側選單的 **「Environment」**

4. **找到 FRONTEND_URL 變數**
   - 在環境變數列表中找到 `FRONTEND_URL`
   - 目前的值可能是 `*`

5. **更新為您的 Netlify 網址**
   - 點選 `FRONTEND_URL` 右側的 **「Edit」** 按鈕
   - 將值改為您的 Netlify 網址（**不要**加斜線）
   - 例如：
     ```
     https://jiaojiao-tools.netlify.app
     ```
   - **注意**：
     - ✅ 正確：`https://jiaojiao-tools.netlify.app`
     - ❌ 錯誤：`https://jiaojiao-tools.netlify.app/`（結尾有斜線）
     - ❌ 錯誤：`jiaojiao-tools.netlify.app`（缺少 https://）

6. **儲存變更**
   - 點選 **「Save Changes」**

### 步驟 3: 等待重新部署

1. Render.com 會自動重新部署服務
2. 在服務頁面可以看到部署進度
3. 等待約 **2-3 分鐘**
4. 當狀態顯示 **「Live」** 表示完成

### 步驟 4: 測試網站

1. **清除瀏覽器快取**
   - 按 `Ctrl + Shift + Delete`
   - 選擇「快取的圖片和檔案」
   - 清除快取

2. **重新開啟 Netlify 網站**
   - 開啟您的 Netlify 網址
   - 按 `F12` 打開開發者工具
   - 切換到 **Console** 標籤

3. **測試功能**
   - 點選「選項管理」
   - 應該會看到預設選項載入
   - Console 不應該有紅色錯誤訊息

---

## 🎯 完整的環境變數設定

在 Render.com 的 Environment 頁面，確認以下設定：

| 變數名稱 | 值 | 說明 |
|---------|-----|------|
| `MONGODB_URI` | `mongodb+srv://slvhteach:Ware%40turn8888@cluster0.3r5skjs.mongodb.net/jiaojiao?retryWrites=true&w=majority&appName=Cluster0` | MongoDB 連線字串 |
| `PORT` | `3000` | 伺服器埠號 |
| `FRONTEND_URL` | **`https://your-site.netlify.app`** | **這個要改成您的 Netlify 網址** |
| `NODE_ENV` | `production` | 執行環境 |

---

## 🔍 如何確認 CORS 是否正常

### 方法 1: 使用瀏覽器開發者工具

1. 在 Netlify 網站按 `F12`
2. 切換到 **Network** 標籤
3. 重新整理頁面（F5）
4. 查看 API 請求（materials、options）
5. 點選請求查看詳細資訊

**成功的情況**：
- Status: `200 OK`
- Response Headers 包含：
  ```
  access-control-allow-origin: https://your-site.netlify.app
  ```

**失敗的情況**：
- Status: `(failed)` 或紅色
- Console 顯示錯誤：
  ```
  Access to fetch at 'https://slvhteach.onrender.com/api/materials'
  from origin 'https://your-site.netlify.app' has been blocked by CORS policy
  ```

### 方法 2: 使用 curl 測試（進階）

```bash
# 測試 CORS 預檢請求
curl -X OPTIONS https://slvhteach.onrender.com/api/materials \
  -H "Origin: https://your-site.netlify.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

應該會看到回應中包含：
```
access-control-allow-origin: https://your-site.netlify.app
```

---

## 🐛 常見問題排解

### 問題 1: 更新後還是無法連線

**檢查事項**：
1. 確認 Render.com 服務狀態為「Live」
2. 確認 FRONTEND_URL 沒有打錯字
3. 確認 FRONTEND_URL 沒有結尾斜線
4. 等待 3-5 分鐘讓部署完全生效
5. 清除瀏覽器快取後重試

**解決方法**：
```bash
# 暫時改回允許所有來源（測試用）
FRONTEND_URL=*
```

如果這樣可以連線，表示是 CORS 設定問題，再仔細檢查 Netlify 網址是否正確。

### 問題 2: Render.com 找不到 FRONTEND_URL 變數

**解決方法**：
1. 在 Render.com → Environment
2. 點選 **「Add Environment Variable」**
3. Key: `FRONTEND_URL`
4. Value: `https://your-site.netlify.app`
5. 點選 **「Save Changes」**

### 問題 3: 有時候可以連線，有時候不行

**原因**：Render.com 免費方案會休眠

**解決方法**：
- 第一次訪問等待 30-60 秒
- 或升級到付費方案

### 問題 4: API 網址設定錯誤

**檢查 api-config.js**：

開啟瀏覽器 Console，輸入：
```javascript
console.log(API_CONFIG.BASE_URL);
```

應該顯示：
```
https://slvhteach.onrender.com/api
```

如果不是，請確認 [api-config.js](c:\Users\sullivan\Desktop\家教\api-config.js) 的第 10 行設定正確。

---

## 🔐 安全性說明

### 為什麼要設定 FRONTEND_URL？

1. **安全性**：防止其他網站呼叫您的 API
2. **資源保護**：只允許您的前端網站使用 API
3. **最佳實踐**：符合 CORS 安全標準

### 多個網域怎麼辦？

如果您需要允許多個網域（例如測試站和正式站），有兩個選擇：

#### 選項 A: 修改後端程式碼（推薦）

編輯 [backend/server.js](c:\Users\sullivan\Desktop\家教\backend\server.js)：

```javascript
// 允許多個來源
const allowedOrigins = [
    'https://jiaojiao-tools.netlify.app',
    'https://test-site.netlify.app',
    'http://localhost:5500'  // 本地測試
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

#### 選項 B: 使用萬用字元（不建議用於生產環境）

```
FRONTEND_URL=*
```

這會允許任何網站呼叫您的 API，比較不安全。

---

## 📊 檢查清單

部署完成後，請確認以下事項：

**Render.com 設定**：
- [ ] 服務狀態顯示「Live」
- [ ] FRONTEND_URL 設定為正確的 Netlify 網址
- [ ] 沒有結尾斜線
- [ ] 包含 https:// 前綴
- [ ] MongoDB Atlas IP 白名單設定為 0.0.0.0/0

**Netlify 設定**：
- [ ] 網站已成功部署
- [ ] 可以正常開啟網站

**前端設定**：
- [ ] api-config.js 的線上 API 網址正確
- [ ] 指向 https://slvhteach.onrender.com/api

**功能測試**：
- [ ] 選項管理可以載入預設選項
- [ ] 可以新增教材
- [ ] 可以查看教材列表
- [ ] 瀏覽器 Console 沒有 CORS 錯誤

---

## 🎉 完成！

當所有項目都打勾後，您的網站應該就可以正常運作了！

### 您的系統網址

- **前端網站**: https://your-site.netlify.app
- **後端 API**: https://slvhteach.onrender.com
- **資料庫**: MongoDB Atlas

現在可以分享前端網址給其他人使用了！

---

## 📞 還是有問題？

### 取得詳細錯誤訊息

1. 在 Netlify 網站按 `F12`
2. 切換到 **Console** 標籤
3. 截圖完整錯誤訊息
4. 檢查錯誤訊息中是否包含：
   - `CORS policy`
   - `Failed to fetch`
   - `Network error`
   - 具體的 HTTP 狀態碼

### 檢查後端日誌

1. 登入 Render.com
2. 選擇您的服務
3. 點選 **「Logs」**
4. 查看最新的錯誤訊息

常見的後端錯誤：
- MongoDB 連線失敗
- 環境變數未設定
- 程式碼錯誤

---

祝部署成功！ 🚀
