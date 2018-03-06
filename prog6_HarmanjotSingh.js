//  prog6_HarmanjotSingh.js
//  Harmanjot Singh
//  12/12/2016
//  This program displays two connected bazier curves
//  where the continuity at the joint of the two curves is constrained 
//  by making tangent to both the curves same at that joint. The curve 
//  has 7 control points. By moving the control points the shape of the cuvre can be changed    
"use strict";
/** *************************************************************************** */
// Vertex shader program


var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
    'uniform mat4 u_MvpMatrix;\n' + 'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    ' gl_PointSize = 10.0;\n' + '}\n';

// Fragment shader program

var FSHADER_SOURCE = 'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + '}\n';


/** *************************************************************************** */
// Rotation angle (degrees/second)


var position = [],
    c1_points = [],
    c2_points = [];                   			// Control points array
var pos;                       					  // Which control point is selected
var dragging = false;

var left, right, bottom, topside;													 // Viewing volume
var w, h; 										// Canvas width height
var Scale = 1.0;								 // Zooming factor
var ANGLE_STEP = 0.0;							 // Rotation angle step
var r = 1;
var modelMatrix = new Matrix4(),
    mvpMatrix = new Matrix4();					 // Model matrix and projection Matrix
var u_MvpMatrix, a_Position3;
var pointBuffer;								 // Control point buffer
var wireBuffer; 									// Curve buffer
var u_FragColor;
var m_x, m_y; 														// Mouse points



var canvas;

var isPoint = false;

var n = 0;
// Initial position of control points
var CP1 = [-0.8, 0.0, 0.0];
var CP2 = [-0.5, -0.5, 0.0];
var CP3 = [-0.3, -0.5, 0.0];
var CP4 = [0.0, 0.0, 0.0];
var CP5 = [0.3, 0.5, 0.0];
var CP6 = [0.5, -0.5, 0.0, ];
var CP7 = [0.8, 0.6, 0.0];

var w_coordinate = []; // World co-ordinates array
var c_coordinate = []; // Clip co-ordinates array
var v_coordinate = []; // Viewport co-ordinates array
var gl;

/** *************************************************************************** */

function main() {

    // Retrieve <canvas> element

    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL

    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
	
    var x = 0;
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    // Passing the controll points to 1-D array

    for (var i = 0; i < 1; i++) {

        w_coordinate.push(CP1[i]);
        w_coordinate.push(CP1[i + 1]);
        w_coordinate.push(CP1[i + 2]);

        w_coordinate.push(CP2[i]);
        w_coordinate.push(CP2[i + 1]);
        w_coordinate.push(CP2[i + 2]);

        w_coordinate.push(CP3[i]);
        w_coordinate.push(CP3[i + 1]);
        w_coordinate.push(CP3[i + 2]);

        w_coordinate.push(CP4[i]);
        w_coordinate.push(CP4[i + 1]);
        w_coordinate.push(CP4[i + 2]);

        w_coordinate.push(CP5[i]);
        w_coordinate.push(CP5[i + 1]);
        w_coordinate.push(CP5[i + 2]);

        w_coordinate.push(CP6[i]);
        w_coordinate.push(CP6[i + 1]);
        w_coordinate.push(CP6[i + 2]);

        w_coordinate.push(CP7[i]);
        w_coordinate.push(CP7[i + 1]);
        w_coordinate.push(CP7[i + 2]);
        console.log(w_coordinate);
    }



    // Get the storage location of a_Position
	
    a_Position3 = gl.getAttribLocation(gl.program, 'a_Position');
	
    // Get the storage location of u_MvpMatrix
	
    u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	
    // Get the storage location of u_FragColor
	
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    // Create buffers
	
    pointBuffer = gl.createBuffer();
    wireBuffer = gl.createBuffer();
    x = initVertexBuffers(gl);

    draw(gl, x); // Draws 


    w = canvas.width;
    h = canvas.height;


    document.onkeydown = function(ev) {
        keyHandler(ev, gl, x);
    };

    canvas.onmousedown = function(ev) { // Mouse is pressed

        var rect = ev.target.getBoundingClientRect();

        for (var i = 0; i < 21; i = i + 3) {

            var deltaX, deltaY;
            deltaX = Math.abs(m_x - v_coordinate[i]);
            deltaY = Math.abs(m_y - v_coordinate[i + 1]);

            // Finding which point got selected by mouse event
			
            if (deltaX < 5 && deltaY < 5) {

                // Point selected having position 'pos'

                pos = i;
                dragging = true;
                break;

            }
        }

    };

    canvas.onmouseup = function(ev) {				 // Mouse is released


        dragging = false;

    };

    canvas.onmousemove = function(ev) {				 // Mouse is moving

        m_x = ev.clientX;
        m_y = ev.clientY;

        var rect = ev.target.getBoundingClientRect();

        m_x = Math.abs((m_x - rect.left) / (rect.right - rect.left) * w);
        m_y = Math.abs((m_y - rect.top) / (rect.bottom - rect.top) * h);
        var x_c;
        var y_c;
        var z_c;

        x_c = (2 * m_x) / w - 1;
        y_c = 1 - (2 * m_y) / h;
        z_c = w_coordinate[pos + 2];

        if (dragging) {
            updatecurve(ev);

        }

    };


} // End of main()

