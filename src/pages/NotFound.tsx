import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <span className="font-display text-[12rem] md:text-[16rem] font-bold text-foreground leading-none tracking-tighter">
            404
          </span>
        </motion.div>
        
        <div className="border-t-2 border-b-2 border-foreground py-8 mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wider mb-4">
            PAGE NOT FOUND
          </h1>
          <p className="text-muted-foreground font-body">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-2 border-foreground font-display text-xs tracking-widest"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            GO BACK
          </Button>
          <Button 
            className="border-2 border-foreground font-display text-xs tracking-widest"
            asChild
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              RETURN HOME
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
