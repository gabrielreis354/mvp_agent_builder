'use client';

export function AgentCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 animate-pulse">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-700 mr-3"></div>
        <div>
          <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-3 w-full bg-gray-700 rounded mb-1"></div>
      <div className="h-3 w-5/6 bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-end gap-2">
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
