
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
		+ 'uniform mat4 u_MvpMatrix;\n' + 'void main() {\n'
		+ '  gl_Position = u_MvpMatrix * a_Position;\n'
		+ ' gl_PointSize = 10.0;\n' + '}\n';

// Fragment shader program

var FSHADER_SOURCE = 'precision mediump float;\n'
		+ 'uniform vec4 u_FragColor;\n' + 'void main() {\n'
		+ '  gl_FragColor = u_FragColor;\n' + '}\n';

"use strict";

// Rotation angle (degrees/second)


var position = [];
var pos;	
var dragging = false;

var orient_model = new Orientation(0.0, [1.0, 0.0, 0.0]);
var angle=1;
var opt = {       
    vsf: 1.0                 
    };

var anchorBuffer;
var u_FragColor;


var anchor_v;

  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

var a_Position2;
var a_Position3;

var isPoint = false;
var c1_points =[]; 
var c2_points = [];
var n = 0;
var CP1 =[-0.8,0.0,0.0];
var CP2 =[-0.5,-0.5,0.0];
var CP3 =[-0.3,-0.5,0.0];
var CP4 =[0.0,0.0,0.0];
var CP5 =[0.3,0.5,0.0];
var CP6 =[0.5,-0.5,0.0,];
var CP7 =[0.8,0.6,0.0];
var w_coordinate= [];
var c_coordinate= [];
 

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
	var x=0;
	 x = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
  
	// Write the positions of vertices to a vertex shader
	
	initVertexBuffers(gl);

	// Specify the color for clearing <canvas>
	
	gl.clearColor(0, 0, 0, 1);
	
	// Get the storage location of u_FragColor
	
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	
	// Get storage location of u_ModelMatrix
	
	

	// Current rotation angle
	for(i=0; i<1 ; i++)
	  {
		  
		 w_coordinate.push(CP1[i]);
         w_coordinate.push(CP1[i+1]); 
         w_coordinate.push(CP1[i+2]); 
		 
         w_coordinate.push(CP2[i]);
         w_coordinate.push(CP2[i+1]); 
         w_coordinate.push(CP2[i+2]);

         w_coordinate.push(CP3[i]);
         w_coordinate.push(CP3[i+1]); 
         w_coordinate.push(CP3[i+2]);
		 
         w_coordinate.push(CP4[i]);
         w_coordinate.push(CP4[i+1]); 
         w_coordinate.push(CP4[i+2]);
		 
         w_coordinate.push(CP5[i]);
         w_coordinate.push(CP5[i+1]); 
         w_coordinate.push(CP5[i+2]);
		 
         w_coordinate.push(CP6[i]);
         w_coordinate.push(CP6[i+1]); 
         w_coordinate.push(CP6[i+2]);
		 
		 w_coordinate.push(CP7[i]);
         w_coordinate.push(CP7[i+1]); 
         w_coordinate.push(CP7[i+2]);
		  console.log(w_coordinate);
	  }
	
	
	// Model matrix
	 
	
	
	
	// Start drawing canvas.onmousedown = handleMouseDown;
    

   gl.clear(gl.COLOR_BUFFER_BIT);
	
		
		// Update the rotation angle
		
		
		draw(gl, modelMatrix_anchor,x); // Draws the anchor
		
		document.onkeydown = function(ev){ keydown(gl, ev); };
   initMouseEvents(gl,canvas);
	
		
		
		//requestAnimationFrame(tick, canvas); // Request that the browser
	
	// ?calls tick
}
var g_mvpMatrix = new Matrix4();
var modelMatrix_anchor = new Matrix4();
function initVertexBuffers(gl) {
	
	// co-ordinates of the points
	
	
	anchor_v = new Float32Array([ 0, 0 ]);
	
	
	for(i =0; i < 1; i+=0.01){
			
		c1_points[n]= new Array(2);
		c1_points[n] = cubicBezierPoint(CP1,CP2,CP3,CP4,i);
		position.push(c1_points[n][0]);
		position.push(c1_points[n][1]);
		n++;
		}
		
		var position2 = [];
	
	anchor_v2 = new Float32Array([ 0, 0 ]);
	
	
	for(i =0; i < 1; i+=0.01){
			
		c2_points[n]= new Array(2);
		c2_points[n] = cubicBezierPoint(CP4,CP5,CP6,CP7,i);
		position.push(c2_points[n][0]);
		position.push(c2_points[n][1]);
		n++;
		}
		n=0;
		var position3 =[];
 
	
	
	return n;

}

