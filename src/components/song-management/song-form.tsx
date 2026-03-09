"use client";

import * as React from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Song, NewSong } from "@/lib/types";

interface SongFormProps {
  song?: Song | null;
  onSave: (song: Song | NewSong) => void;
  onCancel: () => void;
}

export function SongForm({ song, onSave, onCancel }: SongFormProps) {
  const [formData, setFormData] = React.useState<NewSong | Song>(
    song || {
      number: "",
      title: "",
      author: "",
      year: "",
      choruses: [""],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChorusChange = (index: number, value: string) => {
    const newChoruses = [...formData.choruses];
    newChoruses[index] = value;
    setFormData((prev) => ({ ...prev, choruses: newChoruses }));
  };

  const addChorus = () => {
    setFormData((prev) => ({ ...prev, choruses: [...prev.choruses, ""] }));
  };

  const removeChorus = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      choruses: prev.choruses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          {song ? "Edit Song" : "Create New Song"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Song Number</Label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="e.g. 001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Song Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter song title"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author / Composer</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Artist name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="Publication year"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-headline">Choruses</Label>
              <Button type="button" variant="outline" size="sm" onClick={addChorus} className="text-accent hover:text-accent/90 border-accent/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Chorus
              </Button>
            </div>
            
            {formData.choruses.map((chorus, index) => (
              <div key={index} className="relative group animate-in fade-in slide-in-from-left-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Chorus {index + 1}</Label>
                    {formData.choruses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeChorus(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={chorus}
                    onChange={(e) => handleChorusChange(index, e.target.value)}
                    placeholder="Enter chorus text..."
                    className="min-h-[100px] resize-none"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="w-4 h-4 mr-2" />
            {song ? "Update Song" : "Save Song"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}