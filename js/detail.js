// Table Structure
// first layer key: name of tester
// first layer value: [ [] ]
// second layer key: TC number + Completed date/time
// second layer: [ testcase Id, testrun Id, Summary, Result, Time spent in minute, date performed ]
var detailStore = {};

var textAll = "All";
var summaryToday = 0;
var summaryWeekly = 1;

$(document).ready(function() {
	detailStore[textAll] = {};
	for (var acronym in testers) {
		if (!detailStore[testers[acronym]]) {
			detailStore[testers[acronym]] = {};
		}
	}
	
	var element = $('#tester-selector');
	for (var name in detailStore) {
		element.append("<option value='" + name + "'>" + name + "</option>");
	}
});

function clearDetail() {
	for (var name in detailStore) {
		detailStore[name] = {};
	}
}

function executeDetail() {
	switchDetailDropdown();
}

function getDetailTcText(tc) {
	var row_class = "";
	switch (tc[3]) {
		case "Passed": row_class = "success"; break;
		case "Failed": row_class = "danger"; break;
		case "Blocked": row_class = "info"; break;
	}
	
	return "<tr class='" + row_class + "'><td>" 
		+ "<a href='#" + tc[0].substring(1, tc[0].length) + "/' target='_blank'>" + tc[0] + "</a></td><td>"  // testcase
		+ "<a href='#" + tc[1].substring(1, tc[1].length) + "/' target='_blank'>" + tc[1] + "</a></td><td>"  // testrun
		+ tc[2] + "</td><td>"  // summary
		+ tc[3] + "</td><td>"  // result
		+ formatDigit(convertTime(tc[4])) + "</td></tr>";	// elapsed
}

function switchDetailDropdown() {
	var toAppend = $('#trail-tc-detail-value');
	var ctr = 0;
	var jira_ctr = 0;
	var total = 0;
	var dtt_total;
	toAppend.empty();
	
	var toFilter = $('#tester-selector option:selected').val();
	var dateFilter = $('#trail-date-selector option:selected').val();
	if (toFilter != 0) {
		if (toFilter == textAll) {
			// Loop through name
			for (var name in detailStore) {
				// Loop through result
				for (var tc in detailStore[name]) {
					if ((dateFilter == summaryToday && detailStore[name][tc][5] == getDate(new Date()))
							|| dateFilter == summaryWeekly) {
						toAppend.append(getDetailTcText(detailStore[name][tc]));
						ctr += 1;
						total += detailStore[name][tc][4];
					}
				}
			}
			
			// Get dtt number and jira count
			if (dateFilter == summaryToday) {
				dtt_total = $('#hours-tester-daily-summary-total').text();
				for (var name in dailyJIRA) {
					jira_ctr += dailyJIRA[name];
				}
			} else {
				dtt_total = $('#hours-tester-weekly-summary-total').text();
				for (var name in weeklyJIRA) {
					jira_ctr += weeklyJIRA[name];
				}
			}
		} else {
			// Format [ testcase Id, testrun Id, Summary, Result, Time spent in minute, date performed ]
			for (var tc in detailStore[toFilter]) {
				if ((dateFilter == summaryToday && detailStore[toFilter][tc][5] == getDate(new Date()))
						|| dateFilter == summaryWeekly) {
					toAppend.append(getDetailTcText(detailStore[toFilter][tc]));
					ctr += 1;
					total += detailStore[toFilter][tc][4];
				}
			}
			
			// Get dtt number and jira count
			if (dateFilter == summaryToday) {
				dtt_total = $('#hours-tester-daily-summary-total-' + toFilter.replace(" ", "_")).text();
				jira_ctr = dailyJIRA[toFilter];
			} else {
				dtt_total = $('#hours-tester-weekly-summary-total-' + toFilter.replace(" ", "_")).text();
				jira_ctr = weeklyJIRA[toFilter];
			}
		}
		
		if (!dtt_total || dtt_total == "") {
			dtt_total = "0";
		}
		
		if (!jira_ctr || jira_ctr == "") {
			jira_ctr = 0;
		}
		
		// Overall timespent
		toAppend = $('#overall-time');
		toAppend.empty();
		toAppend.append(formatDigit(convertTime(total) + Number(dtt_total)));
		
		// Trail time spent
		toAppend = $('#trail-timespent');
		toAppend.empty();
		toAppend.append(formatDigit(convertTime(total)));
		
		// DTT time spent
		toAppend = $('#DTT-timespent');
		toAppend.empty();
		toAppend.append(dtt_total);
		
		// Trail performed
		toAppend = $('#trail-performed');
		toAppend.empty();
		toAppend.append(ctr);
		
		// Issue written
		toAppend = $('#jira-written');
		toAppend.empty();
		toAppend.append(jira_ctr);
	}
}