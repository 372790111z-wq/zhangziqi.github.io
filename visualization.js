/**
 * AI Models Visualization - Main visualization script
 */

class ModelVisualization {
    constructor(containerId, dataLoader) {
        this.container = document.getElementById(containerId);
        this.dataLoader = dataLoader;
        this.data = null;
        this.filters = { year: '2025', org: 'all', license: 'all' };
        this.margin = { top: 40, right: 40, bottom: 60, left: 80 };
        this.colorPalette = ['#667eea', '#f46a9b', '#ef9b20', '#edbf33', '#ede15b', '#bdcf32', '#87bc45', '#27aeef'];
        
        this.init();
    }
    
    async init() {
        this.data = await this.dataLoader.load();
        this.setupEventListeners();
        this.renderScatterPlot();
        this.renderTable();
        this.renderTimeline();
    }
    
    setupEventListeners() {
        document.getElementById('yearFilter')?.addEventListener('change', (e) => {
            this.filters.year = e.target.value;
            this.renderScatterPlot();
        });
        document.getElementById('orgFilter')?.addEventListener('change', (e) => {
            this.filters.org = e.target.value;
            this.renderScatterPlot();
        });
        document.getElementById('licenseFilter')?.addEventListener('change', (e) => {
            this.filters.license = e.target.value;
            this.renderScatterPlot();
        });
    }
    
    getFilteredData() {
        let filtered = [...this.data.topModels];
        filtered = this.filters.year === 'all' ? filtered : 
            filtered.filter(m => m.release_date?.startsWith(this.filters.year));
        filtered = this.filters.org === 'all' ? filtered : 
            filtered.filter(m => m.organization === this.filters.org);
        filtered = this.filters.license === 'all' ? filtered : 
            filtered.filter(m => (this.filters.license === 'proprietary') === (m.license === 'Proprietary'));
        return filtered;
    }
    
    renderScatterPlot() {
        const svg = document.getElementById('scatterSvg');
        const container = document.getElementById('scatterPlot');
        if (!svg || !container) return;
        
        const width = container.clientWidth - this.margin.left - this.margin.right;
        const height = container.clientHeight - this.margin.top - this.margin.bottom;
        
        svg.innerHTML = '';
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            svg.innerHTML = `<text x="${width/2 + this.margin.left}" y="${height/2 + this.margin.top}" text-anchor="middle" fill="#8892b0" font-size="16">No models match the current filters</text>`;
            return;
        }
        
        const maxIndex = Math.max(...filteredData.map(d => d.intelligence_index)) * 1.1;
        const xScale = (price) => this.margin.left + (Math.log10(price) / Math.log10(100)) * width;
        const yScale = (index) => this.margin.top + height - (index / maxIndex) * height;
        
        // Grid
        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (let i = 0; i <= 5; i++) {
            const y = this.margin.top + (i / 5) * height;
            gridGroup.innerHTML += `<line x1="${this.margin.left}" y1="${y}" x2="${this.margin.left + width}" y2="${y}" class="grid-line"/>`;
            gridGroup.innerHTML += `<text x="${this.margin.left - 10}" y="${y + 4}" text-anchor="end" class="axis-label">${Math.round(maxIndex * (1 - i / 5))}</text>`;
        }
        svg.appendChild(gridGroup);
        
        // Points
        const pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const orgColors = {};
        let colorIndex = 0;
        
        filteredData.forEach((model, index) => {
            if (!orgColors[model.organization]) {
                orgColors[model.organization] = this.colorPalette[colorIndex % this.colorPalette.length];
                colorIndex++;
            }
            
            const x = xScale(model.price || 1);
            const y = yScale(model.intelligence_index);
            const color = orgColors[model.organization];
            
            pointsGroup.innerHTML += `
                <circle cx="${x}" cy="${y}" r="8" fill="${color}" opacity="0.8" class="data-point" 
                    data-model='${JSON.stringify(model).replace(/'/g, "&#39;")}'
                    onmouseenter="visualization.showTooltip(event, ${JSON.stringify(model).replace(/'/g, "\\'")})"
                    onmouseleave="visualization.hideTooltip()"
                    onmousemove="visualization.moveTooltip(event)"/>
            `;
            
            if (index < 5) {
                pointsGroup.innerHTML += `<text x="${x + 12}" y="${y + 4}" fill="#ffffff" font-size="11" font-weight="500">${model.model_name.split(' ')[0]}</text>`;
            }
        });
        
