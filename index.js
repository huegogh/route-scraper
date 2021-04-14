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

postAllRoutes();




