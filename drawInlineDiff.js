function drawInlineDiff (src1, src2) {
	var imgChecks = [];

	imgChecks.push(getCheck(src1));
	imgChecks.push(getCheck(src2));

	return Promise.all(imgChecks).then(processImages);

	function getCheck (src) {
		return new Promise(function (resolve, reject) {
			var i = new Image();

			i.onload = function () {
				resolve(i);
			};
			i.src = src;

			if (i.complete) {
				resolve(i);
			};
		});
	};

	function processImages (images) {
		var size = {
			width: images[0].width > images[1].width ? images[0].width : images[1].width,
			height: images[0].height > images[1].height ? images[0].height : images[1].height
		};
		var firstData = getImageData(images[0], size);
		var secondData = getImageData(images[1], size);
		var diff = diffInline(firstData, secondData);
		var data = writeData(diff.data);
		var result = renderResult(data);

		return new Promise(function (resolve, reject) {
			resolve(result, diff);
		});
	};

	function getImageData (image, size) {
		var c = document.createElement('canvas');
		var cx = c.getContext('2d');
		var result = [];
		var data;

		c.width = size.width;
		c.height = size.height;
		cx.drawImage(image, 0, 0);

		data = cx.getImageData(0, 0, c.width, c.height);

		for (var j = 0; j < data.height; j++) {
			var row = [];
			
			for (var i = 0; i < data.width * 4; i++) {
				row.push(data.data[j * data.width * 4 + i]);
			};

			result.push(row);
		};

		return result;
	};

	function writeData (diff) {
		var result = [];

		diff.forEach(function (line) {
			line.value.forEach(function (item, i) {
				if (line.type === 'old') {
					if ((i+1) % 4 === 2) {
						item = item - 30;
					};
					if ((i+1) % 4 === 3) {
						item = item - 30;
					};
				};
					if (line.type === 'new') {
					if ((i+1) % 4 === 1) {
						item = item - 30;
					};
					if ((i+1) % 4 === 3) {
						item = item - 30;
					};
				};
				result.push(item);
			});
		});

		return new ImageData(new Uint8ClampedArray(result), diff[0].value.length / 4, diff.length);
	};

	function renderResult (data) {
		var result = document.createElement('canvas');
		var resx = result.getContext('2d');

		result.width = data.width;
		result.height = data.height;
		resx.putImageData(data, 0, 0);

		return result;
	};
};
