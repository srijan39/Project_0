import { Truck, ShieldCheck, Star, RefreshCcw } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Get your orders delivered quickly and reliably across India.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "100% secure checkout with trusted payment methods.",
  },
  {
    icon: RefreshCcw,
    title: "Easy Returns",
    desc: "Hassle-free 7-day return and exchange policy.",
  },
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Carefully curated products with top-notch quality.",
  },
];

const TrustSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
            Why Choose Us
          </h2>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            We provide the best experience for your shopping journey.
          </p>

          {/* underline */}
          {/* <div className="mt-4 h-[4px] w-20 bg-black mx-auto rounded-full" /> */}
        </div>

        {/* Features */}
        <div className="border-t border-gray-200 mb-16" />
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group text-center transition duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition group-hover:bg-black">
                  <Icon
                    size={24}
                    className="text-black transition group-hover:text-white"
                  />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;