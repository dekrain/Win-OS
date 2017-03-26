// BASIC

function createBox(bounds, clr, cdr) {
	return {
		type: '$BOX',
		bounds: bounds,
		color: clr,
		children: cdr || []
	};
}

function createClickable(bounds, act, box) {
	return {
		type: '$CLICKABLE',
		bounds: bounds,
		action: act,
		box: box,
		mouse: false
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

// function createPopup;

// function createButton;

//function createSimplePopup;
