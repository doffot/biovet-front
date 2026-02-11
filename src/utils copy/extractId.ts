
export const extractId = (
  field: string | { _id: string } | null | undefined
): string | undefined => {
  if (!field) return undefined;
  if (typeof field === 'string') return field;
  return field._id;
};


export const extractOwnerId = (owner: string | { _id: string } | null | undefined): string | undefined =>
  extractId(owner);

export const extractGroomerId = (groomer: string | { _id: string } | null | undefined): string | undefined =>
  extractId(groomer);

export const extractPaymentMethodId = (
  paymentMethod: string | { _id: string } | null | undefined
): string | undefined => extractId(paymentMethod);

