import "server-only";

const DEFAULT_BASE = "https://api-sandbox.asaas.com";

function baseUrl(): string {
  return (process.env.ASAAS_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function readApiKey(): string {
  const k = process.env.ASAAS_API_KEY?.trim();
  if (!k) throw new Error("ASAAS_API_KEY não está definida");
  return k;
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    access_token: readApiKey(),
  };
}

export class AsaasApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public asaasCode?: string,
  ) {
    super(message);
    this.name = "AsaasApiError";
  }
}

function parseErrorBody(status: number, data: unknown): string {
  if (data && typeof data === "object" && "errors" in data) {
    const errs = (data as { errors?: { description?: string; code?: string }[] })
      .errors;
    if (Array.isArray(errs) && errs[0]) {
      return errs[0].description || errs[0].code || JSON.stringify(data);
    }
  }
  return `Erro Asaas (HTTP ${status})`;
}

async function asaasRequest<T>(path: string, init?: RequestInit & { next?: { revalidate: number } }): Promise<T> {
  const url = `${baseUrl()}/v3${path.startsWith("/") ? path : `/${path}`}`;
  const { ...rest } = init || {};
  const res = await fetch(url, {
    ...rest,
    cache: "no-store",
    headers: {
      ...headers(),
      ...((rest.headers as Record<string, string> | undefined) || {}),
    },
  } as RequestInit);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = parseErrorBody(res.status, data);
    const code =
      data && typeof data === "object" && "errors" in (data as object) &&
        Array.isArray((data as { errors?: { code?: string }[] }).errors) &&
        (data as { errors: { code?: string }[] }).errors[0]?.code
        ? (data as { errors: { code: string }[] }).errors[0].code
        : undefined;
    throw new AsaasApiError(msg, res.status, code);
  }
  return data as T;
}

type CustomerRow = { id: string; email?: string; name?: string; cpfCnpj?: string };
type ListCustomersResponse = { data?: CustomerRow[] };
type CreateCustomerBody = { name: string; email: string; cpfCnpj: string; externalReference?: string };

export async function findFirstCustomerIdByEmail(email: string): Promise<string | null> {
  const q = new URLSearchParams({ email, limit: "1" });
  const out = await asaasRequest<ListCustomersResponse>(`/customers?${q.toString()}`, { method: "GET" });
  return out.data?.[0]?.id ?? null;
}

export async function createAsaasCustomer(body: CreateCustomerBody): Promise<CustomerRow> {
  return asaasRequest<CustomerRow>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

type PaymentResponse = {
  id: string;
  status: string;
  value: number;
  customer: string;
  description?: string;
  externalReference?: string;
  billingType?: string;
};

type CreditCardRedirectPaymentResponse = {
  id: string;
  status: string;
  value: number;
  customer: string;
  description?: string;
  externalReference?: string;
  billingType?: string;
  invoiceUrl?: string;
};

type PixQrCodeResponse = {
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function createAsaasPaymentPix(input: {
  customerId: string;
  valueReais: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference: string;
}): Promise<PaymentResponse> {
  return asaasRequest<PaymentResponse>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "PIX",
      value: input.valueReais,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
    }),
  });
}

export async function createAsaasPaymentCreditCardRedirect(input: {
  customerId: string;
  valueReais: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference: string;
}): Promise<CreditCardRedirectPaymentResponse> {
  return asaasRequest<CreditCardRedirectPaymentResponse>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "CREDIT_CARD",
      value: input.valueReais,
      dueDate: input.dueDate,
      description: input.description,
      externalReference: input.externalReference,
    }),
  });
}

export async function getAsaasPaymentPixQrCode(asaasPaymentId: string): Promise<PixQrCodeResponse> {
  return asaasRequest<PixQrCodeResponse>(`/payments/${encodeURIComponent(asaasPaymentId)}/pixQrCode`, {
    method: "GET",
  });
}

export async function getAsaasPayment(asaasPaymentId: string): Promise<PaymentResponse> {
  return asaasRequest<PaymentResponse>(`/payments/${encodeURIComponent(asaasPaymentId)}`, {
    method: "GET",
  });
}

export { DEFAULT_BASE as ASAAS_DEFAULT_API_BASE };
