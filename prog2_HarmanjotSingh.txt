// Harmanjot Singh ,9/28/2016
// At the start of the Fragment and vertex shader programs are delared. In the main fuction it prepares the canvas for drawing
// initialize the shaders and vertexBuffers and then we declare three different model matrices as we have to render three different
// objects. Next we have a tick() function that need to be called regularly, it updates the scene's animation state draws the scene 
// and also arranges for itself to be called again in an appropriate time. initVertexBuffers() function declares the vertices creates 
// the three different buffers for three different objects and associate the shader program with Buffer objects and the draw function
// which is called in the tick() function does the translation and rotation wherever appropriate and renders the objects. Also the
// animate funnction updates the angle w.r.t time.   
//   

// Vertex shader program

var VSHADER_SOURCE = 'attribute vec4 a_Position;\n'
		+ 'uniform mat4 u_ModelMatrix;\n' + 'void main() {\n'
		+ '  gl_Position = u_ModelMatrix * a_Position;\n'
		+ ' gl_PointSize = 10.0;\n' + '}\n';

// Fragment shader program

var FSHADER_SOURCE = 'precision mediump float;\n'
		+ 'uniform vec4 u_FragColor;\n' + 'void main() {\n'
		+ '  gl_FragColor = u_FragColor;\n' + '}\n';

"use strict";

// Rotation angle (degrees/second)

var ANGLE_STEP = 45.0;

var vertexBuffer;
var wireBuffer;
var anchorBuffer;
var u_FragColor;

var bob_v;
var anchor_v;
var wire_v;

var a_Position1;
var a_Position2;
var a_Position3;

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
	
	initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

	// Write the positions of vertices to a vertex shader
	
	initVertexBuffers(gl);

	// Specify the color for clearing <canvas>
	
	gl.clearColor(0, 0, 0, 1);
	
	// Get the storage location of u_FragColor
	
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	
	// Get storage location of u_ModelMatrix
	
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

	// Current rotation angle
	
	var currentAngle = 0.0;
	
	// Model matrix
	
	var modelMatrix_anchor = new Matrix4();
	var modelMatrix_wire = new Matrix4();
	var modelMatrix_bob = new Matrix4();

	// Start drawing

	var tick = function() {
		gl.clear(gl.COLOR_BUFFER_BIT);
		currentAngle = animate(currentAngle); // Update the rotation angle
		draw(gl, 1, currentAngle, modelMatrix_anchor, u_ModelMatrix,
				u_FragColor); // Draws the anchor
		draw(gl, 2, currentAngle, modelMatrix_wire, u_ModelMatrix, u_FragColor); // Draws the wire
		draw(gl, 8, currentAngle, modelMatrix_bob, u_ModelMatrix, u_FragColor); // Draws the bob

		requestAnimationFrame(tick, canvas); // Request that the browser
	};
	tick();// ?calls tick
}

function initVertexBuffers(gl) {
	
	// co-ordinates of the points
	
	bob_v = new Float32Array([ 0.0, 0.0, -0.05, -0.1, 0.05, -0.1, 0.11, 0.0,
			0.05, 0.1, -0.05, 0.1, -0.11, 0.0, -0.05, -0.1 ]);
	anchor_v = new Float32Array([ 0, 0 ]);
	wire_v = new Float32Array([ 0.0, 0.0, 0.8, 0.0 ]);

	// Create a buffer object for anchor and associate it with vertex shaders
	
	anchorBuffer = gl.createBuffer();
	
	// Bind the buffer object to target
	
	gl.bindBuffer(gl.ARRAY_BUFFER, anchorBuffer);
	
	// Write data into the buffer object
	
	gl.bufferData(gl.ARRAY_BUFFER, anchor_v, gl.STATIC_DRAW);
	
	// Assign the buffer object to a_Position variable
	
	a_Position3 = gl.getAttribLocation(gl.program, 'a_Position');
	
	// Enable the assignment to a_Position variable
	
	gl.enableVertexAttribArray(a_Position3);

	// Create a buffer object for bob and associate it with vertex shaders
	
	bobBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bobBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, bob_v, gl.STATIC_DRAW);
	a_Position1 = gl.getAttribLocation(gl.program, 'a_Position');
	gl.enableVertexAttribArray(a_Position1);

	// Create a buffer object for wire and associate it with vertex shaders
	
	wireBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, wire_v, gl.STATIC_DRAW);
	a_Position2 = gl.getAttribLocation(gl.program, 'a_Position');
	gl.enableVertexAttribArray(a_Position2);

}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix, u_FragColor) {

	if (n == 1) {
		
		// Pass the rotation matrix to the vertex shader
		
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.bindBuffer(gl.ARRAY_BUFFER, anchorBuffer);
		gl.vertexAttribPointer(a_Position3, 2, gl.FLOAT, false, 0, 0);

		gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
		
		// Draw the anchor
		
		gl.drawArrays(gl.POINTS, 0, 1);

	}

	if (n == 8) {
		
		// Set the rotation matrix
		
		modelMatrix.setRotate(currentAngle, 0, 0, 1);
		modelMatrix.translate(0.8, 0, 0);
		
		// Pass the rotation matrix to the vertex shader
		
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.bindBuffer(gl.ARRAY_BUFFER, bobBuffer);
		gl.vertexAttribPointer(a_Position1, 2, gl.FLOAT, false, 0, 0);
		gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);
		
		// Draw the bob
		
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

	}

	if (n == 2) {
		
		// Set the rotation matrix
		
		modelMatrix.setRotate(currentAngle, 0, 0, 1);
		
		// Pass the rotation matrix to the vertex shader
		
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
		gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
		gl.vertexAttribPointer(a_Position2, 2, gl.FLOAT, false, 0, 0);
		gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
		
		// Draw the wire
		
		gl.drawArrays(gl.LINES, 0, 2);

	}
}

// Last time that this function was called

var g_last = Date.now();
function animate(angle) {
	
	// Calculate the elapsed time
	
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	
	// Update the current rotation angle (adjusted by the elapsed time)
	
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

function up() {
	ANGLE_STEP += 10;
}

function down() {
	ANGLE_STEP -= 10;
}
