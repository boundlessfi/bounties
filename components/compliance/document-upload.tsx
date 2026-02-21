"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { DocumentType } from "@/types/compliance";

interface DocumentUploadProps {
  type: DocumentType;
  label: string;
  onUpload: (file: File) => Promise<void>;
  uploaded?: boolean;
}

const acceptedTypes: Record<DocumentType, string> = {
  GOVERNMENT_ID: "image/*,.pdf",
  PROOF_OF_ADDRESS: "image/*,.pdf",
  SELFIE: "image/*",
  ADDITIONAL: "image/*,.pdf",
};

export function DocumentUpload({
  type,
  label,
  onUpload,
  uploaded,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    setUploading(true);
    try {
      await onUpload(selectedFile);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {!file && !uploaded && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, PDF (max 10MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedTypes[type]}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {(file || uploaded) && (
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {uploaded ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <div className="text-sm">
              <p className="font-medium">{file?.name || "Document uploaded"}</p>
              <p className="text-xs text-muted-foreground">
                {uploaded ? "Verified" : uploading ? "Uploading..." : "Ready"}
              </p>
            </div>
          </div>
          {!uploaded && !uploading && (
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
