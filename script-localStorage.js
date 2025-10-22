// 區塊切換功能
function showSection(sectionId) {
    // 隱藏所有區塊
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // 顯示指定區塊
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        // 滾動到頂部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 更新導航列active狀態
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-links a[href="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// 導航連結點擊事件
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        showSection(targetId);

        // 更新 URL hash（不觸發頁面跳轉）
        history.pushState(null, null, targetId);
    });
});

// 頁面載入時根據 URL hash 顯示對應區塊
window.addEventListener('load', function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
});

// 處理瀏覽器前進/後退按鈕
window.addEventListener('popstate', function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
});

// 表單提交處理
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 獲取表單數據
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;

        // 顯示提交訊息
        alert(`感謝您的留言！\n\n姓名: ${name}\n電子郵件: ${email}\n訊息: ${message}`);

        // 清空表單
        this.reset();
    });
}

// CTA 按鈕點擊事件
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function() {
        showSection('#materials');
        history.pushState(null, null, '#materials');
    });
}

// 滾動時導航列樣式變化
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.backgroundColor = '#1a252f';
    } else {
        header.style.backgroundColor = '#2c3e50';
    }

    lastScroll = currentScroll;
});

// 頁面載入動畫
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 服務卡片互動效果
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.borderLeft = '4px solid #667eea';
    });

    card.addEventListener('mouseleave', function() {
        this.style.borderLeft = 'none';
    });
});

console.log('網頁已成功載入！');

// ========== 教材管理功能 ==========

// 教材資料儲存（使用 localStorage）
let materials = JSON.parse(localStorage.getItem('materials')) || [];
let currentPhotoData = null; // 暫存當前選擇的照片

// 選項資料儲存（使用 localStorage）
let optionsData = JSON.parse(localStorage.getItem('optionsData')) || {
    developmentStages: ['嬰幼兒（0-3歲）', '學齡前兒童（3-6歲）', '學齡兒童（6-12歲）', '青少年（12歲以上）'],
    teachingTypes: ['個人教具', '團體教具', '混合使用'],
    materials: ['紙類', '布類', '木製', '塑膠', '金屬', '混合材質', '其他'],
    areas: ['日常生活區', '感官區', '數學區', '語文區', '文化區', '藝術區', '科學區', '其他'],
    purposes: ['培養獨立性', '感官辨識', '數學邏輯', '語文能力', '世界觀拓展', '精細動作', '大肌肉發展', '創造力', '社交能力', '專注力']
};

// 儲存選項資料
function saveOptions() {
    localStorage.setItem('optionsData', JSON.stringify(optionsData));
}

