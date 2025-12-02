// Components
import List from '../template/List';
import ListItem from '../template/List/ListItem';
import Product from './Product';

// Helpers
import { convertToUrlFriendlyString } from '../../helpers/urlFormatter'

// Data
import { latestProducts } from '../../data/products';


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
