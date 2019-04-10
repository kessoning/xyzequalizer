// Audio
let audioCtx;
let analyser;

let bufferLength;
let dataArray = [];
let frequencies = [];

let source;

let meter;

// success callback when requesting audio input stream
const gotStream = function(stream) {
    //window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new(window.AudioContext || window.webkitAudioContext)();;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    frequencies = new Uint8Array(analyser.frequencyBinCount);

    // Create an AudioNode from the stream.
    source = audioCtx.createMediaStreamSource(stream);

    // Connect it to the destination to hear yourself (or any other node for processing!)
    source.connect(analyser);

    // volume meter, from https://ourcodeworld.com/articles/read/413/how-to-create-a-volume-meter-measure-the-sound-level-in-the-browser-with-javascript
    meter = createAudioMeter(audioCtx);
    source.connect(meter);
}

const initAudio = function() {
    return new Promise((resolve, reject) => {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        navigator.getUserMedia({
            audio: true
        }, gotStream, function () {
            console.warn("Error getting audio stream from getUserMedia")
        });
        return resolve();
    });
}

const updateAudio = function() {
    if (analyser != null) {
        // get the waveform
        analyser.getByteTimeDomainData(dataArray);
        // get the frequencies
        analyser.getByteFrequencyData(frequencies);
    }
}
