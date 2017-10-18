#target photoshop

// dialog box to allow users to input a keyword
var dlg = new Window("dialog", "Remove layers with names containing...");
	var textInput = dlg.add("edittext", undefined, "");
		textInput.active = true;
		textInput.characters = 20;
	var buttons = dlg.add("group");
		var btnOK = buttons.add("button", undefined, "OK");
		var btnCancel = buttons.add ("button", undefined, "Cancel");
dlg.show();

var inputFolder = Folder.selectDialog("Select the folder containing your images");

// set the file list to look only at psd files
var fileList = inputFolder.getFiles("*.psd");

// regular expression to remove layers matching the regex pattern 
var regExp = new RegExp(textInput.text, 'i');

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
	}
}