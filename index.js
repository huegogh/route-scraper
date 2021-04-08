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







// Call all code below here-----------------------------------------------------------
localRoutes.forEach(route => scrapeLocal(...route));
