import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  FileText, 
  Video, 
  Calendar, 
  Clock, 
  ArrowRight, 
  User,
  Eye,
  Heart,
  Share2,
  Download
} from "lucide-react";

// Mock data for blogs
const blogs = [
  {
    id: 1,
    title: "The Art of Bark Cloth: Uganda's Living Heritage",
    excerpt: "Discover how Ugandan artisans preserve the ancient craft of bark cloth making, a UNESCO-recognized tradition that spans centuries.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600",
    author: "Maria Nakato",
    date: "2024-01-15",
    readTime: "8 min read",
    category: "Traditions",
    views: 1240
  },
  {
    id: 2,
    title: "From Local Markets to Global Reach: The Artisan Journey",
    excerpt: "How CraftedUganda is helping rural artisans connect with international buyers while preserving their authentic craftsmanship.",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600",
    author: "John Mukasa",
    date: "2024-01-10",
    readTime: "6 min read",
    category: "Business",
    views: 892
  },
  {
    id: 3,
    title: "Sustainable Materials in Traditional Ugandan Crafts",
    excerpt: "Exploring how eco-friendly practices are deeply embedded in traditional craft-making techniques across Uganda.",
    image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600",
    author: "Grace Auma",
    date: "2024-01-05",
    readTime: "5 min read",
    category: "Sustainability",
    views: 756
  },
  {
    id: 4,
    title: "The Economics of Handmade: Fair Trade in Action",
    excerpt: "Understanding the economic impact of fair trade practices on artisan communities in rural Uganda.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600",
    author: "David Ochieng",
    date: "2024-01-01",
    readTime: "7 min read",
    category: "Business",
    views: 623
  }
];

// Mock data for training resources
const trainingResources = {
  videos: [
    {
      id: 1,
      title: "Introduction to E-Commerce for Artisans",
      description: "Learn the basics of selling your crafts online and reaching global customers.",
      duration: "45 min",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
      instructor: "Sarah Nambi",
      level: "Beginner"
    },
    {
      id: 2,
      title: "Product Photography Masterclass",
      description: "Capture stunning photos of your crafts using just your smartphone.",
      duration: "1h 20min",
      thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600",
      instructor: "Peter Wasswa",
      level: "Intermediate"
    },
    {
      id: 3,
      title: "Pricing Your Handmade Products",
      description: "Strategies for pricing that honors your craft while remaining competitive.",
      duration: "35 min",
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
      instructor: "Rebecca Akello",
      level: "Beginner"
    }
  ],
  guides: [
    {
      id: 1,
      title: "Complete Seller's Handbook",
      description: "Everything you need to know about selling on CraftedUganda.",
      pages: 48,
      format: "PDF",
      downloads: 1250
    },
    {
      id: 2,
      title: "Quality Standards Guide",
      description: "Maintain consistent quality across all your handmade products.",
      pages: 24,
      format: "PDF",
      downloads: 890
    },
    {
      id: 3,
      title: "Shipping & Packaging Best Practices",
      description: "Ensure your products arrive safely to customers worldwide.",
      pages: 16,
      format: "PDF",
      downloads: 756
    },
    {
      id: 4,
      title: "Customer Service Excellence",
      description: "Build lasting relationships with your buyers through exceptional service.",
      pages: 20,
      format: "PDF",
      downloads: 542
    }
  ],
  procedures: [
    {
      id: 1,
      title: "Account Registration Process",
      steps: ["Visit CraftedUganda website", "Click 'Sign Up' and select your role (Buyer/Artisan)", "Enter email, password, and full name", "Verify your email address", "Complete your profile with location and preferences"],
      estimatedTime: "10 min"
    },
    {
      id: 2,
      title: "Adding Your First Product (Artisans)",
      steps: ["Go to Dashboard → My Products", "Click 'Add Product' button", "Enter product name, category, price, and stock quantity", "Add description, materials used, and use case", "Set size category and dimensions", "Toggle personalization and return options", "Upload up to 5 product images", "Save and publish your product"],
      estimatedTime: "15 min"
    },
    {
      id: 3,
      title: "Placing an Order (Buyers)",
      steps: ["Browse the Marketplace and find products you love", "Click on a product to view full details", "Select quantity and add to cart", "Request personalization if available (optional)", "Proceed to Checkout", "Enter shipping details or choose pickup location", "Select payment method (Mobile Money or Cash on Delivery)", "Confirm and place your order"],
      estimatedTime: "10 min"
    },
    {
      id: 4,
      title: "Order Fulfillment Workflow",
      steps: ["Order received notification sent to artisan", "Artisan confirms order and begins preparation", "If personalization requested, artisan reviews and approves", "Product is crafted/packaged for shipping", "Order marked as 'Shipped' with tracking info", "Customer receives delivery or picks up from hub"],
      estimatedTime: "Varies"
    },
    {
      id: 5,
      title: "Returns & Refunds Process",
      steps: ["Go to Dashboard → My Orders", "Find the order and click 'Request Return'", "Select items to return and provide reason", "Indicate item condition (unopened, like new, etc.)", "Submit return request for review", "Once approved, drop off at nearest pickup hub or schedule collection", "Refund processed after item inspection (3-5 business days)"],
      estimatedTime: "5-10 min"
    }
  ]
};

