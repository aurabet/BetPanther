import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIResponse {
  text: string;
  error?: string;
}

class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Vérifier que la clé API est disponible
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GEMINI_API_KEY non définie. L'IA ne sera pas disponible.");
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    try {
      // Validation du prompt
      if (!prompt || prompt.trim().length === 0) {
        throw new Error("Le message ne peut pas être vide");
      }

      // Vérification de la clé API
      if (!process.env.VITE_GEMINI_API_KEY) {
        return {
          text: "Désolé, l'assistant IA n'est pas configuré. Veuillez contacter l'administrateur.",
          error: "API_KEY_MISSING"
        };
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text: text,
        error: undefined
      };

    } catch (error) {
      console.error("Erreur Gemini:", error);
      
      // Gestion des erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("API_KEY")) {
          return {
            text: "Désolé, l'assistant IA rencontre un problème de configuration. Veuillez réessayer plus tard.",
            error: "AUTH_ERROR"
          };
        }
      }

      return {
        text: "Désolé, l'assistant IA est temporairement indisponible. Veuillez réessayer plus tard.",
        error: "SERVICE_ERROR"
      };
    }
  }

  // Méthode pour tester la connexion à l'API
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.generateResponse("Test de connexion");
      return !result.error;
    } catch (error) {
      return false;
    }
  }
}

// Exporter une instance unique du service
export default new AIService();
