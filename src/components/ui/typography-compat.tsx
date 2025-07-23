/**
 * Typography compatibility layer
 * Provides a unified Typography component interface
 */

import React from 'react';
import { Heading, Text, Blockquote, Lead, Small } from './typography';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'body1' | 'body2' | 'caption' | 'small'
    | 'lead' | 'blockquote';
  children: React.ReactNode;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body1', className, children, ...props }) => {
    // Map variants to appropriate components
    switch (variant) {
      case 'h1':
        return (
          <Heading 
            level={1} 
            variant="4xl" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'h2':
        return (
          <Heading 
            level={2} 
            variant="3xl" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'h3':
        return (
          <Heading 
            level={3} 
            variant="2xl" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'h4':
        return (
          <Heading 
            level={4} 
            variant="xl" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'h5':
        return (
          <Heading 
            level={5} 
            variant="lg" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'h6':
        return (
          <Heading 
            level={6} 
            variant="base" 
            className={className} 
            {...props}
          >
            {children}
          </Heading>
        );
      case 'body1':
        return (
          <Text 
            variant="body" 
            className={className} 
            {...props}
          >
            {children}
          </Text>
        );
      case 'body2':
        return (
          <Text 
            variant="large" 
            className={className} 
            {...props}
          >
            {children}
          </Text>
        );
      case 'caption':
        return (
          <Text 
            variant="caption" 
            as="span"
            className={className} 
            {...props}
          >
            {children}
          </Text>
        );
      case 'small':
        return (
          <Small 
            className={className} 
            {...props}
          >
            {children}
          </Small>
        );
      case 'lead':
        return (
          <Lead 
            className={className} 
            {...props}
          >
            {children}
          </Lead>
        );
      case 'blockquote':
        return (
          <Blockquote 
            className={className} 
            {...props}
          >
            {children}
          </Blockquote>
        );
      default:
        return (
          <Text 
            variant="body" 
            className={className} 
            {...props}
          >
            {children}
          </Text>
        );
    }
  }
);

Typography.displayName = 'Typography';