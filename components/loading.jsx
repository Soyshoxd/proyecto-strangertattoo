export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-700 rounded mb-4"></div>
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <section className="container-equipo">
      <div className="flex items-center justify-center">
        <div className="h-12 bg-gray-700 rounded w-64 animate-pulse mb-6"></div>
      </div>
      
      <div className="flex justify-center w-full mt-2">
        <div className="flex items-center justify-center gap-4 max-w-[1000px] w-full p-4">
          <div className="h-80 w-60 bg-gray-700 rounded animate-pulse"></div>
          
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-700 animate-pulse"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-700 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductSliderSkeleton() {
  return (
    <div className="mt-1 w-full px-4">
      <div className="overflow-hidden py-6 bg-black rounded-lg relative w-full">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-4 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="w-full px-4 mt-4">
      <div className="flex gap-4 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-[300px] bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
