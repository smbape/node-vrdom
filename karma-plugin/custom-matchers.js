beforeEach(function() {
    function stringify(entity) {
        return jasmine.pp(entity);
    }

    jasmine.addMatchers({
        toBeInstanceOf: function(util) {
            return {
                compare: function(actual, expected) {
                    var pass = actual instanceof expected;
                    var message = "Expected " + actual.constructor.name + (pass ? "not " : "") + "to be instance of " + expected.name;

                    return {
                        pass: pass,
                        message: message
                    };
                }
            };
        },

        toBeTypeOf: function(util) {
            return {
                compare: function(actual, expected) {
                    var pass = expected === typeof actual;
                    var message = "Expected " + actual + (pass ? "not " : "") + "to be type of " + expected;

                    return {
                        pass: pass,
                        message: message
                    };
                }
            };
        },

        toHaveOwnProperty: function(util) {
            return {
                compare: function(actual, property) {
                    var pass = actual && ('object' === typeof actual || 'function' === typeof actual) && actual.hasOwnProperty(property);
                    var message = "Expected " + actual + (pass ? "not " : "") + "to have own property " + property;

                    return {
                        pass: pass,
                        message: message
                    };
                }
            };
        },

        toHaveLength: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected) {
                    var pass = actual.length === expected;
                    return {
                        pass: pass,
                        message: 'Expected to have ' + (pass ? 'not ' : '') + 'length ' + expected + ', but actual length is ' + actual.length
                    };
                }
            };
        },

        toHaveEqualItemsAs: function(util, customEqualityTesters) {
            function craftMessage(actual, expected, mismatches) {
                if (mismatches.length === 0) {
                    return 'Expected ' + stringify(actual) + ' not to have same items as ' + stringify(expected);
                }

                return ['The collections have equal length, but do not match.'].concat(mismatches.map(function(m) {
                    return 'At ' + m.index + ': expected ' + stringify(m.expected) + ', actual ' + stringify(m.actual);
                })).join('\n    ');
            }

            function equals(a, b) {
                return a == b;
            }

            function compareArraysSorted(actual, expected) {
                var mismatches = [];
                actual.forEach(function(item, i) {
                    if (!equals(item, expected[i], customEqualityTesters)) {
                        mismatches.push({
                            index: i,
                            actual: item,
                            expected: expected[i]
                        });
                    }
                });
                return mismatches;
            }

            function compareArraysIgnoreSort(actual, expected) {
                expected = expected.slice(0);
                var mismatches = [];
                actual.forEach(function(item, i) {
                    var foundIndex = -1;
                    expected.some(function(expectedItem, i) {
                        if (equals(item, expectedItem, customEqualityTesters)) {
                            foundIndex = i;
                            return true;
                        }
                    });
                    if (foundIndex > -1) {
                        expected.splice(foundIndex, 1);
                    } else {
                        mismatches.push({
                            index: i,
                            actual: item,
                            expected: null
                        });
                    }
                });
                mismatches = mismatches.concat(expected.map(function(val, i) {
                    return {
                        index: actual.length + i,
                        actual: null,
                        expected: val
                    };
                }));
                return mismatches;
            }

            function compareHashes(actual, expected) {
                var mismatches = {};
                Object.keys(actual).forEach(function(key) {
                    if (!equals(actual[key], expected[key], customEqualityTesters)) {
                        mismatches[key] = {
                            index: key,
                            actual: actual[key],
                            expected: expected[key]
                        };
                    }
                });
                Object.keys(expected).forEach(function(key) {
                    if (!equals(actual[key], expected[key], customEqualityTesters) && !mismatches[key]) {
                        mismatches[key] = {
                            index: key,
                            actual: actual[key],
                            expected: expected[key]
                        };
                    }
                });
                return Object.keys(mismatches).map(function(key) {
                    return mismatches[key];
                });
            }
            return {
                compare: function(actual, expected, ignoreOrder) {
                    var mismatches;
                    if (Array.isArray(actual) && Array.isArray(expected)) {
                        if (actual.length !== expected.length) {
                            return {
                                pass: false,
                                message: 'Array length differs! Actual length: ' + actual.length + ', expected length: ' + expected.length
                            };
                        }
                        if (ignoreOrder) {
                            mismatches = compareArraysIgnoreSort(actual, expected);
                        } else {
                            mismatches = compareArraysSorted(actual, expected);
                        }
                    } else {
                        mismatches = compareHashes(actual, expected);
                    }
                    return {
                        pass: mismatches.length === 0,
                        message: craftMessage(actual, expected, mismatches)
                    };
                }
            };
        },

        toHaveSameItemsAs: function(util, customEqualityTesters) {
            function craftMessage(actual, expected, mismatches) {
                if (mismatches.length === 0) {
                    return 'Expected ' + stringify(actual) + ' not to have same items as ' + stringify(expected);
                }

                return ['The collections have equal length, but do not match.'].concat(mismatches.map(function(m) {
                    return 'At ' + m.index + ': expected ' + stringify(m.expected) + ', actual ' + stringify(m.actual);
                })).join('\n    ');
            }

            var equals = util.equals;

            function compareArraysSorted(actual, expected) {
                var mismatches = [];
                actual.forEach(function(item, i) {
                    if (!equals(item, expected[i], customEqualityTesters)) {
                        mismatches.push({
                            index: i,
                            actual: item,
                            expected: expected[i]
                        });
                    }
                });
                return mismatches;
            }

            function compareArraysIgnoreSort(actual, expected) {
                expected = expected.slice(0);
                var mismatches = [];
                actual.forEach(function(item, i) {
                    var foundIndex = -1;
                    expected.some(function(expectedItem, i) {
                        if (equals(item, expectedItem, customEqualityTesters)) {
                            foundIndex = i;
                            return true;
                        }
                    });
                    if (foundIndex > -1) {
                        expected.splice(foundIndex, 1);
                    } else {
                        mismatches.push({
                            index: i,
                            actual: item,
                            expected: null
                        });
                    }
                });
                mismatches = mismatches.concat(expected.map(function(val, i) {
                    return {
                        index: actual.length + i,
                        actual: null,
                        expected: val
                    };
                }));
                return mismatches;
            }

            function compareHashes(actual, expected) {
                var mismatches = {};
                Object.keys(actual).forEach(function(key) {
                    if (!equals(actual[key], expected[key], customEqualityTesters)) {
                        mismatches[key] = {
                            index: key,
                            actual: actual[key],
                            expected: expected[key]
                        };
                    }
                });
                Object.keys(expected).forEach(function(key) {
                    if (!equals(actual[key], expected[key], customEqualityTesters) && !mismatches[key]) {
                        mismatches[key] = {
                            index: key,
                            actual: actual[key],
                            expected: expected[key]
                        };
                    }
                });
                return Object.keys(mismatches).map(function(key) {
                    return mismatches[key];
                });
            }
            return {
                compare: function(actual, expected, ignoreOrder) {
                    var mismatches;
                    if (Array.isArray(actual) && Array.isArray(expected)) {
                        if (actual.length !== expected.length) {
                            return {
                                pass: false,
                                message: 'Array length differs! Actual length: ' + actual.length + ', expected length: ' + expected.length
                            };
                        }
                        if (ignoreOrder) {
                            mismatches = compareArraysIgnoreSort(actual, expected);
                        } else {
                            mismatches = compareArraysSorted(actual, expected);
                        }
                    } else {
                        mismatches = compareHashes(actual, expected);
                    }
                    return {
                        pass: mismatches.length === 0,
                        message: craftMessage(actual, expected, mismatches)
                    };
                }
            };
        },

        toHaveUniqueItems: function(util, customEqualityTesters) {
            function customIndexOf(array, value, start) {
                for (var i = start || 0; i < array.length; i++) {
                    if (util.equals(value, array[i], customEqualityTesters)) {
                        return i;
                    }
                }
                return -1;
            }

            function craftMessage(duplicates, pass) {
                return pass ? 'All items in the array are unique' : 'Array contains duplicates: \n' + duplicates.map(function(dupe) {
                    return jasmine.pp(dupe[2]) + ' at ' + dupe[0] + ' and ' + dupe[1];
                }).join('\n');
            }

            return {
                compare: function(actual) {
                    var duplicates = [];
                    actual.forEach(function(item, i) {
                        var index = customIndexOf(actual, item, i + 1);
                        if (index > -1) {
                            duplicates.push([i, index, item]);
                        }
                    });
                    var pass = duplicates.length === 0;
                    return {
                        pass: pass,
                        message: craftMessage(duplicates, pass)
                    };
                }
            };
        }
    });
});