#target photoshop

/* This script allows a user to watermark all psd files within a directory. The user is presented with dialog boxes to
   choose a watermark image, choose an input directory containing psd files and an output directory which will contain
   psd files with watermarks. Before the watermark is applied to the images, the user is presented with options to 
   decide where the watermark is to be placed by horizontal and vertical alignment and also offsetting from the edge 
   of the canvas, and also how opaque the watermark should be.
*/

function main() {
	try {
		if (!setWatermark()) return;
		checkWatermark();
		if (!setInputFolder()) return;
		getFileList(); //do these methods need to be called or can they be accessed. test
		checkFileList();
		if (!setOutputFolder()) return;
		checkOutputFolder();
		showOptions();
		if (proceed) batchProcess();
	} catch (err) {
		return;
	}
}

function setWatermark() {
	watermark = File.openDialog("Select a file");
	return (watermark != null);
}

function setInputFolder() {
	inputFolder = Folder.selectDialog("Select the folder containing your images");
	return (inputFolder != null);
}

function setOutputFolder() {
	outputFolder = Folder.selectDialog("Select or create a folder for your new images");
	return (outputFolder != null);
}

// test to see if the watermark is not of the psd format required and displays alert if so
function checkWatermark() {
	var regex = new RegExp('\.psd' + '$', 'i');
	while (!regex.test(watermark.toString())) {
		alert("Invalid file type. The watermark must be a psd file. Choose another file");
		setWatermark();
	}
}

// test to see if the file list is empty and displays alert if so
function checkFileList() {
	while (getFileList().length == 0) {
		alert("There are no psd files in this folder. Choose a different folder.");
		setInputFolder();
		getFileList();
	}
}

// test to see if the output folder is the same as the input folder and displays alert if so
function checkOutputFolder() {
	while (getInputFolder() == getOutputFolder()) {
		alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
		setOutputFolder();
	}
}

function getInputFolder() {
	return inputFolder.toString();
}

function getOutputFolder() {
	return outputFolder.toString();
}

function getFileList() {
	return inputFolder.getFiles("*.psd");
}

function getWatermark() {
	return watermark;
}

function showOptions() {
	var dlg = new Window("dialog", "Options");

	// panel containing options to select horizontal alignment of watermark
	var hAlignPnl = dlg.add("panel", undefined, "Horizontal alignment");
		hAlignPnl.orientation = "row";
		rbLeft = hAlignPnl.add("radiobutton", undefined, "Left");
		rbCentre = hAlignPnl.add("radiobutton", undefined, "Centre");
		rbRight = hAlignPnl.add("radiobutton", undefined, "Right");
		rbRight.value = true;

	// panel containing options to select vertical aligning of watermark
	var vAlignPnl = dlg.add("panel", undefined, "Vertical alignment");
		vAlignPnl.orientation = "row";
		rbTop = vAlignPnl.add("radiobutton", undefined, "Top");
		rbMiddle = vAlignPnl.add("radiobutton", undefined, "Middle");
		rbBottom = vAlignPnl.add("radiobutton", undefined, "Bottom");
		rbBottom.value = true;

	// panel containing a slider and associated textbox to select how far away the watermark is to be placed from the 
	// edge of the canvas
	var offsetPnl = dlg.add("panel", undefined, "Offset watermark");
		offsetPnl.orientation = "row";
		sOffset = offsetPnl.add("slider", undefined, 5, 0, 100);
		var ibOffset = offsetPnl.add("edittext", undefined, 5);
		offsetPnl.add("statictext", undefined, "%");
		sOffset.onChanging = function() {
			ibOffset.text = sOffset.value;
		}
		ibOffset.onChanging = function() {
			sOffset.value = Number(ibOffset.text);
		}

	// panel containing a slider and associated textbox to select the watermark's level of transparency
	var opacityPnl = dlg.add("panel", undefined, "Opacity");
		opacityPnl.orientation = "row";
		sOpacity = opacityPnl.add("slider", undefined, 10, 0, 100);
		var ibOpacity = opacityPnl.add("edittext", undefined, 10);
		opacityPnl.add("statictext", undefined, "%");
		sOpacity.onChanging = function() {
			ibOpacity.text = sOpacity.value;
		}
		ibOpacity.onChanging = function() {
			sOpacity.value = Number(ibOpacity.text);
		}

	// group containing ok and cancel buttons
	var buttons = dlg.add("group");
		var btnOK = buttons.add("button", undefined, "OK");
		var btnCancel = buttons.add("button", undefined, "Cancel");

		btnOK.onClick = function() {
			proceed = true;
			dlg.show() == 2;
		}

		btnCancel.onClick = function() {
			proceed = false;
			dlg.show() == 2;
		}

	dlg.show();
}

function batchProcess() {
	var wm = open(getWatermark());

	// iterate through all files from the fileList array and add watermark to them
	for (var i = 0; i < getFileList().length; i++) {
		var doc = open(getFileList()[i]);

		// if the psd file in the folder is the selected watermark, ignore it
		if (doc != wm) {
			var wmLayer = doc.artLayers.add();
			wmLayer.name = "watermark";

			app.activeDocument = wm;

			// iterate through all layers of the watermark document and remove hidden layers
			for (var j = 1; j < wm.layers.length; j++) {
				if (!wm.layers[j].visible)
					wm.layers[j].remove();
			}

			// the true parameter ensures all layers in the document are copied and later pasted as a single layer
			wm.layers[1].copy(true);

			app.activeDocument = doc;
			doc.paste();

			wmLayer.move(activeDocument, ElementPlacement.PLACEATBEGINNING);
			wmLayer.opacity = sOpacity.value;

			// setting of variables x and y to be used as parameters for the moveLayer function call
			var x, y;
			
			if (rbLeft.value)
				x = doc.width - wm.width - (sOffset.value / 100) * doc.width;
			if (rbCentre.value)
				x = (doc.width / 2) - (wm.width / 2);
			if (rbRight.value)
				x = (sOffset.value / 100) * doc.width;
			if (rbTop.value)
				y = doc.height - wm.height - (sOffset.value / 100) * doc.height;
			if (rbMiddle.value)
				y = (doc.height / 2) - (wm.height / 2);
			if (rbBottom.value)
				y = (sOffset.value / 100) * doc.height;

			moveLayer(doc.artLayers.getByName("watermark"), x, y);

			// saves the new image in the output folder as a psd then close it
			doc.saveAs(new File(outputFolder + "/" + doc.name), new PhotoshopSaveOptions());
			doc.close(SaveOptions.DONOTSAVECHANGES);
		}
	}

	wm.close(SaveOptions.DONOTSAVECHANGES);
	alert("Process complete - check the output folder to see the changes made");
}

function moveLayer(layerRef, x, y) {
	var position = layerRef.bounds;
	
	position[0] = x - position[0];
	position[1] = y - position[1];
	layerRef.translate(-position[0], -position[1]);
}

main();