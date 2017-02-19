var a = 1;
// @si version > 4
loadVersion4();
// @definir fake "expression"

    // @si OS === "android"
    android_Init_In_Version_4();
    // @finsi
// @sinon
loadVersion2();
    // @si OS === "ios"
    IOS_Init_In_Version_2();
    // @definir fake "expression"
    // @sinon
    android_Init_In_Version_2();
    // @definir nested "expression"

        // @si version > 4
        loadVersion4();

            // @si OS === "android"
            android_Init_In_Version_4();
            // @definir fake "expression"
            // @finsi
        // @sinon
        loadVersion2();
            // @si OS === "ios"
            IOS_Init_In_Version_2();
            // @sinon
            android_Init_In_Version_2();
            // @finsi

            // @definir deepNested "expression"
        // @finsi
    // @finsi

// @finsi
a = a + 1;

var b = 1;
// @si version < 4
loadVersion2();

    // @si OS === "ios"
    IOS_Init_In_Version_2();
    // @finsi
// @finsi
b = a + 1;

// @definir top "expression"
