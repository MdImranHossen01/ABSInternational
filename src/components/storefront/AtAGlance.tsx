import React from 'react';
import Image from 'next/image';

interface AtAGlanceProps {
  brandName?: string;
}

const items = [
  {
    title: "Chairman's Message",
    desc: "We believe that sustainable success is built on unwavering trust, absolute transparency, and genuine community empowerment.",
    image: "/assets/images/Executive/Md.-Nazim-Uddin-Chairman.webp",
    position: "object-top",
  },
  {
    title: "Excellence in Pure Wellness",
    desc: "At ABS International, strict quality control is key to our 100% pure organic herbal formulas and customer trust.",
    image: "/assets/images/glance/glance-wellness.webp",
  },
  {
    title: "Digital Seba & Healthcare",
    desc: "Empowering every member with free monthly MBBS consultations, 50% lab test discounts, and ambulance services.",
    image: "/assets/images/glance/glance-healthcare.webp",
  },
  {
    title: "Largest Community & Logistics",
    desc: "Rapidly growing nationwide network of ABS shops, local pickup hubs, and fast express courier delivery.",
    image: "/assets/images/glance/glance-logistics.webp",
  },
];

export function AtAGlance({ brandName = 'ABS International' }: AtAGlanceProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-center mb-16 text-primary font-display">
          {brandName} at a Glance
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] bg-primary text-primary-foreground min-h-[460px] shadow-lg group hover:shadow-xl transition-all duration-300 border border-primary/20"
            >
              {/* Image Circle Area (Exact 65% height absolute top with rounded-b-[2.5rem]) */}
              <div className="absolute top-0 left-0 w-full h-[65%] flex items-center justify-center p-6 bg-background rounded-b-[2.5rem] transition-colors duration-300">
                <div className="relative aspect-square h-full max-w-full rounded-full overflow-hidden border-4 border-primary/10 shadow-inner">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={`object-cover ${item.position || 'object-center'} group-hover:scale-105 transition-transform duration-500`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
                  />
                </div>
              </div>

              {/* Primary Background Content Block (Exact 35% height) */}
              <div className="relative z-10 p-8 pt-4 flex flex-col justify-start h-[35%]">
                <h3 className="font-extrabold text-base md:text-lg mb-2 leading-snug font-display text-primary-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-primary-foreground/80 leading-relaxed font-body">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AtAGlance;
