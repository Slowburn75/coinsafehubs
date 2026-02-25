'use client'

import { useState } from 'react'
import {
  IconUpload,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconFile,
  IconPhoto,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { PaymentMethod } from '@/components/deposit-method-step'

interface DepositUploadStepProps {
  amount: string
  method: PaymentMethod
  transactionHash: string
  onTransactionHashChange: (hash: string) => void
  uploadedFile: File | null
  onFileUpload: (file: File | null) => void
  notes: string
  onNotesChange: (notes: string) => void
  onSubmit: () => void
  onBack: () => void
}

export function DepositUploadStep({
  amount,
  method,
  transactionHash,
  onTransactionHashChange,
  uploadedFile,
  onFileUpload,
  notes,
  onNotesChange,
  onSubmit,
  onBack,
}: DepositUploadStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPG, PNG, GIF) and PDF files are allowed')
      return
    }
    
    setError('')
    onFileUpload(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    onFileUpload(null)
    setImagePreview(null)
    setError('')
  }

  const handleSubmit = async () => {
    // Validate
    if (!uploadedFile && !transactionHash) {
      setError('Please upload a receipt or provide a transaction hash')
      return
    }

    if (method.type === 'crypto' && transactionHash && transactionHash.length < 10) {
      setError('Please enter a valid transaction hash')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit()
    } catch (err) {
      setError('Failed to submit deposit. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Upload Payment Proof</h2>
          <p className="text-muted-foreground mt-1">
            Provide transaction details to verify your ${parseFloat(amount).toFixed(2)} deposit
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Details</CardTitle>
          <CardDescription>
            Help us verify your payment faster by providing transaction details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Hash (for crypto) */}
          {method.type === 'crypto' && (
            <div className="space-y-2">
              <Label htmlFor="tx-hash">
                Transaction Hash / TX ID
                {!uploadedFile && <span className="text-red-600 ml-1">*</span>}
              </Label>
              <Input
                id="tx-hash"
                placeholder="0x... or transaction ID"
                value={transactionHash}
                onChange={(e) => {
                  onTransactionHashChange(e.target.value)
                  setError('')
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can find this in your wallet's transaction history
              </p>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">
              Upload Receipt / Screenshot
              {!transactionHash && method.type === 'crypto' && (
                <span className="text-red-600 ml-1">*</span>
              )}
              {method.type === 'bank' && <span className="text-red-600 ml-1">*</span>}
            </Label>
            
            {uploadedFile ? (
              <div className="border rounded-lg p-4 space-y-3">
                {/* File Info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {uploadedFile.type.startsWith('image/') ? (
                      <IconPhoto className="h-5 w-5 text-primary" />
                    ) : (
                      <IconFile className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="receipt"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipt"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconUpload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG, GIF or PDF (max 5MB)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Additional Notes <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about your deposit..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Example: "Sent from Coinbase wallet" or "Wire transfer from Chase Bank"
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <IconAlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Verification Process
              </p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                <li>Your submission will be reviewed by our team</li>
                <li>Verification typically takes 10-30 minutes</li>
                <li>You'll receive an email once funds are credited</li>
                <li>Track status in your transaction history</li>
              </ul>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
              <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting || (!uploadedFile && !transactionHash)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconCheck className="mr-2 h-4 w-4" />
                Submit Deposit
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}