﻿var ii = {
    apiUrl: "api/",
    error: function (text) {
        noty({text: text, type: 'error', layout: 'topCenter', timeout: 3000});
    },
    navigateToSearch: function(query) {
//        var needReload = location.hash.indexOf("#?") != 0;
        setHash("?"+query.replaceAll(" ", "+"));
//        if (needReload) location.reload();
    },
    navigateToUri: function(uri) {
        if (uri.indexOf("ии:пункт:") == 0) {
//            var needReload = !isItemNumber(location.hash.replace("#", ""));//.indexOf("#item:") != 0;
            setHash(uri.replace("ии:пункт:", ""));
//            if (needReload) location.reload();
        }
        if (uri.indexOf("ии:термин:") == 0) {
//            var needReload = isItemNumber(location.hash.replace("#", "")) || location.hash.indexOf("#?") == 0;//location.hash.indexOf("#term:") != 0;
            setHash(uri.replace("ии:термин:", "").replaceAll(" ", "+"));
//            if (needReload) location.reload();
        }
        if (uri.indexOf("статья:") == 0) {
//            var needReload = location.hash.indexOf("#a/") != 0;
            setHash("a/"+uri.replace("статья:", ""));
//            if (needReload) location.reload();
        }
		if (uri.indexOf("песня:") == 0) {
//            var needReload = location.hash.indexOf("#s/") != 0;
            setHash("s/"+uri.replace("песня:", ""));
//            if (needReload) location.reload();
        }
        if (uri.indexOf("http") == 0) {
            window.open(uri,'_blank');
        }
    },
    getLabel: function(d) {
        var uri = d.uri;
        if (uri.indexOf("ии:пункт:") == 0) {
            return uri.replace("ии:пункт:", "");
        }
        if (uri.indexOf("ии:термин:") == 0) {
            return uri.replace("ии:термин:", "");
        }
        if (uri.indexOf("статья:") == 0) {
            return "Статья «"+d.name+"»";
        }
		if (uri.indexOf("песня:") == 0) {
            return "Песня «"+d.name+"»";
        }
        if (uri.indexOf("http") == 0) {
            var parser = document.createElement('a');
            parser.href = uri;
            return parser.hostname;
        }
    }
};

function setHash(newHash) {
    var sharpIdx = window.location.href.indexOf("#");
    if (sharpIdx === -1) {
        window.location.href = window.location.href + "#" + newHash;
    } else {
        window.location.href = window.location.href.substr(0, sharpIdx) + "#" + newHash;
    }
    if (ga) {
        ga('send', 'event', 'navigation', newHash);
    }
}

$(document).ajaxStart(function() {
    if (NProgress) NProgress.start();
});
$(document).ajaxStop(function() {
    if (NProgress) NProgress.done();
});
$.ajaxSetup({
    error: function (e, status, error) {
        if (e.status == 400) {
            ii.error("Ошибка запроса, указаны не все данные");
        }
        else if (e.status == 404) {
            ii.error("URL not found: "+this.url);
        }
        else {
            error = e.responseText.indexOf("<") == 0
                ? e.responseText
                : JSON.parse(e.responseText);
            if (error && error.error) {
                if (error.error.code != "UNDEFINED") {
                    ii.error(sf.labels.getLabel(error.error.code))
                } else {
                    ii.error(error.error.message)
                }
            } else {
                ii.error(e.responseText)
            }
        }
    }
});

function isItemNumber(s) {
    return s.match("\\d+\\.\\d+");
}

String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
};

var router = new kendo.Router();

router.route("item::item", itemRoute);
function itemRoute(item) {
    switchTo("item", function() {
        ii.item.load(item);
    });
}
function switchTo(id, callback){
    var container = $("#"+id+"-container");
    if (!container.length) {
        savePrevContent();
        container = $("<div id=\""+id+"-container\"></div>");
        container.hide();
        $("body").append(container);
        ensure({ html: id+".html", js: "js/"+id+".js", parent: id+"-container"}, function () {
            $("#content").append(container);
            container.show();
            callback();
        });
    } else {
        if (!container.is(":visible")) {
            savePrevContent();
        }
        $("#content").append(container);
        container.show();
        callback();
    }
}
function savePrevContent(){
    var prevContent = $("#content").children();
    $("body").append(prevContent);
    $("#content").empty();
    prevContent.hide();
}
router.route("term::term", termRoute);
function termRoute(term) {
    term = term.replaceAll("+", " ");
    switchTo("term", function() {
        ii.term.load(term);
    });
}
router.route("search::query", searchRoute);
router.route("?:query", searchRoute);
function searchRoute(query) {
    query = query.replaceAll("+", " ");
    switchTo("search", function() {
        ii.search.load(query);
    });
}
router.route("main", function() {
    location.reload();
});
router.route("a/:id", function(id) {
    switchTo("article", function() {
        ii.article.load(id);
    });
});
router.route("s/:id", function(id) {
    switchTo("song", function() {
        ii.song.load(id);
    });
});
router.route("about", function() {
    ensure({ html: "about.html", parent: "content"});
});
router.route("main_panel", function() {
    ensure({ html: "main_panel.html", parent: "content"});
});
router.route(":hash", function(hash) {
    if (isItemNumber(hash)) {
        itemRoute(hash)
    } else {
        termRoute(hash)
    }
});

$(document).ready(function() {
	function showHide(element_id) {
		if (document.getElementById(element_id)) { 
			var obj = document.getElementById(element_id); 
			if (obj.style.display != "block") { 
				obj.style.display = "block"; 
			}
			else obj.style.display = "none";
		}
	} 
		
    router.start();

//    router.navigate("item\:1.0778");

    /*$.history.on('load change push', function(event, hash, type) {
        if (hash.indexOf("edit/")==0) {
            loadAdmin(hash.replace("edit/", ""));
            return
        }
        switch (hash) {
            case "play":
                loadGame();
                break;
            case "admin":
                loadAdmin(0);
                break;
            case "admin-goals":
                loadAdminGoals();
                break;
            default:
                loadGame();
                break;
        }
    }).listen('hash');*/
});