import { Link } from "react-router-dom";

const CategorySection = () => {
  const categories = [
    { label: "Men", link: "/men" },
    { label: "Women", link: "/women" },
    { label: "Kids", link: "/kids" },
  ];

  return (
    <section className="py-24 bg-gray-50 px-6 md:px-12">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold uppercase tracking-wide mb-16">
          Shop by Category
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.label}
              to={category.link}
              className="group relative h-72 bg-gray-200 flex items-center justify-center overflow-hidden"
            >
              <span className="relative z-10 text-xl font-medium uppercase tracking-wide">
                {category.label}
              </span>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;