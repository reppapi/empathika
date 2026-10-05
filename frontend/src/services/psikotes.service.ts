import apiClient from "@/lib/axios"

export const psikotesService = {
  getList: () =>
    apiClient.get("/psikotes").then((r) => r.data),

  getById: (testId: string) =>
    apiClient.get(`/psikotes/${testId}`).then((r) => r.data),

  submitJawaban: (testId: string, jawaban: Record<string, string>) =>
    apiClient.post(`/psikotes/${testId}/submit`, { jawaban }).then((r) => r.data),

  getHasil: (testId: string) =>
    apiClient.get(`/psikotes/${testId}/hasil`).then((r) => r.data),
}

