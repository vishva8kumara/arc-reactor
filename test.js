var test = require('tape');

global.document = {
	querySelectorAll: function(selector){
		if (selector == 'form.autopilot')
			return [];//[arc.elem('form')];
		if (selector == 'nav a[href^=\\#], ul.tabs a[href^=\\#]')
			return [];//[arc.elem('a'), arc.elem('a')];
		else
			return [];
	},
	location: {
		hash: ''
	},
	body: {
		scrollTop: 0,
		scrollLeft: 0
	},
	cookie: 'csrftoken=9s7f6hg9s0d9gh; _ga=FD7HFGH9DF78G0',
	addEventListener: function(evt, callback){
	}
};
global.window = {
	addEventListener: function(evt, callback){
	},
	onpopstate: function(){
	},
	event: {}
};
global.console = {
	log: function(str){
	}
};
global.navigator = {
	appName: 'testKit'
};
global.HTMLElement = {
	prototype: {}
};

var arc = require('./arc.js', {});

for (method in arc){
	console.log(method);
	console.log(arc[method]);
}
