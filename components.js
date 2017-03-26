// BASIC

function createBox(bounds, clr, cdr) {
	return {
		type: '$BOX',
		bounds: bounds,
		color: clr,
		children: cdr || []
	};
}

function createImage(pos, img) {
	return {
		type: '$IMAGE',
		position: pos,
		image: img
	};
}

function createClickable(bounds, act, box) {
	return {
		type: '$CLICKABLE',
		bounds: bounds,
		action: act,
		box: box
	};
}

function createState(states, state) {
	return {
		type: '$STATE',
		states: states || [],
		state: state || 0
	};
}

function createText(pos, text, size, clr) {
	return {
		type: '$TEXT',
		position: pos,
		text: text,
		size: size,
		color: clr
	};
}

function createDummy(cdr) {
	return {
		type: '$DUMMY',
		children: cdr
	};
}

function createEmpty() {
	return { type: '$EMPTY' };
}

// MANIPULATE

function toggleState(obj, state) {
	if (obj && obj.type === '$STATE')
		obj.state = state || (obj.state < obj.states.length-1 ? obj.state+1 : 0);
}

function removeMorph(obj) {
	if (obj && window.morphs.includes(obj))
		window.morphs.splice(window.morphs.indexOf(obj), 1);
}

// UI

function createPopup(title, msg, buttons) {
	var pos = [screen.h/2+20, 30, 20];
	var x = screen.w/2-100;
	var XPos = [screen.w/2+80, screen.h/2-50, 20, 20];
	var dialog;
	dialog = createBox([screen.w/2-100, screen.h/2-50, 200, 100], colors.dialog[0], [createBox([screen.w/2-100, screen.h/2-50, 200, 20], colors.taskbar), createText([screen.w/2-80, screen.h/2-40], title, 10, colors.font_light), createText([screen.w/2-80, screen.h/2-20], msg, 10, colors.font), createClickable(XPos, ()=>{removeMorph(dialog); }, createBox(XPos, colors.off, [createText([screen.w/2+85, screen.h/2-35], 'X', font_size, colors.font_light)]))].concat(buttons.map((button)=>{x+=40; return createButton(button[0], ()=>{button[1](dialog); }, colors.dialog[1], [x].concat(pos)); })));
	return dialog;
}

function createButton(text, act, clr, pos) {
	return createClickable(pos, act, createBox(pos, clr, [createText([pos[0]+5, pos[1]+10], text, 10, colors.font)]));
}

function createSimplePopup(title, text, act, cancel) {
	return createPopup(title, text, [['OK', (dialog)=>{act(dialog, 0); removeMorph(dialog); }]].concat(cancel ? [['Cancel', (dialog)=>{removeMorph(dialog); }]] : []));
}

function createShortcut(pos, clr, name, act) {
	var bounds = [pos[0], pos[1], 50, 50];
	return createClickable(bounds, act, createBox(bounds, clr, [createText([pos[0], pos[1]+50+font_size, 50, 50], name, font_size, colors.font)]));
}

function createShortcutImg(pos, img, name, act) {
	var bounds = [pos[0], pos[1], img.width, img.height];
	return createClickable(bounds, act, createDummy([createImage(pos, img), createText([pos[0], pos[1]+bounds[3]+font_size, bounds[2], bounds[3]], name, font_size, colors.font)]));
}
