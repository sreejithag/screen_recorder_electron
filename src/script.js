const { desktopCapturer,remote } = require('electron');
const { writeFile } = require('fs');
const {  dialog,Menu } = remote;

let mediaRecorder;
const recordedChunks = [];

//buttons 
const videoElement =  document.querySelector('video');
const startButton =  document.getElementById('start');
const stopButton = document.getElementById('stop');
const videoSelectBtn = document.getElementById('videoSelect')


startButton.onclick = e => {
  mediaRecorder.start();
  startButton.classList.add('is-danger');
  startButton.innerText = 'Recording';
};


stopButton.onclick = e => {
  mediaRecorder.stop();
  stopButton.classList.remove('is-danger');
  stopButton.innerText = 'Start';
};


videoSelectBtn.onclick = getVideoSources;



async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types: ['window','screen']
    });
    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            }
        })
    );

    videoOptionsMenu.popup();

}




async function selectSource(source){
    videoSelectBtn.innerText = source.name;
    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id  
            }
        }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    videoElement.play();

    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e){

    console.log('Video available');
    recordedChunks.push(e.data);

}

async function handleStop(e){
    const blob = new Blob(recordedChunks, {
        type: 'video/webcam; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer())
    
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'save video',
        defaultPath: `vid-${Date.now()}.webm` 
    });
    console.log(filePath);
    writeFile(filePath,buffer, () =>console.log('video saved success') );

}