
/*
* Arc Reactor JavaScript library/framework
* https://github.com/vishva8kumara/arc-reactor
* Vishva Kumara N P - vishva8kumara@gmail.com
* Distributed Under MIT License
* See index.html for the demonstration;
* 	refer to the embedded JS there for documentation.
*
* Font-Awsome and Roboto Font is redistributed with this under
* their respective licenses, and not covered under this MIT license.
*
*/

var arc = new (function arcReactor(root){

	var arc = this;
	var arrayIgnore = ['min', 'max', 'sum', 'avg', 'each'];


	// ------------------------------------------------------------------------------------
	//	Navigation handler / wrapper for SPA
	// ------------------------------------------------------------------------------------

	this.navigationActiveStack = [];
	var backButtonStack = [];
	var navigationTable = {};

	//	Create a nav frame
	this.nav = function(hash, obj, callback, kcabllac){
		//*if (!(obj instanceof dom)) obj = new dom(obj);*/ //*if (typeof callback == 'undefined')throw '';else */
		if (callback.constructor.name == 'arcRequire')
			navigationTable[hash] = [obj, callback.onload, callback.onunload];
		//
		else
			navigationTable[hash] = [obj, callback, kcabllac];
		//
		if (typeof obj == 'undefined' || obj == null)
			console.error('Expected [object HTMLElement]: parameter 2 for arc.nav()');
			//throw 'Expected [object HTMLElement]: parameter 2 for arc.nav()';
		else
			obj.style.display = 'none';
			//obj.hide();
	};


	// ------------------------------------------------------------------------------------
	//	DYNAMIC SCRIPT AND TEMPLATE LOADER
	// ------------------------------------------------------------------------------------

	var loaderTemplates = {}, loaderScripts = {};
	this.require = function(script, template, cacheTimer){//this.loader = 
		//
		return new (function arcRequire(){
			var mod = false, tLoaded = false, _self = this;
			//
			this.preload = setTimeout(function(){
				new arc.ajax(template, {
					method: GET,
					callback: function(data){
						loaderTemplates[template] = data.responseText;
					}
				});
				new arc.ajax(script, {
					method: GET,
					callback: function(data){}
				});
				/*var scr = arc.elem('script', null, {'type': 'text/javascript', 'src': script});
				scr.onload = function(){
					loaderScripts[script] = module.exports;
					module = {'exports': {}};
				};
				document.head.appendChild(scr);*/
			}, 1800);
			//
			//	Onload Handler - Function to-be called on navigating into activity
			this.onload = function(context, params, e, loadedCallback){
				tLoaded = false;
				clearTimeout(_self.preload);
				//	Dispatch callbacks - bind template to script
				var exec = function(code){
					if (typeof code != 'undefined'){
						mod = code;
						/*//	Emulate in a VM
						try{
							module = new (eval('//ArcVM ['+script+']\ntry{'+code+'}catch(e){module.exports = e}'))(context, params, e);
						}
						catch(e){
							//	Error on console if any found
							console.error(e.toString()+'\n\t'+script+e.stack.split('\n')[1].split('<anonymous>')[1]);//.split(':')[1]
						}*/
					}
					//	Ready to go ?
					if (tLoaded && !!mod){
						if (typeof mod == 'object' && typeof mod.onload == 'function'){
							if (mod.onload.length == 4)
								mod.onload(context, params, e, loadedCallback);
							else{
								mod.onload(context, params, e);
								loadedCallback();
							}
							//module = false;
						}
						else{
							if (typeof loadedCallback == 'function')
								loadedCallback();
							console.error('No onload method in :'+script);
						}
					}
				};
				//
				//	Load Script
				if (typeof loaderScripts[script] != 'undefined'){//console.log('Script from cache');
					exec(loaderScripts[script]);
				}
				else{
					/*new arc.ajax(script, {
						method: GET,// cache: cacheTimer,
						callback: function(data){//console.log('Script from ajax');
							exec(data.responseText);
							loaderScripts[script] = data.responseText;
						}
					});*/
					var scr = arc.elem('script', null, {'type': 'text/javascript', 'src': script});
					scr.onload = function(){
						loaderScripts[script] = module.exports;
						module = {'exports': {}};
						exec(loaderScripts[script]);
					};
					document.head.appendChild(scr);
				}
				//
				//	Load Template
				if (typeof loaderTemplates[template] != 'undefined'){
					context.innerHTML = loaderTemplates[template];
					tLoaded = true;
					exec();
				}
				else{
					context.innerHTML = '';
					new arc.ajax(template, {
						method: GET,// cache: cacheTimer,
						callback: function(data){
							context.innerHTML = data.responseText;
							tLoaded = true;
							exec();
							loaderTemplates[template] = data.responseText;
						}
					});
				}
			};
			//
			//	OnUnload Handler
			this.onunload = function(context, params, e){
				if (tLoaded && !!mod){//
					if (typeof mod == 'object' && typeof mod.onunload == 'function')
						mod.onunload(context, params, e);
					//
					else
						console.warn('No onunload method in :'+script);
				}
				//
				else
					console.error('onunload called before onload :'+script);
			};
			//
			//loadTemplate(context, 'sign-in', function(){});
		});
	};

	window.onpopstate = function(event){
		/*/	Set classname for the parent of active anchor
		let anchors = root.querySelectorAll('nav a[href^=\\#], ul.tabs a[href^=\\#]');
		for (let i = 0; i < anchors.length; i++)
			if (document.location.hash.substring(1).startsWith(anchors[i].href.split('#')[1]))
				anchors[i].parentNode.addClass('active');
			else
				anchors[i].parentNode.removeClass('active');*/
		//
		//	Process difference of states
		let tmpStack = [];
		let onLoadCallCandidates = [];
		hash = document.location.hash.replace('#', '').split('/');
		for (let i = 0; i < hash.length; i++){
			let path = hash.slice(0, i+1).join('/');
			if (typeof navigationTable[path] != 'undefined'){
				tmpStack.push(navigationTable[path].concat([hash.slice(i+1).join('/')]));
				//	List candidate onload functions - we are calling only the last
				if (typeof navigationTable[path][1] == 'function' && (!existInActiveStack(navigationTable[path][0], hash.slice(i+1).join('/')) || (typeof event != 'undefined' && typeof event.forcePop != 'undefined')))
					onLoadCallCandidates.push([navigationTable[path], hash.slice(i+1)]);
			}
		}
		if (onLoadCallCandidates.length == 0)
			return false;
		//
		//let waitLoading = false;
		let waitRenderCallback = function(){
			//arc.waitRenderCallback = function(){};
			//	Show frames to be active
			arc.navigationActiveStack = [];
			for (let i = 0; i < tmpStack.length; i++){
				tmpStack[i][0].style.display = 'block';
				new function(obj){
					setTimeout(function(){obj.addClass('active');}, 10);
				}(tmpStack[i][0]);
				arc.navigationActiveStack.push(tmpStack[i]);
			}
		};
		//
		//	Hide frames to be inactive
		for (let i = 0; i < arc.navigationActiveStack.length; i++)
			if (!existInStack(tmpStack, arc.navigationActiveStack[i])){
				//	Call onUnload function
				if (typeof arc.navigationActiveStack[i][2] == 'function')
					arc.navigationActiveStack[i][2](arc.navigationActiveStack[i][0], event);
				arc.navigationActiveStack[i][0].removeClass('active');
				new function(obj){
					setTimeout(function(){obj.style.display = 'none';}, 250);
					//setTimeout(function(){obj.style.display = 'none';}, 750);
				}(arc.navigationActiveStack[i][0]);
			}
		//
		//	Call onload function
		onLoadCallCandidates = onLoadCallCandidates[onLoadCallCandidates.length - 1];
		if (onLoadCallCandidates[0][1].length == 4){
			onLoadCallCandidates[0][1](onLoadCallCandidates[0][0], onLoadCallCandidates[1], event, function(){});//arc.waitRenderCallback);
			//waitLoading = true;
		}
		else{
			onLoadCallCandidates[0][1](onLoadCallCandidates[0][0], onLoadCallCandidates[1], event);
		}
		//
		//	Send pageview to Google Analytics
		if (typeof ga == 'function')
			ga('send', 'pageview', document.location.pathname+document.location.hash);
		//
		//	Display frames right-away
		//if (!waitLoading){
		waitRenderCallback();
		//}
		//
		document.body.scrollLeft = 0;
		document.body.scrollTop = 0;
		backButtonStack = [];
		/*if (navigator.vibrate)
			navigator.vibrate(25);*/
	};

	window.addEventListener('keyup',
		function(e){
			let evt = e || window.event;
			if (evt.keyCode == 27){
				if (backButtonStack.length == 0)
					history.back();
				else
					backButtonStack.pop()();
			}
		});

	window.addEventListener('backbutton',
		function(){
			if (backButtonStack.length == 0)
				history.back();
			else
				backButtonStack.pop()();
		}, false);

	var existInActiveStack = function(dom, params){
		for (let i = 0; i < arc.navigationActiveStack.length; i++)
			if (arc.navigationActiveStack[i][0] == dom && arc.navigationActiveStack[i][3] == params)
				return true;
		return false;
	};

	var existInStack = function(tmpStack, obj){
		for (let i = 0; i < tmpStack.length; i++)
			if (tmpStack[i][0] == obj[0])
				return true;
		return false;
	};

	this.enqBackBtnStack = function(callback){
		backButtonStack.push(callback);
	}


	// ------------------------------------------------------------------------------------
	//	Make Ajax requests
	// ------------------------------------------------------------------------------------

	var ajaxCache = {};
	this.ajax = function(url, options, ref){
		//	Ensure this function is always called as a dynamic instance
		if (this == arc)
			return new arc.ajax(url, options, ref);
		//
		var _this = this;
		this.method = 'GET';
		this.data = null;
		this.callback = function(data){console.log(data);};
		this.failback = function(data){console.log(data);};
		this.headers = {};
		this.evalScripts = false;
		this.doCache = false;
		this.async = true;
		this.timeout = -1;
		//	Option aliasing
		let opts = {'method': 'method', 'type': 'method', 'data': 'data', 'form': 'data', 'callback': 'callback', 'success': 'callback',
				'failback': 'failback', 'fallback': 'failback','error': 'failback', 'progress': 'progress', 'onprogress': 'progress',
				'async': 'async', 'asynchronous': 'async', 'timeout': 'timeout', 'ontimeout': 'ontimeout', 'url': 'url', 'uri': 'url',
				'headers': 'headers', 'evalScripts': 'evalScripts', 'eval': 'evalScripts', 'doCache': 'doCache', 'cache': 'doCache'};
		if (typeof url == 'object' && (typeof url['url'] != 'undefined' || typeof url['uri'] != 'undefined')){
			ref = options;
			options = url;
			url = options['url'] || options['uri'];
		}
		//	Process option aliases
		for (let key in options)
			if (typeof opts[key] != 'undefined')
				this[opts[key]] = options[key];
			else
				console.log('Ajax: Unrecognized option \''+key+'\' with value: '+options[key]);
		//
		this.abort = function(){
			_this.failback = function(a, b){};
			_this.xmlhttp.abort();
		}
		//	Deliver the result to callback
		this.deliverResult = function(data){
			if (typeof _this.callback == 'function'){
				try{
					if (data.getResponseHeader('content-type') == 'application/json')
						data.data = JSON.parse(data.responseText);
				}catch(e){}
				_this.callback(data, ref);
			}
			else if (typeof _this.callback == 'object' && _this.callback.toString().indexOf("Element") > -1)
				_this.callback.innerHTML = data.responseText;
			else{
				let elem = document.getElementById(_this.callback);
				if (typeof elem == 'object' && elem.toString().indexOf("Element") > -1)
					elem.innerHTML = data.responseText;
				else
					console.log('Ajax: Callback \''+_this.callback+'\' is neither function, nor object or an ID of an object.');
			}
			//	DEPRECATED - LEGACY SUPPORT OF SAMEORIGIN INLINE JS
			/*if (typeof _this.evalScripts != 'undefined'){
				let P0 = data.responseText.indexOf('<script');
				while (P0 > -1){
					P0 = data.responseText.indexOf('>', P0) + 1;
					let P1 = data.responseText.indexOf('</script', P0);
					if (typeof _this.evalScripts != 'function')
						_this.evalScripts(data.responseText.substring(P0, P1));
					else
						try{
							eval(data.responseText.substring(P0, P1));
						}
						catch (e){
							console.log(e);
						}
					P0 = data.responseText.indexOf('<script', P1);
				}
			}*/
		}
		//
		if (this.doCache === true && typeof localStorage[url] != 'undefined'){
			_this.deliverResult({responseText: localStorage[url], response: localStorage[url], responseURL: url, status: 200, statusText: 'From Cache'});
			return true;
		}
		else if (isNumber(this.doCache) && typeof ajaxCache[url] != 'undefined'){
			_this.deliverResult({responseText: ajaxCache[url], response: ajaxCache[url], responseURL: url, status: 200, statusText: 'From Cache'});
			return true;
		}
		else if (this.doCache == false)
			localStorage.removeItem(url);
		//
		if (window.XMLHttpRequest)
			this.xmlhttp = new XMLHttpRequest();
		else if (window.ActiveXObject)
			this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		//
		this.xmlhttp.open(_this.method.toUpperCase(), url, _this.async);
		this.xmlhttp.onreadystatechange = function (){
			if (this.readyState == 4){
				if (this.status == 200){
					_this.deliverResult(this);
					if (_this.doCache === true)
						localStorage[url] = this.responseText;
					else if (isNumber(_this.doCache)){
						ajaxCache[url] = this.responseText;
						new (function(url){
							setTimeout(function(){
								delete ajaxCache[url];
							}, _this.doCache * 1000);
						})(url);
					}
				}
				else if (typeof _this.failback == 'function')
					_this.failback(this, ref);
			}
		};
		if (typeof _this.progress == 'function')
			this.xmlhttp.onprogress = function(data){
				_this.progress(100 * data.loaded / data.total)
			};
		if (typeof _this.ontimeout == 'function' && _this.timeout != -1){
			this.xmlhttp.ontimeout = _this.ontimeout;
			this.xmlhttp.timeout = _this.timeout;
		}
		//
		if (typeof _this.headers != 'undefined')
			for (let key in _this.headers)
				this.xmlhttp.setRequestHeader(key, _this.headers[key]);
		if (csrftoken != false)
			this.xmlhttp.setRequestHeader("X-CSRFToken", csrftoken);
		//
		if (_this.method.toUpperCase() == "POST"){
			let params = '';
			if (_this.data == null){}
			else if (_this.data.toString().indexOf("Form") > -1 && (typeof _this.data.tagName != 'undefined' && _this.data.tagName == "FORM")){
				for (let i = 0; i < _this.data.elements.length; i++)
					if (_this.data.elements[i].name != ''){
						if (_this.data.elements[i].type == "checkbox")
							params += _this.data.elements[i].checked ? (params == '' ? '' : '&') + _this.data.elements[i].name + '=on' : '';
						else if (_this.data.elements[i].type == "radio")
							params += _this.data.elements[i].checked ? (params == '' ? '' : '&') + _this.data.elements[i].name + '=' + encodeURIComponent(_this.data.elements[i].value) : '';
						else
							params += (params == '' ? '' : '&') + _this.data.elements[i].name + '=' + encodeURIComponent(_this.data.elements[i].value);
					}
				this.xmlhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			}
			else if (_this.data.constructor.name == 'FormData'){
				//this.xmlhttp.setRequestHeader("content-type", "application/x-www-form-urlencoded");
				params = _this.data;
			}
			else if (typeof _this.data == 'object'){
				params = JSON.stringify(_this.data);
				this.xmlhttp.setRequestHeader("content-type", "application/json");
			}
			else
				params = _this.data;
			//
			this.xmlhttp.send(params);
		}
		else
			this.xmlhttp.send(null);
	};
	var cookies = document.cookie.split(';');
	var csrftoken = false;
	for (var i = 0; i < cookies.length; i++){
		var cookie = cookies[i].trim().split('=');
		if (cookie[0] == 'csrftoken')
			csrftoken = cookie[1];
	}

	// ------------------------------------------------------------------------------------
	//	DOM GEN And Template Engine
	// ------------------------------------------------------------------------------------

	//	Create a Dom Element of given type, innerHTML and options
	this.elem = function(tagname, innerHTML, options){
		let obj = document.createElement(tagname);
		if (typeof innerHTML !== 'undefined' && innerHTML != null && innerHTML != false)
			obj.innerHTML = innerHTML;
		if (typeof options !== 'undefined')
			for (let key in options){
				if (typeof options[key] == 'function')
					obj[key] = options[key];
				else
					obj.setAttribute(key, options[key]);
			}
		return obj;
	};

	//	Read DOM tree and generate JSON
	this.read = function(dom, index){
		let obj = {};
		if (typeof dom == 'string')
			dom = arc.elem('div', dom).childNodes[0];
		if (typeof index == 'undefined')
			var index = {};
		for (let i = 0; i < dom.attributes.length; i++){
			obj[dom.attributes[i].name] = dom.attributes[i].value;
			if (dom.attributes[i].value.substring(0, 2) == '{{' && dom.attributes[i].value.substr(-2) == '}}')
				index[dom.attributes[i].value.replace('{{', '').replace('}}', '')] = [obj, dom.attributes[i].name];
		}
		if (dom.children.length == 0){
			obj.content = dom.innerHTML;
			if (dom.innerHTML.substring(0, 2) == '{{' && dom.innerHTML.substr(-2) == '}}')
				index[dom.innerHTML.replace('{{', '').replace('}}', '')] = [obj, 'content'];
		}
		else if (dom.children.length == 1){
			let res = arc.read(dom.children[0], index);
			obj.content = res[0];
		}
		else{
			obj.content = [];
			for (let i = 0; i < dom.children.length; i++){
				let res = arc.read(dom.children[i], index);
				obj.content.push(res[0]);
			}
		}
		let output = {};
		output[dom.tagName.toLowerCase()] = obj;
		return [output, index];
	};

	//	Generate DOM tree from JSON
	this.react = function(data, schema){
		//var arrayIgnore = ['min', 'max', 'sum', 'avg'];
		for (let key in schema[1])
			if (arrayIgnore.indexOf(key) == -1)
				schema[1][key][0][schema[1][key][1]] = data[key];
		return arc.tree(schema[0]);//Object.assign({}, schema)
	};

	//	Generate a DOM tree from a JavaScript object or JSON Schema/Object
	//	This is depricated - Use react instead - which is more efficient.
	this.reactor = function(data){
		let obj;
		for (let tagname in data){
			obj = document.createElement(tagname);
			for (let key in data[tagname]){
				let value = data[tagname][key]
				if (key == 'content'){
					if (typeof value == 'string' || typeof value == 'number')
						obj.innerHTML = value;
					else if (Array.isArray(value))
						for (let i = 0; i < value.length; i++)
							obj.appendChild(arc.reactor(value[i]));			//	Recursion point
					else if (value instanceof HTMLElement)
						obj.appendChild(value);
					else if (typeof value == 'object')
						obj.appendChild(arc.reactor(value));				//	Recursion point
				}
				else if (key.substring(0, 2) == 'on')
					obj[key] = value;				//	Event handler - Sugesstion: Check if a function instead
				else
					obj.setAttribute(key, value);
			}
		}
		return obj;
	};

	//	Generate DOM tree from JSON
	this.tree = function(data){
		let obj;
		for (let tagname in data){
			obj = document.createElement(tagname);
			for (let key in data[tagname]){
				let value = data[tagname][key]
				if (key == 'content'){
					if (typeof value == 'string' || typeof value == 'number')
						obj.innerHTML = value;
					else if (typeof value == 'object')
						if (typeof value.length == 'undefined')
							obj.appendChild(arc.tree(value));
						else
							for (let i = 0; i < value.length; i++)
								obj.appendChild(arc.tree(value[i]));
				}
				else if (typeof value == 'function' /*key.substring(0, 2) == 'on'*/)
					obj[key] = value;
				else
					obj.setAttribute(key, value);
			}
		}
		return obj;
	};

	//	Generate HTML Table from JSON data and a JSON schema
	this.tbl = function(data, schema){
		let table = elem('table', false, {class: 'table-striped', width: '100%'});
		let tr = table.appendChild(elem('tr', false, {'data-id': 'head'}));
		for (let i = 0; i < schema.length; i++){
			if (typeof schema[i].type != 'undefined'){
				if (schema[i].type == 'numeric')
					tr.appendChild(elem('th', schema[i].title, {align: 'right'}));
				else
					tr.appendChild(elem('th', schema[i].title));
			}
			else
				tr.appendChild(elem('th', schema[i].title));
		}
		let tmp;
		for (let i = 0; i < data.length; i++){
			tr = table.appendChild(elem('tr', false, {'data-id': (data[i].id != undefined ? data[i].id : '')}));
			for (let j = 0; j < schema.length; j++){
				tmp = data[i][schema[j].name];
				if (schema[j]['enum'] != undefined && typeof schema[j]['enum'][tmp] != 'undefined')
					tmp = schema[j]['enum'][tmp];
				if (typeof schema[j].type != 'undefined'){
					if (schema[j].type == 'numeric')
						tr.appendChild(elem('td', tmp+'&nbsp;', {align: 'right'}));
					else
						tr.appendChild(elem('td', tmp+'&nbsp;'));
				}
				else
					tr.appendChild(elem('td', tmp+'&nbsp;'));
			}
		}
		return table;
	};


	// ------------------------------------------------------------------------------------
	//	FORM CONTROL
	// ------------------------------------------------------------------------------------

	this.numericInputHandler = function(input){
		let maxlength = input.getAttribute('maxlength') == undefined ? -1 : input.getAttribute('maxlength')*1;
		input.onkeydown = function(e){
			e = e || window.event;
			let keyCode = e.keyCode || e.which;
			let charCode = e.charCode || e.keyCode;
			let shiftCode = e.shiftKey || false;
			//
			if (keyCode == 9 || keyCode == 13 || keyCode == 109 || keyCode == 110 || keyCode == 189 || keyCode == 190 || (keyCode > 36 && keyCode < 41))
				return true;
			//
			if ((charCode == 32 || charCode == 8 || charCode == 46))// && shiftCode == false
				return true;	//	Allow backspace / delete
			if (maxlength > -1 && this.value.toString().length >= maxlength)
				return false;	//	Deny
			if (((charCode > 47 && charCode < 58) || (charCode > 95 && charCode < 106)) && shiftCode == false)
				return true;	//	Allow numbers
			else
				return false;	//	Deny
		}
		input.onfocus = function(){
			setTimeout(function(){input.select();}, 10);
		};
		input.onkeyup = input.onchange = function(e){
			if (maxlength > -1)
				this.value = this.value.replace(/[^0-9]/g, '').substring(0, maxlength);
		}
	};

	this.alphaInputHandler = function(input){
		input.onkeydown = function(e){0
			e = e || window.event;
			let keyCode = e.keyCode || e.which;
			//
			if (keyCode == 9 || keyCode == 13 || (keyCode > 36 && keyCode < 41))
				return true;
			//
			e = e || window.event;
			let charCode = e.charCode || e.keyCode;
			if (charCode == 32 || charCode == 8 || charCode == 46)
				return true;	//	Allow backspace / delete / space
			if (charCode < 65 || charCode > 90)
				return false;	//	Deny anything not a latin character
		}
		input.onchange = function(e){
			this.value = this.value.replace(/[^A-Z a-z]/g, '');
		}
	};

	this.alphaNumericInputHandler = function(input){
		input.onkeydown = function(e){
			e = e || window.event;
			let keyCode = e.keyCode || e.which;
			let charCode = e.charCode || e.keyCode;
			let shiftCode = e.shiftKey || false;
			//
			if (((charCode > 47 && charCode < 58) || (charCode > 95 && charCode < 106)) && shiftCode == false)
				return true;	//	Allow numbers
			//
			if (keyCode == 9 || keyCode == 13 || keyCode == 109 || keyCode == 110 || keyCode == 189 || keyCode == 190 || (keyCode > 36 && keyCode < 41))
				return true;
			//
			if (charCode == 32 || charCode == 8 || charCode == 46)
				return true;	//	Allow backspace / delete / space
			//if (charCode < 65 || charCode > 90)
			return false;	//	Deny anything not an alphanumeric character
		}
		input.onchange = function(e){
			this.value = this.value.replace(/[^A-Z a-z 0-9]/g, '');
		}
	};

	this.currencyInputHandler = function(input){
		let maxlength = input.getAttribute('maxlength') == undefined ? -1 : input.getAttribute('maxlength')*1;
		input.onkeydown = function(e){
			e = e || window.event;
			let keyCode = e.keyCode || e.which;
			let charCode = e.charCode || e.keyCode;
			let shiftCode = e.shiftKey || false;
			//
			if (keyCode == 9 || keyCode == 13 || (keyCode > 36 && keyCode < 41))
				return true;
			//
			if ((charCode == 32 || charCode == 8 || charCode == 46 || charCode == 110 || charCode == 188 || charCode == 189 || charCode == 190))
				return true;	//	Allow backspace, delete, comma and decimal
			if (maxlength > -1 && this.value.toString().length >= maxlength)
				return false;	//	Deny
			if (((charCode > 47 && charCode < 58) || (charCode > 95 && charCode < 106)) && shiftCode == false)
				return true;	//	Allow numbers
			else
				return false;	//	Deny
		}
		/*input.onkeyup = function(){
			if (isNumeric(this.value.replace(/,/g, '')))
				this.style.color = '';
			else
				this.style.color = 'red';
		};*/
		input.onchange = function(){
			this.value = (1*this.value.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			//this.style.color = '';
		};
		input.value = (1*input.value.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		input.onfocus = function(){
			setTimeout(function(){input.select();}, 10);
		};
	};

	this.dateInputHandler = function(input){
		input.onchange = function(){
			this.style.color = '';
		};
	};

	this.textareaHandler = function(messageText){
		messageText.style.overflow = 'auto';
		let messageTextHeight = messageText.scrollHeight;
		messageText.style.overflow = 'hidden';
		messageText.style.maxWidth = '100%';
		messageText.style.width = '100%';
		messageText.onkeyup = function(event){
			let bkpOffsetHeight = this.offsetHeight;
			messageText.style.overflow = 'auto';
			this.style.height = '33px';
			if (messageTextHeight != this.scrollHeight){
				let bkpScrollHeight = this.scrollHeight;
				this.style.height = messageTextHeight + 'px';
				this.scrollTop = 0;
				//
				setTimeout(
					function(){
						this.scrollTop = 0;
						messageText.style.transition = 'height 0.25s';
						messageText.style.webkitTransition = 'height 0.25s';
						messageText.style.mozTransition = 'height 0.25s';
						messageText.style.height = messageTextHeight + 'px';
					}, 5);
				//
				messageTextHeight = bkpScrollHeight;
				//
				setTimeout(
					function(){
						messageText.style.transition = '';
						messageText.style.webkitTransition = '';
						messageText.style.mozTransition = '';
					}, 500);
				//
				messageText.style.overflow = 'hidden';
			}
			else{
				this.style.height = this.scrollHeight + 'px';
				messageText.style.overflow = 'hidden';
			}
			if (typeof event != 'undefined'){
				event.stopPropagation();
				event.preventDefault();
			}
		}
		messageText.onkeyup();
		messageText.onkeypress = function(){
			messageText.scrollTop = 0;
			setTimeout(function(){
						messageText.scrollTop = 0;
					}, 1);
			setTimeout(function(){
						messageText.scrollTop = 0;
					}, 5);
		}
	};

	this.maskedInputHandler = function(input, mask){
		this.input_box = input;
		this.input_mask = mask;
		var _self = this;
		//
		let output = mask.replace(/9/g, '_').replace(/A/g, '_');
		let originalLength = output.length;
		//
		input.onkeydown = function(e){
			e = e || event;
			let target = e.target || e.srcElement;
			if ((e.keyCode > 36 && e.keyCode < 41) || e.keyCode == 9 || e.keyCode == 13)
				return true;
			else if (e.keyCode == 46){
				e.cancelBubble = true;
				return false;
			}
			else if (e.keyCode == 8){
				let selStart;
				let totLen = target.value.length;
				if (document.selection){
					let oSel = document.selection.createRange();
					oSel.moveStart ('character', -originalLength);
					selStart = oSel.text.length;
				}
				else
					selStart = target.selectionStart;
				//
				if (selStart == 0)
					return false;
				//
				if (target.value.substring(selStart-1, selStart) != '_' && isNumber(target.value.substring(selStart-1, selStart)))
					target.value = target.value.substring(0, selStart-1) + '_' + target.value.substring(selStart, totLen);
				try{
					target.setSelectionRange(selStart-1, selStart-1);
				}catch(e){	//	IE 8 support (fir IE testing)
					let range = target.createTextRange();
					range.collapse(true);
					range.moveStart('character', selStart+1);
					range.moveEnd('character', 0);
					range.select();
				}
				//
				e.cancelBubble = true;
				return false;
			}
		}
		//
		input.onkeypress = function(e){
			e = e || event;
			let target = e.target || e.srcElement
			let ch = String.fromCharCode(e.charCode || e.keyCode);
			if ((e.keyCode > 36 && e.keyCode < 41) || e.keyCode == 9 || e.keyCode == 13)
				return true;
			else if (!isNumber(ch) || ch == '\t'){
				e.cancelBubble = true;
				return false;
			}
			let output = _self.input_mask.replace(/9/g, '_').replace(/A/g, '_');
			let totLen = target.value.length;
			//
			let selStart;
			if (document.selection){
				let oSel = document.selection.createRange();
				oSel.moveStart ('character', -originalLength);
				selStart = oSel.text.length;
			}
			else
				selStart = target.selectionStart;
			//
			if (totLen == selStart){
				e.cancelBubble = true;
				return false;
			}
			//
			while (selStart < totLen && (target.value.substring(selStart, selStart+1) != '_' && !isNumber(target.value.substring(selStart, selStart+1))))
				selStart += 1;
			target.value = target.value.substring(0, selStart) + ch + target.value.substring(selStart+1, totLen);
			try{
				target.setSelectionRange(selStart+1, selStart+1);
			}
			catch(e){	//	IE 8 support (for IE testing)
				let range = target.createTextRange();
				range.collapse(true);
				range.moveStart('character', selStart+1);
				range.moveEnd('character', 0);
				range.select();
			}
			//
			e.cancelBubble = true;
			return false;
		}
		//
		input.onmouseup = input.onfocus = function(e){
			if (this.value == '')
				this.value = output;
			if (this.value == output)	//	Do not put 'else' on this line
				try{
					this.setSelectionRange(0, 0);
				}
				catch(e){	//	IE 8 support (for IE testing)
					let range = this.createTextRange();
					range.collapse(true);
					range.moveStart('character', 0);
					range.moveEnd('character', 0);
					range.select();
				}
		}
		//
		input.onblur = function(e){
			if (this.value == output)
				this.value = '';
		}
	};

	var forms = root.querySelectorAll('form.autopilot');
	this.autopilotForm = function(form){
		//form.onsubmit = validate;
		let type, mask;
		for (let i = 0; i < form.elements.length; i++){
			type = form.elements[i].getAttribute('data-validate');
			mask = form.elements[i].getAttribute('data-mask');
			if (type != null){
				if (type == 'alpha'){
					new arc.alphaInputHandler(form.elements[i]);
				}
				else if (type == 'numeric'){
					new arc.numericInputHandler(form.elements[i]);
				}
				else if (type == 'alphanumeric'){
					new arc.alphaNumericInputHandler(form.elements[i]);
				}
				else if (type == 'currency'){
					new arc.currencyInputHandler(form.elements[i]);
				}
				else if (type == 'date'){
					new arc.dateInputHandler(form.elements[i]);
				}
			}
			else if (mask != null){
				new arc.maskedInputHandler(form.elements[i], mask);
			}
			if (form.elements[i].tagName == 'TEXTAREA')
				new arc.textareaHandler(form.elements[i]);
		}
	};
	for (let j = 0; j < forms.length; j++)
		new autopilotForm(forms[j]);


	/*/ ------------------------------------------------------------------------------------
	//	DYNAMIC SCRIPT AND TEMPLATE LOADER ! DEPRICATED
	// ------------------------------------------------------------------------------------

	var loaderTemplates = {}, loaderScripts = {};
	this.loader = function(script, template){
		//	Function to-be called on navigating into activity
		return function(context, params, e, callback){
			//	Load Script
			let module = false, tLoaded = false;
			let exec = function(code){
				if (typeof code != 'undefined')
					module = code;
				if (tLoaded){
					//	Emulate in a VM
					try{
						module = eval('try{'+module+'}catch(e){module.exports = e}');
						//console.log(module);
					}
					catch(e){
						console.error(e.toString()+'\n\t'+script);//e.name+': '+e.message
					}
					//
					//	Dispatch callbacks - bind template to script
					if (typeof module == 'function'){
						if (module.length == 4)
							module(context, params, e, callback);
						else{
							module(context, params, e);
							callback();
						}
					}
					else{
						callback();
						//console.error(module);
					}
				}
			}
			if (typeof loaderScripts[script] != 'undefined'){
				exec(loaderScripts[script]);
			}
			else
				new arc.ajax(script, {
					method: GET, //async: false, cache: 360,
					callback: function(data){
						exec(data.responseText);
						loaderScripts[script] = data.responseText;
					}
				});
			//
			//	Load Template
			if (typeof loaderTemplates[template] != 'undefined'){
				context.innerHTML = loaderTemplates[template];
				tLoaded = true;
				exec();
			}
			else
				new arc.ajax(template, {
					method: GET, //async: false, cache: 360,
					callback: function(data){
						/*nav.className = '';
						setTimeout(function(){
							nav.style.zIndex = 1;
						}, 100);* /
						context.innerHTML = data.responseText;
						tLoaded = true;
						exec();
						loaderTemplates[template] = data.responseText;
					}
				});
			//
			//loadTemplate(context, 'sign-in', function(){});
		};
	};*/


	// ------------------------------------------------------------------------------------
	//	SLIDE AND TABS
	// ------------------------------------------------------------------------------------

	this.tabSet = function(dom){
		var _self = this;
		this.currentTab = 0;
		this.prevTab = 0;
		this.startx = 0;
		this.starty = 0;
		this.delta = 0;
		this.deltay = 0;
		this.tabHeads = dom.querySelectorAll('.tabHeads .tab-head');
		this.tabBody = dom.querySelectorAll('.tabBodies')[0];
		this.tabBodies = dom.querySelectorAll('.tabBodies .tab-body');
		this.tabHeads[0].className += ' current';
		this.tabBodies[0].className += ' current';
		for (let i = 0; i < this.tabHeads.length; i++)
			new tabHeadClick(this.tabHeads[i], i, this.tabBodies[i]);
		//
		function tabHeadClick(tabHead, index, tabBody){
			tabHead.onclick = function(){
				_self.tabHeads[_self.currentTab].className = _self.tabHeads[_self.currentTab].className.replace(' current', '');
				_self.tabBodies[_self.currentTab].className = _self.tabBodies[_self.currentTab].className.replace(' current', '');
				//
				if (_self.currentTab == index){
					_self.tabBodies[index].className += ' animLeft';
					_self.tabBodies[_self.prevTab].style.left = '0px';
					setTimeout(
						function(){
							_self.tabBodies[index].className = _self.tabBodies[index].className.replace(' animLeft', '');
						}, 600);
				}
				else if (_self.currentTab < index){
					_self.tabBodies[index].style.left = '48%';
				}
				else{
					_self.tabBodies[index].style.left = '-48%';
				}
				//
				_self.prevTab = _self.currentTab;
				_self.currentTab = index;
				_self.tabHeads[index].className += ' current';
				_self.tabBodies[index].className += ' current';
				//
				_self.tabBodies[_self.prevTab].style.opacity = 0;
				setTimeout(
					function(){
						_self.tabBodies[index].className += ' animLeft';
						_self.tabBodies[_self.currentTab].style.left = '0px';
						_self.tabBodies[index].style.opacity = 1;
					}, 50);
				setTimeout(
					function(){
						_self.tabBodies[index].className = _self.tabBodies[index].className.replace(' animLeft', '');
						_self.tabBodies[index].className = _self.tabBodies[index].className.replace(' animLeft', '');
					}, 600);
			}
		}
		//
		this.tabBody.addEventListener('touchstart', function(e){
			let touchobj = e.changedTouches[0];
			_self.startx = parseInt(touchobj.clientX);
			_self.starty = parseInt(touchobj.clientY);
		}, false);
		//
		this.tabBody.addEventListener('touchmove', function(e){
			let touchobj = e.changedTouches[0];
			_self.delta = parseInt(touchobj.clientX) - _self.startx;
			_self.deltay = parseInt(touchobj.clientY) - _self.starty;
			if (Math.abs(_self.deltay / _self.delta) < 2){
				_self.tabBodies[_self.currentTab].style.left = _self.delta + 'px';
				e.preventDefault();
			}
			else
				_self.tabBodies[_self.currentTab].style.left = '0px';
		}, false);
		//
		this.tabBody.addEventListener('touchend', function(e){
			let currentTab = _self.currentTab;
			if (Math.abs(_self.deltay / _self.delta) < 2){
				if (_self.delta > 30){
					currentTab -= 1;
				}
				else if (_self.delta < -30){
					currentTab += 1;
				}
				else{
					_self.tabBodies[_self.currentTab].className += ' animLeft';
					_self.tabBodies[_self.currentTab].style.left = '0px';
					setTimeout(
						function(){
							_self.tabBodies[_self.currentTab].className = _self.tabBodies[_self.currentTab].className.replace(' animLeft', '');
						}, 600);
					return false;
				}
				//
				if (currentTab > _self.tabHeads.length-1)
					currentTab = _self.tabHeads.length-1;
				if (currentTab < 0)
					currentTab = 0;
				//
				_self.tabHeads[currentTab].onclick();
				document.body.scrollTop = 0;
				//
				_self.delta = 0;
				e.preventDefault();
			}
		}, false);
	};


	// ------------------------------------------------------------------------------------
	//	TOUCH SLIDER
	// ------------------------------------------------------------------------------------

	this.slides = function(dom){
		var n = parseInt(dom.offsetWidth / window.innerWidth);
		var _self = this;
		this.startx = false;
		this.delta = 0;
		this.eleLeft = -99;
		//
		dom.addEventListener('mousedown', function(e){
			_self.startx = 100 * e.clientX / window.innerWidth;
			e.preventDefault();
		}, false);
		dom.addEventListener('touchstart', function(e){
			_self.startx = 100 * e.changedTouches[0].clientX / window.innerWidth;
			dom.removeClass('sliding');
			e.preventDefault();
		}, false);
		//
		dom.addEventListener('mousemove', function(e){
			if (_self.startx === false || e.buttons != 1)
				return false;
			//
			_self.delta = (100 * e.clientX / window.innerWidth) - _self.startx;
			dom.style.left = (_self.eleLeft + _self.delta) + '%';
			e.preventDefault();
		}, false);
		dom.addEventListener('touchmove', function(e){
			_self.delta = (100 * e.changedTouches[0].clientX / window.innerWidth) - _self.startx;
			dom.style.left = (_self.eleLeft + _self.delta) + '%';
			e.preventDefault();
		}, false);
		//
		dom.onmouseup = dom.onmouseout = function(e){
			_self.startx = false;
			_self.flipSlide();
			e.preventDefault();
		};
		dom.addEventListener('touchend', function(e){
			_self.flipSlide();
			e.preventDefault();
		}, false);
		//
		this.flipSlide = function(){
			if (_self.delta > 10)
				_self.eleLeft += 100;
			else if (_self.delta < -10)
				_self.eleLeft -= 100;
			//
			//	Jump from start to end
			if (_self.eleLeft > -99){
				dom.removeClass('sliding');
				//dom.addClass('active');
				setTimeout(function(){
					dom.style.left = (-100 * (dom.childNodes.length - 1) + _self.delta) + '%';
					//
					_self.eleLeft = -100 * (dom.childNodes.length - 2);
					setTimeout(function(){
						dom.addClass('sliding');
						//dom.removeClass('active');
						dom.style.left = _self.eleLeft + '%';
						//
						_self.delta = 0;
					}, 50);
				}, 50);
			}
			//	Jump from end to start
			else if (_self.eleLeft / -100 > dom.childNodes.length - 2){
				dom.removeClass('sliding');
				//dom.addClass('active');
				setTimeout(function(){
					dom.style.left = (1 + _self.delta) + '%';
					//
					_self.eleLeft = -99;
					setTimeout(function(){
						dom.addClass('sliding');
						//dom.removeClass('active');
						dom.style.left = '-99%';
						//
						_self.delta = 0;
					}, 50);
				}, 50);
			}
			else{
				dom.addClass('sliding');
				setTimeout(function(){
					dom.style.left = _self.eleLeft + '%';
				}, 50);
				_self.delta = 0;
			}
			//
		};
	}

	this.touchSlide = function(ele, bg, stepWidth){
		var _self = this;
		this.startx = 0;
		this.delta = 0;
		this.eleLeft = 0;

		ele.addEventListener('touchstart', function(e){
			let touchobj = e.changedTouches[0];
			_self.startx = parseInt(touchobj.clientX);
			ele.className = ele.className.replace(' animate-left', '');
			bg.className = bg.className.replace(' animate-background-position', '');
			e.preventDefault();
		}, false);

		ele.addEventListener('touchmove', function(e){
			let touchobj = e.changedTouches[0];
			_self.delta = parseInt(touchobj.clientX) - _self.startx;
			ele.style.left = (_self.eleLeft + _self.delta) + 'px';
			bg.style.backgroundPositionX = ((_self.eleLeft + _self.delta - 500) / 20) + 'px';
			e.preventDefault();
		}, false);

		ele.addEventListener('touchend', function(e){
			ele.className += ' animate-left';
			bg.className += ' animate-background-position';
			if (_self.delta > 30)
				_self.eleLeft += stepWidth;
			else if (_self.delta < -30)
				_self.eleLeft -= stepWidth;
			//
			if (_self.eleLeft > 0)
				_self.eleLeft = 0;
			if (_self.eleLeft + ele.offsetWidth < 10)
				_self.eleLeft = 0 - ele.offsetWidth + stepWidth;
			//
			ele.style.left = _self.eleLeft + 'px';
			bg.style.backgroundPositionX = ((_self.eleLeft - 500) / 20) + 'px';
			_self.delta = 0;
			e.preventDefault();
		}, false);
	};


	// ------------------------------------------------------------------------------------
	//	HEIGHT GROW / SHRINK ANIMATION
	// ------------------------------------------------------------------------------------

	this.heightGrow = function(obj){
		obj.style.display = 'block';
		obj.style.overflow = 'hidden';
		//var transition = obj.style.transition;
		obj.style.transition = '';
		obj.style.height = 'auto';
		var height = obj.offsetHeight;
		obj.style.height = '0px';
		obj.style.transition = 'height 0.33s';
		setTimeout(function(){
			obj.style.height = height+'px';
		}, 5);
		setTimeout(function(){
			obj.style.height = 'auto';
			obj.style.transition = '';
		}, 360);
	};

	this.heightShrink = function(obj){
		obj.style.transition = '';
		obj.style.height = 'auto';
		obj.style.overflow = 'hidden';
		var height = obj.offsetHeight;
		obj.style.height = height+'px';
		obj.style.transition = 'height 0.33s';
		setTimeout(function(){
			obj.style.height = '0px';
		}, 1);
		setTimeout(function(){
			obj.style.transition = '';
			obj.style.display = 'none';
		}, 360);
	};


	// ------------------------------------------------------------------------------------
	//	SLIDESHOW
	// ------------------------------------------------------------------------------------

	this.slideShow = function(ul, period){
		if (typeof period == 'undefined')
			period = 3200;
		var slides = ul.querySelectorAll('li');
		var i = 0, pi = 0;
		var _self = this;
		slides[0].className = 'active';
		ul.style.height = slides[0].offsetHeight + 'px';
		//
		this.getNext = function(){
			pi = i;
			i += 1;
			if (i == slides.length)
				i = 0;
			getSlide();
		}
		//
		this.getPrev = function(){
			pi = i;
			i -= 1;
			if (i == -1)
				i = slides.length - 1;
			getSlide();
		}
		//
		var getSlide = function(){
			slides[i].className = 'active';
			slides[pi].className = 'prev';
			setTimeout(function(){slides[pi].className = '';}, 1000);
			ul.style.height = slides[i].offsetHeight + 'px';
		}
		//
		var autoTimer = false;
		var autoSlide = function(){
			_self.getNext();
			setTimeout(autoSlide, period);
		}
		setTimeout(autoSlide, period);
	};

})(document);


// ------------------------------------------------------------------------------------

var arrayIgnore = ["min", "max", "sum", "avg"];

Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

Array.prototype.min = function() {
	return Math.min.apply(null, this);
};

Array.prototype.sum = function(){
	for(var total = 0,l=this.length;l--;total+=(1*this[l]));
	return total;
}

Array.prototype.avg = function(){
	for(var total = 0,l=this.length;l--;total+=(1*this[l]));
	return this.length == 0 ? '-' : total / this.length;
}

Float32Array.prototype.max = function() {
	return Math.max.apply(null, this);
};

Float32Array.prototype.min = function() {
	return Math.min.apply(null, this);
};

Date.prototype.sqlFormatted = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString();
	var dd  = this.getDate().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]);
};


