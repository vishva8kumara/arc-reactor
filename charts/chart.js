
var data = [
	["Date","Green","Blue","Brown","Red","Orange"],
	[new Date("2016-06-20"),142.1875,105.625,39.6875,112.8125,20.3125],
	[new Date("2016-06-21"),84.375,10.9375,56.5625,78.125,141.875],
	[new Date("2016-06-22"),93.4375,82.8125,51.5625,118.4375,79.6875],
	[new Date("2016-06-23"),131.25,9.375,79.375,91.25,95.625],
	[new Date("2016-06-24"),78.75,68.4375,55.3125,7.8125,96.25],
	//*/
	[new Date("2016-06-25")],
	[new Date("2016-06-26")],
	[new Date("2016-06-27"),54.6875,110.3125,40.3125,54.0625,103.4375],
	[new Date("2016-06-28"),126.25,137.8125,67.8125,68.4375,140.3125],
	[new Date("2016-06-29"),102.1875,70.3125,59.0625,113.125,110.9375],
	[new Date("2016-06-30"),89.6875,35.3125,38.4375,52.5,95.9375],
	[new Date("2016-07-01"),21.875,15.625,35.9375,25,9.375],
	/*/
	[new Date("2016-07-02")],
	[new Date("2016-07-03")],
	[new Date("2016-07-04"),53.75,85.9375,52.8125,60,46.5625],
	[new Date("2016-07-05"),34.375,89.375,56.875,73.125,89.0625],
	[new Date("2016-07-06"),90.625,146.25,57.8125,130.3125,60.9375],
	[new Date("2016-07-07"),130.9375,40.625,55,52.5,108.4375],
	[new Date("2016-07-08"),75,26.5625,42.1875,23.4375,82.8125],
	[new Date("2016-07-09")],
	[new Date("2016-07-10")],
	[new Date("2016-07-11"),71.875,73.125,86.45833,100.7291667,78.75],
	[new Date("2016-07-12"),118.33,106.354167,99.89583,72.70833,61.145833],
	[new Date("2016-07-13"),128.125,104.791667,105.41667,93.854167,103.645833],
	[new Date("2016-07-14"),98.2291667,33.125,62.5,43.125,125.3125],
	[new Date("2016-07-15"),148.541667,96.875,73.8541667,76.5625,133.2291667],
	[new Date("2016-07-16")],
	[new Date("2016-07-17")],
	[new Date("2016-07-18"),57.5,56.45833,65,51.5625,56.770833]
	//*/
];
var colors = ["#1e9c00","#47b7c0","#702d00","#ae1e00","#c29600"];

var options = {
		chartArea:{left:40, right:20, bottom:60, top:10},
		backgroundColor: '#FFFFFF',
		grayDays: 'rgba(230, 230, 230, 0.6)',
		fontColor: '#444444',
		//rotateXAxisLabels: 50,
		/*/
		verticalRanges: {
				below: [51, 52, 'rgba(240, 50, 50, 1)'],
				above: [80, 81, 'rgba(50, 140, 240, 1)']
			}
		/*/
		verticalRanges: {
				below: [0, 50, 'rgba(240, 50, 50, 0.1)'],
				average: [50, 80, 'rgba(100, 100, 100, 0.1)'],
				above: [80, 140, 'rgba(50, 140, 240, 0.1)']
			}
		//*/
	};

new barchart(q('#chart')[0], data, colors, options);

