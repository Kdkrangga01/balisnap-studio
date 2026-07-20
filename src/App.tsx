import React from 'react';
import { PhotoboothProvider, usePhotobooth } from './context/PhotoboothContext';
import { Landing } from './pages/Landing';
import { SelectFrame } from './pages/SelectFrame';
import { Capture } from './pages/Capture';
import { Editor } from './pages/Editor';
import { Preview } from './pages/Preview';
import { AnimatePresence, motion } from 'framer-motion';

const PhotoboothWizard: React.FC = () => {
  const { step } = usePhotobooth();

  // Elegance page slide transition parameters
  const pageVariants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full min-h-screen"
      >
        {step === 'landing' && <Landing />}
        {step === 'select-frame' && <SelectFrame />}
        {step === 'capture' && <Capture />}
        {step === 'editor' && <Editor />}
        {step === 'preview' && <Preview />}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <PhotoboothProvider>
      <PhotoboothWizard />
    </PhotoboothProvider>
  );
}

export default App;
