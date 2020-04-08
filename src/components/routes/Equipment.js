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
    this.props.updateMultilingualRoutes('equipment');
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

  componentDidUpdate() {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({redirect: '/equipment/'});
    }
  }

renderEquipmentTypes(){
  const equipmentTypeElements = equipment && Object.keys(equipment).length ? Object.keys(equipment).map(equipmentTypeKey => {
    const equipmentType = equipment[equipmentTypeKey];
    const link = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${equipmentTypeKey}/`;
    return (<div key={equipmentTypeKey}><Link to={link} title={equipmentType.name[this.props.selectedLanguageKey]}>{equipmentType.name[this.props.selectedLanguageKey]}</Link></div>)
  }): null;
  return (<div className={`${style.posts} padding-sm`}>
    <h2>hoy</h2>
    <div className={style.grid}>
      {equipmentTypeElements}
    </div>
  </div>);
}

  renderEquipmentItems(equipment){
    const equipmentItemElements = equipment.items && equipment.items.length
      ? equipment.items.filter(item => {return item.hasImage}).map(item => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return <EquipmentItem key={itemId} item={item} itemId={itemId} itemType={equipment.equipmentType} />;
      })
      : '';
    return (<div className={`${style.posts} padding-sm`}>
      <h2>{equipment.name[this.props.selectedLanguageKey]}</h2>
      <div className={style.grid}>
        {equipmentItemElements}
      </div>
    </div>);
  }

  renderUnfinishedEquipmentItems(equipment){ // Temporary
    const unfinishedEquipmentItemElements = equipment.items && equipment.items.length
      ? equipment.items.filter(item => {return !item.hasImage}).map(item => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return <li>{itemId}</li>
      })
      : '';
      return <ul>{unfinishedEquipmentItemElements}</ul>;
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
          <EquipmentItem key={itemId} item={selectedEquipment} itemId={itemId} fullscreen={true}/>
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
        en: 'Latest update from Dehli Musikk',
        no: 'Siste oppdateringer fra Dehli Musikk'
      }
    }

    const listPage = {
      title: {
        en: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name[this.props.selectedLanguageKey]} - Equipment | Dehli Musikk`
          : '',
        no: selectedEquipmentType
          ? `${equipment[selectedEquipmentType].name[this.props.selectedLanguageKey]} - Utstyr | Dehli Musikk`
          : '',
      },
      heading: {
        en: selectedEquipmentType ? equipment[selectedEquipmentType].name['en'] : '',
        no: selectedEquipmentType ? equipment[selectedEquipmentType].name['no'] : ''
      },
      description: {
        en: 'Latest update from Dehli Musikk',
        no: 'Siste oppdateringer fra Dehli Musikk'
      }
    }

    const detailsPage = {
      title: {
        en: selectedEquipment
          ? `${selectedEquipment.brand} ${selectedEquipment.model} - Equipment | Dehli Musikk`
          : '',
        no: selectedEquipment
          ? `${selectedEquipment.brand} ${selectedEquipment.model} - Utstyr | Dehli Musikk`
          : ''
      },
      heading: selectedEquipment
        ? `${selectedEquipment.brand} ${selectedEquipment.model}`
        : '',
      description: {
        en: selectedEquipment && selectedEquipment.description && selectedEquipment.description.en
          ? selectedEquipment.description.en
          : '',
        no: selectedEquipment && selectedEquipment.description && selectedEquipment.description.no
          ? selectedEquipment.description.no
          : ''
      }
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
        name: detailsPage.heading[this.props.selectedLanguageKey],
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
                : listPage.title[this.props.selectedLanguageKey]
            }</title>
          <meta name='description' content={selectedEquipment
              ? detailsPage.description[this.props.selectedLanguageKey]
              : listPage.description[this.props.selectedLanguageKey]}/>
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${selectedEquipment
              ? selectedEquipmentId + '/'
              : ''}`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/equipment/${selectedEquipment
              ? '/' + selectedEquipmentId + '/'
              : ''}`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/equipment/${selectedEquipment
              ? '/' + selectedEquipmentId + '/'
              : ''}`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/equipment/${selectedEquipment
              ? '/' + selectedEquipmentId + '/'
              : ''}`} hreflang="x-default"/>
        </Helmet>
        <div className='padding'>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{
              selectedEquipment
                ? detailsPage.heading
                : listPage.heading[this.props.selectedLanguageKey]
            }</h1>
          <p>{
              this.props.selectedLanguageKey === 'en'
                ? 'Updates from Dehli Musikk'
                : 'Oppdateringer fra Dehli Musikk'
            }</p>
        </div>
        {
          selectedEquipment
            ? this.renderSelectedEquipment(selectedEquipment, selectedEquipmentType)
            : ''
        }
        {
          selectedEquipmentType
            ? this.renderEquipmentItems(equipment[selectedEquipmentType])
            : this.renderEquipmentTypes()
        }
        {
          selectedEquipmentType
            ? this.renderUnfinishedEquipmentItems(equipment[selectedEquipmentType])
            : ''
        }

      </div>)
    }
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Equipment);
