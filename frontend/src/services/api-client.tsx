const BASE_URL = "http://localhost:8000";

export class ApiClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = async (): Promise<T[]> => {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`);
      if (!response.ok) throw new Error(`Failed to fetch from ${this.endpoint}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`API Error [GET ${this.endpoint}]:`, error);
      throw error;
    }
  };

}