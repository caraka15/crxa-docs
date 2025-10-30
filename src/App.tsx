import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { NetworkBackground } from "./components/NetworkBackground";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen flex flex-col">
          <NetworkBackground />
          <Header />
          <div className="relative z-10 flex-grow">
            <Toaster />
            <Sonner />
            <AnimatedRoutes />
            <Analytics />
            <SpeedInsights />
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
