export interface CommercialTerms {
  priceCents: number | null;
  downPaymentCents: number | null;
  installments: number | null;
  installmentCents: number | null;
  adjustments: string | null;
  charges: string | null;
  updatedAt: string;
}

/** Informações documentais fornecidas pelo responsável pelo anúncio. */
export interface DocumentInfo {
  text: string;
  updatedAt: string;
}
