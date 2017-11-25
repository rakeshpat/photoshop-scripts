#target photoshop

var watermark = File.openDialog("Select a file");
var inputFolder = Folder.selectDialog("Select the folder containing your images");
var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
var fileList = inputFolder.getFiles("*.psd");

while (inputFolder.toString() == outputFolder.toString()) {
	alert("The folder you select cannot be the same as the input folder. Choose a different folder.");
	var outputFolder = Folder.selectDialog("Select or create a folder for your new images");
}

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
		var sOffset = offsetPnl.add("slider", undefined, 10, 0, 100);
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

var wm = open(watermark);

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
		
		if (!rbCentre.value && !rbMiddle.value) {
			if (rbLeft.value) {
				moveLayer(doc.artLayers.getByName("watermark"), 0, 0);
			}
		}
	}
}

function moveLayer(layerRef, x, y) {
	var position = layerRef.bounds;
	
	position[0] = x - position[0];
	position[1] = y - position[1];
	layerRef.translate(-position[0], -position[1]);
}

wm.close(SaveOptions.DONOTSAVECHANGES);