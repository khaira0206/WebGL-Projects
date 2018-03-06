//  prog4_HarmanjotSingh.js
//  Harmanjot Singh
//  10/12/2016

//  This program displays the graph of a bivariate function 
//  z = f(x,y) for (x,y) in D = [0,1] X [0,1] partition D into a k+1 by k+1 uniform rectangular grid, and
//  partition each of the k*k squares into a pair of triangles. Then call f to obtain a z value at each
//  of the (k+1)^2 grid points. Uses Gouraud shading and lighting. vertex normal must be computed by averaging the
//  normals of the triangular faces that share the vertex

//  This code was adapted from MultiJointModel.js in
//  matsuda/ch09.

//  Vertex shader program

var VSHADER_SOURCE = 'attribute vec4 a_Position;\n'
		+ 'attribute vec4 a_Normal;\n' + 'uniform mat4 u_MvpMatrix;\n'
		+ 'uniform mat4 u_NormalMatrix;\n' + 'varying vec4 v_Color;\n'
		+ 'void main() {\n' + '  gl_Position = u_MvpMatrix * a_Position;\n' +

		// Shading calculation to make the graph look three-dimensional

		'  vec3 lightDirection = normalize(vec3(0.0, 0.1, 0.7));\n' + // Light
																		// direction
		'  vec4 color = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Robot color
		'  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n'
		+ '  float nDotL = max(dot(normal, lightDirection), 0.0);\n'
		+ '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' + '}\n';

// Fragment shader program

var FSHADER_SOURCE = '#ifdef GL_ES\n' + 'precision mediump float;\n'
		+ '#endif\n' + 'varying vec4 v_Color;\n' + 'void main() {\n'
		+ '  gl_FragColor = v_Color;\n' + '}\n';

"use strict";
// Global variables:
// sc = for zoom in and zoom out

/** *************************************************************************** */
var sc = 1.0;
function main() {

	// Retrieve <canvas> element

	var canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL

	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders

	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// Set the vertex information

	var n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	// Set the clear color and enable the depth test

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// enabling the depth

	gl.enable(gl.DEPTH_TEST);

	// Get the storage locations of uniform variables

	var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	if (!u_MvpMatrix || !u_NormalMatrix) {
		console.log('Failed to get the storage location');
		return;
	}

	// Calculate the view projection matrix

	var viewProjMatrix = new Matrix4();

	viewProjMatrix.ortho(-1, 1, -1, 1, 1.0, 100.0);
	viewProjMatrix.lookAt(20, 20.0, 20.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

	// Clear <canvas>
	
	document.onkeydown = function(ev) {
		keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
	};
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw the function
	
	draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

} // end of main

/***************************************************************************** */

var ANGLE_STEP = 1.0;   // The increments of rotation angle (degrees)
var r_yaxis = 270.0;    // For rotation about y axis
var r_xaxis = 45.0;     // For rotation about x axis (degrees)

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
	switch (ev.keyCode) {
	case 40: // Up arrow key -> the positive rotation around the z-axis
		if (r_xaxis < 135.0)
			r_xaxis += ANGLE_STEP;
		break;
	case 38: // Down arrow key -> the negative rotation around the z-axis
		if (r_xaxis > -135.0)
			r_xaxis -= ANGLE_STEP;
		break;
	case 39: // Right arrow key -> the positive rotation around the y-axis
		r_yaxis = (r_yaxis + ANGLE_STEP) % 360;
		break;
	case 37: // Left arrow key -> the negative rotation around the y-axis
		r_yaxis = (r_yaxis - ANGLE_STEP) % 360;
		break;
	case 90: // 'z'key -> to zoom out
		sc = sc + 0.1;
		break;
	case 88: // 'x'key -> to zoom in
		sc = sc - 0.1;
		break;

	default:
		return; // Skip drawing at no effective action
	}
	// Draw
	draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

/***************************************************************************** */

function initVertexBuffers(gl) {

	var K = 50;                   // K+1 partition

	var i, j;
	var v = [];                   // Array for vertices
	var vn = [];                  // Array vertex normals
	var indv = 0;
	var position = [];            // For storing the 2-D array of vertics to 1-D array
	var normal = [];              // For storing the 2-D array of normals to 1-D array
	var ltri = [];
	var indt = 0;
	var NV = (K + 1) * (K + 1);   // Number of verices
	var NT = 2 * K * K;           // Number of Triangles
	var val_z;
	var indices = [];             // Indicies corresponding to the triangles

	// Generate coordinates

	var h = 1 / K;

	for (j = 0; j < K + 1; j++) {

		var y = j * h;

		for (i = 0; i < K + 1; i++) {
			v[indv] = new Array(3);
			var x = i * h;

			v[indv][0] = x;
			position.push(v[indv][0]);
			v[indv][1] = y;
			position.push(v[indv][1]);
			v[indv][2] = find_z(x, y);
			position.push(v[indv][2]);
			indv = indv + 1;
		}
	}

	// Generate Indices

	for (j = 1; j < (K + 1); j++) {

		for (i = 1; i < (K + 1); i++) {
			ltri[indt] = new Array(3);
			ltri[indt + 1] = new Array(3);
			indv = j * (K + 1) + i;

			// indv indexes the upper right corner of a cell.
			
			ltri[indt][0] = indv - K - 2;
			indices.push(ltri[indt][0]);
			ltri[indt][1] = indv - K - 1;
			indices.push(ltri[indt][1]);
			ltri[indt][2] = indv;
			indices.push(ltri[indt][2]);

			ltri[indt + 1][0] = indv - K - 2;
			indices.push(ltri[indt + 1][0]);
			ltri[indt + 1][1] = indv;
			indices.push(ltri[indt + 1][1]);
			ltri[indt + 1][2] = indv - 1;
			indices.push(ltri[indt + 1][2]);
			indt = indt + 2;
		}
	}
	// Initializing normals to zero
	
	for (indv = 0; indv < NV; indv++) {
		vn[indv] = new Array(3);
		vn[indv][0] = 0;
		vn[indv][1] = 0;
		vn[indv][2] = 0;

	}

	// Averaging the normals
	
	var i1, i2, i3;

	var tn = [];
	var tn1 = [];

	for (indt = 0; indt < NT - 1; indt++) {

		i1 = ltri[indt][0];
		i2 = ltri[indt][1];
		i3 = ltri[indt][2];

		tn[0] = (v[i2][1] - v[i1][1]) * (v[i3][2] - v[i1][2])
				- (v[i2][2] - v[i1][2]) * (v[i3][1] - v[i1][1]);
		tn[1] = (v[i2][2] - v[i1][2]) * (v[i3][0] - v[i1][0])
				- (v[i2][0] - v[i1][0]) * (v[i3][2] - v[i1][2]);
		tn[2] = (v[i2][0] - v[i1][0]) * (v[i3][1] - v[i1][1])
				- (v[i2][1] - v[i1][1]) * (v[i3][0] - v[i1][0]);

		// normalize
		
		normalit(tn);

		vn[i1][0] += tn[0];
		vn[i1][1] += tn[1];
		vn[i1][2] += tn[2];
		vn[i2][0] += tn[0];
		vn[i2][1] += tn[1];
		vn[i2][2] += tn[2];
		vn[i3][0] += tn[0];
		vn[i3][1] += tn[1];
		vn[i3][2] += tn[2];

	}

	for (indv = 0; indv < NV; indv++) {
		
		// normalize
		
		normalit(vn[indv]);
		normal.push(vn[indv][0]);
		normal.push(vn[indv][1]);
		normal.push(vn[indv][2]);

	}

	// Write the vertex property to buffers (coordinates and normals)
	// Same data can be used for vertex and normal
	// In order to make it intelligible, another buffer is prepared separately

	if (!initArrayBuffer(gl, 'a_Position', new Float32Array(position),
			gl.FLOAT, 3))
		return -1;
	if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normal), gl.FLOAT, 3))
		return -1;

	// Unbind the buffer object

	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Write the indices to the buffer object

	var indexBuffer = gl.createBuffer();
	if (!indexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
			gl.STATIC_DRAW);

	return indices.length;
}
// end of initVertexBuffers

