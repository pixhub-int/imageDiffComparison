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
		root.diff = factory;
	};
} (this, function (a, b, depth) {

// depth — ширина строки
// length — количество строк

	// пустота
	var empty = 0;

	// массив с результатом
	var result = {
		old: empty,
		default: empty,
		new: empty,
		data: []
	};

	// вспомогательные массивы
	var tmpA = [];
	var tmpB = [];
	var tmpD = [];

	var checkA = [];
	var checkB = [];
	var checkA_ = [];
	var check_B = [];

	// счётчики
	var indexA = empty;
	var indexB = empty;

	// вспомогательные счётчики
	var i = empty;
	var j = empty;
	var k = empty;
	var m = empty;

	// идём по массивам
	while (1) {

		// для каждого массива свой индекс с соответствующим сдвигом
		indexA += ((tmpA.length + tmpD.length) * depth);
		indexB += ((tmpB.length + tmpD.length) * depth);

		// пополняем результат
		result.data = result.data.concat(tmpA);
		result.data = result.data.concat(tmpB);
		result.data = result.data.concat(tmpD);

		// меняем статистику
		result.old += tmpA.length;
		result.new += tmpB.length;
		result.default += tmpD.length;
		
		// обнуляем вспомогательные массивы
		tmpA.length = empty;
		tmpB.length = empty;
		tmpD.length = empty;

		// если нет ни старого, ни нового
		if (indexA >= a.length && indexB >= b.length) {
			return result;
		}

		// если нет нового
		else if (indexB >= b.length) {
			tmpA.push({
				type: 'old',
				line: indexA / depth
			});
		}

		// если нет старого
		else if (indexA >= a.length) {
			tmpB.push({
				type: 'new',
				line: indexB / depth
			});
		}

		// если не изменилось
		else if (isEqual(indexA, indexB)) {
			tmpD.push({
				type: 'default',
				line: 0
			});
		}

		// если есть отличия
		else {

			// вспомогательные счётчики
			i = indexB;
			j = indexA;
			k = i;
			m = j;

			// вспомогательные массивы
			checkA.length = [];
			checkB.length = [];
			checkA_ = [];
			check_B = [];

			// проверяем, было ли старое
			while (j < a.length && !isEqual(j, indexB)) {
				checkA.push({
					type: 'old',
					line: j / depth
				});

				j += depth;
			};

			// проверяем, есть ли новое
			while (i < b.length && !isEqual(indexA, i)) {
				checkB.push({
					type: 'new',
					line: i / depth
				});

				i += depth;
			};

			// проверяем, произошла ли замена
			while (m < a.length && k < b.length && !isEqual(m, k)) {
				checkA_.push({
					type: 'old',
					line: m / depth
				});
				check_B.push({
					type: 'new',
					line: k / depth
				});

				m += depth;
				k += depth;
			};

			// произошла замена
			if (
				(checkA.length + checkB.length === checkA_.length + check_B.length)
				|| checkA_.length + check_B.length <= checkA.length
				&& checkA_.length + check_B.length <= checkB.length
			) {
				indexA += checkA_.length * depth;
				indexB += check_B.length * depth;
				result.old += checkA_.length;
				result.new += check_B.length;

				result.data.push({
					type: 'replace',
					lines: [checkA_, check_B]
				});
			}

			// что-то пропало
			else if (checkB.length >= checkA.length) {
				tmpA = tmpA.concat(checkA);
			}

			// добавлено новое
			else {
				tmpB = tmpB.concat(checkB);
			};
		};
	};

	// проверка равенства строки
	function isEqual (startA, startB) {
		for (var i = 0; i < depth; i++) {
			if (a[startA + i] !== b[startB + i]) {
				return false;
			};
		};

		return true;
	};
}));
