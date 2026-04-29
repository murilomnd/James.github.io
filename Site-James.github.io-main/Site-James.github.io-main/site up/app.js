// Application State
let files = [
  {
    id: 1,
    name: "Documentação_Projeto.pdf",
    type: "pdf",
    size: "2.4 MB",
    date: "2025-11-15",
    icon: "📄"
  },
  {
    id: 2,
    name: "Relatório_Financeiro_Q4.xlsx",
    type: "xlsx",
    size: "1.8 MB",
    date: "2025-11-14",
    icon: "📊"
  },
  {
    id: 3,
    name: "Screenshot_Desenvolvimento.png",
    type: "png",
    size: "3.2 MB",
    date: "2025-11-13",
    icon: "🖼️"
  },
  {
    id: 4,
    name: "Codigo_Fonte.zip",
    type: "zip",
    size: "5.1 MB",
    date: "2025-11-12",
    icon: "🗂️"
  },
  {
    id: 5,
    name: "Apresentacao_Cliente.docx",
    type: "docx",
    size: "892 KB",
    date: "2025-11-11",
    icon: "📝"
  }
];

let storage = {
  used_gb: 15,
  total_gb: 100,
  percentage: 15
};

let fileToDelete = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  renderFiles();
  updateStorageDisplay();
  setupUploadArea();
  setupFileInput();
}

// Tab Switching
function switchTab(tabName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  if (tabName === 'files') {
    document.getElementById('filesTab').classList.add('active');
  } else if (tabName === 'shared') {
    document.getElementById('sharedTab').classList.add('active');
  } else if (tabName === 'settings') {
    document.getElementById('settingsTab').classList.add('active');
  }
}

// File Upload Setup
function setupUploadArea() {
  const uploadArea = document.getElementById('uploadArea');
  
  // Drag and drop events
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const droppedFiles = e.dataTransfer.files;
    handleFileUpload(droppedFiles);
  });
}

function setupFileInput() {
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
  });
}

function handleFileUpload(uploadedFiles) {
  const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
  const maxSize = 100 * 1024 * 1024; // 100MB in bytes
  
  Array.from(uploadedFiles).forEach(file => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Validate file type
    if (!allowedTypes.includes(fileExtension)) {
      showToast(`❌ Tipo de arquivo não suportado: ${file.name}`);
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      showToast(`❌ Arquivo muito grande: ${file.name} (máx. 100MB)`);
      return;
    }
    
    // Show loading
    showUploadLoading();
    
    // Simulate upload (in real app, this would be an API call)
    setTimeout(() => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: fileExtension,
        size: formatFileSize(file.size),
        date: new Date().toISOString().split('T')[0],
        icon: getFileIcon(fileExtension)
      };
      
      files.unshift(newFile);
      
      // Update storage (simplified calculation)
      const addedGB = file.size / (1024 * 1024 * 1024);
      storage.used_gb = Math.round((storage.used_gb + addedGB) * 10) / 10;
      storage.percentage = Math.round((storage.used_gb / storage.total_gb) * 100);
      
      hideUploadLoading();
      renderFiles();
      updateStorageDisplay();
      showToast(`✓ Arquivo enviado com sucesso: ${file.name}`);
      
      // Clear file input
      document.getElementById('fileInput').value = '';
    }, 1500);
  });
}

function showUploadLoading() {
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('uploadLoading').classList.remove('hidden');
}

function hideUploadLoading() {
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('uploadLoading').classList.add('hidden');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(type) {
  const iconMap = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'zip': '🗂️'
  };
  return iconMap[type] || '📎';
}