        svg.appendChild(pointsGroup);
        
        // Axes
        svg.innerHTML += `
            <text x="${this.margin.left + width/2}" y="${this.margin.top + height + 45}" text-anchor="middle" fill="#ffffff" font-size="14">Price (USD per 1M tokens, Log Scale)</text>
            <text x="15" y="${this.margin.top + height/2}" text-anchor="middle" fill="#ffffff" font-size="14" transform="rotate(-90, 15, ${this.margin.top + height/2})">Intelligence Index</text>
        `;
    }
    
    showTooltip(event, model) {
        const tooltip = document.getElementById('tooltip');
        const price = this.dataLoader.simulatePrice(model);
        tooltip.innerHTML = `
            <div class="tooltip-title">${model.model_name}</div>
            <div class="tooltip-content">
                <div>Organization: <span>${model.organization}</span></div>
                <div>Intelligence Index: <span>${model.intelligence_index.toFixed(2)}</span></div>
                <div>Context Window: <span>${(model.context_window / 1000).toFixed(0)}K tokens</span></div>
                <div>License: <span>${model.license}</span></div>
                <div>Est. Price: <span>$${price.toFixed(2)}/M tokens</span></div>
            </div>
        `;
        tooltip.classList.add('visible');
    }
    
    hideTooltip() {
        document.getElementById('tooltip')?.classList.remove('visible');
    }
    
    moveTooltip(event) {
        const tooltip = document.getElementById('tooltip');
        const container = document.getElementById('scatterPlot');
        const rect = container.getBoundingClientRect();
        tooltip.style.left = (event.clientX - rect.left + 15) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 10) + 'px';
    }
    
    renderTable() {
        const tbody = document.getElementById('modelTableBody');
        if (!tbody) return;
        
        const filteredData = this.getFilteredData().slice(0, 10);
        const maxIndex = Math.max(...this.data.topModels.map(m => m.intelligence_index));
        
        tbody.innerHTML = filteredData.map(model => {
            const rankClass = model.rank === 1 ? 'badge-gold' : model.rank === 2 ? 'badge-silver' : model.rank === 3 ? 'badge-bronze' : 'badge-default';
            const contextDisplay = model.context_window >= 1000000 ? `${(model.context_window / 1000000).toFixed(0)}M` : `${(model.context_window / 1000).toFixed(0)}K`;
            const barWidth = (model.intelligence_index / maxIndex) * 100;
            const licenseClass = model.license === 'Proprietary' ? 'license-proprietary' : 'license-open';
            
            return `
                <tr>
                    <td class="model-rank"><span class="badge ${rankClass}">${model.rank}</span></td>
                    <td><div class="model-name">${model.model_name}</div><div class="model-org">${model.organization}</div></td>
                    <td>${model.organization}</td>
                    <td><div class="intelligence-bar"><div class="bar"><div class="bar-fill" style="width: ${barWidth}%"></div></div><span>${model.intelligence_index.toFixed(2)}</span></div></td>
                    <td><span class="context-badge">${contextDisplay}</span></td>
                    <td><span class="license-badge ${licenseClass}">${model.license}</span></td>
                </tr>
            `;
        }).join('');
    }
    
    renderTimeline() {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;
        
        const periods = [
            { label: '2023', context: '4k-8k tokens', models: ['GPT-3.5', 'Llama 2', 'Mistral 7B'] },
            { label: 'Early 2024', context: '32k-128k tokens', models: ['GPT-4o', 'Claude 3', 'Llama 3'] },
            { label: 'Mid 2024', context: '128k-200k tokens', models: ['Gemini 1.5', 'Qwen2.5'] },
            { label: 'Late 2024', context: '200k-1m tokens', models: ['GPT-5.1', 'Claude 3.7', 'Gemini 2.0'] },
            { label: '2025', context: '1m-10m tokens', models: ['Llama 4 (10M)', 'Nova series', 'GPT-4.1'] }
        ];
        
        timeline.innerHTML = periods.map(p => `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-year">${p.label}</div>
                    <div class="timeline-models">${p.models.join(', ')}</div>
                    <div class="timeline-context">${p.context}</div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize
let visualization;
document.addEventListener('DOMContentLoaded', async () => {
    const dataLoader = new DataLoader('data/ai_models_data.json');
    visualization = new ModelVisualization('scatterPlot', dataLoader);
});