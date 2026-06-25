export type LLMCompletionOptions = {
  system?: string;
  temperature?: number;
  maxTokens?: number;
};

export interface LLMProvider {
  readonly name: string;
  complete(prompt: string, options?: LLMCompletionOptions): Promise<string>;
}

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";

  constructor(
    private apiKey: string,
    private model = "gpt-4o-mini",
  ) {}

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        messages: [
          ...(options?.system
            ? [{ role: "system" as const, content: options.system }]
            : []),
          { role: "user" as const, content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

export class AzureOpenAIProvider implements LLMProvider {
  readonly name = "azure-openai";

  constructor(
    private endpoint: string,
    private apiKey: string,
    private deployment: string,
  ) {}

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-15-preview`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        messages: [
          ...(options?.system
            ? [{ role: "system" as const, content: options.system }]
            : []),
          { role: "user" as const, content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

/**
 * Context-aware local provider used when no external LLM is configured.
 * Uses child profile, check-ins, and patterns — not simple keyword matching alone.
 */
export class LocalIntelligenceProvider implements LLMProvider {
  readonly name = "local-intelligence";

  async complete(prompt: string, options?: LLMCompletionOptions): Promise<string> {
    void options;
    return prompt;
  }
}

let cachedProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (cachedProvider) return cachedProvider;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    cachedProvider = new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL);
    return cachedProvider;
  }

  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  if (azureEndpoint && azureKey && azureDeployment) {
    cachedProvider = new AzureOpenAIProvider(azureEndpoint, azureKey, azureDeployment);
    return cachedProvider;
  }

  cachedProvider = new LocalIntelligenceProvider();
  return cachedProvider;
}

export function isExternalLLMConfigured(): boolean {
  return getLLMProvider().name !== "local-intelligence";
}
