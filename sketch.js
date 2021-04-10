/**
 * For more information see:
 *  - https://bilimneguzellan.net/en/purrier-series-meow-and-making-images-speak/
 *  - https://betterexplained.com/articles/an-interactive-guide-to-the-fourier-transform/
 */

let phi = 0;
let path = []
let fourier = {};

// ui
let scale;
let points;
let fileInput;
let posXInput;
let posYInput;

function handleFile(file) {
  if (file.type == 'image') {
    let data = file.data.split(',');
    let header = data[0];

    if (header != 'data:image/svg+xml;base64') {
      alert("SVG not supported!")
      return;
    }

    // parse SVG and get SVG path
    let base64 = data[1];
    let xml = atob(base64);
    let parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml, "image/svg+xml");
    let paths = xmlDoc.getElementsByTagName("path");

    // create virtual SVG
    let root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let g = document.createElementNS('http://www.w3.org/2000/svg', "g");
    root.appendChild(g);

    let newPathCoordinates = [];
    for (let i = 0; i < paths.length; i++) {
      let coords = paths[i].getAttributeNode("d").value;
      let path = document.createElementNS('http://www.w3.org/2000/svg', "path");
      path.setAttributeNS(null, 'd', coords);
  
      g.appendChild(path);

      // tranform to coordinates
      const MAX = points.value();
      var len = path.getTotalLength();
      for (let i = 0; i < MAX; i++) {
        var pt = path.getPointAtLength(i * len / (MAX-1));
        newPathCoordinates.push(new Complex(pt.x/scale.value(), -pt.y/scale.value()));

        // console.log("{ x: " + pt.x / scale.value() + ", y: " + -pt.y / scale.value() + " }")
      }
    }

    // reset series
    fourier = dft(newPathCoordinates);
    fourier.sort((a,b) => b.val.amp() - a.val.amp()); // lowest freq is inner circle
    phi = 0;
    path = [];
  }
}

function convertXYtoCplx(drawing) {
  let cplx = [];
  for (let i = 0; i < drawing.length; i+=8) {
      cplx.push(new Complex(drawing[i].x, drawing[i].y));
  }
  return cplx;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(12);

  // UI
  fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
  scale = createInput(5,"number")
  scale.position(400, 10);
  points = createInput(2000,"number")
  points.position(600, 10);
  posXInput = createSlider(0, width, width*0.1);
  posXInput.position(800,5);
  posYInput = createSlider(0, height, height*0.8);
  posYInput.position(800,20);

  // execute dft.
  fourier = dft(convertXYtoCplx(drawing));
  fourier.sort((a,b) => b.val.amp() - a.val.amp()); // lowest freq is inner circle
}

function drawCycles(x, y, series) {
  for (let idx = 0; idx < series.length; idx++) {
    let prevx = x;
    let prevy = y;

    let freq = series[idx].freq;
    let amp = series[idx].val.amp();
    let phase = series[idx].val.phase();

    x += amp * cos(freq * phi + phase);
    y += amp * sin(freq * phi + phase);

    noFill();
    stroke(255, 100);
    ellipse(prevx, prevy, amp * 2);
    stroke(255);
    line(prevx, prevy, x, y);
  }

  return createVector(x, y);
}

function draw() {
  background(0);

  fill(255,255,255);
  text("Scale:", 350, 25);
  text("Points:", 550, 25);

  // draw circles
  path.unshift(drawCycles(posXInput.value(), posYInput.value(), fourier));

  // draw wave
  beginShape();
  noFill();
  for (let idx = 0; idx < path.length; idx++) {
    vertex(path[idx].x, path[idx].y);
  }
  endShape();

  // run time
  const dt = TWO_PI / fourier.length;
  phi += dt;

  // start from beginning
  if (phi > TWO_PI) {
    phi = 0;
    path = [];
  }
}