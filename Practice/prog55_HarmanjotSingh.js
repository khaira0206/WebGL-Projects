//  prog5_HarmanjotSingh.js:  3D Solar System
//  Harmanjot Singh
//  11/15/2016

//  This program displays a kind of solar system 
//  where different objects rotate about the sun and 
//  also about there own axis. Moon's rotation about earth is displayed.
//  Angular velocity of object's may be increased or decreased by button presses.
//  One object shows the spiral motion in the system.
//  Also animation can be paused and resumed.
 
//  This code was adapted from MultiJointModel.js in
//  matsuda/ch09.

//  Vertex shader program

var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 rotate;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position =  u_MvpMatrix  * a_Position;\n' +
	
    // Shading calculation to make the arm look three-dimensional
	
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
    '  vec4 color = vec4(1.0, 0.0, 0.0, 1.0);\n' + // Robot color
    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
    '}\n';

// Fragment shader program

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

"use strict";
//  Global variables:  
//
//  currentAngle = angle from which the whole animation starts
//  pause = true iff animation is inactive
//  restart = true iff animation was paused and restarted since the 
//            previous update
//  tick = rendering function defined in main 
//  speed = speed at whix
var currentAngle = 0.0;
var pause = false;
var restart = false;
var tick = {};
var speed = 1;
var zoom = 20;
var orientation_axis = [];
var location_axis = [];
var r=1;
var xc=0,yc=0,zc=0;
var s=1;
var rotate1;

/******************************************************************************/

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
	var rotate = gl.getUniformLocation(gl.program, 'rotate');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_MvpMatrix || !u_NormalMatrix) {
        console.log('Failed to get the storage location');
        return;
    }

    // Calculate the view projection matrix

    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(60.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(10, 50.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    //  Clear <canvas>
	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //  Define animation function
	
    var ca = 0.0;
    tick = function() {

        //  Update the rotation angle, and draw the pendulum.
		
        currentAngle = animate(currentAngle);

        if (pause) {
            ca = currentAngle;
            return;
        }
        if (!restart) {
            currentAngle = animate(currentAngle);
        } else {
            currentAngle = ca;
            g_last = Date.now();
            restart = false;
        }

        draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, currentAngle,rotate); // Draw the robot arm

        //  Request that the browser call tick
		
        requestAnimationFrame(tick, canvas);
    };
	
    //  Start drawing
	
    tick();
	
} // end of main

var ANGLE_STEP = 50.0; // The increments of rotation angle (degrees)
var S_Angle = 1.0; // The rotation angle of Sun
var M_Angle = 0.0; // The rotation angle of Moon about earth

/******************************************************************************/

function initVertexBuffers(gl) {
	
    // Create a sphere
	
    var SPHERE_DIV = 15;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    var positions = [];
    var indices = [];

    // Generate coordinates
	
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push(si * sj); // X
            positions.push(cj); // Y
            positions.push(ci * sj); // Z
        }
    }

    // Generate indices
	
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
	
    if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
	
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
	
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
}
// end of initVertexBuffers

/******************************************************************************/

function initArrayBuffer(gl, attribute, data, type, num) {
	
    // Create a buffer object
	
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
	
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

// Coordinate transformation matrix

var g_modelMatrix = new Matrix4(),
    g_mvpMatrix = new Matrix4();

/******************************************************************************/
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, currentAngle,rotate) {
	
    // Clear color and depth buffer
	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Draw the Sun
	
   
	//orientation_axis = [1,0.0,0.0,0.0];
	location_axis = [0,0.0,1.0,0.0]
	
	 rotate1 = rotate_Q(currentAngle, location_axis);
	
    drawSphere(gl, n, 3.0, 3.0, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,rotate,rotate1);

	location_axis = [0,1.0,1.0,0.0]
	pushMatrix(g_modelMatrix);

    //Draw next object for spiral motion
	
   g_modelMatrix.translate(1, 8, 0.0);
  var  rotate2 = rotate_Q(currentAngle, location_axis);
  var rotate3 = multiplyQuaternion(rotate2,rotate1);;
     g_modelMatrix.translate(1.0, 0.0, 0.0);
    drawSphere(gl, n, 1.0, 1.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix,rotate,rotate3);

    g_modelMatrix = popMatrix();
    // Save the matrix
	
    
}
// end of draw

/******************************************************************************/

// Array for storing a matrix

var g_matrixStack = [];

// Store the specified matrix to the array

