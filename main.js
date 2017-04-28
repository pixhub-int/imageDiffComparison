
// http://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
EventTarget.prototype._addEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener) {
	if (!this.EventList) { this.EventList = []; };
	this._addEventListener.apply(this, arguments);
	if (!this.EventList[type]) { this.EventList[type] = []; };

	var list = this.EventList[type];

	for (var index = 0; index != list.length; index++) {
		if (list[index] === listener) { return; }
	};
	list.push(listener);
};

EventTarget.prototype._removeEventListener = EventTarget.prototype.removeEventListener;
EventTarget.prototype.removeEventListener = function (type, listener) {
	if (!this.EventList) { this.EventList = []; };
	if (listener instanceof Function) { this._removeEventListener.apply(this, arguments); };
	if (!this.EventList[type]) { return; };

	var list = this.EventList[type];

	for (var index = 0; index != list.length;) {
		var item = list[index];

		if (!listener) {
			this._removeEventListener(type, item);
			list.splice(index, 1); continue;
		}

		else if (item === listener) {
			list.splice(index, 1); break;
		};

		index++;
	};
	if (list.length == 0) { delete this.EventList[type]; };
};


// протез для определения ближайшего родителя по селектору
// https://developer.mozilla.org/ru/docs/Web/API/Element/closest
Element.prototype.matches = Element.prototype.matches || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;
Element.prototype.closest = Element.prototype.closest || function closest(selector) {
	if (!this) return null;
	if (this.matches(selector)) return this;
	if (!this.parentElement) { return null }
	else return this.parentElement.closest(selector)
};


// протез для генерации файла из содержимого холста
if (!HTMLCanvasElement.prototype.toBlob) {
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {

			var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
				len = binStr.length,
				arr = new Uint8Array(len);

			for (var i = 0; i < len; i++) {
				arr[i] = binStr.charCodeAt(i);
			}

			callback(new Blob([arr], { type: type || 'image/png' }));
		}
	});
};


// элементы страницы
var ui = {
	loaders: document.querySelectorAll('.Loader'),
	loader: {
		a: document.querySelector('.Loader[data-type="a"]'),
		b: document.querySelector('.Loader[data-type="b"]')
	},
	loaderImgs: document.querySelectorAll('.Loader__image'),
	loaderImg: {
		a: document.querySelector('.Loader[data-type="a"] .Loader__image'),
		b: document.querySelector('.Loader[data-type="b"] .Loader__image')
	},
	boxes: {
		view: document.querySelector('.App__box--view')
	},
	modes: document.querySelectorAll('.Mode'),
	viewer: document.querySelector('.Viewer'),
	wrapper: document.querySelector('.Viewer__wrapper'),
	viewerImgs: document.querySelectorAll('.Viewer__img'),
	viewerImg: {
		main: document.querySelector('.Viewer__img[data-type="main"]'),
		a: document.querySelector('.Viewer__img[data-type="a"]'),
		b: document.querySelector('.Viewer__img[data-type="b"]'),
		c: document.querySelector('.Viewer__img[data-type="c"]')
	}
};

// чтобы в хроме не отображалась рамка отсутствующего изображения
var empty = getEmpty();

[].forEach.call(document.querySelectorAll('img'), function (img) {
	img.src = empty;
});

function getEmpty () {
	var c = document.createElement('canvas')
	var cx = c.getContext('2d');

	c.width = 1;
	c.height = 1;

	return c.toDataURL();
};

// очистка состояния
function clear () {
	ui.viewerImg.main.src = empty;
	ui.viewerImg.a.src = empty;
	ui.viewerImg.b.src = empty;
	ui.viewerImg.b.removeAttribute('style');
	ui.viewerImg.c.width = '';
	ui.viewerImg.c.height = '';
	ui.viewerImg.c.removeAttribute('style');
	ui.viewer.className = 'Viewer';

	[].forEach.call(ui.modes, function (mode) {
		mode.classList.remove('Mode--active');
	});

	[].forEach.call(ui.loaders, function (loader) {
		loader.classList.remove('Loader--active');
	});

	if (document.querySelector('#Marks')) {
		document.querySelector('#Marks').remove();
	};

	ui.viewer.removeEventListener('mousemove');
	ui.viewer.removeEventListener('mouseleave');
};

