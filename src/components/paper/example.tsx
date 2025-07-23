/**
 * Example usage of Paper Display Components
 * 
 * This file demonstrates how to use the paper components
 * and provides sample data for testing and development.
 */

import React from 'react';
import { 
  PaperCard, 
  PaperMetadata, 
  AbstractDisplay, 
  AuthorsList, 
  CitationBadge, 
  CategoryTag, 
  ShareButton, 
  ExternalLinks,
  type Paper 
} from './index';

// Sample paper data
const samplePaper: Paper = {
  id: '1',
  arxivId: '1706.03762',
  title: 'Attention Is All You Need',
  abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.0 after training for 3.5 days on eight GPUs.',
  authors: [
    { name: 'Ashish Vaswani' },
    { name: 'Noam Shazeer' },
    { name: 'Niki Parmar' },
    { name: 'Jakob Uszkoreit' },
    { name: 'Llion Jones' },
    { name: 'Aidan N. Gomez' },
    { name: 'Lukasz Kaiser' },
    { name: 'Illia Polosukhin' }
  ],
  categories: ['cs.CL', 'cs.AI', 'cs.LG'],
  primaryCategory: 'cs.CL',
  submittedDate: '2017-06-12',
  citationCount: 45678,
  pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
  abstractUrl: 'https://arxiv.org/abs/1706.03762'
};

/**
 * Example component showing all paper component variants
 */
export const PaperComponentsExample: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Paper Display Components</h1>
        <p className="text-slate-600">Examples of all paper display components in action.</p>
      </div>

      {/* Featured Paper Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Featured Paper Card</h2>
        <PaperCard 
          paper={samplePaper} 
          variant="featured" 
          featuredDate="2017-06-12"
        />
      </section>

      {/* Compact Paper Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Compact Paper Card</h2>
        <PaperCard 
          paper={samplePaper} 
          variant="compact"
        />
      </section>

      {/* List Paper Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">List Paper Card</h2>
        <PaperCard 
          paper={samplePaper} 
          variant="list"
        />
      </section>

      {/* Individual Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800">Individual Components</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Authors List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Authors List</h3>
            <AuthorsList authors={samplePaper.authors} maxAuthors={3} />
          </div>

          {/* Citation Badge */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Citation Badge</h3>
            <CitationBadge count={samplePaper.citationCount} />
          </div>

          {/* Category Tags */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Category Tags</h3>
            <div className="flex gap-2">
              {samplePaper.categories.map(category => (
                <CategoryTag 
                  key={category} 
                  category={category} 
                  isPrimary={category === samplePaper.primaryCategory}
                />
              ))}
            </div>
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">External Links</h3>
            <ExternalLinks
              pdfUrl={samplePaper.pdfUrl}
              abstractUrl={samplePaper.abstractUrl}
              arxivId={samplePaper.arxivId}
              title={samplePaper.title}
            />
          </div>
        </div>

        {/* Share Button */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Share Button</h3>
          <div className="flex gap-2">
            <ShareButton paper={samplePaper} variant="button" />
            <ShareButton paper={samplePaper} variant="icon" />
          </div>
        </div>

        {/* Abstract Display */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Abstract Display</h3>
          <AbstractDisplay 
            abstract={samplePaper.abstract}
            title={samplePaper.title}
            maxLines={3}
          />
        </div>

        {/* Paper Metadata */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Paper Metadata</h3>
          <PaperMetadata
            authors={samplePaper.authors}
            submittedDate={samplePaper.submittedDate}
            categories={samplePaper.categories}
            primaryCategory={samplePaper.primaryCategory}
            citationCount={samplePaper.citationCount}
          />
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Loading States</h2>
        <PaperCard 
          paper={samplePaper} 
          variant="featured" 
          loading={true}
        />
      </section>
    </div>
  );
};

export default PaperComponentsExample;