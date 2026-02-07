import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEDALUS_BASE = "https://api.dedaluslabs.ai";
const MODEL = "anthropic/claude-opus-4-5";

// ─── System prompts per page ──────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  dashboard: `You are Quantra, an expert financial analyst assistant embedded in a personal finance dashboard.
You help users understand their spending patterns, cash flow, and financial health.
When given context about Sankey diagram nodes, categories, or metrics, provide insightful analysis.
Keep responses concise (2-4 sentences) unless asked for detail.
Use **bold** for key numbers and categories.
If asked to generate a chart, respond with your analysis and suggest what chart type would be best.`,

  transactions: `You are Quantra, a transaction analysis assistant.
You help users explore and understand their transaction data.
When given transaction filters, search queries, or selected rows, provide insights.
You can suggest which insight charts to generate: spending_by_category, top_merchants, subscriptions_breakdown, or daily_spend.
Return actionable insights. Keep responses concise.`,

  workspace: `You are Quantra, an advanced financial analysis assistant in a workspace environment.
Users select Sankey nodes and transactions from other pages and bring them here for deeper analysis.
You have access to the user's selected items and can analyze patterns, compare transactions, and generate insights.
Format responses with **bold** for emphasis. Use bullet points for lists.
When it makes sense, suggest chart visualizations (pie, bar, line) by describing what they'd show.`,

  simulation: `You are Quantra, a financial simulation assistant.
Your job is to parse natural language descriptions of financial scenarios into structured parameters.
You MUST respond with a JSON object in this exact format:
{
  "parsed": true,
  "type": "budgeting" | "habits" | "subscriptions" | "one-time" | "income",
  "params": { ... },
  "explanation": "Brief explanation of what was parsed"
}

For "habits" type, params should have: reduceDiningOut ($/week), capRideshare ($/month), increaseGroceries ($/month)
For "subscriptions" type, params should have: cancel (array of subscription names to cancel)
For "income" type, params should have: amount ($/month), startMonth (1-10)
For "one-time" type, params should have: amount ($), month (1-10)
For "budgeting" type, params should have: needs (%), wants (%), savings (%)

If you cannot parse the input, respond with: {"parsed": false, "explanation": "reason"}`,
};

// ─── Rate limiting ────────────────────────────────────────────────────────

const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(sessionId);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(sessionId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  entry.count++;
  return true;
}

// ─── Handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEDALUS_API_KEY = Deno.env.get("DEDALUS_API_KEY");
    if (!DEDALUS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DEDALUS_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      messages,
      context,
      stream = false,
    } = body as {
      messages: { role: string; content: string }[];
      context?: {
        page?: string;
        selectedItems?: unknown[];
        filters?: Record<string, unknown>;
        mockData?: Record<string, unknown>;
      };
      stream?: boolean;
    };

    // Rate limiting by a session identifier
    const sessionId = req.headers.get("x-client-info") ?? "anonymous";
    if (!checkRateLimit(sessionId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with context
    const page = context?.page ?? "workspace";
    let systemPrompt = SYSTEM_PROMPTS[page] ?? SYSTEM_PROMPTS.workspace;

    // Inject context data into system prompt
    if (context) {
      const contextParts: string[] = [];

      if (context.selectedItems && Array.isArray(context.selectedItems) && context.selectedItems.length > 0) {
        contextParts.push(`Selected items:\n${JSON.stringify(context.selectedItems, null, 2)}`);
      }
      if (context.filters && Object.keys(context.filters).length > 0) {
        contextParts.push(`Active filters:\n${JSON.stringify(context.filters, null, 2)}`);
      }
      if (context.mockData && Object.keys(context.mockData).length > 0) {
        contextParts.push(`Current data:\n${JSON.stringify(context.mockData, null, 2)}`);
      }

      if (contextParts.length > 0) {
        systemPrompt += `\n\n--- Current Context ---\n${contextParts.join("\n\n")}`;
      }
    }

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Call Dedalus API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEDALUS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: apiMessages,
          stream,
          max_tokens: 1024,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Dedalus API error:", response.status, errorText);

        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "LLM rate limit exceeded. Please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "API credits exhausted. Please add funds." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ error: "I couldn't reach the model—try again." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (stream) {
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Non-streaming: parse and return structured response
      const data = await response.json();
      const assistantContent = data.choices?.[0]?.message?.content ?? "";

      // Try to extract actions from the response (for simulation parsing)
      let actions: unknown[] = [];
      if (page === "simulation") {
        try {
          // The simulation prompt asks for JSON
          const jsonMatch = assistantContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.parsed) {
              actions = [{ type: "apply_scenario", spec: parsed }];
            }
          }
        } catch {
          // Not JSON, that's fine
        }
      }

      return new Response(
        JSON.stringify({
          assistantMessage: assistantContent,
          actions,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
  } catch (e) {
    console.error("llm-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "I couldn't reach the model—try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
