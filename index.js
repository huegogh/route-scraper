// Required stuff
var scraper = require('table-scraper');
const fetch = require('node-fetch');
const fs = require('fs');


//Code for Local Routes only
let localRoutes = [
   [510, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [515, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [520, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [525, ["East", "West"], ["Weekday", "Weekday"], "Local"],
   [545, ["East", "West"], ["Weekday", "Weekday"], "Local"],
   [555, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [566, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [576, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [578, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [580, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [710, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [715, ["East", "West"], ["Weekday", "Weekday"], "Local"],
   [720, ["North", "South"], ["Weekday", "Weekday"], "Local"],
   [725, ["East", "West"], ["Weekday", "Weekday"], "Local"],
   [745, ["East", "West"], ["Weekday", "Weekday"], "Local"]
];
// End of Local Routes

// Start of BRT Express Routes
let brtExpressRoutes = [
   [40, ["North", "South", "North", "South"], ["Weekday", "Weekday", "Weekend", "Weekend"], "BRT-Express"],
   [43, ["East", "West", "East", "West"], ["Weekday", "Weekday", "Weekend", "Weekend"], "BRT-Express"],
   [44, ["North", "South", "North", "South"], ["Weekday", "Weekday", "Weekend", "Weekend"], "BRT-Express"],
   [47, ["East", "West", "East", "West"], ["Weekday", "Weekday", "Weekend", "Weekend"], "BRT-Express"],
   [49, ["East", "West", "East", "West"], ["Weekday", "Weekday", "Weekend", "Weekend"], "BRT-Express"],
];
// End of BRT Express Routes

// Start of Hopper-Local Routes

let hopperLocalRoutes = [
   [1, ["Roundtrip"], ["Weekday"], "Hopper-Local"],
   [2, ["Roundtrip"], ["Weekday"], "Hopper-Local"],
   [3, ["Roundtrip"], ["Weekday"], "Hopper-Local"],
   [4, ["North", "South"], ["Weekday", "Weekday"], "Hopper-Local"],
   [5, ["North", "South"], ["Weekday", "Weekday"], "Hopper-Local"],
   [6, ["Roundtrip"], ["Weekday", "Weekday"], "Hopper-Local"],
   [9, ["East", "West"], ["Weekday", "Weekday"], "Hopper-Local"]
];
// End of Hopper-Local Routes



//Start of Commuter Routes
let commuterRoutes = [
   [150, ["West", "East", "West", "East"], ["Weekday", "Weekday", "Weekend", "Weekend"], "Commuter"],
   [163, ["North", "South"], ["Weekday", "Weekday"], "Commuter"],
];
//End of Commuter Routes


// Start of Hopper-County Routes

let hopperCountyRoutes = [
   [90, ["North", "South"], ["Weekday", "Weekday"], "Hopper-County"],
   [91, ["North", "South"], ["Weekday", "Weekday"], "Hopper-County"],
   [93, ["North", "South"], ["Weekday", "Weekday"], "Hopper-County"],
   [95, ["North", "South"], ["Weekday", "Weekday"], "Hopper-County"],
   [97, ["North", "South"], ["Weekday", "Weekday"], "Hopper-County"],
];
// End of Hopper-County Routes

function scrapeSJRTDTable(routeNumber, direction, typeOfDay, typeOfRoute) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         let Tables = [];
         let info = fs.readFileSync(`routes${typeOfRoute}.json`);
         let RoutesOBJ = JSON.parse(info);
         direction.forEach((path, index) => Tables.push(pageTables[index]));
         console.log("----Route #" + routeNumber + "----");
         Tables.forEach((table, index) => {
            let trips = []
            let stops = Object.keys(table[0]);
            table.forEach(row => {
               trips.push(Object.values(row));
            });
            let Route = {
               "id": 0,
               "route": routeNumber,
               "typeOfRoute": typeOfRoute,
               "typeOfDay": typeOfDay[index],
               "direction": direction[index],
               "stops": JSON.stringify(stops),
               "trips": JSON.stringify(trips)
            }
            RoutesOBJ[routeNumber + direction[index] + typeOfDay[index]] = (Route);
         });
         let data = JSON.stringify(RoutesOBJ);
         fs.writeFileSync(`routes${typeOfRoute}.json`, data);
         console.log(RoutesOBJ);
      });
}


// ! commuterRoutes.forEach(route => scrapeSJRTDTable(...route));
// ! localRoutes.forEach(route => scrapeSJRTDTable(...route));
// ! hopperCountyRoutes.forEach(route => scrapeSJRTDTable(...route));
// ! hopperLocalRoutes.forEach(route => scrapeSJRTDTable(...route));
// ! brtExpressRoutes.forEach(route => scrapeSJRTDTable(...route));

function translateRouteJSONIntoArray(fileName) {
   let info = fs.readFileSync(fileName);
   info = JSON.parse(info);
   let arrayOfRoutes = [];
   let index = 0;
   for (const route in info) {
      arrayOfRoutes[index] = info[route];
      index++;
   }
   return arrayOfRoutes;
}

function postAllRoutes() {
   let localRoutes = translateRouteJSONIntoArray("routesLocal.json");
   let commuterRoutes = translateRouteJSONIntoArray("routesCommuter.json");
   let hopperCountyRoutes = translateRouteJSONIntoArray("routesHopper-County.json");
   let hopperLocalRoutes = translateRouteJSONIntoArray("routesHopper-Local.json");
   let brtExpressRoutes = translateRouteJSONIntoArray("routesBRT-Express.json");

   let allRoutesArray = localRoutes.concat(commuterRoutes, hopperCountyRoutes, hopperLocalRoutes, brtExpressRoutes);

   for (let i = 0; i < allRoutesArray.length; i++) {
      fetch('http://sjrtd.azurewebsites.net/routes/add-path', {
         method: 'POST',
         headers: {
            'content-type': 'application/json'
         },
         body: JSON.stringify({
            id: allRoutesArray[i].id,
            route: allRoutesArray[i].route,
            typeOfRoute: allRoutesArray[i].typeOfRoute,
            typeOfDay: allRoutesArray[i].typeOfDay,
            direction: allRoutesArray[i].direction,
            stops: allRoutesArray[i].stops,
            trips: allRoutesArray[i].trips
         })
      })
         .then(response => {
            console.log(response)
         })
         .catch(err => {
            console.log(err)
         })
   }
   console.log(allRoutesArray);

}

//postAllRoutes();


let stops = [

   {
      id: 0,
      stopId: 7014,
      name: "SJ Cnty Hospital",
      lat: 37.88663,
      lon: -121.280972
   },
   {
      id: 0,
      stopId: 3073,
      name: "El Dorado & Hospital Rd NB",
      lat: 37.886086,
      lon: -121.276264
   },
   {
      id: 0,
      stopId: 3074,
      name: "El Dorado & French Camp NB",
      lat: 37.889301,
      lon: -121.276301
   },
   {
      id: 0,
      stopId: 3075,
      name: "El Dorado & 4554 El Dorado NB,EL DORADO ST & 5544 EL DORADO ST",
      lat: 37.897407,
      lon: -121.275684
   },
   {
      id: 0,
      stopId: 3076,
      name: "El Dorado & Western Lumber NB,EL DORADO ST & WESTERN LUMBER",
      lat: 37.907322,
      lon: -121.275597
   },
   {
      id: 0,
      stopId: 3077,
      name: "Clayton & Harvey WB",
      lat: 37.910995,
      lon: -121.277245
   },
   {
      id: 0,
      stopId: 7026,
      name: "Clayton & Odell WB",
      lat: 37.910281,
      lon: -121.27992
   },
   {
      id: 0,
      stopId: 3079,
      name: "Downing & Mourfield EB,DOWNING AVE & MOURFIELD AVE",
      lat: 37.913892,
      lon: -121.283933
   },
   {
      id: 0,
      stopId: 3080,
      name: "Odell & Horton NB",
      lat: 37.921401,
      lon: -121.284826
   },
   {
      id: 0,
      stopId: 3082,
      name: "Mosswood & El Dorado NB",
      lat: 37.924283,
      lon: -121.281523
   },
   {
      id: 0,
      stopId: 3083,
      name: "El Dorado & Ninth St NB",
      lat: 37.92699,
      lon: -121.28185
   },
   {
      id: 0,
      stopId: 3119,
      name: "8th St & San Joaquin WB",
      lat: 37.929248,
      lon: -121.280954
   },
   {
      id: 0,
      stopId: 3085,
      name: "San Joaquin St & 6th NB",
      lat: 37.932058,
      lon: -121.281378
   },
   {
      id: 0,
      stopId: 3086,
      name: "San Joaquin St & 4th NB",
      lat: 37.934526,
      lon: -121.282033
   },
   {
      id: 0,
      stopId: 3087,
      name: "San Joaquin St & 2nd NB",
      lat: 37.936747,
      lon: -121.282631
   },
   {
      id: 0,
      stopId: 7027,
      name: "San Joaquin St & Clay St NB",
      lat: 37.940493,
      lon: -121.283668
   },
   {
      id: 0,
      stopId: 3088,
      name: "San Joaquin St & Anderson NB",
      lat: 37.943143,
      lon: -121.284383
   },
   {
      id: 0,
      stopId: 3090,
      name: "San Joaquin St & Hazelton NB",
      lat: 37.947491,
      lon: -121.285539
   },
   {
      id: 0,
      stopId: 3091,
      name: "Alvarado & Alpine NB",
      lat: 37.983732,
      lon: -121.289608
   },
   {
      id: 0,
      stopId: 3092,
      name: "Alvarado & Fulton NB",
      lat: 37.985467,
      lon: -121.290332
   },
   {
      id: 0,
      stopId: 3093,
      name: "Fulton @ 517 Fulton WB",
      lat: 37.984782,
      lon: -121.294067
   },
   {
      id: 0,
      stopId: 3094,
      name: "Fulton & Sutter WB",
      lat: 37.984118,
      lon: -121.296698
   },
   {
      id: 0,
      stopId: 3095,
      name: "Essex St & Sutter WB",
      lat: 37.988153,
      lon: -121.298553
   },
   {
      id: 0,
      stopId: 7028,
      name: "Essex St & El Dorado WB",
      lat: 37.98732,
      lon: -121.3019
   },
   {
      id: 0,
      stopId: 3096,
      name: "Jamestown & Shelley EB",
      lat: 37.993757,
      lon: -121.303603
   },
   {
      id: 0,
      stopId: 3100,
      name: "Claremont & Gold Run NB",
      lat: 37.991856,
      lon: -121.30608
   },
   {
      id: 0,
      stopId: 3101,
      name: "Claremont & Pardee NB",
      lat: 37.993525,
      lon: -121.308054
   },
   {
      id: 0,
      stopId: 3448,
      name: "Pacific Ave & Longview Ave SB",
      lat: 38.002996,
      lon: -121.317522
   },
   {
      id: 0,
      stopId: 3840,
      name: "Pacific Ave & Swain NB",
      lat: 38.00489,
      lon: -121.31798
   },
   {
      id: 0,
      stopId: 7067,
      name: "Pacific Ave & Benjamin Holt SB",
      lat: 38.009947,
      lon: -121.320345
   },
   {
      id: 0,
      stopId: 3842,
      name: "Pacific Ave & Lincoln NB",
      lat: 38.01354,
      lon: -121.32145
   },
   {
      id: 0,
      stopId: 3463,
      name: "Ponce De Leon & Lower Sac WB,PONCE DE LEON & LOWER SACRAMENTO RD",
      lat: 38.030031,
      lon: -121.321596
   },
   {
      id: 0,
      stopId: 3456,
      name: "Inglewood Ave & Benjamin Holt NB",
      lat: 38.011785,
      lon: -121.317412
   },
   {
      id: 0,
      stopId: 3459,
      name: "El Dorado & Mission Park NB",
      lat: 38.01945,
      lon: -121.315188
   },
   {
      id: 0,
      stopId: 3461,
      name: "El Dorado & Martinique NB",
      lat: 38.028902,
      lon: -121.316163
   },
   {
      id: 0,
      stopId: 3462,
      name: "Ponce De Leon & Antoino WB,PONCE DE LEON AVE & ANTONIO Way",
      lat: 38.03015,
      lon: -121.319039
   },
   {
      id: 0,
      stopId: 3477,
      name: "Hickock Dr & Pawnee NB",
      lat: 38.0382,
      lon: -121.335917
   },
   {
      id: 0,
      stopId: 3478,
      name: "Hickock Dr & Cheyenne NB",
      lat: 38.040072,
      lon: -121.335013
   },
   {
      id: 0,
      stopId: 3485,
      name: "Davis Rd & Laramie Dr SB",
      lat: 38.038433,
      lon: -121.331975
   },
   {
      id: 0,
      stopId: 3490,
      name: "El Dorado & Glencannon SB",
      lat: 38.026434,
      lon: -121.316388
   },
   {
      id: 0,
      stopId: 3455,
      name: "Inglewood Ave & Glendra Ave NB",
      lat: 38.008449,
      lon: -121.315753
   },
   {
      id: 0,
      stopId: 3512,
      name: "El Dorado & Swain SB",
      lat: 38.006881,
      lon: -121.308528
   },
   {
      id: 0,
      stopId: 3851,
      name: "Pacific Ave & Willora SB",
      lat: 38.015675,
      lon: -121.322571
   },
   {
      id: 0,
      stopId: 3823,
      name: "Pacific Ave & Lincoln Road SB,PACIFIC AVE & LINCOLN RD",
      lat: 38.01348,
      lon: -121.32177
   },
   {
      id: 0,
      stopId: 7065,
      name: "Pacific Ave & Benjamin Holt NB",
      lat: 38.011366,
      lon: -121.320595
   },
   {
      id: 0,
      stopId: 3884,
      name: "Pacific Ave & Douglas SB",
      lat: 38.008251,
      lon: -121.319512
   },
   {
      id: 0,
      stopId: 3885,
      name: "Pacific Ave & Swain SB",
      lat: 38.00478,
      lon: -121.31829
   },
   {
      id: 0,
      stopId: 3104,
      name: "El Dorado & Jamestown SB",
      lat: 37.992562,
      lon: -121.304516
   },
   {
      id: 0,
      stopId: 3106,
      name: "Sutter & Fulton SB",
      lat: 37.984509,
      lon: -121.296907
   },
   {
      id: 0,
      stopId: 3107,
      name: "Fulton @ 571 Fulton EB",
      lat: 37.984658,
      lon: -121.294308
   },
   {
      id: 0,
      stopId: 3108,
      name: "Fulton & Stanislaus EB",
      lat: 37.9852,
      lon: -121.292162
   },
   {
      id: 0,
      stopId: 3109,
      name: "Alvarado & Oak Park SB",
      lat: 37.984553,
      lon: -121.290062
   },
   {
      id: 0,
      stopId: 3110,
      name: "Alvarado & Alpine SB",
      lat: 37.983352,
      lon: -121.289573
   },
   {
      id: 0,
      stopId: 3111,
      name: "California St & Walnut SB",
      lat: 37.96984,
      lon: -121.28914
   },
   {
      id: 0,
      stopId: 3112,
      name: "San Joaquin St & Lafayette SB",
      lat: 37.95037,
      lon: -121.28658
   },
   {
      id: 0,
      stopId: 3113,
      name: "San Joaquin St & Hazelton SB",
      lat: 37.94756,
      lon: -121.28579
   },
   {
      id: 0,
      stopId: 7029,
      name: "San Joaquin St & Taylor St NB",
      lat: 37.945007,
      lon: -121.284897
   },
   {
      id: 0,
      stopId: 3114,
      name: "San Joaquin St & Anderson SB",
      lat: 37.943415,
      lon: -121.28464
   },
   {
      id: 0,
      stopId: 3115,
      name: "San Joaquin St & Jackson SB",
      lat: 37.940883,
      lon: -121.283953
   },
   {
      id: 0,
      stopId: 7033,
      name: "San Joaquin St & MLK Blvd Sb.",
      lat: 37.939127,
      lon: -121.283465
   },
   {
      id: 0,
      stopId: 3116,
      name: "San Joaquin St & 2nd SB",
      lat: 37.936953,
      lon: -121.282847
   },
   {
      id: 0,
      stopId: 3117,
      name: "San Joaquin St & 4th SB",
      lat: 37.934142,
      lon: -121.28206
   },
   {
      id: 0,
      stopId: 3118,
      name: "San Joaquin St & 6th SB",
      lat: 37.931982,
      lon: -121.281502
   },
   {
      id: 0,
      stopId: 3120,
      name: "El Dorado & 9th SB",
      lat: 37.92727,
      lon: -121.28213
   },
   {
      id: 0,
      stopId: 3121,
      name: "El Dorado & Mosswood SB",
      lat: 37.924771,
      lon: -121.281236
   },
   {
      id: 0,
      stopId: 3122,
      name: "Mosswood & Commerce EB",
      lat: 37.924027,
      lon: -121.282772
   },
   {
      id: 0,
      stopId: 3123,
      name: "Odell & Mosswood SB",
      lat: 37.923163,
      lon: -121.28554
   },
   {
      id: 0,
      stopId: 3124,
      name: "Odell & Horton SB",
      lat: 37.920739,
      lon: -121.284557
   },
   {
      id: 0,
      stopId: 3125,
      name: "Odell & Ivy SB",
      lat: 37.917872,
      lon: -121.283367
   },
   {
      id: 0,
      stopId: 7034,
      name: "Clayton & Odell EB",
      lat: 37.910166,
      lon: -121.279981
   },
   {
      id: 0,
      stopId: 3130,
      name: "El Dorado & French Camp SB",
      lat: 37.890754,
      lon: -121.276473
   },
   {
      id: 0,
      stopId: 3131,
      name: "Hospital Rd & El Dorado St WB",
      lat: 37.885884,
      lon: -121.277148
   },
   {
      id: 0,
      stopId: 3869,
      name: "Carolyn Weston & E.W.S. Woods WB,CAROLYN WESTON BLVD & E.W.S. WOODS BLVD",
      lat: 37.911649,
      lon: -121.305656
   },
   {
      id: 0,
      stopId: 3855,
      name: "Church St & San Jose St EB",
      lat: 37.945161,
      lon: -121.303904
   },
   {
      id: 0,
      stopId: 7037,
      name: "Lincoln St & Weber NB,LINCOLN ST & WEBER AVE",
      lat: 37.951764,
      lon: -121.297627
   },
   {
      id: 0,
      stopId: 3698,
      name: "Market & Airport Way EB,MARKET ST & AIRPORT Way",
      lat: 37.954374,
      lon: -121.273603
   },
   {
      id: 0,
      stopId: 3699,
      name: "Market & Della EB",
      lat: 37.955188,
      lon: -121.268845
   },
   {
      id: 0,
      stopId: 3700,
      name: "Main & Laurel EB,MAIN ST & LAUREL ST",
      lat: 37.955322,
      lon: -121.262582
   },
   {
      id: 0,
      stopId: 3701,
      name: "Main & So Court EB",
      lat: 37.955166,
      lon: -121.259558
   },
   {
      id: 0,
      stopId: 3702,
      name: "Main & Marsh EB",
      lat: 37.955056,
      lon: -121.257318
   },
   {
      id: 0,
      stopId: 3704,
      name: "Main & Golden Gate EB",
      lat: 37.954372,
      lon: -121.244129
   },
   {
      id: 0,
      stopId: 3705,
      name: "Main & Netherton EB",
      lat: 37.954292,
      lon: -121.242383
   },
   {
      id: 0,
      stopId: 3706,
      name: "Main & Anteros EB",
      lat: 37.954025,
      lon: -121.23725
   },
   {
      id: 0,
      stopId: 3707,
      name: "Oro & Horner NB",
      lat: 37.957611,
      lon: -121.235774
   },
   {
      id: 0,
      stopId: 3708,
      name: "Oro & Washington NB",
      lat: 37.962275,
      lon: -121.237571
   },
   {
      id: 0,
      stopId: 3684,
      name: "Main & Netherton WB",
      lat: 37.95444,
      lon: -121.242115
   },
   {
      id: 0,
      stopId: 3685,
      name: "Main & Golden Gate WB",
      lat: 37.954577,
      lon: -121.244971
   },
   {
      id: 0,
      stopId: 7149,
      name: "Main & Filbert WB",
      lat: 37.954937,
      lon: -121.25227
   },
   {
      id: 0,
      stopId: 3687,
      name: "Main & E Street WB",
      lat: 37.955187,
      lon: -121.257029
   },
   {
      id: 0,
      stopId: 3689,
      name: "Main & Lafayette WB",
      lat: 37.955387,
      lon: -121.261158
   },
   {
      id: 0,
      stopId: 3690,
      name: "Main & Della WB",
      lat: 37.955764,
      lon: -121.26855
   },
   {
      id: 0,
      stopId: 3691,
      name: "Main & Sierra Nevada WB",
      lat: 37.955582,
      lon: -121.272885
   },
   {
      id: 0,
      stopId: 3861,
      name: "Weber & Tuleburg Ave Wb",
      lat: 37.952927,
      lon: -121.2951
   },
   {
      id: 0,
      stopId: 3863,
      name: "Church St & San Jose St WB",
      lat: 37.945292,
      lon: -121.303561
   },
   {
      id: 0,
      stopId: 3854,
      name: "Church St & Pershing EB,CHURCH ST & PERSHING AVE",
      lat: 37.944965,
      lon: -121.307765
   },
   {
      id: 0,
      stopId: 7248,
      name: "Los Angeles & Sonora SB",
      lat: 37.943064,
      lon: -121.314774
   },
   {
      id: 0,
      stopId: 3608,
      name: "Stanislaus & Weber SB",
      lat: 37.954832,
      lon: -121.282284
   },
   {
      id: 0,
      stopId: 7042,
      name: "Country Club Blvd & Pershing WB",
      lat: 37.96945,
      lon: -121.3155
   },
   {
      id: 0,
      stopId: 3339,
      name: "Wilson Way & Park (Eastland Plz.) NB",
      lat: 37.963128,
      lon: -121.273471
   },
   {
      id: 0,
      stopId: 3340,
      name: "Wilson Way & Poplar St NB",
      lat: 37.964545,
      lon: -121.273876
   },
   {
      id: 0,
      stopId: 3341,
      name: "Wilson Way & Roosevelt St NB",
      lat: 37.967161,
      lon: -121.274542
   },
   {
      id: 0,
      stopId: 7088,
      name: "Wilson Way & Harding Way NB",
      lat: 37.971237,
      lon: -121.275664
   },
   {
      id: 0,
      stopId: 3345,
      name: "Funston Ave & Orwood St NB",
      lat: 37.976442,
      lon: -121.273658
   },
   {
      id: 0,
      stopId: 3346,
      name: "Funston Ave & Sanguinetti Ln EB",
      lat: 37.981371,
      lon: -121.270873
   },
   {
      id: 0,
      stopId: 3349,
      name: "Filbert St & Waterloo SB",
      lat: 37.97635,
      lon: -121.261253
   },
   {
      id: 0,
      stopId: 3351,
      name: "Golden Gate & John St NB",
      lat: 37.977001,
      lon: -121.255247
   },
   {
      id: 0,
      stopId: 3352,
      name: "Waterloo Rd & Sunset Ave WB",
      lat: 37.978837,
      lon: -121.259203
   },
   {
      id: 0,
      stopId: 3365,
      name: "Funston Ave & Orwood SB",
      lat: 37.976926,
      lon: -121.273524
   },
   {
      id: 0,
      stopId: 3344,
      name: "Funston Ave & Bradford St NB",
      lat: 37.974534,
      lon: -121.27446
   },
   {
      id: 0,
      stopId: 3343,
      name: "Bradford St & Wilson EB",
      lat: 37.97387,
      lon: -121.27579
   },
   {
      id: 0,
      stopId: 7097,
      name: "Wilson Way & Harding SB",
      lat: 37.970607,
      lon: -121.275602
   },
   {
      id: 0,
      stopId: 3367,
      name: "Wilson Way & Acacia SB",
      lat: 37.965528,
      lon: -121.274268
   },
   {
      id: 0,
      stopId: 3368,
      name: "Wilson Way & Oak SB",
      lat: 37.961928,
      lon: -121.273309
   },
   {
      id: 0,
      stopId: 3338,
      name: "Stanislaus & Miner NB",
      lat: 37.95686,
      lon: -121.28263
   },
   {
      id: 0,
      stopId: 7054,
      name: "Country Club Blvd & Pershing EB",
      lat: 37.96922,
      lon: -121.3157
   },
   {
      id: 0,
      stopId: 7128,
      name: "8th St & B Street EB",
      lat: 37.933943,
      lon: -121.254904
   },
   {
      id: 0,
      stopId: 3550,
      name: "Stanislaus & Lafayette NB",
      lat: 37.95103,
      lon: -121.28106
   },
   {
      id: 0,
      stopId: 3552,
      name: "Stanislaus & Main NB",
      lat: 37.953718,
      lon: -121.281797
   },
   {
      id: 0,
      stopId: 3555,
      name: "El Dorado & Fremont NB",
      lat: 37.95775,
      lon: -121.291091
   },
   {
      id: 0,
      stopId: 3570,
      name: "El Dorado & Lincoln NB",
      lat: 38.016719,
      lon: -121.312244
   },
   {
      id: 0,
      stopId: 4031,
      name: "Hammer Ln & Lan Ark Dr WB",
      lat: 38.021039,
      lon: -121.309852
   },
   {
      id: 0,
      stopId: 3574,
      name: "Knickerbocker & Palisades EB",
      lat: 38.023242,
      lon: -121.298376
   },
   {
      id: 0,
      stopId: 3589,
      name: "West Lane @ Christian Center Nb",
      lat: 38.029987,
      lon: -121.29529
   },
   {
      id: 0,
      stopId: 7133,
      name: "Prospector & Tamoshanter WB,PROSPECTOR DR & TAM O'Shanter DR",
      lat: 38.032162,
      lon: -121.300408
   },
   {
      id: 0,
      stopId: 4030,
      name: "Hammer Ln & Tam O`Shanter WB",
      lat: 38.020956,
      lon: -121.300573
   },
   {
      id: 0,
      stopId: 3572,
      name: "Iris Ave & Lan Ark EB",
      lat: 38.021933,
      lon: -121.309635
   },
   {
      id: 0,
      stopId: 3610,
      name: "Stanislaus & Lafayette SB",
      lat: 37.950854,
      lon: -121.281195
   },
   {
      id: 0,
      stopId: 3611,
      name: "Stanislaus & Worth SB",
      lat: 37.94518,
      lon: -121.27967
   },
   {
      id: 0,
      stopId: 7135,
      name: "Ralph & Airport EB,RALPH AVE & AIRPORT Way",
      lat: 37.920206,
      lon: -121.261321
   },
   {
      id: 0,
      stopId: 3619,
      name: "B & Ralph NB",
      lat: 37.9233,
      lon: -121.25103
   },
   {
      id: 0,
      stopId: 3406,
      name: "8th St & Laguna Circle EB",
      lat: 37.926561,
      lon: -121.306527
   },
   {
      id: 0,
      stopId: 7015,
      name: "Manthey & 8th NB",
      lat: 37.925507,
      lon: -121.295463
   },
   {
      id: 0,
      stopId: 3134,
      name: "8th St & Harrison EB",
      lat: 37.927249,
      lon: -121.291931
   },
   {
      id: 0,
      stopId: 3135,
      name: "Lincoln St & 7th NB",
      lat: 37.928526,
      lon: -121.290379
   },
   {
      id: 0,
      stopId: 3136,
      name: "Lincoln St & Kohler NB",
      lat: 37.930922,
      lon: -121.291678
   },
   {
      id: 0,
      stopId: 3137,
      name: "Lincoln St & 4th NB",
      lat: 37.932163,
      lon: -121.292086
   },
   {
      id: 0,
      stopId: 3138,
      name: "Lincoln St & French Camp Tpk NB",
      lat: 37.934574,
      lon: -121.292908
   },
   {
      id: 0,
      stopId: 7035,
      name: "Lincoln St & Charter NB",
      lat: 37.937813,
      lon: -121.293825
   },
   {
      id: 0,
      stopId: 3139,
      name: "Lincoln St & Jackson NB",
      lat: 37.939416,
      lon: -121.294277
   },
   {
      id: 0,
      stopId: 3411,
      name: "Pacific Ave & Robinhood Dr NB",
      lat: 38.00042,
      lon: -121.31613
   },
   {
      id: 0,
      stopId: 7106,
      name: "Swain Rd & Pershing WB,SWAIN & PERSHING WB",
      lat: 38.00221,
      lon: -121.32811
   },
   {
      id: 0,
      stopId: 3767,
      name: "Pershing Ave & Buckingham NB,PERSHING & BUCKINGHAM NB",
      lat: 37.999975,
      lon: -121.326013
   },
   {
      id: 0,
      stopId: 3502,
      name: "Swain Rd & Halleck WB",
      lat: 38.000541,
      lon: -121.355172
   },
   {
      id: 0,
      stopId: 3503,
      name: "Cumberland & Swain NB",
      lat: 37.999984,
      lon: -121.358151
   },
   {
      id: 0,
      stopId: 3504,
      name: "Cumberland & S. Monitor Cir NB,CUMBERLAND PL & MONITOR CI S",
      lat: 38.001327,
      lon: -121.359537
   },
   {
      id: 0,
      stopId: 3505,
      name: "Cumberland & Harpers Ferry NB",
      lat: 38.003382,
      lon: -121.360989
   },
   {
      id: 0,
      stopId: 3449,
      name: "Mill Springs & Cumberland EB",
      lat: 38.008335,
      lon: -121.362852
   },
   {
      id: 0,
      stopId: 3452,
      name: "Ben Holt Dr & Grigsby EB,BENJAMIN HOLT & GRIGSBY EB",
      lat: 38.00477,
      lon: -121.353188
   },
   {
      id: 0,
      stopId: 3789,
      name: "Meadow & Parkwoods SB,Meadow & Parkwoods SB & PARKWOODS DR",
      lat: 38.016904,
      lon: -121.341763
   },
   {
      id: 0,
      stopId: 3790,
      name: "Meadow & Alexandria SB",
      lat: 38.016125,
      lon: -121.339583
   },
   {
      id: 0,
      stopId: 3791,
      name: "Meadow & Larkspur SB",
      lat: 38.015952,
      lon: -121.335715
   },
   {
      id: 0,
      stopId: 3792,
      name: "Meadow & Brentwood SB",
      lat: 38.015983,
      lon: -121.332126
   },
   {
      id: 0,
      stopId: 3793,
      name: "Pershing & Lincoln Road SB",
      lat: 38.013912,
      lon: -121.329988
   },
   {
      id: 0,
      stopId: 3155,
      name: "Lincoln St & Jackson SB",
      lat: 37.939697,
      lon: -121.294505
   },
   {
      id: 0,
      stopId: 7039,
      name: "Lincoln St & Charter SB",
      lat: 37.937217,
      lon: -121.293849
   },
   {
      id: 0,
      stopId: 3156,
      name: "Lincoln St & French Camp SB,LINCOLN ST & FRENCH CAMP RD",
      lat: 37.934441,
      lon: -121.293055
   },
   {
      id: 0,
      stopId: 3158,
      name: "Lincoln St & Kohler SB",
      lat: 37.931313,
      lon: -121.29192
   },
   {
      id: 0,
      stopId: 3159,
      name: "Lincoln St & 8th SB",
      lat: 37.928008,
      lon: -121.290326
   },
   {
      id: 0,
      stopId: 3160,
      name: "8th St & French Camp WB",
      lat: 37.927188,
      lon: -121.292657
   },
   {
      id: 0,
      stopId: 3161,
      name: "Lever Blvd & Colorado SB",
      lat: 37.92411,
      lon: -121.29866
   },
   {
      id: 0,
      stopId: 3164,
      name: "Chicago Ave & Alabama EB",
      lat: 37.92364,
      lon: -121.294617
   },
   {
      id: 0,
      stopId: 3407,
      name: "8th St & Argonaut St EB",
      lat: 37.926656,
      lon: -121.302922
   },
   {
      id: 0,
      stopId: 3350,
      name: "Harding Way & Rhode Island EB,HARDING Way & RHODE ISLAND AVE",
      lat: 37.974276,
      lon: -121.257637
   },
   {
      id: 0,
      stopId: 3827,
      name: "Waterloo & Sycamore EB",
      lat: 37.969269,
      lon: -121.270775
   },
   {
      id: 0,
      stopId: 7072,
      name: "Feather River & March Lane SB",
      lat: 37.985668,
      lon: -121.347589
   },
   {
      id: 0,
      stopId: 4052,
      name: "Pershing Ave & Marco Polo SB",
      lat: 37.99219,
      lon: -121.323281
   },
   {
      id: 0,
      stopId: 4051,
      name: "Pershing Ave & Venetian SB,PERSHING AVE & VENETIAN DR",
      lat: 37.995648,
      lon: -121.324585
   },
   {
      id: 0,
      stopId: 7166,
      name: "Hammer Ln & West Lane Frontage EB",
      lat: 38.020747,
      lon: -121.292165
   },
   {
      id: 0,
      stopId: 7077,
      name: "Hammertown @ Kaiser Ent WB,HAMMERTOWN DR & KAISER ENTRANCE",
      lat: 38.016645,
      lon: -121.297117
   },
   {
      id: 0,
      stopId: 7080,
      name: "West Lane & March Lane SB",
      lat: 38.001072,
      lon: -121.290504
   },
   {
      id: 0,
      stopId: 3330,
      name: "Bianchi Rd & Dorset WB",
      lat: 37.99453,
      lon: -121.29865
   },
   {
      id: 0,
      stopId: 7168,
      name: "Hammer Ln & West Lane WB",
      lat: 38.021116,
      lon: -121.295424
   },
   {
      id: 0,
      stopId: 7167,
      name: "Hammer Ln & Lorraine Ave WB",
      lat: 38.021179,
      lon: -121.282491
   },
   {
      id: 0,
      stopId: 3738,
      name: "Don Ave & Waudman NB",
      lat: 38.029736,
      lon: -121.345439
   },
   {
      id: 0,
      stopId: 3739,
      name: "Don Ave & Shropshire NB",
      lat: 38.032399,
      lon: -121.345467
   },
   {
      id: 0,
      stopId: 3759,
      name: "Wagner Heights & Don WB",
      lat: 38.033793,
      lon: -121.346467
   },
   {
      id: 0,
      stopId: 3760,
      name: "Wagner Heights & Blue Fox Wb",
      lat: 38.032492,
      lon: -121.350285
   },
   {
      id: 0,
      stopId: 3761,
      name: "Bainbridge & Wagner Heights Nb,BAINBRIDGE PL & WAGNER HEIGHTS RD",
      lat: 38.032205,
      lon: -121.35558
   },
   {
      id: 0,
      stopId: 3763,
      name: "Stanfield & Bismark WB",
      lat: 38.034962,
      lon: -121.358931
   },
   {
      id: 0,
      stopId: 3764,
      name: "Stanfield & Kelley WB",
      lat: 38.034074,
      lon: -121.363818
   },
   {
      id: 0,
      stopId: 3765,
      name: "Salters & Bancroft EB",
      lat: 38.036849,
      lon: -121.363661
   },
   {
      id: 0,
      stopId: 3776,
      name: "Otto & Bismark EB",
      lat: 38.037648,
      lon: -121.35905
   },
   {
      id: 0,
      stopId: 3777,
      name: "Otto & Ramsey EB",
      lat: 38.038152,
      lon: -121.353772
   },
   {
      id: 0,
      stopId: 3778,
      name: "Otto & Kardigan EB",
      lat: 38.037755,
      lon: -121.351083
   },
   {
      id: 0,
      stopId: 3779,
      name: "Otto & Brisbane EB",
      lat: 38.037626,
      lon: -121.348569
   },
   {
      id: 0,
      stopId: 3782,
      name: "Lenox & Stanfield SB",
      lat: 38.036465,
      lon: -121.344967
   },
   {
      id: 0,
      stopId: 3783,
      name: "Branstetter & Burlington SB",
      lat: 38.036061,
      lon: -121.346833
   },
   {
      id: 0,
      stopId: 7009,
      name: "Pacific Ave & Yokuts Arrive NB",
      lat: 37.996681,
      lon: -121.314823
   },
   {
      id: 0,
      stopId: 7100,
      name: "MLK Blvd & California St WB",
      lat: 37.93989,
      lon: -121.281212
   },
   {
      id: 0,
      stopId: 7138,
      name: "Section & Oro (Woody's) EB",
      lat: 37.9487,
      lon: -121.232419
   },
   {
      id: 0,
      stopId: 3640,
      name: "Section & Sinclair EB,SECTION AVE & SINCLAIR AVE",
      lat: 37.948652,
      lon: -121.228536
   },
   {
      id: 0,
      stopId: 7139,
      name: "Sinclair & 6th SB",
      lat: 37.944457,
      lon: -121.226707
   },
   {
      id: 0,
      stopId: 3643,
      name: "Farmington & Mission Valley Ln WB",
      lat: 37.939318,
      lon: -121.238994
   },
   {
      id: 0,
      stopId: 7140,
      name: "8th St & Nightingale WB",
      lat: 37.937157,
      lon: -121.244114
   },
   {
      id: 0,
      stopId: 7786,
      name: "8th St & B Street WB",
      lat: 37.933858,
      lon: -121.255788
   },
   {
      id: 0,
      stopId: 3649,
      name: "B & 6th NB",
      lat: 37.937143,
      lon: -121.256651
   },
   {
      id: 0,
      stopId: 3650,
      name: "B & 4th NB",
      lat: 37.93962,
      lon: -121.25762
   },
   {
      id: 0,
      stopId: 3651,
      name: "B & MLK Blvd NB",
      lat: 37.943124,
      lon: -121.259101
   },
   {
      id: 0,
      stopId: 3652,
      name: "Wilson Way & Anderson NB",
      lat: 37.94574,
      lon: -121.26871
   },
   {
      id: 0,
      stopId: 3657,
      name: "Acacia & Madison WB",
      lat: 37.96191,
      lon: -121.2969
   },
   {
      id: 0,
      stopId: 7143,
      name: "Acacia & Lincoln EB",
      lat: 37.961278,
      lon: -121.30003
   },
   {
      id: 0,
      stopId: 3659,
      name: "Acacia & Stockton WB",
      lat: 37.960415,
      lon: -121.305806
   },
   {
      id: 0,
      stopId: 3661,
      name: "Pershing Ave & Country Club NB",
      lat: 37.969664,
      lon: -121.315089
   },
   {
      id: 0,
      stopId: 7051,
      name: "Pershing Ave & Alpine SB",
      lat: 37.975555,
      lon: -121.317693
   },
   {
      id: 0,
      stopId: 3663,
      name: "Pershing Ave & Monaco St NB",
      lat: 37.987885,
      lon: -121.321318
   },
   {
      id: 0,
      stopId: 3662,
      name: "Pershing Ave & Rosemarie NB",
      lat: 37.98645,
      lon: -121.32058
   },
   {
      id: 0,
      stopId: 3415,
      name: "Swain Rd & Exit St WB",
      lat: 38.001607,
      lon: -121.330462
   },
   {
      id: 0,
      stopId: 3416,
      name: "Swain Rd & Alexandria Pl WB",
      lat: 38.000106,
      lon: -121.337007
   },
   {
      id: 0,
      stopId: 3422,
      name: "Plymouth Rd & Bridgeport Cir NB",
      lat: 38.011972,
      lon: -121.352486
   },
   {
      id: 0,
      stopId: 3423,
      name: "Plymouth Dr & Kelley Dr NB",
      lat: 38.014503,
      lon: -121.352379
   },
   {
      id: 0,
      stopId: 3425,
      name: "Kelley Dr & Hillview Ave NB",
      lat: 38.017823,
      lon: -121.354995
   },
   {
      id: 0,
      stopId: 7162,
      name: "Mariners & Hammer Lane Arr NB",
      lat: 38.020628,
      lon: -121.36136
   },
   {
      id: 0,
      stopId: 7107,
      name: "Kelley Dr & Hammer Lane NB,KELLEY & HAMMER LANE NB",
      lat: 38.02084,
      lon: -121.35604
   },
   {
      id: 0,
      stopId: 3424,
      name: "Kelley Dr & Warwick Ct NB",
      lat: 38.01573,
      lon: -121.354262
   },
   {
      id: 0,
      stopId: 3417,
      name: "Swain Rd & Porter Way WB",
      lat: 38.000066,
      lon: -121.345092
   },
   {
      id: 0,
      stopId: 3664,
      name: "Pershing Ave & March Lane SB",
      lat: 37.988128,
      lon: -121.32165
   },
   {
      id: 0,
      stopId: 3666,
      name: "Pershing Ave & Rose SB",
      lat: 37.96078,
      lon: -121.312571
   },
   {
      id: 0,
      stopId: 3667,
      name: "Acacia & Yosemite EB",
      lat: 37.960187,
      lon: -121.306556
   },
   {
      id: 0,
      stopId: 7142,
      name: "Acacia & Lincoln WB",
      lat: 37.961291,
      lon: -121.300519
   },
   {
      id: 0,
      stopId: 3670,
      name: "Acacia & Madison EB",
      lat: 37.96184,
      lon: -121.29664
   },
   {
      id: 0,
      stopId: 3674,
      name: "Wilson Way & Anderson SB",
      lat: 37.94553,
      lon: -121.26889
   },
   {
      id: 0,
      stopId: 3675,
      name: "B & MLK Blvd SB",
      lat: 37.943292,
      lon: -121.259287
   },
   {
      id: 0,
      stopId: 3676,
      name: "B & 4th SB",
      lat: 37.93912,
      lon: -121.25763
   },
   {
      id: 0,
      stopId: 3677,
      name: "B & 6th SB",
      lat: 37.936892,
      lon: -121.256626
   },

   {
      id: 0,
      stopId: 3679,
      name: "Farmington & Madrid EB",
      lat: 37.939096,
      lon: -121.239452
   },

   {
      id: 0,
      stopId: 3682,
      name: "Olive & 4th NB",
      lat: 37.944719,
      lon: -121.231588
   },

   {
      id: 0,
      stopId: 7023,
      name: "Mathews Rd & Canilis Blvd",
      lat: 37.882609,
      lon: -121.297324
   },

   {
      id: 0,
      stopId: 3799,
      name: "Louise Ave & Harlan Rd EB",
      lat: 37.81167,
      lon: -121.29048
   },

   {
      id: 0,
      stopId: 3800,
      name: "Lathrop Rd & Harlan Rd WB",
      lat: 37.826434,
      lon: -121.287419
   },

   {
      id: 0,
      stopId: 7206,
      name: "Ham & Lodi SB",
      lat: 38.12958,
      lon: -121.288392
   },

   {
      id: 0,
      stopId: 7204,
      name: "Ham & Lodi NB",
      lat: 38.128849,
      lon: -121.2882
   },

   {
      id: 0,
      stopId: 3846,
      name: "Ham & Kettleman NB",
      lat: 38.116605,
      lon: -121.288047
   },

   {
      id: 0,
      stopId: 3809,
      name: "Louise Ave & Harlan Rd WB",
      lat: 37.81191,
      lon: -121.29101
   },

   {
      id: 0,
      stopId: 7205,
      name: "Lodi Transit Station WB",
      lat: 38.132793,
      lon: -121.271754
   },

   {
      id: 0,
      stopId: 7020,
      name: "California St & Walnut NB",
      lat: 37.96991,
      lon: -121.28886
   },

   {
      id: 0,
      stopId: 7325,
      name: "West Lane & Stadium SB",
      lat: 37.985625,
      lon: -121.284589
   },

   {
      id: 0,
      stopId: 7944,
      name: "Dublin/Pleasanton Bart,OWENS DR",
      lat: 37.70283,
      lon: -121.897856
   },

   {
      id: 0,
      stopId: 9904,
      name: "Sampson & Hammer SB",
      lat: 38.020094,
      lon: -121.267878
   },

   {
      id: 0,
      stopId: 9906,
      name: "Q St & 5th St",
      lat: 38.574207,
      lon: -121.503173
   },

   {
      id: 0,
      stopId: 9926,
      name: "8th St & K Street",
      lat: 38.580062,
      lon: -121.496439
   },

   {
      id: 0,
      stopId: 9923,
      name: "Calvary First Church,KELLEY DR",
      lat: 38.025089,
      lon: -121.358977
   },

   {
      id: 0,
      stopId: 9925,
      name: "8th St & O Street",
      lat: 38.575756,
      lon: -121.498336
   },

   {
      id: 0,
      stopId: 7199,
      name: "Manteca Wal-Mart Arr",
      lat: 37.788009,
      lon: -121.215862
   },

   {
      id: 0,
      stopId: 7111,
      name: "Cumberland & Ben Holt NB",
      lat: 38.006243,
      lon: -121.362757
   },

   {
      id: 0,
      stopId: 7207,
      name: "Kettleman & Tienda SB",
      lat: 38.115633,
      lon: -121.30343
   },

   {
      id: 0,
      stopId: 7048,
      name: "Davinci Dr & March NB",
      lat: 37.984549,
      lon: -121.339858
   },

   {
      id: 0,
      stopId: 7081,
      name: "West Lane & Bianchi NB",
      lat: 37.998308,
      lon: -121.289031
   },

   {
      id: 0,
      stopId: 7084,
      name: "Lorraine Ave & Hammer SB",
      lat: 38.020584,
      lon: -121.283384
   },

   {
      id: 0,
      stopId: 7221,
      name: "S. Main & Industrial Park Dr NB",
      lat: 37.788035,
      lon: -121.215873
   },

   {
      id: 0,
      stopId: 7043,
      name: "Michigan Ave & Kirk St EB,MICHIGAN AVE & KIRK ST",
      lat: 37.965685,
      lon: -121.342961
   },

   {
      id: 0,
      stopId: 9905,
      name: "Lodi P&R",
      lat: 38.136761,
      lon: -121.259247
   },

   {
      id: 0,
      stopId: 3358,
      name: "Fremont St & Filbert St WB",
      lat: 37.965418,
      lon: -121.256608
   },

   {
      id: 0,
      stopId: 7087,
      name: "Wilson Way & Lindsay NB",
      lat: 37.959669,
      lon: -121.272701
   },

   {
      id: 0,
      stopId: 3147,
      name: "Weber & Van Buren EB,WEBER AVE & VAN BUREN ST",
      lat: 37.952581,
      lon: -121.296335
   },

   {
      id: 0,
      stopId: 3148,
      name: "Weber & Commerce EB",
      lat: 37.95315,
      lon: -121.293012
   },

   {
      id: 0,
      stopId: 7161,
      name: "Weber @ Courthouse EB",
      lat: 37.953865,
      lon: -121.288993
   },

   {
      id: 0,
      stopId: 7152,
      name: "Washington St & Cardinal EB",
      lat: 37.966307,
      lon: -121.223192
   },

   {
      id: 0,
      stopId: 3717,
      name: "8th St & Pock Lane EB,8TH ST & POCK LN",
      lat: 37.935913,
      lon: -121.247315
   },

   {
      id: 0,
      stopId: 7151,
      name: "Oro & Main NB",
      lat: 37.954964,
      lon: -121.234633
   },

   {
      id: 0,
      stopId: 7090,
      name: "Waterloo Rd & Golden Gate WB",
      lat: 37.980037,
      lon: -121.257356
   },

   {
      id: 0,
      stopId: 7047,
      name: "Rosemarie Ln & McGaw WB",
      lat: 37.985463,
      lon: -121.32567
   },

   {
      id: 0,
      stopId: 7148,
      name: "Main & Gertrude WB",
      lat: 37.954377,
      lon: -121.232921
   },

   {
      id: 0,
      stopId: 7046,
      name: "Pershing Ave & Larry Heller NB",
      lat: 37.975846,
      lon: -121.317504
   },

   {
      id: 0,
      stopId: 7102,
      name: "Stockton St & Charter Way NB",
      lat: 37.935712,
      lon: -121.29984
   },

   {
      id: 0,
      stopId: 7141,
      name: "Wilson Way & Jackson NB",
      lat: 37.94383,
      lon: -121.26819
   },

   {
      id: 0,
      stopId: 7004,
      name: "Miner Ave & Wilson EB",
      lat: 37.958647,
      lon: -121.272627
   },

   {
      id: 0,
      stopId: 7183,
      name: "Otto & Estate Dr EB,OTTO DR & ESTATE DR",
      lat: 38.03753,
      lon: -121.36331
   },

   {
      id: 0,
      stopId: 7082,
      name: "Hammer Ln & Lorraine EB",
      lat: 38.020888,
      lon: -121.282744
   },

   {
      id: 0,
      stopId: 7001,
      name: "Miner Ave & Sierra Nevada WB",
      lat: 37.958592,
      lon: -121.274044
   },

   {
      id: 0,
      stopId: 4043,
      name: "Royal Oaks Dr & Royal Park Ln EB",
      lat: 38.036785,
      lon: -121.330088
   },

   {
      id: 0,
      stopId: 7217,
      name: "Main & Louise SB",
      lat: 37.811617,
      lon: -121.217191
   },

   {
      id: 0,
      stopId: 7189,
      name: "East St & 10th St NB",
      lat: 37.73891,
      lon: -121.42102
   },

   {
      id: 0,
      stopId: 3342,
      name: "Wilson Way & Pinchot St NB",
      lat: 37.968833,
      lon: -121.275046
   },

   {
      id: 0,
      stopId: 3548,
      name: "Stanislaus & Jackson NB",
      lat: 37.942384,
      lon: -121.278723
   },

   {
      id: 0,
      stopId: 3549,
      name: "Stanislaus & Worth NB",
      lat: 37.94526,
      lon: -121.27947
   },

   {
      id: 0,
      stopId: 3347,
      name: "Sanguinetti Ln & Wilson Way NB",
      lat: 37.983098,
      lon: -121.271121
   },

   {
      id: 0,
      stopId: 3348,
      name: "Wilson Way & E St NB",
      lat: 37.985271,
      lon: -121.270055
   },

   {
      id: 0,
      stopId: 3366,
      name: "Bradford St & Wilson WB",
      lat: 37.97402,
      lon: -121.27574
   },

   {
      id: 0,
      stopId: 3571,
      name: "Iris Ave & Hammer Village EB",
      lat: 38.022592,
      lon: -121.312672
   },

   {
      id: 0,
      stopId: 3575,
      name: "Knickerbocker & New York EB,KNICKERBOCK DR & NEW YORK DR",
      lat: 38.024152,
      lon: -121.296113
   },

   {
      id: 0,
      stopId: 3590,
      name: "Prospector & West Lane Frontage Wb",
      lat: 38.032199,
      lon: -121.295512
   },

   {
      id: 0,
      stopId: 3591,
      name: "Tam O'Shanter Dr & Likala SB",
      lat: 38.030112,
      lon: -121.300641
   },

   {
      id: 0,
      stopId: 3592,
      name: "Tam O'Shanter Dr & Erie SB",
      lat: 38.025404,
      lon: -121.300622
   },

   {
      id: 0,
      stopId: 3612,
      name: "Stanislaus & Jackson SB",
      lat: 37.941952,
      lon: -121.278791
   },

   {
      id: 0,
      stopId: 7615,
      name: "Airport Way & 8th SB",
      lat: 37.931421,
      lon: -121.267058
   },

   {
      id: 0,
      stopId: 7203,
      name: "Kettleman & Tienda NB",
      lat: 38.115373,
      lon: -121.302391
   },

   {
      id: 0,
      stopId: 7737,
      name: "Lincoln St & Weber Ave SB",
      lat: 37.952086,
      lon: -121.297877
   },

   {
      id: 0,
      stopId: 3864,
      name: "Church St & Pershing Ave WB",
      lat: 37.944964,
      lon: -121.308073
   },

   {
      id: 0,
      stopId: 3585,
      name: "West Lane & West Ln Front Rd Sb",
      lat: 38.029401,
      lon: -121.295108
   },

   {
      id: 0,
      stopId: 3634,
      name: "West Lane & Hammer Lane NB",
      lat: 38.021505,
      lon: -121.294708
   },

   {
      id: 0,
      stopId: 7264,
      name: "Fremont St & Commerce EB,FREMONT ST & COMMERCE ST",
      lat: 37.957347,
      lon: -121.293516
   },

   {
      id: 0,
      stopId: 3081,
      name: "Mosswood & Odell EB,MOSSWOOD AVE & ODELL AVE",
      lat: 37.923417,
      lon: -121.285225
   },

   {
      id: 0,
      stopId: 3331,
      name: "Bianchi Rd & Kentfield WB",
      lat: 37.993078,
      lon: -121.300366
   },

   {
      id: 0,
      stopId: 3328,
      name: "Bianchi Rd & Clowes WB",
      lat: 37.997391,
      lon: -121.290618
   },

   {
      id: 0,
      stopId: 3329,
      name: "Bianchi Rd & Hillsboro WB",
      lat: 37.9959,
      lon: -121.296
   },

   {
      id: 0,
      stopId: 3316,
      name: "Hammer Ln & Pavilion Plaza EB",
      lat: 38.020962,
      lon: -121.275939
   },

   {
      id: 0,
      stopId: 3318,
      name: "Hammer Ln & Holman Rd EB",
      lat: 38.021001,
      lon: -121.270942
   },

   {
      id: 0,
      stopId: 3321,
      name: "Hammer Ln & Girardi WB",
      lat: 38.021231,
      lon: -121.277286
   },

   {
      id: 0,
      stopId: 3322,
      name: "Lorraine Ave & Homewood SB",
      lat: 38.01686,
      lon: -121.284879
   },

   {
      id: 0,
      stopId: 3867,
      name: "Carolyn Weston & McDougald WB,CAROLYN WESTON BLVD & McDougald BLVD",
      lat: 37.911381,
      lon: -121.299033
   },

   {
      id: 0,
      stopId: 3868,
      name: "Carolyn Weston & General Mueller Wb,CAROLYN WESTON BLVD & GEN MUELLER LN",
      lat: 37.911476,
      lon: -121.302217
   },

   {
      id: 0,
      stopId: 3870,
      name: "Carolyn Weston & Ishi Goto St WB",
      lat: 37.912491,
      lon: -121.309337
   },

   {
      id: 0,
      stopId: 7210,
      name: "Carolyn Weston & Gaswell WB,CAROLYN WESTON BLVD & GASWELL",
      lat: 37.913472,
      lon: -121.313274
   },

   {
      id: 0,
      stopId: 3875,
      name: "Henry Long & Ews Wood Blvd EB",
      lat: 37.902021,
      lon: -121.302847
   },

   {
      id: 0,
      stopId: 3879,
      name: "William Moss Bl & Ramalho Ln EB",
      lat: 37.906684,
      lon: -121.291852
   },

   {
      id: 0,
      stopId: 3876,
      name: "Henry Long & Woodhollow EB",
      lat: 37.901151,
      lon: -121.298998
   },

   {
      id: 0,
      stopId: 3877,
      name: "McDougald Blvd & Henry Long NB",
      lat: 37.900808,
      lon: -121.294725
   },

   {
      id: 0,
      stopId: 3871,
      name: "Carolyn Weston & Kay Bridges WB,CAROLYN WESTON BLVD & KAY BRIDGES PL",
      lat: 37.911021,
      lon: -121.317928
   },

   {
      id: 0,
      stopId: 3872,
      name: "Carolyn Weston & Monet Drive SB",
      lat: 37.907079,
      lon: -121.319464
   },

   {
      id: 0,
      stopId: 3873,
      name: "Carolyn Weston & Aso Taro Ct SB",
      lat: 37.905292,
      lon: -121.319762
   },

   {
      id: 0,
      stopId: 3874,
      name: "Henry Long & Estes Ave Eb",
      lat: 37.902207,
      lon: -121.315233
   },

   {
      id: 0,
      stopId: 3878,
      name: "McDougald Blvd & Bess Pl NB",
      lat: 37.905232,
      lon: -121.295332
   },

   {
      id: 0,
      stopId: 7103,
      name: "California St & Vine NB",
      lat: 37.966237,
      lon: -121.287932
   },

   {
      id: 0,
      stopId: 3762,
      name: "Stanfield & Appling Cir WB,STANFIELD DR & APPLING CIR",
      lat: 38.035312,
      lon: -121.356275
   },

   {
      id: 0,
      stopId: 3482,
      name: "Thornton Rd & A.G. Spanos Blvd NB",
      lat: 38.046272,
      lon: -121.350457
   },

   {
      id: 0,
      stopId: 3507,
      name: "Thornton Rd & A.G. Spanos Blvd SB",
      lat: 38.045014,
      lon: -121.35022
   },

   {
      id: 0,
      stopId: 3408,
      name: "Stockton St & 8th St NB",
      lat: 37.927043,
      lon: -121.299805
   },

   {
      id: 0,
      stopId: 3450,
      name: "Herndon Pl & Mill Springs SB,HERNDON PL & MILL SPRINGS DR",
      lat: 38.008964,
      lon: -121.357571
   },

   {
      id: 0,
      stopId: 3523,
      name: "Maranatha Dr & Christian Life Way Nb",
      lat: 38.024565,
      lon: -121.264043
   },

   {
      id: 0,
      stopId: 3524,
      name: "Holman Rd & Bryant Dr SB",
      lat: 38.026895,
      lon: -121.269932
   },

   {
      id: 0,
      stopId: 3405,
      name: "8th St & Fresno Ave EB",
      lat: 37.926559,
      lon: -121.311635
   },

   {
      id: 0,
      stopId: 3525,
      name: "Holman Rd & Wakeman Dr SB",
      lat: 38.023817,
      lon: -121.271578
   },

   {
      id: 0,
      stopId: 3641,
      name: "Sinclair & 4th St SB,SINCLAIR AVE & 4TH ST",
      lat: 37.946417,
      lon: -121.227492
   },

   {
      id: 0,
      stopId: 3653,
      name: "Wilson Way & Hazelton NB",
      lat: 37.95037,
      lon: -121.26996
   },

   {
      id: 0,
      stopId: 3655,
      name: "Wilson Way & Market NB",
      lat: 37.954922,
      lon: -121.271239
   },

   {
      id: 0,
      stopId: 3421,
      name: "Plymouth Rd & Crittenden Ct NB",
      lat: 38.009429,
      lon: -121.35168
   },

   {
      id: 0,
      stopId: 3489,
      name: "El Dorado & Normandy Ct SB,EL DORADO ST & NORMANDY CT",
      lat: 38.029076,
      lon: -121.316343
   },

   {
      id: 0,
      stopId: 3665,
      name: "Pershing Ave & Country Club SB",
      lat: 37.969197,
      lon: -121.315123
   },

   {
      id: 0,
      stopId: 3671,
      name: "Wilson Way & Main SB",
      lat: 37.955674,
      lon: -121.271635
   },

   {
      id: 0,
      stopId: 3672,
      name: "Wilson Way & Lafayette SB",
      lat: 37.9531,
      lon: -121.27099
   },

   {
      id: 0,
      stopId: 3673,
      name: "Wilson Way & Hazelton SB",
      lat: 37.94999,
      lon: -121.27011
   },

   {
      id: 0,
      stopId: 3680,
      name: "Farmington @ 3808 Eb,FARMINGTON RD & 3808 FARMINGTON RD",
      lat: 37.939531,
      lon: -121.2378
   },

   {
      id: 0,
      stopId: 3084,
      name: "8th St & San Joaquin EB",
      lat: 37.929235,
      lon: -121.280671
   },

   {
      id: 0,
      stopId: 3128,
      name: "Clayton & Harvey EB",
      lat: 37.910985,
      lon: -121.276969
   },

   {
      id: 0,
      stopId: 3129,
      name: "El Dorado & Western Lumber SB,EL DORADO ST & WESTERN LUMBER",
      lat: 37.904417,
      lon: -121.275816
   },

   {
      id: 0,
      stopId: 3683,
      name: "Main & Anteros WB",
      lat: 37.95423,
      lon: -121.23759
   },

   {
      id: 0,
      stopId: 3686,
      name: "Main & F Street WB",
      lat: 37.95503,
      lon: -121.254166
   },

   {
      id: 0,
      stopId: 3688,
      name: "Main & D Street WB",
      lat: 37.955288,
      lon: -121.259454
   },

   {
      id: 0,
      stopId: 3798,
      name: "East St & Carlton NB",
      lat: 37.746355,
      lon: -121.421137
   },

   {
      id: 0,
      stopId: 3703,
      name: "Main & Fair Oaks Library Eb",
      lat: 37.954983,
      lon: -121.255793
   },

   {
      id: 0,
      stopId: 3709,
      name: "Washington St & Dawes EB,WASHINGTON ST & DAWES AVE",
      lat: 37.963887,
      lon: -121.232218
   },

   {
      id: 0,
      stopId: 3712,
      name: "Cardinal Ave & Meadowood SB",
      lat: 37.959406,
      lon: -121.219885
   },

   {
      id: 0,
      stopId: 3713,
      name: "Main & Del Mar WB,MAIN ST & DEL MAR AVE",
      lat: 37.955843,
      lon: -121.227098
   },

   {
      id: 0,
      stopId: 3812,
      name: "Wilma Ave & 4th St SB",
      lat: 37.736795,
      lon: -121.135483
   },

   {
      id: 0,
      stopId: 3654,
      name: "Wilson Way & Lafayette NB",
      lat: 37.952624,
      lon: -121.270611
   },

   {
      id: 0,
      stopId: 3903,
      name: "East St & Grant Line SB",
      lat: 37.753902,
      lon: -121.421189
   },

   {
      id: 0,
      stopId: 3862,
      name: "Lincoln St & Sonora St SB",
      lat: 37.947083,
      lon: -121.296523
   },

   {
      id: 0,
      stopId: 3865,
      name: "Fresno Ave & Sonora St NB",
      lat: 37.944894,
      lon: -121.312522
   },

   {
      id: 0,
      stopId: 7222,
      name: "Main & Louise NB",
      lat: 37.81244,
      lon: -121.2169
   },

   {
      id: 0,
      stopId: 7190,
      name: "Grant Line & Macarthur EB,GRANT LINE RD & MACARTHUR BLVD",
      lat: 37.754168,
      lon: -121.414462
   },

   {
      id: 0,
      stopId: 3797,
      name: "Grant Line Rd & East St EB",
      lat: 37.75412,
      lon: -121.420353
   },

   {
      id: 0,
      stopId: 3306,
      name: "Bianchi Rd & Hillsboro Way EB",
      lat: 37.99579,
      lon: -121.29576
   },

   {
      id: 0,
      stopId: 3856,
      name: "Lincoln St & Layfayette NB",
      lat: 37.94836,
      lon: -121.296657
   },

   {
      id: 0,
      stopId: 3144,
      name: "Weber & Center WB",
      lat: 37.953534,
      lon: -121.29176
   },

   {
      id: 0,
      stopId: 3710,
      name: "Washington St & Thelma EB",
      lat: 37.965141,
      lon: -121.227558
   },

   {
      id: 0,
      stopId: 7059,
      name: "Mt Diablo Ave & Ryde WB",
      lat: 37.956538,
      lon: -121.333241
   },

   {
      id: 0,
      stopId: 7943,
      name: "East Gate Arrive",
      lat: 37.686827,
      lon: -121.697475
   },

   {
      id: 0,
      stopId: 3553,
      name: "Weber & Stanislaus WB",
      lat: 37.955122,
      lon: -121.28269
   },

   {
      id: 0,
      stopId: 9927,
      name: "N St & 10th St",
      lat: 38.575773,
      lon: -121.495189
   },

   {
      id: 0,
      stopId: 9928,
      name: "N St & 14th St",
      lat: 38.574373,
      lon: -121.490043
   },

   {
      id: 0,
      stopId: 7211,
      name: "Henry Long & McCuen EB",
      lat: 37.902074,
      lon: -121.307675
   },

   {
      id: 0,
      stopId: 3820,
      name: "Qantas & Transworld Sb,QANTAS LN & TRANSWORLD DR",
      lat: 37.906368,
      lon: -121.228702
   },

   {
      id: 0,
      stopId: 3847,
      name: "Kettleman & Ham WB,KETTLEMAN LN & HAM LN",
      lat: 38.115561,
      lon: -121.288874
   },

   {
      id: 0,
      stopId: 7025,
      name: "Downtown Transit Center Dep B",
      lat: 37.955044,
      lon: -121.285053
   },

   {
      id: 0,
      stopId: 7017,
      name: "Downtown Transit Center Dep C",
      lat: 37.954955,
      lon: -121.285847
   },

   {
      id: 0,
      stopId: 7003,
      name: "Downtown Transit Center Dep D",
      lat: 37.954928,
      lon: -121.285386
   },

   {
      id: 0,
      stopId: 3486,
      name: "Lower Sac & Royal Oaks SB",
      lat: 38.036472,
      lon: -121.322894
   },

   {
      id: 0,
      stopId: 3484,
      name: "Davis Rd & Chaparral Way SB",
      lat: 38.0402,
      lon: -121.331992
   },

   {
      id: 0,
      stopId: 3394,
      name: "MLK Blvd & El Dorado St WB",
      lat: 37.939,
      lon: -121.28651
   },

   {
      id: 0,
      stopId: 3395,
      name: "MLK Blvd & Van Buren St WB",
      lat: 37.937774,
      lon: -121.292891
   },

   {
      id: 0,
      stopId: 7169,
      name: "Hammer Ln & Don Ave WB",
      lat: 38.021465,
      lon: -121.34602
   },

   {
      id: 0,
      stopId: 7184,
      name: "Otto & Thornton Rd EB",
      lat: 38.039034,
      lon: -121.343926
   },

   {
      id: 0,
      stopId: 7185,
      name: "Stanfield & Thornton WB,STANFIELD DR & THORNTON RD",
      lat: 38.037046,
      lon: -121.34175
   },

   {
      id: 0,
      stopId: 7176,
      name: "Trinity Pkwy & Cosumnes Dr NB",
      lat: 38.048972,
      lon: -121.373589
   },

   {
      id: 0,
      stopId: 7165,
      name: "Hammer Triangle Arr Sb",
      lat: 38.020673,
      lon: -121.323474
   },

   {
      id: 0,
      stopId: 7083,
      name: "Hammer Ln & Holman Rd WB",
      lat: 38.021311,
      lon: -121.272828
   },

   {
      id: 0,
      stopId: 7163,
      name: "Hammer Ln & Meadow Ave EB",
      lat: 38.02126,
      lon: -121.34541
   },

   {
      id: 0,
      stopId: 3307,
      name: "Bianchi Rd & Clowes St EB",
      lat: 37.997213,
      lon: -121.290679
   },

   {
      id: 0,
      stopId: 3000,
      name: "Miner Ave & Airport Way WB",
      lat: 37.958356,
      lon: -121.275012
   },

   {
      id: 0,
      stopId: 3001,
      name: "Miner Ave & Airport Way EB",
      lat: 37.958167,
      lon: -121.275391
   },

   {
      id: 0,
      stopId: 7006,
      name: "Downtown Transit Center Dep A",
      lat: 37.955008,
      lon: -121.285248
   },

   {
      id: 0,
      stopId: 3003,
      name: "Fremont St & Center St WB",
      lat: 37.957592,
      lon: -121.292211
   },

   {
      id: 0,
      stopId: 3004,
      name: "Fremont St & Madison St WB",
      lat: 37.957093,
      lon: -121.295451
   },

   {
      id: 0,
      stopId: 3005,
      name: "Madison St & Flora St NB",
      lat: 37.95992,
      lon: -121.29576
   },

   {
      id: 0,
      stopId: 3013,
      name: "Pacific Ave & March Ln NB",
      lat: 37.991965,
      lon: -121.312774
   },

   {
      id: 0,
      stopId: 3014,
      name: "Pacific Ave & Weberstown Ent NB",
      lat: 37.994009,
      lon: -121.313638
   },

   {
      id: 0,
      stopId: 3015,
      name: "Pacific Ave & March SB",
      lat: 37.99086,
      lon: -121.312694
   },

   {
      id: 0,
      stopId: 3022,
      name: "Madison St & Flora St SB",
      lat: 37.95979,
      lon: -121.29592
   },

   {
      id: 0,
      stopId: 3023,
      name: "Fremont St & Commerce St EB",
      lat: 37.957187,
      lon: -121.294014
   },

   {
      id: 0,
      stopId: 3024,
      name: "San Joaquin St & Lafayette St NB",
      lat: 37.95043,
      lon: -121.28635
   },

   {
      id: 0,
      stopId: 3026,
      name: "San Joaquin St & Main St NB",
      lat: 37.953302,
      lon: -121.287151
   },

   {
      id: 0,
      stopId: 3027,
      name: "California St & Fremont St NB",
      lat: 37.958453,
      lon: -121.285789
   },

   {
      id: 0,
      stopId: 3028,
      name: "California St & Oak St NB",
      lat: 37.959455,
      lon: -121.286065
   },

   {
      id: 0,
      stopId: 3029,
      name: "California St & Flora St NB",
      lat: 37.96176,
      lon: -121.28667
   },

   {
      id: 0,
      stopId: 3030,
      name: "California St & Magnolia St NB",
      lat: 37.96484,
      lon: -121.287556
   },

   {
      id: 0,
      stopId: 3032,
      name: "California St & Wyandotte St NB",
      lat: 37.973006,
      lon: -121.289902
   },

   {
      id: 0,
      stopId: 3033,
      name: "California St & Geary NB,E GEARY ST & N CALIFORNIA ST",
      lat: 37.976046,
      lon: -121.29117
   },

   {
      id: 0,
      stopId: 3034,
      name: "California St & Sonoma Ave NB",
      lat: 37.980959,
      lon: -121.293167
   },

   {
      id: 0,
      stopId: 3035,
      name: "West Lane & Enterprise St NB",
      lat: 37.990113,
      lon: -121.285936
   },

   {
      id: 0,
      stopId: 3037,
      name: "West Lane & March Ln NB",
      lat: 38.002591,
      lon: -121.290742
   },

   {
      id: 0,
      stopId: 3038,
      name: "West Lane & Atchenson St NB",
      lat: 38.006338,
      lon: -121.292235
   },

   {
      id: 0,
      stopId: 3039,
      name: "West Lane & Swain Rd NB",
      lat: 38.011454,
      lon: -121.294111
   },

   {
      id: 0,
      stopId: 3040,
      name: "Tam O Shanter Dr & Hammertown SB",
      lat: 38.015402,
      lon: -121.299133
   },

   {
      id: 0,
      stopId: 3041,
      name: "Tam O Shanter Dr @ Comcast Cable Sb",
      lat: 38.012914,
      lon: -121.297713
   },

   {
      id: 0,
      stopId: 3042,
      name: "West Lane & Swain Rd SB",
      lat: 38.010199,
      lon: -121.294128
   },

   {
      id: 0,
      stopId: 3043,
      name: "West Lane & Access St SB",
      lat: 38.005704,
      lon: -121.292319
   },

   {
      id: 0,
      stopId: 3045,
      name: "West Lane & Bianchi Rd SB",
      lat: 37.996729,
      lon: -121.28874
   },

   {
      id: 0,
      stopId: 3046,
      name: "West Lane & Enterprise St SB",
      lat: 37.989999,
      lon: -121.286196
   },

   {
      id: 0,
      stopId: 3047,
      name: "California St & Sonoma SB",
      lat: 37.98092,
      lon: -121.293374
   },

   {
      id: 0,
      stopId: 3049,
      name: "California St & Hampton St SB",
      lat: 37.975149,
      lon: -121.291002
   },

   {
      id: 0,
      stopId: 3050,
      name: "California St & Wyandotte St SB",
      lat: 37.972661,
      lon: -121.289985
   },

   {
      id: 0,
      stopId: 3052,
      name: "California St & Vine St SB",
      lat: 37.966509,
      lon: -121.288186
   },

   {
      id: 0,
      stopId: 3053,
      name: "California St & Magnolia St SB",
      lat: 37.96413,
      lon: -121.287536
   },

   {
      id: 0,
      stopId: 3055,
      name: "California St & Flora St SB",
      lat: 37.96174,
      lon: -121.28694
   },

   {
      id: 0,
      stopId: 3056,
      name: "California St & Oak St SB",
      lat: 37.959751,
      lon: -121.286362
   },

   {
      id: 0,
      stopId: 3057,
      name: "California St & Fremont St SB",
      lat: 37.958734,
      lon: -121.286048
   },

   {
      id: 0,
      stopId: 3058,
      name: "San Joaquin St & Weber Ave SB",
      lat: 37.954169,
      lon: -121.287476
   },

   {
      id: 0,
      stopId: 3059,
      name: "San Joaquin St & Market St SB",
      lat: 37.95191,
      lon: -121.286955
   },

   {
      id: 0,
      stopId: 3060,
      name: "Lever Blvd & 8th St SB",
      lat: 37.925888,
      lon: -121.297527
   },

   {
      id: 0,
      stopId: 3061,
      name: "Chicago Ave & Colorado Ave EB",
      lat: 37.922993,
      lon: -121.297603
   },

   {
      id: 0,
      stopId: 3065,
      name: "Freedom Rd & Matthews Rd Sb",
      lat: 37.882855,
      lon: -121.281989
   },

   {
      id: 0,
      stopId: 3066,
      name: "Mathews Rd & Bright Rd WB",
      lat: 37.882518,
      lon: -121.29206
   },

   {
      id: 0,
      stopId: 3067,
      name: "Mathews Rd & Endow Rd WB",
      lat: 37.882563,
      lon: -121.294547
   },

   {
      id: 0,
      stopId: 3068,
      name: "Mathews Rd & Freedom Rd EB",
      lat: 37.882201,
      lon: -121.282094
   },

   {
      id: 0,
      stopId: 3070,
      name: "Carolyn Weston & Manthey EB",
      lat: 37.912285,
      lon: -121.294598
   },

   {
      id: 0,
      stopId: 3072,
      name: "California St & Arcade St NB",
      lat: 37.978222,
      lon: -121.292166
   },

   {
      id: 0,
      stopId: 7030,
      name: "Essex St & El Dorado St EB",
      lat: 37.98721,
      lon: -121.30183
   },

   {
      id: 0,
      stopId: 3105,
      name: "Essex St & Sutter St EB",
      lat: 37.988055,
      lon: -121.298504
   },

   {
      id: 0,
      stopId: 3146,
      name: "Lincoln St & Washington St NB",
      lat: 37.949895,
      lon: -121.297121
   },

   {
      id: 0,
      stopId: 3157,
      name: "Lincoln St & 4th St SB",
      lat: 37.932424,
      lon: -121.292285
   },

   {
      id: 0,
      stopId: 3165,
      name: "San Joaquin St & Oak St NB",
      lat: 37.95931,
      lon: -121.28876
   },

   {
      id: 0,
      stopId: 3174,
      name: "Pershing Ave & Elm St NB",
      lat: 37.964756,
      lon: -121.313404
   },

   {
      id: 0,
      stopId: 3175,
      name: "Country Club Blvd & Grange Ave WB",
      lat: 37.968436,
      lon: -121.319483
   },

   {
      id: 0,
      stopId: 3176,
      name: "Country Club Blvd & Mission Rd WB",
      lat: 37.967635,
      lon: -121.322701
   },

   {
      id: 0,
      stopId: 3177,
      name: "Country Club Blvd & Franklin Ave Wb",
      lat: 37.966191,
      lon: -121.328499
   },

   {
      id: 0,
      stopId: 3178,
      name: "Country Club Blvd & Delaware Ave Wb",
      lat: 37.965595,
      lon: -121.33089
   },

   {
      id: 0,
      stopId: 3179,
      name: "Country Club Blvd & Plymouth Rd Wb",
      lat: 37.964718,
      lon: -121.334518
   },

   {
      id: 0,
      stopId: 3180,
      name: "Oregon Ave & Michigan Ave SB",
      lat: 37.96508,
      lon: -121.344279
   },

   {
      id: 0,
      stopId: 3181,
      name: "Michigan Ave & Ryde WB,N RYDE Ave & RYDE Ave",
      lat: 37.96597,
      lon: -121.34239
   },

   {
      id: 0,
      stopId: 3182,
      name: "Country Club Blvd & Oregon Ave EB",
      lat: 37.962584,
      lon: -121.342413
   },

   {
      id: 0,
      stopId: 3183,
      name: "Alpine & Mission Rd EB",
      lat: 37.97337,
      lon: -121.32536
   },

   {
      id: 0,
      stopId: 3184,
      name: "Alpine & Grange Ave EB",
      lat: 37.974361,
      lon: -121.321594
   },

   {
      id: 0,
      stopId: 3185,
      name: "Alpine & Pershing Ave EB",
      lat: 37.975124,
      lon: -121.318528
   },

   {
      id: 0,
      stopId: 3186,
      name: "Pershing Ave & Brookside Rd NB",
      lat: 37.982239,
      lon: -121.318946
   },

   {
      id: 0,
      stopId: 3187,
      name: "Rosemarie Ln & Pershing Ave WB",
      lat: 37.986548,
      lon: -121.321234
   },

   {
      id: 0,
      stopId: 3188,
      name: "Rosemarie Ln & Angelico Cir WB",
      lat: 37.984153,
      lon: -121.330781
   },

   {
      id: 0,
      stopId: 3189,
      name: "Rosemarie Ln & Piccardo Cir WB",
      lat: 37.983739,
      lon: -121.332445
   },

   {
      id: 0,
      stopId: 3195,
      name: "March Ln & Pershing Ave EB",
      lat: 37.989016,
      lon: -121.321429
   },

   {
      id: 0,
      stopId: 3199,
      name: "March Ln & Pacific Ave WB",
      lat: 37.991079,
      lon: -121.314048
   },

   {
      id: 0,
      stopId: 3200,
      name: "March Ln & Precissi Ln WB",
      lat: 37.990726,
      lon: -121.315471
   },

   {
      id: 0,
      stopId: 3201,
      name: "March Ln & Pershing Ave WB",
      lat: 37.989008,
      lon: -121.322482
   },

   {
      id: 0,
      stopId: 3202,
      name: "March Ln & Venetian Dr WB",
      lat: 37.98807,
      lon: -121.326308
   },

   {
      id: 0,
      stopId: 3203,
      name: "March Ln & Grouse Run Dr WB",
      lat: 37.98724,
      lon: -121.32968
   },

   {
      id: 0,
      stopId: 3204,
      name: "March Ln & Quail Lakes Plaza WB",
      lat: 37.98582,
      lon: -121.335078
   },

   {
      id: 0,
      stopId: 7049,
      name: "Davinci Dr & March Ln SB",
      lat: 37.983932,
      lon: -121.339878
   },

   {
      id: 0,
      stopId: 3205,
      name: "Rosemarie Ln & Lorenzo Ln EB",
      lat: 37.982221,
      lon: -121.337588
   },

   {
      id: 0,
      stopId: 3206,
      name: "Rosemarie Ln & Venezia Blvd EB",
      lat: 37.983509,
      lon: -121.334402
   },

   {
      id: 0,
      stopId: 3207,
      name: "Rosemarie Ln & Angelico Cir EB",
      lat: 37.984029,
      lon: -121.330854
   },

   {
      id: 0,
      stopId: 3208,
      name: "Pershing Ave & Rose Marie Ln SB",
      lat: 37.98597,
      lon: -121.32067
   },

   {
      id: 0,
      stopId: 3209,
      name: "Pershing Ave & Brookside Rd SB",
      lat: 37.981723,
      lon: -121.318968
   },

   {
      id: 0,
      stopId: 3210,
      name: "Alpine & Pershing Ave WB",
      lat: 37.975265,
      lon: -121.318512
   },

   {
      id: 0,
      stopId: 3211,
      name: "Alpine & Grange Ave WB",
      lat: 37.974307,
      lon: -121.322369
   },

   {
      id: 0,
      stopId: 3212,
      name: "Alpine & Mission Rd WB",
      lat: 37.97354,
      lon: -121.32544
   },

   {
      id: 0,
      stopId: 7052,
      name: "Alpine & Franklin Ave WB",
      lat: 37.972084,
      lon: -121.331357
   },

   {
      id: 0,
      stopId: 7044,
      name: "Country Club Blvd & Fontana Arr Eb,COUNTRY CLUB BLVD & FONTANA AVE",
      lat: 37.963883,
      lon: -121.337108
   },

   {
      id: 0,
      stopId: 3213,
      name: "Country Club Blvd & Plymouth Rd Eb",
      lat: 37.964501,
      lon: -121.334667
   },

   {
      id: 0,
      stopId: 3214,
      name: "Country Club Blvd & Clipper Ln EB,W COUNTRY CLUB BL & CLIPPER LN",
      lat: 37.965506,
      lon: -121.330964
   },

   {
      id: 0,
      stopId: 3215,
      name: "Country Club Blvd & Carlton Ave EB,COUNTRY CLUB BLVD & CARLTON AVE",
      lat: 37.966169,
      lon: -121.327944
   },

   {
      id: 0,
      stopId: 3216,
      name: "Country Club Blvd & Mission Rd EB",
      lat: 37.967168,
      lon: -121.323974
   },

   {
      id: 0,
      stopId: 3217,
      name: "Country Club Blvd & Grange Ave EB",
      lat: 37.968489,
      lon: -121.318673
   },

   {
      id: 0,
      stopId: 3218,
      name: "Pershing Ave & Elm St SB",
      lat: 37.964943,
      lon: -121.313655
   },

   {
      id: 0,
      stopId: 3229,
      name: "San Joaquin St & Lindsay St SB",
      lat: 37.957327,
      lon: -121.288431
   },

   {
      id: 0,
      stopId: 7032,
      name: "San Joaquin St & Taylor St SB",
      lat: 37.945745,
      lon: -121.28528
   },

   {
      id: 0,
      stopId: 3237,
      name: "Picardy Dr & Pershing Ave WB",
      lat: 37.9593,
      lon: -121.31236
   },

   {
      id: 0,
      stopId: 3238,
      name: "Picardy Dr & Argonne Dr WB",
      lat: 37.95901,
      lon: -121.316667
   },

   {
      id: 0,
      stopId: 3239,
      name: "Mt Diablo Ave & Buena Vista St WB",
      lat: 37.95906,
      lon: -121.318597
   },

   {
      id: 0,
      stopId: 3240,
      name: "Mt Diablo Ave & San Juan Ave WB",
      lat: 37.95848,
      lon: -121.32205
   },

   {
      id: 0,
      stopId: 3241,
      name: "Mt Diablo Ave & Carlton Ave WB",
      lat: 37.95786,
      lon: -121.32564
   },

   {
      id: 0,
      stopId: 3242,
      name: "Mt Diablo Ave & I-5 WB",
      lat: 37.957193,
      lon: -121.329418
   },

   {
      id: 0,
      stopId: 3243,
      name: "Mt Diablo Ave & Kingsley Ave WB",
      lat: 37.955884,
      lon: -121.337009
   },

   {
      id: 0,
      stopId: 3244,
      name: "Occidental Ave & Mt Diablo Ave NB",
      lat: 37.955786,
      lon: -121.339779
   },

   {
      id: 0,
      stopId: 3245,
      name: "Occidental Ave & Toyon Dr NB",
      lat: 37.958234,
      lon: -121.340427
   },

   {
      id: 0,
      stopId: 3190,
      name: "Rosemarie Ln & Venezia Blvd WB",
      lat: 37.98356,
      lon: -121.33467
   },

   {
      id: 0,
      stopId: 3191,
      name: "Rosemarie Ln & Lorenzo Ln WB",
      lat: 37.982542,
      lon: -121.336826
   },

   {
      id: 0,
      stopId: 3247,
      name: "Mt Diablo Ave & Wilshire Ave EB",
      lat: 37.95738,
      lon: -121.327916
   },

   {
      id: 0,
      stopId: 3248,
      name: "Mt Diablo Ave & Carlton Ave EB",
      lat: 37.95777,
      lon: -121.32552
   },

   {
      id: 0,
      stopId: 3250,
      name: "Mt Diablo Ave & San Juan Ave EB",
      lat: 37.95838,
      lon: -121.32192
   },

   {
      id: 0,
      stopId: 3251,
      name: "Mt Diablo Ave & Buena Vista Ave EB",
      lat: 37.958882,
      lon: -121.319027
   },

   {
      id: 0,
      stopId: 3252,
      name: "Picardy Dr & Acacia St EB",
      lat: 37.958731,
      lon: -121.31636
   },

   {
      id: 0,
      stopId: 3253,
      name: "Picardy Dr & Pershing Ave EB",
      lat: 37.95916,
      lon: -121.31246
   },

   {
      id: 0,
      stopId: 3258,
      name: "Fremont St & Commerce St WB",
      lat: 37.957423,
      lon: -121.293487
   },

   {
      id: 0,
      stopId: 3259,
      name: "Center St & Weber Point SB",
      lat: 37.955962,
      lon: -121.292163
   },

   {
      id: 0,
      stopId: 3261,
      name: "Pacific Ave & Knoles Way NB",
      lat: 37.981072,
      lon: -121.307538
   },

   {
      id: 0,
      stopId: 7068,
      name: "Pacific Ave & Yokuts Ave Arrive Sb",
      lat: 37.99687,
      lon: -121.315041
   },

   {
      id: 0,
      stopId: 3262,
      name: "Pacific Ave & Knoles Way SB",
      lat: 37.980336,
      lon: -121.307178
   },

   {
      id: 0,
      stopId: 3264,
      name: "Quail Lakes Dr & March Ln NB",
      lat: 37.985253,
      lon: -121.33978
   },

   {
      id: 0,
      stopId: 3265,
      name: "Quail Lakes Dr & Mallard Creek NB,QUAIL LAKES & MALLARD CREEK NB",
      lat: 37.988584,
      lon: -121.340187
   },

   {
      id: 0,
      stopId: 3266,
      name: "Quail Lakes Dr & Round Valley NB,QUAIL LAKES & ROUND VALLEY NB",
      lat: 37.989973,
      lon: -121.340676
   },

   {
      id: 0,
      stopId: 3267,
      name: "Quail Lakes Dr & Grizzly Hollow NB,QUAIL LAKES & GRIZZLY HOLLOW NB",
      lat: 37.994181,
      lon: -121.342035
   },

   {
      id: 0,
      stopId: 3268,
      name: "Quail Lakes Dr & Pheasant Run NB,QUAIL LAKES & PHEASANT RUN NB",
      lat: 37.995429,
      lon: -121.338655
   },

   {
      id: 0,
      stopId: 3269,
      name: "Quail Lakes Dr & Grouse Run NB,QUAIL LAKES & GROUSE RUN NB",
      lat: 37.995476,
      lon: -121.335607
   },

   {
      id: 0,
      stopId: 3270,
      name: "Quail Lakes Dr & Passero NB,QUAIL LAKES & PASSERO NB",
      lat: 37.99745,
      lon: -121.33207
   },

   {
      id: 0,
      stopId: 3271,
      name: "Quail Lakes Dr & Tree Swallow NB,QUAIL LAKES & TREE SWALLOW NB",
      lat: 37.997364,
      lon: -121.328587
   },

   {
      id: 0,
      stopId: 3272,
      name: "Quail Lakes Dr & Pershing NB,QUAIL LAKES & PERSHING NB",
      lat: 37.997892,
      lon: -121.325696
   },

   {
      id: 0,
      stopId: 3274,
      name: "Robinhood Dr & Stratford East EB",
      lat: 37.99971,
      lon: -121.31972
   },

   {
      id: 0,
      stopId: 3277,
      name: "Robinhood Dr & Stratford East WB",
      lat: 37.9999,
      lon: -121.31995
   },

   {
      id: 0,
      stopId: 3278,
      name: "Robinhood Dr & Stratford West WB",
      lat: 37.999223,
      lon: -121.322206
   },

   {
      id: 0,
      stopId: 7074,
      name: "Robinhood Dr & Pershing Ave WB",
      lat: 37.998247,
      lon: -121.325078
   },

   {
      id: 0,
      stopId: 3279,
      name: "Quail Lakes Dr & Silver Creek SB",
      lat: 37.997537,
      lon: -121.328169
   },

   {
      id: 0,
      stopId: 3280,
      name: "Quail Lakes Dr & Passero Way SB",
      lat: 37.99715,
      lon: -121.33243
   },

   {
      id: 0,
      stopId: 3281,
      name: "Quail Lakes Dr & Grouse Run Dr SB",
      lat: 37.995704,
      lon: -121.33523
   },

   {
      id: 0,
      stopId: 3282,
      name: "Quail Lakes Dr & Meadow Lake SB",
      lat: 37.99524,
      lon: -121.340409
   },

   {
      id: 0,
      stopId: 3283,
      name: "Quail Lakes Dr & Grizzy Hollow SB",
      lat: 37.993523,
      lon: -121.342556
   },

   {
      id: 0,
      stopId: 3284,
      name: "Quail Lakes Dr & Round Valley SB",
      lat: 37.989869,
      lon: -121.340887
   },

   {
      id: 0,
      stopId: 3285,
      name: "Quail Lakes Dr @ Shopping Ctr Sb",
      lat: 37.986749,
      lon: -121.340257
   },

   {
      id: 0,
      stopId: 3286,
      name: "March Ln @ I-5 76 Gas Station WB",
      lat: 37.98457,
      lon: -121.345403
   },

   {
      id: 0,
      stopId: 3287,
      name: "March Ln & Deer Park Dr WB",
      lat: 37.984305,
      lon: -121.350444
   },

   {
      id: 0,
      stopId: 3298,
      name: "Pershing Ave & Swain Rd SB",
      lat: 38.002648,
      lon: -121.327262
   },

   {
      id: 0,
      stopId: 3297,
      name: "Pershing Ave & Douglas Rd SB",
      lat: 38.005221,
      lon: -121.32836
   },

   {
      id: 0,
      stopId: 3299,
      name: "Pershing Ave & Longview Ave SB",
      lat: 38.001087,
      lon: -121.326608
   },

   {
      id: 0,
      stopId: 3291,
      name: "Driftwood Pl & Brookside Rd EB",
      lat: 37.989524,
      lon: -121.353507
   },

   {
      id: 0,
      stopId: 3292,
      name: "Driftwood Pl & Bike Trail EB",
      lat: 37.989655,
      lon: -121.349341
   },

   {
      id: 0,
      stopId: 3355,
      name: "Fremont St & Eastland Plaza EB",
      lat: 37.961131,
      lon: -121.269721
   },

   {
      id: 0,
      stopId: 3357,
      name: "Fremont St & Filbert St EB",
      lat: 37.96552,
      lon: -121.255956
   },

   {
      id: 0,
      stopId: 3371,
      name: "Waterloo Rd & Filbert St WB",
      lat: 37.976792,
      lon: -121.262215
   },

   {
      id: 0,
      stopId: 7096,
      name: "Wilson Way & Lindsay St SB",
      lat: 37.959662,
      lon: -121.27268
   },

   {
      id: 0,
      stopId: 3363,
      name: "Sanguinetti Ln & Wilson Way SB",
      lat: 37.983793,
      lon: -121.27158
   },

   {
      id: 0,
      stopId: 3364,
      name: "Funston Ave & Jersey Ave SB",
      lat: 37.981508,
      lon: -121.270889
   },

   {
      id: 0,
      stopId: 3385,
      name: "MLK Blvd & San Joaquin St WB",
      lat: 37.939539,
      lon: -121.283279
   },

   {
      id: 0,
      stopId: 3451,
      name: "Herndon Pl & Blue Ridge SB",
      lat: 38.006604,
      lon: -121.356709
   },

   {
      id: 0,
      stopId: 7115,
      name: "El Dorado & Hammer Ln NB",
      lat: 38.021612,
      lon: -121.315092
   },

   {
      id: 0,
      stopId: 3522,
      name: "Wigwam Dr & Cherokee Rd SB",
      lat: 37.986478,
      lon: -121.257235
   },

   {
      id: 0,
      stopId: 7016,
      name: "Mt Diablo Ave & Ryde Ave EB",
      lat: 37.956521,
      lon: -121.332988
   },

   {
      id: 0,
      stopId: 7021,
      name: "Mall Transfer Arr (South),W YOKUTS Ave",
      lat: 37.997012,
      lon: -121.313053
   },

   {
      id: 0,
      stopId: 3648,
      name: "B & 8th St NB",
      lat: 37.934462,
      lon: -121.255572
   },

   {
      id: 0,
      stopId: 3656,
      name: "Stanislaus & Miner Ave SB",
      lat: 37.95649,
      lon: -121.28278
   },

   {
      id: 0,
      stopId: 3660,
      name: "Pershing Ave & Vine St NB",
      lat: 37.961607,
      lon: -121.31257
   },

   {
      id: 0,
      stopId: 7144,
      name: "Wilson Way & Jackson St SB",
      lat: 37.94342,
      lon: -121.26831
   },

   {
      id: 0,
      stopId: 7146,
      name: "8th St & Nightingale Ave EB",
      lat: 37.936895,
      lon: -121.244094
   },

   {
      id: 0,
      stopId: 7150,
      name: "Main & Filbert St EB,MAIN ST & FILBERT ST",
      lat: 37.954761,
      lon: -121.251505
   },

   {
      id: 0,
      stopId: 3711,
      name: "Cardinal Ave & Ardelle Ave SB,CARDINAL AVE & ARDELLE AVE",
      lat: 37.962139,
      lon: -121.22102
   },

   {
      id: 0,
      stopId: 7155,
      name: "DTC Weber Ave Depart",
      lat: 37.954641,
      lon: -121.285414
   },

   {
      id: 0,
      stopId: 7154,
      name: "Fremont St & Eastland Plaza WB",
      lat: 37.961232,
      lon: -121.270463
   },

   {
      id: 0,
      stopId: 3728,
      name: "Hammer Ln & Kelley Dr EB",
      lat: 38.021211,
      lon: -121.355701
   },

   {
      id: 0,
      stopId: 3730,
      name: "Hammer Ln & Kelley Dr WB",
      lat: 38.021459,
      lon: -121.35655
   },

   {
      id: 0,
      stopId: 3729,
      name: "Hammer Ln & Richland Way EB",
      lat: 38.021181,
      lon: -121.351046
   },

   {
      id: 0,
      stopId: 3737,
      name: "Don Ave & Portola Ave NB",
      lat: 38.027014,
      lon: -121.345441
   },

   {
      id: 0,
      stopId: 3740,
      name: "A.G. Spanos Blvd & Thornton Rd WB",
      lat: 38.054945,
      lon: -121.35162
   },

   {
      id: 0,
      stopId: 3741,
      name: "A.G. Spanos Blvd & Stoney Gorge Dr NB",
      lat: 38.05386,
      lon: -121.35765
   },

   {
      id: 0,
      stopId: 3742,
      name: "A.G. Spanos Blvd & Banyon Dr SB",
      lat: 38.051013,
      lon: -121.358943
   },

   {
      id: 0,
      stopId: 3743,
      name: "Iron Canyon Dr & Freshwater Pl WB",
      lat: 38.049259,
      lon: -121.365268
   },

   {
      id: 0,
      stopId: 7177,
      name: "Scott Creek & Ridgeview Cir WB",
      lat: 38.0561,
      lon: -121.382449
   },

   {
      id: 0,
      stopId: 3744,
      name: "Scott Creek & Trinity Pkwy WB",
      lat: 38.053931,
      lon: -121.375911
   },

   {
      id: 0,
      stopId: 3745,
      name: "Mokelumne Cir & Hennessey Dr SB",
      lat: 38.053143,
      lon: -121.38323
   },

   {
      id: 0,
      stopId: 3746,
      name: "Mokelumne Cir & Melones Way SB",
      lat: 38.050083,
      lon: -121.385676
   },

   {
      id: 0,
      stopId: 3747,
      name: "Mokelumne Cir & Havencrest Ct SB",
      lat: 38.047785,
      lon: -121.37957
   },

   {
      id: 0,
      stopId: 3748,
      name: "Mokelumne Cir & Pasadena SB",
      lat: 38.047486,
      lon: -121.380001
   },

   {
      id: 0,
      stopId: 7178,
      name: "Cosumnes Dr & Trinity Pkwy EB",
      lat: 38.048265,
      lon: -121.373447
   },

   {
      id: 0,
      stopId: 3749,
      name: "Iron Canyon Dr & Freshwater Pl",
      lat: 38.049227,
      lon: -121.36488
   },

   {
      id: 0,
      stopId: 3750,
      name: "A.G. Spanos Blvd & Banyon Dr SB",
      lat: 38.05104,
      lon: -121.35892
   },

   {
      id: 0,
      stopId: 3751,
      name: "A.G. Spanos Blvd & Stoney Gorge Dr SB",
      lat: 38.05397,
      lon: -121.357
   },

   {
      id: 0,
      stopId: 3752,
      name: "A.G. Spanos Blvd & Siskiyou Ln SB",
      lat: 38.054577,
      lon: -121.353875
   },

   {
      id: 0,
      stopId: 7326,
      name: "Thornton Rd & Whistler Way SB",
      lat: 38.048907,
      lon: -121.351094
   },

   {
      id: 0,
      stopId: 3784,
      name: "Don Ave & Wagner Heights Rd SB",
      lat: 38.033632,
      lon: -121.345948
   },

   {
      id: 0,
      stopId: 3785,
      name: "Don Ave & Waudman Ave SB",
      lat: 38.029386,
      lon: -121.345625
   },

   {
      id: 0,
      stopId: 3786,
      name: "Don Ave & Marseille Way SB",
      lat: 38.026343,
      lon: -121.345576
   },

   {
      id: 0,
      stopId: 7186,
      name: "Pershing Ave & Ben Holt Dr SB",
      lat: 38.008685,
      lon: -121.329414
   },

   {
      id: 0,
      stopId: 3829,
      name: "Michigan Ave & Kirk WB",
      lat: 37.965846,
      lon: -121.342593
   },

   {
      id: 0,
      stopId: 3835,
      name: "Old Hospital Cir & North Loop Rd",
      lat: 37.887199,
      lon: -121.282439
   },

   {
      id: 0,
      stopId: 3859,
      name: "Lincoln St & Sonora St NB",
      lat: 37.947597,
      lon: -121.296473
   },

   {
      id: 0,
      stopId: 3913,
      name: "Thornton Rd & Wagner Heights Rd Nb",
      lat: 38.035826,
      lon: -121.339268
   },

   {
      id: 0,
      stopId: 3971,
      name: "East St & Carlton SB",
      lat: 37.745886,
      lon: -121.42122
   },

   {
      id: 0,
      stopId: 7258,
      name: "DTC C&S Dpt EB",
      lat: 37.955371,
      lon: -121.285804
   },

   {
      id: 0,
      stopId: 7301,
      name: "Robinhood Dr & Pacific Arr EB,ROBINHOOD & PACIFIC ARR EB",
      lat: 38.000919,
      lon: -121.314537
   },

   {
      id: 0,
      stopId: 7304,
      name: "Myrtle St & Oro Ave WB",
      lat: 37.965746,
      lon: -121.238898
   },

   {
      id: 0,
      stopId: 4001,
      name: "Hammer Ln & Alexandria Pl EB",
      lat: 38.020982,
      lon: -121.335385
   },

   {
      id: 0,
      stopId: 4002,
      name: "Hammer Ln & Amber Way EB",
      lat: 38.020954,
      lon: -121.331615
   },

   {
      id: 0,
      stopId: 4003,
      name: "Hammer Ln & El Dorado St EB",
      lat: 38.020994,
      lon: -121.315154
   },

   {
      id: 0,
      stopId: 4004,
      name: "Hammer Ln & Lan Ark Dr EB",
      lat: 38.020784,
      lon: -121.309208
   },

   {
      id: 0,
      stopId: 4005,
      name: "Hammer Ln & Tam O Shanter EB",
      lat: 38.020794,
      lon: -121.300115
   },

   {
      id: 0,
      stopId: 3978,
      name: "Hammer Ln & El Dorado St WB",
      lat: 38.021071,
      lon: -121.315605
   },

   {
      id: 0,
      stopId: 3979,
      name: "Hammer Ln & Misty Ln WB",
      lat: 38.02112,
      lon: -121.332121
   },

   {
      id: 0,
      stopId: 7263,
      name: "El Dorado & Iris Ave SB",
      lat: 38.022183,
      lon: -121.315532
   },

   {
      id: 0,
      stopId: 7708,
      name: "Carolyn Weston & Manthey WB",
      lat: 37.912259,
      lon: -121.294702
   },

   {
      id: 0,
      stopId: 7019,
      name: "West Lane & Stadium NB",
      lat: 37.98582,
      lon: -121.284361
   },

   {
      id: 0,
      stopId: 7175,
      name: "Thornton Rd & Whistler NB",
      lat: 38.049576,
      lon: -121.35087
   },

   {
      id: 0,
      stopId: 7784,
      name: "MLK Blvd & French Camp Trpk EB",
      lat: 37.938135,
      lon: -121.289547
   },

   {
      id: 0,
      stopId: 7780,
      name: "Alpine & Sanguinetti Ln WB",
      lat: 37.986739,
      lon: -121.273324
   },

   {
      id: 0,
      stopId: 4022,
      name: "Lorraine Ave & Amaretto SB",
      lat: 38.013145,
      lon: -121.28501
   },

   {
      id: 0,
      stopId: 7777,
      name: "Bianchi Rd & March Ln SB",
      lat: 38.002417,
      lon: -121.284357
   },

   {
      id: 0,
      stopId: 4023,
      name: "Alpine & El Pinal Dr EB",
      lat: 37.986163,
      lon: -121.274676
   },

   {
      id: 0,
      stopId: 7789,
      name: "Rosemarie Ln & McGaw St EB",
      lat: 37.984785,
      lon: -121.32797
   },

   {
      id: 0,
      stopId: 7791,
      name: "Meadow Ave & Hammer Ln SB",
      lat: 38.020765,
      lon: -121.345501
   },

   {
      id: 0,
      stopId: 4045,
      name: "Don Ave & Santiago Ave SB",
      lat: 38.023094,
      lon: -121.345585
   },

   {
      id: 0,
      stopId: 7792,
      name: "Farm & Gertrude EB",
      lat: 37.968986,
      lon: -121.238824
   },

   {
      id: 0,
      stopId: 4047,
      name: "Hammer Ln & Montauban EB",
      lat: 38.02078,
      lon: -121.289212
   },

   {
      id: 0,
      stopId: 4048,
      name: "Hammer Ln & Alexandria WB",
      lat: 38.021289,
      lon: -121.336544
   },

   {
      id: 0,
      stopId: 3982,
      name: "Park St & Center St WB",
      lat: 37.959464,
      lon: -121.293247
   },

   {
      id: 0,
      stopId: 3984,
      name: "Inspiration Dr & Maranatha Dr WB",
      lat: 38.03111,
      lon: -121.264788
   },

   {
      id: 0,
      stopId: 3985,
      name: "Inspiration Dr & Rieti Ln WB",
      lat: 38.031538,
      lon: -121.267605
   },

   {
      id: 0,
      stopId: 7795,
      name: "Holman Rd & Inspiration Dr SB",
      lat: 38.031154,
      lon: -121.269856
   },

   {
      id: 0,
      stopId: 4056,
      name: "Knickerbocker & Tamoshanter EB",
      lat: 38.022529,
      lon: -121.300011
   },

   {
      id: 0,
      stopId: 7339,
      name: "Hammertown @ Kaiser Eb",
      lat: 38.016552,
      lon: -121.296345
   },

   {
      id: 0,
      stopId: 4060,
      name: "Harlan Rd & Louise Ave NB,HARLAN RD & LOUSIE AVE",
      lat: 37.812461,
      lon: -121.291437
   },

   {
      id: 0,
      stopId: 4062,
      name: "Grant Line & Macarthur WB",
      lat: 37.754321,
      lon: -121.415191
   },

   {
      id: 0,
      stopId: 3990,
      name: "West Lane & Hammer Lane SB",
      lat: 38.020326,
      lon: -121.295031
   },

   {
      id: 0,
      stopId: 7810,
      name: "Main & Northgate NB",
      lat: 37.81707,
      lon: -121.21711
   },

   {
      id: 0,
      stopId: 7811,
      name: "Main & Northgate SB",
      lat: 37.8181,
      lon: -121.21745
   },

   {
      id: 0,
      stopId: 4078,
      name: "Odell Ave & Downing NB",
      lat: 37.91444,
      lon: -121.281907
   },

   {
      id: 0,
      stopId: 4077,
      name: "Odell Ave & Downing Ave SB",
      lat: 37.913661,
      lon: -121.281674
   },

   {
      id: 0,
      stopId: 4079,
      name: "Odell Ave & Wait Ave SB",
      lat: 37.911242,
      lon: -121.280699
   },

   {
      id: 0,
      stopId: 4082,
      name: "Davis Rd & Theresa Cir NB",
      lat: 38.037855,
      lon: -121.331769
   },

   {
      id: 0,
      stopId: 4085,
      name: "Brookside Rd & March Ln NB",
      lat: 37.985435,
      lon: -121.35497
   },

   {
      id: 0,
      stopId: 4086,
      name: "Rosemarie Ln & Crown Ave EB",
      lat: 37.986122,
      lon: -121.32249
   },

   {
      id: 0,
      stopId: 4091,
      name: "Louise Ave & Cambridge Dr EB",
      lat: 37.811697,
      lon: -121.283219
   },

   {
      id: 0,
      stopId: 4090,
      name: "Louise Ave & Cambridge Dr WB",
      lat: 37.811889,
      lon: -121.283975
   },

   {
      id: 0,
      stopId: 7823,
      name: "Pacific Ave & Yokuts Dep Nb Mb",
      lat: 37.99769,
      lon: -121.315085
   },

   {
      id: 0,
      stopId: 7826,
      name: "Mt Diablo Ave & Pixie Woods (1 Sch),MT DIABLO AVE & PIXIE WOODS",
      lat: 37.954906,
      lon: -121.342598
   },

   {
      id: 0,
      stopId: 4102,
      name: "Harding Way & Golden Gate Ave EB",
      lat: 37.974853,
      lon: -121.255121
   },

   {
      id: 0,
      stopId: 4105,
      name: "San Joaquin St & Park St SB",
      lat: 37.959707,
      lon: -121.289066
   },

   {
      id: 0,
      stopId: 4109,
      name: "Magnolia St & Aurora St",
      lat: 37.965216,
      lon: -121.283444
   },

   {
      id: 0,
      stopId: 7847,
      name: "Mall Transfer Metro Hopper Dep",
      lat: 37.996945,
      lon: -121.31255
   },

   {
      id: 0,
      stopId: 7848,
      name: "Sutter Gould Medical Center,SUTTER GOULD MED CTR",
      lat: 38.021797,
      lon: -121.346268
   },

   {
      id: 0,
      stopId: 7850,
      name: "Tracy Transit Center",
      lat: 37.734331,
      lon: -121.424698
   },

   {
      id: 0,
      stopId: 7851,
      name: "East St & Tenth Street SB",
      lat: 37.73833,
      lon: -121.42124
   },

   {
      id: 0,
      stopId: 7901,
      name: "Airport Way & 8th St Arr NB",
      lat: 37.932009,
      lon: -121.266953
   },

   {
      id: 0,
      stopId: 7903,
      name: "Aurora St & Weber Ave SB",
      lat: 37.956339,
      lon: -121.279871
   },

   {
      id: 0,
      stopId: 7904,
      name: "Aurora St & Channel St NB",
      lat: 37.956825,
      lon: -121.279945
   },

   {
      id: 0,
      stopId: 7905,
      name: "Airport Way & Sonora St SB",
      lat: 37.951198,
      lon: -121.273133
   },

   {
      id: 0,
      stopId: 7906,
      name: "Airport Way & Sonora St NB",
      lat: 37.951624,
      lon: -121.273079
   },

   {
      id: 0,
      stopId: 4145,
      name: "Pacific Ave & Walnut St NB",
      lat: 37.968376,
      lon: -121.298578
   },

   {
      id: 0,
      stopId: 4146,
      name: "Pacific Ave & Walnut St SB",
      lat: 37.968752,
      lon: -121.298894
   },

   {
      id: 0,
      stopId: 4157,
      name: "Lever Blvd & Hawaii St WB",
      lat: 37.923259,
      lon: -121.300775
   },

   {
      id: 0,
      stopId: 4158,
      name: "Lever Blvd & Donati Cir WB",
      lat: 37.923411,
      lon: -121.308108
   },

   {
      id: 0,
      stopId: 4161,
      name: "Hickock Dr & Pawnee Way SB",
      lat: 38.037976,
      lon: -121.33612
   },

   {
      id: 0,
      stopId: 4160,
      name: "Hickock Dr & Chaparral Way SB",
      lat: 38.041029,
      lon: -121.334018
   },

   {
      id: 0,
      stopId: 4164,
      name: "Ponce De Leon & Santa Maria EB",
      lat: 38.030057,
      lon: -121.321591
   },

   {
      id: 0,
      stopId: 4165,
      name: "Ponce De Leon & Santa Paula EB",
      lat: 38.030069,
      lon: -121.319727
   },

   {
      id: 0,
      stopId: 7916,
      name: "8th St & Pajaro Way EB",
      lat: 37.926635,
      lon: -121.310008
   },

   {
      id: 0,
      stopId: 4068,
      name: "Main & Shasta Ave EB",
      lat: 37.954544,
      lon: -121.247541
   },

   {
      id: 0,
      stopId: 4067,
      name: "Main & David Ave WB",
      lat: 37.954688,
      lon: -121.247206
   },

   {
      id: 0,
      stopId: 4129,
      name: "March Ln & Feather River EB",
      lat: 37.984163,
      lon: -121.347178
   },

   {
      id: 0,
      stopId: 7923,
      name: "McGaw St & Rose Marie NB",
      lat: 37.985021,
      lon: -121.32836
   },

   {
      id: 0,
      stopId: 4179,
      name: "Downing & Mourfield WB,DOWNING AVE & MOURFIELD AVE",
      lat: 37.913826,
      lon: -121.284599
   },

   {
      id: 0,
      stopId: 4183,
      name: "Dry Creek Way & Diablo Creek NB",
      lat: 37.925145,
      lon: -121.308985
   },

   {
      id: 0,
      stopId: 4185,
      name: "Bianchi Rd & Ebbet Pl WB",
      lat: 37.990858,
      lon: -121.306351
   },

   {
      id: 0,
      stopId: 4186,
      name: "Bianchi Rd & Claremont Ave EB",
      lat: 37.991341,
      lon: -121.305634
   },

   {
      id: 0,
      stopId: 9901,
      name: "Lathrop Park and Ride",
      lat: 37.82415,
      lon: -121.288709
   },

   {
      id: 0,
      stopId: 4189,
      name: "MLK Blvd & El Dorado EB",
      lat: 37.9389,
      lon: -121.28564
   },

   {
      id: 0,
      stopId: 4190,
      name: "MLK Blvd & Sutter St EB",
      lat: 37.939543,
      lon: -121.281821
   },

   {
      id: 0,
      stopId: 4195,
      name: "8th St & Lever Blvd EB",
      lat: 37.926571,
      lon: -121.297007
   },

   {
      id: 0,
      stopId: 4196,
      name: "Waterloo Rd & Report Ave EB",
      lat: 37.981883,
      lon: -121.254149
   },

   {
      id: 0,
      stopId: 4197,
      name: "Waterloo Rd & Report Ave WB",
      lat: 37.981683,
      lon: -121.254846
   },

   {
      id: 0,
      stopId: 4198,
      name: "Mathews Rd & Wolfe Rd WB",
      lat: 37.882705,
      lon: -121.301571
   },

   {
      id: 0,
      stopId: 4199,
      name: "East St & Highland Ave SB",
      lat: 37.7424,
      lon: -121.421236
   },

   {
      id: 0,
      stopId: 4205,
      name: "Oak St & El Dorado St EB",
      lat: 37.958683,
      lon: -121.291139
   },

   {
      id: 0,
      stopId: 7932,
      name: "Hammer Ln & Kathleen Dr EB",
      lat: 38.020782,
      lon: -121.296487
   },

   {
      id: 0,
      stopId: 4209,
      name: "West Lane & Morada Ln NB",
      lat: 38.03634,
      lon: -121.294823
   },

   {
      id: 0,
      stopId: 4210,
      name: "Hutchins St & Century Blvd NB",
      lat: 38.106721,
      lon: -121.278708
   },

   {
      id: 0,
      stopId: 4211,
      name: "Hutchins St & Century Blvd SB",
      lat: 38.107205,
      lon: -121.278987
   },

   {
      id: 0,
      stopId: 4212,
      name: "West Lane & Morada Ln SB",
      lat: 38.03879,
      lon: -121.295297
   },

   {
      id: 0,
      stopId: 4213,
      name: "Swain Rd & Kermit Ln WB",
      lat: 38.009572,
      lon: -121.299799
   },

   {
      id: 0,
      stopId: 4214,
      name: "Tam O'Shanter Dr & Swain Rd SB",
      lat: 38.010694,
      lon: -121.296469
   },

   {
      id: 0,
      stopId: 7950,
      name: "Manteca Transit Center Arr",
      lat: 37.794374,
      lon: -121.214285
   },

   {
      id: 0,
      stopId: 7952,
      name: "Colony Rd & Brady Ln SB",
      lat: 37.753925,
      lon: -121.136512
   },

   {
      id: 0,
      stopId: 4231,
      name: "Grouse Run Dr & March Ln NB",
      lat: 37.987606,
      lon: -121.329296
   },

   {
      id: 0,
      stopId: 4232,
      name: "Grouse Run Dr & Covey Creek Cir NB",
      lat: 37.993714,
      lon: -121.333856
   },

   {
      id: 0,
      stopId: 4233,
      name: "Grouse Run Dr & Quail Lakes Dr SB",
      lat: 37.99538,
      lon: -121.33542
   },

   {
      id: 0,
      stopId: 4234,
      name: "Grouse Run Dr & March Ln SB",
      lat: 37.98776,
      lon: -121.32953
   },

   {
      id: 0,
      stopId: 4236,
      name: "8th St & D St EB",
      lat: 37.934937,
      lon: -121.251065
   },

   {
      id: 0,
      stopId: 4238,
      name: "Maranatha Dr & Kirsten Dr NB",
      lat: 38.028509,
      lon: -121.264058
   },

   {
      id: 0,
      stopId: 4240,
      name: "Wilma Ave & Hughes Ln SB",
      lat: 37.742008,
      lon: -121.135596
   },

   {
      id: 0,
      stopId: 4241,
      name: "Main & Nikkel Ln WB",
      lat: 37.739588,
      lon: -121.139613
   },

   {
      id: 0,
      stopId: 4242,
      name: "Jack Tone Rd & Canal Blvd EB",
      lat: 37.747531,
      lon: -121.142182
   },

   {
      id: 0,
      stopId: 4245,
      name: "McDougald Blvd & Ishi Goto St NB",
      lat: 37.90973,
      lon: -121.297085
   },

   {
      id: 0,
      stopId: 4244,
      name: "McDougald Blvd & Bess Pl SB",
      lat: 37.904734,
      lon: -121.295536
   },

   {
      id: 0,
      stopId: 4243,
      name: "McDougald Blvd & Ishi Goto St SB",
      lat: 37.909497,
      lon: -121.297175
   },

   {
      id: 0,
      stopId: 4247,
      name: "8th St & D St WB",
      lat: 37.935038,
      lon: -121.25139
   },

   {
      id: 0,
      stopId: 4246,
      name: "Colony Rd & Goodwin Dr EB",
      lat: 37.75391,
      lon: -121.134219
   },

   {
      id: 0,
      stopId: 4248,
      name: "Mission Rd & Bristol Ave",
      lat: 37.969778,
      lon: -121.324221
   },

   {
      id: 0,
      stopId: 4251,
      name: "Royal Oaks Dr & Royal Park Dr WB",
      lat: 38.036886,
      lon: -121.330709
   },

   {
      id: 0,
      stopId: 4252,
      name: "Royal Oaks Dr & Lower Sac Rd WB",
      lat: 38.036929,
      lon: -121.323152
   },

   {
      id: 0,
      stopId: 7953,
      name: "East St & Grant Line Rd NB",
      lat: 37.754176,
      lon: -121.421223
   },

   {
      id: 0,
      stopId: 4253,
      name: "East St & Highland NB",
      lat: 37.742028,
      lon: -121.421109
   },

   {
      id: 0,
      stopId: 4254,
      name: "Wilcox & Waterloo NB",
      lat: 37.988192,
      lon: -121.244253
   },

   {
      id: 0,
      stopId: 4257,
      name: "California St & Ellis Street SB",
      lat: 37.976695,
      lon: -121.291634
   },

   {
      id: 0,
      stopId: 4259,
      name: "Wilson Way @ Flea Market",
      lat: 37.992074,
      lon: -121.26616
   },

   {
      id: 0,
      stopId: 4119,
      name: "Lincoln St & 6th St SB",
      lat: 37.929582,
      lon: -121.290853
   },

   {
      id: 0,
      stopId: 4260,
      name: "8th St & Pock WB",
      lat: 37.935937,
      lon: -121.247598
   },

   {
      id: 0,
      stopId: 4261,
      name: "Hwy 99 Frontage @ Boeing Way SB",
      lat: 37.911487,
      lon: -121.225932
   },

   {
      id: 0,
      stopId: 4263,
      name: "B St & Industrial Dr NB,S B ST",
      lat: 37.912302,
      lon: -121.247009
   },

   {
      id: 0,
      stopId: 4262,
      name: "B St & Industrial SB",
      lat: 37.91177,
      lon: -121.247003
   },

   {
      id: 0,
      stopId: 4265,
      name: "Ralph & B EB",
      lat: 37.922722,
      lon: -121.251471
   },

   {
      id: 0,
      stopId: 4266,
      name: "Swain & I-5 WB",
      lat: 38.000108,
      lon: -121.349897
   },

   {
      id: 0,
      stopId: 4267,
      name: "Grant Line & N. Chrisman Rd EB",
      lat: 37.754073,
      lon: -121.39776
   },

   {
      id: 0,
      stopId: 4268,
      name: "Grant Line & Skylark EB",
      lat: 37.754097,
      lon: -121.40618
   },

   {
      id: 0,
      stopId: 4269,
      name: "Grant Line & Skylark WB",
      lat: 37.754328,
      lon: -121.407805
   },

   {
      id: 0,
      stopId: 4270,
      name: "Grant Line & N. Chrisman Rd WB",
      lat: 37.75431,
      lon: -121.398766
   },

   {
      id: 0,
      stopId: 4272,
      name: "29th St & R St",
      lat: 38.564976,
      lon: -121.471636
   },

   {
      id: 0,
      stopId: 4271,
      name: "Mathews Rd & Migrant Center Eb",
      lat: 37.88231,
      lon: -121.286357
   },

   {
      id: 0,
      stopId: 4274,
      name: "MLK Blvd & French Camp Turnpike EB",
      lat: 37.9379358,
      lon: -121.2907031
   },

   {
      id: 0,
      stopId: 4275,
      name: "MLK Blvd & San Joaquin EB",
      lat: 37.9393446,
      lon: -121.2829904
   },

   {
      id: 0,
      stopId: 4276,
      name: "Mariposa & Farmington Fs",
      lat: 37.9385741,
      lon: -121.2432346
   },

   {
      id: 0,
      stopId: 4277,
      name: "MLK Blvd & B Street WB",
      lat: 37.9439158,
      lon: -121.2601271
   },

   {
      id: 0,
      stopId: 4278,
      name: "French Camp Turnpike & MLK Blvd SB",
      lat: 37.9372821,
      lon: -121.290981
   },

   {
      id: 0,
      stopId: 4279,
      name: "8th Street & French Camp Turnpike WB",
      lat: 37.926999,
      lon: -121.293125
   },

   {
      id: 0,
      stopId: 4280,
      name: "French Camp Turnpike & 7th Street NB",
      lat: 37.927704,
      lon: -121.293424
   },

   {
      id: 0,
      stopId: 4282,
      name: "Pershing & Marco Polo Drive NB",
      lat: 37.992519,
      lon: -121.323268
   },

   {
      id: 0,
      stopId: 4283,
      name: "Pershing & Venetian Drive NB",
      lat: 37.996292,
      lon: -121.324698
   },

   {
      id: 0,
      stopId: 4281,
      name: "Kirk & Alpine SB",
      lat: 37.96862,
      lon: -121.343712
   },

   {
      id: 0,
      stopId: 4284,
      name: "Uts,S UNION ST",
      lat: 37.93908,
      lon: -121.272265
   },

   {
      id: 0,
      stopId: 4290,
      name: "Ben Holt Dr. & Alturas Ave. EB",
      lat: 38.011904,
      lon: -121.310708
   },

   {
      id: 0,
      stopId: 4291,
      name: "El Dorado St. & El Campo Ave. NB",
      lat: 38.013618,
      lon: -121.308755
   },

   {
      id: 0,
      stopId: 4292,
      name: "Escalon Park N Ride & Main Street",
      lat: 37.7960635,
      lon: -120.9950425
   },

   {
      id: 0,
      stopId: 4300,
      name: "Wilma & 2nd NB",
      lat: 37.7382192,
      lon: -121.1353905
   },


];

function postAllStops(){
   for (let i = 0; i < stops.length; i++) {
      fetch('http://localhost:5000/stops', {
         method: 'POST',
         headers: {
            'content-type': 'application/json'
         },
         body: JSON.stringify(stops[i])
      })
         .then(response => {
            console.log(i);
         })
         .catch(err => {
            console.log(err);
         })
   }
}

postAllStops();