/** *************************************************************************** */

// Updating the curve after changing the postion of control points

function updatecurve(ev) {
	
    m_x = ev.clientX;
    m_y = ev.clientY;
	
    // Transforming mouse coordinate ---> clip coordinate --> world coordinates
	
    var rect = ev.target.getBoundingClientRect();
    m_x = (m_x - rect.left) / (rect.right - rect.left) * w;
    m_y = (m_y - rect.top) / (rect.bottom - rect.top) * h;



    var x_c;
    var y_c;
    var z_c;
    v_coordinate[pos] = m_x;
    v_coordinate[pos + 1] = m_y;


    x_c = (2 * m_x) / w - 1;
    y_c = 1 - (2 * m_y) / h;
    z_c = w_coordinate[pos + 2];

    c_coordinate[pos] = x_c;
    c_coordinate[pos + 1] = y_c;


    var src = [];
    src.push(c_coordinate[pos]);
    src.push(c_coordinate[pos + 1]);
    src.push(c_coordinate[pos + 2]);
    src.push(1);
    var w_vec1 = new Vector4(src);
    src = [];

    w_vec1 = mvpMatrix.multiplyVector4(w_vec1);


    if (pos == 6 || pos == 12) {

        var displacementX = w_vec1.elements[0] - w_coordinate[pos];
        var displacementY = w_vec1.elements[1] - w_coordinate[pos + 1];

        w_coordinate[pos] = w_vec1.elements[0];
        w_coordinate[pos + 1] = w_vec1.elements[1];

        w_coordinate[9] = w_coordinate[9] + displacementX / 2;
        w_coordinate[10] = w_coordinate[10] + displacementY / 2;

    } else if (pos == 9) {
        var displacementX = w_vec1.elements[0] - w_coordinate[pos];
        var displacementY = w_vec1.elements[1] - w_coordinate[pos + 1];

        w_coordinate[pos] = w_vec1.elements[0];
        w_coordinate[pos + 1] = w_vec1.elements[1];

        w_coordinate[6] = w_coordinate[6] + displacementX;
        w_coordinate[7] = w_coordinate[7] + displacementY;

        w_coordinate[12] = w_coordinate[12] + displacementX;
        w_coordinate[13] = w_coordinate[13] + displacementY;
    } else {

        w_coordinate[pos] = w_vec1.elements[0];
        w_coordinate[pos + 1] = w_vec1.elements[1];


    }


    for (var i = 0; i < 1; i++) {
        CP1[i] = w_coordinate[i];
        CP1[i + 1] = w_coordinate[i + 1];
        CP1[i + 2] = w_coordinate[i + 2];

        CP2[i] = w_coordinate[i + 3];
        CP2[i + 1] = w_coordinate[i + 4];
        CP2[i + 2] = w_coordinate[i + 5];

        CP3[i] = w_coordinate[i + 6];
        CP3[i + 1] = w_coordinate[i + 7];
        CP3[i + 2] = w_coordinate[i + 8];

        CP4[i] = w_coordinate[i + 9];
        CP4[i + 1] = w_coordinate[i + 10];
        CP4[i + 2] = w_coordinate[i + 11];

        CP5[i] = w_coordinate[i + 12];
        CP5[i + 1] = w_coordinate[i + 13];
        CP5[i + 2] = w_coordinate[i + 14];

        CP6[i] = w_coordinate[i + 15];
        CP6[i + 1] = w_coordinate[i + 16];
        CP6[i + 2] = w_coordinate[i + 17];

        CP7[i] = w_coordinate[i + 18];
        CP7[i + 1] = w_coordinate[i + 19];
        CP7[i + 2] = w_coordinate[i + 20];



    }
    position = [];
    n = 0;
    for (var i = 0; i <= 1; i += 1.0 / 30.0) {

        c1_points[n] = new Array(2);
        c1_points[n] = cubicBezierPoint(CP1, CP2, CP3, CP4, i);
        position.push(c1_points[n][0]);
        position.push(c1_points[n][1]);

        n++;
    }

    for (var i = 0; i <= 1; i += 1.0 / 30.0) {

        c2_points[n] = new Array(2);
        c2_points[n] = cubicBezierPoint(CP4, CP5, CP6, CP7, i);
        position.push(c2_points[n][0]);
        position.push(c2_points[n][1]);
        n++;
    }

    initVertexBuffers(gl);
    draw(gl, n);

}

/** *************************************************************************** */

