#target photoshop

/* This script removes layers beginning with, containing or ending with a series of letters and/or numbers the user 
   inputs, from PSD files in a directory. An output folder selected by the user is presented and will contain all files 
   that have been processed unless the option to save changes only to modified files is selected. */

var outputFolder = null;
var fileList = null;
var regExp = new RegExp();

main();

function main() {
	var inputFolder = Folder.selectDialog("Select the folder containing your images");
	if (inputFolder == null)
		return;

	// set the file list to look only at psd files
	fileList = inputFolder.getFiles("*.psd");

	if (fileList.length == 0) {
		alert("There are no PSD files in this folder");
		return;
	}

	outputFolder = Folder.selectDialog("Select or create a folder for your new images");
	if (outputFolder == null)
		return;

	while (inputFolder.toString() == outputFolder.toString()) {
		alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
		outputFolder = Folder.selectDialog("Select or create a folder for your new images");
		if (outputFolder == null)
			return;
	}

	// dialog box to allow users to select a search option and input a word for use with regex
	var dlg = new Window("dialog", "Remove layers with names...");

		var options = dlg.add("group");
			options.orientation = "row";
			var rbBegins = options.add("radiobutton", undefined, "Beginning with");
			var rbContains = options.add("radiobutton", undefined, "Containing");
			var rbEnds = options.add("radiobutton", undefined, "Ending with");
			rbContains.value = true;

		var textInput = dlg.add("edittext", undefined, "");
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

						if (confirm("Only save the files that have been modified to the output folder?"))
							openAndSave(true);
						else
							openAndSave(false);
					}
				}

			var btnCancel = buttons.add ("button", undefined, "Cancel");
				btnCancel.onClick = function() {
					dlg.hide();
					return;
				}
	dlg.show();
}

function openAndSave(saveChanges) {
	// opens each psd file from the input folder
	for (var i = 0; i < fileList.length; i++) {
		var doc = open(fileList[i]);

		// iterates through each layer of the document and deletes layers with names that match the regex pattern
		for (var j = 0; j < doc.layers.length; j++) {
			if (regExp.test(doc.layers[j].name)) {
				doc.layers[j].remove();
			}
		}

		// save the file
		if (saveChanges) {
			if (!doc.saved)
				doc.saveAs(new File(outputFolder + "/" + doc.name), new PhotoshopSaveOptions())
		}
		else
			doc.saveAs(new File(outputFolder + "/" + doc.name), new PhotoshopSaveOptions())

		doc.close(SaveOptions.DONOTSAVECHANGES);
		alert("Process complete - check the output folder to see the changes made");
	}
}