
# Arc Reactor JavaScript library/framework
#### Vishva Kumara N P - vishva8kumara@gmail.com

Distributed Under MIT License

[![MIT License](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)

* Font-Awsome and Roboto Font is redistributed with this under their respective licenses, and not covered under this MIT license.

See index.html for demonstration; refer to the embedded JS there.

## Introduction
Arc Reactor JS or Arc JS is a powerful library to make development of Single page applications and Cross platform mobile apps easy.
This is made in Vanilla JS.

Arc Reactor JS is used on Tad Hack 2016 Sri Lanka Winner project Shilpa64 and can be found online at shilpa64.lk
It is also used in several enterprise SPAs and cross platform mobile apps.

You can use this for:
 * Making a navigation across DIVisions as screens/frames and popups.
	* Uses hash URLs, browser back button will take the user to previous screen/state
	* Attach functions to each navigation point
 * Make Ajax requests with a variety of options and good control, supports caching in localStorage
 * Powerful templating engine that can read a DOM element, fill with data from a JSON and generate a DOM tree
 * Tab set, Touch slide and SlideShow handlers
 * Form input handlers: Numeric only, Alpha only, Alpha numeric, Currency, Auto resizing textarea and a masked input
 * Custamizable CSS for a Data List View, Loading indicator, Popup; currently suitable for a Cordova mobile app.
 * DOM abstraction with useful and really shorthand functions for DOM manipulation.
 * Some useful prototype functions for arrays, add/remove classes to DOM, QuerySelector shorthand and string manipulation.

If you are a Vanilla JS enthusiast, this is for you.



## Navigation controller / wrapper-class

### arc.nav (hash, DOMcontext, onLoad, onExit)
This is to create a navigation frame. This is like having an MVC router on the client side.

Here you are creating a navigation point for a given hash pattern.
Whenever the URL hash (on the address-bar) changes to the match the given hash pattern, arc will display the given DOMcontext,
which is a reference to a DOM element and call the function onLoad with a reference to DOM context and if any extra parameters after the given hash pattern.

You can let the user to navigate to a hash from an anchor or by changing the document.location.hash on JavaScript.

When the URL hash changes to match another navigation frame, and the new hash does not match the given pattern, the DOM context will be hidden
and the onExit function called.

Both onLoad and onExit are optional parameters. You can simply bind a hash pattern to a DOM element.

You can nest these (one inside another) and, for an example have a pop-up inside a navigation frame.
But the hash pattern for the pop-up should be a path inside the hash for the parent.

Let's say you have a frame-1 and frame-2 and a pop-up inside frame-2
You want to bind #home to frame-1 and #/home/contact-us to pop-up.

```javascript
arc.nav('home', arc.q('#frame-1')[0]);

arc.nav('home/contact-us', arc.q('#frame-1 #pop-up')[0],
	function(context, params, event){
		var form = context.q('form')[0].obj;
		//	clear the form contents
		form.reset();
		form.onsubmit = function(){
			//	To Do: Send data to server
			return false;
		};
	},
	function(context, event){
		alert('Thank you for contacting us.');
	});
```

We will discuss arc.q on a topic below. It is very much like a shorthand for document.querySelectorAll .

onLoad function receives a couple of parameters. The first; context is the dom element we have bound to the hash pattern on arc.nav() .
The second is an array of if any back-slash delimited segments on hash after the given pattern.
The thrid is often forgot, the original event window.onPopState received.

onExit function receives two parameters. The first is the same context as we discussed above.

To pass a parameter from one nav frame to another (while navigating), simply append them back-slash delimited to ```document.hash``` followed by the bound pattern for the destination nav frame.
You can even set the desired hash on the ```href``` attribute of an anchor.

not-released, future-feature:
On the next version, you may return an object from onLoad function which will be passed down to onExit function.
By using this object/proposed-mechanism, you may pass any object or state from onLoad to onExit.
You may even pass a reference to an object; attributes of which can be changed later, asynchronously, before the onExit event is triggered.


## Calling a server for data (Ajax)

### arc.ajax (url, options, ref)
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
			// Use result.data (JSON) on client-side logic or UI
		},
		fallback: function(result, ref){
			// handle error, display error message or retry
		},
		progress: function(percentage){
			// Update a progress bar
		}
	});
