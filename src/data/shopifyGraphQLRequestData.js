export function getProductImages(orderNumber) {
  // GraphQL query string
  const query = `
    {
      orders(first: 1, query: "${orderNumber}") {
        edges {
          node {
            lineItems(first: 50) {
              edges {
                node {
                  sku
                  product {
                    id
                    title
                    featuredImage {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  // Wrap it in JSON for fetch
  return JSON.stringify({ query });
}
