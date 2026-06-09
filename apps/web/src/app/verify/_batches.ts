// Batch authenticity registry (Phase 9a). Maps a printed batch / QR code to an
// authenticity record so patients can verify a product is genuine and sourced
// from a licensed GMP manufacturer. This is a curated demonstration registry;
// production would ingest batch data from participating manufacturers' systems.
//
// Batch codes are matched case-insensitively and trimmed.

export type BatchRecord = {
  batch: string
  productId: string        // links to marketplace/_data/products PRODUCTS[].id
  productName: string
  manufacturer: string
  ayushLicenseRef: string
  gmpCertified: boolean
  mfgDate: string          // YYYY-MM
  expDate: string          // YYYY-MM
  note?: string
}

export const BATCH_REGISTRY: BatchRecord[] = [
  {
    batch: 'KTL-MNT-2406',
    productId: 'kottakkal-mahanarayana',
    productName: 'Mahanarayana Tailam',
    manufacturer: 'Kottakkal Arya Vaidya Sala',
    ayushLicenseRef: 'KL/AYUSH/25D/1902',
    gmpCertified: true,
    mfgDate: '2024-06',
    expDate: '2027-05',
    note: 'Genuine GMP-certified batch from the Kottakkal pharmacy.',
  },
  {
    batch: 'KTL-MUR-2403',
    productId: 'kottakkal-murivenna',
    productName: 'Murivenna',
    manufacturer: 'Kottakkal Arya Vaidya Sala',
    ayushLicenseRef: 'KL/AYUSH/25D/1902',
    gmpCertified: true,
    mfgDate: '2024-03',
    expDate: '2027-02',
  },
  {
    batch: 'VDR-TRI-2405',
    productId: 'vaidyaratnam-triphala',
    productName: 'Triphala Churna',
    manufacturer: 'Vaidyaratnam Oushadhasala',
    ayushLicenseRef: 'KL/AYUSH/24D/0091',
    gmpCertified: true,
    mfgDate: '2024-05',
    expDate: '2026-04',
  },
]

export function findBatch(code: string): BatchRecord | null {
  const norm = code.trim().toUpperCase()
  return BATCH_REGISTRY.find((b) => b.batch.toUpperCase() === norm) ?? null
}
