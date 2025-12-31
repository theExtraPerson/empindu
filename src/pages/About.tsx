import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Heart, 
  Globe, 
  Users, 
  ArrowRight,
  Award,
  Handshake
} from "lucide-react";
import artisanPortrait from "@/assets/artisan-portrait.jpg";
import heroCrafts from "@/assets/hero-crafts.jpg";

const values = [
  {
    icon: Heart,
    title: "Cultural Preservation",
    description: "We honor and protect Uganda's rich craft heritage, ensuring traditional techniques are passed to future generations.",
  },
  {
    icon: Users,
    title: "Artisan Empowerment",
    description: "We provide artisans with market access, training, and fair compensation for their exceptional work.",
  },
  {
    icon: Globe,
    title: "Sustainable Impact",
    description: "We promote eco-friendly practices and sustainable materials, supporting both communities and the environment.",
  },
  {
    icon: Handshake,
    title: "Fair Trade",
    description: "We ensure transparent, equitable relationships between artisans, buyers, and all stakeholders.",
  },
];

const team = [
  {
    name: "Dr. Grace Nakalema",
    role: "Executive Director",
    image: artisanPortrait,
  },
  {
    name: "James Sserwanga",
    role: "Head of Partnerships",
    image: artisanPortrait,
  },
  {
    name: "Florence Achieng",
    role: "Artisan Relations Lead",
    image: artisanPortrait,
  },
  {
    name: "Peter Ochieng",
    role: "Technology Director",
    image: artisanPortrait,
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroCrafts}
            alt="Ugandan crafts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mudcloth-black/95 via-mudcloth-black/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream mb-6">
              Our <span className="text-secondary">Story</span>
            </h1>
            <p className="text-warm-cream/80 text-lg">
              Building Africa's most comprehensive craft ecosystem, empowering 
              artisans, preserving heritage, and connecting the world to 
              Uganda's extraordinary craftsmanship.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
                Our Mission
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Crafting a Better <span className="text-primary">Future</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                CraftedUganda exists to serve as the digital infrastructure for 
                Uganda's craft renaissance. We're building a comprehensive platform 
                that connects artisans with global markets while driving economic 
                empowerment and cultural preservation.
              </p>
              <p className="text-muted-foreground mb-8">
                From the intricate barkcloth of Masaka to the fine basketry of 
                Kampala, from the carved masterpieces of Gulu to the vibrant 
                beadwork of the East—we celebrate and champion every thread, 
                every weave, every stroke of Ugandan creativity.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="hero" asChild>
                  <Link to="/artisans">
                    Meet Our Artisans
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/partners">Partner With Us</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden">
                <img
                  src={artisanPortrait}
                  alt="Ugandan artisan at work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-hero rounded-2xl p-6 shadow-strong max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-8 w-8 text-warm-cream" />
                  <span className="font-display text-xl font-bold text-warm-cream">
                    Our Vision
                  </span>
                </div>
                <p className="text-warm-cream/90 text-sm">
                  To position Uganda as Africa's premier craft excellence hub by 2030.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-background pattern-weave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
              What We Stand For
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Our Core <span className="text-primary">Values</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-5">
                  <value.icon className="h-7 w-7 text-warm-cream" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
              Meet the Team
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              The People Behind <span className="text-primary">CraftedUganda</span>
            </h2>
            <p className="text-muted-foreground">
              A dedicated team of craft enthusiasts, technologists, and 
              community builders working to transform Uganda's artisan economy.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group text-center"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Award className="h-16 w-16 text-warm-cream mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-warm-cream mb-6">
              Join the Movement
            </h2>
            <p className="text-warm-cream/80 text-lg mb-8">
              Whether you're an artisan, buyer, partner, or supporter, there's 
              a place for you in Uganda's craft renaissance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="gold" size="xl" asChild>
                <Link to="/artisans">
                  Register as Artisan
                </Link>
              </Button>
              <Button variant="outline-light" size="xl" asChild>
                <Link to="/partners">
                  Become a Partner
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
