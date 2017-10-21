#target photoshop

/* dialog box to allow users to select a search option and input a word for use with
   regex */
var dlg = new Window("dialog", "Remove layers with names...");
	var options = dlg.add("group");
		options.orientation = "row";
		var rbBegins = options.add("radiobutton", undefined, "Beginning with");
		rbBegins.value = true;
		var rbContains = options.add("radiobutton", undefined, "Containing");
		var rbEnds = options.add("radiobutton", undefined, "Ending with");
	var textInput = dlg.add("edittext", undefined, "");
		textInput.active = true;
		textInput.characters = 20;
	var buttons = dlg.add("group");
		var btnOK = buttons.add("button", undefined, "OK");
		var btnCancel = buttons.add ("button", undefined, "Cancel");
dlg.show();

var inputFolder = Folder.selectDialog("Select the folder containing your images");
var outputFolder = Folder.selectDialog("Select or create a folder for your new images");

// sets up a regular expression based on users selection of first dialog box
if (rbBegins.value == true)
	var regExp = new RegExp('^' + textInput.text, 'i');
if (rbContains.value == true)
	var regExp = new RegExp(textInput.text, 'i');
if (rbEnds.value == true)
	var regExp = new RegExp(textInput.text + '$', 'i');

while (inputFolder.toString() == outputFolder.toString()) {
	alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
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