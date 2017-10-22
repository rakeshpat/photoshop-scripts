#target photoshop

var regExp = new RegExp();
var textInput = "";

optionsDialog();

// dialog box to allow users to select a search option and input a word for use with regex
function optionsDialog() {
	var dlg = new Window("dialog", "Remove layers with names...");

		var options = dlg.add("group");
			options.orientation = "row";
			var rbBegins = options.add("radiobutton", undefined, "Beginning with");
			var rbContains = options.add("radiobutton", undefined, "Containing");
			var rbEnds = options.add("radiobutton", undefined, "Ending with");
			rbContains.value = true;

		textInput = dlg.add("edittext", undefined, "");
			textInput.characters = 20;
			textInput.active = true;

		var buttons = dlg.add("group");

			var btnOK = buttons.add("button", undefined, "OK");
				btnOK.onClick = function() {
					if (textInput.text == "")
						alert("The text field cannot be left blank");
					else {
						dlg.hide();

						// sets up a regular expression based on users selection of first dialog box
						if (rbBegins.value == true)
							regExp = new RegExp('^' + textInput.text, 'i');
						if (rbContains.value == true)
							regExp = new RegExp(textInput.text, 'i');
						if (rbEnds.value == true)
							regExp = new RegExp(textInput.text + '$', 'i');

						main();
					}
				}

			var btnCancel = buttons.add ("button", undefined, "Cancel");
				btnCancel.onClick = function() {
					dlg.hide();
					return;
				}
	dlg.show();
}

function main() {
	var inputFolder = Folder.selectDialog("Select the folder containing your images");
	if (inputFolder == null)
		return;

	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
	if (outputFolder == null)
		return;

	while (inputFolder.toString() == outputFolder.toString()) {
		alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
		var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
		if (outputFolder == null)
			return;
	}

	// set the file list to look only at psd files
	var fileList = inputFolder.getFiles("*.psd");

	if (fileList.length == 0)
		alert("There are no PSD files in this folder");
	else {
		// opens each psd file from the input folder
		for (var i = 0; i < fileList.length; i++) {
			var doc = open(fileList[i]);

			/* iterates through each layer of the active document and deletes layers with
			   names that match the regex pattern */
			for (var j = 0; j < doc.layers.length; j++) {
				if (regExp.test(doc.layers[j].name)) {
					doc.layers[j].remove();
				}
			}

			// saves the file in the output folder
			doc.saveAs(new File(outputFolder + "/" + doc.name), new PhotoshopSaveOptions())
		}
	}
}