import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CategoryTagProps {
  category: string;
  isPrimary?: boolean;
  showFullName?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

/**
 * CategoryTag component for displaying arXiv categories with appropriate styling
 * 
 * Features:
 * - Category-specific colors based on subject area
 * - Primary category highlighting
 * - Full name display option
 * - Removable functionality
 * - Consistent with design system
 * 
 * @example
 * ```tsx
 * <CategoryTag category="cs.AI" isPrimary />
 * <CategoryTag category="math.GT" showFullName />
 * <CategoryTag category="physics.gen-ph" variant="outline" />
 * ```
 */
export const CategoryTag = React.forwardRef<HTMLSpanElement, CategoryTagProps>(
  ({ 
    category,
    isPrimary = false,
    showFullName = false,
    variant,
    size = 'sm',
    removable = false,
    onRemove,
    className,
    ...props 
  }, ref) => {
    // Category name mappings
    const categoryNames: Record<string, string> = {
      // Computer Science
      'cs.AI': 'Artificial Intelligence',
      'cs.LG': 'Machine Learning',
      'cs.CV': 'Computer Vision',
      'cs.CL': 'Computational Linguistics',
      'cs.NE': 'Neural Networks',
      'cs.CR': 'Cryptography',
      'cs.DB': 'Databases',
      'cs.DS': 'Data Structures',
      'cs.IR': 'Information Retrieval',
      'cs.RO': 'Robotics',
      'cs.SE': 'Software Engineering',
      'cs.SY': 'Systems and Control',
      'cs.HC': 'Human-Computer Interaction',
      
      // Mathematics
      'math.GT': 'Geometric Topology',
      'math.AG': 'Algebraic Geometry',
      'math.NT': 'Number Theory',
      'math.RT': 'Representation Theory',
      'math.CO': 'Combinatorics',
      'math.DG': 'Differential Geometry',
      'math.FA': 'Functional Analysis',
      'math.PR': 'Probability',
      'math.ST': 'Statistics Theory',
      
      // Physics
      'physics.gen-ph': 'General Physics',
      'cond-mat': 'Condensed Matter',
      'hep-th': 'High Energy Physics - Theory',
      'hep-ph': 'High Energy Physics - Phenomenology',
      'nucl-th': 'Nuclear Theory',
      'gr-qc': 'General Relativity',
      'astro-ph': 'Astrophysics',
      'quant-ph': 'Quantum Physics',
      
      // Biology
      'q-bio.BM': 'Biomolecules',
      'q-bio.CB': 'Cell Behavior',
      'q-bio.GN': 'Genomics',
      'q-bio.MN': 'Molecular Networks',
      'q-bio.NC': 'Neurons and Cognition',
      'q-bio.PE': 'Populations and Evolution',
      'q-bio.QM': 'Quantitative Methods',
      
      // Economics
      'econ.EM': 'Econometrics',
      'econ.GN': 'General Economics',
      'econ.TH': 'Theoretical Economics',
      
      // Statistics
      'stat.AP': 'Applications',
      'stat.CO': 'Computation',
      'stat.ME': 'Methodology',
      'stat.ML': 'Machine Learning',
      'stat.TH': 'Statistics Theory',
    };

    // Get category color based on subject area
    const getCategoryVariant = (cat: string): typeof variant => {
      if (variant) return variant;
      
      if (cat.startsWith('cs.')) return 'primary';
      if (cat.startsWith('math.')) return 'info';
      if (cat.startsWith('physics.') || ['cond-mat', 'hep-th', 'hep-ph', 'nucl-th', 'gr-qc', 'astro-ph', 'quant-ph'].includes(cat)) return 'warning';
      if (cat.startsWith('q-bio.')) return 'success';
      if (cat.startsWith('econ.')) return 'secondary';
      if (cat.startsWith('stat.')) return 'outline';
      
      return 'default';
    };

    const displayText = showFullName ? (categoryNames[category] || category) : category;
    const badgeVariant = getCategoryVariant(category);

    return (
      <Badge
        ref={ref}
        variant={badgeVariant}
        size={size}
        removable={removable}
        onRemove={onRemove}
        className={cn(
          isPrimary && 'ring-2 ring-sky-200 ring-offset-1',
          className
        )}
        title={showFullName ? category : (categoryNames[category] || category)}
        {...props}
      >
        {displayText}
      </Badge>
    );
  }
);

CategoryTag.displayName = 'CategoryTag';