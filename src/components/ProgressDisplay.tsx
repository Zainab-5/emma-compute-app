'use client';

import { useEffect, useState } from 'react';

interface Computation {
  id: string;
  a: number;
  b: number;
  status: string;
  progress: number;
  jobs: Job[];
}

interface Job {
  id: string;
  operation: string;
  status: string;
  result: number | null;
  error: string | null;
}

interface Props {
  computationId: string;
}

export default function ProgressDisplay({ computationId }: Props) {
  const [computation, setComputation] = useState<Computation | null>(null);
  
  useEffect(() => {
    // Poll every second
    const interval = setInterval(async () => {
      const response = await fetch(`/api/jobs/${computationId}`);
      const data = await response.json();
      setComputation(data);
      
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [computationId]);
  
  if (!computation) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = {
      add: `${computation.a} + ${computation.b}`,
      subtract: `${computation.a} - ${computation.b}`,
      multiply: `${computation.a} × ${computation.b}`,
      divide: `${computation.a} ÷ ${computation.b}`
    };
    return labels[op] || op;
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-sm text-gray-600">{computation.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${computation.progress}%` }}
          />
        </div>
      </div>
      
      {/* Individual Jobs */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Computations</h3>
        {computation.jobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-mono">{getOperationLabel(job.operation)}</span>
              <div className="flex items-center gap-3">
                {job.status === 'completed' && job.result !== null && (
                  <span className="font-bold text-green-600">
                    = {job.result}
                  </span>
                )}
                {job.status === 'failed' && (
                  <span className="text-red-600 text-sm">{job.error}</span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}