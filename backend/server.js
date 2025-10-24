require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // 支援照片上傳（Base64）

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB 連接成功'))
.catch(err => console.error('❌ MongoDB 連接失敗:', err));

// 教具 Schema
const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    developmentStage: { type: String, required: true },
    teachingType: { type: String, required: true },
    material: { type: String, required: true },
    area: { type: String, required: true },
    purposes: [String],
    description: String,
    photo: String, // Base64 編碼的照片
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Material = mongoose.model('Material', materialSchema);

// 選項 Schema
const optionsSchema = new mongoose.Schema({
    userId: { type: String, default: 'default' }, // 未來可支援多用戶
    developmentStages: [String],
    teachingTypes: [String],
    materials: [String],
    areas: [String],
    purposes: [String]
}, { timestamps: true });

const Options = mongoose.model('Options', optionsSchema);

// 個案 Schema
const caseSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 姓名
    nickname: { type: String, required: true }, // 暱稱
    address: { type: String, required: true }, // 地址
    contactName: { type: String, required: true }, // 聯絡人姓名
    contactPhone: { type: String, required: true }, // 聯絡人電話
    developmentStage: { type: String, required: true }, // 發展階段
    purposes: [String], // 教學目的/功能（陣列）
    photo: String, // Base64 編碼的照片
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Case = mongoose.model('Case', caseSchema);

// ==================== API 路由 ====================

// 首頁
app.get('/', (req, res) => {
    res.json({
        message: '家教工具庫 API',
        version: '1.0.0',
        endpoints: {
            materials: '/api/materials',
            options: '/api/options',
            cases: '/api/cases',
            health: '/api/health'
        }
    });
});

// 健康檢查 API（檢查 MongoDB 連接狀態）
app.get('/api/health', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const isConnected = dbState === 1;

    res.status(isConnected ? 200 : 503).json({
        status: isConnected ? 'ok' : 'error',
        database: {
            connected: isConnected,
            state: dbState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
            stateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown'
        },
        timestamp: new Date().toISOString()
    });
});

// ========== 教具管理 API ==========

// 取得所有教具
app.get('/api/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: '取得教具失敗', message: error.message });
    }
});

// 新增教具
app.post('/api/materials', async (req, res) => {
    try {
        const material = new Material(req.body);
        await material.save();
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ error: '新增教具失敗', message: error.message });
    }
});

// 更新教具
app.put('/api/materials/:id', async (req, res) => {
    try {
        const material = await Material.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!material) {
            return res.status(404).json({ error: '教具不存在' });
        }
        res.json(material);
    } catch (error) {
        res.status(400).json({ error: '更新教具失敗', message: error.message });
    }
});

// 刪除教具
app.delete('/api/materials/:id', async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id);
        if (!material) {
            return res.status(404).json({ error: '教具不存在' });
        }
        res.json({ message: '教具已刪除', material });
    } catch (error) {
        res.status(500).json({ error: '刪除教具失敗', message: error.message });
    }
});

// ========== 選項管理 API ==========

// 取得選項
app.get('/api/options', async (req, res) => {
    try {
        let options = await Options.findOne({ userId: 'default' });

        // 如果不存在，建立預設選項
        if (!options) {
            options = new Options({
                userId: 'default',
                developmentStages: ['嬰幼兒（0-3歲）', '學齡前兒童（3-6歲）', '學齡兒童（6-12歲）', '青少年（12歲以上）'],
                teachingTypes: ['個人教具', '團體教具', '混合使用'],
                materials: ['紙類', '布類', '木製', '塑膠', '金屬', '混合材質', '其他'],
                areas: ['日常生活區', '感官區', '數學區', '語文區', '文化區', '藝術區', '科學區', '其他'],
                purposes: ['培養獨立性', '感官辨識', '數學邏輯', '語文能力', '世界觀拓展', '精細動作', '大肌肉發展', '創造力', '社交能力', '專注力']
            });
            await options.save();
        }

        res.json(options);
    } catch (error) {
        res.status(500).json({ error: '取得選項失敗', message: error.message });
    }
});

// 更新選項
app.put('/api/options', async (req, res) => {
    try {
        let options = await Options.findOne({ userId: 'default' });

        if (!options) {
            options = new Options({ userId: 'default', ...req.body });
        } else {
            Object.assign(options, req.body);
        }

        await options.save();
        res.json(options);
    } catch (error) {
        res.status(400).json({ error: '更新選項失敗', message: error.message });
    }
});

// ========== 個案管理 API ==========

// 取得所有個案
app.get('/api/cases', async (_req, res) => {
    try {
        const cases = await Case.find().sort({ createdAt: -1 });
        res.json(cases);
    } catch (error) {
        res.status(500).json({ error: '取得個案失敗', message: error.message });
    }
});

// 新增個案
app.post('/api/cases', async (req, res) => {
    try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        res.status(201).json(savedCase);
    } catch (error) {
        res.status(400).json({ error: '新增個案失敗', message: error.message });
    }
});

// 更新個案
app.put('/api/cases/:id', async (req, res) => {
    try {
        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCase) {
            return res.status(404).json({ error: '找不到此個案' });
        }

        res.json(updatedCase);
    } catch (error) {
        res.status(400).json({ error: '更新個案失敗', message: error.message });
    }
});

// 刪除個案
app.delete('/api/cases/:id', async (req, res) => {
    try {
        const deletedCase = await Case.findByIdAndDelete(req.params.id);

        if (!deletedCase) {
            return res.status(404).json({ error: '找不到此個案' });
        }

        res.json({ message: '個案已刪除', case: deletedCase });
    } catch (error) {
        res.status(500).json({ error: '刪除個案失敗', message: error.message });
    }
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '伺服器錯誤', message: err.message });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({ error: '找不到此路由' });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
    console.log(`📝 API 文件：http://localhost:${PORT}`);
});
