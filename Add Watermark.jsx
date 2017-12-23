#target photoshop

main();

function main() {
	// open dialog for the watermark file
	var watermark = File.openDialog("Select a file");
	if (watermark == null)
		return;

	// select dialog for setting an input folder where files to be watermarked are kept
	var inputFolder = Folder.selectDialog("Select the folder containing your images");
	if (inputFolder == null)
		return;

	// select dialog for setting an output folder to store the watermarked images
	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
	if (outputFolder == null)
		return;

	// check to see if the input folder and output folder are matching, and if so, a differernt output folder
	// will need to be selected
	while (inputFolder.toString() == outputFolder.toString()) {
		alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
		outputFolder = Folder.selectDialog("Select or create a folder for your new images");
		if (outputFolder == null)
			return;
	}

	// puts the filenames of all psd files into the fileList array
	var fileList = inputFolder.getFiles("*.psd");

	// dialog box with options for placement of watermark
	var dlg = new Window("dialog", "Options");
		var hAlignPnl = dlg.add("panel", undefined, "Horizontal alignment");
			hAlignPnl.orientation = "row";
			var rbLeft = hAlignPnl.add("radiobutton", undefined, "Left");
			var rbCentre = hAlignPnl.add("radiobutton", undefined, "Centre");
			var rbRight = hAlignPnl.add("radiobutton", undefined, "Right");
			rbRight.value = true;

		var vAlignPnl = dlg.add("panel", undefined, "Vertical alignment");
			vAlignPnl.orientation = "row";
			var rbTop = vAlignPnl.add("radiobutton", undefined, "Top");
			var rbMiddle = vAlignPnl.add("radiobutton", undefined, "Middle");
			var rbBottom = vAlignPnl.add("radiobutton", undefined, "Bottom");
			rbBottom.value = true;

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
	dlg.show();

	// open the watermark file
	var wm = open(watermark);

	// iterate through all files from the fileList array and add watermark to them
	for (var i = 0; i < fileList.length; i++) {
		var doc = open(fileList[i]);

		if (doc != wm) {
			var wmLayer = doc.artLayers.add();
			wmLayer.name = "watermark";

			app.activeDocument = wm;

			for (var j = 1; j < wm.layers.length; j++) {
				if (!wm.layers[j].visible)
					wm.layers[j].remove();
			}

			wm.layers[1].copy(true);
			app.activeDocument = doc;
			doc.paste();
			wmLayer.move(activeDocument, ElementPlacement.PLACEATBEGINNING);

			doc.artLayers.getByName("watermark").opacity = sOpacity.value;
			
			var x, y, minusX, minusY;
			
			if (rbLeft.value)
				x = doc.width - wm.width;
			if (rbCentre.value)
				x = (doc.width / 2) - (wm.width / 2);
			if (rbRight.value)
				x = 0;
			if (rbTop.value)
				y = doc.height - wm.height;
			if (rbMiddle.value)
				y = (doc.height / 2) - (wm.height / 2);
			if (rbBottom.value)
				y = 0;

			minusX = 0;
			minusY = 0;

			if (!rbCentre.value)
				minusX = (sOffset.value / 100) * doc.width;
			if (!rbMiddle.value)
				minusY = (sOffset.value / 100) * doc.height;

			if (rbLeft.value)
				x = x - minusX;
			else
				x = x + minusX;

			if (rbTop.value)
				y = y - minusY;
			else
				y = y + minusY;

			moveLayer(doc.artLayers.getByName("watermark"), x, y);
			doc.saveAs(new File(outputFolder + "/" + doc.name), new PhotoshopSaveOptions());
		}
	}

	// closes the watermark file without saving changes
	wm.close(SaveOptions.DONOTSAVECHANGES);
}

// function to place a layer a specific location
function moveLayer(layerRef, x, y) {
	var position = layerRef.bounds;
	
	position[0] = x - position[0];
	position[1] = y - position[1];
	layerRef.translate(-position[0], -position[1]);
}