

// Fatemeh Yarahmadi
// 11156610
// CSCE5210 Program6

// 


"use strict"

// global variables

var canvas;
var gl;

var worldCoordinates = [], clipCoordinates = [], viewportCoordinates = [];
var point0, point1, point2, point3, point4, point5, point6; // initial points used by default

var a_Position, u_ModelMatrix, u_MvpMatrix, u_Color;

var pointsBuffer, piece1Buffer, piece2Buffer;

var mouseX, mouseY; // current mouse coordinates
var isPointSelected = false;
var pointSelected;

var modelMatrix = new Matrix4(), mvpMatrix = new Matrix4();

var ANGLE_STEP = 0.0;

var ZOOM_FACTOR = 1.0;

var r = 15; // radius
var leftPlane, rightPlane, bottomPlane, topPlane;

/*********************************************************************/

var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n' +
	//'attribute vec4 a_Normal;\n' +
	//'uniform mat4 u_ModelMatrix;\n' +
	'uniform mat4 u_MvpMatrix;\n' +
	//'varying vec4 v_Color;\n' +
	'void main() {\n' +
	'   gl_Position = u_MvpMatrix * a_Position;\n' +
	//'   v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
	'   gl_PointSize = 10.0;\n' +
	'}\n';

var FSHADER_SOURCE =
	'precision mediump float;\n' +
	'uniform vec4 u_Color;\n' +
	'void main() {\n' +
    '   gl_FragColor = u_Color;\n' +
    '}\n';


/*********************************************************************/

