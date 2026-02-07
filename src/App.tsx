import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SelectionProvider } from "@/contexts/SelectionContext";
import Navbar from "./components/Navbar";
import SelectModeButton from "./components/SelectModeButton";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Workplace from "./pages/Workplace";
import Simulation from "./pages/Simulation";
import XRPLVault from "./pages/XRPLVault";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SelectionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/workplace" element={<Workplace />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/xrpl-vault" element={<XRPLVault />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SelectModeButton />
        </BrowserRouter>
      </SelectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
