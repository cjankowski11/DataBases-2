import { resumeToPipeableStream } from "react-dom/server";

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
      return result.data !== undefined ? result.data : result;
    } catch (error) {
      console.error(`API Error [GET ${this.endpoint}]:`, error);
      throw error;
    }
  };

  delete = async (id: string | number): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item ${id} from ${this.endpoint}`);
      }
      const result = await response.json();
      return result.data !== undefined ? result.data : result;
    } catch (error) {
      console.error(`API Error [DELETE ${this.endpoint}${id}]:`, error);
      throw error;
    }
  };

  add = async (data: Partial<T>): Promise<T> => {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to add item to ${this.endpoint}`);
      }

      const result = await response.json();
      if (result?.status === "FAILED") {
        throw new Error(result.message || "Backend execution failed.");
      }
      return result.data !== undefined ? result.data : result;
    } catch (error) {
      console.error(`API Error [POST ${this.endpoint}]:`, error);
      throw error;
    }
  };
}