
/**
 * Протез для конструктора ImageData
 *
 * может принимать на вход обычные массивы, не только Uint8ClampedArray
 * не работает в работниках, потому что реализован через createImageData
 */

(function (undefined) {
	try {
		new ImageData([], 1, 1);
	}
	catch (e) {
		this.ImageData = function (data, width, height) {
			var canvas = document.createElement('canvas');
			var image = canvas.getContext('2d').createImageData(width, height);

			for (var i = 0; i < data.length; i++) {
				image.data[i] = data[i];
			};

			return image;
		};
	};
}).call(
	'object' === typeof window && window
	|| 'object' === typeof self && self
	|| 'object' === typeof global && global
	|| {}
);


function diffInline (images) {
	var imgChecks = [];

	imgChecks.push(getCheck(images[0]));
	imgChecks.push(getCheck(images[1]));

	var worker = new Worker('diffInline.worker.js');

	return Promise.all(imgChecks).then(processImages);

	function processImages (images) {
		var img1 = getImageData(images[0]);
		var img2 = getImageData(images[1]);

		worker.postMessage({
			old: img1,
			new: img2
		});

		return new Promise(function (resolve, reject) {
			worker.onmessage = function (e) {
				e.data.diff.image = writeData(e.data);
				resolve(e.data);
			};
		});
	}

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

	function getImageData (image) {
		var c = document.createElement('canvas');
		var cx = c.getContext('2d');
		var data;

		c.width = image.naturalWidth;
		c.height = image.naturalHeight;
		cx.drawImage(image, 0, 0);

		return cx.getImageData(0, 0, c.width, c.height);
	};

	function writeData (diff) {
		return new ImageData(diff.image, diff.width, diff.height);
	};
};

diffInline.renderResult = function (data) {
	var result = document.createElement('canvas');
	var resx = result.getContext('2d');

	result.width = data.width;
	result.height = data.height;
	resx.putImageData(data, 0, 0);

	return result;
};
