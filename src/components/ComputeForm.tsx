'use client';

import { useState } from 'react';
import { z } from 'zod';

const FormSchema = z.object({
  a: z.number(),
  b: z.number()
});

interface Props {
  onComputationStart: (id: string) => void;
}

export default function ComputeForm({ onComputationStart }: Props) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      
      FormSchema.parse({ a: numA, b: numB });
      
      const response = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: numA, b: numB })
      });
      
      if (!response.ok) throw new Error('Failed to start computation');
      
      const { computationId } = await response.json();
      onComputationStart(computationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Number A
          </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number A"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Number B
          </label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number B"
            required
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting...' : 'Compute'}
      </button>
    </form>
  );
}