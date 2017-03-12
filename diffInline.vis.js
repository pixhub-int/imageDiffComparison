/**
 * Отрисовка отличий между изображениями
 * @param {ImageData} oldImg Первое изображение
 * @param {ImageData} newImg Второе изображение
 * @param {object} result Разница между изображениями, функция дописывает туда
 * данные изображения разницы в поле image
 */

// https://github.com/umdjs/umd
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		module.exports = factory;
	}
	else {
		root.diffVis = factory;
	};
} (this, function (oldImg, newImg, result) {
	var shift = 30; // сдвиг цвета
	var newLineCount = 0; // счётчик новых строк
	var replaceLineCount = 0; // счётчик заменённых строк

	// идём по строкам результата
	for (var i = 0, diffPointer = 0; i < result.height; i++, diffPointer++) {

		// получаем строку отличий
		var line = result.diff.data[diffPointer];

		// произошла замена
		if (line.type === 'replace') {

			// старые строки
			var oldLines = line.lines[0];

			// новые строки
			var newLines = line.lines[1];

			// максимальное количество строк
			var maxLength = oldLines.length + newLines.length;

			var shift = 10; // сдвиг
			var isEqual = 0; // счётчик одинаковых данных

			// идём по строкам
			for (var k = 0; k < maxLength; k++) {

				// если удалилось
				if (k < oldLines.length) {
					line = oldLines[k].line;
					var lineNew = newLines[k].line;

					for (var j = 0; j < result.width * 4; j++) {
						var index = line * result.width * 4 + j;
						var indexNew = lineNew * result.width * 4 + j;
						var item = oldImg.data[index];

						// подсветка отличающихся точек строк
						if (isEqual-- > 0) {
							if (isEqual === 0) {
								shift = 10;
							};
						}
						else if (
							j % 4 === 0
							&& (
							oldImg.data[index] !== newImg.data[indexNew]
							|| oldImg.data[index + 1] !== newImg.data[indexNew + 1]
							|| oldImg.data[index + 2] !== newImg.data[indexNew + 2]
							|| oldImg.data[index + 3] !== newImg.data[indexNew + 3]
							)
						) {
							shift = 50;
							isEqual = 3;
						};

						// подкрашиваем зелёным
						if (j % 4 === 1) {
							item -= shift;
						};
						if (j % 4 === 2) {
							item -= shift;
						};

						// записываем результат
						result.image[(i + k) * result.width * 4 + j] = item;
					};
				}

				// если добавилось
				else if (k >= oldLines.length) {
					line = newLines[k - oldLines.length].line;
					var lineOld = oldLines[k - oldLines.length].line;

					for (var j = 0; j < result.width * 4; j++) {
						var index = line * result.width * 4 + j;
						var indexOld = lineOld * result.width * 4 + j;
						var item = newImg.data[index];

						// подсветка отличающихся точек строк
						if (isEqual-- > 0) {
							if (isEqual === 0) {
								shift = 10;
							};
						}
						else if (
							j % 4 === 0
							&& (
							newImg.data[index] !== oldImg.data[indexOld]
							|| newImg.data[index + 1] !== oldImg.data[indexOld + 1]
							||  newImg.data[index + 2] !== oldImg.data[indexOld + 2]
							||  newImg.data[index + 3] !== oldImg.data[indexOld + 3]
							)
						) {
							shift = 50;
							isEqual = 3;
						};

						// подкрашиваем красным
						if (j % 4 === 0) {
							item -= shift;
						};
						if (j % 4 === 2) {
							item -= shift;
						};

						// записываем результат
						result.image[(i + k) * result.width * 4 + j] = item;
					};

					newLineCount++;
				}
			};

			i += maxLength - 1;
		}

		// если добавилось
		else if (line.type === 'new') {
			for (var j = 0; j < result.width * 4; j++) {
				var item = newImg.data[line.line * result.width * 4 + j];

				// подкрашиваем зелёным
				if (j % 4 === 0) {
					item -= shift;
				};
				if (j % 4 === 2) {
					item -= shift;
				};

				result.image[i * result.width * 4 + j] = item;
			};

			newLineCount++;
		}

		// если удалилось
		else if (line.type === 'old') {
			for (var j = 0; j < result.width * 4; j++) {
				var item = oldImg.data[line.line * result.width * 4 + j];

				// подкрашиваем красным
				if (j % 4 === 1) {
					item -= shift;
				};
				if (j % 4 === 2) {
					item -= shift;
				};

				result.image[i * result.width * 4 + j] = item;
			};
		}

		// если не изменилось
		else {

			// записываем как есть, с учётом сдвига
			for (var j = 0; j < result.width * 4; j++) {
				result.image[i * result.width * 4 + j] = oldImg.data[(i - newLineCount) * result.width * 4 + j]
			};
		};
	}
}));