/** *************************************************************************** */
function find_z(x, y) {

	val_z = .5
			* Math.exp(-.04
					* Math.sqrt(Math.pow((80 * x - 40), 2)
							+ Math.pow((90 * y - 45), 2)))
			* Math.cos(0.15 * Math.sqrt(Math.pow((80 * x - 40), 2)
					+ Math.pow((90 * y - 45), 2)));
	return val_z;
}

/** *************************************************************************** */
function initArrayBuffer(gl, attribute, data, type, num) {

	// Create a buffer object

	var buffer = gl.createBuffer();
	if (!buffer) {
		console.log('Failed to create the buffer object');
		return false;
	}
	// Write data into the buffer object

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	// Assign the buffer object to the attribute variable

	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get the storage location of ' + attribute);
		return false;
	}
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

	// Enable the assignment of the buffer object to the attribute variable

	gl.enableVertexAttribArray(a_attribute);

	return true;
}
// end of initArrayBuffer
/** *************************************************************************** */
// Coordinate transformation matrix

var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

/** *************************************************************************** */
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {

	// Clear color and depth buffer

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Translate to the origin
	
	g_modelMatrix.setTranslate(-0.5, -0.5, 0.0);

	// Rotation about y-axis
	
	g_modelMatrix.translate(0.5, 0.5, 0.0);
	g_modelMatrix.rotate(r_xaxis, 0.0, 1.0, 0.0);
	g_modelMatrix.translate(-0.5, -0.5, 0.0);

	// Rotation about x-axis
	
	g_modelMatrix.translate(0.5, 0.5, 0.0);
	g_modelMatrix.rotate(r_yaxis, 1.0, 0.0, 0.0);
	g_modelMatrix.translate(-0.5, -0.5, 0.0);

	// Draw
	drawfunc(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

}

/** *************************************************************************** */

function drawfunc(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
	

	// Calculate the model view project matrix and pass it to u_MvpMatrix
	
	g_mvpMatrix.set(viewProjMatrix);
	g_modelMatrix.scale(sc, sc, sc);

	g_mvpMatrix.multiply(g_modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

	// Calculate the normal transformation matrix and pass it to u_NormalMatrix
	
	g_normalMatrix.setInverseOf(g_modelMatrix);
	g_normalMatrix.transpose();
	gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
	// Draw
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	
}
/** *************************************************************************** */

// normalize function

function normalit(tn) {

	var c = tn[0], d = tn[1], e = tn[2], g = Math.sqrt(c * c + d * d + e * e);

	if (g == 0) {
		return tn;
	} else {
		g = 1 / g;
		tn[0] = c * g;
		tn[1] = d * g;
		tn[2] = e * g;
		return tn;
	}

}
/** *************************************************************************** */
