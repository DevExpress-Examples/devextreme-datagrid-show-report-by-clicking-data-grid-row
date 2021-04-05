/*!
* DevExtreme (dx.aspnet.mvc.js)
* Version: 20.2.4
* Build date: Tue Dec 01 2020
*
* Copyright (c) 2012 - 2020 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
! function(factory) {
    if ("function" === typeof define && define.amd) {
        define(function(require, exports, module) {
            module.exports = factory(require("jquery"), require("./core/templates/template_engine_registry").setTemplateEngine, require("./core/templates/template_base").renderedCallbacks, require("./core/guid"), require("./ui/validation_engine"), require("./core/utils/iterator"), require("./core/utils/dom").extractTemplateMarkup, require("./core/utils/string").encodeHtml, require("./core/utils/ajax"), require("./core/utils/console"))
        })
    } else {
        DevExpress.aspnet = factory(window.jQuery, DevExpress.setTemplateEngine, DevExpress.templateRendered, DevExpress.data.Guid, DevExpress.validationEngine, DevExpress.utils.iterator, DevExpress.utils.dom.extractTemplateMarkup, DevExpress.utils.string.encodeHtml, DevExpress.utils.ajax, DevExpress.utils.console)
    }
}(function($, setTemplateEngine, templateRendered, Guid, validationEngine, iteratorUtils, extractTemplateMarkup, encodeHtml, ajax, console) {
    var templateCompiler = createTemplateCompiler();
    var pendingCreateComponentRoutines = [];
    var enableAlternativeTemplateTags = true;
    var warnBug17028 = false;

    function createTemplateCompiler() {
        var OPEN_TAG = "<%",
            CLOSE_TAG = "%>",
            ENCODE_QUALIFIER = "-",
            INTERPOLATE_QUALIFIER = "=";
        var EXTENDED_OPEN_TAG = /[<[]%/g,
            EXTENDED_CLOSE_TAG = /%[>\]]/g;

        function acceptText(bag, text) {
            if (text) {
                bag.push("_.push(", JSON.stringify(text), ");")
            }
        }

        function acceptCode(bag, code) {
            var encode = code.charAt(0) === ENCODE_QUALIFIER,
                value = code.substr(1),
                interpolate = code.charAt(0) === INTERPOLATE_QUALIFIER;
            if (encode || interpolate) {
                bag.push("_.push(");
                bag.push(encode ? "arguments[1](" + value + ")" : value);
                bag.push(");")
            } else {
                bag.push(code + "\n")
            }
        }
        return function(text) {
            var bag = ["var _ = [];", "with(obj||{}) {"],
                chunks = text.split(enableAlternativeTemplateTags ? EXTENDED_OPEN_TAG : OPEN_TAG);
            if (warnBug17028 && chunks.length > 1) {
                if (text.indexOf(OPEN_TAG) > -1) {
                    console.logger.warn("Please use an alternative template syntax: https://community.devexpress.com/blogs/aspnet/archive/2020/01/29/asp-net-core-new-syntax-to-fix-razor-issue.aspx");
                    warnBug17028 = false
                }
            }
            acceptText(bag, chunks.shift());
            for (var i = 0; i < chunks.length; i++) {
                var tmp = chunks[i].split(enableAlternativeTemplateTags ? EXTENDED_CLOSE_TAG : CLOSE_TAG);
                if (2 !== tmp.length) {
                    throw "Template syntax error"
                }
                acceptCode(bag, tmp[0]);
                acceptText(bag, tmp[1])
            }
            bag.push("}", "return _.join('')");
            return new Function("obj", bag.join(""))
        }
    }

    function createTemplateEngine() {
        return {
            compile: function(element) {
                return templateCompiler(extractTemplateMarkup(element))
            },
            render: function(template, data) {
                var html = template(data, encodeHtml);
                var dxMvcExtensionsObj = window.MVCx;
                if (dxMvcExtensionsObj && !dxMvcExtensionsObj.isDXScriptInitializedOnLoad) {
                    html = html.replace(/(<script[^>]+)id="dxss_.+?"/g, "$1")
                }
                return html
            }
        }
    }

    function getValidationSummary(validationGroup) {
        var result;
        $(".dx-validationsummary").each(function(_, element) {
            var summary = $(element).data("dxValidationSummary");
            if (summary && summary.option("validationGroup") === validationGroup) {
                result = summary;
                return false
            }
        });
        return result
    }

    function createValidationSummaryItemsFromValidators(validators, editorNames) {
        var items = [];
        iteratorUtils.each(validators, function(_, validator) {
            var widget = validator.$element().data("dx-validation-target");
            if (widget && $.inArray(widget.option("name"), editorNames) > -1) {
                items.push({
                    text: widget.option("validationError.message"),
                    validator: validator
                })
            }
        });
        return items
    }

    function createComponent(name, options, id, validatorOptions) {
        var selector = "#" + String(id).replace(/[^\w-]/g, "\\$&");
        pendingCreateComponentRoutines.push(function() {
            var $element = $(selector);
            if ($element.length) {
                var $component = $(selector)[name](options);
                if ($.isPlainObject(validatorOptions)) {
                    $component.dxValidator(validatorOptions)
                }
                return true
            }
            return false
        })
    }
    templateRendered.add(function() {
        var snapshot = pendingCreateComponentRoutines.slice();
        var leftover = [];
        pendingCreateComponentRoutines = [];
        snapshot.forEach(function(func) {
            if (!func()) {
                leftover.push(func)
            }
        });
        pendingCreateComponentRoutines = pendingCreateComponentRoutines.concat(leftover)
    });
    return {
        createComponent: createComponent,
        renderComponent: function(name, options, id, validatorOptions) {
            id = id || "dx-" + new Guid;
            createComponent(name, options, id, validatorOptions);
            return '<div id="' + id + '"></div>'
        },
        getEditorValue: function(inputName) {
            var $widget = $("input[name='" + inputName + "']").closest(".dx-widget");
            if ($widget.length) {
                var dxComponents = $widget.data("dxComponents"),
                    widget = $widget.data(dxComponents[0]);
                if (widget) {
                    return widget.option("value")
                }
            }
        },
        setTemplateEngine: function() {
            if (setTemplateEngine) {
                setTemplateEngine(createTemplateEngine())
            }
        },
        enableAlternativeTemplateTags: function(value) {
            enableAlternativeTemplateTags = value
        },
        warnBug17028: function() {
            warnBug17028 = true
        },
        createValidationSummaryItems: function(validationGroup, editorNames) {
            var groupConfig, items, summary = getValidationSummary(validationGroup);
            if (summary) {
                groupConfig = validationEngine.getGroupConfig(validationGroup);
                if (groupConfig) {
                    items = createValidationSummaryItemsFromValidators(groupConfig.validators, editorNames);
                    items.length && summary.option("items", items)
                }
            }
        },
        sendValidationRequest: function(propertyName, propertyValue, url, method) {
            var d = $.Deferred();
            var data = {};
            data[propertyName] = propertyValue;
            ajax.sendRequest({
                url: url,
                dataType: "json",
                method: method || "GET",
                data: data
            }).then(function(response) {
                if ("string" === typeof response) {
                    d.resolve({
                        isValid: false,
                        message: response
                    })
                } else {
                    d.resolve(response)
                }
            }, function(xhr) {
                d.reject({
                    isValid: false,
                    message: xhr.responseText
                })
            });
            return d.promise()
        }
    }
});

// Version: 2.7.1
// https://github.com/DevExpress/DevExtreme.AspNet.Data
// Copyright (c) Developer Express Inc.

/* global DevExpress:false, jQuery:false */