// 生成唯一 ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 照片預覽功能
function handlePhotoUpload() {
    const photoInput = document.getElementById('materialPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 檢查檔案大小（限制 5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('照片檔案過大，請選擇小於 5MB 的照片');
                photoInput.value = '';
                return;
            }

            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案');
                photoInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                currentPhotoData = event.target.result;
                previewImage.src = currentPhotoData;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// 移除照片
function removePhoto() {
    const photoInput = document.getElementById('materialPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');

    photoInput.value = '';
    previewImage.src = '';
    photoPreview.style.display = 'none';
    currentPhotoData = null;
}

// 儲存教材到 localStorage
function saveMaterials() {
    localStorage.setItem('materials', JSON.stringify(materials));
}

// 渲染教材列表
function renderMaterials(materialsToRender = materials) {
    const materialList = document.getElementById('materialList');
    const materialCount = document.getElementById('materialCount');

    if (!materialList || !materialCount) return;

    // 更新數量
    materialCount.textContent = `共 ${materialsToRender.length} 筆教具`;

    // 清空列表
    materialList.innerHTML = '';

    if (materialsToRender.length === 0) {
        materialList.innerHTML = '<p class="empty-message">目前沒有教具，請先新增教具</p>';
        return;
    }

    // 渲染每個教材項目
    materialsToRender.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';

        // 生成教學目的標籤
        let purposesHtml = '';
        if (material.purposes && material.purposes.length > 0) {
            purposesHtml = `
                <div class="material-purposes">
                    <div class="purpose-tags">
                        ${material.purposes.map(purpose => `<span class="purpose-tag">${escapeHtml(purpose)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // 生成照片HTML
        let photoHtml = '';
        if (material.photo) {
            photoHtml = `<img src="${material.photo}" alt="${escapeHtml(material.name)}" class="material-photo">`;
        }

        materialItem.innerHTML = `
            ${photoHtml}
            <div class="material-info" style="cursor: pointer;" onclick="viewMaterialDetail('${material.id}')">
                <h4>${escapeHtml(material.name)}</h4>
                <div class="material-meta">
                    <span class="material-badge badge-stage">${escapeHtml(material.developmentStage)}</span>
                    <span class="material-badge badge-area">${escapeHtml(material.area)}</span>
                    <span class="material-badge badge-material">${escapeHtml(material.material)}</span>
                    <span class="material-badge badge-type">${escapeHtml(material.teachingType)}</span>
                </div>
                ${purposesHtml}
                ${material.description ? `<p class="material-description">${escapeHtml(material.description)}</p>` : ''}
            </div>
            <div class="material-actions">
                <button class="btn-danger" onclick="deleteMaterial('${material.id}')">刪除</button>
            </div>
        `;
        materialList.appendChild(materialItem);
    });
}

// HTML 轉義函數（防止 XSS）
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 新增教材
function addMaterial(e) {
    e.preventDefault();

    const name = document.getElementById('materialName').value.trim();
    const developmentStage = document.getElementById('developmentStage').value;
    const teachingType = document.getElementById('teachingType').value;
    const material = document.getElementById('material').value;
    const area = document.getElementById('area').value;
    const description = document.getElementById('description').value.trim();

    // 獲取選中的教學目的
    const purposeCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    if (!name || !developmentStage || !teachingType || !material || !area) {
        alert('請填寫所有必填欄位（標記 * 的欄位）！');
        return;
    }

    const newMaterial = {
        id: generateId(),
        name: name,
        developmentStage: developmentStage,
        teachingType: teachingType,
        material: material,
        area: area,
        purposes: purposes,
        description: description,
        photo: currentPhotoData, // 儲存照片的 base64 資料
        createdAt: new Date().toISOString()
    };

    materials.unshift(newMaterial); // 新增到陣列開頭
    saveMaterials();
    renderMaterials();

    // 清空表單和照片
    e.target.reset();
    removePhoto();

    // 顯示成功訊息
    showNotification('教具新增成功！', 'success');
}

// 刪除教材
function deleteMaterial(id) {
    if (!confirm('確定要刪除這個教具嗎？')) {
        return;
    }

    materials = materials.filter(material => material.id !== id);
    saveMaterials();
    applyFilters(); // 刪除後重新套用篩選

    showNotification('教具已刪除', 'info');
}

// 套用篩選條件
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filterStage = document.getElementById('filterStage').value;
    const filterArea = document.getElementById('filterArea').value;
    const filterMaterial = document.getElementById('filterMaterial').value;

    let filteredMaterials = materials.filter(material => {
        // 搜尋名稱
        const matchesSearch = !searchTerm || material.name.toLowerCase().includes(searchTerm);

        // 篩選發展階段
        const matchesStage = !filterStage || material.developmentStage === filterStage;

        // 篩選使用領域
        const matchesArea = !filterArea || material.area === filterArea;

        // 篩選材質
        const matchesMaterial = !filterMaterial || material.material === filterMaterial;

        return matchesSearch && matchesStage && matchesArea && matchesMaterial;
    });

    renderMaterials(filteredMaterials);
}

// 搜尋教材
function searchMaterials() {
    applyFilters();
}

// 清除搜尋和篩選
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStage').value = '';
    document.getElementById('filterArea').value = '';
    document.getElementById('filterMaterial').value = '';
    renderMaterials();
}

