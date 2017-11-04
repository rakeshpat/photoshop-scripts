#target photoshop

var watermark = File.openDialog("Select a file");
var inputFolder = Folder.selectDialog("Select the folder containing your images");
var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
var fileList = inputFolder.getFiles("*.psd");

while (inputFolder.toString() == outputFolder.toString()) {
	alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
}

var wm = open(watermark);

for (i = 0; i < fileList.length; i++) {
	var doc = open(fileList[i]);
}