function initVertexBuffers(gl) {


    // Specify the color for clearing <canvas>
	
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	
    // enabling the depth
	
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	
    // Write the control point coordinates to buffer array 
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(w_coordinate), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position3, 3, gl.FLOAT, false, 0, 0);
	
    // Enable the assignment of the buffer object to the attribute variable
	
    gl.enableVertexAttribArray(a_Position3);

    n = 0;

    for (var i = 0; i <= 1; i += 1.0 / 30.0) {

        c1_points[n] = new Array(2);
        c1_points[n] = cubicBezierPoint(CP1, CP2, CP3, CP4, i);
        position.push(c1_points[n][0]);
        position.push(c1_points[n][1]);
        n++;
    }




    for (var i = 0; i <= 1; i += 1.0 / 30.0) {

        c2_points[n] = new Array(2);
        c2_points[n] = cubicBezierPoint(CP4, CP5, CP6, CP7, i);
        position.push(c2_points[n][0]);
        position.push(c2_points[n][1]);
        n++;
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
	
    // Write the curve coordinates to buffer array 
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position3, 3, gl.FLOAT, false, 0, 0);
	
    // Enable the assignment of the buffer object to the attribute variable
	
    gl.enableVertexAttribArray(a_Position3);


    return n;

} // end of initVertexBuffers

/** *************************************************************************** */

function draw(gl, n) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    modelMatrix.setRotate(ANGLE_STEP, 0.0, 1.0, 0.0);
    modelMatrix.rotate(ANGLE_STEP, 0.0, 1.0, 0.0);

    left = bottom = 0 - Scale * r;
    right = topside = 0 + Scale * r;
	
    // Calculate the view projection matrix
	
    mvpMatrix.setOrtho(left, right, bottom, topside, -30, 30);

    mvpMatrix.multiply(modelMatrix);



    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    c_coordinate = [];

    var tempVec = new Vector4();
    var x, y, z;

    for (var i = 0; i < 21; i += 3) {
        x = w_coordinate[i];
        y = w_coordinate[i + 1];
        z = w_coordinate[i + 2];
        tempVec = new Vector4([x, y, z, 1]);
        tempVec = mvpMatrix.multiplyVector4(tempVec);
        c_coordinate.push(tempVec.elements[0]);
        c_coordinate.push(tempVec.elements[1]);
        c_coordinate.push(tempVec.elements[2]);

    }


    v_coordinate = [];

    for (var i = 0; i < 21; i += 3) {

        x = (c_coordinate[i] + 1.0) / 2.0 * canvas.width;
        y = (1.0 - c_coordinate[i + 1]) / 2.0 * canvas.height;
        z = c_coordinate[i + 2];

        v_coordinate.push(x);
        v_coordinate.push(y);
        v_coordinate.push(z);
    }
	
    // Invert the veiw projection Matrix
	
    mvpMatrix.invert();

    // Specify the color for points
	
    gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);

    gl.vertexAttribPointer(a_Position3, 3, gl.FLOAT, false, 0, 0);
	
    // Enable the assignment of the buffer object to the attribute variable
	
    gl.enableVertexAttribArray(a_Position3);
	// Draw Control Points
    gl.drawArrays(gl.POINTS, 0, 7);


    gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);

    gl.vertexAttribPointer(a_Position3, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_Position3);


    gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
    gl.vertexAttribPointer(a_Position3, 2, gl.FLOAT, false, 0, 0);


    // Draw the curve

    gl.drawArrays(gl.LINE_STRIP, 0, n);

} // End of Draw




/** *************************************************************************** */
// Function genrating points on the curve
function cubicBezierPoint(CP1, CP2, CP3, CP4, t) {
    var c_point = [];
    c_point[0] = Math.pow(1 - t, 3) * CP1[0] + 3 * Math.pow(1 - t, 2) * t * CP2[0] + 3 * (1 - t) * Math.pow(t, 2) * CP3[0] + Math.pow(t, 3) * CP4[0];
    c_point[1] = Math.pow(1 - t, 3) * CP1[1] + 3 * Math.pow(1 - t, 2) * t * CP2[1] + 3 * (1 - t) * Math.pow(t, 2) * CP3[1] + Math.pow(t, 3) * CP4[1];
    c_point[2] = Math.pow(1 - t, 3) * CP1[1] + 3 * Math.pow(1 - t, 2) * t * CP2[1] + 3 * (1 - t) * Math.pow(t, 2) * CP3[1] + Math.pow(t, 3) * CP4[1];
    return c_point;
}

/** *************************************************************************** */
function keyHandler(ev, gl) {

    gl.clear(gl.COLOR_BUFFER_BIT);

    switch (ev.keyCode) {

        case 37: // if 'left arrow' is pressed
            ANGLE_STEP += 1.0; // rotate anti clockwise
            break;

        case 39: // if 'right arrow' is pressed
            ANGLE_STEP -= 1.0; // rotate clockwise
            break;

        case 40: // if 'down arrow' is pressed			
            Scale += 0.01; // zoom out
            break;

        case 38: // if 'up arrow' is pressed			
            Scale -= 0.01; // zoom in
            break;

        default:
            break;
    }

    var x = initVertexBuffers(gl);
    draw(gl, x);

}
/** *************************************************************************** */