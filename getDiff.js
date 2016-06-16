// получение разницы
// определять изменение размеров
// подсвечивать более позднее
function getDiff (options) {

	if (!options.imgs) {
		console.warn('getDiff: Не переданы изображения для сравнения');
		return false;
	};

	var defaults = {
		mode: 'highlight',
		color: [255,0,0],
		debug: false,
		ratio: 4,
	};

	var cfg = extend({}, defaults, options);

	return new Promise(function (resolve, reject) {
		var s = Date.now();

		var c = document.createElement('canvas');
		var cx = c.getContext('2d');

		var i0 = new Image();
		var i1 = new Image();
		var tmp = new Image();

		var data0, data1;
		var dataDiff = [];

		i0.onload = function (e) {
			c.width = this.width/cfg.ratio;
			c.height = this.height/cfg.ratio;

			cx.drawImage(this, 0, 0, this.width/cfg.ratio, this.height/cfg.ratio);
			data0 = cx.getImageData(0, 0, this.width/cfg.ratio, this.height/cfg.ratio);

			i1.onload = function (e) {
				cx.clearRect(0, 0, c.width, c.height);
				cx.drawImage(this, 0, 0, this.width/cfg.ratio, this.height/cfg.ratio);
				data1 = cx.getImageData(0, 0, this.width/cfg.ratio, this.height/cfg.ratio);

				dataDiffer(this);
			};

			i1.src = cfg.imgs[1];
		};

		i0.src = cfg.imgs[0];


		function dataDiffer(img)
		{
			var i = 0;
			var len = data0.data.length;
			var difference = {x: [], y: [], percent: 0};
			var diffCounter = 0;

			for (; i < len; i += 4)
			{
				if (
					data0.data[i] !== data1.data[i]
					|| data0.data[i+1] !== data1.data[i+1]
					|| data0.data[i+2] !== data1.data[i+2]
					|| data0.data[i+3] !== data1.data[i+3]
					)
				{
					difference.x = pushDiff({
						obj: i / 4 * cfg.ratio % img.width,
						target: difference.x
					});

					difference.y = pushDiff({
						obj: Math.round(i * cfg.ratio * cfg.ratio / 4 / img.width),
						target: difference.y
					});

					if (cfg.mode === 'highlight')
					{
						data0.data[i] = cfg.color[0];
						data0.data[i+1] = cfg.color[1];
						data0.data[i+2] = cfg.color[2];
					}
					else if (cfg.mode === 'pure') {};

					diffCounter++;
				}
				else
				{
					data0.data[i+3] = 0;
				};
			};

			c.width = img.width;
			c.height = img.height;

			cx.putImageData(data0, 0, 0, 0, 0, data0.width * cfg.ratio, data0.height * cfg.ratio);

			// отключаем сглаживание
			cx.webkitImageSmoothingEnabled = false;
			cx.mozImageSmoothingEnabled = false;
			cx.imageSmoothingEnabled = false;

			tmp.onload = function (e)
			{
				cx.clearRect(0, 0, c.width, c.height);
				cx.scale(cfg.ratio, cfg.ratio);
				cx.drawImage(this, 0, 0);
				cx.scale(1/cfg.ratio, 1/cfg.ratio);

				difference.percent = diffCounter * cfg.ratio / len * 100;

				resolve({
					difference: difference,
					canvas: c
				});
				
				if (cfg.debug)
				{
					console.log(Date.now() - s);
				};
			};
			tmp.src = c.toDataURL();
		};
	});


	// добавляем в массив только такое, чего нет
	function pushDiff(opts) {
		if (opts.target.indexOf(opts.obj) === -1) {
			for (var i = 0; i < cfg.ratio; i++) {
				opts.target.push(opts.obj + i);
			};
		};

		return opts.target;
	};
	// ~ добавляем в массив только такое, чего нет


	// расширяем объект
	function extend(out) {
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
