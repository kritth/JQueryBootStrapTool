var sheet = {};
var fadeDelay = 300;
var warning_count = 4;

$(document).ready(function() {
	setTimeout(function() { $('#div-loading').fadeOut(fadeDelay); }, fadeDelay);
	toggleCheckbox('#checkbox-tfc');
	toggleCheckbox('#checkbox-daily');
	toggleCheckbox('#checkbox-weekly');
	toggleCheckbox('#checkbox-jira');
	toggleCheckbox('#checkbox-coverage');
	toggleCheckbox('#checkbox-crash');
	toggleCheckbox('#checkbox-hindrance');
	toggleCheckbox('#checkbox-timelost');
	toggleCheckbox('#checkbox-testcases');
	
	setTimeout(function() { toggleSwitch = true; }, 2000);
});

function decrementWarning() {
	if (warning_count <= 0) {
		$('#warning-popup').fadeOut(100);
	} else {
		// To avoid being too negative in case warning popup may be used after
		warning_count--;
	}
}

$('ul.nav li.dropdown').hover(function() {
  if (!$(this).is(".tracker-tool")) {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
  }
}, function() {
  if (!$(this).is(".tracker-tool")) {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
  }
});

function toggleCheckbox(element) {
	$(element).click();
}

function convertTime(time) {
	var select = $('#unit-selection');
	var time_convert;
	
	if (typeof time == "string") {
		time_convert = parseInt(time);
	} else {
		time_convert = time;
	}
	
	if (select.val() == 1) {
		return round(time_convert / 60.0);
	} else {
		return time_convert;
	}
}

function round(num) {
	return +(Math.round((num + 0.001) + "e+2") + "e-2");
}

function formatDigit(num) {
	var str = "";
	
	if (typeof num == "number") {
		str = num.toString();
	} else {
		str = num;
	}
	
	if (str.indexOf(".") >= 0 && str.length >= str.indexOf(".") + 3) {
		return str.substring(0, str.indexOf(".") + 3);
	} else {
		return str;
	}
}

function getDate(date) {
	return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

function getTimeInSecond(txt) {
	if (typeof txt == "string") {
		var str = txt.split(" ");
		var time = 0;
		for (var i = 1; i < str.length; i++) {
			if (str[i].indexOf("h") >= 0) {
				time = time + (parseInt(str[i].substring(0, str[i].length - 1)) * 3600);
			} else if (str[i].indexOf("m") >= 0) {
				time = time + (parseInt(str[i].substring(0, str[i].length - 1)) * 60);
			} else {
				time = time + parseInt(str[i].substring(0, str[i].length - 1));
			}
		}
		return time
	} else {
		return 0;
	}
}

function executeExtract() {
	// Fadein animation
	$('#div-loading').fadeIn(fadeDelay);
	setTimeout(function() {
		
		// Clear detail
		clearDetail();
		
		// These has to be performed first to fetch data
		executeDaily();
		executeWeekly();
		executeJIRA();
		
		// Intepreter functions
		executeDetail();
		
		// Update coverage
		updateCoverageSelector();
		executeCoverage();
		
		// Update tfc
		loadTfc();
		tfcSelectorChanged();
		
		// Fadeout animation
		setTimeout(function() {
			$('#div-loading').fadeOut(fadeDelay);
			// Toggle most important one
			$("#detail").collapse("show");
		}, fadeDelay);
	}, fadeDelay);
}

var toggleSwitch = false;

function toggleDisplay(e, element) {
	if ($(e.target).is(':checked')) {
		$(element).fadeIn(fadeDelay);
	} else {
		if (!toggleSwitch) {
			$(element).hide();
		} else {
			$(element).fadeOut(fadeDelay);
		}
	}
}
