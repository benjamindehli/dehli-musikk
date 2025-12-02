// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";

// Components
import Breadcrumbs from "../partials/Breadcrumbs";
import Container from "../template/Container";
import EquipmentItem from "../partials/EquipmentItem";
import List from "../template/List";
import ListItem from "../template/List/ListItem";
import ListItemContent from "../template/List/ListItem/ListItemContent";
import ListItemContentHeader from "../template/List/ListItem/ListItemContent/ListItemContentHeader";
import ListItemThumbnail from "../template/List/ListItem/ListItemThumbnail";
import Modal from "../template/Modal";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "../../actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "../../reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "../../helpers/urlFormatter";

// Data
import equipment from "../../data/equipment";

const Equipment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const selectedEquipmentType = params?.equipmentType || null;
    const selectedEquipmentId = params?.equipmentId || null;

    // State
    const [selectedEquipment, setSelectedEquipment] = useState();

    // Redux store
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const languageSlug = useSelector((state) => getLanguageSlug(state));
    const availableLanguages = useSelector((state) => state.availableLanguages);
    const multilingualRoutes = useSelector((state) => state.multilingualRoutes);

    useEffect(() => {
        if (params.selectedLanguage) {
            dispatch(updateSelectedLanguageKey(params.selectedLanguage));
        }
    }, [dispatch, params]);

    useEffect(() => {
        setSelectedEquipment(
            !!selectedEquipmentType && !!selectedEquipmentId
                ? getSelectedEquipment(equipment?.[selectedEquipmentType]?.items, selectedEquipmentId)
                : undefined
        );
    }, [selectedEquipmentId, selectedEquipmentType]);

    useEffect(() => {
        const equipmentPath =
            selectedEquipment && selectedEquipmentId
                ? `${selectedEquipmentType}/${selectedEquipmentId}/`
                : selectedEquipmentType
                ? `${selectedEquipmentType}/`
                : "";
        const multilingualPaths = {
            no: `equipment/${equipmentPath}`,
            en: `equipment/${equipmentPath}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, selectedEquipment, selectedEquipmentId, selectedEquipmentType]);

    const renderSummarySnippetForEquipmentTypes = (equipment) => {
        const equipmentTypeItems =
            equipment && Object.keys(equipment).length
                ? Object.keys(equipment).map((equipmentTypeKey, index) => {
                      return {
                          "@type": "ListItem",
                          position: index + 1,
                          url: `https://www.dehlimusikk.no/${languageSlug}equipment/${equipmentTypeKey}/`
                      };
                  })
                : null;
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: equipmentTypeItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderSummarySnippetForEquipmentItems = (equipment, equipmentTypeKey) => {
        const equipmentItems = equipment?.items?.length
            ? equipment.items.map((item, index) => {
                  const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
                  return {
                      "@type": "ListItem",
                      position: index + 1,
                      url: `https://www.dehlimusikk.no/${languageSlug}equipment/${equipmentTypeKey}/${itemId}/`
                  };
              })
            : null;
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: equipmentItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderEquipmentTypeThumbnail = (image, itemName) => {
        return (
            <React.Fragment>
                <source
                    sizes="175px"
                    srcSet={`${image.avif55} 55w, ${image.avif350} 350w, ${image.avif540} 540w, ${image.avif945} 945w`}
                    type="image/avif"
                />
                <source
                    sizes="175px"
                    srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`}
                    type="image/webp"
                />
                <source
                    sizes="175px"
                    srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`}
                    type="image/jpg"
                />
                <img loading="lazy" width="350" height="260" src={image.jpg350} alt={itemName} />
            </React.Fragment>
        );
    };

    const renderEquipmentTypes = () => {
        return equipment && Object.keys(equipment).length
            ? Object.keys(equipment).map((equipmentTypeKey) => {
                  const equipmentType = equipment[equipmentTypeKey];
                  const itemPath = `/${languageSlug}equipment/${equipmentTypeKey}/`;

                  const imagePathAvif = `data/equipment/thumbnails/web/avif/${equipmentTypeKey}`;
                  const imagePathWebp = `data/equipment/thumbnails/web/webp/${equipmentTypeKey}`;
                  const imagePathJpg = `data/equipment/thumbnails/web/jpg/${equipmentTypeKey}`;
                  const image = {
                      avif55: require(`../../${imagePathAvif}_55.avif`)?.default,
                      avif350: require(`../../${imagePathAvif}_350.avif`)?.default,
                      avif540: require(`../../${imagePathAvif}_540.avif`)?.default,
                      avif945: require(`../../${imagePathAvif}_945.avif`)?.default,
                      webp55: require(`../../${imagePathWebp}_55.webp`)?.default,
                      webp350: require(`../../${imagePathWebp}_350.webp`)?.default,
                      webp540: require(`../../${imagePathWebp}_540.webp`)?.default,
                      webp945: require(`../../${imagePathWebp}_945.webp`)?.default,
                      jpg55: require(`../../${imagePathJpg}_55.jpg`)?.default,
                      jpg350: require(`../../${imagePathJpg}_350.jpg`)?.default,
                      jpg540: require(`../../${imagePathJpg}_540.jpg`)?.default,
                      jpg945: require(`../../${imagePathJpg}_945.jpg`)?.default
                  };

                  const link = {
                      to: itemPath,
                      title: equipmentType.name[selectedLanguageKey]
                  };

                  return (
                      <ListItem key={equipmentTypeKey}>
                          <ListItemThumbnail link={link}>
                              {renderEquipmentTypeThumbnail(image, equipmentType.name[selectedLanguageKey])}
                          </ListItemThumbnail>
                          <ListItemContent>
                              <ListItemContentHeader link={link}>
                                  <h2>{equipmentType.name[selectedLanguageKey]}</h2>
                              </ListItemContentHeader>
                          </ListItemContent>
                      </ListItem>
                  );
              })
            : null;
    };

    const renderEquipmentItems = (equipment) => {
        return equipment?.items?.length
            ? equipment.items.map((item) => {
                  const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
                  return (
                      <ListItem key={itemId}>
                          <EquipmentItem item={item} itemId={itemId} itemType={equipment.equipmentType} />
                      </ListItem>
                  );
              })
            : "";
    };

    const renderSelectedEquipment = (selectedEquipment, selectedEquipmentType) => {
        const handleClickOutside = () => {
            navigate(`/${languageSlug}equipment/${selectedEquipmentType}/`);
        };
        const arrowLeftLink =
            selectedEquipment && selectedEquipment.previousEquipmentItemId
                ? `/${languageSlug}equipment/${selectedEquipmentType}/${selectedEquipment.previousEquipmentItemId}/`
                : null;
        const arrowRightLink =
            selectedEquipment && selectedEquipment.nextEquipmentItemId
                ? `/${languageSlug}equipment/${selectedEquipmentType}/${selectedEquipment.nextEquipmentItemId}/`
                : null;

        const itemId = convertToUrlFriendlyString(`${selectedEquipment.brand} ${selectedEquipment.model}`);
        return selectedEquipment ? (
            <Modal
                onClickOutside={handleClickOutside}
                maxWidth="945px"
                arrowLeftLink={arrowLeftLink}
                arrowRightLink={arrowRightLink}
                selectedLanguageKey={selectedLanguageKey}
            >
                <EquipmentItem
                    key={itemId}
                    item={selectedEquipment}
                    itemType={selectedEquipmentType}
                    itemId={itemId}
                    fullscreen={true}
                />
            </Modal>
        ) : (
            ""
        );
    };

    const getSelectedEquipment = (equipment, selectedEquipmentId) => {
        let selectedEquipment = null;
        equipment?.forEach((equipmentItem, index) => {
            const equipmentItemId = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`);
            if (equipmentItemId === selectedEquipmentId) {
                selectedEquipment = {
                    ...equipmentItem,
                    equipmentItemId,
                    previousEquipmentItemId:
                        index > 0
                            ? convertToUrlFriendlyString(`${equipment[index - 1].brand} ${equipment[index - 1].model}`)
                            : null,
                    nextEquipmentItemId:
                        index < equipment.length - 1
                            ? convertToUrlFriendlyString(`${equipment[index + 1].brand} ${equipment[index + 1].model}`)
                            : null
                };
            }
        });
        return selectedEquipment;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            const hasInvalidEquipmentType =
                selectedEquipmentType && !["instruments", "effects", "amplifiers"].includes(selectedEquipmentType);

            const hasInvalidEquipmentId = selectedEquipmentId && selectedEquipment === null;
            if (hasInvalidEquipmentType || hasInvalidEquipmentId) {
                return <Navigate to="/404" />;
            }

            const listEquipmentTypesPage = {
                title: {
                    en: "Equipment | Dehli Musikk",
                    no: "Utstyr | Dehli Musikk"
                },
                heading: {
                    en: "Equipment",
                    no: "Utstyr"
                },
                description: {
                    en: "Equipment I use during recording",
                    no: "Utstyr jeg bruker under innspilling"
                }
            };

            const listPage = {
                title: {
                    en: selectedEquipmentType
                        ? `${equipment[selectedEquipmentType]?.name["en"]} - Equipment | Dehli Musikk`
                        : "",
                    no: selectedEquipmentType
                        ? `${equipment[selectedEquipmentType]?.name["no"]} - Utstyr | Dehli Musikk`
                        : ""
                },
                heading: {
                    en: selectedEquipmentType ? equipment[selectedEquipmentType]?.name["en"] : "",
                    no: selectedEquipmentType ? equipment[selectedEquipmentType]?.name["no"] : ""
                },
                description: {
                    en: selectedEquipmentType
                        ? `${equipment[selectedEquipmentType]?.name["en"]} I use during recording`
                        : "",
                    no: selectedEquipmentType
                        ? `${equipment[selectedEquipmentType]?.name["no"]} jeg bruker under innspilling`
                        : ""
                }
            };

            const detailsPage = {
                title: {
                    en: selectedEquipment
                        ? `${selectedEquipment.brand} ${selectedEquipment.model} - ${equipment[selectedEquipmentType].name["en"]} - Equipment | Dehli Musikk`
                        : "",
                    no: selectedEquipment
                        ? `${selectedEquipment.brand} ${selectedEquipment.model} - ${equipment[selectedEquipmentType].name["no"]} - Utstyr | Dehli Musikk`
                        : ""
                },
                heading: selectedEquipment ? `${selectedEquipment.brand} ${selectedEquipment.model}` : "",
                // TODO Add description
                description: selectedEquipment ? `${selectedEquipment.brand} ${selectedEquipment.model}` : ""
            };
            let breadcrumbs = [
                {
                    name: listEquipmentTypesPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}equipment/`
                }
            ];
            if (selectedEquipmentType) {
                breadcrumbs.push({
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}equipment/${selectedEquipmentType}/`
                });
            }
            if (selectedEquipment) {
                breadcrumbs.push({
                    name: detailsPage.heading,
                    path: `/${languageSlug}equipment/${selectedEquipmentType}/${selectedEquipment.equipmentItemId}/`
                });
            }

            return (
                <React.Fragment>
                    <Helmet
                        htmlAttributes={{
                            lang: selectedLanguageKey
                        }}
                    >
                        <title>
                            {selectedEquipment
                                ? detailsPage.title[selectedLanguageKey]
                                : selectedEquipmentType
                                ? listPage.title[selectedLanguageKey]
                                : listEquipmentTypesPage.title[selectedLanguageKey]}
                        </title>
                        <meta
                            name="description"
                            content={
                                selectedEquipment
                                    ? detailsPage.description
                                    : selectedEquipmentType
                                    ? listPage.description[selectedLanguageKey]
                                    : listEquipmentTypesPage.description[selectedLanguageKey]
                            }
                        />
                        <link
                            rel="canonical"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.[selectedLanguageKey]?.path}`}
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.no?.path}`}
                            hreflang="no"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.en?.path}`}
                            hreflang="en"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.no?.path}`}
                            hreflang="x-default"
                        />
                    </Helmet>
                    <Container blur={!!selectedEquipment}>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </Container>
                    {selectedEquipment
                        ? renderSelectedEquipment(selectedEquipment, selectedEquipmentType)
                        : selectedEquipmentType
                        ? renderSummarySnippetForEquipmentItems(equipment[selectedEquipmentType], selectedEquipmentType)
                        : renderSummarySnippetForEquipmentTypes(equipment)}
                    <Container blur={!!selectedEquipment}>
                        {
                            selectedEquipment
                                ? <h2 data-size="h1">{selectedEquipmentType ? listPage.heading[selectedLanguageKey] : listEquipmentTypesPage.heading[selectedLanguageKey]}</h2>
                                : <h1>{selectedEquipmentType ? listPage.heading[selectedLanguageKey] : listEquipmentTypesPage.heading[selectedLanguageKey]}</h1>
                        }
                        <p>
                            {selectedEquipmentType
                                ? listPage.description[selectedLanguageKey]
                                : listEquipmentTypesPage.description[selectedLanguageKey]}
                        </p>
                    </Container>
                    <Container blur={!!selectedEquipment}>
                        <List>
                            {selectedEquipmentType
                                ? renderEquipmentItems(equipment[selectedEquipmentType])
                                : renderEquipmentTypes()}
                        </List>
                    </Container>
                </React.Fragment>
            );
        }
    }
};

export default Equipment;
