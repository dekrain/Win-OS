// Win OS by DeKrain is JS rewrite of New Snap! OS by DeKrain created in Snap!

var cnv, ctx;
var colors, morphs, images, next, mouse, resources;
var winScreen, runtime, font_size;

// 2 functions from morphic.js (C) Jens Moenig
function getDocumentPositionOf(aDOMelement) {
    // answer the absolute coordinates of a DOM element in the document
    var pos, offsetParent;
    if (aDOMelement === null) {
        return {x: 0, y: 0};
    }
    pos = {x: aDOMelement.offsetLeft, y: aDOMelement.offsetTop};
    offsetParent = aDOMelement.offsetParent;
    while (offsetParent !== null) {
        pos.x += offsetParent.offsetLeft;
        pos.y += offsetParent.offsetTop;
        if (offsetParent !== document.body &&
                offsetParent !== document.documentElement) {
            pos.x -= offsetParent.scrollLeft;
            pos.y -= offsetParent.scrollTop;
        }
        offsetParent = offsetParent.offsetParent;
    }
    return pos;
}
function fillPage() {
    var clientHeight = window.innerHeight,
        clientWidth = window.innerWidth;

    cnv.style.position = "absolute";
    cnv.style.left = "0px";
    cnv.style.right = "0px";
    cnv.style.width = "100%";
    cnv.style.height = "100%";

    if (document.documentElement.scrollTop) {
        // scrolled down b/c of viewport scaling
        clientHeight = document.documentElement.clientHeight;
    }
    if (document.documentElement.scrollLeft) {
        // scrolled left b/c of viewport scaling
        clientWidth = document.documentElement.clientWidth;
    }
    if (cnv.width !== clientWidth) {
        cnv.width = clientWidth;
    }
    if (cnv.height !== clientHeight) {
        cnv.height = clientHeight;
    }
};

function containsPoint(rect, point) {
	var x = point.x, y = point.y, rx = rect[0], ry = rect[1], rw = rect[2], rh = rect[3];
	return rx <= x && x <= rx + rw && ry <= y && y <= ry + rh;
}

function init(fill) {
	cnv = document.getElementById('canvas');
	ctx = cnv.getContext('2d');
	if (fill) fillPage();
	colors = {
		bg: 'rgb(15,255,243)',
		taskbar: 'rgb(15,15,255)',
		font: 'rgb(0,0,0)',
		font_light: 'rgb(255,255,255)',
		on: 'rgb(0,255,0)',
		off: 'rgb(255,0,0)',
		dialog: ['rgb(150,150,150)', 'rgb(2230,230,230)']
	};
	morphs = [];
	images = [];
	next = []; // Deprecated?
	mouse = {x:0, y:0, down: false, last: false};
	font_size = 15;
	var offset = getDocumentPositionOf(cnv);
	winScreen = {x: offset.x, y: offset.y, w: cnv.width, h: cnv.height};
	cnv.addEventListener('mousedown', ()=>{mouse.down = true; });
	cnv.addEventListener('mouseup', ()=>{mouse.down = false; });
	cnv.addEventListener('mousemove', (evt)=>{
		mouse.x = evt.clientX - winScreen.x;
		mouse.y = evt.clientY - winScreen.y;
	});
	draw(); // Init background and variables
	waitForResources().then(function() {
		initGUIComponents();
		loop();
	});
}

function waitForResources() {
	resources = [{ type: 'image', name: 'dialog_icon', url: 'dialog.png', done: false, value: null }];
	for (var res of resources) {
		if (res.type === 'image') {
			res.value = new Image();
			res.value.src = res.url;
			res.value.onload = ()=>{res.done = true; };
		}
	}
	return new Promise(function f(rsv) {
		setTimeout(function() {
			for (var res of resources) {
				if (!res.done) rsv(new Promise(f));
			}
			rsv();
		}, 1);
	});
}

function getResource(name) {
	for (var res of resources) {
		if (res.name === name)
			return res.value;
	}
	return null;
}

