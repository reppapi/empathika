import type { FastifyRequest, FastifyReply } from 'fastify'
import '@fastify/multipart' // augment FastifyRequest with .file() method
import { createWriteStream, mkdirSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../../config/env'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// Pastikan direktori uploads ada
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function uploadImage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await request.file()

    if (!data) {
      return reply.code(400).send({
        success: false,
        message: 'Tidak ada file yang diupload',
      })
    }

    // Validasi MIME type
    if (!ALLOWED_MIME.includes(data.mimetype)) {
      return reply.code(400).send({
        success: false,
        message: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF',
      })
    }

    // Validasi ukuran file (cek lewat stream)
    let totalBytes = 0
    const chunks: Buffer[] = []

    for await (const chunk of data.file) {
      totalBytes += chunk.length
      if (totalBytes > MAX_SIZE_BYTES) {
        return reply.code(413).send({
          success: false,
          message: 'Ukuran file terlalu besar. Maksimal 5MB',
        })
      }
      chunks.push(chunk)
    }

    // Generate nama file unik
    const ext = extname(data.filename) || '.jpg'
    const filename = `${randomUUID()}${ext}`
    const filepath = join(UPLOADS_DIR, filename)

    // Tulis file ke disk
    const writeStream = createWriteStream(filepath)
    writeStream.write(Buffer.concat(chunks))
    writeStream.end()
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // Susun URL publik
    const baseUrl = env.BASE_URL ?? `http://localhost:${env.PORT}`
    const url = `${baseUrl}/uploads/${filename}`

    return reply.code(200).send({
      success: true,
      message: 'Gambar berhasil diupload',
      data: { url, filename },
    })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({
      success: false,
      message: 'Terjadi kesalahan saat mengupload gambar',
    })
  }
}
