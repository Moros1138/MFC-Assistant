/*
	This file's sole purpose for existing is so webpack can batch
	all of the vue components and expose them to the browser
*/

window.morosObjectConformSettings = function(obj) {
	
	if(obj === undefined)
		return;
	
	// convert underscored keys to camelCased keys
	for(var key in obj) {
		if( key.match(/_([a-z])/g) != null) {
			obj[key.replace(/_([a-z])/g,function (g) { return g[1].toUpperCase(); })] = obj[key];			
			delete obj[key];
		}
	}
	
	// force integers on number strings
	for(var key in obj) {
		if( /^-?[\d.]+(?:e-?\d+)?$/.test(obj[key]) ) {
			
			if(!isNaN(parseInt(obj[key]))) {
				obj[key] = parseInt(obj[key])
			} else {
				obj[key] = ''
			}
			
		}
	}
	
	return obj;
	
}

window.NumberInput = require("./form/NumberInput.vue")
window.TextInput = require("./form/TextInput.vue")
window.YesNoInput = require("./form/YesNoInput.vue")

window.Chat = require("./Chat.vue")
window.Home = require("./Home.vue")
window.Messages = require("./Messages.vue")
window.NotReady = require("./NotReady.vue")
window.Options = require("./Options.vue")
window.TipWar = require("./TipWar.vue")
window.TokenKeno = require("./TokenKeno.vue")
window.App = require("./App.vue")
