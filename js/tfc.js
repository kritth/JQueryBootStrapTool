// table structure
// key = feature
// value = [ [  key, summary ] ]
var tfcStore = {};

function updateTfcSelector() {
	var selector = $('#tfc-selector').empty();
	selector.append('<option value="none" selected>Select feature</option>');
	for (var feature in tfcStore) {
		selector.append('<option value="' + feature + '">' + feature + '</option>');
	}
}

function tfcSelectorChanged() {
	var selected_feature = $('#tfc-selector option:selected').val();
	if (selected_feature != "none") {
		executeTfc(selected_feature);
	}
}

function executeTfc(feature) {
	var toAppend = $('#tfc-body');
	var txtToAppend = "";
	toAppend.empty();
	if (tfcStore[feature]) {
		for (var ind in tfcStore[feature]) {
			txtToAppend = "<tr><td><a href='#" + tfcStore[feature][ind][0].substring(1, tfcStore[feature][ind][0].length)  + "/' target='_blank'>"
				+ tfcStore[feature][ind][0] + "</a></td><td>" + tfcStore[feature][ind][1] + "</td><td>" + tfcStore[feature][ind][2] + "</td></tr>";
			toAppend.append(txtToAppend);
		}
	}
}