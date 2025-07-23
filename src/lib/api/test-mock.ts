/**
 * Mock data and test utilities for API integration
 * Used for development and testing when backend is not available
 */

import type { 
  Paper, 
  TodayPaperResponse, 
  CategoryPaperResponse, 
  HistoryResponse,
  HealthResponse 
} from './types';

// Mock paper data
export const mockPaper: Paper = {
  id: "mock-1",
  arxivId: "1706.03762",
  title: "Attention Is All You Need",
  abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
  authors: [
    { name: "Ashish Vaswani" },
    { name: "Noam Shazeer" },
    { name: "Niki Parmar" },
    { name: "Jakob Uszkoreit" },
    { name: "Llion Jones" },
    { name: "Aidan N. Gomez" },
    { name: "Lukasz Kaiser" },
    { name: "Illia Polosukhin" }
  ],
  categories: ["cs.CL", "cs.AI", "cs.LG"],
  primaryCategory: "cs.CL",
  submittedDate: "2017-06-12",
  citationCount: 45678,
  pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
  abstractUrl: "https://arxiv.org/abs/1706.03762"
};

// Mock responses
export const mockTodayPaperResponse: TodayPaperResponse = {
  paper: mockPaper,
  featuredDate: new Date().toISOString().split('T')[0]
};

export const mockCategoryPaperResponse: CategoryPaperResponse = {
  paper: mockPaper,
  category: "cs.AI",
  featuredDate: new Date().toISOString().split('T')[0]
};

export const mockHistoryResponse: HistoryResponse = {
  papers: [
    {
      paper: mockPaper,
      featuredDate: "2024-01-15",
      category: "cs.AI"
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    hasNext: true
  }
};

export const mockHealthResponse: HealthResponse = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  services: {
    database: 'up',
    arxiv: 'up',
    semanticScholar: 'up'
  }
};

/**
 * Mock API client for testing
 */
export class MockApiClient {
  private delay: number;

  constructor(delay = 500) {
    this.delay = delay;
  }

  private async mockDelay<T>(data: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return data;
  }

  async getTodayPaper(): Promise<TodayPaperResponse> {
    return this.mockDelay(mockTodayPaperResponse);
  }

  async getCategoryPaper(category: string): Promise<CategoryPaperResponse> {
    return this.mockDelay({
      ...mockCategoryPaperResponse,
      category
    });
  }

  async getHistory(params?: { page?: number; limit?: number; category?: string }): Promise<HistoryResponse> {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    
    return this.mockDelay({
      ...mockHistoryResponse,
      pagination: {
        ...mockHistoryResponse.pagination,
        page,
        limit,
        hasNext: page < 5 // Mock having 5 pages total
      }
    });
  }

  async getHealth(): Promise<HealthResponse> {
    return this.mockDelay(mockHealthResponse);
  }
}

/**
 * Test utilities
 */
export const testApiIntegration = async () => {
  console.log('🧪 Testing API Integration Layer...');
  
  const mockClient = new MockApiClient();
  
  try {
    // Test today's paper
    console.log('📅 Testing today\'s paper...');
    const todayPaper = await mockClient.getTodayPaper();
    console.log('✅ Today\'s Paper:', todayPaper.paper.title);
    
    // Test category paper
    console.log('🏷️  Testing category paper...');
    const categoryPaper = await mockClient.getCategoryPaper('cs.AI');
    console.log('✅ Category Paper:', categoryPaper.paper.title);
    
    // Test history
    console.log('📚 Testing history...');
    const history = await mockClient.getHistory({ page: 1, limit: 10 });
    console.log('✅ History:', `${history.papers.length} papers, page ${history.pagination.page}`);
    
    // Test health
    console.log('🏥 Testing health check...');
    const health = await mockClient.getHealth();
    console.log('✅ Health:', health.status);
    
    console.log('🎉 All API integration tests passed!');
  } catch (error) {
    console.error('❌ API integration test failed:', error);
  }
};

/**
 * Validation test utilities
 */
export const testValidation = () => {
  console.log('🔍 Testing validation functions...');
  
  // Import validation functions
  import('./types').then(({ validatePaper, validateTodayPaperResponse, validateHistoryResponse }) => {
    // Test paper validation
    console.log('📄 Testing paper validation...');
    const isValidPaper = validatePaper(mockPaper);
    console.log('✅ Paper validation:', isValidPaper ? 'PASSED' : 'FAILED');
    
    // Test today paper response validation
    console.log('📅 Testing today paper response validation...');
    const isValidTodayResponse = validateTodayPaperResponse(mockTodayPaperResponse);
    console.log('✅ Today response validation:', isValidTodayResponse ? 'PASSED' : 'FAILED');
    
    // Test history response validation
    console.log('📚 Testing history response validation...');
    const isValidHistoryResponse = validateHistoryResponse(mockHistoryResponse);
    console.log('✅ History response validation:', isValidHistoryResponse ? 'PASSED' : 'FAILED');
    
    console.log('🎉 All validation tests completed!');
  });
};

// Export for development use
export const enableMockMode = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 Mock mode enabled for development');
  }
};