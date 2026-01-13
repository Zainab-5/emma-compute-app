'use client';

import { useState } from 'react';
import ComputeForm from '@/components/ComputeForm';
import ProgressDisplay from '@/components/ProgressDisplay';

export default function Home() {
  const [computationId, setComputationId] = useState<string | null>(null);
  
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Solera Compute System
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ComputeForm onComputationStart={setComputationId} />
          
          {computationId && (
            <div className="mt-8">
              <ProgressDisplay computationId={computationId} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}