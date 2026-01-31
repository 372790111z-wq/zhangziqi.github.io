/**
 * AI Models Data Loader
 * Loads and processes AI model data from JSON file
 */

class DataLoader {
    constructor(dataPath) {
        this.dataPath = dataPath;
        this.rawData = null;
        this.processedData = null;
    }
    
    async load() {
        try {
            const response = await fetch(this.dataPath);
            if (!response.ok) {
                throw new Error(`Failed to load data: ${response.status}`);
            }
            this.rawData = await response.json();
            this.processedData = this.processData();
            return this.processedData;
        } catch (error) {
            console.error('Error loading data:', error);
            // Return fallback data for demo
            return this.getFallbackData();
        }
    }
    
    processData() {
        if (!this.rawData || !this.rawData.top_models) {
            return this.getFallbackData();
        }
        
        const processed = {
            metadata: this.rawData.metadata,
            topModels: this.rawData.top_models,
            allModels: this.rawData.top_models.map(model => ({
                ...model,
                // Add simulated price data for visualization
                price: this.simulatePrice(model),
                displayPrice: this.formatPrice(model)
            })),
            organizations: this.groupByOrganization(),
            timeline: this.rawData.context_window_evolution
        };
        
        return processed;
    }
    
    groupByOrganization() {
        const groups = {};
        if (this.rawData && this.rawData.models_by_organization) {
            for (const [org, data] of Object.entries(this.rawData.models_by_organization)) {
                groups[org] = {
                    ...data,
                    color: this.getOrgColor(org)
                };
            }
        }
        return groups;
    }
    
    getOrgColor(org) {
        const colors = {
            'OpenAI': '#10a37f',
            'Anthropic': '#d4a373',
            'Google': '#4285f4',
            'DeepSeek': '#1e88e5',
            'Alibaba': '#ff6f00',
            'Meta': '#0668e1',
            'xAI': '#000000',
            'Mistral': '#ff6b6b',
            'NVIDIA': '#76b900',
            'Amazon': '#ff9900'
        };
        return colors[org] || '#667eea';
    }
    
    simulatePrice(model) {
        // Simulate price based on intelligence index and context
        const basePrice = model.intelligence_index * 0.5;
        const contextFactor = Math.log10(model.context_window || 1000) / 10;
        return Math.max(0.01, basePrice * (1 + contextFactor));
    }
    
    formatPrice(model) {
        const price = this.simulatePrice(model);
        if (price < 1) {
            return `$${(price * 100).toFixed(2)}/M`;
        } else {
            return `$${price.toFixed(2)}/M`;
        }
    }
    
    getFallbackData() {
        return {
            metadata: {
                source: 'Demo Data',
                last_updated: new Date().toISOString().split('T')[0],
                total_models: 10
            },
            topModels: [
                { rank: 1, model_name: 'GPT-5.2', organization: 'OpenAI', intelligence_index: 50.51, context_window: 400000, license: 'Proprietary' },
                { rank: 2, model_name: 'Claude Opus 4.5', organization: 'Anthropic', intelligence_index: 49.08, context_window: 200000, license: 'Proprietary' },
                { rank: 3, model_name: 'Gemini 3 Pro', organization: 'Google', intelligence_index: 47.92, context_window: 1000000, license: 'Proprietary' },
                { rank: 4, model_name: 'GPT-5.1', organization: 'OpenAI', intelligence_index: 47.02, context_window: 400000, license: 'Proprietary' },
                { rank: 5, model_name: 'Gemini 3 Flash', organization: 'Google', intelligence_index: 45.85, context_window: 1000000, license: 'Proprietary' },
                { rank: 6, model_name: 'GPT-5.2', organization: 'OpenAI', intelligence_index: 45.32, context_window: 400000, license: 'Proprietary' },
                { rank: 7, model_name: 'GPT-5', organization: 'OpenAI', intelligence_index: 44.10, context_window: 400000, license: 'Proprietary' },
                { rank: 8, model_name: 'Claude 4.5', organization: 'Anthropic', intelligence_index: 42.44, context_window: 1000000, license: 'Proprietary' },
                { rank: 9, model_name: 'Claude Opus 4.5', organization: 'Anthropic', intelligence_index: 42.54, context_window: 200000, license: 'Proprietary' },
                { rank: 10, model_name: 'Grok 4', organization: 'xAI', intelligence_index: 41.33, context_window: 256000, license: 'Proprietary' }
            ],
            allModels: [],
            organizations: {},
            timeline: {}
        };
    }
    
    filterByYear(year, data) {
        if (year === 'all') return data;
        return data.filter(model => 
            model.release_date && model.release_date.startsWith(year)
        );
    }
    
    filterByOrg(org, data) {
        if (org === 'all') return data;
        return data.filter(model => model.organization === org);
    }
    
    filterByLicense(license, data) {
        if (license === 'all') return data;
        const isProprietary = license === 'proprietary';
        return data.filter(model => 
            isProprietary ? model.license === 'Proprietary' : model.license === 'Open'
        );
    }
}

// Export for use in other scripts
window.DataLoader = DataLoader;