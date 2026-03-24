const SkeletonCard = () => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200">
      {/* Image */}
      <div className="aspect-[5/5] bg-gray-100 skeleton" />

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        {/* Title */}
        <div className="min-h-[40px] space-y-2">
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-4 w-1/2 rounded skeleton" />
        </div>

        {/* Price */}
        <div className="mt-1 h-4 w-1/4 rounded skeleton" />

        {/* Buttons */}
        <div className="mt-auto flex gap-2 pt-4">
          <div className="h-10 flex-1 rounded-md skeleton" />
          <div className="h-10 flex-1 rounded-md skeleton" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;