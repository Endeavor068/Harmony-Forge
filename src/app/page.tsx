"use client";

import * as React from "react";
import { Plus, Music2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongList } from "@/components/song-management/song-list";
import { SongForm } from "@/components/song-management/song-form";
import { SongView } from "@/components/song-management/song-view";
import { DeleteConfirm } from "@/components/song-management/delete-confirm";
import { Song, NewSong } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  useCollection, 
  useFirestore, 
  useAuth, 
  useUser, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  initiateAnonymousSignIn
} from "@/firebase";
import { collection, doc } from "firebase/firestore";

export default function HarmonyForge() {
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [view, setView] = React.useState<"list" | "form" | "details">("list");
  const [editingSong, setEditingSong] = React.useState<Song | null>(null);
  const [selectedSong, setSelectedSong] = React.useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = React.useState<Song | null>(null);

  // Ensure user is signed in anonymously to satisfy security rules
  React.useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Real-time subscription to the 'songs' collection
  const songsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "songs");
  }, [db]);

  const { data: songs, isLoading: isSongsLoading } = useCollection<Song>(songsQuery);

  const handleCreateNew = () => {
    setEditingSong(null);
    setView("form");
  };

  const handleEdit = (song: Song) => {
    setEditingSong(song);
    setView("form");
  };

  const handleSelect = (song: Song) => {
    setSelectedSong(song);
    setView("details");
  };

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
  };

  const confirmDelete = () => {
    if (songToDelete && db) {
      const docRef = doc(db, "songs", songToDelete.id);
      deleteDocumentNonBlocking(docRef);
      
      if (selectedSong?.id === songToDelete.id) {
        setView("list");
      }
      
      toast({
        title: "Song deleted",
        description: `"${songToDelete.title}" has been removed.`,
      });
      setSongToDelete(null);
    }
  };

  const handleSave = (songData: Song | NewSong) => {
    if (!db) return;

    if ("id" in songData) {
      // Update existing
      const docRef = doc(db, "songs", songData.id);
      updateDocumentNonBlocking(docRef, songData);
      
      if (selectedSong?.id === songData.id) setSelectedSong(songData);
      toast({ title: "Song updated", description: "Changes have been saved successfully." });
    } else {
      // Create new
      const colRef = collection(db, "songs");
      const tempId = Math.random().toString(36).substr(2, 9);
      const newSongWithId = { ...songData, id: tempId };
      
      addDocumentNonBlocking(colRef, newSongWithId);
      toast({ title: "Song created", description: "New song added to the collection." });
    }
    setView("list");
  };

  const isLoading = isUserLoading || isSongsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-primary/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">
              HarmonyForge
            </h1>
          </div>
          <Button onClick={handleCreateNew} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
            <Plus className="w-4 h-4 mr-2" />
            New Song
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse font-headline">Connecting to Hymnal...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* List Section */}
            <div className={`${view === 'details' ? 'hidden lg:block' : 'block'} lg:col-span-5`}>
              <div className="sticky top-24">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-headline font-semibold text-primary/80">Song Collection</h2>
                  <span className="text-sm font-medium text-muted-foreground px-2 py-1 bg-white/50 rounded-lg border border-primary/5">
                    {songs?.length || 0} items
                  </span>
                </div>
                <SongList
                  songs={songs || []}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onSelect={handleSelect}
                />
              </div>
            </div>

            {/* Action Area Section */}
            <div className="lg:col-span-7">
              {view === "list" && (
                <div className="hidden lg:flex h-[70vh] items-center justify-center bg-white/20 border-2 border-dashed border-primary/10 rounded-3xl animate-in fade-in zoom-in duration-700">
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Music2 className="w-10 h-10 text-primary/30" />
                    </div>
                    <h3 className="text-xl font-headline text-primary/60">Select a song</h3>
                    <p className="text-muted-foreground text-sm">
                      Choose a song from the collection to view its details, or start by creating a new one.
                    </p>
                  </div>
                </div>
              )}

              {view === "form" && (
                <SongForm
                  song={editingSong}
                  onSave={handleSave}
                  onCancel={() => setView("list")}
                />
              )}

              {view === "details" && selectedSong && (
                <SongView
                  song={selectedSong}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onBack={() => setView("list")}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      <DeleteConfirm
        open={!!songToDelete}
        onOpenChange={(open) => !open && setSongToDelete(null)}
        onConfirm={confirmDelete}
        songTitle={songToDelete?.title || ""}
      />
    </div>
  );
}
