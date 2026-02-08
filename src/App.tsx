import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Modal } from "./components/Modal";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  return (
    <div className="flex h-screen w-full bg-[#0c0c0e] text-[#e2e8f0] overflow-hidden">
      <Sidebar />
      <Modal />
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Editor />
          </motion.div>
        </AnimatePresence>

        {/* Background gradient effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-800/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
      </main>
    </div>
  );
}

export default App;
