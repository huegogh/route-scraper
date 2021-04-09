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
   [1, ["Roundtrip"], ["Weekday"]],
   [2, ["Roundtrip"], ["Weekday"]],
   [3, ["Roundtrip"], ["Weekday"]],
   [4, ["North","South"], ["Weekday","Weekday"]],
   [5, ["North", "South"], ["Weekday","Weekday"]],
   [6, ["Roundtrip"], ["Weekday"]],
   [9, ["East", "West"], ["Weekday"]]
]; 

function scrapeHopperLocal(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         let Tables = [];
         direction.forEach((path, index) => Tables.push(pageTables[index]));
         console.log("----Route #" + routeNumber + "----");
         Tables.forEach((table, index) => {
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

//Start of Commuter Routes

let commuterRoutes = [
   [150, ["West", "East","West", "East"], ["Weekday","Weekday","Weekend","Weekend"] ],
   [163, ["North", "South"], ["Weekday","Weekday"] ],
];

function scrapeCommuter(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         let Tables = [];
         direction.forEach((path, index) => Tables.push(pageTables[index]));
         console.log("----Route #" + routeNumber + "----");
         Tables.forEach((table, index) => {
            let trips = []
            let stops = Object.keys(table[0]);
            table.forEach(row => {
               trips.push(Object.values(row));
            });
            let Route = {
               "route": routeNumber,
               "typeOfRoute": "Commuter",
               "typeOfDay": typeOfDay[index],
               "direction": direction[index],
               "stops": JSON.stringify(stops),
               "trips": JSON.stringify(trips)
            }
            console.log(Route);
         });
      });
}

//End of Commuter Routes


// Start of Hopper-County Routes

let hopperCountyRoutes = [
   [90, ["North","South"], ["Weekday", "Weekday"]],
   [91, ["North", "South"], ["Weekday", "Weekday"]],
   [93, ["North", "South"], ["Weekday", "Weekday"]],
   [95, ["North", "South"], ["Weekday", "Weekday"]],
   [97, ["North", "South"], ["Weekday", "Weekday"]],
]; 

function scrapeHopperCounty(routeNumber, direction, typeOfDay) {
   scraper
      .get(`https://sanjoaquinrtd.com/route-${routeNumber}/`)
      .then(pageTables => {
         let Tables = [];
         direction.forEach((path, index) => Tables.push(pageTables[index]));
         console.log("----Route #" + routeNumber + "----");
         Tables.forEach((table, index) => {
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

// End of Hopper-County Routes



hopperLocalRoutes.forEach(route => scrapeHopperLocal(...route));
brtExpressRoutes.forEach(route => scrapeBRTExpress(...route));
localRoutes.forEach(route => scrapeLocal(...route));
commuterRoutes.forEach(route => scrapeCommuter(...route));
hopperCountyRoutes.forEach(route => scrapeHopperCounty(...route));

