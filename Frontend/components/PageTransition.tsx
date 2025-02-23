"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname(); // Get the current route

  return (
    <motion.div
      key={pathname} // Triggers animation on route change
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
