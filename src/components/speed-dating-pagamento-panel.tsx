"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/planos-mov";

type PanelProps = {
  eventId: string;
  regionKey: string;
  priceCents: number;
  asaasEnabled: boolean;
  alreadyRegistered: boolean;
  listHref: string;
};

type ChargeOk = {
  movPaymentId: string;
  asaasPaymentId: string;
  status: string;
  valueReais: number;
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

type CreditCardChargeOk = {
  movPaymentId: string;
  asaasPaymentId: string;
  status: string;
  valueReais: number;
  invoiceUrl: string;
};

export function SpeedDatingPagamentoPanel({
  eventId,
  regionKey,
  priceCents,
  asaasEnabled,
  alreadyRegistered,
  listHref,
}: PanelProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherErr, setVoucherErr] = useState<string | null>(null);
  const [voucherOk, setVoucherOk] = useState<{
    code: string;
    discountPercent: number;
    finalValueCents: number;
  } | null>(null);
  const [charge, setCharge] = useState<ChargeOk | null>(null);
  const [paymentSettled, setPaymentSettled] = useState(false);
  const [freeDone, setFreeDone] = useState(false);
  const [freeErr, setFreeErr] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (movId: string) => {
      try {
        const r = await fetch(
          `/api/asaas/payment/status?movId=${encodeURIComponent(movId)}`,
          { cache: "no-store" },
        );
        const d = (await r.json().catch(() => ({}))) as {
          asaasStatus?: string;
          done?: boolean;
          error?: string;
          registration?: { status: string };
        };
        if (!r.ok) {
          if (r.status === 503) {
            setErr("O servidor perdeu a ligação ao Asaas. Atualiza a página em instantes.");
          } else {
            setErr(d.error || "Não foi possível verificar o pagamento.");
          }
          return;
        }
        if (d.done) {
          setPaymentSettled(true);
          clearPoll();
        }
      } catch {
        setErr("Falha de rede ao verificar o pagamento. Tente atualizar a página.");
      }
    },
    [clearPoll],
  );

  useEffect(() => {
    if (charge?.movPaymentId) {
      void poll(charge.movPaymentId);
      tickRef.current = setInterval(() => {
        void poll(charge.movPaymentId);
      }, 4000);
      return () => {
        clearPoll();
      };
    }
    return () => clearPoll();
  }, [charge?.movPaymentId, poll, clearPoll]);

  async function onCreatePix() {
    if (!asaasEnabled) {
      setErr("Pagamento ainda não está ativo. Volta em breve ou fala com o apoio.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/asaas/pix/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, regionKey, voucherCode: voucherOk?.code ?? null }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(typeof d.error === "string" ? d.error : "Não foi possível gerar a cobrança.");
        return;
      }
      setCharge(d as ChargeOk);
    } catch {
      setErr("Falha de rede. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  async function onCreateCreditCard() {
    if (!asaasEnabled) {
      setErr("Pagamento ainda não está ativo. Volta em breve ou fala com o apoio.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/asaas/credit-card/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, regionKey, voucherCode: voucherOk?.code ?? null }),
      });
      const d = (await r.json().catch(() => ({}))) as Partial<CreditCardChargeOk> & { error?: string };
      if (!r.ok) {
        setErr(typeof d.error === "string" ? d.error : "Não foi possível gerar a cobrança.");
        return;
      }
      if (!d.invoiceUrl) {
        setErr("Não foi possível abrir o pagamento por cartão. Tenta de novo em instantes.");
        return;
      }
      window.location.href = d.invoiceUrl;
    } catch {
      setErr("Falha de rede. Tenta de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  async function onConfirmFree() {
    setFreeErr(null);
    setLoading(true);
    try {
      const r = await fetch(`/api/events/${encodeURIComponent(eventId)}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionKey }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setFreeErr(
          typeof (d as { error?: string }).error === "string" ? (d as { error: string }).error : "Inscrição não concluída.",
        );
        return;
      }
      setFreeDone(true);
    } catch {
      setFreeErr("Falha de rede. Tenta de novo.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyRegistered) {
    return (
      <div
        className="rounded-2xl border border-emerald-500/40 bg-emerald-50/50 p-4 text-sm text-emerald-900"
        role="status"
      >
        <p className="font-semibold">Já estás inscrito nesta data</p>
        <p className="mt-1 text-emerald-800/90">A inscrição já foi confirmada. Vê o detalhe em Início / Eventos.</p>
        <Link
          href="/app/eventos"
          className="mt-3 inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white"
        >
          Abrir meus eventos
        </Link>
      </div>
    );
  }

  if (freeDone) {
    return (
      <div
        className="rounded-2xl border border-emerald-500/40 bg-emerald-50/50 p-4 text-sm text-emerald-900"
        role="status"
      >
        <p className="font-semibold">Inscrição confirmada</p>
        <p className="mt-1">A tua vaga passa a contar. Encontramos contigo na experiência Se Mov.</p>
        <Link
          href="/app/eventos"
          className="mt-3 inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white"
        >
          Ver meus eventos
        </Link>
      </div>
    );
  }

  if (priceCents <= 0) {
    return (
      <div className="mt-2 space-y-3">
        {freeErr ? (
          <p className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800" role="alert">
            {freeErr}
          </p>
        ) : null}
        <p className="text-sm text-movApp-muted">Não é necessário pagar por esta data — basta confirmar a inscrição.</p>
        <Button
          type="button"
          onClick={onConfirmFree}
          disabled={loading}
          className="h-12 w-full min-h-[48px] text-base font-semibold"
        >
          {loading ? "A confirmar…" : "Confirmar inscrição"}
        </Button>
        <Link
          href={listHref}
          className="inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink transition hover:bg-movApp-subtle"
        >
          Escolher outra data
        </Link>
      </div>
    );
  }

  const isPaid = charge && paymentSettled;
  const payableCents = voucherOk?.finalValueCents ?? priceCents;

  async function onApplyVoucher() {
    const code = voucherCode.trim();
    if (!code) {
      setVoucherErr("Digite um código promocional.");
      setVoucherOk(null);
      return;
    }
    setVoucherErr(null);
    setVoucherLoading(true);
    try {
      const r = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, code }),
      });
      const d = (await r.json().catch(() => ({}))) as {
        valid?: boolean;
        error?: string;
        code?: string;
        discountPercent?: number;
        finalValueCents?: number;
      };
      if (!r.ok || !d.valid || !d.code || typeof d.discountPercent !== "number" || typeof d.finalValueCents !== "number") {
        setVoucherOk(null);
        setVoucherErr(typeof d.error === "string" ? d.error : "Cupom inválido.");
        return;
      }
      setVoucherOk({
        code: d.code,
        discountPercent: d.discountPercent,
        finalValueCents: d.finalValueCents,
      });
    } catch {
      setVoucherOk(null);
      setVoucherErr("Falha de rede ao validar o cupom.");
    } finally {
      setVoucherLoading(false);
    }
  }

  return (
    <div className="mt-2 space-y-4">
      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50/80 p-3 text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}

      {!charge ? (
        <>
          <div className="space-y-2 rounded-xl border border-movApp-border bg-movApp-subtle/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-movApp-muted">Tem um código promocional?</p>
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Digite o cupom"
                className="h-11 min-h-[44px] flex-1 rounded-lg border border-movApp-border bg-white px-3 text-sm text-movApp-ink"
              />
              <Button
                type="button"
                onClick={onApplyVoucher}
                disabled={voucherLoading || loading}
                variant="secondary"
                className="h-11 min-h-[44px] px-4"
              >
                {voucherLoading ? "Validando..." : "Aplicar"}
              </Button>
            </div>
            {voucherErr ? (
              <p className="text-xs text-red-700" role="alert">
                {voucherErr}
              </p>
            ) : null}
            {voucherOk ? (
              <p className="text-xs text-emerald-700" role="status">
                Cupom {voucherOk.code} aplicado ({voucherOk.discountPercent}%): {formatBRL(payableCents)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-col">
            <Button
              type="button"
              onClick={onCreatePix}
              disabled={loading}
              className="h-12 w-full min-h-[48px] text-base font-semibold"
            >
              {loading ? "A preparar o Pix…" : `Gerar Pix de ${formatBRL(payableCents)}`}
            </Button>
            <Button
              type="button"
              onClick={onCreateCreditCard}
              disabled={loading}
              className="h-12 w-full min-h-[48px] text-base font-semibold"
              variant="secondary"
            >
              {loading ? "A preparar o pagamento…" : "Pagar com cartão"}
            </Button>
            <Link
              href={listHref}
              className="inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl border border-movApp-border bg-movApp-paper px-4 text-sm font-semibold text-movApp-ink transition hover:bg-movApp-subtle"
            >
              Escolher outra data
            </Link>
          </div>
        </>
      ) : isPaid ? (
        <div
          className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-50/50 p-4 text-sm text-emerald-900"
          role="status"
        >
          <p className="font-display text-lg font-semibold">Pagamento recebido</p>
          <p>A tua inscrição no Speed Dating fica ativa. Vê os detalhes em Eventos.</p>
          <Link
            href="/app/eventos"
            className="inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-xl bg-movApp-accent px-4 text-sm font-semibold text-white"
          >
            Ir para os meus eventos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {charge.encodedImage ? (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${charge.encodedImage}`}
                alt="QR code Pix"
                className="max-h-64 w-full max-w-64 object-contain"
                width={256}
                height={256}
                decoding="async"
              />
            </div>
          ) : null}
          <div>
            <p className="text-xs font-semibold uppercase text-movApp-muted">Copia e cola</p>
            <p className="mt-1 break-all rounded-lg border border-movApp-border bg-movApp-subtle/40 p-2 text-xs text-movApp-ink">
              {charge.payload}
            </p>
            <Button
              type="button"
              className="mt-2 w-full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(charge.payload);
                } catch {
                  setErr("Não copiou — copia manualmente o bloco de texto do Pix.");
                }
              }}
            >
              Copiar código Pix
            </Button>
          </div>
          {charge.expirationDate ? (
            <p className="text-center text-xs text-movApp-muted">Expira em {charge.expirationDate}</p>
          ) : null}
          <p className="text-center text-xs text-movApp-muted">Mantém a página aberta: atualização a cada 4s.</p>
        </div>
      )}
    </div>
  );
}
