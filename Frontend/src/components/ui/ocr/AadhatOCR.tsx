'use client'

import { useState, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Upload, CreditCard, Check, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function AadharOCRMockup() {
  const [step, setStep] = useState(1)
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any>({})

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (side === 'front') {
      setFrontImage(file)
      if (!backImage) setStep(2)
    } else {
      setBackImage(file)
      if (frontImage) setStep(3)
    }
  }

  const handleExtract = async () => {
    if (!frontImage || !backImage) return

    setIsLoading(true)
    setStep(4)
    setError(null)

    try {
      const frontText = await extractTextFromImage(frontImage)
      const backText = await extractTextFromImage(backImage)
        console.log(frontText + '\n' + backText)
      // Extract relevant Aadhar data from the text
      const parsedData = parseAadharData(frontText + '\n' + backText)
      setExtractedData(parsedData)
      setStep(5)
    } catch (err) {
      setError('Failed to extract text. Please try again.')
      setStep(3)
    } finally {
      setIsLoading(false)
    }
  }

  const extractTextFromImage = (image: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(
        image,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      ).then(({ data: { text } }) => {
        resolve(text)
      }).catch((err) => {
        reject(err)
      })
    })
  }

  const parseAadharData = (text: string) => {
    // Regex to match the Year of Birth
    const yearOfBirthRegex = /(?:Year of Birth|DOB|साल)\s?:?\s?(\d{4})/;
  
    // Regex to match Address starting from "Address:"
    const addressRegex = /(?:Address|पता)\s?:?\s?([A-Za-z0-9\s,.-]+)/;
  
    // Regex to match the first two English words with first character capitalized
    const nameRegex = /([A-Z][a-z]+)\s+([A-Z][a-z]+)/;
  
    const yearOfBirthMatch = text.match(yearOfBirthRegex);
    const addressMatch = text.match(addressRegex);
    
    let name = 'Not found';
  
    // Attempt to match the name using the new regex for capitalized words
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      // Combine the first two matched words
      name = `${nameMatch[1]} ${nameMatch[2]}`;
    }
  
    return {
      name: name, // Extracted name
      yearOfBirth: yearOfBirthMatch ? yearOfBirthMatch[1] : 'Not found',
      address: addressMatch ? addressMatch[1] : 'Not found',
    };
  };
  
  
  
  

  const resetProcess = () => {
    setStep(1)
    setFrontImage(null)
    setBackImage(null)
    setExtractedData({})
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Aadhar Card OCR</h1>
          <div className="mb-8">
            <Progress value={(step / 5) * 100} className="w-full" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={step >= 1 ? "font-semibold" : ""}>Upload Front</span>
              <span className={step >= 2 ? "font-semibold" : ""}>Upload Back</span>
              <span className={step >= 3 ? "font-semibold" : ""}>Review</span>
              <span className={step >= 4 ? "font-semibold" : ""}>Process</span>
              <span className={step >= 5 ? "font-semibold" : ""}>Results</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-lg font-semibold mb-2 block">Front of Aadhar Card</Label>
              {frontImage ? (
                <div className="border-2 border-green-500 rounded-lg p-4">
                  <img src={URL.createObjectURL(frontImage)} alt="Front of Aadhar Card" className="w-full h-auto" />
                  <div className="flex items-center justify-center mt-2">
                    <Check className="w-6 h-6 text-green-500 mr-2" />
                    <span className="text-green-700">Uploaded successfully</span>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                  onClick={() => frontInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <input type="file" ref={frontInputRef} onChange={(e) => handleUpload('front', e)} className="hidden" />
                  <p className="text-gray-600">Click to upload front image</p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-lg font-semibold mb-2 block">Back of Aadhar Card</Label>
              {backImage ? (
                <div className="border-2 border-green-500 rounded-lg p-4">
                  <img src={URL.createObjectURL(backImage)} alt="Back of Aadhar Card" className="w-full h-auto" />
                  <div className="flex items-center justify-center mt-2">
                    <Check className="w-6 h-6 text-green-500 mr-2" />
                    <span className="text-green-700">Uploaded successfully</span>
                  </div>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary"
                  onClick={() => backInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <input type="file" ref={backInputRef} onChange={(e) => handleUpload('back', e)} className="hidden" />
                  <p className="text-gray-600">Click to upload back image</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {step < 3 && (
              <Button
                onClick={() => setStep(Math.min(step + 1, 3))}
                disabled={!frontImage || !backImage}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleExtract} disabled={isLoading}>
                <CreditCard className="mr-2 h-4 w-4" /> Extract Text
              </Button>
            )}
            {step === 4 && (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
              </Button>
            )}
            {step === 5 && (
              <Button variant="secondary" onClick={resetProcess}>
                Reset
              </Button>
            )}
          </div>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 5 && !error && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Extracted Data</h2>
              <pre className="bg-gray-100 p-4 rounded-lg">{JSON.stringify(extractedData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
