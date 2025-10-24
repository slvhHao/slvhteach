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

        // 如果是首頁，同時顯示服務區塊
        if (sectionId === '#home') {
            const servicesSection = document.querySelector('#services');
            if (servicesSection) {
                servicesSection.style.display = 'block';
            }
        }

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

        // 手機版：關閉選單
        closeMobileMenu();
    });
});

// 手機版選單功能
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

function closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    }
}

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

// ========== 個案管理功能 ==========

let cases = [];
let currentCasePhotoData = null;
let currentEditCasePhotoData = null;

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
                <button class="btn-edit" onclick="editMaterial('${material._id}')">編輯</button>
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

    // 取得按鈕和載入元素
    const submitBtn = document.getElementById('addMaterialBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // 防止重複提交
    if (submitBtn.disabled) {
        return;
    }

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
        // 顯示載入狀態
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        await API.post(API_CONFIG.ENDPOINTS.MATERIALS, newMaterial);
        await loadMaterials();
        e.target.reset();
        removePhoto();
        showNotification('教具新增成功！', 'success');
    } catch (error) {
        console.error('新增教具失敗:', error);
        showNotification('新增教具失敗', 'error');
    } finally {
        // 恢復按鈕狀態
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
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

// ========== 教材管理標籤切換 ==========

function initMaterialTabs() {
    const tabs = document.querySelectorAll('.material-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // 移除所有 active 類別
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.material-tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // 加入 active 類別到當前標籤
            this.classList.add('active');

            // 顯示對應的內容
            if (targetTab === 'list') {
                document.getElementById('listTabContent').classList.add('active');
            } else if (targetTab === 'add') {
                document.getElementById('addTabContent').classList.add('active');
            }
        });
    });
}

// ========== 編輯教材功能 ==========

let currentEditPhotoData = null;
let editingMaterialId = null;

