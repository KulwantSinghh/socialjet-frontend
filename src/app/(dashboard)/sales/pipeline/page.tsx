import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pipeline' };

export default function PipelinePage() {
  return (
    <div>
      <h1>Pipeline</h1>
      <p>Sales pipeline / Kanban board will be displayed here.</p>
    </div>
  );
}
