"use client";

import { SongMediaIndicators } from "@/components/song-management/song-media-indicators";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Song, getDisplayAuthor, getDisplayNumber, getDisplayTitle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Edit, Music, Search, Trash2, X } from "lucide-react";
import * as React from "react";

interface SongListProps {
  songs: Song[];
  uiLanguage: 'en' | 'fr';
  selectedSongId?: string;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onSelect: (song: Song) => void;
}

export function SongList({ songs, uiLanguage, selectedSongId, onEdit, onDelete, onSelect }: SongListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSongs = React.useMemo(() => {
    const searchTrimmed = searchTerm.trim().toLowerCase();

    // Sort logic for consistent ordering (Numeric)
    const sorted = [...songs].sort((a, b) => {
      const numA = parseInt(getDisplayNumber(a, uiLanguage).replace(/\D/g, '')) || 0;
      const numB = parseInt(getDisplayNumber(b, uiLanguage).replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    if (!searchTrimmed) return sorted;

    // Strip '#' symbols to allow users to search for "199" even if it's stored as "199" 
    // or if they type "#199" searching against plain strings.
    const numericPart = searchTrimmed.replace(/#/g, '');

    return sorted.filter((song) => {
      const en = song.content?.en;
      const fr = song.content?.fr;

      // 1. Check if the search term matches the song number (in either language)
      const matchesNumber =
        (en?.number && en.number.toLowerCase().includes(numericPart)) ||
        (fr?.number && fr.number.toLowerCase().includes(numericPart));

      // 2. Check if the search term matches other metadata
      const searchableStrings = [
        en?.title, en?.author, en?.year,
        fr?.title, fr?.author, fr?.year
      ].filter(Boolean).map(s => s!.toLowerCase());

      const matchesText = searchableStrings.some(s => s.includes(searchTrimmed));

      return matchesNumber || matchesText;
    });
  }, [songs, searchTerm, uiLanguage]);

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <Input
          placeholder={uiLanguage === 'en' ? "Search by number, title, or author..." : "Rechercher par numéro, titre ou auteur..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 h-12 bg-white/50 backdrop-blur-sm border-primary/10 focus:border-primary/30 transition-all rounded-xl"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const isSelected = song.id === selectedSongId;
            return (
              <Card
                key={song.id}
                className={cn(
                  "group transition-all cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-2",
                  "border-transparent hover:border-accent/20 bg-white/40 hover:bg-white shadow-sm hover:shadow-md",
                  isSelected && "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                )}
                onClick={() => onSelect(song)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      isSelected ? "bg-primary text-white" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                      <span className="font-headline font-bold text-sm">#{getDisplayNumber(song, uiLanguage)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-headline font-semibold text-lg truncate transition-colors",
                        isSelected ? "text-primary" : "group-hover:text-primary"
                      )}>
                        {getDisplayTitle(song, uiLanguage)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span className="truncate">{getDisplayAuthor(song, uiLanguage)}</span>
                        <SongMediaIndicators
                          song={song}
                          uiLanguage={uiLanguage}
                          className="shrink-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "flex items-center gap-1 transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
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
            );
          })
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
