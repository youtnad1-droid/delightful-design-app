import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Server, KeyRound, UserCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; serverUrl: string; username: string; password: string }) => void;
}

const AddServerDialog = ({ open, onClose, onSubmit }: Props) => {
  const [name, setName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name || !serverUrl || !username || !password) return;
    onSubmit({ name, serverUrl, username, password });
    setName(""); setServerUrl(""); setUsername(""); setPassword("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card rounded-2xl p-8 w-full max-w-md mx-4"
          >
            <h2 className="text-foreground text-xl font-display text-center mb-6">Add Xtreme Server</h2>

            <div className="space-y-4">
              {[
                { icon: UserCircle, placeholder: "Profile Name (e.g., Family TV)", value: name, set: setName },
                { icon: Server, placeholder: "Server URL (e.g., http://xtreme-server.com)", value: serverUrl, set: setServerUrl },
                { icon: User, placeholder: "Username", value: username, set: setUsername },
                { icon: KeyRound, placeholder: "Password", value: password, set: setPassword, type: "password" },
              ].map(({ icon: Icon, placeholder, value, set, type }) => (
                <div key={placeholder} className="flex items-center gap-3 glass-input rounded-xl px-4 py-3">
                  <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <input
                    type={type || "text"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary/80 to-primary/60 text-primary-foreground font-medium text-sm hover:from-primary hover:to-primary/80 transition-all"
              >
                Continue
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl glass text-foreground font-medium text-sm hover:border-primary/40 transition-all"
              >
                Cancel
              </button>
            </div>

            <p className="text-muted-foreground text-xs text-center mt-4">
              Note: Enter all fields to add your Xtreme Codes service.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddServerDialog;