```

By keeping a reference to the ajax object you can even abort the request later on:
```javascript
req.abort();
```
This is also useful if the user changes the parameters that cause a fresh ajax request and you want to cancel the previous request.

On Node JS, you can capture this event as follows:
```javascript
req.connection.on('close', function(){
	// connection aborted by client
});
```

callback function is called when the request returns a response with status 200.

fallback is called if the response status is anything other than 200.

If there is a progress function attacked, it will be called each time a chunk of data is received.
This works neat for requests to a long response that will be delivered in multiple chunks/packets, but not useful in small responses.

And yes, you don't have to put the request method inside quotation marks.

For data, you can also give reference to a form, or even write plain-text or binary or anything as long as your server can handle that.
Arc extension for Express Node JS framework will seamlessly deliver whatever object you put there as it is to your server side application.



## Templating power tools - reactor core

### arc.elem (tagname, innerHTML, options)
This is shorthand for document.createElement and then setting innerHTML and setting several attributes to the created element.

This is useful when creating a simple/single DOM element.

Usage:

```javascript
new arc.elem('li', 'List item content', {class: 'normal-item' 'data-id': '97812'});
```

This will return a DOM element <LI> with innerHTML "List item content" like this
```html
<li class="normal-item" data-id="97812">List item content</li>
```

This element will not be added into the DOM, and has to be done seperately.
We will at a later topic look into other useful shorthand functions to append or even prepend a child node to an element.


### arc.read (dom, index)
With an array of data in hand, let's say you want to clone a complex dom element to an array of objects.
You can use arc.read to first load a DOM element into a templatable arc regent (formally known as a schema).

For average reactions, you really don't need to worry about the output of this function.
The output of this function is to be used in an arc reaction (as a regent) that yields DOM elements (permutations).

Simply put, an arc regent is like a template segment which can be used in a reaction that results in a new DOM element.
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
because if/once we fill this list with new DOM elements, we will lose this template segment.


### arc.react (data, regent)
Now we are going to generate new DOM elements from this template with data.

This function puts strings of data from a data object into the template regent we have created earlier.

The output of this function is a new DOM element.

There are other functions such as arc.reactor which is depricated, and arc.tree which is an intermediate state in reactor.
These can be used to create a DOM element by directly entering the intermediate data object, which is slightly more efficient.



## DOM manipulation shorthand functions

### arc.q (selector)
This is basically a shorthand for document.querySelectorAll .
But, instead of a NodeList you will get an array of elements, which is functionally the same.

These are the DOM manipulation functions available for array elements returned by arc.q()

#### arc.q (selector)[i].obj
.q gives you an (array of) abstracted object that have shorthand functions, but not full control over the underlying DOM element.
If you wish to gain access to the underlying DOM element, use this attribute for a pointer to that.

#### arc.q (selector)[0].html('HTML Code')
When called without the parameter, this will return the innerHTML of the corresponding DOM element.
If a string parameter is passed, that is set to the innerHTML of the element.

#### ..a (child), ..appendChild(child)
This adds the given child to the childNodes collection of the corresponding DOM element at the end.

#### ..p (child), ..prependChild(child)
This adds the given child to the childNodes collection of the corresponding DOM element at the begining/top.

#### ..q (selector)
You can further go down the DOM of the element from this function to pinpoint a child node within the DOM element.
This is theoretically infinitely recursive as long as there are child nodes.

#### ..show (display)
This sets the style.display of the corresponding DOM element to 'block'. The optional parameter display can be passed to set a different attribute for CSS display property.

#### ..hide ()
This sets the style.display of the corresponding DOM element to 'none'.

#### ..addCls (className), ..addClass (className)
This adds a className to the corresponding DOM element.

#### ..remCls (className), ..removeClass (className)
This removes the given className from the corresponding DOM element class names list.

#### ..innerText
innerText is not supported in some browsers. But with Arc JS, innerText will work on any browser.

#### ..style.*
These will work the same way as if it is a regular DOM element; for setting and getting by style attributes.

#### ..style (attribute)
Getting DOMElement style attributes as described on the above will only return from inline defined styles.
Sometimes you may want to get the style an element have from stylesheets (computed styles).
In this case, you can call style as a function instead as an attribute. This will give you the value from computed styles.
Attribute parameter is optional. Without that, the function will return the full list of computed style attributes.


## Advanced form elements and handlers - autopilot forms

### autopilotForm
This makes the need for validation less important by allowing the form elements be filled only according to the set rules.
Arc.JS on Veev php framework seamlessly implements autopilot forms according to the definitions on schema json used to build the form or data-table from view helpers.
A compatibility layer for Express Node JS framework is also under construction.
When using those plugins, you only have to define the appropriate data sub-type or class on the schema file, and remember to include arc.js at the end of HTML before the closing body tag.

At the time arc.js initializes, any form that has the className ```autopilot``` will be handled by autopilot form handler.
Otherwise you can make any form be autopilot handled; programmetically.

These rules are set by ```data-validate``` and/or ```data-mask``` attributes.
Otherwise you can make any form element autopilot'ed by creating individual handlers/wrappers; programmetically.

Following are the allowed values for ```data-validate``` attribute.
alpha, numeric, alphanumeric, currency, date

#### data-validate="alpha" or arc.alphaInputHandler(element)
This makes the input field only accept latin A to Z (uppercase or lowercase) and space.

#### data-validate="numeric" or arc.numericInputHandler(element)
This makes the input field only accept numbers 0 to 9 and dot for decimals.
Further, the default arc.css stylesheet will make the input contents right aligned.

#### data-validate="alphanumeric" or arc.alphaNumericInputHandler(element)
This makes the input field only accept latin A to Z (uppercase or lowercase), numbers 0 to 9, space and dot.
Any special character will not be allowed into this input field.

#### data-validate="currency" or arc.currencyInputHandler(element)
This is very similar to numeric, with the exception of comma, and input being thousand seperated by comma.

#### textarea or arc.textareaHandler(element)
The text area will smoothly/magically be resized as the user type in content.
This is only good for text input less than 10 or so lines.

#### data-validate="date" or arc.dateInputHandler(element)
beta, depricated
This was supposed to display a sassy calendar control. You should rather use HTML input type="date" for this purpose.

#### data-mask="pattern-or-mask" or arc.maskedInputHandler(element, mask)
Let's say you want to ensure the user enter their social security number, telephone number or any of that sort in the correct format.
You can define a pattern with special characters ({, [, (, ), ], }, |, -) with "9"s and "A"s.
Few examples are:
```html
<input type="text" name="telephone" data-mask="(999)-999-9999" />
<input type="text" name="social-security" data-mask="999-99-9999" />
<input type="text" name="credit-card" data-mask="9999-9999-9999-9999" />
<input type="text" name="appointment-number" data-mask="AA-9999" />
```
The user will see any special charactor sequence along with "_" (underscores) where their input goes into.
As they type in, only the underscore spaces are filled in while the special charactor sequences left in their places.


## MultiFrame Interface Elements
These are wrappers for simple multi frame views.
Let's say you want to allow navigation between a collection of screens but do not need to change the document hash or attach onLoad or onExit functions.
These can be utilized for that kind of purposes.

### slideShow(UL, period)
A slide show automatically transitions its slides one after another.
period parameter is optional and defaults to 3.2 seconds.
getNext() and getPrev() functions can also trigger the transition.

### touchSlide(container, background, stepWidth)
beta
This is ideal for mobile devices with touch capability.
By functionality, it is similar to slide show, but allows the user to touch and slide left/right for intentional transition.

### tabSet(tabContainer)
beta
A tab container expects you to set-up the UI markup according to the expected manner.
Documentation for this markup will be updated on the next version.