document.addEventListener('click', onClick);

// https://developer.mozilla.org/ru/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets
// https://bugs.chromium.org/p/chromium/issues/detail?id=122652
// http://stackoverflow.com/questions/27254276/initiate-click-on-div-using-tab-and-enter
document.addEventListener('keydown', function (e) {

	// ввод
	if (e.which === 13) {
		onClick(e);
	}

	// пробел
	else if (e.which === 32) {
		onDblClick(e);
	};
});

function onClick (e) {

	// просмотр изображения
	if (e.target.classList.contains('Loader') || e.target.closest('.Loader')) {
		var loader = e.target.classList.contains('Loader') ? e.target : e.target.closest('.Loader');
		var image = loader.querySelector('.Loader__image');

		// изображение должно быть выбрано
		if (!image.src.match('blob:')) { return; };

		// обнуление
		clear();

		// отображение изображения
		loader.classList.add('Loader--active');
		ui.viewerImg.main.src = image.src;
	}

	// переключение режима сравнения
	else if (e.target.classList.contains('Mode') || e.target.closest('.Mode')) {
		e.preventDefault();

		var mode = e.target.classList.contains('Mode') ? e.target : e.target.closest('.Mode');
		var modeType = mode.getAttribute('data-type');

		if (mode.classList.contains('Mode--active')) { return };

		// изображения должны быть выбраны
		if (!ui.loaderImg.a.src.match('blob:') || !ui.loaderImg.b.src.match('blob:')) { return; };

		// обнуление
		clear();

		// включение режима сравнения
		mode.classList.add('Mode--active');

		switch (modeType) {

			// рядом
			case 'side':
				ui.viewerImg.a.src = ui.loaderImg.a.src;
				ui.viewerImg.b.src = ui.loaderImg.b.src;
				break;

			// шторка
			case 'swipe':
				ui.viewerImg.a.src = ui.loaderImg.a.src;
				ui.viewerImg.b.src = empty;
				ui.viewerImg.b.style.backgroundImage = 'url('+ ui.loaderImg.b.src +')';
				ui.viewerImg.b.style.height = ui.loaderImg.b.naturalHeight +'px';
				ui.viewerImg.b.style.width = ui.loaderImg.b.naturalWidth +'px';
				ui.viewer.classList.add('Viewer--diff-swipe');

				ui.viewer.addEventListener('mousemove', function (e) {
					ui.viewerImg.b.style.width = (e.pageX - this.getBoundingClientRect().right) * -1 +'px';
				});

				ui.viewer.addEventListener('mouseleave', function () {
					ui.viewerImg.b.style.width = ui.loaderImg.b.naturalWidth +'px';
				});
				break;

			// растворение
			case 'opacity':
				ui.viewerImg.a.src = ui.loaderImg.a.src;
				ui.viewerImg.b.src = ui.loaderImg.b.src;
				ui.viewerImg.b.style.marginLeft = '-'+ ui.viewerImg.a.clientWidth +'px';
				setTimeout(function () {
					ui.viewer.classList.add('Viewer--diff-opacity');
				}, 0);
				break;

			// разница
			case 'negative':
				ui.viewerImg.a.src = ui.loaderImg.a.src;
				ui.viewerImg.b.src = ui.loaderImg.b.src;
				ui.viewerImg.b.style.marginLeft = '-'+ ui.viewerImg.a.clientWidth +'px';
				setTimeout(function () {
					ui.viewer.classList.add('Viewer--diff-negative');
				}, 0);
				break;

			// подсветка
			case 'highlight':
				getPixelDiff({
					imgs: [
						ui.loaderImg.a.src,
						ui.loaderImg.b.src
					]
				}).then(function (data) {
					ui.viewerImg.a.src = ui.loaderImg.a.src;
					ui.viewerImg.b.src = ui.loaderImg.b.src;
					ui.viewerImg.b.style.marginLeft = '-'+ ui.viewerImg.a.clientWidth +'px';
					ui.viewerImg.c.style.display = 'inline-block';
					ui.viewerImg.c.width = data.canvas.width;
					ui.viewerImg.c.height = data.canvas.height;
					ui.viewerImg.c.getContext('2d').drawImage(data.canvas, 0, 0);
					ui.viewerImg.c.style.marginLeft = '-'+ ui.viewerImg.b.clientWidth +'px';
					ui.viewerImg.c.style.mixBlendMode = 'multiply';
					generateDiffMarks({
						data: data
					}).then(function (data) {
						ui.boxes.view.appendChild(data.marks);
						URL.revokeObjectURL(data.url);
						checkScroll();
						window.scrollTo(window.pageXOffset, data.first);
					});
					setTimeout(function () {
						ui.viewer.classList.add('Viewer--diff-highlight');
					}, 0);
				});
				break;

			// встроенный
			case 'inline':
				diffInline([
					ui.loaderImg.a.src,
					ui.loaderImg.b.src
				]).then(function (data) {
					if (data.diff.old + data.diff.new) {
						ui.viewerImg.c.style.display = 'inline-block';
						ui.viewerImg.c.width = data.diff.image.width;
						ui.viewerImg.c.height = data.diff.image.height;
						ui.viewerImg.c.getContext('2d').drawImage(diffInline.renderResult(data.diff.image), 0, 0);
						generateDiffMarks(data.diff).then(function (data) {
							ui.boxes.view.appendChild(data.marks);
							URL.revokeObjectURL(data.url);
							if (data.first) {
								ui.wrapper.scrollTop = data.first;
							};
							checkScroll();
							window.scrollTo(window.pageXOffset, data.first);
						});
						setTimeout(function () {
							ui.wrapper.classList.add('Viewer__wrapper--diff-inline');
						}, 0);
					}
					else {
						alert('Изображения одинаковы!');
					};
				});
				break;

			default:
				break;
		}
	};
};

