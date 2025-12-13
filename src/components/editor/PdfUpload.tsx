import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PdfUploadProps {
  onPdfChange: (pdfData: {
    file: File;
    description: string;
  } | null) => void;
  existingPdf?: {
    fileName: string;
    fileSize: number;
    description?: string;
  };
}

export const PdfUpload = ({ onPdfChange, existingPdf }: PdfUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState(existingPdf?.description || "");
  const { toast } = useToast();

  const validatePdf = (file: File): boolean => {
    // Check MIME type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "PDF file must be less than 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (validatePdf(file)) {
      setSelectedFile(file);
      onPdfChange({ file, description });
      toast({
        title: "PDF selected",
        description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      });
    } else {
      event.target.value = '';
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (selectedFile) {
      onPdfChange({ file: selectedFile, description: value });
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setDescription("");
    onPdfChange(null);
    // Reset the file input
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pdf-upload" className="text-foreground">
          PDF File (optional, max 10MB)
        </Label>
        <div className="mt-2">
          {!selectedFile && !existingPdf ? (
            <div className="flex items-center gap-2">
              <Input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/30">
              <FileText className="w-8 h-8 text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {selectedFile?.name || existingPdf?.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile?.size || existingPdf?.fileSize || 0)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {(selectedFile || existingPdf) && (
        <div>
          <Label htmlFor="pdf-description" className="text-foreground">
            PDF Description (optional)
          </Label>
          <Textarea
            id="pdf-description"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Brief description of the PDF content..."
            className="mt-2"
            rows={2}
          />
        </div>
      )}
    </div>
  );
};