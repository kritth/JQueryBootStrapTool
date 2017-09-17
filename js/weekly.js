// Table structure
// key: name of tester
// value: [ DTT time, Testrail time ]
var weeklyPerTester = {};
// Table structure
// key: Testrun number / DTT task
// value: [ Name of the task / testrun, timespent, completion rate, failure rate ]
var weeklyPerProject = {};
// Table structure
// key: name of tester
// value: [ number of issues ]
var weeklyJIRA = {};

function executeWeekly() {
	// Clean slate
	weeklyPerTester = {};
	weeklyPerProject = {};
	
	// Functions
	console.log("Running weekly");
	$('#hours-weekly-dtt-value').empty();
	for (var key in sheet) {
		if (key.indexOf("Milestone") == 0) {
			addToWeeklyTrail(key);
		}
	}
	addToWeeklyDTT();
	addWeeklyPerTester();
	addWeeklyPerProject();
}

function addToWeeklyDTT() {
	loadDTT([ 1, 2, 3, 4, 5 ], "#hours-weekly-dtt-", weeklyPerTester, weeklyPerProject);
}

function addToWeeklyTrail(sheet_name) {
	var date_list = [];
	var day = new Date().getDay();
	var date = new Date();
	while (day > 0) {
		date_list.push(getDate(date));
		day -= 1;
		date.setDate(date.getDate() - 1);
	}
	loadTrail(sheet_name, date_list, '#hours-weekly-trail-', weeklyPerTester, weeklyPerProject);
}

function addWeeklyPerTester() {
	var toAppend = $('#hours-tester-weekly-summary-value');
	var txtToAppend = "";
	var dtt_total = 0;
	var trail_total = 0;
	for (var key in weeklyPerTester) {
		if (key != "") {
			txtToAppend = txtToAppend + "<tr><td>" + key + "</td><td id='hours-tester-weekly-summary-total-" + key.replace(" ", "_") + "'>"
				+ formatDigit(weeklyPerTester[key][0]) + "</td><td>"
				+ formatDigit(weeklyPerTester[key][1]) + "</td><td>"
				+ formatDigit(weeklyPerTester[key][0] + weeklyPerTester[key][1]) + "</td></tr>"
			dtt_total = dtt_total + weeklyPerTester[key][0];
			trail_total = trail_total + weeklyPerTester[key][1];
		}
	}
	
	toAppend.empty();
	toAppend.append(txtToAppend);
	
	toAppend = $('#hours-tester-weekly-summary-footer');
	txtToAppend = "<tr><th>Total</th><th id='hours-tester-weekly-summary-total'>" + formatDigit(dtt_total) + "</th><th>" + formatDigit(trail_total) + "</th><th>" + formatDigit(dtt_total + trail_total) + "</th></tr>";
	toAppend.empty();
	toAppend.append(txtToAppend);
}

function addWeeklyPerProject() {
	var toAppend = $('#hours-project-weekly-summary-value');
	var txtToAppend = "";
	var total = 0;
	for (var key in weeklyPerProject) {
		if (weeklyPerProject[key][1] > 0) {
			txtToAppend += "<tr><td>";
			
			// Add key only if it's testrun
			if (key != weeklyPerProject[key][0]) {
				txtToAppend += "<a href='#" + key.substring(1, key.length) + "/' target='_blank'>" + key + "</a>";
			}
			
			// Add name 
			txtToAppend += "</td><td>"
				+ weeklyPerProject[key][0] + "</td><td>";
			
			// Check completion
			if (weeklyPerProject[key][2] != -1) {
				txtToAppend += weeklyPerProject[key][2] + "%";
			}  else {
				if (key != weeklyPerProject[key][0]) {
					txtToAppend += "0%";
				}
			}
			txtToAppend += "</td><td>";
			
			// Check failure
			if (weeklyPerProject[key][3]) {
				txtToAppend += weeklyPerProject[key][3] + "%";
			} else {
				if (key != weeklyPerProject[key][0]) {
					txtToAppend += "0%";
				}
			}
			
			// Add time
			txtToAppend += "</td><td>"
				+ formatDigit(convertTime(weeklyPerProject[key][1])) + "</td></tr>"
			
			// Add to total
			total += weeklyPerProject[key][1];
		}
	}
	
	toAppend.empty();
	toAppend.append(txtToAppend);
	
	toAppend = $('#hours-project-weekly-summary-footer');
	txtToAppend = "<tr><th colspan='4'>Total</th><th>" + formatDigit(convertTime(total)) + "</th></tr>";
	toAppend.empty();
	toAppend.append(txtToAppend);
}