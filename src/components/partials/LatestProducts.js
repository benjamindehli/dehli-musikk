// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Components
import Product from 'components/partials/Product';

// Template
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import {latestProducts} from 'data/products';


class LatestProducts extends Component {
  renderProducts() {
    return latestProducts && latestProducts.length
      ? latestProducts.map(product => {
        const productId = convertToUrlFriendlyString(product.title);
        return (<ListItem key={productId}>
          <Product product={product}/>
        </ListItem>)
      })
      : '';
  }

  render() {
    return (<List>
      {this.renderProducts()}
    </List>)
  }
}

export default connect(null, null)(LatestProducts);
