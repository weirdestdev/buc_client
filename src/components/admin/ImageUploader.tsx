
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  maxImages?: number;
  currentImagesCount?: number;
}

export default function ImageUploader({ 
  onImageUploaded, 
  maxImages = 15, 
  currentImagesCount = 0 
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate if we've reached the maximum number of images
  const isMaxImagesReached = currentImagesCount >= maxImages;

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size should not exceed 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('property_images')
        .upload(filePath, file);

      clearInterval(interval);
      
      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('property_images')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        
        // Pass the public URL back to the parent component
        onImageUploaded(publicUrl);
      }, 500);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }

    // Clear the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Upload Image</Label>
        <span className="text-xs text-muted-foreground">
          {currentImagesCount} of {maxImages} images
        </span>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading || isMaxImagesReached}
        className="w-full h-20 flex flex-col gap-1 justify-center items-center border-dashed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Uploading... {uploadProgress}%</span>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <span className="text-sm">
              {isMaxImagesReached 
                ? 'Maximum images reached' 
                : 'Click to upload image'}
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
