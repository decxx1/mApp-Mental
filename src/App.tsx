import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Dashboard } from "./components/Dashboard";
import { Modal } from "./components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "./store/useAppStore";

function App() {
  const { selectedNoteId } = useAppStore();

  return (
    <>
      <div className="flex h-screen w-full bg-background text-[#e2e8f0] overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedNoteId ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <Editor />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <Dashboard />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background gradient effect */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0" />
        </main>
      </div>
      <Modal />
    </>
  );
}

export default App;
