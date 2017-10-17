#target photoshop

var inputFolder = Folder.selectDialog("Select the folder containing your images");
var fileList = inputFolder.getFiles();

// regular expression to remove layers matching the regex pattern 
var regExp = new RegExp(textInput.text, 'i');

// opens each file from the input folder
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