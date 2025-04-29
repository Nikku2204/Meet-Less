"use client"

import type React from "react"

import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CSVTemplate } from "./csv-template"
import { FileFormatHelp } from "./file-format-help"
import { useRef, useState, useCallback } from "react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
  error: string | null
}

export function FileUploader({ onFileUpload, isLoading, error }: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)

      const file = event.dataTransfer.files?.[0]
      if (file) {
        setFileName(file.name)
        onFileUpload(file)
      }
    },
    [onFileUpload],
  )

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <CardContent className="p-6">
        <div
          className="flex flex-col items-center justify-center gap-4 py-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!fileName && !isLoading && (
            <>
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium flex items-center justify-center gap-1">
                  Drag and drop your meeting CSV file
                  <FileFormatHelp />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your file should include columns for meeting title, duration, participants, and speakers
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleButtonClick} className="mt-2">
                  Browse files
                </Button>
                <CSVTemplate />
              </div>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </>
          )}

          {fileName && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium">File {fileName} uploaded successfully!</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2">
              <FileText className="h-10 w-10 animate-pulse text-muted-foreground" />
              <p className="text-sm font-medium">Uploading {fileName}...</p>
              <Progress value={45} className="w-full" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <p className="text-sm font-medium text-red-500">Error: {error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