// Render Files
function renderFiles() {
  const filesList = document.getElementById('filesList');
  
  if (files.length === 0) {
    filesList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📁</span>
        <h2>Nenhum arquivo ainda</h2>
        <p>Faça upload de seus primeiros arquivos para começar</p>
      </div>
    `;
    return;
  }
  
  filesList.innerHTML = files.map(file => `
    <div class="file-card" onclick="previewFile(${file.id})">
      <div class="file-card-header">
        <span class="file-icon">${file.icon}</span>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">${file.size} • ${formatDate(file.date)}</div>
        </div>
      </div>
      <div class="file-actions">
        <button class="file-btn" onclick="event.stopPropagation(); downloadFile(${file.id})">⬇️ Baixar</button>
        <button class="file-btn" onclick="event.stopPropagation(); shareFile(${file.id})">🔗 Compartilhar</button>
        <button class="file-btn danger" onclick="event.stopPropagation(); deleteFile(${file.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Update Storage Display
function updateStorageDisplay() {
  const storageBarFill = document.getElementById('storageBarFill');
  const storageText = document.getElementById('storageText');
  
  storageBarFill.style.width = `${storage.percentage}%`;
  
  // Update color based on percentage
  storageBarFill.classList.remove('warning', 'danger');
  if (storage.percentage >= 80) {
    storageBarFill.classList.add('danger');
  } else if (storage.percentage >= 50) {
    storageBarFill.classList.add('warning');
  }
  
  storageText.textContent = `${storage.used_gb} GB de ${storage.total_gb} GB usados`;
}

// File Preview
function previewFile(fileId) {
  const file = files.find(f => f.id === fileId);
  if (!file) return;
  
  const modal = document.getElementById('previewModal');
  const title = document.getElementById('previewTitle');
  const body = document.getElementById('previewBody');
  
  title.textContent = file.name;
  
  // Generate preview based on file type
  if (['jpg', 'jpeg', 'png'].includes(file.type)) {
    body.innerHTML = `
      <div class="preview-image-container">
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23dbeafe' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%232563eb' text-anchor='middle' dominant-baseline='middle'%3E${file.icon} Imagem: ${file.name}%3C/text%3E%3C/svg%3E" alt="${file.name}" class="preview-image">
      </div>
    `;
  } else if (file.type === 'pdf') {
    body.innerHTML = `
      <div class="preview-pdf">
        <div class="preview-pdf-icon">📄</div>
        <h3>Visualização de PDF</h3>
        <p>Nome: ${file.name}</p>
        <p>Tamanho: ${file.size}</p>
        <p>Em um ambiente real, o PDF seria exibido aqui.</p>
        <button class="btn-primary" onclick="downloadFile(${file.id}); closePreview();">Baixar PDF</button>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="preview-document">
        <div class="preview-document-info">
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">${file.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tipo:</span>
            <span class="info-value">${file.type.toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tamanho:</span>
            <span class="info-value">${file.size}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data de upload:</span>
            <span class="info-value">${formatDate(file.date)}</span>
          </div>
        </div>
        <button class="btn-primary" onclick="downloadFile(${file.id}); closePreview();" style="margin-top: 20px; width: 100%;">Baixar Arquivo</button>
      </div>
    `;
  }
  
  modal.classList.remove('hidden');
}

function closePreview() {
  document.getElementById('previewModal').classList.add('hidden');
}

// Download File
function downloadFile(fileId) {
  const file = files.find(f => f.id === fileId);
  if (!file) return;
  
  // In a real application, this would trigger an actual download
  showToast(`⬇️ Baixando: ${file.name}`);
  
  // Simulate download
  setTimeout(() => {
    showToast(`✓ Download concluído: ${file.name}`);
  }, 1500);
}

// Share File
function shareFile(fileId) {
  const file = files.find(f => f.id === fileId);
  if (!file) return;
  
  const modal = document.getElementById('shareModal');
  const shareLink = document.getElementById('shareLink');
  const shareSuccess = document.getElementById('shareSuccess');
  
  // Generate unique share link
  const uniqueId = Math.random().toString(36).substring(2, 10);
  const link = `https://cloudshare.com/share/${uniqueId}`;
  
  shareLink.value = link;
  shareSuccess.classList.add('hidden');
  
  modal.classList.remove('hidden');
}

function copyShareLink() {
  const shareLink = document.getElementById('shareLink');
  const shareSuccess = document.getElementById('shareSuccess');
  
  // Copy to clipboard
  shareLink.select();
  shareLink.setSelectionRange(0, 99999); // For mobile devices
  
  navigator.clipboard.writeText(shareLink.value).then(() => {
    shareSuccess.classList.remove('hidden');
    showToast('✓ Link copiado para a área de transferência!');
  }).catch(err => {
    // Fallback for older browsers
    document.execCommand('copy');
    shareSuccess.classList.remove('hidden');
    showToast('✓ Link copiado!');
  });
}

function closeShare() {
  document.getElementById('shareModal').classList.add('hidden');
}

// Delete File
function deleteFile(fileId) {
  const file = files.find(f => f.id === fileId);
  if (!file) return;
  
  fileToDelete = fileId;
  
  const modal = document.getElementById('deleteModal');
  const filename = document.getElementById('deleteFilename');
  
  filename.textContent = file.name;
  modal.classList.remove('hidden');
}

function confirmDelete() {
  if (!fileToDelete) return;
  
  const file = files.find(f => f.id === fileToDelete);
  
  // Remove file from array
  files = files.filter(f => f.id !== fileToDelete);
  
  // Update storage (simplified)
  const removedSize = parseFloat(file.size);
  const unit = file.size.split(' ')[1];
  let removedGB = 0;
  
  if (unit === 'MB') {
    removedGB = removedSize / 1024;
  } else if (unit === 'GB') {
    removedGB = removedSize;
  } else if (unit === 'KB') {
    removedGB = removedSize / (1024 * 1024);
  }
  
  storage.used_gb = Math.max(0, Math.round((storage.used_gb - removedGB) * 10) / 10);
  storage.percentage = Math.round((storage.used_gb / storage.total_gb) * 100);
  
  renderFiles();
  updateStorageDisplay();
  closeDelete();
  showToast(`✓ Arquivo excluído: ${file.name}`);
  
  fileToDelete = null;
}

function closeDelete() {
  document.getElementById('deleteModal').classList.add('hidden');
  fileToDelete = null;
}

// Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Logout
function handleLogout() {
  showToast('👋 Até logo!');
  setTimeout(() => {
    alert('Logout realizado com sucesso!');
  }, 500);
}