// GridLock
// Created by Jacob Schein - @jacobschein


window.AudioContext = window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.msAudioContext ||
    window.oAudioContext
const WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight
var NBR_OBJ = 1024 / 10

const gridFactor = Math.floor(Math.sqrt(NBR_OBJ));
NBR_OBJ = gridFactor * gridFactor;

var camRoto = .001;
var camRotoZ = .0008;
var rotoZ = false;
var scaleFact;
var camTick = 0;
var camScale = .02;
var cubes = [],
    minHeight = []
var scene, camera, camControls, clock, renderer
var sphere = {},
    lights = {}
var lastTime = 0;
var curTime;
// Initialization of audio and analyser
if (AudioContext) {
    var audioCtx = new AudioContext()
    var audioBuffer
    var audioSource
    var analyser = audioCtx.createAnalyser()
    var frequencyData = new Uint8Array(analyser.frequencyBinCount)
    var audio = new Audio()
    audio.crossOrigin = "anonymous";
    audio.controls = false
    audio.src = "https://jischein.github.io/zoo.mp3"
    document.body.appendChild(audio)
        // Once the song is playable, the loader disappears and the init function start
    audio.addEventListener('canplay', function() {
        setTimeout(function() {

          document.querySelector('#loader').remove()
          document.querySelector('#loader-tag').remove()
          audioSource = audioCtx.createMediaElementSource(audio)
          audioSource.connect(analyser)
          analyser.connect(audioCtx.destination)
          var elements = document.getElementsByTagName('br')
          while (elements[0]) elements[0].parentNode.removeChild(elements[0])
          audio.play()
          init()
        }, 900);


    })
}

function init() {
    // SCENE with Fog - CAMERA -
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x94D0FF, 0.007)
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000)
    clock = new THREE.Clock()
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(WIDTH, HEIGHT)
    renderer.shadowMap.enabled = true



    for (var j = 0; j < gridFactor; j++) {
        scaleFact = (2 * 75) / gridFactor;
        for (var k = 0; k < gridFactor; k++) {
            ind = (j * gridFactor) + k
            cubes[ind] = {};
            if (Math.random() < 0.5) {
                cubes[ind].geo = new THREE.TetrahedronGeometry(8, 1);
                cubes[ind].mat = new THREE.MeshPhongMaterial({

                    color: 0x94D0FF,

                    shading: THREE.FlatShading,
                    blending: THREE.NormalBlending,
                    // wireframe: true,
                    depthTest: true,
                    transparent: false

                });
            } else {
                minHeight[ind] = randomIntFromInterval(20, 50)
                cubes[ind].geo = new THREE.BoxGeometry(8, minHeight[ind], 8);
                cubes[ind].mat = new THREE.MeshPhongMaterial({

                    color: 0x94D0FF,

                    shading: THREE.FlatShading,
                    blending: THREE.NormalBlending,
                    // wireframe:true,
                    depthTest: true,
                    transparent: false

                });
            }
            cubes[ind] = new THREE.Mesh(cubes[ind].geo, cubes[ind].mat)
            cubes[ind].position.x = -75 + (k * scaleFact) * 1.3;
            console.log(cubes[ind].position.x + " X");
            cubes[ind].position.y = -5
            cubes[ind].position.z = -75 + (j * scaleFact) * 1.3;
            console.log(cubes[ind].position.z + " Z");

            cubes[ind].castShadow = true
            scene.add(cubes[ind])

        }
    }

    // LIGHTS
    lights.spotLight = new THREE.SpotLight(0xffffff, 0.8)
    lights.spotLight.position.set(100, 140, 130)
    lights.spotLight.castShadow = true
    lights.spotLightReverse = new THREE.SpotLight(0x534da7, 0.2)
    lights.spotLightReverse.position.set(-100, 140, -130)
    lights.spotLightReverse.castShadow = true
    scene.add(lights.spotLight)
    scene.add(lights.spotLightReverse)

    // CAMERA POSITION
    camera.position.x = 40
    camera.position.y = 90
    camera.position.z = 45
    camera.lookAt(scene.position)

    document.body.appendChild(renderer.domElement)
    renderer.render(scene, camera)


    window.addEventListener('resize', onWindowResize, false)

    // Start the Render function
    render()
}



function render() {
    // Update the camera with the Three.Clock
    var delta = clock.getDelta()
    analyser.getByteFrequencyData(frequencyData)

    // Make each cube / tetrahedron react to the music with a scale or rotate
    for (var i = 0; i < NBR_OBJ; i++) {
        var meshObj = scene.children[i]
        if ((meshObj instanceof THREE.Mesh) && meshObj.geometry.type == 'TetrahedronGeometry') {
            var percentIdx = i / NBR_OBJ
            var frequencyIdx = Math.floor(1024 * percentIdx)
            meshObj.rotation.x += (frequencyData[0] / frequencyData.length) * .5
            meshObj.rotation.y += (frequencyData[0] / frequencyData.length) * .5
            var moveMent = Math.random()
        } else if ((meshObj instanceof THREE.Mesh) && meshObj.geometry.type == 'BoxGeometry') {
            var percentIdx = i / NBR_OBJ
            var frequencyIdx = Math.floor(1024 * percentIdx)
            meshObj.scale.y = 1 + (frequencyData[frequencyIdx] / frequencyData.length) + .2;
            meshObj.scale.x = 1 + (frequencyData[frequencyIdx] / frequencyData.length) + .2;
            meshObj.scale.z = 1 + (frequencyData[frequencyIdx] / frequencyData.length) + .2;
            document.querySelector('body').style.backgroundColor = "black"
            meshObj.material.color.setHex(0xffffff)


            var moveMent = Math.random()
        }
    }

    camTick += 1;
    if (camTick > 1000) {
        camTick = 0;
    }
    if (camera.position.x <= -50 || camera.position.x > 90) {
        camera.position.x = 75;
        camScale = -((frequencyData[0] / 75) * .25)
    }
    curTime = new Date().getTime() / 1000;

    if (lastTime == 0 || curTime - lastTime >= 5) {
        if (rotoZ) {
            camRotoZ = -camRotoZ;
        }
        camRoto = -camRoto;

        console.log("HI " + lastTime);
        console.log("HI " + curTime);

        if (lastTime == 0) {
            lastTime = new Date().getTime() / 1000;
        } else if (curTime - lastTime >= 0.8) {
            lastTime = curTime;
        }

        if (frequencyData[0] > 205 || camera.position.x > 75 || camera.position.x < -75) {
            rotoZ = !rotoZ;
            console.log(camRoto);
            lastTime = curTime;
            if (camScale < 0) {
                camScale = (frequencyData[0] / 75) * .25;
            } else {
                camScale = -(frequencyData[0] / 75) * .25;
            }
        }
    }

    camera.rotation.x += camRoto;
    // camera.position.y += camRotoZ;
    // camera.position.x += camScale;

    requestAnimationFrame(render)
    renderer.render(scene, camera)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    console.log("HEY " + renderer.getSize());
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