// Mock data for feature stories
const featureStories = [
  {
    id: 1,
    type: "artisan",
    title: "Florence Namaganda: Weaving Dreams into Reality",
    subtitle: "A Master Basket Weaver's 30-Year Journey",
    description: "Meet Florence, whose intricate banana fiber baskets have traveled from her small village in Masaka to galleries in New York and Paris. Her story is one of resilience, creativity, and an unwavering commitment to preserving her grandmother's teachings.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800",
    video: null,
    content: "Florence began weaving at the age of 8, learning from her grandmother in a small village near Masaka. Today, her baskets are prized by collectors worldwide for their exceptional craftsmanship and unique designs that tell stories of Ugandan culture.",
    tags: ["Basket Weaving", "Masaka", "Women Artisans"],
    featured: true
  },
  {
    id: 2,
    type: "product",
    title: "The Luganda Love Knot Necklace",
    subtitle: "Where Ancient Symbolism Meets Modern Design",
    description: "This signature piece combines traditional Luganda love symbols with contemporary jewelry design, creating a wearable piece of cultural heritage.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    video: null,
    content: "Each Love Knot necklace takes three days to create, using techniques passed down through generations. The distinctive spiral pattern represents the eternal nature of love in Luganda culture.",
    tags: ["Jewelry", "Luganda Culture", "Handcrafted"],
    featured: false
  },
  {
    id: 3,
    type: "tradition",
    title: "The Sacred Art of Bark Cloth Making",
    subtitle: "A UNESCO-Recognized Cultural Treasure",
    description: "Journey into the ancient process of creating bark cloth, a practice that has sustained Ugandan communities for over 600 years and continues to inspire modern artisans.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800",
    video: "https://example.com/video.mp4",
    content: "Bark cloth, known locally as 'Lubugo,' is made from the inner bark of the Mutuba tree. The process involves careful harvesting, beating, and drying to create this distinctive fabric used in ceremonies and everyday life.",
    tags: ["Bark Cloth", "UNESCO Heritage", "Traditional Craft"],
    featured: true
  },
  {
    id: 4,
    type: "skill",
    title: "Mastering Raffia Palm Weaving",
    subtitle: "The Technique Behind Uganda's Iconic Bags",
    description: "An in-depth look at the sophisticated techniques artisans use to transform raffia palm leaves into beautiful, durable bags and accessories.",
    image: "https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800",
    video: null,
    content: "Raffia weaving requires years of practice to master. Artisans learn to select the perfect leaves, prepare natural dyes from local plants, and execute complex patterns that tell cultural stories.",
    tags: ["Raffia Weaving", "Bags & Accessories", "Techniques"],
    featured: false
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Resources = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [trainingTab, setTrainingTab] = useState("videos");

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-primary">
        <div className="absolute inset-0 pattern-kente opacity-10" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-foreground" />
        <div className="relative z-10 container mx-auto px-4 text-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-secondary text-foreground border-2 border-foreground uppercase tracking-wider">
              Learn & Discover
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl uppercase tracking-wider text-primary-foreground mb-6">
              Resources & Stories
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Explore our collection of blogs, training materials, and feature stories 
              celebrating Ugandan craftsmanship and artisan traditions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-background">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-12 bg-transparent gap-2">
              <TabsTrigger 
                value="blogs" 
                className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display shadow-brutal data-[state=active]:shadow-none"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Blogs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="training" 
                className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display shadow-brutal data-[state=active]:shadow-none"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stories" 
                className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display shadow-brutal data-[state=active]:shadow-none"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Stories</span>
              </TabsTrigger>
            </TabsList>

            {/* Blogs Tab */}
            <TabsContent value="blogs">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 gap-8"
              >
                {blogs.map((blog) => (
                  <motion.div key={blog.id} variants={itemVariants}>
                    <div className="group border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-lg transition-all overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute top-4 left-4 bg-secondary text-foreground border-2 border-foreground uppercase tracking-wider">
                          {blog.category}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {blog.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {blog.readTime}
                          </span>
                        </div>
                        <h3 className="font-display text-xl uppercase tracking-wider mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t-2 border-muted">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {blog.views.toLocaleString()} views
                          </span>
                          <Button variant="ghost" size="sm" className="gap-2 uppercase tracking-wider font-display group-hover:text-primary">
                            Read More <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training">
              <div className="space-y-8">
                {/* Training Sub-tabs */}
                <Tabs value={trainingTab} onValueChange={setTrainingTab}>
                  <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent">
                    <TabsTrigger 
                      value="videos" 
                      className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display"
                    >
                      <Video className="w-4 h-4" />
                      Video Sessions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="guides" 
                      className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display"
                    >
                      <FileText className="w-4 h-4" />
                      Guides & Manuals
                    </TabsTrigger>
                    <TabsTrigger 
                      value="procedures" 
                      className="gap-2 border-2 border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background uppercase tracking-wider font-display"
                    >
                      <BookOpen className="w-4 h-4" />
                      Procedures
                    </TabsTrigger>
                  </TabsList>

                  {/* Videos */}
                  <TabsContent value="videos">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid md:grid-cols-3 gap-6 mt-8"
                    >
                      {trainingResources.videos.map((video) => (
                        <motion.div key={video.id} variants={itemVariants}>
                          <div className="group border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-lg transition-all overflow-hidden">
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button className="w-16 h-16 border-2 border-background bg-background text-foreground hover:bg-secondary">
                                  <Play className="w-8 h-8" />
                                </Button>
                              </div>
                              <Badge className="absolute top-3 right-3 bg-foreground text-background border-0 uppercase tracking-wider">
                                {video.duration}
                              </Badge>
                            </div>
                            <div className="p-6">
                              <Badge variant="outline" className="w-fit mb-3 border-2 border-foreground uppercase tracking-wider">
                                {video.level}
                              </Badge>
                              <h3 className="font-display text-lg uppercase tracking-wider mb-2 line-clamp-2">{video.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{video.description}</p>
                              <p className="text-sm text-muted-foreground border-t-2 border-muted pt-4">
                                Instructor: <span className="text-foreground font-display uppercase">{video.instructor}</span>
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>

                  {/* Guides */}
                  <TabsContent value="guides">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid md:grid-cols-2 gap-6 mt-8"
                    >
                      {trainingResources.guides.map((guide) => (
                        <motion.div key={guide.id} variants={itemVariants}>
                          <div className="group border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-lg transition-all flex overflow-hidden">
                            <div className="w-24 md:w-32 bg-primary flex items-center justify-center flex-shrink-0 border-r-2 border-foreground">
                              <FileText className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <div className="flex-1 p-6">
                              <h3 className="font-display text-lg uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">
                                {guide.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{guide.pages} pages</span>
                                  <span className="font-display">{guide.format}</span>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2 border-2 border-foreground uppercase tracking-wider shadow-brutal hover:shadow-none">
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>

                  {/* Procedures */}
                  <TabsContent value="procedures">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="max-w-3xl mx-auto mt-8 space-y-6"
                    >
                      {trainingResources.procedures.map((procedure, index) => (
                        <motion.div key={procedure.id} variants={itemVariants}>
                          <div className="group border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-lg transition-all">
                            <div className="p-6">
                              <div className="flex items-start gap-4 mb-6 pb-4 border-b-2 border-muted">
                                <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center flex-shrink-0 bg-secondary">
                                  <span className="text-xl font-display font-bold text-foreground">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-display text-lg uppercase tracking-wider group-hover:text-primary transition-colors">
                                    {procedure.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {procedure.steps.length} steps • ~{procedure.estimatedTime}
                                  </p>
                                </div>
                              </div>
                              <ol className="list-decimal list-inside space-y-2 ml-16 text-sm text-muted-foreground">
                                {procedure.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="leading-relaxed">{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Feature Stories Tab */}
            <TabsContent value="stories">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12"
              >
                {/* Featured Story */}
                {featureStories.filter(s => s.featured).map((story) => (
                  <motion.div key={story.id} variants={itemVariants}>
                    <div className="border-2 border-foreground shadow-brutal-lg overflow-hidden">
                      <div className="grid lg:grid-cols-2">
                        <div className="relative aspect-square lg:aspect-auto overflow-hidden">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          {story.video && (
                            <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                              <Button className="gap-2 border-2 border-background bg-background text-foreground hover:bg-secondary uppercase tracking-wider">
                                <Play className="w-6 h-6" />
                                Watch Story
                              </Button>
                            </div>
                          )}
                          <Badge className="absolute top-4 left-4 bg-secondary text-foreground border-2 border-foreground uppercase tracking-wider">
                            Featured {story.type.charAt(0).toUpperCase() + story.type.slice(1)}
                          </Badge>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center bg-card border-l-0 lg:border-l-2 border-t-2 lg:border-t-0 border-foreground">
                          <Badge variant="outline" className="w-fit mb-4 capitalize border-2 border-foreground uppercase tracking-wider">
                            {story.type}
                          </Badge>
                          <h2 className="font-display text-2xl lg:text-4xl uppercase tracking-wider mb-2">
                            {story.title}
                          </h2>
                          <p className="text-primary font-display uppercase tracking-wider mb-4">{story.subtitle}</p>
                          <p className="text-muted-foreground mb-6">{story.description}</p>
                          <p className="text-foreground mb-6">{story.content}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {story.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-muted border-2 border-muted-foreground/30 uppercase tracking-wider text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 pt-4 border-t-2 border-muted">
                            <Button className="gap-2 border-2 border-foreground shadow-brutal hover:shadow-none uppercase tracking-wider">
                              Read Full Story <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="border-2 border-foreground">
                              <Share2 className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="border-2 border-foreground">
                              <Heart className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Other Stories Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {featureStories.filter(s => !s.featured).map((story) => (
                    <motion.div key={story.id} variants={itemVariants}>
                      <div className="group border-2 border-foreground bg-card shadow-brutal hover:shadow-brutal-lg transition-all overflow-hidden h-full">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-2 border-foreground capitalize uppercase tracking-wider">
                            {story.type}
                          </Badge>
                        </div>
                        <div className="p-6">
                          <h3 className="font-display text-xl uppercase tracking-wider mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-sm text-primary font-display uppercase tracking-wider mb-3">{story.subtitle}</p>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {story.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {story.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs border-2 border-foreground uppercase tracking-wider">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2 -ml-2 uppercase tracking-wider font-display group-hover:text-primary">
                            Explore Story <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="absolute top-0 left-0 w-full h-4 bg-secondary" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl md:text-5xl uppercase tracking-wider mb-6">
              Have a Story to Share?
            </h2>
            <p className="text-background/80 max-w-xl mx-auto mb-8">
              We're always looking for inspiring stories about Ugandan artisans, 
              traditional crafts, and cultural heritage.
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="gap-2 border-2 border-background shadow-brutal hover:shadow-brutal-lg uppercase tracking-wider"
            >
              Submit Your Story <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
