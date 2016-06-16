/**
 * Сравнение массивов с генерацией разницы
 * @param a {Array} первый массив
 * @param b {Array} второй массив
 * @returns {Object} объект формата:
 * {
 *    old // удалённое
 *    default // неизменное
 *    new // добавленное
 *    data: {
 *        type // вид разницы [old, default, new]
 *        value // значение разницы
 *    }
 * }
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
		root.diffInline = factory;
	};
} (this, function (a, b) {

	// массив с результатом
	var result = {
		old: 0,
		default: 0,
		new: 0,
		data: []
	};

	// вспомогательные массивы
	var tmpA = [];
	var tmpB = [];
	var tmpD = [];

	// счётчики
	var indexA = 0;
	var indexB = 0;

	// идём по массивам
	while (1) {

		// для каждого массива свой индекс с соответствующим сдвигом
		indexA = indexA + tmpA.length + tmpD.length;
		indexB = indexB + tmpB.length + tmpD.length;

		// пополняем результат
		result.data = result.data.concat(tmpA);
		result.data = result.data.concat(tmpB);
		result.data = result.data.concat(tmpD);

		// меняем статистику
		result.old += tmpA.length;
		result.new += tmpB.length;
		result.default += tmpD.length;
		
		// обнуляем вспомогательные массивы
		tmpA = [];
		tmpB = [];
		tmpD = [];

		// получаем текущий элемент массива
		curA = a[indexA];
		curB = b[indexB];

		// если нет ни старого, ни нового
		if (typeof curA === 'undefined' && typeof curB === 'undefined') {
			return result;
		}

		// если нет нового
		else if (typeof curB === 'undefined') {
			tmpA.push({
				type: 'old',
				value: curA
			});
		}

		// если нет старого
		else if (typeof curA === 'undefined') {
			tmpB.push({
				type: 'new',
				value: curB
			});
		}

		// если не изменилось
		else if (isEqual(curA, curB)) {
			tmpD.push({
				type: 'default',
				value: curA
			});
		}

		// если есть отличия
		else {

			// вспомогательные счётчики
			var i = indexB;
			var j = indexA;
			var k = i;
			var m = j;

			// вспомогательные массивы
			var checkA = [];
			var checkB = [];
			var checkAB = {
				a: [],
				b: []
			};

			// проверяем, было ли старое
			while (typeof a[j] !== 'undefined' && !isEqual(a[j], curB)) {
				checkA.push({
					type: 'old',
					value: a[j]
				});

				j++;
			};

			// проверяем, есть ли новое
			while (typeof b[i] !== 'undefined' && !isEqual(curA, b[i])) {
				checkB.push({
					type: 'new',
					value: b[i]
				});

				i++;
			};

			// проверяем, произошла ли замена
			while (typeof a[m] !== 'undefined' && typeof b[k] !== 'undefined' && !isEqual(a[m], b[k])) {
				checkAB.a.push({
					type: 'old',
					value: a[m]
				});

				checkAB.b.push({
					type: 'new',
					value: b[k]
				});

				m++;
				k++;
			};

			// произошла замена
			if (checkAB.a.length + checkAB.b.length <= checkA.length && checkAB.a.length + checkAB.b.length <= checkB.length) {
				tmpA = tmpA.concat(checkAB.a);
				tmpB = tmpB.concat(checkAB.b);
			}

			// добавлено новое
			else if (checkB.length <= checkA.length) {
				tmpB = tmpB.concat(checkB);
			}

			// что-то пропало
			else {
				tmpA = tmpA.concat(checkA);
			};
		};
	};

	/**
	 * сравнение массивов
	 * @param a {Array} первый массив
	 * @param b {Array} второй массив
	 * @returns {Boolean} результат сравнения
	 */
	function isEqual (a, b) {
		return JSON.stringify(a) === JSON.stringify(b);
	};
}));
