declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string
    IsAcroFormPresent?: boolean
    IsXFAPresent?: boolean
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
  }

  interface PDFMetadata {
    _metadata?: any
    [key: string]: any
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata
    text: string
    version: string
  }

  function pdf(dataBuffer: Buffer | ArrayBuffer | Uint8Array, options?: any): Promise<PDFData>
  
  export = pdf
}