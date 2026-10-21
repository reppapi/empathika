import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import type { UpdateBiroAccountInput } from "./biro.schema"

export class BiroService {
  constructor(private prisma: PrismaClient) {}

  async updateAccount(accountId: string, input: UpdateBiroAccountInput) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    if (account.role !== "BIRO") {
      throw Object.assign(new Error("Akses ditolak: Hanya akun biro yang dapat menggunakan layanan ini"), {
        statusCode: 403,
      })
    }

    const updateData: { email?: string; password?: string } = {}

    // 1. Validasi & Ganti Email
    if (input.email && input.email !== account.email) {
      const existingEmail = await this.prisma.account.findUnique({
        where: { email: input.email },
      })
      if (existingEmail) {
        throw Object.assign(new Error("Email sudah terdaftar oleh akun lain"), { statusCode: 409 })
      }
      updateData.email = input.email
    }

    // 2. Validasi & Ganti Password
    if (input.passwordBaru) {
      if (!input.passwordLama && account.password) {
        throw Object.assign(new Error("Password lama wajib disertakan untuk konfirmasi perubahan password"), {
          statusCode: 400,
        })
      }

      if (account.password && input.passwordLama) {
        const isMatch = await bcrypt.compare(input.passwordLama, account.password)
        if (!isMatch) {
          throw Object.assign(new Error("Password lama salah"), { statusCode: 400 })
        }
      }

      updateData.password = await bcrypt.hash(input.passwordBaru, 10)
    }

    if (Object.keys(updateData).length === 0) {
      throw Object.assign(new Error("Tidak ada data yang diubah"), { statusCode: 400 })
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: accountId },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      message: "Data akun biro berhasil diperbarui",
      data: updatedAccount,
    }
  }

  async getAccount(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telepon: true,
        aktif: true,
        token_aktivasi: true,
        token_aktivasi_exp: true,
        id_biro: true,
        biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      } as any,
    })

    if (!account) {
      throw Object.assign(new Error("Akun tidak ditemukan"), { statusCode: 404 })
    }

    return {
      success: true,
      data: account,
    }
  }

  async getAllBiroAccounts() {
    const accounts = await this.prisma.account.findMany({
      where: { role: "BIRO" },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_telepon: true,
        aktif: true,
        token_aktivasi: true,
        token_aktivasi_exp: true,
        id_biro: true,
        biro: {
          select: {
            id: true,
            nama_biro: true,
            slug: true,
            status: true,
          },
        },
        createdAt: true,
      } as any,
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: accounts,
    }
  }
}

