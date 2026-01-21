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
    title: "CULTURAL PRESERVATION",
    description: "We honor and protect Uganda's rich craft heritage, ensuring traditional techniques are passed to future generations.",
  },
  {
    icon: Users,
    title: "ARTISAN EMPOWERMENT",
    description: "We provide artisans with market access, training, and fair compensation for their exceptional work.",
  },
  {
    icon: Globe,
    title: "SUSTAINABLE IMPACT",
    description: "We promote eco-friendly practices and sustainable materials, supporting both communities and the environment.",
  },
  {
    icon: Handshake,
    title: "FAIR TRADE",
    description: "We ensure transparent, equitable relationships between artisans, buyers, and all stakeholders.",
  },
];

const team = [
  {
    name: "DR. GRACE NAKALEMA",
    role: "Executive Director",
    image: artisanPortrait,
  },
  {
    name: "JAMES SSERWANGA",
    role: "Head of Partnerships",
    image: artisanPortrait,
  },
  {
    name: "FLORENCE ACHIENG",
    role: "Artisan Relations Lead",
    image: artisanPortrait,
  },
  {
    name: "PETER OCHIENG",
    role: "Technology Director",
    image: artisanPortrait,
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroCrafts}
            alt="Ugandan crafts"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 border-2 border-secondary text-secondary font-display text-xs tracking-widest mb-6"
            >
              EST. 2020
            </motion.span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-background tracking-tight leading-[0.9] mb-6">
              OUR
              <br />
              <span className="text-secondary">STORY</span>
            </h1>
            <p className="text-background/80 text-lg md:text-xl max-w-xl font-body">
              Building Africa's most comprehensive craft ecosystem, empowering 
              artisans, preserving heritage, and connecting the world to 
              Uganda's extraordinary craftsmanship.
            </p>
          </motion.div>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 border-l-4 border-t-4 border-secondary hidden lg:block" />
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 bg-background border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-display text-xs tracking-widest text-muted-foreground mb-4 block">
                [ 01 — MISSION ]
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.9] mb-8">
                CRAFTING A<br />
                BETTER <span className="text-primary">FUTURE</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 font-body leading-relaxed">
                CraftedUganda exists to serve as the digital infrastructure for 
                Uganda's craft renaissance. We're building a comprehensive platform 
                that connects artisans with global markets while driving economic 
                empowerment and cultural preservation.
              </p>
              <p className="text-muted-foreground mb-10 font-body leading-relaxed">
                From the intricate barkcloth of Masaka to the fine basketry of 
                Kampala, from the carved masterpieces of Gulu to the vibrant 
                beadwork of the East—we celebrate and champion every thread, 
                every weave, every stroke of Ugandan creativity.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="default" size="lg" className="border-2 border-foreground" asChild>
                  <Link to="/artisans">
                    MEET OUR ARTISANS
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-foreground" asChild>
                  <Link to="/partners">PARTNER WITH US</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden border-2 border-foreground">
                <img
                  src={artisanPortrait}
                  alt="Ugandan artisan at work"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -left-8 bg-primary p-6 border-2 border-foreground max-w-xs shadow-brutal"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-8 w-8 text-primary-foreground" />
                  <span className="font-display text-lg font-bold text-primary-foreground tracking-wider">
                    OUR VISION
                  </span>
                </div>
                <p className="text-primary-foreground/90 text-sm font-body">
                  To position Uganda as Africa's premier craft excellence hub by 2030.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-muted border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-display text-xs tracking-widest text-muted-foreground mb-4 block">
              [ 02 — VALUES ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              WHAT WE<br />
              <span className="text-primary">STAND FOR</span>
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
                className="group bg-background p-6 border-2 border-foreground hover:bg-primary hover:border-primary transition-all duration-300 hover:-translate-y-2 shadow-brutal hover:shadow-brutal-lg"
              >
                <div className="w-14 h-14 border-2 border-foreground group-hover:border-primary-foreground flex items-center justify-center mb-5 transition-colors">
                  <value.icon className="h-7 w-7 text-foreground group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary-foreground tracking-wider mb-3 transition-colors">
                  {value.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-primary-foreground/80 text-sm font-body transition-colors">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-32 bg-background border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-display text-xs tracking-widest text-muted-foreground mb-4 block">
              [ 03 — TEAM ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4">
              THE PEOPLE BEHIND<br />
              <span className="text-primary">CRAFTEDUGANDA</span>
            </h2>
            <p className="text-muted-foreground font-body text-lg">
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
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden mb-4 relative border-2 border-foreground">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground tracking-wider">
                  {member.name}
                </h3>
                <p className="text-muted-foreground font-body text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 border-2 border-primary-foreground mx-auto mb-8 flex items-center justify-center"
            >
              <Award className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight mb-6">
              JOIN THE<br />MOVEMENT
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 font-body max-w-xl mx-auto">
              Whether you're an artisan, buyer, partner, or supporter, there's 
              a place for you in Uganda's craft renaissance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" size="xl" className="border-2 border-foreground" asChild>
                <Link to="/auth">
                  REGISTER AS ARTISAN
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/partners">
                  BECOME A PARTNER
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
