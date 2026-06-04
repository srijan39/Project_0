const SkeletonCard = () => {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200">
      {/* Image */}
      <div className="aspect-[5/5] bg-gray-100 skeleton" />

      {/* Content */}
      <div className="flex flex-grow flex-col p-3 sm:p-5">
        {/* Title */}
        <div className="min-h-[34px] space-y-2 sm:min-h-[40px]">
          <div className="h-3 w-3/4 rounded skeleton sm:h-4" />
          <div className="h-3 w-1/2 rounded skeleton sm:h-4" />
        </div>

        {/* Price */}
        <div className="mt-1 h-3 w-1/4 rounded skeleton sm:h-4" />

        {/* Buttons */}
        <div className="mt-auto hidden gap-2 pt-4 sm:flex">
          <div className="h-10 flex-1 rounded-md skeleton" />
          <div className="h-10 flex-1 rounded-md skeleton" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
