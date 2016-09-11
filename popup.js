var cme = chrome.management,
    eul = $("#extList"),
    getI18N = chrome.i18n.getMessage,
    searchText = $("#searchExtn");

jQuery.fn.blindRightOut = function (duration, easing, complete) {
    return this.animate({
        marginLeft: this.outerWidth()
    }, jQuery.speed(duration, easing, complete));
};

chrome.management.getAll(function (extn) {
    var enabledExtnArray = [], disabledExtnArray = [], finalExts = [];
    for (var i = 0; i < extn.length; i++) {
        if (extn) {
            var e = extn[i];
            if (!e.isApp && e.id != chrome.i18n.getMessage("@@extension_id")) {
                if(e.enabled){
                    enabledExtnArray.push(e.name);
                } else {
                    disabledExtnArray.push(e.name);
                }
            }
        }
    }

    enabledExtnArray.sort();
    disabledExtnArray.sort();

    $.each(enabledExtnArray, function (i, n) {
        $.each(extn, function (j, e) {
            if (e.name === n) {
                finalExts.push((e));
            }
        });
    });

    $.each(disabledExtnArray, function (i, n) {
        $.each(extn, function (j, e) {
            if (e.name === n) {
                finalExts.push((e));
            }
        });
    });

    var totalExtensions = $(enabledExtnArray).size() + $(disabledExtnArray).size();

    $("#extNo").html("<b id='totalEnabledExtn'>En</b>: <span id='CountOfEnabledExtn'>" + $(enabledExtnArray).size() + "</span> | <b id='totalDisabledExtn'>Dis</b>: <span id='CountOfDisabledExtn'>" + $(disabledExtnArray).size()) + "</span>";
    $("#head1").append(" <span class='totalExtensions'>(" + totalExtensions + ")</span>")

    $.each(finalExts, function (k, ex) {
        eul.append(createList(ex, ex.enabled));
    });
});

$("body").on("click", ".enableDisableExtn", function(e) {
    var getExtnId = $(this).parents('li:first').attr('id');
    $(this).parents('li:first').animate({ marginLeft: "100%"} , 1000, function(){
        $(this).remove();
        $("#searchExtn").focus();
    });
    chrome.management.get(getExtnId, function(e) {
        if (!e.enabled) {
            chrome.management.setEnabled(getExtnId, true, function () {
                $("#CountOfEnabledExtn").text(parseInt($("#CountOfEnabledExtn").text())+1);
                $("#CountOfDisabledExtn").text(parseInt($("#CountOfDisabledExtn").text())-1);
                eul.prepend(createList(e, true));
            });
        } else {
            chrome.management.setEnabled(getExtnId, false, function () {
                $("#CountOfDisabledExtn").text(parseInt($("#CountOfDisabledExtn").text())+1);
                $("#CountOfEnabledExtn").text(parseInt($("#CountOfEnabledExtn").text())-1);
                eul.append(createList(e, false));
            });
        }
    });
});

$("body").on('click', '.removeThisExtn', function (e) {
    var getExtnId = $(this).parents('li:first').attr('id');
    cme.uninstall(getExtnId, {showConfirmDialog: true});
});

$('body').on('click', 'a.optionsUrlClass', function(){
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
});

cme.onUninstalled.addListener(function (id) {
    $("#" + id).animate({ marginLeft: "100%"} , 1000, function(){
        $(this).remove();
        $("#searchExtn").focus();
        $("#CountOfDisabledExtn").text(parseInt($("#CountOfDisabledExtn").text())-1);
        var totalExtensions = parseInt($("#CountOfDisabledExtn").text()) + parseInt($("#CountOfEnabledExtn").text());
        $("#head1").find(".totalExtensions").text("(" + totalExtensions + ")");
    });
});

searchText.on("keyup", function (e) {
    var keyword = $(this).val(),
        extLists = $("#extList").find("li");
    if (keyword.trim() == "") {
        extLists.show();
    } else {
        extLists.each(function () {
            console.log($(this).text());
            if ($(this).text().toLowerCase().indexOf(keyword.toLowerCase()) === -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    }
});

function createList(e, enabled) {
    var listHtml = "";
    var optionsUrl = "";
    if(e.optionsUrl) {
        optionsUrl = "<a title='Click to check options for this extension...' href='" + e.optionsUrl + "' target=_BLANK class='optionsUrlClass'><img src='options.png' width=16 height=16 /></a>";
    }

    if (!enabled) {
        listHtml = "<li class='ext' id='" + e.id + "' ><span class='spanForEnableDisableExtn' title='Click to enable this extension...'>" + optionsUrl + "<input type='checkbox' class='enableDisableExtn' />";
    } else { 
        listHtml = "<li class='ext' id='" + e.id + "' ><span class='spanForEnableDisableExtn' title='Click to disable this extension...'>" + optionsUrl + "<input type='checkbox' class='enableDisableExtn' checked=checked />";
    }

    listHtml += "<a class='removeThisExtn' title='Click to remove this extenion...'><img src='delete.png' width=16 height=16 /></a></span>";

    icons = "<img src= '" + chrome.extension.getURL("plugin.png") + "' style='width:16px; height:16px'></span>";
    if(e.icons) {
        icons = "<img src= '" + e.icons[0].url + "' style='width:16px; height:16px'></span>";
    }

    listHtml += "<span class='extName' data-id='" + e.id + "' title='" + getI18N("toggleEnable") + "'>" + icons + "<a href='"+e.homepageUrl+"'>" + e.name + "</a></span></li>";
        ""
    return listHtml;
}