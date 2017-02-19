var a = 1;
/// #if version > 4
loadVersion4();
/// #define fake "expression"

    /// #if OS === "android"
    android_Init_In_Version_4();
    /// #endif
/// #else
loadVersion2();
    /// #if OS === "ios"
    IOS_Init_In_Version_2();
    /// #define fake "expression"
    /// #else
    android_Init_In_Version_2();
    /// #define nested "expression"

        /// #if version > 4
        loadVersion4();

            /// #if OS === "android"
            android_Init_In_Version_4();
            /// #define fake "expression"
            /// #endif
        /// #else
        loadVersion2();
            /// #if OS === "ios"
            IOS_Init_In_Version_2();
            /// #else
            android_Init_In_Version_2();
            /// #endif

            /// #define deepNested "expression"
        /// #endif
    /// #endif

/// #endif
a = a + 1;

var b = 1;
/// #if version < 4
loadVersion2();

    /// #if OS === "ios"
    IOS_Init_In_Version_2();
    /// #endif
/// #endif
b = a + 1;

/// #define top "expression"
