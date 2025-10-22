// ========== 使用 MongoDB API 的版本 ==========

// 區塊切換功能
function showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`.nav-links a[href="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        showSection(targetId);
        history.pushState(null, null, targetId);
    });
});

window.addEventListener('load', function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
});

window.addEventListener('popstate', function() {
    const hash = window.location.hash || '#home';
    showSection(hash);
});

// 表單提交處理
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        alert(`感謝您的留言！\n\n姓名: ${name}\n電子郵件: ${email}\n訊息: ${message}`);
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

// ========== 教材管理功能（使用 MongoDB API）==========

let materials = [];
let optionsData = {};
let currentPhotoData = null;

// 圖片壓縮功能
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // 建立 canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 計算縮放比例
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // 繪製圖片
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // 轉換為 Base64，並壓縮品質
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                // 計算壓縮率
                const originalSize = e.target.result.length;
                const compressedSize = compressedDataUrl.length;
                const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

                console.log(`圖片壓縮完成：原始 ${(originalSize / 1024).toFixed(0)}KB → 壓縮後 ${(compressedSize / 1024).toFixed(0)}KB (縮小 ${compressionRatio}%)`);

                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 照片預覽功能（支援自動壓縮）
function handlePhotoUpload() {
    const photoInput = document.getElementById('materialPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');

    photoInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('照片檔案過大，請選擇小於 10MB 的照片');
                photoInput.value = '';
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('請選擇圖片檔案');
                photoInput.value = '';
                return;
            }

            try {
                // 顯示載入中
                previewImage.src = '';
                photoPreview.style.display = 'block';
                previewImage.alt = '正在壓縮圖片...';

                // 壓縮圖片
                currentPhotoData = await compressImage(file, 800, 0.7);

                // 顯示預覽
                previewImage.src = currentPhotoData;
                previewImage.alt = '照片預覽';

                // 顯示壓縮後的大小
                const sizeKB = (currentPhotoData.length / 1024).toFixed(0);
                console.log(`壓縮後圖片大小: ${sizeKB}KB`);

            } catch (error) {
                console.error('圖片壓縮失敗:', error);
                alert('圖片處理失敗，請重試');
                photoInput.value = '';
                photoPreview.style.display = 'none';
            }
        }
    });
}

function removePhoto() {
    const photoInput = document.getElementById('materialPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');

    photoInput.value = '';
    previewImage.src = '';
    photoPreview.style.display = 'none';
    currentPhotoData = null;
}

// 從 API 載入教材
async function loadMaterials() {
    try {
        materials = await API.get(API_CONFIG.ENDPOINTS.MATERIALS);
        renderMaterials();
    } catch (error) {
        console.error('載入教材失敗:', error);
        showNotification('載入教材失敗，請檢查網路連線', 'error');
    }
}

// 從 API 載入選項
async function loadOptions() {
    try {
        const response = await API.get(API_CONFIG.ENDPOINTS.OPTIONS);
        optionsData = {
            developmentStages: response.developmentStages || [],
            teachingTypes: response.teachingTypes || [],
            materials: response.materials || [],
            areas: response.areas || [],
            purposes: response.purposes || []
        };
        updateFormSelects();
        renderOptions();
    } catch (error) {
        console.error('載入選項失敗:', error);
        showNotification('載入選項失敗，請檢查網路連線', 'error');
    }
}

// 儲存選項到 API
async function saveOptions() {
    try {
        await API.put(API_CONFIG.ENDPOINTS.OPTIONS, optionsData);
    } catch (error) {
        console.error('儲存選項失敗:', error);
        showNotification('儲存選項失敗', 'error');
    }
}

// 渲染教材列表
function renderMaterials(materialsToRender = materials) {
    const materialList = document.getElementById('materialList');
    const materialCount = document.getElementById('materialCount');

    if (!materialList || !materialCount) return;

    materialCount.textContent = `共 ${materialsToRender.length} 筆教具`;
    materialList.innerHTML = '';

    if (materialsToRender.length === 0) {
        materialList.innerHTML = '<p class="empty-message">目前沒有教具，請先新增教具</p>';
        return;
    }

    materialsToRender.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';

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

        let photoHtml = '';
        if (material.photo) {
            photoHtml = `<img src="${material.photo}" alt="${escapeHtml(material.name)}" class="material-photo">`;
        }

        materialItem.innerHTML = `
            ${photoHtml}
            <div class="material-info" style="cursor: pointer;" onclick="viewMaterialDetail('${material._id}')">
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
                <button class="btn-danger" onclick="deleteMaterial('${material._id}')">刪除</button>
            </div>
        `;
        materialList.appendChild(materialItem);
    });
}

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
async function addMaterial(e) {
    e.preventDefault();

    const name = document.getElementById('materialName').value.trim();
    const developmentStage = document.getElementById('developmentStage').value;
    const teachingType = document.getElementById('teachingType').value;
    const material = document.getElementById('material').value;
    const area = document.getElementById('area').value;
    const description = document.getElementById('description').value.trim();

    const purposeCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    if (!name || !developmentStage || !teachingType || !material || !area) {
        alert('請填寫所有必填欄位（標記 * 的欄位）！');
        return;
    }

    const newMaterial = {
        name,
        developmentStage,
        teachingType,
        material,
        area,
        purposes,
        description,
        photo: currentPhotoData
    };

    try {
        await API.post(API_CONFIG.ENDPOINTS.MATERIALS, newMaterial);
        await loadMaterials();
        e.target.reset();
        removePhoto();
        showNotification('教具新增成功！', 'success');
    } catch (error) {
        console.error('新增教具失敗:', error);
        showNotification('新增教具失敗', 'error');
    }
}

// 刪除教材
async function deleteMaterial(id) {
    if (!confirm('確定要刪除這個教具嗎？')) {
        return;
    }

    try {
        await API.delete(`${API_CONFIG.ENDPOINTS.MATERIALS}/${id}`);
        await loadMaterials();
        showNotification('教具已刪除', 'info');
    } catch (error) {
        console.error('刪除教具失敗:', error);
        showNotification('刪除教具失敗', 'error');
    }
}

// 套用篩選條件
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filterStage = document.getElementById('filterStage').value;
    const filterArea = document.getElementById('filterArea').value;
    const filterMaterial = document.getElementById('filterMaterial').value;

    let filteredMaterials = materials.filter(material => {
        const matchesSearch = !searchTerm || material.name.toLowerCase().includes(searchTerm);
        const matchesStage = !filterStage || material.developmentStage === filterStage;
        const matchesArea = !filterArea || material.area === filterArea;
        const matchesMaterial = !filterMaterial || material.material === filterMaterial;

        return matchesSearch && matchesStage && matchesArea && matchesMaterial;
    });

    renderMaterials(filteredMaterials);
}

function searchMaterials() {
    applyFilters();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStage').value = '';
    document.getElementById('filterArea').value = '';
    document.getElementById('filterMaterial').value = '';
    renderMaterials();
}

// 檢視教具詳細資訊
function viewMaterialDetail(id) {
    const material = materials.find(m => m._id === id);
    if (!material) return;

    const modal = document.getElementById('materialModal');
    const modalBody = document.getElementById('modalBody');

    let photoHtml = '';
    if (material.photo) {
        photoHtml = `
            <div class="modal-photo-container">
                <img src="${material.photo}" alt="${escapeHtml(material.name)}" class="modal-photo" onclick="openImageLightbox('${material.photo}')">
                <p style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">點擊圖片可放大檢視</p>
            </div>
        `;
    }

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
            <button class="btn-danger" onclick="deleteFromModal('${material._id}')">刪除此教具</button>
            <button class="btn-secondary" onclick="closeMaterialModal()">關閉</button>
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeMaterialModal() {
    const modal = document.getElementById('materialModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

async function deleteFromModal(id) {
    if (!confirm('確定要刪除這個教具嗎？')) {
        return;
    }

    try {
        await API.delete(`${API_CONFIG.ENDPOINTS.MATERIALS}/${id}`);
        await loadMaterials();
        closeMaterialModal();
        showNotification('教具已刪除', 'info');
    } catch (error) {
        console.error('刪除教具失敗:', error);
        showNotification('刪除教具失敗', 'error');
    }
}

function openImageLightbox(imageSrc) {
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

    lightbox.onclick = function(e) {
        if (e.target === lightbox) {
            closeImageLightbox();
        }
    };
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.classList.remove('show');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('materialModal');
    if (event.target === modal) {
        closeMaterialModal();
    }
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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

// ========== 選項管理功能 ==========

function renderOptions() {
    renderOptionCategory('developmentStages', 'stageList');
    renderOptionCategory('teachingTypes', 'teachingTypeList');
    renderOptionCategory('materials', 'materialOptionList');
    renderOptionCategory('areas', 'areaList');
    renderOptionCategory('purposes', 'purposeList');

    updateFormSelects();
}

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

async function addOption(category, inputId) {
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
    await saveOptions();
    renderOptions();
    input.value = '';
    showNotification('選項新增成功', 'success');
}

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

async function saveOptionEdit(category, index) {
    const itemId = `${category}-${index}`;
    const input = document.getElementById(`edit-${itemId}`);
    const newValue = input.value.trim();

    if (!newValue) {
        alert('選項內容不能為空');
        return;
    }

    if (optionsData[category].includes(newValue) && optionsData[category][index] !== newValue) {
        alert('此選項已存在');
        return;
    }

    const oldValue = optionsData[category][index];
    optionsData[category][index] = newValue;
    await saveOptions();

    updateMaterialsWithOption(category, oldValue, newValue);

    renderOptions();
    showNotification('選項編輯成功', 'success');
}

function cancelOptionEdit(category) {
    renderOptions();
}

async function deleteOption(category, index) {
    const option = optionsData[category][index];

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
    await saveOptions();
    renderOptions();
    showNotification('選項已刪除', 'info');
}

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

async function updateMaterialsWithOption(category, oldValue, newValue) {
    const categoryMap = {
        developmentStages: 'developmentStage',
        teachingTypes: 'teachingType',
        materials: 'material',
        areas: 'area',
        purposes: 'purposes'
    };

    const fieldName = categoryMap[category];
    let updated = false;

    for (let material of materials) {
        let needsUpdate = false;

        if (fieldName === 'purposes') {
            if (material.purposes && material.purposes.includes(oldValue)) {
                const idx = material.purposes.indexOf(oldValue);
                material.purposes[idx] = newValue;
                needsUpdate = true;
            }
        } else {
            if (material[fieldName] === oldValue) {
                material[fieldName] = newValue;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            try {
                await API.put(`${API_CONFIG.ENDPOINTS.MATERIALS}/${material._id}`, material);
                updated = true;
            } catch (error) {
                console.error('更新教具失敗:', error);
            }
        }
    }

    if (updated) {
        await loadMaterials();
    }
}

function updateFormSelects() {
    updateSelect('developmentStage', optionsData.developmentStages);
    updateSelect('filterStage', optionsData.developmentStages, true);

    updateSelect('teachingType', optionsData.teachingTypes);

    updateSelect('material', optionsData.materials);
    updateSelect('filterMaterial', optionsData.materials, true);

    updateSelect('area', optionsData.areas);
    updateSelect('filterArea', optionsData.areas, true);

    updateCheckboxGroup(optionsData.purposes);
}

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

    if (currentValue && options.includes(currentValue)) {
        select.value = currentValue;
    }
}

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

function initOptionsManagement() {
    renderOptions();
}

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

// 初始化教材管理功能
function initMaterialManagement() {
    handlePhotoUpload();

    const addForm = document.getElementById('addMaterialForm');
    if (addForm) {
        addForm.addEventListener('submit', addMaterial);
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchMaterials);
    }

    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMaterials();
            }
        });
    }

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

    // 從 API 載入資料
    loadMaterials();
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
        await loadOptions();
        initMaterialManagement();
        initOptionsManagement();
    });
} else {
    (async function() {
        await loadOptions();
        initMaterialManagement();
        initOptionsManagement();
    })();
}