// 開啟編輯視窗
function editMaterial(id) {
    const material = materials.find(m => m._id === id);
    if (!material) return;

    editingMaterialId = id;

    // 填充表單
    document.getElementById('editMaterialId').value = id;
    document.getElementById('editMaterialName').value = material.name;
    document.getElementById('editDescription').value = material.description || '';

    // 填充下拉選單
    populateEditSelects();

    // 設定選中的值
    document.getElementById('editDevelopmentStage').value = material.developmentStage;
    document.getElementById('editTeachingType').value = material.teachingType;
    document.getElementById('editMaterial').value = material.material;
    document.getElementById('editArea').value = material.area;

    // 填充教學目的核取方塊
    populateEditPurposes(material.purposes);

    // 處理照片
    currentEditPhotoData = material.photo || null;
    if (material.photo) {
        document.getElementById('editPreviewImage').src = material.photo;
        document.getElementById('editPhotoPreview').style.display = 'block';
    } else {
        document.getElementById('editPhotoPreview').style.display = 'none';
    }

    // 開啟模態視窗
    const modal = document.getElementById('editMaterialModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// 填充編輯表單的下拉選單
function populateEditSelects() {
    const stageSelect = document.getElementById('editDevelopmentStage');
    const typeSelect = document.getElementById('editTeachingType');
    const materialSelect = document.getElementById('editMaterial');
    const areaSelect = document.getElementById('editArea');

    // 清空現有選項（保留第一個預設選項）
    stageSelect.innerHTML = '<option value="">請選擇發展階段</option>';
    typeSelect.innerHTML = '<option value="">請選擇教學型態</option>';
    materialSelect.innerHTML = '<option value="">請選擇材質</option>';
    areaSelect.innerHTML = '<option value="">請選擇使用領域</option>';

    // 填充選項
    if (optionsData.developmentStages) {
        optionsData.developmentStages.forEach(stage => {
            stageSelect.innerHTML += `<option value="${stage}">${stage}</option>`;
        });
    }

    if (optionsData.teachingTypes) {
        optionsData.teachingTypes.forEach(type => {
            typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
        });
    }

    if (optionsData.materials) {
        optionsData.materials.forEach(material => {
            materialSelect.innerHTML += `<option value="${material}">${material}</option>`;
        });
    }

    if (optionsData.areas) {
        optionsData.areas.forEach(area => {
            areaSelect.innerHTML += `<option value="${area}">${area}</option>`;
        });
    }
}

// 填充教學目的核取方塊
function populateEditPurposes(selectedPurposes = []) {
    const container = document.getElementById('editPurposeCheckboxes');
    container.innerHTML = '';

    if (optionsData.purposes) {
        optionsData.purposes.forEach(purpose => {
            const checked = selectedPurposes.includes(purpose) ? 'checked' : '';
            container.innerHTML += `
                <label class="checkbox-label">
                    <input type="checkbox" value="${purpose}" ${checked}>
                    ${purpose}
                </label>
            `;
        });
    }
}

// 處理編輯表單的照片上傳
function handleEditPhotoUpload() {
    const photoInput = document.getElementById('editMaterialPhoto');
    const photoPreview = document.getElementById('editPhotoPreview');
    const previewImage = document.getElementById('editPreviewImage');

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
                previewImage.src = '';
                photoPreview.style.display = 'block';
                previewImage.alt = '正在壓縮圖片...';

                currentEditPhotoData = await compressImage(file, 800, 0.7);

                previewImage.src = currentEditPhotoData;
                previewImage.alt = '照片預覽';

                const sizeKB = (currentEditPhotoData.length / 1024).toFixed(0);
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

// 移除編輯表單的照片
function removeEditPhoto() {
    const photoInput = document.getElementById('editMaterialPhoto');
    const photoPreview = document.getElementById('editPhotoPreview');
    const previewImage = document.getElementById('editPreviewImage');

    photoInput.value = '';
    previewImage.src = '';
    photoPreview.style.display = 'none';
    currentEditPhotoData = null;
}

// 關閉編輯視窗
function closeEditModal() {
    const modal = document.getElementById('editMaterialModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // 清空表單
    document.getElementById('editMaterialForm').reset();
    removeEditPhoto();
    editingMaterialId = null;
}

// 提交編輯表單
async function submitEditMaterial(e) {
    e.preventDefault();

    const id = document.getElementById('editMaterialId').value;
    const name = document.getElementById('editMaterialName').value.trim();
    const developmentStage = document.getElementById('editDevelopmentStage').value;
    const teachingType = document.getElementById('editTeachingType').value;
    const material = document.getElementById('editMaterial').value;
    const area = document.getElementById('editArea').value;
    const description = document.getElementById('editDescription').value.trim();

    const purposeCheckboxes = document.querySelectorAll('#editPurposeCheckboxes input[type="checkbox"]:checked');
    const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    if (!name || !developmentStage || !teachingType || !material || !area) {
        alert('請填寫所有必填欄位（標記 * 的欄位）！');
        return;
    }

    const updatedMaterial = {
        name,
        developmentStage,
        teachingType,
        material,
        area,
        purposes,
        description,
        photo: currentEditPhotoData
    };

    try {
        await API.put(`${API_CONFIG.ENDPOINTS.MATERIALS}/${id}`, updatedMaterial);
        await loadMaterials();
        closeEditModal();
        showNotification('教具更新成功！', 'success');
    } catch (error) {
        console.error('更新教具失敗:', error);
        showNotification('更新教具失敗', 'error');
    }
}

// 套用篩選條件
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filterStage = document.getElementById('filterStage').value;
    const filterArea = document.getElementById('filterArea').value;
    const filterMaterial = document.getElementById('filterMaterial').value;
    const filterPurpose = document.getElementById('filterPurpose').value;

    let filteredMaterials = materials.filter(material => {
        const matchesSearch = !searchTerm || material.name.toLowerCase().includes(searchTerm);
        const matchesStage = !filterStage || material.developmentStage === filterStage;
        const matchesArea = !filterArea || material.area === filterArea;
        const matchesMaterial = !filterMaterial || material.material === filterMaterial;
        const matchesPurpose = !filterPurpose || (material.purposes && material.purposes.includes(filterPurpose));

        return matchesSearch && matchesStage && matchesArea && matchesMaterial && matchesPurpose;
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
    document.getElementById('filterPurpose').value = '';
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
    updateSelect('filterPurpose', optionsData.purposes, true);
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
                                   selectId.includes('Purpose') ? '所有教學目的' :
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
    handleEditPhotoUpload();
    initMaterialTabs();

    const addForm = document.getElementById('addMaterialForm');
    if (addForm) {
        addForm.addEventListener('submit', addMaterial);
    }

    const editForm = document.getElementById('editMaterialForm');
    if (editForm) {
        editForm.addEventListener('submit', submitEditMaterial);
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
    const filterPurpose = document.getElementById('filterPurpose');

    if (filterStage) {
        filterStage.addEventListener('change', applyFilters);
    }
    if (filterArea) {
        filterArea.addEventListener('change', applyFilters);
    }
    if (filterMaterial) {
        filterMaterial.addEventListener('change', applyFilters);
    }
    if (filterPurpose) {
        filterPurpose.addEventListener('change', applyFilters);
    }

    // 從 API 載入資料
    loadMaterials();
}

// ========== 聯絡表單功能 ==========

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const contactStatus = document.getElementById('contactStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            // 建立 mailto 連結
            const recipient = 'sulleyhao@gmail.com';
            const subject = encodeURIComponent(`家教工具庫聯絡訊息 - 來自 ${name}`);
            const body = encodeURIComponent(
                `姓名：${name}\n` +
                `電子郵件：${email}\n\n` +
                `訊息內容：\n${message}\n\n` +
                `---\n` +
                `此訊息來自家教工具庫聯絡表單`
            );

            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            // 開啟郵件客戶端
            window.location.href = mailtoLink;

            // 顯示提示訊息
            contactStatus.textContent = '正在開啟您的郵件程式...';
            contactStatus.style.display = 'block';
            contactStatus.style.color = '#667eea';

            // 3 秒後清除表單
            setTimeout(() => {
                contactForm.reset();
                contactStatus.textContent = '感謝您的來信！您的郵件程式應該已開啟。';
                setTimeout(() => {
                    contactStatus.style.display = 'none';
                }, 3000);
            }, 1000);
        });
    }
}

// ========== 個案管理功能實作 ==========

// 載入所有個案
async function loadCases() {
    try {
        console.log('開始載入個案，API端點:', API_CONFIG.ENDPOINTS.CASES);
        console.log('完整URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CASES);
        cases = await API.get(API_CONFIG.ENDPOINTS.CASES);
        console.log('個案載入成功，數量:', cases.length);
        renderCases();
    } catch (error) {
        console.error('載入個案失敗 - 錯誤詳情:', error);
        console.error('錯誤訊息:', error.message);
        console.error('錯誤堆疊:', error.stack);
        // 只有在個案列表DOM存在時才顯示錯誤訊息
        const caseList = document.getElementById('caseList');
        if (caseList) {
            showNotification('載入個案失敗，請檢查網路連線', 'error');
        }
    }
}

// 渲染個案列表
function renderCases() {
    const caseList = document.getElementById('caseList');
    const caseCount = document.getElementById('caseCount');

    if (!caseList || !caseCount) return;

    caseCount.textContent = `共 ${cases.length} 筆個案`;
    caseList.innerHTML = '';

    if (cases.length === 0) {
        caseList.innerHTML = '<p class="empty-message">目前沒有個案，請先新增個案</p>';
        return;
    }

    cases.forEach(caseItem => {
        const caseItemDiv = document.createElement('div');
        caseItemDiv.className = 'case-item';

        let photoHtml = '';
        if (caseItem.photo) {
            photoHtml = `<img src="${caseItem.photo}" alt="${escapeHtml(caseItem.name)}" class="case-photo">`;
        }

        let purposesHtml = '';
        if (caseItem.purposes && caseItem.purposes.length > 0) {
            purposesHtml = `
                <div class="case-purposes">
                    <div class="case-purposes-label">教學目的：</div>
                    <div class="purpose-tags">
                        ${caseItem.purposes.map(purpose => `<span class="purpose-tag">${escapeHtml(purpose)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        caseItemDiv.innerHTML = `
            ${photoHtml}
            <div class="case-info" style="cursor: pointer;" onclick="viewCaseDetail('${caseItem._id}')">
                <h4>${escapeHtml(caseItem.name)} <span class="case-nickname">(${escapeHtml(caseItem.nickname)})</span></h4>
                <div class="case-details">
                    <div class="case-detail-item">
                        <span class="case-detail-label">發展階段：</span>
                        <span class="material-badge badge-stage">${escapeHtml(caseItem.developmentStage)}</span>
                    </div>
                    <div class="case-detail-item">
                        <span class="case-detail-label">地址：</span>
                        <span>${escapeHtml(caseItem.address)}</span>
                    </div>
                    <div class="case-detail-item">
                        <span class="case-detail-label">聯絡人：</span>
                        <span>${escapeHtml(caseItem.contactName)} - ${escapeHtml(caseItem.contactPhone)}</span>
                    </div>
                </div>
                ${purposesHtml}
            </div>
            <div class="case-actions">
                <button class="btn-edit" onclick="event.stopPropagation(); editCase('${caseItem._id}')">編輯</button>
                <button class="btn-danger" onclick="event.stopPropagation(); deleteCase('${caseItem._id}')">刪除</button>
            </div>
        `;
        caseList.appendChild(caseItemDiv);
    });
}

// 套用個案篩選
function applyCaseFilters() {
    const searchTerm = document.getElementById('caseSearchInput').value.trim().toLowerCase();

    let filteredCases = cases.filter(caseItem => {
        const matchesName = !searchTerm || caseItem.name.toLowerCase().includes(searchTerm);
        const matchesNickname = !searchTerm || caseItem.nickname.toLowerCase().includes(searchTerm);

        return matchesName || matchesNickname;
    });

    renderFilteredCases(filteredCases);
}

// 渲染篩選後的個案列表
function renderFilteredCases(casesToRender) {
    const caseList = document.getElementById('caseList');
    const caseCount = document.getElementById('caseCount');

    if (!caseList || !caseCount) return;

    caseCount.textContent = `共 ${casesToRender.length} 筆個案`;
    caseList.innerHTML = '';

    if (casesToRender.length === 0) {
        caseList.innerHTML = '<p class="empty-message">沒有符合條件的個案</p>';
        return;
    }

    casesToRender.forEach(caseItem => {
        const caseItemDiv = document.createElement('div');
        caseItemDiv.className = 'case-item';

        let photoHtml = '';
        if (caseItem.photo) {
            photoHtml = `<img src="${caseItem.photo}" alt="${escapeHtml(caseItem.name)}" class="case-photo">`;
        }

        let purposesHtml = '';
        if (caseItem.purposes && caseItem.purposes.length > 0) {
            purposesHtml = `
                <div class="case-purposes">
                    <div class="case-purposes-label">教學目的：</div>
                    <div class="purpose-tags">
                        ${caseItem.purposes.map(purpose => `<span class="purpose-tag">${escapeHtml(purpose)}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        caseItemDiv.innerHTML = `
            ${photoHtml}
            <div class="case-info" style="cursor: pointer;" onclick="viewCaseDetail('${caseItem._id}')">
                <h4>${escapeHtml(caseItem.name)} <span class="case-nickname">(${escapeHtml(caseItem.nickname)})</span></h4>
                <div class="case-details">
                    <div class="case-detail-item">
                        <span class="case-detail-label">發展階段：</span>
                        <span class="material-badge badge-stage">${escapeHtml(caseItem.developmentStage)}</span>
                    </div>
                    <div class="case-detail-item">
                        <span class="case-detail-label">地址：</span>
                        <span>${escapeHtml(caseItem.address)}</span>
                    </div>
                    <div class="case-detail-item">
                        <span class="case-detail-label">聯絡人：</span>
                        <span>${escapeHtml(caseItem.contactName)} - ${escapeHtml(caseItem.contactPhone)}</span>
                    </div>
                </div>
                ${purposesHtml}
            </div>
            <div class="case-actions">
                <button class="btn-edit" onclick="event.stopPropagation(); editCase('${caseItem._id}')">編輯</button>
                <button class="btn-danger" onclick="event.stopPropagation(); deleteCase('${caseItem._id}')">刪除</button>
            </div>
        `;
        caseList.appendChild(caseItemDiv);
    });
}

function searchCases() {
    applyCaseFilters();
}

function clearCaseSearch() {
    document.getElementById('caseSearchInput').value = '';
    renderCases();
}

// 新增個案照片處理
function handleCasePhotoUpload() {
    const photoInput = document.getElementById('casePhoto');
    const photoPreview = document.getElementById('casePhotoPreview');
    const previewImage = document.getElementById('casePreviewImage');

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
                previewImage.src = '';
                photoPreview.style.display = 'block';
                previewImage.alt = '正在壓縮圖片...';

                currentCasePhotoData = await compressImage(file, 800, 0.7);

                previewImage.src = currentCasePhotoData;
                previewImage.alt = '照片預覽';
            } catch (error) {
                console.error('圖片壓縮失敗:', error);
                alert('圖片處理失敗，請重試');
                photoInput.value = '';
                photoPreview.style.display = 'none';
            }
        }
    });
}

function removeCasePhoto() {
    const photoInput = document.getElementById('casePhoto');
    const photoPreview = document.getElementById('casePhotoPreview');
    const previewImage = document.getElementById('casePreviewImage');

    photoInput.value = '';
    previewImage.src = '';
    photoPreview.style.display = 'none';
    currentCasePhotoData = null;
}

// 新增個案
async function addCase(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('addCaseBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    if (submitBtn.disabled) {
        return;
    }

    const name = document.getElementById('caseName').value.trim();
    const nickname = document.getElementById('caseNickname').value.trim();
    const address = document.getElementById('caseAddress').value.trim();
    const contactName = document.getElementById('caseContactName').value.trim();
    const contactPhone = document.getElementById('caseContactPhone').value.trim();
    const developmentStage = document.getElementById('caseDevelopmentStage').value;

    const purposeCheckboxes = document.querySelectorAll('#casePurposesCheckbox input[type="checkbox"]:checked');
    const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    if (!name || !nickname || !address || !contactName || !contactPhone || !developmentStage) {
        alert('請填寫所有必填欄位（標記 * 的欄位）！');
        return;
    }

    if (purposes.length === 0) {
        alert('請至少選擇一個教學目的/功能！');
        return;
    }

    const newCase = {
        name,
        nickname,
        address,
        contactName,
        contactPhone,
        developmentStage,
        purposes,
        photo: currentCasePhotoData
    };

    try {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        await API.post(API_CONFIG.ENDPOINTS.CASES, newCase);
        await loadCases();
        e.target.reset();
        removeCasePhoto();
        showNotification('個案新增成功！', 'success');
    } catch (error) {
        console.error('新增個案失敗:', error);
        showNotification('新增個案失敗', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// 刪除個案
async function deleteCase(id) {
    if (!confirm('確定要刪除這個個案嗎？')) {
        return;
    }

    try {
        await API.delete(`${API_CONFIG.ENDPOINTS.CASES}/${id}`);
        await loadCases();
        showNotification('個案已刪除', 'info');
    } catch (error) {
        console.error('刪除個案失敗:', error);
        showNotification('刪除個案失敗', 'error');
    }
}

// 檢視個案詳細資訊
function viewCaseDetail(id) {
    const caseItem = cases.find(c => c._id === id);
    if (!caseItem) return;

    const modal = document.getElementById('caseModal');
    const modalBody = document.getElementById('caseModalBody');

    let photoHtml = '';
    if (caseItem.photo) {
        photoHtml = `
            <div class="modal-photo-container">
                <img src="${caseItem.photo}" alt="${escapeHtml(caseItem.name)}" class="modal-photo" onclick="openImageLightbox('${caseItem.photo}')">
                <p style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 0.5rem;">點擊圖片可放大檢視</p>
            </div>
        `;
    }

    let purposesHtml = '';
    if (caseItem.purposes && caseItem.purposes.length > 0) {
        purposesHtml = `
            <div class="modal-purposes-section">
                <div class="modal-purposes-title">教學目的/功能</div>
                <div class="modal-purpose-tags">
                    ${caseItem.purposes.map(purpose => `<span class="modal-purpose-tag">${escapeHtml(purpose)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        ${photoHtml}
        <h2 class="modal-title">${escapeHtml(caseItem.name)} <span class="case-nickname">(${escapeHtml(caseItem.nickname)})</span></h2>

        <div class="modal-info-grid">
            <div class="modal-info-item">
                <div class="modal-info-label">發展階段</div>
                <div class="modal-info-value">${escapeHtml(caseItem.developmentStage)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">地址</div>
                <div class="modal-info-value">${escapeHtml(caseItem.address)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">聯絡人姓名</div>
                <div class="modal-info-value">${escapeHtml(caseItem.contactName)}</div>
            </div>
            <div class="modal-info-item">
                <div class="modal-info-label">聯絡人電話</div>
                <div class="modal-info-value">${escapeHtml(caseItem.contactPhone)}</div>
            </div>
        </div>

        ${purposesHtml}

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
            <p style="color: #6c757d; font-size: 0.9rem; margin: 0;">
                建立時間：${new Date(caseItem.createdAt).toLocaleString('zh-TW')}
            </p>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeCaseModal() {
    const modal = document.getElementById('caseModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

// 編輯個案照片處理
function handleEditCasePhotoUpload() {
    const photoInput = document.getElementById('editCasePhoto');
    const photoPreview = document.getElementById('editCasePhotoPreview');
    const previewImage = document.getElementById('editCasePreviewImage');

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
                previewImage.src = '';
                photoPreview.style.display = 'block';
                previewImage.alt = '正在壓縮圖片...';

                currentEditCasePhotoData = await compressImage(file, 800, 0.7);

                previewImage.src = currentEditCasePhotoData;
                previewImage.alt = '照片預覽';
            } catch (error) {
                console.error('圖片壓縮失敗:', error);
                alert('圖片處理失敗，請重試');
                photoInput.value = '';
                photoPreview.style.display = 'none';
            }
        }
    });
}

function removeEditCasePhoto() {
    const photoInput = document.getElementById('editCasePhoto');
    const photoPreview = document.getElementById('editCasePhotoPreview');
    const previewImage = document.getElementById('editCasePreviewImage');

    photoInput.value = '';
    previewImage.src = '';
    photoPreview.style.display = 'none';
    currentEditCasePhotoData = null;
}

// 編輯個案
function editCase(id) {
    const caseItem = cases.find(c => c._id === id);
    if (!caseItem) return;

    const modal = document.getElementById('editCaseModal');

    document.getElementById('editCaseId').value = caseItem._id;
    document.getElementById('editCaseName').value = caseItem.name;
    document.getElementById('editCaseNickname').value = caseItem.nickname;
    document.getElementById('editCaseAddress').value = caseItem.address;
    document.getElementById('editCaseContactName').value = caseItem.contactName;
    document.getElementById('editCaseContactPhone').value = caseItem.contactPhone;
    document.getElementById('editCaseDevelopmentStage').value = caseItem.developmentStage;

    // 填充教學目的複選框
    populateEditCasePurposes(caseItem.purposes || []);

    // 顯示現有照片
    if (caseItem.photo) {
        const photoPreview = document.getElementById('editCasePhotoPreview');
        const previewImage = document.getElementById('editCasePreviewImage');
        previewImage.src = caseItem.photo;
        photoPreview.style.display = 'block';
        currentEditCasePhotoData = caseItem.photo;
    } else {
        removeEditCasePhoto();
    }

    modal.style.display = 'flex';
    modal.classList.add('show');
}

function populateEditCasePurposes(selectedPurposes) {
    const container = document.getElementById('editCasePurposesCheckbox');
    container.innerHTML = '';

    optionsData.purposes.forEach(purpose => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = purpose;
        checkbox.checked = selectedPurposes.includes(purpose);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + purpose));
        container.appendChild(label);
    });
}

function closeEditCaseModal() {
    const modal = document.getElementById('editCaseModal');
    modal.style.display = 'none';
    modal.classList.remove('show');
    removeEditCasePhoto();
}

// 提交編輯個案
async function submitEditCase(e) {
    e.preventDefault();

    const id = document.getElementById('editCaseId').value;
    const name = document.getElementById('editCaseName').value.trim();
    const nickname = document.getElementById('editCaseNickname').value.trim();
    const address = document.getElementById('editCaseAddress').value.trim();
    const contactName = document.getElementById('editCaseContactName').value.trim();
    const contactPhone = document.getElementById('editCaseContactPhone').value.trim();
    const developmentStage = document.getElementById('editCaseDevelopmentStage').value;

    const purposeCheckboxes = document.querySelectorAll('#editCasePurposesCheckbox input[type="checkbox"]:checked');
    const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

    if (!name || !nickname || !address || !contactName || !contactPhone || !developmentStage) {
        alert('請填寫所有必填欄位（標記 * 的欄位）！');
        return;
    }

    if (purposes.length === 0) {
        alert('請至少選擇一個教學目的/功能！');
        return;
    }

    const updatedCase = {
        name,
        nickname,
        address,
        contactName,
        contactPhone,
        developmentStage,
        purposes,
        photo: currentEditCasePhotoData
    };

    try {
        await API.put(`${API_CONFIG.ENDPOINTS.CASES}/${id}`, updatedCase);
        await loadCases();
        closeEditCaseModal();
        showNotification('個案更新成功！', 'success');
    } catch (error) {
        console.error('更新個案失敗:', error);
        showNotification('更新個案失敗', 'error');
    }
}

// 個案管理標籤切換
function initCaseTabs() {
    const tabs = document.querySelectorAll('.material-tabs button[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            const parentSection = this.closest('section');

            if (!parentSection || parentSection.id !== 'cases') return;

            // 移除所有活動狀態
            tabs.forEach(t => {
                if (t.closest('section')?.id === 'cases') {
                    t.classList.remove('active');
                }
            });
            parentSection.querySelectorAll('.material-tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // 添加活動狀態
            this.classList.add('active');
            if (targetTab === 'list') {
                document.getElementById('caseListTabContent').classList.add('active');
            } else if (targetTab === 'add') {
                document.getElementById('caseAddTabContent').classList.add('active');
            }
        });
    });
}

// 初始化個案管理
function initCaseManagement() {
    const addCaseForm = document.getElementById('addCaseForm');
    const editCaseForm = document.getElementById('editCaseForm');

    if (addCaseForm) {
        addCaseForm.addEventListener('submit', addCase);
        handleCasePhotoUpload();
    }

    if (editCaseForm) {
        editCaseForm.addEventListener('submit', submitEditCase);
        handleEditCasePhotoUpload();
    }

    // 填充發展階段下拉選單
    updateSelect('caseDevelopmentStage', optionsData.developmentStages);
    updateSelect('editCaseDevelopmentStage', optionsData.developmentStages);

    // 填充教學目的複選框
    updateCaseCheckboxGroup('casePurposesCheckbox', optionsData.purposes);

    // 初始化標籤切換
    initCaseTabs();

    // 個案搜尋功能
    const caseSearchBtn = document.getElementById('caseSearchBtn');
    const caseSearchInput = document.getElementById('caseSearchInput');
    const clearCaseSearchBtn = document.getElementById('clearCaseSearchBtn');

    if (caseSearchBtn) {
        caseSearchBtn.addEventListener('click', searchCases);
    }

    if (caseSearchInput) {
        caseSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchCases();
            }
        });
    }

    if (clearCaseSearchBtn) {
        clearCaseSearchBtn.addEventListener('click', clearCaseSearch);
    }

    // 載入個案資料
    loadCases();
}

function updateCaseCheckboxGroup(containerId, purposes) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    purposes.forEach(purpose => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = purpose;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + purpose));
        container.appendChild(label);
    });
}

