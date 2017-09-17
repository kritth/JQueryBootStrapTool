var jiraCounter = 0;

function executeJIRA() {
	// Functions
	console.log("Running JIRA");
	$('#jira-body').empty();
	// Reset daily and weekly
	dailyJIRA = {};
	weeklyJIRA = {};
	
	for (var key in sheet) {
		if (key.indexOf("JIRA") == 0) {
			addToJira(key);
		}
	}
}

// Create table for jira
function createWrapper(filterId, filterName) {
	return '<div class="panel panel-default"><div class="panel-heading"><h2 class="panel-title"><a href="#jira-' + filterId + '" data-toggle="collapse">' + filterName + ' <b class="caret"></b></a>'
					+ '</h2></div><div id="jira-' + filterId + '" class="panel-collapse collapse in">'
					// Severity table
					+ '<a data-toggle="collapse" data-target="#jira-' + filterId + '-table" style="cursor: pointer;">'
					+ '<table class="table table-striped panel-body severity-table">'
					+ '<thead class="thead-default"><tr>'
					+ '<th style="width: 100px;">Severity <b class="caret"></b></th>'
					+ '<th>A</th>'
					+ '<th>B</th>'
					+ '<th>C</th>'
					+ '<th>D</th>'
					+ '<th>Total</th>'
					+ '</tr></thead><tbody id="jira-severity-' + filterId + '-value">'
					+ '<tr><th>Amount</th>'
					+ '<th id="jira-severity-' + filterId + '-A" class="row"></th>'
					+ '<td id="jira-severity-' + filterId + '-B"></td>'
					+ '<td id="jira-severity-' + filterId + '-C"></td>'
					+ '<td id="jira-severity-' + filterId + '-D"></td>'
					+ '<td id="jira-severity-' + filterId + '-total"></td>'
					+ '</tr></tbody></table></a>'
					// Issue table
					+ '<div id="jira-' + filterId + '-table" class="collapse"><table class="table table-striped panel-body">'
					+ '<thead class="thead-default"><tr>'
					+ '<th style="width: 100px;">Detail</th>'
					+ '<th>Severity</th>'
					+ '<th style="text-align:center;">Summary</th>'
					+ '<th style="width: 100px;">Status</th>'
					+ '</tr></thead><tbody id="jira-' + filterId + '-A-value">'
					+ '</tbody><tbody id="jira-' + filterId + '-B-value">'
					+ '</tbody><tbody id="jira-' + filterId + '-C-value">'
					+ '</tbody><tbody id="jira-' + filterId + '-D-value">'
					+ '</tbody></table></div></div></div></div>';
}

function addToJira(sheet_name) {
	var select_sheet = sheet[sheet_name];
	var tmpAry = {};
	var txtToAppend = "";
	
	// Column
	var id = 0;
	var severity = 0;
	var summary = 0;
	var status = 0;
	var createdBy = 0;
	var header = "";
	var name = sheet_name.substring("JIRA_".length, sheet_name.length);
	
	// Get name of project
	if (select_sheet[1][0]) {
		$('#jira-body').append(createWrapper(jiraCounter, select_sheet[1][0]));
		
		for (var key in select_sheet) {
			if (select_sheet[key][0]) {
				// Initialize the header
				if (select_sheet[key][0] == "Key") {
					for (var i in select_sheet[key]) {
						if (select_sheet[key][i]) {
							// Get correct column
							header = select_sheet[key][i];
							switch(header) {
								case "Key": id = i; break;
								case "Severity": severity = i; break;
								case "Summary": summary = i; break;
								case "Status": status = i; break;
								case "Reporter": createdBy = i; break;
							}
						}
					}
				}
				
				// Check if it's data
				if (select_sheet[key][id] && select_sheet[key][id].indexOf("PR-") == 0) {
					if (!tmpAry[select_sheet[key][id]]) {
						// create map
						tmpAry[select_sheet[key][id]] = [ select_sheet[key][severity], select_sheet[key][summary], select_sheet[key][status] ];
						
						// Add to counter
						if (select_sheet[key][createdBy]) {
							var tester_name = testers[select_sheet[key][createdBy].substring(0, select_sheet[key][createdBy].indexOf(" ("))];
							var ptr;
							
							// check if daily or weekly
							if (name == "Daily") {
								ptr = dailyJIRA;
							} else if (name == "Weekly") {
								ptr = weeklyJIRA
							}
							
							// check if existed
							if (ptr) {
								if (!ptr[tester_name]) {
									ptr[tester_name] = 0;
								}
								
								// Increment counter
								ptr[tester_name] += 1;
							}
						}
					}
				}
			}
		}
		
		var counta = 0;
		var countb = 0;
		var countc = 0;
		var countd = 0;
		
		$('#jira-' + jiraCounter +  '-A-value').empty();
		$('#jira-' + jiraCounter +  '-B-value').empty();
		$('#jira-' + jiraCounter +  '-C-value').empty();
		$('#jira-' + jiraCounter +  '-D-value').empty();
		
		for (var key in tmpAry) {
			txtToAppend = "<tr><td><a href='#" + key + "'>" + key + "</a></td><td style='text-align: center;'>" + tmpAry[key][0] + "</td><td>" + tmpAry[key][1] + "</td><td>" + tmpAry[key][2] + "</td></tr>";
			switch(tmpAry[key][0]) {
				case "A":
					$('#jira-' + jiraCounter +  '-A-value').append(txtToAppend);
					counta += 1;
					break;
				case "B":
					$('#jira-' + jiraCounter +  '-B-value').append(txtToAppend);
					countb += 1;
					break;
				case "C":
					$('#jira-' + jiraCounter +  '-C-value').append(txtToAppend);
					countc += 1;
					break;
				case "D":
					$('#jira-' + jiraCounter +  '-D-value').append(txtToAppend);
					countd += 1;
					break;
			}
		}
		
		// Add total
		$('#jira-severity-' + jiraCounter + '-A').html(counta);
		$('#jira-severity-' + jiraCounter + '-B').html(countb);
		$('#jira-severity-' + jiraCounter + '-C').html(countc);
		$('#jira-severity-' + jiraCounter + '-D').html(countd);
		$('#jira-severity-' + jiraCounter + '-total').html(counta + countb + countc + countd);
		
		jiraCounter += 1;
	}
}