// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link, Redirect} from 'react-router-dom';

// Components
import EquipmentItem from 'components/partials/EquipmentItem';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Modal from 'components/partials/Modal';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import equipment from 'data/equipment';

// Stylesheets
import style from 'components/routes/Equipment.module.scss';

class Equipment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: null
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  initLanguage() {
    const selectedEquipmentType = this.props.match && this.props.match.params && this.props.match.params.equipmentType
      ? this.props.match.params.equipmentType
      : null;
    const selectedEquipmentId = this.props.match && this.props.match.params && this.props.match.params.equipmentId
      ? this.props.match.params.equipmentId
      : null;
    const multilingualRoute = `equipment/${selectedEquipmentType ? selectedEquipmentType + '/' : ''}${selectedEquipmentId ? selectedEquipmentId + '/' : ''}`

    this.props.updateMultilingualRoutes(multilingualRoute);

    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage
      ? this.props.match.params.selectedLanguage
      : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey) {
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
    if (this.props.location.pathname !== prevProps.location.pathname){
      this.initLanguage();
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    const selectedEquipmentType = this.props.match && this.props.match.params && this.props.match.params.equipmentType
      ? this.props.match.params.equipmentType
      : null;
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({redirect: `/equipment/${selectedEquipmentType ? selectedEquipmentType + '/' : ''}`});
    }
  }

  renderEquipmentTypeThumbnail(image, itemName, itemPath) {
    const copyrightString = 'cc-by 2020 Benjamin Dehli dehlimusikk.no';
    const thumbnailElement = (<figure className={style.thumbnail}>
      <picture>
        <source sizes='175px' srcSet={`${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`} type="image/webp"/>
        <source sizes='175px' srcSet={`${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpg"/>
        <img loading="lazy" src={image.jpg350} alt={itemName} copyright={copyrightString} />
      </picture>
    </figure>);
    return (<Link to={itemPath} title={itemName}>{thumbnailElement}</Link>);
  }

  renderEquipmentTypes(listEquipmentTypesPage){
    const equipmentTypeElements = equipment && Object.keys(equipment).length ? Object.keys(equipment).map(equipmentTypeKey => {
      const equipmentType = equipment[equipmentTypeKey];
      const itemPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${equipmentTypeKey}/`;

      const imagePathWebp = `data/equipment/thumbnails/web/webp/${equipmentTypeKey}`;
      const imagePathJpg = `data/equipment/thumbnails/web/jpg/${equipmentTypeKey}`;
      const image = {
        webp350: require(`../../${imagePathWebp}_350.webp`),
        webp540: require(`../../${imagePathWebp}_540.webp`),
        webp945: require(`../../${imagePathWebp}_945.webp`),
        jpg350: require(`../../${imagePathJpg}_350.jpg`),
        jpg540: require(`../../${imagePathJpg}_540.jpg`),
        jpg945: require(`../../${imagePathJpg}_945.jpg`)
      };

      return (<div key={equipmentTypeKey} className={style.gridItem}>
          {this.renderEquipmentTypeThumbnail(image, equipmentType.name[this.props.selectedLanguageKey], itemPath)}
          <div className={style.contentContainer}>
            <div className={style.content}>
              <div className={style.header}>
                <Link to={itemPath} title={equipmentType.name[this.props.selectedLanguageKey]}>
                  <h2>{equipmentType.name[this.props.selectedLanguageKey]}</h2>
                </Link>
              </div>
              <div className={style.body}>
              </div>
            </div>
          </div>
        </div>)
    }): null;
    return (<div className={`${style.posts} padding-sm`}>
      <h2>{listEquipmentTypesPage.heading[this.props.selectedLanguageKey]}</h2>
      <p>{listEquipmentTypesPage.description[this.props.selectedLanguageKey]}</p>
      <div className={style.grid}>
        {equipmentTypeElements}
      </div>
    </div>);
  }

  renderEquipmentItems(equipment, selectedEquipment){
    const equipmentItemElements = equipment.items && equipment.items.length
      ? equipment.items.map(item => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return <EquipmentItem key={itemId} item={item} itemId={itemId} itemType={equipment.equipmentType} />;
      })
      : '';
    return (<div className={`${style.posts} ${selectedEquipment
        ? style.blur
        : ''} padding-sm`}>
      <h2>{equipment.name[this.props.selectedLanguageKey]}</h2>
      <div className={style.grid}>
        {equipmentItemElements}
      </div>
    </div>);
  }


  renderSelectedEquipment(selectedEquipment, selectedEquipmentType) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/`
      });
    }

    const itemId = convertToUrlFriendlyString(`${selectedEquipment.brand} ${selectedEquipment.model}`);
    return selectedEquipment
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="945px">
          <EquipmentItem key={itemId} item={selectedEquipment} itemType={selectedEquipmentType} itemId={itemId} fullscreen={true}/>
        </Modal>)
      : '';
  }

  getSelectedEquipment(equipment, selectedEquipmentType, selectedEquipmentId) {
    const selectedEquipment = equipment.find(equipmentItem => {
      const equipmentItemId = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`)
      return equipmentItemId === selectedEquipmentId
    });
    return selectedEquipment;
  }

  render() {
    const selectedEquipmentType = this.props.match && this.props.match.params && this.props.match.params.equipmentType
      ? this.props.match.params.equipmentType
      : null;
    const selectedEquipmentId = this.props.match && this.props.match.params && this.props.match.params.equipmentId
      ? this.props.match.params.equipmentId
      : null;
    const selectedEquipment = selectedEquipmentType && selectedEquipmentId
      ? this.getSelectedEquipment(equipment[selectedEquipmentType].items, selectedEquipmentType, selectedEquipmentId)
      : null;

    const listEquipmentTypesPage = {
      title: {
        en: 'Equipment | Dehli Musikk',
        no: 'Utstyr | Dehli Musikk'
      },
      heading: {
        en: 'Equipment',
        no: 'Utstyr'
      },
      description: {
        en: 'Equipment I use during recording',
        no: 'Utstyr jeg bruker under innspilling'
      }
    }

    const listPage = {
      title: {
        en: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name['en']} - Equipment | Dehli Musikk`
          : '',
        no: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name['no']} - Utstyr | Dehli Musikk`
          : '',
      },
      heading: {
        en: selectedEquipmentType ? equipment[selectedEquipmentType].name['en'] : '',
        no: selectedEquipmentType ? equipment[selectedEquipmentType].name['no'] : ''
      },
      description: {
        en: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name['en']} I use during recording`
          : '',
        no: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name['no']} jeg bruker under innspilling`
          : '',

      }
    }

    const detailsPage = {
      title: {
        en: selectedEquipment
          ? `${selectedEquipment.brand} ${selectedEquipment.model} - ${equipment[selectedEquipmentType].name['en']} - Equipment | Dehli Musikk`
          : '',
        no: selectedEquipment
          ? `${selectedEquipment.brand} ${selectedEquipment.model} - ${equipment[selectedEquipmentType].name['no']} - Utstyr | Dehli Musikk`
          : ''
      },
      heading: selectedEquipment
        ? `${selectedEquipment.brand} ${selectedEquipment.model}`
        : '',
      description:  // TODO Add description
        selectedEquipment
        ? `${selectedEquipment.brand} ${selectedEquipment.model}`
        : ''
    }
    let breadcrumbs = [
      {
        name: listEquipmentTypesPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/`
      }
    ];
    if (selectedEquipmentType) {
      breadcrumbs.push({
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/`
      })
    }
    if (selectedEquipment) {
      breadcrumbs.push({
        name: detailsPage.heading,
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/${selectedEquipment.id}/`
      })
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    } else {
      return (<div className={style.container}>
        <Helmet htmlAttributes={{
            lang: this.props.selectedLanguageKey
          }}>
          <title>{
              selectedEquipment
                ? detailsPage.title[this.props.selectedLanguageKey]
                : selectedEquipmentType
                  ? listPage.title[this.props.selectedLanguageKey]
                  : listEquipmentTypesPage.title[this.props.selectedLanguageKey]
            }</title>
          <meta name='description' content={selectedEquipment
              ? detailsPage.description
              : selectedEquipmentType
                ? listPage.description[this.props.selectedLanguageKey]
                : listEquipmentTypesPage.description[this.props.selectedLanguageKey]}/>
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipment
              ? selectedEquipmentType + '/' + selectedEquipmentId + '/'
              : selectedEquipmentType
                ? selectedEquipmentType + '/'
                : ''
            }`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/equipment/${selectedEquipment
              ? selectedEquipmentType + '/' + selectedEquipmentId + '/'
              : selectedEquipmentType
                ? selectedEquipmentType + '/'
                : ''
            }`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/equipment/${selectedEquipment
              ? selectedEquipmentType + '/' + selectedEquipmentId + '/'
              : selectedEquipmentType
                ? selectedEquipmentType + '/'
                : ''
            }`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/equipment/${selectedEquipment
              ? selectedEquipmentType + '/' + selectedEquipmentId + '/'
              : selectedEquipmentType
                ? selectedEquipmentType + '/'
                : ''
            }`} hreflang="x-default"/>
        </Helmet>
        <div className={`${selectedEquipment
            ? style.blur
            : ''} padding`}>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{
              selectedEquipment
                ? detailsPage.heading
                : selectedEquipmentType
                  ? listPage.heading[this.props.selectedLanguageKey]
                  : listEquipmentTypesPage.heading[this.props.selectedLanguageKey]
            }</h1>
          <p>{
              selectedEquipment
                ? detailsPage.description
                : selectedEquipmentType
                  ? listPage.description[this.props.selectedLanguageKey]
                  : listEquipmentTypesPage.description[this.props.selectedLanguageKey]
            }</p>
        </div>
        {
          selectedEquipment
            ? this.renderSelectedEquipment(selectedEquipment, selectedEquipmentType)
            : ''
        }
        {
          selectedEquipmentType
            ? this.renderEquipmentItems(equipment[selectedEquipmentType], selectedEquipment)
            : this.renderEquipmentTypes(listEquipmentTypesPage)
        }
      </div>)
    }
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey, location: state.router.location});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Equipment);
