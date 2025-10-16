import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from "../pages/Home";
import { ServicePage } from "../pages/ServicePage";
import { GuidePage } from "../pages/GuidePage";
import { LicensePage } from "../pages/LicensePage";
import NotFound from "../pages/NotFound";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/license" element={<LicensePage />} />
          <Route path="/:chain/service" element={<ServicePage />} />
          <Route path="/:chain/guide" element={<GuidePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};