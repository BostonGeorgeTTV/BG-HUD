const audioOn = new Audio("./buckle.ogg");
const audioOff = new Audio("./unbuckle.ogg");

audioOn.preload = "auto";
audioOff.preload = "auto";

audioOn.volume = 0.4;
audioOff.volume = 0.4;

export function playSeatbeltSound(state) {
  const audio = state ? audioOn : audioOff;

  audio.pause();
  audio.currentTime = 0;
  audio.play().catch((e) => {
    console.warn("Seatbelt sound error", e, audio.src);
  });
}