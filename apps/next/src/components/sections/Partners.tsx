import { motion } from "framer-motion";

const partners = [
  { name: "MINISTRY OF TRADE UGANDA", logo: "🏛️" },
  { name: "SERENA HOTELS", logo: "🏨" },
  { name: "MTN UGANDA", logo: "📱" },
  { name: "STANBIC BANK", logo: "🏦" },
  { name: "UGANDA TOURISM BOARD", logo: "✈️" },
  { name: "MAKERERE UNIVERSITY", logo: "🎓" },
  { name: "UNDP UGANDA", logo: "🌍" },
  { name: "FAIR TRADE AFRICA", logo: "🤝" },
];

export function Partners() {
  return (
    <section className="py-12 md:py-16 bg-muted border-y-2 border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground font-display text-xs tracking-widest mb-8"
        >
          TRUSTED BY LEADING ORGANIZATIONS ACROSS UGANDA
        </motion.p>

        <div className="relative overflow-hidden">
          <div className="flex animate-[scroll_30s_linear_infinite] gap-8">
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.name}-${index}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 shrink-0 px-4 py-3 border-2 border-foreground bg-background hover:bg-muted transition-colors"
              >
                <span className="text-2xl">{partner.logo}</span>
                <span className="font-display text-xs tracking-wider text-foreground whitespace-nowrap">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
