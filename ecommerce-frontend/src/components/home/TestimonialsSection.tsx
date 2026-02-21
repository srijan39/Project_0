const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "The quality is exceptional. The fit is perfect and the design feels timeless.",
      name: "Aarav Sharma",
      role: "Verified Buyer",
    },
    {
      quote:
        "Minimal, elegant, and comfortable. My go-to brand for everyday essentials.",
      name: "Meera Kapoor",
      role: "Fashion Enthusiast",
    },
    {
      quote:
        "Fast delivery and premium packaging. Truly feels like luxury.",
      name: "Rohan Mehta",
      role: "Loyal Customer",
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-semibold uppercase tracking-wide mb-4">
          What Our Customers Say
        </h2>

        <p className="text-gray-500 mb-16 max-w-xl mx-auto">
          Real experiences from people who love our products.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="border p-8 rounded-lg hover:shadow-lg transition duration-300 text-left"
            >
              <p className="text-gray-600 mb-6 leading-relaxed">
                “{item.quote}”
              </p>

              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;