function initGUIComponents() {
	var fps_bar = createState([createText([80, 20], ()=>('FPS '+runtime.fps_last), font_size, colors.font_light), createEmpty()]);
	var fps_toggle_pos = {
		box: [winScreen.w - 70, 30, 60, 30],
		text: [winScreen.w - 70, 50]
	};
	var fps_toggle = createClickable(
			fps_toggle_pos.box,
			(obj)=>{toggleState(obj); toggleState(fps_bar); },
			createState([
				createBox(
					fps_toggle_pos.box,
					colors.on,
					[createText(fps_toggle_pos.text, 'FPS ON', font_size, colors.font)]
				),
				createBox(
					fps_toggle_pos.box,
					colors.off,
					[createText(fps_toggle_pos.text, 'FPS OFF', font_size, colors.font)]
				)
			])
		);
	var mouse_down_pos = {
		box: [winScreen.w - 40, 0, 40, 30],
		text: [winScreen.w - 140, 20]
	};
	var mouse_down = createDummy([createState([createBox(mouse_down_pos.box, colors.on), createBox(mouse_down_pos.box, colors.off)], ()=>(mouse.down ? 0 : 1)), createText(mouse_down_pos.text, 'Mouse down', font_size, colors.font_light)]);
	var shutdown = createClickable([0, 0, 70, 30], ()=>{next.push(()=>{ctx.fillStyle='#000000'; ctx.fillRect(0, 0, winScreen.w, winScreen.h); runtime.stop(); }); }, createBox([0, 0, 70, 30], colors.off, [createText([0, 15], 'SHUTDOWN', font_size, colors.font_light)]));
	var test_popup = ()=>{morphs.push(createSimplePopup('A popup', 'CLICK THE [OK] BUTTON', ()=>{morphs.push(createSimplePopup('YAY!!!', 'YOU CLICKED THE [OK] BUTTON!!!!!11!1!one!!1', ()=>{})); }, true)); };
	test_popup();
	morphs.push(fps_bar, fps_toggle, mouse_down, shutdown, createShortcutImg([10, 40], getResource('dialog_icon'), 'Test Popup', test_popup));
}

function loop() {
	runtime = {
		stop() {this.running = false; },
		running: true,
		fps: 120,
		fps_last: 0,
		fps_start: null,
		fps_end: null,
		idle_last: null
	};
	setTimeout(function step() {
		if (runtime.running) {
			runtime.fps_start = Date.now();
			logic();
			draw();
			tasks(); // Deprecated?
			runtime.fps_end = Date.now();
			runtime.idle_last = (1/runtime.fps) - (runtime.fps_end - runtime.fps_start);
			runtime.fps_last = Math.round(runtime.fps_end - runtime.fps_start);
			setTimeout(step, runtime.idle_last);
		}
	}, 0);
}

function tasks() {
	for (var task of next) {
		task();
	}
	next.splice(0, next.length);
}

function logic() {
	(function l(list) {
		list.forEach(function f(morph) {
			switch (morph.type) {
				case '$BOX':
					images.push(morph);
					l(morph.children);
					break;
				case '$IMAGE':
					images.push(morph);
					break;
				case '$CLICKABLE':
					if (mouse.down && !mouse.last && containsPoint(morph.bounds, mouse))
						morph.action(morph.box);
					f(morph.box);
					break;
				case '$STATE':
					f(morph.states[typeof morph.state === 'number' ? morph.state : morph.state()]);
					break;
				case '$TEXT':
					images.push(morph);
					break;
				case '$DUMMY':
					l(morph.children);
			}
		});
	})(morphs);
	if (mouse.down && !mouse.last)
		mouse.last = true;
	else if (mouse.last && !mouse.down)
		mouse.last = false;
}

function draw() {
	// var padding = 5;
	ctx.fillStyle = colors.bg; // Background
	ctx.fillRect(0, 0, winScreen.w, winScreen.h);
	ctx.fillStyle = colors.taskbar; // Task bar
	ctx.fillRect(0, 0, winScreen.w, 30);
	for (var morph of images) { // Render all morphs
		let pos;
		switch (morph.type) {
			case '$BOX':
				pos = morph.bounds;
				ctx.fillStyle = morph.color;
				ctx.fillRect(pos[0], pos[1], pos[2], pos[3]);
				break;
			case '$IMAGE':
				pos = morph.position;
				ctx.drawImage(morph.image, pos[0], pos[1]);
				break;
			case '$TEXT':
				pos = morph.position;
				ctx.fillStyle = morph.color;
				ctx.font = morph.size+'px monospace';
				ctx.fillText(typeof morph.text === 'string' ? morph.text : morph.text(), pos[0], pos[1]);
				break;
		}
	}
	images.splice(0, images.length);
}
