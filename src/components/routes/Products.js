// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Redirect} from 'react-router-dom';

// Components
import Product from 'components/partials/Product';
import Breadcrumbs from 'components/partials/Breadcrumbs';

// Template
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import products from 'data/products';


class Products extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: null
    };
  }

  initLanguage() {
    const selectedProductId = this.props.match && this.props.match.params && this.props.match.params.productId
      ? this.props.match.params.productId
      : null;
    this.props.updateMultilingualRoutes(
      selectedProductId
      ? `products/${selectedProductId}/`
      : 'products/');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage
      ? this.props.match.params.selectedLanguage
      : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey) {
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }

  componentDidUpdate(prevProps) {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
    if (this.props.location.pathname !== prevProps.location.pathname){
      this.initLanguage();
    }
  }

  renderProducts() {
    return products && products.length
      ? products.map(product => {
        const productId = convertToUrlFriendlyString(product.title);
        return (<ListItem key={productId} fullscreen={this.props.fullscreen}>
          <Product product={product}/>
        </ListItem>)
      })
      : '';
  }

  renderSelectedProduct(selectedProduct) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/`
      });
    }
    const handleClickArrowLeft = selectedProduct && selectedProduct.previousProductId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${selectedProduct.previousProductId}/`
      });
    } : null;
    const handleClickArrowRight = selectedProduct && selectedProduct.nextProductId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${selectedProduct.nextProductId}/`
      });
    } : null;
    return selectedProduct
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="540px" onClickArrowLeft={handleClickArrowLeft} onClickArrowRight={handleClickArrowRight}>
        <Product product={selectedProduct} fullscreen={true}/>
      </Modal>)
      : '';
  }

  getSelectedProduct(selectedProductId, selectedLanguageKey) {
    let selectedProduct = null;
    products.forEach((product, index) => {
      const productId = convertToUrlFriendlyString(product.title)
      if (productId === selectedProductId) {
        selectedProduct = {
          ...product,
          previousProductId: index > 0 ? convertToUrlFriendlyString(products[index-1].title[selectedLanguageKey]) : null,
          nextProductId: index < products.length-1 ? convertToUrlFriendlyString(products[index+1].title[selectedLanguageKey]) : null
        }
      }
    });
    return selectedProduct;
  }

  render() {
    const selectedProductId = this.props.match && this.props.match.params && this.props.match.params.productId
      ? this.props.match.params.productId
      : null;
    const selectedProduct = selectedProductId
      ? this.getSelectedProduct(selectedProductId, this.props.selectedLanguageKey)
      : null;

    const listPage = {
      title: {
        en: 'Products | Dehli Musikk',
        no: 'Produkter | Dehli Musikk'
      },
      heading: {
        en: 'Products',
        no: 'Produkter'
      },
      description: {
        en: 'Products from Dehli Musikk',
        no: 'Produkter fra Dehli Musikk'
      }
    }

    const detailsPage = {
      title: {
        en: `${selectedProduct
          ? selectedProduct.title
          : ''} - Products | Dehli Musikk`,
        no: `${selectedProduct
          ? selectedProduct.title
          : ''} - Produkter | Dehli Musikk`
      },
      heading: {
        en: selectedProduct
          ? selectedProduct.title
          : '',
        no: selectedProduct
          ? selectedProduct.title
          : ''
      },
      description: {
        en: selectedProduct
          ? selectedProduct.content.en
          : '',
        no: selectedProduct
          ? selectedProduct.content.no
          : ''
      }
    }

    let breadcrumbs = [
      {
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/`
      }
    ];
    if (selectedProduct) {
      breadcrumbs.push({
        name: detailsPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${selectedProductId}/`
      })
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    } else {
      const selectedProductMultilingualIds = {
        en: selectedProduct
          ? convertToUrlFriendlyString(selectedProduct.title)
          : '',
        no: selectedProduct
          ? convertToUrlFriendlyString(selectedProduct.title)
          : ''
      };
      const metaTitle = selectedProduct
        ? detailsPage.title[this.props.selectedLanguageKey]
        : listPage.title[this.props.selectedLanguageKey];
      const contentTitle = selectedProduct
        ? detailsPage.heading[this.props.selectedLanguageKey]
        : listPage.heading[this.props.selectedLanguageKey];
      const metaDescription = selectedProduct
        ? detailsPage.description[this.props.selectedLanguageKey]
        : listPage.description[this.props.selectedLanguageKey];
      return (<React.Fragment>
        <Helmet htmlAttributes={{
            lang: this.props.selectedLanguageKey
          }}>
          <title>{metaTitle}</title>
          <meta name='description' content={metaDescription}/>
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${selectedProduct
              ? selectedProductId + '/'
              : ''}`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/products/${selectedProduct
              ? selectedProductMultilingualIds.no + '/'
              : ''}`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/products/${selectedProduct
              ? selectedProductMultilingualIds.en + '/'
              : ''}`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/products/${selectedProduct
              ? selectedProductMultilingualIds.no + '/'
              : ''}`} hreflang="x-default"/>
          <meta property="og:title" content={contentTitle}/>
          <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${selectedProduct
              ? selectedProductId + '/'
              : ''}`}/>
          <meta property="og:description" content={metaDescription}/>
          <meta property="og:locale" content={this.props.selectedLanguageKey === 'en'
              ? 'en_US'
              : 'no_NO'}/>
          <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en'
              ? 'nb_NO'
              : 'en_US'}/>
          <meta property="twitter:title" content={contentTitle} />
          <meta property="twitter:description" content={metaDescription} />
        </Helmet>
        <Container blur={selectedProduct !== null}>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{contentTitle}</h1>
          <p>{
              this.props.selectedLanguageKey === 'en'
                ? 'Products from Dehli Musikk'
                : 'Produkter fra Dehli Musikk'
            }</p>
        </Container>
        {
          selectedProduct ? this.renderSelectedProduct(selectedProduct) : ''
        }
        <Container blur={selectedProduct !== null}>
          <List>
            {this.renderProducts()}
          </List>
        </Container>
      </React.Fragment>)
    }
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey, location: state.router.location});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