// ---------------------------------------------------------------------

HTMLElement.prototype.addClass = function(classname){
	this.className = this.className.replace(new RegExp(classname, 'g'), '').trim()+' '+classname;
}

HTMLElement.prototype.removeClass = function(classname){
	this.className = this.className.replace(new RegExp(classname, 'g'), '').trim();
}

HTMLElement.prototype.a = function(obj){
	return this.appendChild(obj);
}

HTMLElement.prototype.q = function(selector){
	return this.querySelectorAll(selector);
}

HTMLElement.prototype.__defineGetter__("innerText", function () {
	if (this.textContent) {
		return this.textContent;
	}
	else {
		var r = this.ownerDocument.createRange();
		r.selectNodeContents(this);
		return r.toString();
	}
});

function q(selector){
	return document.querySelectorAll(selector);
}

String.prototype.hash = function() {
	var hash = 0, i, chr;
	if (this.length === 0)
		return hash;
	for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0;
	}
	return hash;
};

// ---------------------------------------------------------------------

var GET = 'GET', POST = 'POST';
var module = {'exports': {}};

var isNumeric = isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

var isSet = isset = function(obj) {
	return typeof obj != 'undefined';
}


//	In a better world - we can drop the following..
//	Some cross browsere stuff

if ('ab'.substr(-1) != 'b'){
	String.prototype.substr = function(substr){
		return function(start, length){
			return substr.call(this, start < 0 ? this.length + start : start, length)
		}
	}(String.prototype.substr);
}

if (!String.prototype.trim){
	String.prototype.trim = function (){
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// ------------------------------------------------------------------------------------

if (navigator.appName == 'testKit')
	module.exports = arc;
else{
	setTimeout(console.log('%c{ArcReactor.js}', 'font-weight:bold; font-size:14pt; color:#204080;'), 10);
	setTimeout(console.log('Loaded and Ready...\n\n'), 10);
	setTimeout(console.log('%cThis is a browser feature intended for developers. Do not paste code you receive from strangers here.', 'color:#A84040;'), 10);
}