function main() {
		
	canvas = document.getElementById('webgl');
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('WebGL is not available.');
        return;
    }
    
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Unable to get the rendering context for WebGL.');
        return;
    }
    	
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
	a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Unable to get the storage location of a_Position');
		return;
    }
	
	//u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	u_Color = gl.getUniformLocation(gl.program, 'u_Color');
	
	if (!u_MvpMatrix || !u_Color) {
        console.log('Unable to get the storage location');
		return;
    }
	
	pointsBuffer = gl.createBuffer();
	if (!pointsBuffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	
	piece1Buffer = gl.createBuffer();
	if (!piece1Buffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	
	piece2Buffer = gl.createBuffer();
	if (!piece2Buffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	
	
	point0 = {x: -6, y: 6, z: 0};
	point1 = {x: -4, y: -6, z: 0};
	point5 = {x: 4, y: 6, z: 0};
	point6 = {x: 6, y: -6, z: 0};
	
	point2 = {x: -2, y: 6, z: 0};
	point3 = {x: 0, y: 0, z: 0};
	point4 = {x: 2, y: -6, z: 0};
	
	worldCoordinates = [point0.x, point0.y, point0.z, point1.x, point1.y, point1.z, 
				   point2.x, point2.y, point2.z, point3.x, point3.y, point3.z, 
				   point4.x, point4.y, point4.z, point5.x, point5.y, point5.z, 
				   point6.x, point6.y, point6.z];
	
	//console.log(worldCoordinates);
	
	var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the indices');
		return;
    }
		
	draw(gl);
		
	// key handling
    document.onkeydown = function(ev) {
        keyHandler(ev, gl, n);
    };
	
	
	// mouse handling
	
	// mouse move	
	canvas.onmousemove = function(ev) {
		
		mouseMoveHandler(ev);
		
	};
	
	// mouse down
	canvas.onmousedown = function(ev) {
		mouseDownHandler(ev);
	};
	
	// mouse up
	canvas.onmouseup = function(ev) {
		mouseUpHandler(ev);
		//isPointSelected = false;
	};
	
} // main()

/*********************************************************************/

function initVertexBuffers(gl) {
	
	// buffer for control points
	
	/*
	pointsBuffer = gl.createBuffer();
	if (!pointsBuffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	*/
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(worldCoordinates), gl.STATIC_DRAW);
    
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
	
	/*-------------------------------------------------------------*/
	
	// first piece of the curve
	
	var points = [];
	
	var p0 = point0, p1 = point1, p2 = point2, p3 = point3, 
	p4 = point4, p5 = point5, p6 = point6;
	
	var newPoint = {};
	
	var n = 0; // number of points generated
	
	// t in range [0, 1] partitioned to 30
	
	for (var t = 0; t <= 1; t += 1.0/30.0) {
		newPoint = bezier(p0, p1, p2, p3, t);
		n++;
		points = points.concat(newPoint.x);
		points = points.concat(newPoint.y);
		points = points.concat(newPoint.z);
	}
	
	/*
	piece1Buffer = gl.createBuffer();
	if (!piece1Buffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	*/
    gl.bindBuffer(gl.ARRAY_BUFFER, piece1Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
	
	/*-------------------------------------------------------------*/
	
	// first piece of the curve
	
	points = [];
	
	for (var t = 0; t <= 1; t += 1.0/30.0) {
		newPoint = bezier(p3, p4, p5, p6, t);
		//n++;
		points = points.concat(newPoint.x);
		points = points.concat(newPoint.y);
		points = points.concat(newPoint.z);
	}
	
	/*
	piece2Buffer = gl.createBuffer();
	if (!piece2Buffer) {
        console.log('Unable to create the buffer object');
        return -1;
    }
	*/
    gl.bindBuffer(gl.ARRAY_BUFFER, piece2Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
	
	
	return n;
	
} // initVertexBuffers()

/*********************************************************************/

function keyHandler(ev, gl) {
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	switch(ev.keyCode) {
		
		case 37: 		// if 'left arrow' is pressed
			ANGLE_STEP += 1.0; // rotate anti clockwise
            break;
			
		case 39: 		// if 'right arrow' is pressed
            ANGLE_STEP -= 1.0; // rotate clockwise
            break;	
		
		case 40: 		// if 'down arrow' is pressed			
			ZOOM_FACTOR += 0.01; // zoom out
            break;
		
		case 38: 		// if 'up arrow' is pressed			
			ZOOM_FACTOR -= 0.01; // zoom in
            break;
		
		default:
            break;
	}
	
	draw(gl);
	
} // keyHandler()

/*********************************************************************/

function mouseMoveHandler(ev) {
	
	mouseX = ev.clientX;
	mouseY = ev.clientY;
	
	var rect = canvas.getBoundingClientRect();
	
	mouseX = (mouseX - rect.left) / (rect.right - rect.left) * canvas.width;
	mouseY = (mouseY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	
	var x = (2.0 * mouseX / canvas.width) - 1.0;
	var y = 1.0 - (2.0 * mouseY / canvas.height);
		
	if (isPointSelected) {
		updateStuff(ev);
	}
	
	
	
} // mouseMoveHandler()

/*********************************************************************/

function mouseDownHandler(ev) {
		
	// convert mouse coordinates to viewport
	
	var rect = canvas.getBoundingClientRect();
	
	//mouseX = (mouseX - rect.left) / (rect.right - rect.left) * canvas.width;
	//mouseY = (mouseY - rect.top) / (rect.bottom - rect.top) * canvas.height;
	
	// compare mouse position with each control point
	
	var deltaX, deltaY;
		
	for (var i = 0; i < 14 && !isPointSelected; i += 2) {
		
		deltaX = Math.abs(mouseX - viewportCoordinates[i]);
		deltaY = Math.abs(mouseY - viewportCoordinates[i+1]);
		if (deltaX < 5 && deltaY < 5) { // point is selected
			isPointSelected = true;
			pointSelected = i;
		}
		
	}
	
} // mouseDownHandler()

/*********************************************************************/

function mouseUpHandler(ev) {
	
	// if mouse down did not encounter a point selection
	if (!isPointSelected) {
		return;
	}
	
	// otherwise
	
	updateStuff(ev);
	
	isPointSelected = false;
	
} // mouseUpHandler()

/*********************************************************************/

function updateStuff(ev) {
	
	// mew mouse position = position of control point selected
	mouseX = ev.clientX;
	mouseY = ev.clientY;
	
	var rect = canvas.getBoundingClientRect();
	
	mouseX = (mouseX - rect.left) / (rect.right - rect.left) * canvas.width;
	mouseY = (mouseY - rect.top) / (rect.bottom - rect.top) * canvas.height;
		
	// update viewport coordinates
	
	// enforce 3 decimal places
	mouseX = Math.round(mouseX*1000)/1000;
	console.log(mouseX);
	mouseY = Math.round(mouseY*1000)/1000;
	console.log(mouseY);
		
	viewportCoordinates[pointSelected] = mouseX;
	viewportCoordinates[pointSelected+1] = mouseY;
		
	// update clip Coordinates	
	var index = 3 * pointSelected / 2;
		
	clipCoordinates[index] = (2.0 * mouseX / canvas.width) - 1.0;
	clipCoordinates[index] = Math.round(clipCoordinates[index]*100000)/100000;
	
	clipCoordinates[index+1] = 1.0 - (2.0 * viewportCoordinates[pointSelected+1] / canvas.height);
	clipCoordinates[index+1] = Math.round(clipCoordinates[index+1]*100000)/100000;
	
	// update world Coordinates
		
	var x = clipCoordinates[index];
	var y = clipCoordinates[index+1];
	var z = clipCoordinates[index+2];
	
	var tempVector = new Vector4([x, y, z, 1]);
	tempVector = mvpMatrix.multiplyVector4(tempVector);
	
	var oldX = worldCoordinates[index];
	var oldY = worldCoordinates[index+1];
	var oldZ = worldCoordinates[index+2];
	
	worldCoordinates[index] = tempVector.elements[0];
	worldCoordinates[index+1] = tempVector.elements[1];
	worldCoordinates[index+2] = tempVector.elements[2];
	
	var deltaX = worldCoordinates[index] - oldX;
	var deltaY = worldCoordinates[index+1] - oldY;
	var deltaZ = worldCoordinates[index+2] - oldZ;
	
	var pointNumber = index / 3;
		
	switch(pointNumber) {
		case 0:
			point0.x = worldCoordinates[0];
			point0.y = worldCoordinates[1];
			point0.z = worldCoordinates[2];
			console.log(point0);
		break;
			
		case 1:
			point1.x = worldCoordinates[3];
			point1.y = worldCoordinates[4];
			point1.z = worldCoordinates[5];
			console.log(point1);
		break;
		
		case 2:
			point2.x = worldCoordinates[6];
			point2.y = worldCoordinates[7];
			point2.z = worldCoordinates[8];

			point4.x = worldCoordinates[12] -= deltaX;
			point4.y = worldCoordinates[13] -= deltaY;
			point4.y = worldCoordinates[14] -= deltaZ;
			
			console.log(point2);
		break;
		
		case 3:
			point3.x = worldCoordinates[9];
			point3.y = worldCoordinates[10];
			point3.z = worldCoordinates[11];
			
			point2.x = worldCoordinates[6] += deltaX;
			point2.y = worldCoordinates[7] += deltaY;
			point2.z = worldCoordinates[8] += deltaZ;
			
			point4.x = worldCoordinates[12] += deltaX;
			point4.y = worldCoordinates[13] += deltaY;
			point4.z = worldCoordinates[14] += deltaZ;
			
			console.log(point3);
		break;
		
		case 4:
			point4.x = worldCoordinates[12];
			point4.y = worldCoordinates[13];
			point4.z = worldCoordinates[14];
			
			point2.x = worldCoordinates[6] -= deltaX;
			point2.y = worldCoordinates[7] -= deltaY;
			point2.z = worldCoordinates[8] -= deltaZ;
			
			console.log(point4);
		break;
		
		case 5:
			point5.x = worldCoordinates[15];
			point5.y = worldCoordinates[16];
			point5.z = worldCoordinates[17];
			console.log(point5);
		break;
		
		case 6:
			point6.x = worldCoordinates[18];
			point6.y = worldCoordinates[19];
			point6.z = worldCoordinates[20];
			console.log(point6);
		break;	
		
		default:
		break;
	}
	
	initVertexBuffers(gl);
	
	draw(gl);
	
}///////

/*********************************************************************/

function draw(gl) {
		
	// transformations
	
	// rotation
	modelMatrix.setRotate(ANGLE_STEP, 1.0, 0.0, 0.0);
	modelMatrix.rotate(ANGLE_STEP, 0.0, 1.0, 0.0);
	
	// zoom
	leftPlane = bottomPlane = 0 - ZOOM_FACTOR * r;
	rightPlane = topPlane = 0 + ZOOM_FACTOR * r;
	mvpMatrix.setOrtho(leftPlane, rightPlane, bottomPlane, topPlane, -30, 30);
	
	mvpMatrix.multiply(modelMatrix);
	
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	
	// clip coordinates [-1,1]^3
	
	clipCoordinates = [];
		
	var tempVec = new Vector4();
	var x, y, z;
	
	for (var i = 0; i < 21; i += 3) {
		x = worldCoordinates[i];
		y = worldCoordinates[i+1];
		z = worldCoordinates[i+2];
		tempVec = new Vector4([x, y, z, 1]);
		tempVec = mvpMatrix.multiplyVector4(tempVec);
		clipCoordinates = clipCoordinates.concat(Math.round(tempVec.elements[0]*100000)/100000);
		clipCoordinates = clipCoordinates.concat(Math.round(tempVec.elements[1]*100000)/100000);
		clipCoordinates = clipCoordinates.concat(Math.round(tempVec.elements[2]*100000)/100000);
	}
		
	// viewport cooridnates
	
	viewportCoordinates = [];
	
	for (var i = 0; i < 21; i += 3) {
		x = (clipCoordinates[i] + 1.0) / 2.0 * canvas.width;
		y = (1.0 - clipCoordinates[i+1]) / 2.0 * canvas.height;
		x = Math.round(x*1000)/1000;
		y = Math.round(y*1000)/1000;
		viewportCoordinates = viewportCoordinates.concat(x, y);
	}
	
	mvpMatrix.invert();
	
	console.log(viewportCoordinates);
	
	/*-------------------------------------------------------------*/
	
	// control points p0, p1, p2, p3, p4, p5, p6
	
	gl.uniform4f(u_Color, 1.0, 0.0, 0.0, 1.0); // red
	gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
	
	gl.drawArrays(gl.POINTS, 0, 7);
	
	/*-------------------------------------------------------------*/
	
	// first curve generated from p0, p1, p2, p3
	
	gl.uniform4f(u_Color, 0.0, 0.0, 1.0, 1.0); // blue
	gl.bindBuffer(gl.ARRAY_BUFFER, piece1Buffer);
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
	
	gl.drawArrays(gl.LINE_STRIP, 0, 31);
	
	/*-------------------------------------------------------------*/
	
	// second curve generated from p3, p4, p5, p6
	
	gl.uniform4f(u_Color, 0.0, 1.0, 0.0, 1.0); // green
	gl.bindBuffer(gl.ARRAY_BUFFER, piece2Buffer);
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
		
	gl.drawArrays(gl.LINE_STRIP, 0, 31);
		
} // draw()

/*********************************************************************/

function bezier(p0, p1, p2, p3, t) {
	
	var pFinal = {};
	
	pFinal.x = Math.pow(1 - t, 3) * p0.x +
			   Math.pow(1 - t, 2) * 3 * t * p1.x +
			   (1 - t) * 3 * t * t * p2.x +
			   t * t * t * p3.x;
	
	pFinal.y = Math.pow(1 - t, 3) * p0.y +
			   Math.pow(1 - t, 2) * 3 * t * p1.y +
			   (1 - t) * 3 * t * t * p2.y +
			   t * t * t * p3.y;
	
	pFinal.z = Math.pow(1 - t, 3) * p0.z +
			   Math.pow(1 - t, 2) * 3 * t * p1.z +
			   (1 - t) * 3 * t * t * p2.z +
			   t * t * t * p3.z;
	
	return pFinal;
	
} // bezier()

/*********************************************************************/

function defaultScene() {
	
	point0 = {x: -6, y: 6, z: 0};
	point1 = {x: -4, y: -6, z: 0};
	point5 = {x: 4, y: 6, z: 0};
	point6 = {x: 6, y: -6, z: 0};
	
	point2 = {x: -2, y: 6, z: 0};
	point3 = {x: 0, y: 0, z: 0};
	point4 = {x: 2, y: -6, z: 0};
	
	worldCoordinates = [point0.x, point0.y, point0.z, point1.x, point1.y, point1.z, 
				   point2.x, point2.y, point2.z, point3.x, point3.y, point3.z, 
				   point4.x, point4.y, point4.z, point5.x, point5.y, point5.z, 
				   point6.x, point6.y, point6.z];
	
	ANGLE_STEP = 0.0;

	ZOOM_FACTOR = 1.0;
	
	initVertexBuffers(gl);
	draw(gl);
	
} // defaultScene()

/*********************************************************************/

function randomGenerator(min, max) {
	
	return Math.random() * (max - min) + min;
	
} // randomGenerator()
