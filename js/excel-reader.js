var DTT_file;
var Crash_file;
var Data_file;

function DTTPicked(oEvent) {
	DTT_file = oEvent.target.files[0];
}

function CrashPicked(oEvent) {
	Crash_file = oEvent.target.files[0];
}

function DataPicked(oEvent) {
	Data_file = oEvent.target.files[0];
}

function readAll() {
	readExcel(DTT_file);
	readExcel(Crash_file);
	readExcel(Data_file);
}
/*
function filePicked(oEvent) {
	readExcel(oEvent);
};
*/
function executeRefresh() {
	// Fadein animation
	$('#div-loading').fadeIn(fadeDelay);
	setTimeout(function() {
		// Read all data in
		readAll();
		
		// Fadeout animation
		setTimeout(function() {
			$('#div-loading').fadeOut(fadeDelay);
			// Toggle most important one
			$("#detail").collapse("show");
		}, fadeDelay * 5);
	}, fadeDelay);
}

function readExcel(oFile) {
	if (oFile) {
		// Get The File From The Input
		var sFilename = oFile.name;
		
		// Extra for crash tracker
		var prefix = "";
		if (sFilename && sFilename.indexOf("Crash") >= 0) {
			prefix = "Crash-"
		}
		
		// Create A File Reader HTML5
		var reader = new FileReader();

		// Ready The Event For When A File Gets Selected
		reader.onload = function(e) {
			var data = e.target.result;
			var cfb = XLSX.read(data, {type: 'binary'});
			cfb.SheetNames.forEach(function(sheetName) {
				if (sheetName != "Summary" && sheetName != "Data") {
					// Obtain The Current Row As CSV
					sheet[prefix + sheetName] = XLS.utils.sheet_to_json(cfb.Sheets[sheetName], { header:1, raw:true });
				}
			});
		};
		
		// Tell JS To Start Reading The File.. You could delay this if desired
		reader.readAsBinaryString(oFile);
	}
}