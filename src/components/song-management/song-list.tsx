
"use client";

import * as React from "react";
import { Search, Edit, Trash2, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Song, getDisplayTitle } from "@/lib/types";

interface SongListProps {
  songs: Song[];
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onSelect: (song: Song) => void;
}

export function SongList({ songs, onEdit, onDelete, onSelect }: SongListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSongs = songs.filter((song) => {
    const searchLower = searchTerm.toLowerCase();
    const enTitle = song.content?.en?.title?.toLowerCase() || "";
    const frTitle = song.content?.fr?.title?.toLowerCase() || "";
    const author = song.author?.toLowerCase() || "";
    const number = song.number?.toLowerCase() || "";
    
    return (
      enTitle.includes(searchLower) ||
      frTitle.includes(searchLower) ||
      author.includes(searchLower) ||
      number.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder="Search by title, author, or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white/50 backdrop-blur-sm border-primary/10 focus:border-primary/30 transition-all rounded-xl"
        />
      </div>

      <div className="grid gap-4">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <Card
              key={song.id}
              className="group border-transparent hover:border-accent/20 bg-white/40 hover:bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-2"
              onClick={() => onSelect(song)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="font-headline font-bold text-sm">#{song.number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {getDisplayTitle(song)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{song.author || "Unknown Author"}</span>
                      {song.year && (
                        <>
                          <span className="text-muted-foreground/30">•</span>
                          <span>{song.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-accent hover:bg-accent/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(song);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(song);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-primary/10">
            <Music className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-body">No songs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
