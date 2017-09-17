function addNewDTTRow(txtToAppend, task, timelost) {
	return txtToAppend + "</td><td>"
			+ formatDigit(convertTime(task)) + "</td><td>"
			+ formatDigit(convertTime(timelost)) + "</td><td>"
			+ formatDigit(convertTime(task + timelost)) + "</td></tr>";
}

function loadDTT(dateRange, element, per_tester, per_project) {
	var tmpStore = {};
	var total_task = 0;
	var total_lost = 0;
	
	for (var d in dateRange) {
		var date_i = dateRange[d];
		var date;
		switch (date_i) {
			case 1: date = "Monday"; break;
			case 2: date = "Tuesday"; break;
			case 3: date = "Wednesday"; break;
			case 4: date = "Thursday"; break;
			case 5: date = "Friday"; break;
		}
		
		if (date) {
			var select_sheet = sheet[date];
			var txtToAppend = "";
			var toAppend = $(element + 'value');
			toAppend.empty();
			var task = 0;
			var timelost = 0;
			var previous_key_per_tester = "";
			for (var key in select_sheet) {
				// Check if valid tester
				if (testers[select_sheet[key][0]]) {
					var tester_name = testers[select_sheet[key][0]];
					// Check if it is not the first time
					if (previous_key_per_tester != "") {
						total_task = total_task + task;
						total_lost = total_lost + timelost;
						
						// Add to per tester
						if (!per_tester[previous_key_per_tester]) {
							per_tester[previous_key_per_tester] = [ 0, 0 ];
						}
						if (!tmpStore[previous_key_per_tester]) {
							tmpStore[previous_key_per_tester] = [ 0, 0 ];
						}
						per_tester[previous_key_per_tester][0] += convertTime(task + timelost);
						tmpStore[previous_key_per_tester][0] += task;
						tmpStore[previous_key_per_tester][1] += timelost;
						
						task = 0;
						timelost = 0;
					}
					
					previous_key_per_tester = tester_name;
				}
				
				// Append task data
				if (previous_key_per_tester != "" && select_sheet[key][3] && typeof select_sheet[key][3] == "number") {
					task = task + select_sheet[key][3];
					
					// Per project
					var tmp_key = select_sheet[key][1];
					if (!tmp_key) {
						tmp_key = select_sheet[key][2];
					}
					
					// Append data per project
					if (tmp_key && !per_project[tmp_key] ) {
						per_project[tmp_key]  = [ tmp_key, 0, -1 ];
					}
					per_project[tmp_key][1] += select_sheet[key][3];
				}
				
				// Append timelost data
				if (previous_key_per_tester != "" && select_sheet[key][5] && typeof select_sheet[key][5] == "number") {
					timelost += select_sheet[key][5];
				}
			}
			
			// Add to per tester
			if (!per_tester[previous_key_per_tester]) {
				per_tester[previous_key_per_tester] = [ 0, 0 ];
			}
			if (!tmpStore[previous_key_per_tester]) {
				tmpStore[previous_key_per_tester] = [ 0, 0 ];
			}
			
			// Add to last person
			per_tester[previous_key_per_tester][0] += convertTime(task + timelost);
			tmpStore[previous_key_per_tester][0] += task;
			tmpStore[previous_key_per_tester][1] += timelost;
			total_task = total_task + task;
			total_lost = total_lost + timelost;
		}
		
		for (var key in tmpStore) {
			if (key != "") {
				txtToAppend = "<tr><td>" + key;
				txtToAppend = addNewDTTRow(txtToAppend, tmpStore[key][0], tmpStore[key][1]);
				toAppend.append(txtToAppend);
			}
		}
		
		// add total
		txtToAppend = "<tr><th>Total</th><th>"
				+ formatDigit(convertTime(total_task)) + "</th><th>"
				+ formatDigit(convertTime(total_lost)) + "</th><th>"
				+ formatDigit(convertTime(total_task + total_lost)) + "</th></tr>";
		toAppend = $(element + 'footer');
		toAppend.empty();
		toAppend.append(txtToAppend);
	}
}

function getTestRun(txt, remove, per_project) {
	if (typeof txt == "string" && txt.indexOf(remove) == 0) {
		var tmp = txt.substring(remove.length, txt.length);
		var description = tmp.substring(tmp.indexOf(": ") + 2, tmp.length);
		tmp = tmp.substring(0, tmp.indexOf(": "));
		if (!per_project[tmp]) {
			per_project[tmp] = [ description, 0, -1 ]; // name of the testrun and time and completion
		}
		return tmp;
	} else {
		return "";
	}
}

