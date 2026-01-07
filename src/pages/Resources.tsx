import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
      steps: 5,
      estimatedTime: "10 min"
    },
    {
      id: 2,
      title: "Adding Your First Product",
      steps: 8,
      estimatedTime: "15 min"
    },
    {
      id: 3,
      title: "Order Fulfillment Workflow",
      steps: 6,
      estimatedTime: "5 min"
    },
    {
      id: 4,
      title: "Handling Returns & Refunds",
      steps: 4,
      estimatedTime: "5 min"
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
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pattern-mudcloth">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary-deep/95" />
        <div className="relative z-10 container mx-auto px-4 text-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30">
              Learn & Discover
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="blogs" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Blogs</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2">
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Training</span>
              </TabsTrigger>
              <TabsTrigger value="stories" className="gap-2">
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
                    <Card className="group overflow-hidden hover-lift border-border/50">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute top-4 left-4 bg-primary/90">
                          {blog.category}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {blog.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {blog.views.toLocaleString()} views
                          </span>
                          <Button variant="ghost" size="sm" className="gap-2 group-hover:text-primary">
                            Read More <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
                    <TabsTrigger value="videos" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Video className="w-4 h-4" />
                      Video Sessions
                    </TabsTrigger>
                    <TabsTrigger value="guides" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <FileText className="w-4 h-4" />
                      Guides & Manuals
                    </TabsTrigger>
                    <TabsTrigger value="procedures" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
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
                          <Card className="group overflow-hidden hover-lift">
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-mudcloth-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="hero" size="icon" className="rounded-full w-14 h-14">
                                  <Play className="w-6 h-6" />
                                </Button>
                              </div>
                              <Badge className="absolute top-3 right-3 bg-mudcloth-black/80">
                                {video.duration}
                              </Badge>
                            </div>
                            <CardHeader>
                              <Badge variant="outline" className="w-fit mb-2">
                                {video.level}
                              </Badge>
                              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                              <CardDescription className="line-clamp-2">{video.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Instructor: <span className="text-foreground">{video.instructor}</span>
                              </p>
                            </CardContent>
                          </Card>
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
                          <Card className="group hover-lift flex">
                            <div className="w-24 md:w-32 bg-gradient-to-br from-primary to-primary-deep flex items-center justify-center flex-shrink-0 rounded-l-lg">
                              <FileText className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <div className="flex-1 p-6">
                              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                {guide.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{guide.pages} pages</span>
                                  <span>{guide.format}</span>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Download className="w-4 h-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Card>
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
                      className="max-w-2xl mx-auto mt-8 space-y-4"
                    >
                      {trainingResources.procedures.map((procedure, index) => (
                        <motion.div key={procedure.id} variants={itemVariants}>
                          <Card className="group hover-lift">
                            <CardContent className="p-6 flex items-center gap-6">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-bold text-primary">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                  {procedure.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>{procedure.steps} steps</span>
                                  <span>~{procedure.estimatedTime}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="gap-2">
                                View <ArrowRight className="w-4 h-4" />
                              </Button>
                            </CardContent>
                          </Card>
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
                    <Card className="overflow-hidden border-0 shadow-strong">
                      <div className="grid lg:grid-cols-2">
                        <div className="relative aspect-square lg:aspect-auto overflow-hidden">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover"
                          />
                          {story.video && (
                            <div className="absolute inset-0 bg-mudcloth-black/40 flex items-center justify-center">
                              <Button variant="hero" size="lg" className="gap-2 rounded-full">
                                <Play className="w-6 h-6" />
                                Watch Story
                              </Button>
                            </div>
                          )}
                          <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                            Featured {story.type.charAt(0).toUpperCase() + story.type.slice(1)}
                          </Badge>
                        </div>
                        <div className="p-8 lg:p-12 flex flex-col justify-center bg-card">
                          <Badge variant="outline" className="w-fit mb-4 capitalize">
                            {story.type}
                          </Badge>
                          <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2">
                            {story.title}
                          </h2>
                          <p className="text-primary font-medium mb-4">{story.subtitle}</p>
                          <p className="text-muted-foreground mb-6">{story.description}</p>
                          <p className="text-foreground mb-6">{story.content}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {story.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="hero" className="gap-2">
                              Read Full Story <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Share2 className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Heart className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Other Stories Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {featureStories.filter(s => !s.featured).map((story) => (
                    <motion.div key={story.id} variants={itemVariants}>
                      <Card className="group overflow-hidden hover-lift h-full">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute top-4 left-4 bg-primary/90 capitalize">
                            {story.type}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                            {story.title}
                          </CardTitle>
                          <p className="text-sm text-primary">{story.subtitle}</p>
                          <CardDescription className="line-clamp-3">
                            {story.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {story.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button variant="ghost" size="sm" className="gap-2 -ml-2 group-hover:text-primary">
                            Explore Story <ArrowRight className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-earth text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Have a Story to Share?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              We're always looking for inspiring stories about Ugandan artisans, 
              traditional crafts, and cultural heritage.
            </p>
            <Button variant="gold" size="lg" className="gap-2">
              Submit Your Story <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
