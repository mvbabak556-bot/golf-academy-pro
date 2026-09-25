export const faNum = (n: number): string => n.toLocaleString("fa-IR");

export const faPrice = (n: number): string => `${n.toLocaleString("fa-IR")} تومان`;

export const faDate = (d: string | Date): string =>
  new Date(d).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const discountPercent = (price: number, oldPrice: number | null): number | null =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
