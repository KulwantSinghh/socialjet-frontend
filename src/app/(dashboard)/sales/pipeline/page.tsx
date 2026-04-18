import type { Metadata } from 'next';
import { PipelineBoard } from './PipelineBoard';

export const metadata: Metadata = { title: 'Pipeline | SocialJet CRM' };

export default function PipelinePage() {
  return <PipelineBoard />;
}
