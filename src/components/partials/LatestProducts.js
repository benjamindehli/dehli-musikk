// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Product from 'components/partials/Product';

// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Data
import { latestProducts } from 'data/products';


const LatestProducts = () => {
  const renderProducts = () => {
    return latestProducts && latestProducts.length
      ? latestProducts.map(product => {
        const productId = convertToUrlFriendlyString(product.title);
        return (<ListItem key={productId}>
          <Product product={product} />
        </ListItem>)
      })
      : '';
  }
  return (<List>
    {renderProducts()}
  </List>)
}

export default LatestProducts;
