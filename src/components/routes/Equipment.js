// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import { Redirect} from 'react-router-dom';

// Components
import EquipmentItem from 'components/partials/EquipmentItem';
import Breadcrumbs from 'components/partials/Breadcrumbs';

// Template
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import Modal from 'components/template/Modal';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import equipment from 'data/equipment';


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

  renderEquipmentTypeThumbnail(image, itemName) {
    const copyrightString = 'cc-by 2020 Benjamin Dehli dehlimusikk.no';
    return (<React.Fragment>
        <source sizes='175px' srcSet={`${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`} type="image/webp"/>
        <source sizes='175px' srcSet={`${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpg"/>
        <img loading="lazy" src={image.jpg350} alt={itemName} copyright={copyrightString} />
    </React.Fragment>);
  }

  renderEquipmentTypes(listEquipmentTypesPage){
    return equipment && Object.keys(equipment).length ? Object.keys(equipment).map(equipmentTypeKey => {
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

      const link = {
        to: itemPath,
        title: equipmentType.name[this.props.selectedLanguageKey]
      };

      return (<ListItem key={equipmentTypeKey}>
          <ListItemThumbnail link={link}>
            {this.renderEquipmentTypeThumbnail(image, equipmentType.name[this.props.selectedLanguageKey])}
          </ListItemThumbnail>
          <ListItemContent>
            <ListItemContentHeader link={link}>
              <h2>{equipmentType.name[this.props.selectedLanguageKey]}</h2>
            </ListItemContentHeader>
          </ListItemContent>
        </ListItem>)
    }): null;
  }

  renderEquipmentItems(equipment, selectedEquipment){
    return equipment.items && equipment.items.length
      ? equipment.items.map(item => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return (<ListItem key={itemId}>
          <EquipmentItem item={item} itemId={itemId} itemType={equipment.equipmentType} />
        </ListItem>);
      })
      : '';
  }


  renderSelectedEquipment(selectedEquipment, selectedEquipmentType) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/`
      });
    }
    const handleClickArrowLeft = selectedEquipment && selectedEquipment.previousEquipmentItemId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/${selectedEquipment.previousEquipmentItemId}/`
      });
    } : null;
    const handleClickArrowRight = selectedEquipment && selectedEquipment.nextEquipmentItemId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipmentType}/${selectedEquipment.nextEquipmentItemId}/`
      });
    } : null;

    const itemId = convertToUrlFriendlyString(`${selectedEquipment.brand} ${selectedEquipment.model}`);
    return selectedEquipment
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="945px" onClickArrowLeft={handleClickArrowLeft} onClickArrowRight={handleClickArrowRight}>
          <EquipmentItem key={itemId} item={selectedEquipment} itemType={selectedEquipmentType} itemId={itemId} fullscreen={true}/>
        </Modal>)
      : '';
  }

  getSelectedEquipment(equipment, selectedEquipmentId) {
    let selectedEquipment = null;
    equipment.forEach((equipmentItem, index) => {
      const equipmentItemId = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`)
      if (equipmentItemId === selectedEquipmentId) {
        selectedEquipment = {
          ...equipmentItem,
          previousEquipmentItemId: index > 0 ? convertToUrlFriendlyString(`${equipment[index-1].brand} ${equipment[index-1].model}`) : null,
          nextEquipmentItemId: index < equipment.length-1 ? convertToUrlFriendlyString(`${equipment[index+1].brand} ${equipment[index+1].model}`) : null
        }
      }
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
      ? this.getSelectedEquipment(equipment[selectedEquipmentType].items, selectedEquipmentId)
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
      return (<React.Fragment>
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
        <Container blur={selectedEquipment !== null}>
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
        </Container>
        {
          selectedEquipment
            ? this.renderSelectedEquipment(selectedEquipment, selectedEquipmentType)
            : ''
        }
        <Container blur={selectedEquipment !== null}>
          <List>
          {
            selectedEquipmentType
              ? this.renderEquipmentItems(equipment[selectedEquipmentType], selectedEquipment)
              : this.renderEquipmentTypes(listEquipmentTypesPage)
          }
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

export default connect(mapStateToProps, mapDispatchToProps)(Equipment);