function barchart(context, data, colors, options){
	var defaultOptions = {
		chartArea:{left:40, right:10, bottom:60, top:5},
		backgroundColor: '#FFFFFF'
	};
	var tolltip = arc.elem('div', null, {class: 'chartTooltip', style: 'opacity:0;'});
	var colMax = 1, rowMin = Math.min(), rowMax = 0;
	for (var i = 1; i < data.length; i++){
		if (data[i][0] > rowMax)
			rowMax = getVal(data[i][0]);
		if (data[i][0] < rowMin)
			rowMin = getVal(data[i][0]);
		for (var j = 1; j < data[i].length; j++)
			if (data[i][j] > colMax)
				colMax = data[i][j];
	}
	var xGap = 24*3600000;
	//
	setTimeout(
		function(){
			var graph = elemSVG('svg', null, {
					width: context.offsetWidth,
					height: context.offsetHeight,
					'font-family': options.fontFamily,
					'shape-rendering': 'crispEdges',
					style: 'background-color:'+options.backgroundColor+';'});
			var chartArea = elemSVG('g', null, {transform: 'translate('+options.chartArea.left+', '+options.chartArea.top+')'});
			//
			var areaHeight = context.offsetHeight - options.chartArea.top - options.chartArea.bottom;
			var areaWidth = context.offsetWidth - options.chartArea.left - options.chartArea.right;
			var setWidth = (xGap * areaWidth) / (xGap + rowMax - rowMin);
			var colWidth = (setWidth / (data[0].length+1))-1;
			//
			drawHorizontalLine(graph, context, options, topForVal(context, options, areaHeight, colMax, 0), '', '#A0A0A0');
			for (var i = 1; i < 6; i++){
				drawHorizontalLine(graph, context, options, topForVal(context, options, areaHeight, colMax, i*25), i*25, '#E0E0E0');
			}
			//
			if (typeof options.verticalRanges != 'undefined')
				for (range in options.verticalRanges)
					graph.appendChild(elemSVG('rect', null, {
										x: options.chartArea.left-5,
										y: options.chartArea.top + 10 + (areaHeight * (1 - (options.verticalRanges[range][1] / colMax))),
										width: areaWidth,
										height: areaHeight * (options.verticalRanges[range][1]-options.verticalRanges[range][0]) / colMax,
										style: 'fill:'+options.verticalRanges[range][2]+';'
									}));
			//
			var barHeight;
			if (setWidth < 80)
				options.rotateXAxisLabels = 45;
			for (var i = 1; i < data.length; i++){
				var group = elemSVG('g', null, {transform: 'translate('+(setWidth * (getVal(data[i][0]) - rowMin) / xGap /*(i-1)*/)+', 0)'});
				if (data[i].length == 1){
					var rect = elemSVG('rect', null, {
									x: (-1*colWidth),
									y: options.chartArea.top,
									width: setWidth-2,
									height: areaHeight,
									style: 'fill:'+options.grayDays+';'
								});
					group.appendChild(rect);
				}
				else{
					for (var j = 1; j < data[i].length; j++){
						barHeight = data[i][j] * areaHeight / colMax;
						var rect = elemSVG('rect', null, {
										x: ((colWidth+1)*(j-1)),
										y: areaHeight - barHeight + options.chartArea.top,
										width: colWidth,
										height: barHeight,
										style: 'fill:'+colors[j-1]+';'
									});
						new chartBar(tolltip, rect, '<b>'+formatXAxis(data[i][0]).join(' ')+'</b><br>'+data[0][j]+': '+data[i][j]);
						group.appendChild(rect);
					}
					var txtLbl = elemSVG('g', null, {
							transform: (typeof options.rotateXAxisLabels != undefined ?
										'rotate(-'+options.rotateXAxisLabels+' '+((setWidth/2)-10)+' 250)' : '')
						});
					txtLbl.appendChild(elemSVG('text', formatXAxis(data[i][0])[0], {
						'text-anchor': 'middle',
						'font-size': 12,
						y: areaHeight+20,
						fill: options.fontColor,
						transform: 'translate('+((setWidth/2)-15)+', 5)'}));//transform: 'rotate(-30' '+(setWidth/2)+' '+(10*setWidth/2)+)')
						//transform: 'rotate(-30 40 240)'}));
					txtLbl.appendChild(elemSVG('text', formatXAxis(data[i][0])[1], {
						'text-anchor': 'middle',
						'font-size': 12,
						y: areaHeight+30,
						fill: options.fontColor,
						transform: 'translate('+((setWidth/2)-15)+', 5)'}));
					group.appendChild(txtLbl);
				}
				chartArea.appendChild(group);
			}
			//
			graph.appendChild(chartArea);
			context.innerHTML = '';
			context.appendChild(graph);
			context.appendChild(tolltip);
			/*/
			var 
			context.onmousemove = function(){
				tolltip.style.opacity = 0;
			}
			//*/
			/*graph.onmouseout = function(){
				tolltip.style.opacity = 0;
				barHideTimeout = setTimeout(function(){tolltip.style.display='none';}, 500);
			}*/
		}, 400);
	//tolltip.onmouseover
	//
	function drawHorizontalLine(graph, context, options, height, value, color){
		graph.appendChild(elemSVG('path', null, {
			d: 'M'+(options.chartArea.left-5)+','+height+
			' L'+(context.offsetWidth-options.chartArea.right)+','+height, stroke: color}));
		graph.appendChild(elemSVG('text', value,
			{'text-anchor': 'end',
			'font-size': 12,
			y: height + 5,
			x: options.chartArea.left - 8,
			fill: options.fontColor}));
	}
	//
	function topForVal(context, options, areaHeight, colMax, val){
		return context.offsetHeight - options.chartArea.bottom + options.chartArea.top - (areaHeight * val / colMax);
	}
	//
	function formatXAxis(x){
		if (x instanceof Date)
			return [x.toString().substring(0, 3), x.toString().substring(4, 10), x.toString().substring(11, 15)];//.replace(' ', '<br/>');
		else
			return x;
	}
	//
	function getVal(x){
		if (x instanceof Date)
			return x.getTime();// - (60000 * x.getTimezoneOffset());
		else
			return x;
	}
	//
	//var barHideTimeout;
	context.onmouseover = function(e){
		tolltip.style.top = (e.clientY-tolltip.offsetHeight-10)+'px';
		tolltip.style.left = (e.clientX-(tolltip.offsetWidth/2))+'px';
		if (tolltip.style.left.substring(0,1) == '-')
			tolltip.style.left = '0px';
	}
	function chartBar(tolltip, obj, tooltip){
		obj.onclick = obj.onmouseover = function(e){
			tolltip.innerHTML = tooltip;
			tolltip.style.top = (e.clientY-tolltip.offsetHeight-10)+'px';
			tolltip.style.left = (e.clientX-(tolltip.offsetWidth/2))+'px';
			if (tolltip.style.left.substring(0,1) == '-')
				tolltip.style.left = '0px';
			tolltip.style.display = 'block';
			tolltip.style.opacity = 0.75;
			//clearTimeout(barHideTimeout);
			//console.log(tooltip);
		}
		obj.onmouseout = function(){
			tolltip.style.opacity = 0;
		}
	}
}


function elemSVG(tagname, innerHTML, options){
	var obj = document.createElementNS('http://www.w3.org/2000/svg', tagname);
	if (typeof innerHTML !== 'undefined' && innerHTML != null && innerHTML != false)
		obj.innerHTML = innerHTML;
	if (typeof options !== 'undefined')
		for (var key in options)
			obj.setAttribute(key, options[key]);
	return obj;
}
