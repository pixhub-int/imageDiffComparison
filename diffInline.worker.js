importScripts('diffInline.diff.js');
importScripts('diffInline.vis.js');

onmessage = function (e) {

	// результат сравнения
	var result = {
		diff: diff(
			e.data.old.data,
			e.data.new.data,
			e.data.old.width * 4
		),
		width: e.data.old.width,
		height: 0,
		image: null
	};

	// дополняем результат
	result.height = e.data.old.height + result.diff.new;
	result.image = new Uint8ClampedArray((e.data.old.height + result.diff.new) * e.data.old.width * 4);

	// готовим изображение с отличиями
	diffVis(e.data.old, e.data.new, result);

	// отправляем результат
	postMessage(result);
};
