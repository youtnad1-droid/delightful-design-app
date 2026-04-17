import { useState } from "react";
import { motion } from "framer-motion";
import { User, Plus, Trash2, Edit2, Check, X, RefreshCw, Server, Loader2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import AddServerDialog from "@/components/AddServerDialog";
import { useProfiles } from "@/hooks/useProfiles";
import { useReloadPlaylist } from "@/hooks/useXtreamData";
import { xtreamApi } from "@/lib/xtream";
import { toast } from "sonner";
import type { XtreamProfile } from "@/types/xtream";

const Account = () => {
  const { profiles, activeProfileId, setActiveProfileId, addProfile, updateProfile, removeProfile } = useProfiles();
  const reload = useReloadPlaylist();

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<XtreamProfile>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const startEdit = (p: XtreamProfile) => {
    setEditing(p.id);
    setEditForm({ name: p.name, serverUrl: p.serverUrl, username: p.username, password: p.password });
  };

  const saveEdit = (id: string) => {
    updateProfile(id, editForm);
    setEditing(null);
    toast.success("Profile updated");
  };

  const handleReload = (id: string) => {
    reload(id);
    toast.success("Playlist reloaded");
  };

  const handleTest = async (p: XtreamProfile) => {
    setTestingId(p.id);
    try {
      await xtreamApi.authenticate(p);
      toast.success(`${p.name} connected successfully`);
    } catch (e: any) {
      toast.error(`${p.name}: ${e.message ?? "Failed to connect"}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this profile?")) {
      removeProfile(id);
      toast.success("Profile removed");
    }
  };

  return (
    <PageLayout title="ACCOUNT">
      <div className="h-full flex flex-col gap-3 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{profiles.length} profile{profiles.length !== 1 ? "s" : ""}</p>
          <button onClick={() => setShowAdd(true)}
            className="glass-card rounded-xl px-4 py-2 flex items-center gap-2 hover:border-primary/40 transition-all">
            <Plus className="w-4 h-4 text-primary" />
            <span className="text-foreground text-xs font-medium">Add Server</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {profiles.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Server className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-foreground text-sm mb-1">No profiles yet</p>
              <p className="text-muted-foreground text-xs">Add an Xtream Codes server to get started.</p>
            </div>
          )}

          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const isEditing = editing === p.id;

            return (
              <motion.div key={p.id} layout
                className={`glass-card rounded-2xl p-4 border ${isActive ? "border-primary/40" : "border-transparent"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full glass flex items-center justify-center shrink-0 ${isActive ? "border border-primary" : ""}`}>
                    <User className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {isEditing ? (
                      <>
                        {[
                          { key: "name", placeholder: "Profile Name" },
                          { key: "serverUrl", placeholder: "Server URL" },
                          { key: "username", placeholder: "Username" },
                          { key: "password", placeholder: "Password" },
                        ].map(({ key, placeholder }) => (
                          <input
                            key={key}
                            value={(editForm as any)[key] ?? ""}
                            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full glass-input rounded-lg px-3 py-2 text-foreground text-xs outline-none"
                          />
                        ))}
                      </>
                    ) : (
                      <>
                        <p className="text-foreground text-sm font-medium truncate">{p.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{p.serverUrl}</p>
                        <p className="text-muted-foreground text-[10px] truncate">user: {p.username}</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(p.id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-primary/40">
                          <Check className="w-4 h-4 text-primary" />
                        </button>
                        <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-primary/40">
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:border-destructive/40">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/40">
                    <button
                      onClick={() => setActiveProfileId(p.id)}
                      disabled={isActive}
                      className={`text-[11px] px-3 py-1.5 rounded-lg transition-all ${
                        isActive ? "bg-primary/20 text-primary" : "glass hover:border-primary/40 text-foreground"
                      }`}
                    >
                      {isActive ? "Active" : "Set Active"}
                    </button>
                    <button onClick={() => handleTest(p)} disabled={testingId === p.id}
                      className="text-[11px] px-3 py-1.5 rounded-lg glass hover:border-primary/40 text-foreground flex items-center gap-1.5">
                      {testingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Test
                    </button>
                    <button onClick={() => handleReload(p.id)}
                      className="text-[11px] px-3 py-1.5 rounded-lg glass hover:border-primary/40 text-foreground flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3" /> Reload Playlist
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AddServerDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={(data) => {
          const p = addProfile(data);
          setShowAdd(false);
          toast.success(`Added ${p.name}`);
        }}
      />
    </PageLayout>
  );
};

export default Account;