var scrollInfo = (function () {
	var width = 15;
	var height = 15;

	var e = createNode(`
		<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; visibility: hidden; top: -100%; left: -100%"></div>
	`);

	document.body.appendChild(e);

	width = e.offsetWidth - e.clientWidth;
	height = e.offsetHeight - e.clientHeight;

	function hasX (node) {
		return !!(node.offsetHeight - node.clientHeight);
	};

	function hasY (node) {
		return !!(node.offsetWidth - node.clientWidth);
	};

	function check (node) {
		return {
			x: hasX(node),
			y: hasY(node)
		}
	};

	return {
		width: width,
		height: height,
		hasX: hasX,
		hasY: hasY,
		check: check
	}
})();

checkScroll();
window.addEventListener('resize', checkScroll);

function checkScroll () {
	var marks = document.querySelector('#Marks');

	if (!marks) { return; };

	var check = scrollInfo.check(ui.wrapper);

	if (check.x) {
		marks.style.height = `calc(100% - ${scrollInfo.height * 3}px)`;
	}
	else {
		marks.style.height = `calc(100% - ${scrollInfo.height * 2}px)`;
	};

	if (check.y) {
		marks.style.visibility = 'visible';
	}
	else {
		marks.style.visibility = '';
	};
};

// СДЕЛАТЬ
// на большом количестве меток видна погрешность позиционирования
function generateDiffMarks (diff) {
	if (!diff) { return ''; };

	var c = document.createElement('canvas');
	var cx = c.getContext('2d');

	c.width = 1;

	var diffItems;
	var length = 0;

	if (diff.data && diff.data.canvas) {
		diffItems = diff.data.difference.y;
		length = diffItems.length;
		c.height = diff.data.canvas.height;
	}
	else if (diff.default) {
		diffItems = diff.data;
		length = diffItems.length;
		c.height = length;
	};

	// первое отличие
	var firstMark = 0;

	var canvasPointer = 0;
	var shift = 0;
	var shiftOld = 0;
	var shiftNew = 0;

	for (var index = 0; index < length - 1; index++) {
		var line = diffItems[index];
		
		if (!line.type) {
			if (firstMark === 0) {
				firstMark = line;
			};

			cx.fillStyle = 'red';
			cx.fillRect(0, line, 1, 1);
		}
		else {
			if (
				firstMark === 0
				&& line.type && ['old', 'new', 'replace'].indexOf(line.type) > -1
			) {
				firstMark = index + shift;
			};

			if (line.type === 'replace') {
				var counter = 0;
				var canvasPointer = line.lines[0][0].line + shift;

				while (counter < line.lines[0].length) {
					cx.fillStyle = 'red';
					cx.fillRect(0, ++canvasPointer, 1, 1);
					counter++;
				};

				counter = 0;
				
				while (counter < line.lines[1].length) {
					cx.fillStyle = 'green';
					cx.fillRect(0, ++canvasPointer, 1, 1);
					counter++;
				};

				shift += counter;
			}
			else if (line.type === 'old') {
				var canvasPointer = line.line + shiftNew;
				
				cx.fillStyle = 'red';
				cx.fillRect(0, canvasPointer, 1, 1);
				shiftOld++;
			}
			else if (line.type === 'new') {
				var canvasPointer = line.line + shiftOld;
				
				cx.fillStyle = 'green';
				cx.fillRect(0, canvasPointer, 1, 1);
				shiftNew++;
			};
		};
	};

	return new Promise(function (resolve, reject) {
		c.toBlob(function (blob) {
			var img = new Image();
			var url = URL.createObjectURL(blob);

			img.src = url;

			resolve({
				marks: createNode(`
					<img class="Viewer__diff-marks Viewer__diff-marks--vertical" id="Marks" src="${url}" style="
						width: ${scrollInfo.width}px;
						top: ${scrollInfo.width}px;
						height: calc(100% - ${scrollInfo.width * 2}px)
					">
				`),
				first: firstMark,
				url: url
			});
		});
	})
};