function draw(gl, modelMatrix,n) {
	
	var projMatrix = new Matrix4();
    var r = 1;
    var vsf = opt.vsf;
        projMatrix.setFrustum(-vsf*r, vsf*r, -vsf*r, vsf*r, 2.0*r, 4.0*r);
		
    var mvMatrix = new Matrix4();
    
    modelMatrix.translate(0.0, 0.0, -3.0*r);
    modelMatrix.rotate(orient_model.angle, orient_model.axis[0], 
                    orient_model.axis[1], orient_model.axis[2]);
	
	var mvpMatrix = new Matrix4();
    mvpMatrix.set(projMatrix);
    mvpMatrix.multiply(modelMatrix);
    
	
	  gl.clear(gl.COLOR_BUFFER_BIT);
	  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	  gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
	 gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements); 

	anchorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, anchorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(w_coordinate), gl.STATIC_DRAW);
	a_Position3 = gl.getAttribLocation(gl.program, 'a_Position');
	gl.enableVertexAttribArray(a_Position3);

	gl.vertexAttribPointer(a_Position3, 3, gl.FLOAT, false, 0, 0);
	
	gl.drawArrays(gl.POINTS, 0, 7);

	wireBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
	a_Position2 = gl.getAttribLocation(gl.program, 'a_Position');
	gl.enableVertexAttribArray(a_Position2);
		
		// Pass the rotation matrix to the vertex shader
		
		

	    gl.bindBuffer(gl.ARRAY_BUFFER, wireBuffer);
		gl.vertexAttribPointer(a_Position2, 2, gl.FLOAT, false, 0, 0);
		
		
		// Draw the wire
		
		gl.drawArrays(gl.LINE_STRIP, 0, 200);
	
}

// Last time that this function was called