(function(factory) {
    "use strict";

    if(typeof define === "function" && define.amd) {
        define(function(require, exports, module) {
            module.exports = factory(
                require("devextreme/core/utils/ajax"),
                require("jquery").Deferred,
                require("jquery").extend,
                require("devextreme/data/custom_store"),
                require("devextreme/data/utils")
            );
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(
            require("devextreme/core/utils/ajax"),
            require("jquery").Deferred,
            require("jquery").extend,
            require("devextreme/data/custom_store"),
            require("devextreme/data/utils")
        );
    } else {
        DevExpress.data.AspNet = factory(
            DevExpress.utils.ajax || { sendRequest: jQuery.ajax },
            jQuery.Deferred,
            jQuery.extend,
            DevExpress.data.CustomStore,
            DevExpress.data.utils
        );
    }

})(function(ajaxUtility, Deferred, extend, CustomStore, dataUtils) {
    "use strict";

    var CUSTOM_STORE_OPTIONS = [
        "onLoading", "onLoaded",
        "onInserting", "onInserted",
        "onUpdating", "onUpdated",
        "onRemoving", "onRemoved",
        "onModifying", "onModified",
        "onPush",
        "loadMode", "cacheRawData",
        "errorHandler"
    ];

    function createStoreConfig(options) {
        var keyExpr = options.key,
            loadUrl = options.loadUrl,
            loadMethod = options.loadMethod || "GET",
            loadParams = options.loadParams,
            isRawLoadMode = options.loadMode === "raw",
            updateUrl = options.updateUrl,
            insertUrl = options.insertUrl,
            deleteUrl = options.deleteUrl,
            onBeforeSend = options.onBeforeSend,
            onAjaxError = options.onAjaxError;

        function send(operation, requiresKey, ajaxSettings, customSuccessHandler) {
            var d = Deferred(),
                thenable,
                beforeSendResult;

            function sendCore() {
                ajaxUtility.sendRequest(ajaxSettings).then(
                    function(res, textStatus, xhr) {
                        if(customSuccessHandler)
                            customSuccessHandler(d, res, xhr);
                        else
                            d.resolve();
                    },
                    function(xhr, textStatus) {
                        var error = getErrorMessageFromXhr(xhr);

                        if(onAjaxError) {
                            var e = { xhr: xhr, error: error };
                            onAjaxError(e);
                            error = e.error;
                        }

                        if(error)
                            d.reject(error);
                        else
                            d.reject(xhr, textStatus);
                    }
                );
            }

            if(requiresKey && !keyExpr) {
                d.reject(new Error("Primary key is not specified (operation: '" + operation + "', url: '" + ajaxSettings.url + "')"));
            } else {
                if(operation === "load") {
                    ajaxSettings.cache = false;
                    ajaxSettings.dataType = "json";
                } else {
                    ajaxSettings.dataType = "text";
                }

                if(onBeforeSend) {
                    beforeSendResult = onBeforeSend(operation, ajaxSettings);
                    if(beforeSendResult && typeof beforeSendResult.then === "function")
                        thenable = beforeSendResult;
                }

                if(thenable)
                    thenable.then(sendCore, function(error) { d.reject(error); });
                else
                    sendCore();
            }

            return d.promise();
        }

        function filterByKey(keyValue) {
            if(!Array.isArray(keyExpr))
                return [keyExpr, keyValue];

            return keyExpr.map(function(i) {
                return [i, keyValue[i]];
            });
        }

        function loadOptionsToActionParams(options, isCountQuery) {
            var result = {};

            if(isCountQuery)
                result.isCountQuery = isCountQuery;

            if(options) {

                ["skip", "take", "requireTotalCount", "requireGroupCount"].forEach(function(i) {
                    if(options[i] !== undefined)
                        result[i] = options[i];
                });

                var normalizeSorting = dataUtils.normalizeSortingInfo,
                    group = options.group,
                    filter = options.filter,
                    select = options.select;

                if(options.sort)
                    result.sort = JSON.stringify(normalizeSorting(options.sort));

                if(group) {
                    if(!isAdvancedGrouping(group))
                        group = normalizeSorting(group);
                    result.group = JSON.stringify(group);
                }

                if(Array.isArray(filter)) {
                    filter = extend(true, [], filter);
                    stringifyDatesInFilter(filter);
                    result.filter = JSON.stringify(filter);
                }

                if(options.totalSummary)
                    result.totalSummary = JSON.stringify(options.totalSummary);

                if(options.groupSummary)
                    result.groupSummary = JSON.stringify(options.groupSummary);

                if(select) {
                    if(!Array.isArray(select))
                        select = [ select ];
                    result.select = JSON.stringify(select);
                }
            }

            extend(result, loadParams);

            return result;
        }

        function handleInsertUpdateSuccess(d, res, xhr) {
            var mime = xhr.getResponseHeader("Content-Type"),
                isJSON = mime && mime.indexOf("application/json") > -1;
            d.resolve(isJSON ? JSON.parse(res) : res);
        }

        var result = {
            key: keyExpr,
            useDefaultSearch: true,

            load: function(loadOptions) {
                return send(
                    "load",
                    false,
                    {
                        url: loadUrl,
                        method: loadMethod,
                        data: loadOptionsToActionParams(loadOptions)
                    },
                    function(d, res) {
                        processLoadResponse(d, res, function(res) {
                            return [ res.data, createLoadExtra(res) ];
                        });
                    }
                );
            },

            totalCount: !isRawLoadMode && function(loadOptions) {
                return send(
                    "load",
                    false,
                    {
                        url: loadUrl,
                        method: loadMethod,
                        data: loadOptionsToActionParams(loadOptions, true)
                    },
                    function(d, res) {
                        processLoadResponse(d, res, function(res) {
                            return [ res.totalCount ];
                        });
                    }
                );
            },

            byKey: !isRawLoadMode && function(key) {
                return send(
                    "load",
                    true,
                    {
                        url: loadUrl,
                        method: loadMethod,
                        data: loadOptionsToActionParams({ filter: filterByKey(key) })
                    },
                    function(d, res) {
                        processLoadResponse(d, res, function(res) {
                            return [ res.data[0] ];
                        });
                    }
                );
            },

            update: updateUrl && function(key, values) {
                return send(
                    "update",
                    true,
                    {
                        url: updateUrl,
                        method: options.updateMethod || "PUT",
                        data: {
                            key: serializeKey(key),
                            values: JSON.stringify(values)
                        }
                    },
                    handleInsertUpdateSuccess
                );
            },

            insert: insertUrl && function(values) {
                return send(
                    "insert",
                    true,
                    {
                        url: insertUrl,
                        method: options.insertMethod || "POST",
                        data: { values: JSON.stringify(values) }
                    },
                    handleInsertUpdateSuccess
                );
            },

            remove: deleteUrl && function(key) {
                return send("delete", true, {
                    url: deleteUrl,
                    method: options.deleteMethod || "DELETE",
                    data: { key: serializeKey(key) }
                });
            }

        };

        CUSTOM_STORE_OPTIONS.forEach(function(name) {
            var value = options[name];
            if(value !== undefined)
                result[name] = value;
        });

        return result;
    }

    function processLoadResponse(d, res, getResolveArgs) {
        res = expandLoadResponse(res);

        if(!res || typeof res !== "object")
            d.reject(new Error("Unexpected response received"));
        else
            d.resolve.apply(d, getResolveArgs(res));
    }

    function expandLoadResponse(value) {
        if(Array.isArray(value))
            return { data: value };

        if(typeof value === "number")
            return { totalCount: value };

        return value;
    }

    function createLoadExtra(res) {
        return {
            totalCount: "totalCount" in res ? res.totalCount : -1,
            groupCount: "groupCount" in res ? res.groupCount : -1,
            summary: res.summary || null
        };
    }

    function serializeKey(key) {
        if(typeof key === "object")
            return JSON.stringify(key);

        return key;
    }

    function serializeDate(date) {

        function zpad(text, len) {
            text = String(text);
            while(text.length < len)
                text = "0" + text;
            return text;
        }

        var builder = [1 + date.getMonth(), "/", date.getDate(), "/", date.getFullYear()],
            h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds(),
            f = date.getMilliseconds();

        if(h + m + s + f > 0)
            builder.push(" ", zpad(h, 2), ":", zpad(m, 2), ":", zpad(s, 2), ".", zpad(f, 3));

        return builder.join("");
    }

    function stringifyDatesInFilter(crit) {
        crit.forEach(function(v, k) {
            if(Array.isArray(v)) {
                stringifyDatesInFilter(v);
            } else if(Object.prototype.toString.call(v) === "[object Date]") {
                crit[k] = serializeDate(v);
            }
        });
    }

    function isAdvancedGrouping(expr) {
        if(!Array.isArray(expr))
            return false;

        for(var i = 0; i < expr.length; i++) {
            if("groupInterval" in expr[i] || "isExpanded" in expr[i])
                return true;
        }

        return false;
    }

    function getErrorMessageFromXhr(xhr) {
        var mime = xhr.getResponseHeader("Content-Type"),
            responseText = xhr.responseText;

        if(!mime)
            return null;

        if(mime.indexOf("text/plain") === 0)
            return responseText;

        if(mime.indexOf("application/json") === 0) {
            var jsonObj = safeParseJSON(responseText);

            if(typeof jsonObj === "string")
                return jsonObj;

            if(typeof jsonObj === "object") {
                for(var key in jsonObj) {
                    if(typeof jsonObj[key] === "string")
                        return jsonObj[key];
                }
            }

            return responseText;
        }

        return null;
    }

    function safeParseJSON(json) {
        try {
            return JSON.parse(json);
        } catch(x) {
            return null;
        }
    }

    return {
        createStore: function(options) {
            return new CustomStore(createStoreConfig(options));
        }
    };
});
