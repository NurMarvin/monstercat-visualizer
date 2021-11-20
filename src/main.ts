import './style.css';

const visualizer = document.querySelector('#visualizer') as HTMLCanvasElement;

const visualizerCtx = visualizer.getContext('2d');

let intensity = 0;

// Draw visualizer bars
const drawVisualizer = (analyser: AnalyserNode) => {
  if (!visualizerCtx) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);

  visualizerCtx.clearRect(0, 0, visualizer.width, visualizer.height);

  const barWidth = Math.round((visualizer.width / bufferLength) * 2);
  let barHeight;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    barHeight = Math.max(Math.round(dataArray[i] * intensity), 2);

    visualizerCtx.fillStyle = 'white';
    visualizerCtx.shadowColor = 'black';
    visualizerCtx.shadowBlur = 3;
    visualizerCtx.shadowOffsetX = 4;
    visualizerCtx.shadowOffsetY = 4;

    visualizerCtx.fillRect(
      x,
      Math.round(visualizer.height - barHeight),
      barWidth,
      barHeight
    );

    x += barWidth + 6;
  }

  requestAnimationFrame(() => drawVisualizer(analyser));
};

const intro = document.querySelector('#intro') as HTMLCanvasElement;

const introCtx = intro.getContext('2d');

let completion = 0;
let opacity = 1;
let decreasing = true;
let introFinished = false;

const drawIntro = async () => {
  if (!introCtx || introFinished) return;

  if (completion >= 1) {
    introCtx.clearRect(0, 0, visualizer.width, visualizer.height);

    drawVisualizer(analyser);
    for (let i = 0; i < 50; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      intensity = i / 50;
    }

    return;
  }

  introCtx.clearRect(0, 0, visualizer.width, visualizer.height);

  if (completion > 0.5) {
    introCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    introCtx.fillRect(0, visualizer.height - 2, visualizer.width, 2);

    if (decreasing) {
      opacity -= 0.25;
    } else {
      opacity += 0.25;
    }

    if (opacity <= 0) {
      decreasing = false;
    } else if (opacity >= 1) {
      decreasing = true;
    }

    completion += 0.02;

    requestAnimationFrame(() => drawIntro());

    return;
  }

  introCtx.fillStyle = 'white';

  // Draw left-aligned line
  introCtx.fillRect(0, visualizer.height - 2, visualizer.width * completion, 2);

  // Draw right-aligned line
  introCtx.fillRect(
    visualizer.width - visualizer.width * completion,
    visualizer.height - 2,
    visualizer.width * completion,
    2
  );

  requestAnimationFrame(() => drawIntro());

  completion += 0.015;
};

const audio = document.querySelector('#track') as HTMLAudioElement;
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

// Set the frequency range
analyser.fftSize = 256;

source.connect(analyser);
source.connect(audioCtx.destination);

const albumArt = document.querySelector('#album-art') as HTMLImageElement;
const trackArtist = document.querySelector(
  '#track-artist'
) as HTMLHeadingElement;
const trackTitle = document.querySelector('#track-title') as HTMLHeadingElement;

audio.addEventListener('play', () => {
  drawIntro();

  albumArt.style.animation = '0.5s ease-in-out 0.25s revealSideways forwards';
  trackArtist.style.animation = '2s ease-in-out 0.5s fadeIn forwards';
  trackTitle.style.animation = '2s ease-in-out 0.75s fadeIn forwards';
});

audio.volume = 0.25;

const updateVisualizerSize = () => {
  visualizer.width = visualizer.clientWidth;
  visualizer.height = visualizer.clientHeight;

  intro.width = visualizer.width;
  intro.height = visualizer.height;
};

document.addEventListener('resize', () => {
  updateVisualizerSize();
});

updateVisualizerSize();