// ========== 資料庫連接檢查 ==========

async function checkDatabaseConnection() {
    const overlay = document.getElementById('dbLoadingOverlay');
    const message = document.getElementById('dbLoadingMessage');
    const errorMessage = document.getElementById('dbErrorMessage');

    const maxRetries = 10;
    const retryDelay = 3000; // 3秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            message.textContent = `正在檢查資料庫連接... (嘗試 ${attempt}/${maxRetries})`;

            const response = await API.get(API_CONFIG.ENDPOINTS.HEALTH);

            if (response.status === 'ok' && response.database.connected) {
                // 連接成功
                message.textContent = '資料庫連接成功！正在載入資料...';

                // 延遲隱藏遮罩，讓用戶看到成功訊息
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    // 完全移除遮罩，避免影響頁面操作
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 500);
                }, 800);

                return true;
            } else {
                throw new Error('資料庫未連接');
            }
        } catch (error) {
            console.error(`資料庫連接檢查失敗 (嘗試 ${attempt}/${maxRetries}):`, error);

            if (attempt < maxRetries) {
                message.textContent = `連接失敗，${retryDelay/1000} 秒後重試... (${attempt}/${maxRetries})`;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                // 所有嘗試都失敗
                message.textContent = '無法連接到資料庫';
                errorMessage.style.display = 'block';
                return false;
            }
        }
    }

    return false;
}

// 頁面載入完成後初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
        initMobileMenu();

        // 先檢查資料庫連接
        const dbConnected = await checkDatabaseConnection();

        if (dbConnected) {
            await loadOptions();
            initMaterialManagement();
            initCaseManagement();
            initOptionsManagement();
            initContactForm();
        }
    });
} else {
    (async function() {
        initMobileMenu();

        // 先檢查資料庫連接
        const dbConnected = await checkDatabaseConnection();

        if (dbConnected) {
            await loadOptions();
            initMaterialManagement();
            initCaseManagement();
            initOptionsManagement();
            initContactForm();
        }
    })();
}
