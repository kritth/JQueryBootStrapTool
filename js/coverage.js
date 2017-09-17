// Table structure
// first layer key: feature
// first layer value: [ [] ]
// second layer key: name of tester
// second layer value: [ [TC id, completed date/time, elapsed] ]
// Other value in there beside elapsed may be used later so leaving it in there for now
var coverageStore = {};
var ranking = [];
var missing = [];		// This is currently not used yet
var milestone_total_time = 0;
var max_rank_amount = 15;

function createCoverageEntry(current_id, direction) {
	var body = '<tr>'
		+ '<td>'
			+ '<div id="coverage-' + direction + '-' + current_id + '">'
				+ '<div class="panel-heading container-fluid">'
					+'<div class="panel-title row">'
						+ '<div class="col-md-8">'
							+ '<a href="#coverage-' + direction + '-' + current_id + '-detail" data-toggle="collapse">'
								+ '<span id="coverage-' + direction + '-' + current_id + '-feature"></span> <b class="caret"></b>'
							+ '</a>'
						+ '</div>'
						+ '<div class="col-md-2">'
							+ '<span id="coverage-' + direction + '-' + current_id + '-percentage"></span>'
						+ '</div>'
						+ '<div class="col-md-2">'
							+ '<span id="coverage-' + direction + '-' + current_id + '-time"></span>'
						+ '</div>'
					+ '</div>'
				+ '</div>'
				+ '<div id="coverage-' + direction + '-' + current_id + '-detail" class="panel-collapse collapse no-padding">'
					+ '<table class="table table-bordered table-striped no-padding">'
						+ '<thead>'
							+ '<tr>'
								+ '<th>Name</th>'
								+ '<th>Time spent</th>'
							+ '</tr>'
						+ '</thead>'
						+ '<tbody id="coverage-' + direction + '-' + current_id + '-detail-body">'
						+ '</tbody>'
					+ '</table>'
				+ '</div>'
			+ '</div>'
		+ '</td>'
	+ '</tr>';
	
	return body;
}

function createRow(testerName, timeSpent) {
	return '<tr><td>' + testerName + '</td><td>' + timeSpent + '</td></tr>';
}

function updateCoverageSelector() {
	var selector = $('#coverage-selector').empty();
	selector.append('<option value="none">Select milestone</option>');
	for (var sheet_name in sheet) {
		if (sheet_name.indexOf("Milestone_") == 0) {
			selector.append('<option value="' + sheet_name + '">' + sheet_name + '</option>');
		}
	}
}

function coverageSelectorChanged() {
	var selected_milestone = $('#coverage-selector option:selected').val();
	if (selected_milestone != "none") {
		loadCoverage(selected_milestone);
		executeCoverage();
		$('#coverage-top').collapse("show");
	}
}

function createChart() {
	/*var ctxL = document.getElementById("lineChart").getContext('2d');
	var myLineChart = new Chart(ctxL, {
		type: 'line',
		data: {
			labels: ["January", "February", "March", "April", "May", "June", "July"],
			datasets: [
				{
					label: "My First dataset",
					fillColor: "rgba(220,220,220,0.2)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: [65, 59, 80, 81, 56, 55, 40]
				},
				{
					label: "My Second dataset",
					fillColor: "rgba(151,187,205,0.2)",
					strokeColor: "rgba(151,187,205,1)",
					pointColor: "rgba(151,187,205,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: [28, 48, 40, 19, 86, 27, 90]
				}
			]
		},
		options: {
			responsive: true
		}    
	});*/
}

function executeCoverage() {
	console.log("Running Coverage update");
	
	coverageTopCounter = 0;
	coverageBottomCounter = 0;
	milestone_total_time = 0;
	
	$('#coverage-top-body').empty();
	$('#coverage-least-body').empty();

	// Have to sacrifice some performance for now
	// First iteration to look for ranking
	ranking = [];
	missing = [];
	var total = 0;
	
	for (var feature in coverageStore) {
		total = 0;
		// Accumulate time inside tester
		for (var tester_name in coverageStore[feature]) {
			for (var index in coverageStore[feature][tester_name]) {
				var ary = coverageStore[feature][tester_name][index];
				// Increment time
				if (ary[2]) {
					total += ary[2];
				}
			}
		}
		
		// Check if put in ranking or missing
		if (total > 0) {
			ranking.push([ feature, total ]);
		} else {
			missing.push([ feature, total ]);
		}
		
		// check total time
		milestone_total_time += total;
	}
	
	ranking.sort(compareTop);	
	
	createCoverageTable();
	
	createChart();
}

function compareTop(ary1, ary2) {
	return ary2[1] - ary1[1];
}

function compareBottom(ary1, ary2) {
	return ary1[1] - ary2[1];
}

function getCoverageTester(feature) {
	var txtToAppend = "";
	var total = 0;
	
	if (coverageStore[feature]) {
		for (var tester_name in coverageStore[feature]) {
			total = 0;
			
			// Loop through the tc
			for (var tcInd in coverageStore[feature][tester_name]) {
				var tc = coverageStore[feature][tester_name][tcInd];
				if (tc[2] && typeof tc[2] == "number") {
					total += tc[2];
				}
			}
			
			// append to result
			txtToAppend += "<tr><td>" + tester_name + "</td><td>" + formatDigit(convertTime(total)) + "</td></tr>";
		}
	}
	
	return txtToAppend;
}

function createCoverageTable(isTop) {
	$('#coverage-top-body').empty();
	$('#coverage-least-body').empty();

	var bottomRank = 0;
	var percentage = 0;
	
	// Create the table
	for (var i = 0; i < max_rank_amount; i++) {
		bottomRank = ranking.length - i;
		
		if (ranking[i]) {
			$('#coverage-top-body').append(createCoverageEntry(i, "top"));
			$('#coverage-top-' + i + '-feature').append(ranking[i][0]);
			percentage = ranking[i][1] / milestone_total_time * 100;
			$('#coverage-top-' + i + '-percentage').append(Math.round(percentage) + '%');
			$('#coverage-top-' + i + '-time').append(formatDigit(convertTime(ranking[i][1])))
			
			// Insert tester
			$('#coverage-top-' + i + '-detail-body').append(getCoverageTester(ranking[i][0]));
		}
		
		if (ranking[bottomRank]) {
			$('#coverage-least-body').append(createCoverageEntry(i, "least"));
			$('#coverage-least-' + i + '-feature').append(ranking[bottomRank][0]);
			percentage = ranking[bottomRank][1] / milestone_total_time * 100;
			$('#coverage-least-' + i + '-percentage').append(formatDigit(percentage) + '%');
			$('#coverage-least-' + i + '-time').append(formatDigit(convertTime(ranking[bottomRank][1])))
			
						// Insert tester
			$('#coverage-least-' + i + '-detail-body').append(getCoverageTester(ranking[bottomRank][0]));
		}
	}
}