// 檢視教具詳細資訊
function viewMaterialDetail(id) {
    const material = materials.find(m => m.id === id);
    if (!material) return;

    const modal = document.getElementById('materialModal');
    const modalBody = document.getElementById('modalBody');

    // 生成照片 HTML
    let photoHtml = '';
    if (material.photo) {
        photoHtml = `
            <div class="modal-photo-container">
                <img src="${material.photo}" alt="${escapeHtml(material.name)}" class="modal-photo" onclick="openImageLightbox('${material.photo}')">
                <p style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">點擊圖片可放大檢視</p>
            </div>
        `;
    }

    // 生成教學目的 HTML
    let purposesHtml = '';
    if (material.purposes && material.purposes.length > 0) {
        purposesHtml = `
            <div class="modal-purposes-section">
                <div class="modal-purposes-title">教學目的/功能</div>
                <div class="modal-purpose-tags">
                    ${material.purposes.map(purpose => `<span class="modal-purpose-tag">${escapeHtml(purpose)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // 生成備註說明 HTML
    let descriptionHtml = '';
    if (material.description) {
        descriptionHtml = `
            <div class="modal-description-section">
                <div class="modal-description-title">備註說明</div>
                <div class="modal-description-text">${escapeHtml(material.description)}</div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        ${photoHtml}
        <h2 class="modal-title">${escapeHtml(material.name)}</h2>

        <div class="modal-info-grid">
            <div class="modal-info-item">
                <div class="modal-info-label">發展階段</div>
                <div class="modal-info-value">${escapeHtml(material.developmentStage)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">教學型態</div>
                <div class="modal-info-value">${escapeHtml(material.teachingType)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">材質</div>
                <div class="modal-info-value">${escapeHtml(material.material)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">使用領域</div>
                <div class="modal-info-value">${escapeHtml(material.area)}</div>
            </div>
        </div>

        ${purposesHtml}
        ${descriptionHtml}

        <div class="modal-actions">
            <button class="btn-danger" onclick="deleteFromModal('${material.id}')">刪除此教具</button>
            <button class="btn-secondary" onclick="closeMaterialModal()">關閉</button>
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 防止背景滾動
}

// 關閉模態視窗
function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// 從模態視窗刪除教具
function deleteFromModal(id) {
    if (!confirm('確定要刪除這個教具嗎？')) {
        return;
    }

    materials = materials.filter(material => material.id !== id);
    saveMaterials();
    applyFilters();
    closeMaterialModal();
    showNotification('教具已刪除', 'info');
}

// 開啟圖片放大視窗
function openImageLightbox(imageSrc) {
    // 創建圖片放大視窗
    let lightbox = document.getElementById('imageLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <span class="lightbox-close" onclick="closeImageLightbox()">&times;</span>
            <img src="" alt="放大圖片" class="lightbox-image" id="lightboxImage">
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = imageSrc;
    lightbox.classList.add('show');

    // 點擊背景關閉
    lightbox.onclick = function(e) {
        if (e.target === lightbox) {
            closeImageLightbox();
        }
    };
}

// 關閉圖片放大視窗
function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
    }
}

// 點擊模態視窗背景關閉
window.onclick = function(event) {
    const modal = document.getElementById('materialModal');
    if (event.target === modal) {
        closeMaterialModal();
    }
}

// 顯示通知訊息
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // 3秒後自動移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化教材管理功能
function initMaterialManagement() {
    // 初始化照片上傳功能
    handlePhotoUpload();

    // 綁定新增教材表單
    const addForm = document.getElementById('addMaterialForm');
    if (addForm) {
        addForm.addEventListener('submit', addMaterial);
    }

    // 綁定搜尋按鈕
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchMaterials);
    }

    // 綁定清除搜尋按鈕
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    // 綁定搜尋框 Enter 鍵
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMaterials();
            }
        });
    }

    // 綁定篩選下拉選單
    const filterStage = document.getElementById('filterStage');
    const filterArea = document.getElementById('filterArea');
    const filterMaterial = document.getElementById('filterMaterial');

    if (filterStage) {
        filterStage.addEventListener('change', applyFilters);
    }
    if (filterArea) {
        filterArea.addEventListener('change', applyFilters);
    }
    if (filterMaterial) {
        filterMaterial.addEventListener('change', applyFilters);
    }

    // 初始渲染
    renderMaterials();
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initMaterialManagement();
        initOptionsManagement();
    });
} else {
    initMaterialManagement();
    initOptionsManagement();
}

// ========== 選項管理功能 ==========

// 渲染選項列表
function renderOptions() {
    renderOptionCategory('developmentStages', 'stageList');
    renderOptionCategory('teachingTypes', 'teachingTypeList');
    renderOptionCategory('materials', 'materialOptionList');
    renderOptionCategory('areas', 'areaList');
    renderOptionCategory('purposes', 'purposeList');

    // 同時更新教具表單中的下拉選單
    updateFormSelects();
}

// 渲染單一選項分類
function renderOptionCategory(category, listId) {
    const list = document.getElementById(listId);
    if (!list) return;

    list.innerHTML = '';

    if (optionsData[category].length === 0) {
        list.innerHTML = '<li class="option-empty">目前沒有選項</li>';
        return;
    }

    optionsData[category].forEach((option, index) => {
        const li = document.createElement('li');
        li.className = 'option-item';
        li.id = `${category}-${index}`;
        li.innerHTML = `
            <span class="option-text">${escapeHtml(option)}</span>
            <div class="option-actions">
                <button class="btn-edit" onclick="editOption('${category}', ${index})">編輯</button>
                <button class="btn-delete" onclick="deleteOption('${category}', ${index})">刪除</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// 新增選項
function addOption(category, inputId) {
    const input = document.getElementById(inputId);
    const value = input.value.trim();

    if (!value) {
        alert('請輸入選項內容');
        return;
    }

    if (optionsData[category].includes(value)) {
        alert('此選項已存在');
        return;
    }

    optionsData[category].push(value);
    saveOptions();
    renderOptions();
    input.value = '';
    showNotification('選項新增成功', 'success');
}

// 編輯選項
function editOption(category, index) {
    const itemId = `${category}-${index}`;
    const item = document.getElementById(itemId);
    const currentValue = optionsData[category][index];

    item.className = 'option-item editing';
    item.innerHTML = `
        <input type="text" class="option-edit-input" id="edit-${itemId}" value="${escapeHtml(currentValue)}">
        <div class="option-actions">
            <button class="btn-save" onclick="saveOptionEdit('${category}', ${index})">儲存</button>
            <button class="btn-cancel" onclick="cancelOptionEdit('${category}')">取消</button>
        </div>
    `;

    document.getElementById(`edit-${itemId}`).focus();
}

// 儲存編輯
function saveOptionEdit(category, index) {
    const itemId = `${category}-${index}`;
    const input = document.getElementById(`edit-${itemId}`);
    const newValue = input.value.trim();

    if (!newValue) {
        alert('選項內容不能為空');
        return;
    }

    // 檢查是否與其他選項重複
    if (optionsData[category].includes(newValue) && optionsData[category][index] !== newValue) {
        alert('此選項已存在');
        return;
    }

    const oldValue = optionsData[category][index];
    optionsData[category][index] = newValue;
    saveOptions();

    // 更新所有使用此選項的教具
    updateMaterialsWithOption(category, oldValue, newValue);

    renderOptions();
    showNotification('選項編輯成功', 'success');
}

// 取消編輯
function cancelOptionEdit(category) {
    renderOptions();
}

// 刪除選項
function deleteOption(category, index) {
    const option = optionsData[category][index];

    // 檢查是否有教具使用此選項
    const isUsed = checkOptionInUse(category, option);
    if (isUsed) {
        if (!confirm(`此選項「${option}」正在被使用中，刪除後使用此選項的教具資料可能不完整。\n\n確定要刪除嗎？`)) {
            return;
        }
    } else {
        if (!confirm(`確定要刪除「${option}」嗎？`)) {
            return;
        }
    }

    optionsData[category].splice(index, 1);
    saveOptions();
    renderOptions();
    showNotification('選項已刪除', 'info');
}

// 檢查選項是否被使用
function checkOptionInUse(category, option) {
    const categoryMap = {
        developmentStages: 'developmentStage',
        teachingTypes: 'teachingType',
        materials: 'material',
        areas: 'area',
        purposes: 'purposes'
    };

    const fieldName = categoryMap[category];

    return materials.some(material => {
        if (fieldName === 'purposes') {
            return material.purposes && material.purposes.includes(option);
        } else {
            return material[fieldName] === option;
        }
    });
}

// 更新使用此選項的教具
function updateMaterialsWithOption(category, oldValue, newValue) {
    const categoryMap = {
        developmentStages: 'developmentStage',
        teachingTypes: 'teachingType',
        materials: 'material',
        areas: 'area',
        purposes: 'purposes'
    };

    const fieldName = categoryMap[category];

    materials.forEach(material => {
        if (fieldName === 'purposes') {
            if (material.purposes && material.purposes.includes(oldValue)) {
                const index = material.purposes.indexOf(oldValue);
                material.purposes[index] = newValue;
            }
        } else {
            if (material[fieldName] === oldValue) {
                material[fieldName] = newValue;
            }
        }
    });

    saveMaterials();
}

// 更新表單中的下拉選單和複選框
function updateFormSelects() {
    // 更新發展階段下拉選單
    updateSelect('developmentStage', optionsData.developmentStages);
    updateSelect('filterStage', optionsData.developmentStages, true);

    // 更新教學型態下拉選單
    updateSelect('teachingType', optionsData.teachingTypes);

    // 更新材質下拉選單
    updateSelect('material', optionsData.materials);
    updateSelect('filterMaterial', optionsData.materials, true);

    // 更新使用領域下拉選單
    updateSelect('area', optionsData.areas);
    updateSelect('filterArea', optionsData.areas, true);

    // 更新教學目的複選框
    updateCheckboxGroup(optionsData.purposes);
}

// 更新下拉選單
function updateSelect(selectId, options, includeAll = false) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '';

    if (includeAll) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = selectId.includes('Stage') ? '所有發展階段' :
                                   selectId.includes('Area') ? '所有使用領域' :
                                   '所有材質';
        select.appendChild(defaultOption);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇' + select.previousElementSibling.textContent.replace(' *', '');
        select.appendChild(defaultOption);
    }

    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        select.appendChild(optionEl);
    });

    // 恢復之前的選擇（如果還存在）
    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// 更新複選框群組
function updateCheckboxGroup(purposes) {
    const checkboxGroup = document.querySelector('.checkbox-group');
    if (!checkboxGroup) return;

    checkboxGroup.innerHTML = '';

    purposes.forEach(purpose => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        label.innerHTML = `
            <input type="checkbox" value="${escapeHtml(purpose)}"> ${escapeHtml(purpose)}
        `;
        checkboxGroup.appendChild(label);
    });
}

// 初始化選項管理
function initOptionsManagement() {
    renderOptions();
}

// 在新增教具時使用 Enter 鍵提交
document.addEventListener('keypress', function(e) {
    if (e.target.classList.contains('option-input') && e.key === 'Enter') {
        e.preventDefault();
        const inputId = e.target.id;
        const categoryMap = {
            'newStage': 'developmentStages',
            'newTeachingType': 'teachingTypes',
            'newMaterial': 'materials',
            'newArea': 'areas',
            'newPurpose': 'purposes'
        };
        const category = categoryMap[inputId];
        if (category) {
            addOption(category, inputId);
        }
    }
});