function cubicBezierPoint( CP1,  CP2,  CP3,  CP4,  t)
{
	var c_point =[];
 c_point[0] = Math.pow(1-t, 3) * CP1[0] + 3* Math.pow(1-t, 2) * t * CP2[0] + 3*(1-t) * Math.pow(t, 2) * CP3[0] + Math.pow(t, 3) * CP4[0];
 c_point[1] = Math.pow(1-t, 3) * CP1[1] + 3* Math.pow(1-t, 2) * t * CP2[1] + 3*(1-t) * Math.pow(t, 2) * CP3[1] + Math.pow(t, 3) * CP4[1];
 c_point[2] = Math.pow(1-t, 3) * CP1[1] + 3* Math.pow(1-t, 2) * t * CP2[1] + 3*(1-t) * Math.pow(t, 2) * CP3[1] + Math.pow(t, 3) * CP4[1];
return c_point;
}
function initMouseEvents(gl,canvas)
{
	
	var w = canvas.width;
	var h = canvas.height;
		
canvas.onmousedown = function(ev) {   // Mouse is pressed
    var m_x = ev.clientX, m_y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
	
	
    if (rect.left <= m_x && m_x < rect.right && rect.top <= m_y && m_y < rect.bottom) {
      // If pressed position is inside <canvas>, check if it is above object
	  
	  m_x = (m_x - rect.left)/(rect.right-rect.left)*w;
	  m_y = (m_y - rect.top)/(rect.bottom -rect.top)*h;
	  
	  w_coordinate = [];
	  c_coordinate = [];
	  v_coordinate = [];
	  for(i=0; i<1 ; i++)
	  {
		  
		 w_coordinate.push(CP1[i]);
         w_coordinate.push(CP1[i+1]); 
         w_coordinate.push(CP1[i+2]); 
		 
         w_coordinate.push(CP2[i]);
         w_coordinate.push(CP2[i+1]); 
         w_coordinate.push(CP2[i+2]);

         w_coordinate.push(CP3[i]);
         w_coordinate.push(CP3[i+1]); 
         w_coordinate.push(CP3[i+2]);
		 
         w_coordinate.push(CP4[i]);
         w_coordinate.push(CP4[i+1]); 
         w_coordinate.push(CP4[i+2]);
		 
         w_coordinate.push(CP5[i]);
         w_coordinate.push(CP5[i+1]); 
         w_coordinate.push(CP5[i+2]);
		 
         w_coordinate.push(CP6[i]);
         w_coordinate.push(CP6[i+1]); 
         w_coordinate.push(CP6[i+2]);
		 
		 w_coordinate.push(CP7[i]);
         w_coordinate.push(CP7[i+1]); 
         w_coordinate.push(CP7[i+2]);
		  //console.log(w_coordinate);
	  }
	   for(i=0; i<21 ; i=i+3){
	  
	    var x_v = w_coordinate[i];
	    var y_v = w_coordinate[i+1];
	    var z_v = w_coordinate[i+2];
	   var src=[];
	   src.push(x_v);
	   src.push(y_v);
	   src.push(z_v);
	   src.push(1);
	     var w_vec = new Vector4(src);
		 src=[];
		// console.log(w_vec);
		w_vec= g_mvpMatrix.multiplyVector4(w_vec);
		//console.log(w_vec);
		c_coordinate.push(w_vec.elements[0]);
		c_coordinate.push(w_vec.elements[1]);
		c_coordinate.push(w_vec.elements[2]);
		
		var x_v = ((c_coordinate[i] +1)/2)*w;
	    var y_v = ((1 - c_coordinate[i+1])/2)*h;
	    var z_v = c_coordinate[i+2];
		
		v_coordinate.push(x_v);
		v_coordinate.push(y_v);
		v_coordinate.push(z_v);
		
	  
	   
	   }
	   
	   for(i=0; i<21; i=i+3)
	   {
		   var deltaX, deltaY;
		   deltaX = Math.abs(m_x - v_coordinate[i]);
		   deltaY = Math.abs(m_y - v_coordinate[i+1]);
		   
		   if(deltaX < 5 && deltaY < 5)
		   {
			   isPoint =  true;
		       pos = i;
			   dragging = true;
			   break;
		   }
	   }
	   
	  
    }
  };
  
   canvas.onmouseup = function(ev) { dragging = false; };
   
    canvas.onmousemove = function(ev) {
		
		var m_x = ev.clientX, m_y = ev.clientY;
        if (dragging) {
			
			var rect = ev.target.getBoundingClientRect();
					m_x = Math.abs((m_x - rect.left)/(rect.right-rect.left)*w);
	                m_y = Math.abs((m_y - rect.top)/(rect.bottom -rect.top)*h);
					var x_c;
					var y_c;
					var z_c;
					
					x_c = (2*m_x)/w -1;
					y_c = 1-(2*m_y)/h;
					z_c = w_coordinate[pos+2];
					g_mvpMatrix.setInverseOf(g_mvpMatrix);
					
					var src=[];
	                src.push(x_c);
	                src.push(y_c);
	                src.push(z_c);
	                src.push(1);
	                var w_vec1 = new Vector4(src);
					src=[];
		             console.log(w_vec1);
		            w_vec1= g_mvpMatrix.multiplyVector4(w_vec1);
			
			if(isPoint){
				if(pos ==6 || pos ==12){
					
					var displacementX = w_vec1.elements[0] - w_coordinate[pos] ;
					var displacementY = w_vec1.elements[1] - w_coordinate[pos+1];
					
					w_coordinate[pos] = w_vec1.elements[0];
					w_coordinate[pos+1] = w_vec1.elements[1];
					
					w_coordinate[9] = w_coordinate[9] + displacementX/2;
					w_coordinate[10] = w_coordinate[10] + displacementY/2;
					
				}
				else if(pos == 9)
				{
					var displacementX = w_vec1.elements[0] - w_coordinate[pos] ;
					var displacementY = w_vec1.elements[1] - w_coordinate[pos+1];
					
					w_coordinate[pos] = w_vec1.elements[0];
					w_coordinate[pos+1] = w_vec1.elements[1];
					
					w_coordinate[6] = w_coordinate[6] + displacementX;
					w_coordinate[7] = w_coordinate[7] + displacementY;
					
					w_coordinate[12] = w_coordinate[12] + displacementX;
					w_coordinate[13] = w_coordinate[13] + displacementY;
				}
				else{
				
					w_coordinate[pos] = w_vec1.elements[0];
					w_coordinate[pos+1] = w_vec1.elements[1];
					w_coordinate[pos+2] = w_vec1.elements[2];
					
				}
				
			}
			for(i=0; i<1; i++)
			{
				CP1[i]   = w_coordinate[i];
				CP1[i+1] = w_coordinate[i+1];
				CP1[i+2] = w_coordinate[i+2];
				
				CP2[i]   = w_coordinate[i+3];
				CP2[i+1] = w_coordinate[i+4];
				CP2[i+2] = w_coordinate[i+5];
				
				CP3[i]   = w_coordinate[i+6];
				CP3[i+1] = w_coordinate[i+7];
				CP3[i+2] = w_coordinate[i+8];
				
				CP4[i]   = w_coordinate[i+9];
				CP4[i+1] = w_coordinate[i+10];
				CP4[i+2] = w_coordinate[i+11];
				
				CP5[i]   = w_coordinate[i+12];
				CP5[i+1] = w_coordinate[i+13];
				CP5[i+2] = w_coordinate[i+14];
				
				CP6[i]   = w_coordinate[i+15];
				CP6[i+1] = w_coordinate[i+16];
				CP6[i+2] = w_coordinate[i+17];
				
				CP7[i]   = w_coordinate[i+18];
				CP7[i+1] = w_coordinate[i+19];
				CP7[i+2] = w_coordinate[i+20];
				
				
				
			}
			position = [];
			for(i =0; i < 1; i+=0.01){
			
		c1_points[n]= new Array(2);
		c1_points[n] = cubicBezierPoint(CP1,CP2,CP3,CP4,i);
		position.push(c1_points[n][0]);
		position.push(c1_points[n][1]);
		
		
					//console.log(CP1[i+1]);
					//console.log(CP1[i+2]);
		n++;
		}
		
	
	anchor_v2 = new Float32Array([ 0, 0 ]);
	
	
	for(i =0; i < 1; i+=0.01){
			
		c2_points[n]= new Array(2);
		c2_points[n] = cubicBezierPoint(CP4,CP5,CP6,CP7,i);
		position.push(c2_points[n][0]);
		position.push(c2_points[n][1]);
		n++;
		}
		n=0;
		
draw(gl, modelMatrix_anchor,n);		
			
		}
		
	};
	
}
function keydown(gl, event) {
	var ad2, cd, cfac, code, mstep, sd, xstep, ystep, zstep;
    var q = [];
    var r = [];

    cfac = Math.PI / 180.0;  // Degrees to radians conversion factor
    mstep = 3.0 * cfac;   
switch (event.keyCode) {
	case 37:                  // Left arrow:  y axis, increase
            ad2 = mstep / 2.0;
            if (event.shiftKey) { ad2 = 5.0 * ad2; }
            cd = Math.cos(ad2);
            sd = Math.sin(ad2);
            q = orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle mstep or 5*mstep and axis [0, 1, 0].

            r[0] = cd*q[0] - sd*q[2];
            r[1] = cd*q[1] + sd*q[3];
            r[2] = cd*q[2] + sd*q[0];
            r[3] = cd*q[3] - sd*q[1];
            orient_model.fromQuaternion(r);
            break;

        case 38:                  // Up arrow:  x axis, increase
            ad2 = mstep / 2.0;
            if (event.shiftKey) { ad2 = 5.0 * ad2; }
            cd = Math.cos(ad2);
            sd = Math.sin(ad2);
            q = orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle mstep or 5*mstep and axis [1, 0, 0].

            r[0] = cd*q[0] - sd*q[1];
            r[1] = cd*q[1] + sd*q[0];
            r[2] = cd*q[2] - sd*q[3];
            r[3] = cd*q[3] + sd*q[2];
            orient_model.fromQuaternion(r);
            break;

        case 39:                  // Right arrow:  y axis, decrease
            ad2 = -mstep / 2.0;
            if (event.shiftKey) { ad2 = 5.0 * ad2; }
            cd = Math.cos(ad2);
            sd = Math.sin(ad2);
            q = orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle -mstep or -5*mstep and axis [0, 1, 0].

            r[0] = cd*q[0] - sd*q[2];
            r[1] = cd*q[1] + sd*q[3];
            r[2] = cd*q[2] + sd*q[0];
            r[3] = cd*q[3] - sd*q[1];
            orient_model.fromQuaternion(r);
            break;

        case 40:                  // Down arrow:  x axis, decrease
            ad2 = -mstep / 2.0;
            if (event.shiftKey) { ad2 = 5.0 * ad2; }
            cd = Math.cos(ad2);
            sd = Math.sin(ad2);
            q = orient_model.toQuaternion();

//  Compute r = p*q, where p is the unit quaternion equivalent of
//  angle -mstep or -5*mstep and axis [1, 0, 0].

            r[0] = cd*q[0] - sd*q[1];
            r[1] = cd*q[1] + sd*q[0];
            r[2] = cd*q[2] - sd*q[3];
            r[3] = cd*q[3] + sd*q[2];
            orient_model.fromQuaternion(r);
            break;

case 188:                 // <:  Zoom out
            opt.vsf *= 0.8;
            break;

        case 190:                 // >:  Zoom in
            opt.vsf *= 1.2;
            break;
			
			default:
            return;
}
}
/******************************************************************************/
function Orientation(angle, axis) {

//  Prototype constructor for an orientation defined by an angle and axis.

    this.angle = angle;                  // Angle in degrees
    this.axis = axis;                    // Unit vector
    this.toQuaternion = function() {

//  Convert from angle/axis to unit quaternion.

        var cfac = Math.PI / 180.0;
        var ad2 = cfac * this.angle / 2.0;
        var ca = Math.cos(ad2);
        var sa = Math.sin(ad2);
        return [ ca, sa * this.axis[0], sa * this.axis[1],
                 sa * this.axis[2] ];
    };

    this.fromQuaternion = function(q) {

//  Set properties to the angle/axis equivalent of unit quaternion q.

        var cfac = Math.PI / 180.0;
        this.angle = 2.0 * Math.acos(q[0]) / cfac;
        var un = Math.sqrt(q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        if (un > 0) {
            this.axis[0] = q[1] / un;
            this.axis[1] = q[2] / un;
            this.axis[2] = q[3] / un;
        }
        return;
    };
}