// Required stuff
var scraper = require('table-scraper');


//Code for Local Routes only
let localRoutes = [
   [510, ["North", "South"], "Weekday"],
   [515, ["North", "South"], "Weekday"],
   [520, ["North", "South"], "Weekday"],
   [525, ["East", "West"], "Weekday"],
   [545, ["East", "West"], "Weekday"],
   [555, ["North", "South"], "Weekday"],
   [566, ["North", "South"], "Weekday"],
   [576, ["North", "South"], "Weekday"],
   [578, ["North", "South"], "Weekday"],
   [580, ["North", "South"], "Weekday"],
   [710, ["North", "South"], "Weekend"],
   [715, ["East", "West"], "Weekend"],
   [720, ["North", "South"], "Weekend"],
   [725, ["East", "West"], "Weekend"],
   [745, ["East", "West"], "Weekend"]
];

function scrapeLocal(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         pageTables = [pageTables[0], pageTables[1]];
         console.log("----Route #" + routeNumber + "----");
         pageTables.forEach((table, index) => {
            let trips = []
            let stops = Object.keys(table[0]);
            table.forEach(row => {
               trips.push(Object.values(row));
            });
            let Route = {
               "route": routeNumber,
               "typeOfRoute": "Local",
               "typeOfDay": typeOfDay,
               "direction": direction[index],
               "stops": JSON.stringify(stops),
               "trips": JSON.stringify(trips)
            }
            console.log(Route);
         });
      });
}
// End of Local Routes

// Start of BRT Express Routes

let brtExpressRoutes = [
   [40, ["North", "South","North","South"], ["Weekday","Weekday","Weekend","Weekend"]],//,
   [43, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   [44, ["North", "South","North","South"], ["Weekday","Weekday","Weekend","Weekend"]],
   [47, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   [49, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
]; 

function scrapeBRTExpress(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         pageTables = [pageTables[0], pageTables[1],pageTables[2],pageTables[3]];
         console.log("----Route #" + routeNumber + "----");
         pageTables.forEach((table, index) => {
            let trips = []
            let stops = Object.keys(table[0]);
            table.forEach(row => {
               trips.push(Object.values(row));
            });
            let Route = {
               "route": routeNumber,
               "typeOfRoute": "BRT Express",
               "typeOfDay": typeOfDay[index],
               "direction": direction[index],
               "stops": JSON.stringify(stops),
               "trips": JSON.stringify(trips)
            }
            console.log(Route);
         });
      });
}


// End of BRT Express Routes

// Start of Hopper-Local Routes

let hopperLocalRoutes = [
   [1, ["Roundtrip"], ["Weekday"]],//,
   // [2, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   // [3, ["North", "South","North","South"], ["Weekday","Weekday","Weekend","Weekend"]],
   // [4, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   // [5, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   // [6, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
   // [9, ["East", "West","East","West"], ["Weekday","Weekday","Weekend","Weekend"]],
]; 

function scrapeHopperLocal(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         direction.forEach(() => {
            pageTables.push('');
            console.log("test");
         });
         console.log("----Route #" + routeNumber + "----");
         pageTables.forEach((table, index) => {
            let trips = []
            let stops = Object.keys(table[0]);
            table.forEach(row => {
               trips.push(Object.values(row));
            });
            let Route = {
               "route": routeNumber,
               "typeOfRoute": "Hopper-Local",
               "typeOfDay": typeOfDay[index],
               "direction": direction[index],
               "stops": JSON.stringify(stops),
               "trips": JSON.stringify(trips)
            }
            console.log(Route);
         });
      });
}

// End of Hopper-Local Routes


// Call all code below here-----------------------------------------------------------
//brtExpressRoutes.forEach(route => scrapeBRTExpress(...route));
//localRoutes.forEach(route => scrapeLocal(...route));
hopperLocalRoutes.forEach(route => scrapeHopperLocal(...route));

