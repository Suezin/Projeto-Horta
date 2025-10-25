// Global variables
let posts = [];
let images = [];
let charts = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadPostsFromAPI();
    updateStats();
    updateCharts();
});

// Initialize application
function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetSection = this.getAttribute('href').substring(1);
                showSection(targetSection);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Load sample data
    loadSampleData();
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
        
        // Update charts when showing charts section
        if (sectionId === 'charts') {
            setTimeout(() => updateCharts(), 100);
        }
    }
}



function generateRandomStats() {
    return {
        growthRate: Math.floor(Math.random() * 30) + 10,
        healthScore: Math.floor(Math.random() * 40) + 60,
        leafCount: Math.floor(Math.random() * 20) + 5,
        height: (Math.random() * 50 + 10).toFixed(1),
        colorIntensity: Math.floor(Math.random() * 30) + 70
    };
}

// Post management with API and localStorage fallback
async function loadPostsFromAPI() {
    try {
        const result = await window.hortaAPI.getPosts();
        if (result.success) {
            // Transform API data to frontend format
            posts = result.posts.map(transformPostData);
            renderPosts();
            updateStats();
            updateCharts();
            console.log('Posts loaded successfully:', posts.length, 'posts');
        } else {
            console.error('Failed to load posts:', result.error);
            showMessage('Erro ao carregar posts: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showMessage('Erro de conexão ao carregar posts', 'error');
    }
}

// Transform API data to frontend format
function transformPostData(apiPost) {
    return {
        id: apiPost.id,
        plantType: apiPost.plant_type,
        plantAge: apiPost.plant_age,
        plantingDate: apiPost.planting_date,
        height: apiPost.height,
        weather: apiPost.weather,
        temperature: apiPost.temperature,
        watering: apiPost.watering,
        fertilizer: apiPost.fertilizer,
        pestProblems: apiPost.pest_problems,
        notes: apiPost.notes,
        expectedHarvest: apiPost.expected_harvest,
        author: apiPost.author,
        date: apiPost.created_at,
        images: apiPost.images ? apiPost.images.map(img => ({
            id: img.id,
            name: img.filename,
            url: img.url || `data:${img.mime_type};base64,${img.image_data || ''}`,
            mimeType: img.mime_type,
            createdAt: img.created_at
        })) : [],
        stats: {
            growthRate: Math.floor(Math.random() * 30) + 10,
            healthScore: Math.floor(Math.random() * 40) + 60,
            leafCount: Math.floor(Math.random() * 20) + 5,
            height: parseFloat(apiPost.height) || 0,
            colorIntensity: Math.floor(Math.random() * 30) + 70
        }
    };
}

// Legacy functions for backward compatibility
function loadPosts() {
    loadPostsFromAPI();
}

function savePosts() {
    // No longer needed - data is saved to database
    console.log('Data saved to database via API');
}

function renderPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts">Nenhuma postagem ainda. Faça upload de imagens para começar!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    const date = new Date(post.date).toLocaleDateString('pt-BR');
    
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
        <div class="post-header">
            <h4>Análise de ${post.plantType}</h4>
            <span class="post-date">${date}</span>
        </div>
        <div class="post-content">
            ${post.notes ? `<p><strong>Observações:</strong> ${post.notes}</p>` : ''}
            ${detailedInfo}
            <div class="post-images">
                ${post.images.map(img => 
                    `<img src="${img.url}" alt="${img.name}" class="post-image">`
                ).join('')}
            </div>
        </div>
        <div class="post-stats">
            <div class="stat-item">Taxa de Crescimento: ${post.stats.growthRate}%</div>
            <div class="stat-item">Saúde: ${post.stats.healthScore}%</div>
            <div class="stat-item">Altura: ${post.stats.height}cm</div>
            <div class="stat-item">Folhas: ${post.stats.leafCount}</div>
        </div>
        <div class="post-footer">
            <small>Postado por: ${post.author}</small>
        </div>
    `;
    
    return postDiv;
}

// Statistics
function updateStats() {
    const totalImages = posts.reduce((sum, post) => sum + post.images.length, 0);
    
    // Calculate real growth rate based on height progression
    const avgGrowthRate = calculateRealGrowthRate();
    
    // Count unique plant types
    const uniquePlantTypes = new Set(posts.map(p => p.plantType)).size;
    
    // Update main stats cards
    document.getElementById('totalPlants').textContent = posts.length;
    document.getElementById('totalImages').textContent = totalImages;
    document.getElementById('avgGrowthRate').textContent = avgGrowthRate + '%';
    document.getElementById('plantTypes').textContent = uniquePlantTypes;
    
    // Update detailed stats
    document.getElementById('totalAnalyses').textContent = posts.length;
    document.getElementById('plantsMonitored').textContent = uniquePlantTypes;
    document.getElementById('successRate').textContent = avgGrowthRate + '%';
    document.getElementById('lastUpdate').textContent = posts.length > 0 ? 
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
function updateCharts() {
    if (posts.length === 0) return;
    
    createGrowthChart();
    createHealthChart();
    createPlantTypeChart();
    createHeightChart();
}

function createGrowthChart() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;
    
    if (charts.growth) charts.growth.destroy();
    
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedPosts.map(post => new Date(post.date).toLocaleDateString('pt-BR'));
    
    // Calculate real growth rates for each post
    const growthData = calculateGrowthRatesForChart();
    
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

// Calculate growth rates for chart display
function calculateGrowthRatesForChart() {
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

function createHealthChart() {
    const ctx = document.getElementById('healthChart');
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

function createPlantTypeChart() {
    const ctx = document.getElementById('plantTypeChart');
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

function createHeightChart() {
    const ctx = document.getElementById('heightChart');
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

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Sample data
function loadSampleData() {
    // No sample data - start with empty posts
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
