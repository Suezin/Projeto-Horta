// Global variables for admin
let isAuthenticated = false;
let posts = [];
let charts = {};

// Initialize admin application
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminApp();
    loadPosts();
    updateAdminStats();
});

// Initialize admin application
function initializeAdminApp() {
    // Check if already authenticated
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
        showAdminContent();
    }

    // Set up admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    adminLoginForm.addEventListener('submit', handleAdminLogin);

    // Set up upload area
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    imageInput.addEventListener('change', handleFileSelect);

    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetSection = this.getAttribute('href').substring(1);
                showSection(targetSection);
            }
        });
    });

    // Load sample data if none exists
    loadSampleData();
    
    // Load admin posts
    loadAdminPosts();
}

// Admin authentication with API and localStorage fallback
async function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const result = await window.hortaAPI.authenticate(username, password);
        
        if (result.success) {
            isAuthenticated = true;
            localStorage.setItem('adminAuth', 'true');
            showAdminContent();
            showMessage('Login realizado com sucesso!', 'success');
        } else {
            showMessage('Credenciais inválidas!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Erro de conexão ao fazer login', 'error');
    }
}

function showAdminContent() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    document.querySelector('.logout-btn').style.display = 'block';
    isAuthenticated = true;
}

function logout() {
    isAuthenticated = false;
    localStorage.removeItem('adminAuth');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminContent').style.display = 'none';
    document.querySelector('.logout-btn').style.display = 'none';
    showMessage('Logout realizado com sucesso!', 'success');
}

// Navigation functions
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Update charts when showing analytics section
        if (sectionId === 'analytics') {
            setTimeout(() => updateAdminCharts(), 100);
        }
        
        // Load posts when showing posts section
        if (sectionId === 'posts') {
            setTimeout(() => loadAdminPosts(), 100);
        }
    }
}

// Upload functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.background = '#e8f5e8';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.background = '#f8f9fa';
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
    );
    
    if (validFiles.length === 0) {
        showMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
        return;
    }
    
    showMessage(`${validFiles.length} imagem(ns) selecionada(s)`, 'success');
}