function getCompletion(pct1, pct2) {
	var untest = parseInt(pct1.substring(0, pct1.indexOf("%")));
	var retest = parseInt(pct2.substring(0, pct2.indexOf("%")));
	return 100 - (untest + retest);
}

// Load testrail based on time duration in order to satisfy all the requirement by all widgets
function loadTrail(sheet_to_run, dateRange, element, per_tester, per_project) {
	var select_sheet = sheet[sheet_to_run];
	
	// Store map
	var trailTmp = { };
	var time = 0;
	var current_test_run = "";
	var milestone_name = "";
	var tmp_txt = "";
	var date_string = "";
	var current_testcase = "";
	var tcRegex = new RegExp('[T][0-9]{1,20}');
	var tcKey = "";
	var summary = "";
	var result = "";
	
	for (var key in select_sheet) {
		// Fetch milestone name
		if (milestone_name == "" && select_sheet[(parseInt(key) + 2).toString()][0]) {
			milestone_name = select_sheet[(parseInt(key) + 2).toString()][0];
			milestone_name = milestone_name.substring(milestone_name.indexOf(": ") + 2, milestone_name.length) + " ";
		}
		
		// Get testrun
		tmp_txt = getTestRun(select_sheet[key][0], milestone_name, per_project);
		if (tmp_txt != "") {
			current_test_run = tmp_txt;
		}
		
		// Get testcase
		if (select_sheet[key][0] && (select_sheet[key][0]).toString().indexOf("T") == 0) {
			tcKey = select_sheet[key][0].substring(0, select_sheet[key][0].indexOf(": "));
			// Check if correct testcase
			if (tcRegex.test(tcKey)) {
				current_testcase = tcKey;
				summary = select_sheet[key][0].substring(select_sheet[key][0].indexOf(": ") + 2, select_sheet[key][0].length);
			}
		}
		
		// Check for valid time
		if (select_sheet[key] && typeof select_sheet[key][0] == "string") {
			var tester_name = select_sheet[key][0].substring(0, select_sheet[key][0].length - 1);
			// Check valid name
			if (testers[tester_name]
					&& select_sheet[(parseInt(key) + 1).toString()]
					&& select_sheet[(parseInt(key) + 3).toString()]) {
				// Get value to compare
				var tmp = select_sheet[(parseInt(key) + 1).toString()][0];
				var date_tmp = getDate(new Date((tmp - 25569) * 86400 * 1000));
				var elapsed_tmp = select_sheet[(parseInt(key) + 3).toString()][0];
				
				// Check if it is correct and is correct row based on date
				for (var d in dateRange) {
					date_string = dateRange[d];
					if (date_tmp && date_tmp.indexOf(date_string) >= 0
							&& elapsed_tmp && elapsed_tmp.indexOf("Elapsed") >= 0) {
						if (trailTmp[tester_name] == null) {
							trailTmp[tester_name] = 0; 
						}
						// Increment value
						trailTmp[tester_name] = trailTmp[tester_name] + getTimeInSecond(elapsed_tmp);
						
						// Load into testrun
						per_project[current_test_run][1] += round(getTimeInSecond(elapsed_tmp) / 60);
						
						// Insert detail
						result = select_sheet[(parseInt(key) - 1).toString()][0];
						var toStore = [current_testcase, current_test_run, summary, result, round(getTimeInSecond(elapsed_tmp) / 60), date_tmp];
						// Testcase key and time has to be unique to store
						detailStore[testers[tester_name]][current_testcase + tmp] = toStore;
					}
				}
			}
		}
			
		// Check for completion
		if (per_project[current_test_run] && select_sheet[key].length >= 5 && select_sheet[key][2] == "Untested" && select_sheet[key][3] == "Retest") {
			// Add completion
			per_project[current_test_run][2] = getCompletion(select_sheet[(parseInt(key) + 1).toString()][2], select_sheet[(parseInt(key) + 1).toString()][3]);
			if (per_project[current_test_run][2] < 0) {
				per_project[current_test_run][2] = 0;
			}
			
			// Add failure
			var txt = select_sheet[(parseInt(key) + 1).toString()][4];
			per_project[current_test_run][3] = parseInt(txt.substring(0, txt.indexOf("%")));
			if (per_project[current_test_run][3] < 0) {
				per_project[current_test_run][3] = 0;
			}
		}
	}
	
	// Add to table
	var toAppend = $(element + 'value');
	var txtToAppend;
	var total = 0;
	for (var key in trailTmp) {
		trailTmp[key] = round(Math.round(trailTmp[key] / 60)); // Convert to minute
		txtToAppend = txtToAppend + "<tr><td>" + testers[key] + "</td><td>" + formatDigit(convertTime(trailTmp[key])) + "</td></tr>";
		total = total + round(convertTime(trailTmp[key]));
		// Add to per tester
		if (!per_tester[testers[key]]) {
			per_tester[testers[key]] = [ 0, 0 ];
		}
		per_tester[testers[key]][1] = round(convertTime(trailTmp[key]));
	}
	toAppend.append(txtToAppend);
	
	toAppend = $(element + 'footer');
	txtToAppend = "<tr><th>Total</th><th>" + formatDigit(total) + "</th></tr>";
	toAppend.empty();
	toAppend.append(txtToAppend);
}

