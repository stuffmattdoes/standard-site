// Main javascript file
// Requires: JQuery


var project = {
	init: function() {
		this.thisMethod();
	},

	thisMethod: function() {
		console.log("Javascript is working!");
	}
}

$(document).ready(function() {
	project.init();
});