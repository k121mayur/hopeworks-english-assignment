import { Capacitor } from '@capacitor/core';

// Dynamically import Capacitor TTS to prevent issues on non-native runtimes
let NativeTTS = null;
if (Capacitor.isNativePlatform()) {
  import('@capacitor-community/text-to-speech')
    .then((module) => {
      NativeTTS = module.TextToSpeech;
    })
    .catch((err) => {
      console.error('Failed to load Native TTS plugin:', err);
    });
}

const speakWeb = (text, rate, onEnd, onError) => {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    if (onEnd) utterance.onend = onEnd;
    if (onError) {
      utterance.onerror = onError;
    } else if (onEnd) {
      utterance.onerror = onEnd; // Fallback to reset playing state
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Web SpeechSynthesis error:', err);
    if (onError) onError(err);
  }
};

export const speak = async (text, rate = 0.85, onEnd, onError) => {
  if (Capacitor.isNativePlatform()) {
    try {
      if (!NativeTTS) {
        const module = await import('@capacitor-community/text-to-speech');
        NativeTTS = module.TextToSpeech;
      }
      await NativeTTS.speak({
        text: text,
        lang: 'en-US',
        rate: rate,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });
      if (onEnd) onEnd();
    } catch (error) {
      console.error('Native TTS failed, falling back to Web SpeechSynthesis:', error);
      speakWeb(text, rate, onEnd, onError);
    }
  } else {
    speakWeb(text, rate, onEnd, onError);
  }
};

export const stop = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      if (!NativeTTS) {
        const module = await import('@capacitor-community/text-to-speech');
        NativeTTS = module.TextToSpeech;
      }
      await NativeTTS.stop();
    } catch (error) {
      console.error('Native TTS stop failed:', error);
      window.speechSynthesis.cancel();
    }
  } else {
    window.speechSynthesis.cancel();
  }
};