// добавление возможности смены изображения
// по двойному нажатию
document.addEventListener('dblclick', onDblClick);

function onDblClick (e) {
	if (e.target.classList.contains('Loader') || e.target.closest('.Loader')) {
		var loader = e.target.classList.contains('Loader') ? e.target : e.target.closest('.Loader');
		var input = loader.querySelector('.Loader__input');

		input.click();
	};
};

document.addEventListener('change', onFile);

[].forEach.call(Paste.init(ui.loaders), function (loader) {

	// по вставке из буфера
	loader.addEventListener('pasteImage', function (e) {
		var src = URL.createObjectURL(e.detail.blob);
		
		loader.querySelector('.Loader__image').src = src;
	});

	// по перетягиванию
	loader.addEventListener('drop', function (e) {
		onFile(e);
		this.classList.remove('Loader--onDragOver');
	});
	loader.addEventListener('dragover', function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		this.classList.add('Loader--onDragOver');
	});
	loader.addEventListener('dragleave', function handleDragOver(e) {
		this.classList.remove('Loader--onDragOver');
	});
});

// открытие файла
function onFile (e) {
	e.preventDefault();

	var input = e.target;
	var loader = input.closest('.Loader');
	var image = loader.querySelector('.Loader__image');

	var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
	
	if (file && file.type && file.type.match('image.*')) {
		var src = URL.createObjectURL(file);
		
		image.src = src;
	};
};


function createNode (str) {
	return document.createRange().createContextualFragment(str.trim()).firstElementChild;
};
