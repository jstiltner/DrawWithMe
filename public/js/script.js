'use strict';

const $ = jQuery

$(document).ready(function() {


	if(!('getContext' in document.createElement('canvas'))){
		alert('Your browser does not support canvas. Time to update your browser!');
		return false;
	}

	let doc = jQuery(document),
		canvas = jQuery('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = jQuery('#instructions');
    canvas[0].width = document.body.clientWidth;
    canvas[0].height = document.body.clientHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 10;

	let id = Math.round(jQuery.now()*Math.random());

    let r = Math.floor(Math.random() * 255) + 70;
    let g = Math.floor(Math.random() * 255) + 70;
    let b = Math.floor(Math.random() * 255) + 70;
    let color = 'rgb(' + r + ',' + g + ',' + b + ')';

	let drawing = false;

	let clients = {};
	let cursors = {};

	let socket = io();

	socket.on('moving', function (data) {

		if(! (data.id in clients)){

			cursors[data.id] = jQuery('<div class="cursor">').appendTo('#cursors');
		}


		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});


		if(data.drawing && clients[data.id]){



            ctx.strokeStyle = data.color;
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}


		clients[data.id] = data;
		clients[data.id].updated = jQuery.now();
	});

	let prev = {};




    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
    document.addEventListener("touchend", touchHandler, true);
    document.addEventListener("touchcancel", touchHandler, true);

    function touchHandler(event)
    {
        let touches = event.changedTouches,
            first = touches[0],
            type = '';
        switch(event.type)
        {
            case "touchstart":
                type = "mousedown";
                break;
            case "touchmove":
                type = "mousemove";
                break;
            case "touchend":
                type = "mouseup";
                break;
            case "touchcancel":
                type = "mouseup";
                break;
            default:
                return;
        }

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }

	canvas.on('mousedown', function(e){
		e.preventDefault();
		drawing = true;
		prev.x = e.pageX;
		prev.y = e.pageY;


		instructions.fadeOut();
	});

	doc.bind('mouseup mouseleave', function(){
		drawing = false;
	});
	let lastEmit = jQuery.now();

	doc.on('mousemove', function(e){
		if(jQuery.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
                'color': color,
				'id': id
			});
			lastEmit = jQuery.now();
		}


		if(drawing){
            ctx.strokeStyle = color;
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

    setInterval(function(){
        var totalOnline = 0;
        for(var ident in clients){
            if(jQuery.now() - clients[ident].updated > 10000){



                cursors[ident].remove();
                delete clients[ident];
                delete cursors[ident];
            }
            else totalOnline++;
        }
        jQuery('#onlineCounter').html('Players Connected: '+totalOnline);
    },10000);

	function drawLine(fromx, fromy, tox, toy){
        ctx.beginPath();
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.stroke();
	}

});
