'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Loader2, ScanText } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ScanText className="mr-2 h-4 w-4" />
          Parse Data
        </>
      )}
    </Button>
  );
}


export function DataImporter({ onImport, loading }: { onImport: (text: string) => void; loading: boolean }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onImport(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="text-input">Paste Position Text</Label>
        <Textarea
          id="text-input"
          name="text"
          placeholder="ETH / USDC&#10;v4&#10;0.05%&#10;..."
          rows={8}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-muted-foreground">OR</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <div className="space-y-2">
        <Label>Upload Screenshot</Label>
        <Input
          id="image-input"
          name="image"
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={loading}
        />
        <div
          className="w-full p-4 border-2 border-dashed rounded-lg cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors h-48"
          onClick={handleImageClick}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-full max-w-full object-contain rounded-md"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-10 w-10" />
              <p>Click to upload an image</p>
              <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ScanText className="mr-2 h-4 w-4" />
            Parse Data
          </>
        )}
      </Button>
    </form>
  );
}
