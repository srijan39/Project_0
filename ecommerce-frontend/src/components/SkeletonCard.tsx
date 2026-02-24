const SkeletonCard = () => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 p-4">
      
      {/* Image */}
      <div className="aspect-[3/4] skeleton rounded-md" />

      {/* Text */}
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/4 skeleton rounded" />
      </div>

      {/* Button */}
      <div className="mt-4 h-10 skeleton rounded-md" />
    </div>
  );
};

export default SkeletonCard;