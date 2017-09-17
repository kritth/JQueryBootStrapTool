// Table structure
// key: name of tester
// value: [ DTT time, Testrail time ]
var dailyPerTester = {};
// Table structure
// key: Testrun number / DTT task
// value: [ Name of the task / testrun, timespent, completion rate, failure rate ]
var dailyPerProject = {};
// Table structure
// key: name of tester
// value: [ number of issues ]
var dailyJIRA = {};

function executeDaily() {
	// Clean slate
	dailyPerTester = {};
	dailyPerProject = {};
	
	console.log("Running daily");
	
	// Functions
	for (var key in sheet) {
		if (key.indexOf("Milestone") == 0) {
			addToDailyTrail(key);
		}
	}
	addToDailyDTT();
	addDailyPerTester();
	addDailyPerProject();
}

function addToDailyDTT() {
	loadDTT([ new Date().getDay() ], "#hours-daily-dtt-", dailyPerTester, dailyPerProject);
}

function addToDailyTrail(sheet_to_run) {
	loadTrail(sheet_to_run, [ getDate(new Date()) ], '#hours-daily-trail-', dailyPerTester, dailyPerProject);
}

function addDailyPerTester() {
	var toAppend = $('#hours-tester-daily-summary-value');
	var txtToAppend = "";
	var dtt_total = 0;
	var trail_total = 0;
	for (var key in dailyPerTester) {
		if (key != "") {
			txtToAppend = txtToAppend + "<tr><td>" + key + "</td><td id='hours-tester-daily-summary-total-" + key.replace(" ", "_") + "'>"
				+ formatDigit(dailyPerTester[key][0]) + "</td><td>"
				+ formatDigit(dailyPerTester[key][1]) + "</td><td>"
				+ formatDigit(dailyPerTester[key][0] + dailyPerTester[key][1]) + "</td></tr>"
			dtt_total = dtt_total + dailyPerTester[key][0];
			trail_total = trail_total + dailyPerTester[key][1];
		}
	}
	
	toAppend.empty();
	toAppend.append(txtToAppend);
	
	toAppend = $('#hours-tester-daily-summary-footer');
	txtToAppend = "<tr><th>Total</th><th id='hours-tester-daily-summary-total'>" + formatDigit(dtt_total) + "</th><th>" + formatDigit(trail_total) + "</th><th>" + formatDigit(dtt_total + trail_total) + "</th></tr>";
	toAppend.empty();
	toAppend.append(txtToAppend);
}

function addDailyPerProject() {
	var toAppend = $('#hours-project-daily-summary-value');
	var txtToAppend = "";
	var total = 0;
	for (var key in dailyPerProject) {
		if (dailyPerProject[key][1] > 0) {
			txtToAppend += "<tr><td>";
			
			// Add key only if it's testrun
			if (key != dailyPerProject[key][0]) {
				txtToAppend += "<a href='#" + key.substring(1, key.length) + "/' target='_blank'>" + key + "</a>";
			}
			
			// Add name 
			txtToAppend += "</td><td>"
				+ dailyPerProject[key][0] + "</td><td>";
			
			// Check completion
			if (dailyPerProject[key][2] != -1) {
				txtToAppend += dailyPerProject[key][2] + "%";
			} else {
				if (key != dailyPerProject[key][0]) {
					txtToAppend += "0%";
				}
			}
			txtToAppend += "</td><td>"
			
			// Check failure
			if (dailyPerProject[key][3]) {
				txtToAppend += dailyPerProject[key][3] + "%";
			} else {
				if (key != dailyPerProject[key][0]) {
					txtToAppend += "0%";
				}
			}
			
			// Add time
			txtToAppend += "</td><td>"
				+ formatDigit(convertTime(dailyPerProject[key][1])) + "</td></tr>"
			
			// Add to total
			total += dailyPerProject[key][1];
		}
	}
	
	toAppend.empty();
	toAppend.append(txtToAppend);
	
	toAppend = $('#hours-project-daily-summary-footer');
	txtToAppend = "<tr><th colspan='4'>Total</th><th>" + formatDigit(convertTime(total)) + "</th></tr>";
	toAppend.empty();
	toAppend.append(txtToAppend);
}