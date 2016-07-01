
// http://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
EventTarget.prototype.addEventListenerBase = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener) {
	if (!this.EventList) { this.EventList = []; };
	this.addEventListenerBase.apply(this, arguments);
	if (!this.EventList[type]) { this.EventList[type] = []; };

	var list = this.EventList[type];

	for (var index = 0; index != list.length; index++) {
		if (list[index] === listener) { return; }
	};
	list.push(listener);
};

EventTarget.prototype.removeEventListenerBase = EventTarget.prototype.removeEventListener;
EventTarget.prototype.removeEventListener = function (type, listener) {
	if (!this.EventList) { this.EventList = []; };
	if (listener instanceof Function) { this.removeEventListenerBase.apply(this, arguments); };
	if (!this.EventList[type]) { return; };

	var list = this.EventList[type];

	for (var index = 0; index != list.length;) {
		var item = list[index];

		if (!listener) {
			this.removeEventListenerBase(type, item);
			list.splice(index, 1); continue;
		}

		else if (item === listener) {
			list.splice(index, 1); break;
		};

		index++;
	};
	if (list.length == 0) { delete this.EventList[type]; };
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
	modes: document.querySelectorAll('.Mode'),
	viewer: document.querySelector('.Viewer'),
	viewerImgs: document.querySelectorAll('.Viewer__img'),
	viewerImg: {
		main: document.querySelector('.Viewer__img[data-type="main"]'),
		a: document.querySelector('.Viewer__img[data-type="a"]'),
		b: document.querySelector('.Viewer__img[data-type="b"]'),
		c: document.querySelector('.Viewer__img[data-type="c"]')
	}
};

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
}

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
					imgs: [ui.loaderImg.a.src, ui.loaderImg.b.src]
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
					setTimeout(function () {
						ui.viewer.classList.add('Viewer--diff-highlight');
					}, 0);
				});
				break;

			// встроенный
			case 'inline':
				drawInlineDiff(ui.loaderImg.a.src, ui.loaderImg.b.src).then(function (diffCanvas, diffData) {
					ui.viewerImg.c.style.display = 'inline-block';
					ui.viewerImg.c.width = diffCanvas.width;
					ui.viewerImg.c.height = diffCanvas.height;
					ui.viewerImg.c.getContext('2d').drawImage(diffCanvas, 0, 0);
				});
				break;

			default:
				break;
		}
	};
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