async function uploadImages() {
    if (!isAuthenticated) {
        showMessage('Você precisa estar autenticado para fazer upload.', 'error');
        return;
    }
    
    const imageInput = document.getElementById('imageInput');
    const plantType = document.getElementById('plantType').value;
    const plantAge = document.getElementById('plantAge').value;
    const plantingDate = document.getElementById('plantingDate').value;
    const height = document.getElementById('height').value;
    const weather = document.getElementById('weather').value;
    const temperature = document.getElementById('temperature').value;
    const watering = document.getElementById('watering').value;
    const fertilizer = document.getElementById('fertilizer').value;
    const pestProblems = document.getElementById('pestProblems').value;
    const notes = document.getElementById('notes').value;
    const expectedHarvest = document.getElementById('expectedHarvest').value;
    
    if (imageInput.files.length === 0) {
        showMessage('Por favor, selecione pelo menos uma imagem.', 'error');
        return;
    }
    
    // Validate required fields
    if (!plantType || !plantAge || !plantingDate || !temperature || !height) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    showMessage('Processando imagens e dados...', 'success');
    
    try {
        // Create post data
        const postData = {
            plantType,
            plantAge,
            plantingDate,
            height,
            weather,
            temperature,
            watering,
            fertilizer,
            pestProblems,
            notes,
            expectedHarvest,
            images: []
        };
        
        // Upload images first
        for (const file of imageInput.files) {
            const imageResult = await window.hortaAPI.uploadImage(null, file);
            if (imageResult.success) {
                postData.images.push({
                    id: imageResult.image.id,
                    filename: imageResult.image.filename,
                    mime_type: imageResult.image.mime_type
                });
            }
        }
        
        // Create post
        const result = await window.hortaAPI.createPost(postData);
        
        if (result.success) {
            showMessage('Dados e imagens enviados com sucesso!', 'success');
            resetUploadForm();
            loadAdminPosts();
            updateAdminStats();
            updateAdminCharts();
        } else {
            showMessage('Erro ao enviar dados: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('Erro de conexão ao enviar dados', 'error');
    }
}

function createDetailedPostFromImages(files, data) {
    const now = new Date();
    const stats = generateRandomStats();
    
    return {
        id: Date.now(),
        date: now.toISOString(),
        plantType: data.plantType,
        plantAge: data.plantAge,
        plantingDate: data.plantingDate,
        height: data.height,
        weather: data.weather,
        temperature: data.temperature,
        watering: data.watering,
        fertilizer: data.fertilizer,
        pestProblems: data.pestProblems,
        notes: data.notes,
        expectedHarvest: data.expectedHarvest,
        images: Array.from(files).map(file => ({
            name: file.name,
            url: URL.createObjectURL(file),
            data: file
        })),
        stats: {
            ...stats,
            height: data.height
        },
        author: 'admin'
    };
}

function resetUploadForm() {
    document.getElementById('imageInput').value = '';
    document.getElementById('plantAge').value = '';
    document.getElementById('plantingDate').value = '';
    document.getElementById('height').value = '';
    document.getElementById('temperature').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('expectedHarvest').value = '';
}

function generateRandomStats() {
    return {
        growthRate: Math.floor(Math.random() * 30) + 10,
        healthScore: Math.floor(Math.random() * 40) + 60,
        leafCount: Math.floor(Math.random() * 20) + 5,
        colorIntensity: Math.floor(Math.random() * 30) + 70
    };
}

// Post management
function loadPosts() {
    const savedPosts = localStorage.getItem('hortaPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
}

function savePosts() {
    localStorage.setItem('hortaPosts', JSON.stringify(posts));
}

// Statistics
function updateAdminStats() {
    const totalImages = posts.reduce((sum, post) => sum + post.images.length, 0);
    
    // Calculate real growth rate based on height progression
    const avgGrowthRate = calculateRealGrowthRate();
    
    const daysTracked = posts.length > 0 ? 
        Math.ceil((new Date() - new Date(posts[posts.length - 1].date)) / (1000 * 60 * 60 * 24)) : 0;
    
    document.getElementById('adminTotalImages').textContent = totalImages;
    document.getElementById('adminGrowthRate').textContent = avgGrowthRate + '%';
    document.getElementById('adminDaysTracked').textContent = daysTracked;
    document.getElementById('adminTotalPosts').textContent = posts.length;
    
    // Update settings
    document.getElementById('settingsTotalPosts').textContent = posts.length;
    document.getElementById('settingsLastUpdate').textContent = posts.length > 0 ? 
        new Date(posts[0].date).toLocaleDateString('pt-BR') : '-';
}

// Calculate real growth rate based on height progression
function calculateRealGrowthRate() {
    if (posts.length < 2) return 0;
    
    // Sort posts by date
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalGrowthRate = 0;
    let validComparisons = 0;
    
    // Group posts by plant type to calculate growth within same plant
    const plantGroups = {};
    sortedPosts.forEach(post => {
        if (!plantGroups[post.plantType]) {
            plantGroups[post.plantType] = [];
        }
        plantGroups[post.plantType].push(post);
    });
    
    // Calculate growth rate for each plant type
    Object.values(plantGroups).forEach(plantPosts => {
        if (plantPosts.length >= 2) {
            for (let i = 1; i < plantPosts.length; i++) {
                const currentPost = plantPosts[i];
                const previousPost = plantPosts[i - 1];
                
                const currentHeight = parseFloat(currentPost.height) || 0;
                const previousHeight = parseFloat(previousPost.height) || 0;
                
                if (previousHeight > 0) {
                    const growthRate = ((currentHeight - previousHeight) / previousHeight) * 100;
                    totalGrowthRate += Math.max(0, growthRate); // Only positive growth
                    validComparisons++;
                }
            }
        }
    });
    
    return validComparisons > 0 ? Math.round(totalGrowthRate / validComparisons) : 0;
}

// Charts functions
function updateAdminCharts() {
    if (posts.length === 0) return;
    
    createAdminGrowthChart();
    createAdminHealthChart();
    createAdminPlantTypeChart();
    createAdminHeightChart();
}

function createAdminGrowthChart() {
    const ctx = document.getElementById('adminGrowthChart');
    if (!ctx) return;
    
    if (charts.growth) charts.growth.destroy();
    
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedPosts.map(post => new Date(post.date).toLocaleDateString('pt-BR'));
    
    // Calculate real growth rates for each post
    const growthData = calculateAdminGrowthRatesForChart();
    
    charts.growth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Taxa de Crescimento (%)',
                data: growthData,
                borderColor: '#4a7c59',
                backgroundColor: 'rgba(74, 124, 89, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Calculate growth rates for admin chart display
function calculateAdminGrowthRatesForChart() {
    if (posts.length < 2) return [0];
    
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const growthRates = [0]; // First post has 0% growth
    
    for (let i = 1; i < sortedPosts.length; i++) {
        const currentPost = sortedPosts[i];
        const previousPost = sortedPosts[i - 1];
        
        const currentHeight = parseFloat(currentPost.height) || 0;
        const previousHeight = parseFloat(previousPost.height) || 0;
        
        if (previousHeight > 0) {
            const growthRate = ((currentHeight - previousHeight) / previousHeight) * 100;
            growthRates.push(Math.max(0, growthRate));
        } else {
            growthRates.push(0);
        }
    }
    
    return growthRates;
}

function createAdminHealthChart() {
    const ctx = document.getElementById('adminHealthChart');
    if (!ctx) return;
    
    if (charts.health) charts.health.destroy();
    
    const healthData = posts.map(post => post.stats.healthScore);
    const avgHealth = healthData.reduce((sum, val) => sum + val, 0) / healthData.length;
    
    charts.health = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Saúde Atual', 'Restante'],
            datasets: [{
                data: [avgHealth, 100 - avgHealth],
                backgroundColor: ['#4a7c59', '#e0e0e0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createAdminPlantTypeChart() {
    const ctx = document.getElementById('adminPlantTypeChart');
    if (!ctx) return;
    
    if (charts.plantType) charts.plantType.destroy();
    
    const plantTypes = {};
    posts.forEach(post => {
        plantTypes[post.plantType] = (plantTypes[post.plantType] || 0) + 1;
    });
    
    const labels = Object.keys(plantTypes);
    const data = Object.values(plantTypes);
    const colors = ['#4a7c59', '#90ee90', '#2c5530', '#6b8e23', '#556b2f', '#8fbc8f'];
    
    charts.plantType = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createAdminHeightChart() {
    const ctx = document.getElementById('adminHeightChart');
    if (!ctx) return;
    
    if (charts.height) charts.height.destroy();
    
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedPosts.map(post => new Date(post.date).toLocaleDateString('pt-BR'));
    const heightData = sortedPosts.map(post => parseFloat(post.height) || 0);
    
    charts.height = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Altura (cm)',
                data: heightData,
                backgroundColor: 'rgba(74, 124, 89, 0.8)',
                borderColor: '#4a7c59',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Settings functions
function exportData() {
    const data = {
        posts: posts,
        exportDate: new Date().toISOString(),
        totalPosts: posts.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `horta-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Dados exportados com sucesso!', 'success');
}

function clearOldData() {
    if (confirm('Tem certeza que deseja limpar dados antigos? Esta ação não pode ser desfeita.')) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredPosts = posts.filter(post => new Date(post.date) > thirtyDaysAgo);
        posts = filteredPosts;
        savePosts();
        updateAdminStats();
        updateAdminCharts();
        
        showMessage('Dados antigos removidos com sucesso!', 'success');
    }
}

function createBackup() {
    const backup = {
        posts: posts,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };
    
    localStorage.setItem('hortaBackup', JSON.stringify(backup));
    showMessage('Backup criado com sucesso!', 'success');
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(messageDiv, container.firstChild);
    }
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Sample data
function loadSampleData() {
    // No sample data - start with empty posts
}

// Admin Posts Management
function loadAdminPosts() {
    const container = document.getElementById('adminPostsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts">Nenhuma postagem encontrada.</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createAdminPostElement(post);
        container.appendChild(postElement);
    });
}

function createAdminPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'admin-post';
    postDiv.setAttribute('data-post-id', post.id);
    
    const date = new Date(post.date).toLocaleDateString('pt-BR');
    const time = new Date(post.date).toLocaleTimeString('pt-BR');
    
    // Check if post has detailed data
    const hasDetailedData = post.plantAge !== undefined;
    
    let detailedInfo = '';
    if (hasDetailedData) {
        detailedInfo = `
            <div class="post-details">
                <div class="detail-row">
                    <span><strong>Idade:</strong> ${post.plantAge}</span>
                    <span><strong>Altura:</strong> ${post.height} cm</span>
                </div>
                <div class="detail-row">
                    <span><strong>Clima:</strong> ${post.weather}</span>
                    <span><strong>Temperatura:</strong> ${post.temperature}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Regagem:</strong> ${post.watering}</span>
                    <span><strong>Fertilizante:</strong> ${post.fertilizer}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Data do Plantio:</strong> ${post.plantingDate}</span>
                    <span><strong>Problemas:</strong> ${post.pestProblems}</span>
                </div>
                ${post.expectedHarvest ? `<div class="detail-row"><span><strong>Colheita Esperada:</strong> ${post.expectedHarvest}</span></div>` : ''}
            </div>
        `;
    }
    
    postDiv.innerHTML = `
        <div class="admin-post-header">
            <div class="post-info">
                <h4>Análise de ${post.plantType}</h4>
                <span class="post-date">${date} às ${time}</span>
            </div>
            <div class="post-actions">
                <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
        <div class="admin-post-content">
            ${post.notes ? `<p><strong>Observações:</strong> ${post.notes}</p>` : ''}
            ${detailedInfo}
            <div class="post-images">
                ${post.images.map(img => 
                    `<img src="${img.url}" alt="${img.name}" class="post-image">`
                ).join('')}
            </div>
        </div>
        <div class="admin-post-stats">
            <div class="stat-item">Taxa de Crescimento: ${post.stats.growthRate}%</div>
            <div class="stat-item">Saúde: ${post.stats.healthScore}%</div>
            <div class="stat-item">Altura: ${post.stats.height}cm</div>
            <div class="stat-item">Folhas: ${post.stats.leafCount}</div>
        </div>
    `;
    
    return postDiv;
}

async function deletePost(postId) {
    if (confirm('Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita.')) {
        try {
            const result = await window.hortaAPI.deletePost(postId);
            
            if (result.success) {
                showMessage('Postagem excluída com sucesso!', 'success');
                loadAdminPosts();
                updateAdminStats();
                updateAdminCharts();
            } else {
                showMessage('Erro ao excluir postagem: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showMessage('Erro de conexão ao excluir postagem', 'error');
        }
    }
}

function refreshPosts() {
    loadAdminPosts();
    showMessage('Lista de postagens atualizada!', 'success');
}

function clearAllPosts() {
    if (confirm('Tem certeza que deseja excluir TODAS as postagens? Esta ação não pode ser desfeita.')) {
        posts = [];
        savePosts();
        loadAdminPosts();
        updateAdminStats();
        updateAdminCharts();
        showMessage('Todas as postagens foram excluídas!', 'success');
    }
}
