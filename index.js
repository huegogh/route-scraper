var scraper = require('table-scraper');

let localRoutes = [
   [510, ["North", "South"], "Weekday"]]//,
/*    [515, ["North", "South"], "Weekday"],
   [520, ["North", "South"], "Weekday"],
   [525, ["North", "South"], "Weekday"],
   [545, ["North", "South"], "Weekday"],
   [555, ["North", "South"], "Weekday"],
   [566, ["North", "South"], "Weekday"],
   [576, ["North", "South"], "Weekday"],
   [578, ["North", "South"], "Weekday"],
   [580, ["North", "South"], "Weekday"],
   [710, ["North", "South"], "Weekday"],
   [715, ["North", "South"], "Weekday"],
   [720, ["North", "South"], "Weekday"],
   [725, ["North", "South"], "Weekday"],
   [745, ["North", "South"], "Weekday"]
]; */
// localRoutes run the same on weekends as they do on weekdays

function scrape(routeNumber, direction, typeOfDay) {
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

localRoutes.forEach(route => scrape(...route));
