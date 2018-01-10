module.exports = {
    "DOMElementMap": {
        "properties": {},
        "impls": []
    },
    "DocumentAndElementEventHandlers": {
        "properties": {},
        "impls": []
    },
    "Element": {
        "properties": {
            "className": true,
            "id": true
        },
        "impls": []
    },
    "ElementContentEditable": {
        "properties": {
            "contentEditable": true
        },
        "impls": []
    },
    "GlobalEventHandlers": {
        "properties": {},
        "impls": []
    },
    "HTMLAnchorElement": {
        "properties": {
            "charset": true,
            "coords": true,
            "dataFld": true,
            "dataSrc": true,
            "download": true,
            "hreflang": true,
            "methods": true,
            "name": true,
            "noreferrer": {
                "attrName": "noreferrer"
            },
            "referrerPolicy": {
                "attrName": "referrer-policy"
            },
            "rel": true,
            "rev": true,
            "shape": true,
            "target": true,
            "type": true,
            "urn": true
        },
        "impls": [
            "HTMLElement",
            "HTMLHyperlinkElementUtils"
        ]
    },
    "HTMLAppletElement": {
        "properties": {
            "align": true,
            "alt": true,
            "archive": true,
            "code": true,
            "codeBase": true,
            "dataFld": true,
            "dataSrc": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "hspace": true,
            "name": true,
            "object": true,
            "vspace": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLAreaElement": {
        "properties": {
            "alt": true,
            "coords": true,
            "download": true,
            "hreflang": true,
            "noHref": true,
            "noreferrer": {
                "attrName": "noreferrer"
            },
            "referrerPolicy": {
                "attrName": "referrer-policy"
            },
            "rel": true,
            "shape": true,
            "target": true,
            "type": true
        },
        "impls": [
            "HTMLElement",
            "HTMLHyperlinkElementUtils"
        ]
    },
    "HTMLAudioElement": {
        "properties": {},
        "impls": [
            "HTMLMediaElement"
        ]
    },
    "HTMLBRElement": {
        "properties": {
            "clear": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLBaseElement": {
        "properties": {
            "href": true,
            "target": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLBodyElement": {
        "properties": {
            "aLink": true,
            "background": true,
            "bgColor": true,
            "bottomMargin": true,
            "leftMargin": true,
            "link": true,
            "marginHeight": true,
            "marginTop": true,
            "marginWidth": true,
            "rightMargin": true,
            "text": true,
            "vLink": true
        },
        "impls": [
            "HTMLElement",
            "WindowEventHandlers"
        ]
    },
    "HTMLButtonElement": {
        "properties": {
            "autofocus": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "disabled": true,
            "formAction": true,
            "formEnctype": true,
            "formMethod": true,
            "formNoValidate": true,
            "formTarget": true,
            "menu": true,
            "name": true,
            "type": true,
            "value": {
                "type": "String",
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLCanvasElement": {
        "properties": {
            "height": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "height"
            },
            "width": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDListElement": {
        "properties": {
            "compact": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDataElement": {
        "properties": {
            "value": {
                "type": "String",
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDataListElement": {
        "properties": {},
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDetailsElement": {
        "properties": {
            "open": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDirectoryElement": {
        "properties": {
            "compact": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLDivElement": {
        "properties": {
            "align": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLElement": {
        "properties": {
            "accessKey": true,
            "contextMenu": true,
            "dir": true,
            "draggable": true,
            "hidden": true,
            "itemid": {
                "attrName": "itemid"
            },
            "itemprop": {
                "attrName": "itemprop"
            },
            "itemref": {
                "attrName": "itemref"
            },
            "itemscope": true,
            "itemtype": {
                "attrName": "itemtype"
            },
            "lang": true,
            "slot": {
                "attrName": "slot"
            },
            "spellcheck": true,
            "style": {
                "isProperty": true,
                "attrName": "style"
            },
            "tabIndex": true,
            "title": true,
            "translate": true
        },
        "impls": [
            "Element",
            "GlobalEventHandlers",
            "DocumentAndElementEventHandlers",
            "ElementContentEditable"
        ]
    },
    "HTMLEmbedElement": {
        "properties": {
            "align": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "name": true,
            "src": true,
            "type": true,
            "width": {
                "type": "String",
                "attrName": "width"
            },
            "hspace": true,
            "vspace": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLFieldSetElement": {
        "properties": {
            "dataFld": true,
            "disabled": true,
            "name": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLFontElement": {
        "properties": {
            "color": true,
            "face": true,
            "size": {
                "type": "String",
                "attrName": "size"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLFormElement": {
        "properties": {
            "acceptCharset": true,
            "action": true,
            "autocomplete": true,
            "encoding": true,
            "enctype": true,
            "method": true,
            "name": true,
            "noValidate": true,
            "target": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLFrameElement": {
        "properties": {
            "dataFld": true,
            "dataSrc": true,
            "frameBorder": true,
            "marginHeight": true,
            "marginWidth": true,
            "name": true,
            "noResize": true,
            "scrolling": true,
            "src": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLFrameSetElement": {
        "properties": {
            "cols": {
                "type": "String",
                "attrName": "cols"
            },
            "rows": {
                "type": "String",
                "attrName": "rows"
            }
        },
        "impls": [
            "HTMLElement",
            "WindowEventHandlers"
        ]
    },
    "HTMLHRElement": {
        "properties": {
            "align": true,
            "color": true,
            "noShade": true,
            "size": {
                "type": "String",
                "attrName": "size"
            },
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLHeadElement": {
        "properties": {
            "profile": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLHeadingElement": {
        "properties": {
            "align": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLHtmlElement": {
        "properties": {
            "manifest": true,
            "version": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLHyperlinkElementUtils": {
        "properties": {
            "hash": true,
            "host": true,
            "hostname": true,
            "href": true,
            "password": true,
            "pathname": true,
            "port": true,
            "protocol": true,
            "search": true,
            "username": true
        },
        "impls": []
    },
    "HTMLIFrameElement": {
        "properties": {
            "align": true,
            "allowFullscreen": true,
            "allowTransparency": true,
            "dataFld": true,
            "dataSrc": true,
            "frameBorder": true,
            "frameSpacing": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "marginHeight": true,
            "marginWidth": true,
            "name": true,
            "noreferrer": {
                "attrName": "noreferrer"
            },
            "referrerPolicy": {
                "attrName": "referrer-policy"
            },
            "sandbox": true,
            "scrolling": true,
            "src": true,
            "srcdoc": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLImageElement": {
        "properties": {
            "align": true,
            "alt": true,
            "border": true,
            "crossOrigin": true,
            "dataFld": true,
            "dataSrc": true,
            "height": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "height"
            },
            "hspace": true,
            "isMap": true,
            "lowsrc": true,
            "name": true,
            "noreferrer": {
                "attrName": "noreferrer"
            },
            "referrerPolicy": {
                "attrName": "referrer-policy"
            },
            "sizes": true,
            "src": true,
            "srcset": true,
            "useMap": true,
            "vspace": true,
            "width": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLInputElement": {
        "properties": {
            "accept": true,
            "align": true,
            "alt": true,
            "autocapitalize": {
                "attrName": "autocapitalize"
            },
            "autocomplete": true,
            "autocorrect": {
                "attrName": "autocorrect"
            },
            "autofocus": true,
            "capture": true,
            "checked": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "defaultChecked": true,
            "defaultValue": true,
            "dirName": true,
            "disabled": true,
            "formAction": true,
            "formEnctype": true,
            "formMethod": true,
            "formNoValidate": true,
            "formTarget": true,
            "height": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "height"
            },
            "incremental": {
                "attrName": "incremental"
            },
            "indeterminate": true,
            "inputMode": true,
            "max": {
                "type": "String",
                "attrName": "max"
            },
            "maxLength": true,
            "min": {
                "type": "String",
                "attrName": "min"
            },
            "minLength": true,
            "mozactionhint": {
                "attrName": "mozactionhint"
            },
            "multiple": true,
            "name": true,
            "pattern": true,
            "placeholder": true,
            "readOnly": true,
            "required": true,
            "results": {
                "attrName": "results"
            },
            "selectionDirection": true,
            "size": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "size"
            },
            "src": true,
            "step": true,
            "type": true,
            "useMap": true,
            "value": {
                "type": "String",
                "attrName": "value"
            },
            "valueAsDate": true,
            "webkitDirectory": {
                "attrName": "webkitdirectory"
            },
            "width": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "width"
            },
            "xMozErrorMessage": {
                "attrName": "x-moz-errormessage"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLKeygenElement": {
        "properties": {
            "autofocus": true,
            "challenge": true,
            "disabled": true,
            "keytype": true,
            "name": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLLIElement": {
        "properties": {
            "type": true,
            "value": {
                "type": "long",
                "isInteger": true,
                "isNumber": true,
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLLabelElement": {
        "properties": {
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "htmlFor": {
                "type": "String",
                "attrName": "for"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLLegendElement": {
        "properties": {
            "align": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLLinkElement": {
        "properties": {
            "charset": true,
            "crossOrigin": true,
            "href": true,
            "hreflang": true,
            "media": true,
            "noreferrer": {
                "attrName": "noreferrer"
            },
            "referrerPolicy": {
                "attrName": "referrer-policy"
            },
            "rel": true,
            "rev": true,
            "target": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMapElement": {
        "properties": {
            "name": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMarqueeElement": {
        "properties": {
            "behavior": true,
            "bgColor": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "direction": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "hspace": true,
            "loop": {
                "type": "long",
                "isInteger": true,
                "isNumber": true,
                "attrName": "loop"
            },
            "scrollAmount": true,
            "scrollDelay": true,
            "trueSpeed": true,
            "vspace": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMediaElement": {
        "properties": {
            "autoplay": true,
            "controls": true,
            "crossOrigin": true,
            "defaultMuted": true,
            "loop": {
                "type": "boolean",
                "isBoolean": true,
                "isProperty": true,
                "attrName": "loop"
            },
            "muted": true,
            "preload": true,
            "src": true,
            "srcObject": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMenuElement": {
        "properties": {
            "compact": true,
            "label": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMenuItemElement": {
        "properties": {
            "checked": true,
            "default": true,
            "disabled": true,
            "icon": true,
            "label": true,
            "radiogroup": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMetaElement": {
        "properties": {
            "content": true,
            "httpEquiv": true,
            "name": true,
            "scheme": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLMeterElement": {
        "properties": {
            "high": true,
            "low": true,
            "max": {
                "type": "double",
                "isNumber": true,
                "attrName": "max"
            },
            "min": {
                "type": "double",
                "isNumber": true,
                "attrName": "min"
            },
            "optimum": true,
            "value": {
                "type": "double",
                "isNumber": true,
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLModElement": {
        "properties": {
            "cite": true,
            "dateTime": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLOListElement": {
        "properties": {
            "compact": true,
            "reversed": true,
            "start": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLObjectElement": {
        "properties": {
            "align": true,
            "archive": true,
            "border": true,
            "classId": true,
            "code": true,
            "codeBase": true,
            "codeType": true,
            "data": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "declare": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "hspace": true,
            "name": true,
            "standby": true,
            "type": true,
            "typeMustMatch": true,
            "useMap": true,
            "vspace": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLOptGroupElement": {
        "properties": {
            "disabled": true,
            "label": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLOptionElement": {
        "properties": {
            "dataFormatas": true,
            "dataSrc": true,
            "defaultSelected": true,
            "disabled": true,
            "label": true,
            "selected": true,
            "value": {
                "type": "String",
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLOutputElement": {
        "properties": {
            "defaultValue": true,
            "htmlFor": {
                "type": "DOMTokenList",
                "attrName": "for"
            },
            "name": true,
            "value": {
                "type": "String",
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLParagraphElement": {
        "properties": {
            "align": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLParamElement": {
        "properties": {
            "dataFld": true,
            "name": true,
            "type": true,
            "value": {
                "type": "String",
                "attrName": "value"
            },
            "valueType": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLPictureElement": {
        "properties": {},
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLPreElement": {
        "properties": {
            "width": {
                "type": "long",
                "isInteger": true,
                "isNumber": true,
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLProgressElement": {
        "properties": {
            "max": {
                "type": "double",
                "isNumber": true,
                "attrName": "max"
            },
            "value": {
                "type": "double",
                "isNumber": true,
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLQuoteElement": {
        "properties": {
            "cite": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLScriptElement": {
        "properties": {
            "async": true,
            "charset": true,
            "crossOrigin": true,
            "defer": true,
            "event": true,
            "htmlFor": {
                "type": "String",
                "attrName": "for"
            },
            "language": true,
            "nonce": true,
            "src": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLSelectElement": {
        "properties": {
            "autocomplete": true,
            "autofocus": true,
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true,
            "disabled": true,
            "multiple": true,
            "name": true,
            "required": true,
            "size": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "size"
            },
            "value": {
                "type": "String",
                "attrName": "value"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLSourceElement": {
        "properties": {
            "media": true,
            "sizes": true,
            "src": true,
            "srcset": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLSpanElement": {
        "properties": {
            "dataFld": true,
            "dataFormatas": true,
            "dataSrc": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLStyleElement": {
        "properties": {
            "media": true,
            "nonce": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableCaptionElement": {
        "properties": {
            "align": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableCellElement": {
        "properties": {
            "align": true,
            "axis": true,
            "bgColor": true,
            "ch": true,
            "chOff": true,
            "colSpan": true,
            "height": {
                "type": "String",
                "attrName": "height"
            },
            "noWrap": true,
            "rowSpan": true,
            "vAlign": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableColElement": {
        "properties": {
            "align": true,
            "ch": true,
            "chOff": true,
            "span": true,
            "vAlign": true,
            "width": {
                "type": "String",
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableDataCellElement": {
        "properties": {
            "abbr": true,
            "axis": true,
            "noWrap": true,
            "background": true
        },
        "impls": [
            "HTMLTableCellElement"
        ]
    },
    "HTMLTableElement": {
        "properties": {
            "align": true,
            "bgColor": true,
            "border": true,
            "borderColor": true,
            "cellPadding": true,
            "cellSpacing": true,
            "dataFormatas": true,
            "dataPageSize": true,
            "dataSrc": true,
            "frame": true,
            "rules": true,
            "summary": true,
            "width": {
                "type": "String",
                "attrName": "width"
            },
            "background": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableHeaderCellElement": {
        "properties": {
            "abbr": true,
            "scope": true,
            "axis": true,
            "noWrap": true,
            "background": true
        },
        "impls": [
            "HTMLTableCellElement"
        ]
    },
    "HTMLTableRowElement": {
        "properties": {
            "align": true,
            "bgColor": true,
            "ch": true,
            "chOff": true,
            "vAlign": true,
            "background": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTableSectionElement": {
        "properties": {
            "align": true,
            "ch": true,
            "chOff": true,
            "vAlign": true,
            "background": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTemplateElement": {
        "properties": {},
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTextAreaElement": {
        "properties": {
            "autocomplete": true,
            "autofocus": true,
            "cols": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "cols"
            },
            "dataFld": true,
            "dataSrc": true,
            "defaultValue": true,
            "dirName": true,
            "disabled": true,
            "inputMode": true,
            "maxLength": true,
            "minLength": true,
            "name": true,
            "placeholder": true,
            "readOnly": true,
            "required": true,
            "rows": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "rows"
            },
            "selectionDirection": true,
            "value": {
                "type": "String",
                "attrName": "value"
            },
            "wrap": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTimeElement": {
        "properties": {
            "dateTime": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTitleElement": {
        "properties": {},
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLTrackElement": {
        "properties": {
            "default": true,
            "kind": true,
            "label": true,
            "src": true,
            "srclang": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLUListElement": {
        "properties": {
            "compact": true,
            "type": true
        },
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLUnknownElement": {
        "properties": {},
        "impls": [
            "HTMLElement"
        ]
    },
    "HTMLVideoElement": {
        "properties": {
            "height": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "height"
            },
            "poster": true,
            "width": {
                "type": "unsigned long",
                "isPositive": true,
                "isInteger": true,
                "isNumber": true,
                "attrName": "width"
            }
        },
        "impls": [
            "HTMLMediaElement"
        ]
    },
    "NonElementParentNode": {
        "properties": {},
        "impls": []
    },
    "WindowEventHandlers": {
        "properties": {},
        "impls": []
    }
};