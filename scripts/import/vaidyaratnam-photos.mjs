// One-time photo rehoster for the Vaidyaratnam doctor import.
//
// Downloads each doctor photo from vaidyaratnammooss.com and re-uploads it to
// our own MinIO bucket (ayurconnect-profile, under the vaidyaratnam/ prefix),
// so the imported doctor rows don't hotlink an external server.
//
// Run ON THE VPS from the api workspace so `minio` resolves. The script reads
// S3_* config straight out of the api .env (parsed in Node — no shell sourcing,
// since the .env has values with shell-special chars):
//   cd /opt/ayurconnect/apps/api
//   node /tmp/vaidyaratnam-photos.mjs            # defaults to ./.env
//   node /tmp/vaidyaratnam-photos.mjs /path/to/.env
//
// Idempotent: putObject overwrites, so re-running is safe. Public URL of each
// object ends up at  /api/uploads/ayurconnect-profile/vaidyaratnam/<file>

import { Client as MinioClient } from 'minio'
import { readFileSync } from 'node:fs'

// Parse a .env file into process.env-style pairs without any shell evaluation.
// Handles KEY=value, optional surrounding quotes, ignores comments/blank lines.
function loadEnvFile(path) {
  const out = {}
  let text
  try { text = readFileSync(path, 'utf8') } catch { return out }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const ENV = { ...loadEnvFile(process.argv[2] ?? './.env'), ...process.env }

const SRC_BASE = 'https://vaidyaratnammooss.com/storage/doctors'
const BUCKET   = 'ayurconnect-profile'
const PREFIX   = 'vaidyaratnam'

// The 42 photo filenames scraped from /selectdoctor pages 1-3.
const FILES = [
  // page 1
  '7JcEJIEPplcEHsg5kdYnk3f5wFCoqSfaccJqFMxg.jpg',
  'gPfo0mYGudzKeWHpjC0bkWdoxZN3B1I2S5xSAvZm.jpg',
  '24VVROq5JldqAtzF9fV6a3NeWbVah1eYGscYJfJY.jpg',
  'j4LoGWK05QaclWU7GnmAYq93TwyWgvRjwpPd1UFw.jpg',
  'yN3dThMzuxzZD0KyKotwSqEPckRU2lATjyfhqsQq.jpg',
  'zJMtd71U6YJoo2ppS2WOLvTolfOysbP363Ln2xcU.jpg',
  'YFpffluN4WTb7IBhLbCTT7b3cGvI0vYkMZyizCnY.jpg',
  'zBqSSvof0W2eKDOUvgHHuGQC8ghCchRA4FiATlqE.jpg',
  'VljncHjmYeXsyxzlwGMiwa858tbgIoRmI4T5eulH.jpg',
  'TZUyENBShso7IqLKP17D4QKATSsuaE475CYRTzFW.jpg',
  '3USiw54hFszpP3ahtmHj1km144dXmQ0odoUZcwit.jpg',
  'TTSsPxEOD5yoOTk7vEIlUhLc4z7E6eQOU0tyaLSq.jpg',
  'UXEYhLxsfVphlS3bKIMX0oScaGHJ9XBrbaCcewJ1.jpg',
  'fCU4jIAhYRMekThaieJserV3ZiEjWdeqO6X33SF1.jpg',
  'DXNzPg8z0Zil2cWnkqi9R640p87A97efGuGGTdNj.jpg',
  'ao7oUgCEhankuJUGfPhVQc3YH0iMfpGOJvBvZa3X.jpg',
  'tNQE1rDISKnILepG5MIirFfQmAumNJLQjoGenrHG.jpg',
  '3LbZSCBA73t0JuXrsuOeZcX6J4F8twrvyxp6eIrX.jpg',
  // page 2
  'y1esec5IXJ1onU16rdTnUW86FDrLdFA5Cmrw9PaN.jpg',
  'oT81HqJtVLfBUJxNYtPkYYakqeoGfzvBjrTuwppa.jpg',
  'vmxL959WNOGTLwhiL8VCjJz0l60xx78RoMvqphnl.jpg',
  'EWXrGilRUG2B5fJpxUrbRBRCz5XVDSTSUk7GAlda.jpg',
  'MhbYM46a0ih095pNCji7bYlF6BlGMsPNrgqP8Lbx.jpg',
  'qdnYw0fo96OFUjohXye8YmhWZXFYusoOyPfXQIRm.jpg',
  'z2BjO58iPFV4ZD3R2ykeVZU9yVfzXmQcYzmmySKI.jpg',
  '69eVFhBagMbAxDIsUPJTuZd0PiLrq6q1fOnjivSx.jpg',
  'kx91PbxN7GnKtRokbocMqcQQlRrNfyzHi3nhxeEb.jpg',
  'mClPuLYw6voC1dI1BKm4FWVIN23OT9UTdx5vFls3.jpg',
  'pQzr1jXCIf13q1jXnAlP6WjyMcrOKAvcwN6rh1rd.jpg',
  'u3UlgtqfzwdKvkxDpnToCMK2tUaHwNZJJSeXV9dW.png',
  'QAeexorPB402VgN5pvVHAZpkoGXvqYlEJ8dyf4DL.jpg',
  '8VjH5DVtajg1jfLea1uKiewkB7Fr3urusmDyDYFE.jpg',
  'rIUWsDduftvAbhSXfQwtEM8JBxJnU8V5zUTjIgjK.jpg',
  'cPwg0fDxJmjqfHIZiOoMunRUcm5oUtmokEEqS1KQ.jpg',
  'pVvsb90S7UbhF2YI688rkrM83KAsUItpRDWghtGz.jpg',
  'gUGHNqnST2pHzNg4rojTy05OOAF0Ywf7lXMfbOBS.jpg',
  // page 3
  'tHThDB3mfzPzrIljyRrU0PQkUJPijcqajXx1QmKH.jpg',
  'ie5kS4OJLYy6mFAkAOsWC20WHIt66V50B2KXSKAm.jpg',
  'u2fOszW5PUMJB6crgt6EWJKTClnl0WG0kbUAwnFJ.jpg',
  'dFwI1DLo5YkarnFsWtXB0qI6iehm4NnL5ehELLsV.jpg',
  'gi8yN0jwEcsBkmoV2J39Ai5FbnqvO73zOnchYqxf.jpg',
  '6jARt0vO81NCg7lgbG5oy06WzMh9UME0Mp3Hdr2i.jpg',
]

const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

function envOrThrow(name, fallback) {
  const v = ENV[name] ?? fallback
  if (v === undefined || v === '') throw new Error(`missing env ${name} (pass the .env path as arg 1)`)
  return v
}

const s3 = new MinioClient({
  endPoint: envOrThrow('S3_ENDPOINT', '127.0.0.1'),
  port:     Number(envOrThrow('S3_PORT', '9002')),
  useSSL:   (ENV.S3_USE_SSL ?? 'false') === 'true',
  accessKey: envOrThrow('S3_ACCESS_KEY'),
  secretKey: envOrThrow('S3_SECRET_KEY'),
})

async function main() {
  // Make sure the bucket exists (the api plugin normally creates it on boot).
  const exists = await s3.bucketExists(BUCKET).catch(() => false)
  if (!exists) {
    await s3.makeBucket(BUCKET)
    console.log(`created bucket ${BUCKET}`)
  }

  let ok = 0
  let failed = 0
  for (const file of FILES) {
    const ext = file.split('.').pop().toLowerCase()
    const contentType = MIME[ext] ?? 'application/octet-stream'
    const key = `${PREFIX}/${file}`
    try {
      const res = await fetch(`${SRC_BASE}/${file}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.byteLength === 0) throw new Error('empty body')
      await s3.putObject(BUCKET, key, buf, buf.byteLength, { 'Content-Type': contentType })
      ok++
      console.log(`  ✓ ${key}  (${(buf.byteLength / 1024).toFixed(0)} kB)`)
    } catch (err) {
      failed++
      console.warn(`  ✗ ${key}  — ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  console.log(`\ndone: ${ok} uploaded, ${failed} failed, ${FILES.length} total`)
  if (failed > 0) process.exitCode = 1
}

main().catch((e) => { console.error(e); process.exit(1) })
