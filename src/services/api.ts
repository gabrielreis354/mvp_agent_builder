// Simple API client for services
export const api = {
  get: async (url: string) => {
    const response = await fetch(url)
    return response.json()
  },
  post: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  }
}

export const apiClient = api
