/*
 * What the price field on a product means, in one place, because the feeds, the
 * Product structured data and llms.txt all have to agree about it.
 *
 * Every product sold through the store is pay what you want, so price is the
 * least a buyer can pay rather than a fixed amount. Zero therefore covers two
 * situations that come to the same thing for anything generated from the data: a
 * free release with no payment path at all, and a store product whose minimum is
 * nothing. Neither can be submitted to Merchant Center, and neither has a price
 * to state beyond "free".
 */

export const DEFAULT_PRICE_CURRENCY = "USD";

/** The least a buyer can pay, as a number. Zero for anything free. */
export const getMinimumPrice = (product) => {
    const price = Number.parseFloat(product?.price);
    return Number.isFinite(price) ? price : 0;
};

export const getPriceCurrency = (product) =>
    product?.priceCurrency?.length ? product.priceCurrency : DEFAULT_PRICE_CURRENCY;

/** Whether the product asks for money at all, which is what Google validates */
export const hasPrice = (product) => getMinimumPrice(product) > 0;
