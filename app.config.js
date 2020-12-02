export default {
    data: {
        datasetid: "les-arbres",
        domainid: "fpassaniti",
        //where: "domanialite=\"DASCO\"",
        select: "idbase,stadedeveloppement,geo_point_2d",
        name_field: "idbase",
        type_field: "stadedeveloppement"
    },
    mapbox: {
        apikey: "pk.eyJ1IjoiZnBhc3Nhbml0aSIsImEiOiIxNTg3MGRlZWQyNjVkZjExMGVlNWVjNDFjOWQyNzNiMiJ9.pYKDlO4v-SNiDz08G9ZZoQ",
        init: { /* default map location (center of the map, and zoom level) */
            zoom: 11,
            center: [2.349215,48.853987]
        },
        style: "mapbox://styles/mapbox/light-v10",
        geocoder: { /* Narrow search results to the defined boundingbox to avoid to many noises */
            searchbbox: [1.693402,48.631097,3.011761,49.072970],
            placeholder: "Chercher une adresse"
        },
    },
    store: {
        unique_ids: ['idbase']
    },
    pictos: {
        "default": // mandatory, keep a default icon
            {
                "name": "default",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "",
                "color":
                    "#f5f5f5"
            },
        "null": // empty field from API
            {
                "name": "default",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "",
                "color":
                    "#f5f5f5"
            },
        "A":
            {
                "name": "a",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "icon-traiteur",
                "color":
                    "#FDD98B"
            }
        ,
        "J":
            {
                "name": "j",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "icon-primeur",
                "color":
                    "#1EA81A"
            }
        ,
        "JA":
            {
                "name": "ja",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "icon-poissonnerie",
                "color":
                    "#86B1FC"
            }
        ,
        "M":
            {
                "name": "m",
                "url":
                    "static/img/pin.svg",
                "fontclass":
                    "icon-truck",
                "color":
                    "#364852"
            }
    }
};

