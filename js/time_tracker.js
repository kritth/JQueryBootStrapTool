// User can only have one timer running at a time
var currentTimer = {}

// In-program storage before serialized it to local storage
// Structure
// First layer key: [ 'DTT', 'TR' ]
// First layer value: [ [] ]
// Second layer key: [ Task/TC number ]
// Second layer value: [ elapsed, time start, time end (if complete) ]
var timeTracker = {}
var storage = window.localStorage

// Pull from local storage and clean if data not matched
function pullStorage() {
	if (typeof(storage) !== "undefined") {
		var today = getDate(new Date());
		
		// Clean if new date
		if (storage.getItem("trackerDate") && storage.getItem("trackerDate") != today) {
			storage.removeItem("timeTracker");
			storage.setItem("timeTracker", {});
		}
		
		storage.setItem("trackerDate", today);
		timeTracker = storage.getItem("timeTracker");
	}
}

// Every x seconds, push data to storage to save
function pushStorage() {
	storage.setItem("timeTracker", timeTracker);
	pullStorage();
}
// Create timer to constantly push
/*window.setInterval(function(){
	pushStorage()
}, 5000);
*/

// Start/continue timer when loaded/initialize new one
function startTimer() {
	
}

function updateDTTList() {
	
}

function updateTrailList() {
	
}

// Execute time tracker
function executeTimeTracker() {
	pullStorage();
}