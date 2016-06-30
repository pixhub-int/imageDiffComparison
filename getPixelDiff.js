// получение разницы
// подсвечивать более позднее
function getDiff (options) {

	if (!options.imgs) {
		console.warn('getDiff: Не переданы изображения для сравнения');
		return false;
	};

	var defaults = {
		mode: 'highlight',
		color: [255,0,0,255],
		debug: false,
		ratio: 4,
	};

	var cfg = extend({}, defaults, options);

	return new Promise(function (resolve, reject) {
		var s = Date.now();
		var imgChecks = [];

		// подгружаем изображения
		imgChecks.push(getCheck(cfg.imgs[0]));
		imgChecks.push(getCheck(cfg.imgs[1]));

		return Promise.all(imgChecks).then(processImages);

		// подгружаем изображение
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

		// обрабатываем изображения
		function processImages (images) {
			var data0, data1;

			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');

			var width = images[0].width;
			var height = images[0].height;

			// получаем максимальные размеры
			if (images[1].width > images[0].width) {
				width = images[1].width;
			};

			if (images[1].height > images[0].height) {
				height = images[1].height;
			};

			// выставляем размеры холста по максимальным размерам с учётом масштаба
			canvas.width = Math.ceil(width/cfg.ratio);
			canvas.height = Math.ceil(height/cfg.ratio);
			
			// получаем данные
			context.drawImage(images[0], 0, 0, images[0].width/cfg.ratio, images[0].height/cfg.ratio);
			data0 = context.getImageData(0, 0, width/cfg.ratio, height/cfg.ratio);

			context.clearRect(0, 0, canvas.width, canvas.height);

			context.drawImage(images[1], 0, 0, images[1].width/cfg.ratio, images[1].height/cfg.ratio);
			data1 = context.getImageData(0, 0, width/cfg.ratio, height/cfg.ratio);
			
			context.clearRect(0, 0, canvas.width, canvas.height);

			return new Promise(function (resolve, reject) {
				var result = dataDiffer(data0, data1, canvas, width, height);

				resolve(result);
			});
		};

		// сравниваем изображения
		function dataDiffer (data0, data1, canvas, width, height) {
			var context = canvas.getContext('2d');
			var data = context.getImageData(0, 0, canvas.width, canvas.height);
			var len = data.data.length;
			var difference = {x: [], y: [], percent: 0};
			var diffCounter = 0;

			// проходим по всем точкам изображений
			for (var i = 0; i < len; i += 4) {

				// если точка не равна
				if (
					data0.data[i] !== data1.data[i]
					|| data0.data[i+1] !== data1.data[i+1]
					|| data0.data[i+2] !== data1.data[i+2]
					|| data0.data[i+3] !== data1.data[i+3]
					) {
					
					// делаем метки по осям
					difference.x = pushDiff({
						obj: i / 4 * cfg.ratio % canvas.width,
						target: difference.x
					});

					difference.y = pushDiff({
						obj: Math.round(i * cfg.ratio * cfg.ratio / 4 / canvas.width),
						target: difference.y
					});

					// выводим разницу в зависимости от режима
					if (cfg.mode === 'highlight') {
						data.data[i] = cfg.color[0];
						data.data[i+1] = cfg.color[1];
						data.data[i+2] = cfg.color[2];
						data.data[i+3] = cfg.color[3];
					}
					else if (cfg.mode === 'pure') {};

					diffCounter++;
				}

				// скрываем одинаковое
				else {
					data.data[i+3] = 0;
				};
			};

			// отрисовываем разницу
			canvas.width = width;
			canvas.height = height;
			context.putImageData(data, 0, 0, 0, 0, canvas.width, canvas.height);

			// отключаем сглаживание
			context.webkitImageSmoothingEnabled = false;
			context.mozImageSmoothingEnabled = false;
			context.imageSmoothingEnabled = false;

			// получаем изображение разницы
			canvas.toBlob(function (data) {
				var url = URL.createObjectURL(data);
				var tmp = new Image();

				tmp.onload = function (e) {

					// отрисовываем увеличенную разницу
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.scale(cfg.ratio, cfg.ratio);
					context.drawImage(this, 0, 0);
					context.scale(1/cfg.ratio, 1/cfg.ratio);

					// считаем приблизительный процент отличий
					difference.percent = diffCounter * cfg.ratio / len * 100;

					// возвращаем
					resolve({
						difference: difference,
						canvas: canvas
					});
					
					// при отладке выводим длительность
					if (cfg.debug) {
						console.log(Date.now() - s);
					};

					// удаляем ссылку на объект
					URL.revokeObjectURL(url);
				};
				tmp.src = url;
			});
		};
	});


	// добавляем в массив только такое, чего нет
	function pushDiff (opts) {
		if (opts.target.indexOf(opts.obj) === -1) {
			for (var i = 0; i < cfg.ratio; i++) {
				opts.target.push(opts.obj + i);
			};
		};

		return opts.target;
	};
	// ~ добавляем в массив только такое, чего нет


	// расширяем объект
	function extend (out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i])
				continue;

			for (var key in arguments[i]) {
				if (arguments[i].hasOwnProperty(key))
					out[key] = arguments[i][key];
			}
		}

		return out;
	};
	// ~ расширяем объект
};
// ~ получение разницы
