var a = 1;
/// #if DEBUG
debug("hello");
/// #endif

/// #define simple "expression"

var b = 2;

/// #if OS === "ios"
iosInit();
/// #elif OS === "android"
androidInit();
/// #else if OS === "win32"
windowsInit();
/// #else
otherInit();
/// #endif

var c = 3;

/// #if version > 4
loadVersion4();
if (true) {
	stuff();
	if (true) {
		anotherStuff();
	}
}
/// #endif

// check empty
/// #if typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
/// #endif

/// #if typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
/// #else
/// #endif

/// #if typeof NODE_ENV === 'undefined' || NODE_ENV !== 'production'
/// #else if typeof NODE_ENV !== 'undefined'
/// #elif typeof NODE_ENV !== 'undefined'
/// #endif
