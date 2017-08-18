(function(){var s="angularUtils.directives.dirPagination";var r="__default";angular.module(s,[]).directive("dirPaginate",["$compile","$parse","paginationService",p]).directive("dirPaginateNoCompile",o).directive("dirPaginationControls",["paginationService","paginationTemplate",t]).filter("itemsPerPage",["paginationService",l]).service("paginationService",n).provider("paginationTemplate",q).run(["$templateCache",m]);function p(c,g,b){return{terminal:true,multiElement:true,priority:100,compile:d};function d(F,G){var D=G.dirPaginate;var E=D.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);var J=/\|\s*itemsPerPage\s*:\s*(.*\(\s*\w*\)|([^\)]*?(?=\s+as\s+))|[^\)]*)/;if(E[2].match(J)===null){throw"pagination directive: the 'itemsPerPage' filter must be set."}var H=E[2].replace(J,"");var I=g(H);h(F);var j=G.paginationId||r;b.registerInstance(j);return function C(w,y,z){var A=g(z.paginationId)(w)||z.paginationId||r;b.registerInstance(A);var x=e(D,A);i(y,z,x);f(y);var u=c(y);var v=a(w,z,A);b.setCurrentPageParser(A,v,w);if(typeof z.totalItems!=="undefined"){b.setAsyncModeTrue(A);w.$watch(function(){return g(z.totalItems)(w)},function(B){if(0<=B){b.setCollectionLength(A,B)}})}else{b.setAsyncModeFalse(A);w.$watchCollection(function(){return I(w)},function(B){if(B){var L=(B instanceof Array)?B.length:Object.keys(B).length;b.setCollectionLength(A,L)}})}u(w)}}function e(j,z){var y,x=!!j.match(/(\|\s*itemsPerPage\s*:[^|]*:[^|]*)/);if(z!==r&&!x){y=j.replace(/(\|\s*itemsPerPage\s*:\s*[^|\s]*)/,"$1 : '"+z+"'")}else{y=j}return y}function i(w,x,j){if(w[0].hasAttribute("dir-paginate-start")||w[0].hasAttribute("data-dir-paginate-start")){x.$set("ngRepeatStart",j);w.eq(w.length-1).attr("ng-repeat-end",true)}else{x.$set("ngRepeat",j)}}function h(j){angular.forEach(j,function(v){if(v.nodeType===1){angular.element(v).attr("dir-paginate-no-compile",true)}})}function f(j){angular.forEach(j,function(v){if(v.nodeType===1){angular.element(v).removeAttr("dir-paginate-no-compile")}});j.eq(0).removeAttr("dir-paginate-start").removeAttr("dir-paginate").removeAttr("data-dir-paginate-start").removeAttr("data-dir-paginate");j.eq(j.length-1).removeAttr("dir-paginate-end").removeAttr("data-dir-paginate-end")}function a(z,A,B){var j;if(A.currentPage){j=g(A.currentPage)}else{var y=(B+"__currentPage").replace(/\W/g,"_");z[y]=1;j=g(y)}return j}}function o(){return{priority:5000,terminal:true}}function m(a){a.put("angularUtils.directives.dirPagination.template",'<ul class="pagination" ng-if="1 < pages.length || !autoHide"><li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == 1 }"><a href="" ng-click="setCurrent(1)">&laquo;</a></li><li ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }"><a href="" ng-click="setCurrent(pagination.current - 1)">&lsaquo;</a></li><li ng-repeat="pageNumber in pages track by tracker(pageNumber, $index)" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == \'...\' || ( ! autoHide && pages.length === 1 ) }"><a href="" ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a></li><li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }"><a href="" ng-click="setCurrent(pagination.current + 1)">&rsaquo;</a></li><li ng-if="boundaryLinks"  ng-class="{ disabled : pagination.current == pagination.last }"><a href="" ng-click="setCurrent(pagination.last)">&raquo;</a></li></ul>')}function t(d,b){var e=/^\d+$/;var h={restrict:"AE",scope:{maxSize:"=?",onPageChange:"&?",paginationId:"=?",autoHide:"=?"},link:g};var f=b.getString();if(f!==undefined){h.template=f}else{h.templateUrl=function(i,j){return j.templateUrl||b.getPath()}}return h;function g(j,H,E){var D=E.paginationId||r;var i=j.paginationId||E.paginationId||r;if(!d.isRegistered(i)&&!d.isRegistered(D)){var J=(i!==r)?" (id: "+i+") ":" ";if(window.console){console.warn("Pagination directive: the pagination controls"+J+"cannot be used without the corresponding pagination directive, which was not found at link time.")}}if(!j.maxSize){j.maxSize=9}j.autoHide=j.autoHide===undefined?true:j.autoHide;j.directionLinks=angular.isDefined(E.directionLinks)?j.$parent.$eval(E.directionLinks):true;j.boundaryLinks=angular.isDefined(E.boundaryLinks)?j.$parent.$eval(E.boundaryLinks):false;var K=Math.max(j.maxSize,5);j.pages=[];j.pagination={last:1,current:1};j.range={lower:1,upper:1,total:1};j.$watch("maxSize",function(u){if(u){K=Math.max(j.maxSize,5);L()}});j.$watch(function(){if(d.isRegistered(i)){return(d.getCollectionLength(i)+1)*d.getItemsPerPage(i)}},function(u){if(0<u){L()}});j.$watch(function(){if(d.isRegistered(i)){return(d.getItemsPerPage(i))}},function(u,v){if(u!=v&&typeof v!=="undefined"){F(j.pagination.current)}});j.$watch(function(){if(d.isRegistered(i)){return d.getCurrentPage(i)}},function(u,v){if(u!=v){F(u)}});j.setCurrent=function(u){if(d.isRegistered(i)&&I(u)){u=parseInt(u,10);d.setCurrentPage(i,u)}};j.tracker=function(u,v){return u+"_"+v};function F(v){if(d.isRegistered(i)&&I(v)){var u=j.pagination.current;j.pages=a(v,d.getCollectionLength(i),d.getItemsPerPage(i),K);j.pagination.current=v;G();if(j.onPageChange){j.onPageChange({newPageNumber:v,oldPageNumber:u})}}}function L(){if(d.isRegistered(i)){var u=parseInt(d.getCurrentPage(i))||1;j.pages=a(u,d.getCollectionLength(i),d.getItemsPerPage(i),K);j.pagination.current=u;j.pagination.last=j.pages[j.pages.length-1];if(j.pagination.last<j.pagination.current){j.setCurrent(j.pagination.last)}else{G()}}}function G(){if(d.isRegistered(i)){var v=d.getCurrentPage(i),w=d.getItemsPerPage(i),u=d.getCollectionLength(i);j.range.lower=(v-1)*w+1;j.range.upper=Math.min(v*w,u);j.range.total=u}}function I(u){return(e.test(u)&&(0<u&&u<=j.pagination.last))}}function a(G,O,N,M){var L=[];var F=Math.ceil(O/N);var P=Math.ceil(M/2);var H;if(G<=P){H="start"}else{if(F-P<G){H="end"}else{H="middle"}}var i=M<F;var I=1;while(I<=F&&I<=M){var j=c(I,G,M,F);var J=(I===2&&(H==="middle"||H==="end"));var K=(I===M-1&&(H==="middle"||H==="start"));if(i&&(J||K)){L.push("...")}else{L.push(j)}I++}return L}function c(y,x,i,j){var z=Math.ceil(i/2);if(y===i){return j}else{if(y===1){return y}else{if(i<j){if(j-z<x){return j-i+y}else{if(z<x){return x-z+y}else{return y}}}else{return y}}}}}function l(a){return function(e,g,b){if(typeof(b)==="undefined"){b=r}if(!a.isRegistered(b)){throw"pagination directive: the itemsPerPage id argument (id: "+b+") does not match a registered pagination-id."}var c;var d;if(angular.isObject(e)){g=parseInt(g)||9999999999;if(a.isAsyncMode(b)){d=0}else{d=(a.getCurrentPage(b)-1)*g}c=d+g;a.setItemsPerPage(b,g);if(e instanceof Array){return e.slice(d,c)}else{var f={};angular.forEach(k(e).slice(d,c),function(h){f[h]=e[h]});return f}}else{return e}}}function k(b){if(!Object.keys){var a=[];for(var c in b){if(b.hasOwnProperty(c)){a.push(c)}}return a}else{return Object.keys(b)}}function n(){var b={};var a;this.registerInstance=function(c){if(typeof b[c]==="undefined"){b[c]={asyncMode:false};a=c}};this.deregisterInstance=function(c){delete b[c]};this.isRegistered=function(c){return(typeof b[c]!=="undefined")};this.getLastInstanceId=function(){return a};this.setCurrentPageParser=function(e,d,c){b[e].currentPageParser=d;b[e].context=c};this.setCurrentPage=function(c,d){b[c].currentPageParser.assign(b[c].context,d)};this.getCurrentPage=function(c){var d=b[c].currentPageParser;return d?d(b[c].context):1};this.setItemsPerPage=function(c,d){b[c].itemsPerPage=d};this.getItemsPerPage=function(c){return b[c].itemsPerPage};this.setCollectionLength=function(c,d){b[c].collectionLength=d};this.getCollectionLength=function(c){return b[c].collectionLength};this.setAsyncModeTrue=function(c){b[c].asyncMode=true};this.setAsyncModeFalse=function(c){b[c].asyncMode=false};this.isAsyncMode=function(c){return b[c].asyncMode}}function q(){var b="angularUtils.directives.dirPagination.template";var a;this.setPath=function(c){b=c};this.setString=function(c){a=c};this.$get=function(){return{getPath:function(){return b},getString:function(){return a}}}}})();