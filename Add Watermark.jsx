#target photoshop

/* This script allows a user to watermark all psd files within a directory. The user is presented with dialog boxes to
   choose a watermark image, choose an input directory containing psd files and an output directory which will contain
   psd files with watermarks. Before the watermark is applied to the images, the user is presented with options to 
   decide where the watermark is to be placed by horizontal and vertical alignment and also offsetting from the edge 
   of the canvas, and also how opaque the watermark should be.
*/

main();

function main() {
	var watermark = File.openDialog("Select a file");
	if (watermark == null) return;
	reg = new RegExp('\.psd' + '$', 'i');
	while (!reg.test(watermark.toString())) {
		alert("Invalid file type. The watermark must be a psd file. Choose another file");
		watermark = File.openDialog("Select a file");
		if (watermark == null) return;
	}


	var inputFolder = Folder.selectDialog("Select the folder containing your images");
	if (inputFolder == null)
		return;

	// puts the filenames of all psd files into the fileList array
	var fileList = inputFolder.getFiles("*.psd");

	// if the input folder has no psd files, show alert and allow another folder to be set until it is valid
	while (fileList.length == 0) {
		alert("There are no psd files in this folder. Choose a different folder.");
		
		inputFolder = Folder.selectDialog("Select the folder containing your images");
		if (inputFolder == null)
			return;

		fileList = inputFolder.getFiles("*.psd");
	}

	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
	if (outputFolder == null)
		return;

	// check to see if input and output folders are matching, and if so, a different output folder can be selected
	while (inputFolder.toString() == outputFolder.toString()) {
		alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
		outputFolder = Folder.selectDialog("Select or create a folder for your new images");
		if (outputFolder == null)
			return;
	}

	var dlg = new Window("dialog", "Options");

		// panel containing options to select horizontal alignment of watermark
		var hAlignPnl = dlg.add("panel", undefined, "Horizontal alignment");
			hAlignPnl.orientation = "row";
			var rbLeft = hAlignPnl.add("radiobutton", undefined, "Left");
			var rbCentre = hAlignPnl.add("radiobutton", undefined, "Centre");
			var rbRight = hAlignPnl.add("radiobutton", undefined, "Right");
			rbRight.value = true;

		// panel containing options to select vertical aligning of watermark
		var vAlignPnl = dlg.add("panel", undefined, "Vertical alignment");
			vAlignPnl.orientation = "row";
			var rbTop = vAlignPnl.add("radiobutton", undefined, "Top");
			var rbMiddle = vAlignPnl.add("radiobutton", undefined, "Middle");
			var rbBottom = vAlignPnl.add("radiobutton", undefined, "Bottom");
			rbBottom.value = true;

		// panel containing a slider and associated textbox to select how far away the watermark is to be placed from 
		// the edge of the canvas
		var offsetPnl = dlg.add("panel", undefined, "Offset watermark");
			offsetPnl.orientation = "row";
			var sOffset = offsetPnl.add("slider", undefined, 5, 0, 100);
			var ibOffset = offsetPnl.add("edittext", undefined, 10);
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
			var sOpacity = opacityPnl.add("slider", undefined, 10, 0, 100);
			var ibOpacity = opacityPnl.add("edittext", undefined, 10);
			opacityPnl.add("statictext", undefined, "%");
			sOpacity.onChanging = function() {
				ibOpacity.text = sOpacity.value;
			}
			ibOpacity.onChanging = function() {
				sOpacity.value = Number(ibOpacity.text);
			}

		var buttons = dlg.add("group");
			var btnOK = buttons.add("button", undefined, "OK");
			var btnCancel = buttons.add("button", undefined, "Cancel");
			var proceed = true;
			btnCancel.onClick = function() {
				proceed = false;
				return;
			}
	dlg.show();

	if (!proceed) {
		return;
	}

	var wm = open(watermark);

	// iterate through all files from the fileList array and add watermark to them
	for (var i = 0; i < fileList.length; i++) {
		var doc = open(fileList[i]);

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

// this function moves the position of a layer
function moveLayer(layerRef, x, y) {
	var position = layerRef.bounds;
	
	position[0] = x - position[0];
	position[1] = y - position[1];
	layerRef.translate(-position[0], -position[1]);
}