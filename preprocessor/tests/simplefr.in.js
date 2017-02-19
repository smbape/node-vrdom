var a = 1;
// @si DEBUG
debug("hello");
// @finsi

// @definir simple "expression"

var b = 2;

// @si OS === "ios"
iosInit();
// @sinonsi OS === "android"
androidInit();
// @sinon si OS === "win32"
windowsInit();
// @sinon
otherInit();
// @finsi

var c = 3;

// @si version > 4
loadVersion4();
if (true) {
	stuff();
	if (true) {
		anotherStuff();
	}
}
// @finsi

// check empty
// @si typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
// @finsi

// @si typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
// @sinon
// @finsi

// @si typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
// @sinon si typeof NODE_ENV !== 'undefined'
// @sinonsi typeof NODE_ENV !== 'undefined'
// @finsi
