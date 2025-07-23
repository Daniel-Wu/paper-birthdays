import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paper History - Paper Birthdays',
  description: 'Browse through historically significant academic papers featured on previous days. Filter by category and explore research from computer science, mathematics, physics, and more.',
  keywords: [
    'academic papers',
    'research history',
    'arXiv papers',
    'scientific literature',
    'paper citations',
    'research timeline',
  ],
  openGraph: {
    title: 'Paper History - Paper Birthdays',
    description: 'Browse through historically significant academic papers featured on previous days',
    type: 'website',
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}