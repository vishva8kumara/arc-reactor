
# Arc Reactor JavaScript library/framework
#### Vishva Kumara N P - vishva8kumara@gmail.com

Distributed Under MIT License

* Font-Awsome and Roboto Font is redistributed with this under their respective licenses, and not covered under this MIT license.

See index.html for demonstration; refer to the embedded JS there.

## Introduction
Arc Reactor JS or Arc JS is a powerful library to make development of Single page applications and Cross platform mobile apps easy.
This is made in Vanilla JS.
You can use it for:
 * Making a navigation across DIVisions as screens and popups
	* Uses hash URLs, browser back button will take the user to previous screen/state
	* Attach functions to each navigation point
 * Make Ajax requests with a variety of options and good control, supports caching in localStorage
 * Powerful templating engine that can read DOM object, fill with data from a JSON and generate a DOM tree
 * Tab set, Touch slide and SlideShow handlers
 * Form input handlers: Numeric only, Alpha only, Alpha numeric, Currency, Auto resizing textarea and a masked input
 * Custamizable CSS for a Data List View, Loading indicator, Popup; currently suitable for a Cordova mobile app.
 * DOM abstraction with useful and really shorthand functions for DOM manipulation.
 * Few useful prototype functions for arrays, add/remove classes to DOM, QuerySelector and string manipulation.

If you are a Vanilla JS enthusiast, this is for you.



## Navigation controller / wrapper-class

### arc.nav(hash, DOMcontext, onLoad, onExit)
This is to create a navigation frame. This is like having an MVC router on the client side.

Here you are creating a navigation point for a given hash pattern.
Whenever the URL hash (on the address-bar) changes to the match the given hash pattern, arc will display the given DOMcontext,
which is a reference to a DOM object and call the function onLoad with a reference to DOM context and if any extra parameters after the given hash pattern.

You can let the user to navigate to a hash from an anchor or by changing the document.location.hash on JavaScript.

When the URL hash changes to match another navigation frame, and the new hash does not match the given pattern, the DOM context will be hidden
and the onExit function called.

Both onLoad and onExit are optional parameters. You can simply bind a hash pattern to a DOM object.

You can nest these (one inside another) and, for an example have a pop-up inside a navigation frame.
But the hash pattern for the pop-up should be a path inside the hash for the parent.

Let's say you have a frame-1 and frame-2 and a pop-up inside frame-2
You want to bind #home to frame-1 and #/home/contact-us to pop-up.

```javascript
arc.nav('home', arc.q('#frame-1')[0]);

arc.nav('home/contact-us', arc.q('#frame-1 #pop-up')[0]);
```

We will discuss arc.q on a topic below. It is very much like a shorthand for document.querySelectorAll



## Calling a server for data (Ajax)

### arc.ajax(url, options, ref)
This sends an Ajax request to a server. Both options and ref are optional. All options are optional, and many options have aliases.
The default function call with only the URL will make a GET request and return the response on the console.
You can even send the URL as an option and only pass the options variable.

This can be used it like this:

```javascript
var req = new arc.ajax('data.json', {
	method: POST,
	headers: {"authentication": "bearer 9sf7dh596s00s89fd"},
	data: {"key": "value"},
	callback: function(result, ref){
	},
	fallback: function(result, ref){
	},
	progress: function(percentage){
	}
});
```

By keeping a reference to the ajax object you can even abort the request later on:
```javascript
req.abort();
```

callback function is called when the request returns a response with status 200.

fallback is called if the response status is anything other than 200.

If there is a progress function attacked, it will be called each time a chunk of data is received.
This works neat for requests to a long response that will be delivered in multiple chunks/packets, but not useful in small responses.

And yes, you don't have to put the request method inside quotation marks.

For data, you can also give reference to a form, or even write plain-text or binary or anything as long as your server can handle that.
Arc extension for Express Node JS framework will seamlessly deliver whatever object you put there as it is to your server side application.



## Templating power tools - reactor core

### arc.elem(tagname, innerHTML, options)
This is shorthand for document.createElement and then setting innerHTML and setting several attributes to the created element.

This is useful when creating a simple/single DOM object.

Usage:

```javascript
new arc.elem('li', 'List item content', {class: 'normal-item' 'data-id': '97812'});
```

This will return a DOM object <LI> with innerHTML "List item content" like this
```html
<li class="normal-item" data-id="97812">List item content</li>
```

This element will not be added into the DOM, and has to be done seperately.
We will at a later topic look into other useful shorthand functions to append or even prepend a child node to an element.


### arc.read(dom, index)
With an array of data in hand, let's say you want to clone a complex dom object to an array of objects.
You can use arc.read to first load a DOM element into a templatable arc regent (formally known as a schema).

For average reactions, you really don't need to worry about the output of this function.
The output of this function is to be used in an arc reaction (as a regent) that yields DOM objects (permutations).

Simply put, an arc regent is like a template segment which can be used in a reaction that results in a new DOM object.
These reactions can be repeated and even chained to obtain higher order permutations for a complex templating implementation.

index parameter is optional, and it contains object references to template tags found inside the DOM.
If you are performing a second or higher order permutation reaction, you may need to pass the index of previously identified template tags.
But those are very much optional, and not needed in average use of arc reactions.

This function returns an array of two elements. The first is an arc tree, which is an object representation of the given DOM
and the second, an index.

Let's say you have this on your template:
```html
<ul class="items">
	<li data-id="{{id}}">
		<img class="thumb" src="{{avatar}}" />
		<h3>{{name}}</h3>
		<p>{{profession}}</p>
	</li>
</ul>
```

To create elements into this list with data, first you need to create an arc regent.

```javascript
var regent1 = arc.read(arc.q('.items li')[0]);
```

You may want to make this regent just once and keep it on global scope,
because if/once we fill this list with new DOM objects, we will lose this template segment.


### arc.react(data, regent)
Now we are going to generate new DOM objects from this template with data.

This function puts strings of data from a data object into the template regent we have created earlier.

The output of this function is a new DOM object.

There are other functions such as arc.reactor which is depricated, and arc.tree which is an intermediate state in reactor.
These can be used to create a DOM object by directly entering the intermediate data object, which is slightly more efficient.



## DOM manipulation shorthand functions

### arc.q(selector)
This is basically a shorthand for document.querySelectorAll .
But, instead of a NodeList you will get an array of elements, which is functionally the same.

These are the DOM manipulation functions available for array elements returned by arc.q()

#### arc.q(selector)[0].html('HTML Code')
When called without the parameter, this will return the innerHTML of the corresponding DOM element.
If a string parameter is passed, that is set to the innerHTML of the element.

#### ..a(child), ..appendChild(child)
This adds the given child to the childNodes collecting of the corresponding DOM element at the end.

#### ..p(child), ..prependChild(child)
This adds the given child to the childNodes collecting of the corresponding DOM element to the begining.

#### ..q(selector)
You can further go down the DOM of the element from this function to pinpoint a child node within the DOM element.
This is theoretically infinitely recursive as long as there are child nodes.

#### ..show(display)
This sets the style.display of the corresponding DOM element to 'block'. The optional parameter display can be passed to set a different attribute for CSS display property.

#### ..hide()
This sets the style.display of the corresponding DOM element to 'none'.

#### ..addCls(className), ..addClass(className)
This adds a className to the corresponding DOM element.

#### ..remCls(className), ..removeClass(className)
This removes the given className from the corresponding DOM element class names list.