// Load particularly for coverage in case of multiple milestones, parameter if the sheetname of the milestone
function loadCoverage(milestone) {
	// Clear data
	coverageStore = {};
	
	// Select the correct sheet
	var select_sheet = sheet[milestone];
	
	// Variables
	var tcRegex = new RegExp('[T][0-9]{1,20}');
	var current_testcase = "";
	var current_feature = "";
	var tester_name = "";
	var toStore;
	
	for (var key in select_sheet) {
		var excel_row = select_sheet[key];
		
		// Get testcase
		if (excel_row[0] && (excel_row[0]).toString().indexOf("T") == 0) {
			tcKey = excel_row[0].substring(0, excel_row[0].indexOf(": "));
			// Check if correct testcase
			if (tcRegex.test(tcKey)) {
				current_testcase = tcKey;
				current_feature = select_sheet[(parseInt(key) + 3).toString()][3];
				current_feature = current_feature.substring(("Feature ").length, current_feature.length);
				
				// If feature is not registered yet
				if (!coverageStore[current_feature]) {
					coverageStore[current_feature] = {};
				}
			}
		}
		
		// Consume next result
		if (excel_row[0] && typeof excel_row[0] == "string" && excel_row[0].indexOf("Elapsed ") == 0) {
			// Get from 3 row above for tester name
			var name_from_sheet = select_sheet[(parseInt(key) - 3).toString()][0];
			if (typeof name_from_sheet == "string") {
				if (name_from_sheet.indexOf(".") == name_from_sheet.length - 1) {
					name_from_sheet = name_from_sheet.substring(0, name_from_sheet.length - 1);
				}
				tester_name = testers[name_from_sheet];
				
				if (!coverageStore[current_feature][tester_name]) {
					coverageStore[current_feature][tester_name] = [];
				}
				
				// Now the array "should" be unique because the excel should not be duplicated and the array is clean everything this function runs
				var elapsed_tmp = select_sheet[(parseInt(key)).toString()][0];
				toStore = [current_testcase, select_sheet[(parseInt(key) - 2).toString()][0], round(getTimeInSecond(elapsed_tmp) / 60)];
				coverageStore[current_feature][tester_name].push(toStore);
			}
		}
	}
}

// Load TFC
function loadTfc() {
	tfcStore = {};
	var select_sheet = sheet["Testcases_Details"];
	
	if (select_sheet) {
		// Variables
		var tcRegex = new RegExp('[C][0-9]{1,20}');
		var tcKey = "";
		var feature = "";
		var summary = "";
		var type = "";
		var consumeNextTag = false;
		var ind = 0;
		
		for (var rowInd in select_sheet) {
			if (select_sheet[rowInd][0] && typeof select_sheet[rowInd][0] == "string") {
				// Test if it's tc
				tcKey = select_sheet[rowInd][0].substring(0, select_sheet[rowInd][0].indexOf(": "));
				if (tcRegex.test(tcKey)) {
					type = select_sheet[(parseInt(rowInd) + 2).toString()][0];
					if (type && typeof type =="string" && type == "Type Acceptance") {
						feature = select_sheet[(parseInt(rowInd) + 3).toString()][2];
						feature = feature.substring(("Feature ").length, feature.length);
						summary = select_sheet[rowInd][0].substring(select_sheet[rowInd][0].indexOf(": ") + 2, select_sheet[rowInd][0].length);
						
						// Check if feature existed
						if (!tfcStore[feature]) {
							tfcStore[feature] = [];
						}
						
						// Push
						tfcStore[feature][ind] = [tcKey, summary, ""];
						ind += 1;
						consumeNextTag = true;
					}
				}
				
				// Test to consume tag
				if (consumeNextTag) {
					if (select_sheet[rowInd][0].indexOf("Release Tag") == 0) {
						var release_tag = select_sheet[(parseInt(rowInd) + 1).toString()][0];
						if (release_tag) {
							tfcStore[feature][ind - 1][2] = release_tag;  
							consumeNextTag = false;
						}
					}
				}
			}
		}
		
		updateTfcSelector();
	}
}