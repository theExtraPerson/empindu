import { motion } from "framer-motion";

const partners = [
  { name: "Ministry of Trade Uganda", logo: "🏛️" },
  { name: "Serena Hotels", logo: "🏨" },
  { name: "MTN Uganda", logo: "📱" },
  { name: "Stanbic Bank", logo: "🏦" },
  { name: "Uganda Tourism Board", logo: "✈️" },
  { name: "Makerere University", logo: "🎓" },
  { name: "UNDP Uganda", logo: "🌍" },
  { name: "Fair Trade Africa", logo: "🤝" },
];

export function Partners() {
  return (
    <section className="py-12 md:py-16 bg-muted border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground font-medium mb-8"
        >
          Trusted by leading organizations across Uganda
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="flex animate-[scroll_30s_linear_infinite] gap-12 md:gap-16">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 shrink-0 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <span className="text-3xl">{partner.logo}</span>
                <span className="font-medium text-foreground whitespace-nowrap">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