function pushMatrix(m) {
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}
/******************************************************************************/
function popMatrix() {
	
    // Retrieve the matrix from the array
	
    return g_matrixStack.pop();
}

// Coordinate transformation matrix for normals

var g_normalMatrix = new Matrix4();

/******************************************************************************/

// Draw the spheres

function drawSphere(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, rotate, rotate1) {

    pushMatrix(g_modelMatrix); // Save the model matrix


    g_modelMatrix.scale(width, height, depth);
	
    // Calculate the model view project matrix and pass it to u_MvpMatrix
	
    g_mvpMatrix.set(viewProjMatrix);




    g_mvpMatrix.multiply(g_modelMatrix);
	g_mvpMatrix.multiply(rotate1);

    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
	//gl.uniformMatrix4fv(rotate, false, rotate1);
	
    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
	
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
	
    // Draw
	
    gl.drawElements(gl.TRIANGLES, 2 * n, gl.UNSIGNED_BYTE, 0);
    g_modelMatrix = popMatrix(); // Retrieve the model matrix
}

// end of drawSphere

//  Global variable:  g_last = last time that animate was called
var g_last = Date.now();

/******************************************************************************/

function animate(angle) {

    // Calculate the elapsed time

    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    // Update the current rotation angle (adjusted by the elapsed time)

    newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    M_Angle = (M_Angle - ANGLE_STEP) % 360;

    return newAngle;
}
// Button functions

/******************************************************************************/
function stop() {
    pause = true;
}
/******************************************************************************/
function resume() {
    if (!pause) {
        return;
    }
    pause = false;
    restart = true;
    tick();
}
/******************************************************************************/
function fast() {
    speed = 30;
}
/******************************************************************************/
function slow() {
    speed = 1;
}
/******************************************************************************/
function medium() {
    speed = 15;
}

function zoomin() {
    zoom = zoom - 5;
}
function zoomout() {
    zoom = zoom +5;
}

function to_quat(S_Angle, x1,y1,z1)
{
	var  w = S_Angle, x = x1, y = y1, z = z1;
    var  out = [];
	var  half_angle = (S_Angle * 0.5) * 3.14159 / 180.0;
	
	out[0] = Math.cos(half_angle);
    out[1] = x * Math.sin(half_angle);
    out[2] = y * Math.sin(half_angle);
    out[3] = z * Math.sin(half_angle);
	
    return out;
	
}

function rotate_Q(S_Angle, orientation_axis)
{
	 var out1 = normalize(to_quat(1,0,0,0));
	 
	 var w = S_Angle, x = orientation_axis[0], y = orientation_axis[1], z = orientation_axis[2];
	 var out2 = to_quat(w,x,y,z);
	 var out2c = conjugate(out2);
	 var out3 = multiplyQuaternion(out1,out2c);
	 var out4 = multiplyQuaternion(out2,out3);
	 
	 return out4;
	
}

function multiplyQuaternion(a, b) {
    var w = a[0], x = a[1], y = a[2], z = a[3],
        W = b[0], X = b[1], Y = b[2], Z = b[3],
        out = [];

    out[0] = w*W - x*X - y*Y - z*Z;
    out[1] = w*X + x*W + y*Z - z*Y;
    out[2] = w*Y - x*Z + y*W + z*X;
    out[3] = w*Z + x*Y - y*X + z*W;
    var out4 = quaternionToMatrix(out);
    return out4;
}

function quaternionToMatrix(a) {
    var w = a[0], x = a[1], y = a[2], z = a[3],
        wx = w * x * 2, wy = w * y * 2, wz = w * z * 2,
        xy = x * y * 2, xz = x * z * 2, yz = y * z * 2,
        out = [];

    w = w * w * 2;
    x = x * x * 2;
    y = y * y * 2;
    z = z * z * 2;

    out = [
        1 - y - z,   xy + wz,   xz - wy, 0,
          xy - wz, 1 - x - z,   yz + wx, 0,
          xz + wy,   yz - wx, 1 - x - y, 0,
                0,         0,         0, 1
    ];

    return out;
}

function conjugate(q)
{
 var  norm = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
  
  q[0] = -q[0] / norm;
   q[1] = -q[1] / norm;
    q[2] = -q[2] / norm;
	 q[3] = -q[3] / norm;

  return q;
}

function normalize(q)
{
 var  norm = Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2] + q[3]*q[3]);
  
  q[0] = q[0] / norm;
   q[1] = q[1] / norm;
    q[2] = q[2] / norm;
	 q[3] = q[3] / norm;

  return q;
}