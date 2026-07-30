import React from 'react';
import { PhotoboothProvider, usePhotobooth } from './context/PhotoboothContext';
import { Landing } from './pages/Landing';
import { SelectFrame } from './pages/SelectFrame';
import { Capture } from './pages/Capture';
import { Editor } from './pages/Editor';
import { Preview } from './pages/Preview';
import { RecipientGiftModal } from './components/RecipientGiftModal';
import { AdminFinanceModal } from './components/AdminFinanceModal';
import { AnimatePresence, motion } from 'framer-motion';

const PhotoboothWizard: React.FC = () => {
  const { step, isAdminOpen, setIsAdminOpen } = usePhotobooth();

  // Secret URL listener (#admin / ?admin=true / /admin) & Keyboard Shortcut (Ctrl+Shift+A)
  React.useEffect(() => {
    const checkSecretAdminRoute = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const path = window.location.pathname;

      if (hash === '#admin' || search.includes('admin=true') || path.endsWith('/admin')) {
        setIsAdminOpen(true);
      }
    };

    checkSecretAdminRoute();
    window.addEventListener('hashchange', checkSecretAdminRoute);

    // Keyboard shortcut listener: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkSecretAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsAdminOpen]);

  // Elegance page slide transition parameters
  const pageVariants = {
    initial: { opacity: 0, x: 15 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -15 },
  };

  return (
    <>
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

      {/* AUTOMATIC RECIPIENT GIFT ENVELOPE MODAL */}
      <RecipientGiftModal />

      {/* OWNER FINANCE & REKAP EXCEL CONTROL MODAL (HANYA TERBUKA VIA URL RAHASIA / SHORTCUT) */}
      <AdminFinanceModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </>
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
