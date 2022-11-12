import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import LongGuitar from './assets/longGuitar.jpg';
import dezibels from './assets/dezibels.jpg';
import ableton from './assets/ableton.jpg';

export const AudioStatuses = {
  idle: 1,
  record: 2,
  play: 3
}

let _SecondsCounter = 0;
let recordTimeInterval;

export default function App() {
  const [recorder, setRecorder] = useState(null);
  const [playBack, setPlayBack] = useState(null);
  const [audioStatus, setAudioStatus] = useState(AudioStatuses.idle);
  const [timer, setTimer] = useState('');
  const [relativePosition, setRelativePosition] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    initData();
  }, []);

  function initData() {
    setRecorder(null);
    setPlayBack(null);
    setAudioStatus(AudioStatuses.idle)
    setTimer('');
    setMessage('');

  }

  async function getFileSize(fileUri) {
    let fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.size;
  }

  function onRecordTimerInteval() {
    _SecondsCounter++;
    const timerFormat = getDurationFormat(_SecondsCounter);
    console.log(timerFormat);
    setTimer(timerFormat);

  }
  function onRecordStatusUpdate(status) {
  }
  function onPlaybackStatusUpdate(status) {
    if (status.didJustFinish) {
      setAudioStatus(AudioStatuses.idle);
      setRelativePosition(0);
      return;
    }
    //RELATIVE POSITION
    console.log(status);
    const currentDuration = status.positionMillis;
    console.log(currentDuration);
    const relativePos = currentDuration / playBack.duration;
    console.log(relativePos);
    const percenage = Math.round(relativePos * 100);
    console.log(percenage);
    setRelativePosition(percenage);
  }
  function getDurationFormat(totalSeconds) {
    const hours = parseInt(totalSeconds / 3600);
    const minutes = parseInt(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const hoursFormat = hours < 10 ? `0${hours}` : `${hours}`;
    const minutesFormat = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondsFormat = seconds < 10 ? `0${seconds}` : `${seconds}`;

    const format = `${hoursFormat}:${minutesFormat}:${secondsFormat}`;
    return format;

  }

  async function startRecord() {
    try {
      const audioPermission = await Audio.requestPermissionsAsync();
      console.log(`Recording Status: ${audioPermission.status}`)
      if (audioPermission.status !== "granted") {
        throw Error("You dont have audio permissions on this device")
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });


      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALIY);

      setTimer('00:00:00');
      recordTimeInterval = setInterval(onRecordTimerInteval, 1000);

      setAudioStatus(AudioStatuses.record);
      setRecorder(recording);
      setPlayBack(undefined);
      setMessage("");
    }
    catch (err) {
      console.error(err.message);
      clearInterval(recordTimeInterval);
      setMessage("Cannot Record, " + err.message);
    }

  }
  async function stopRecord() {
    try {
      await recorder.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const { status } = await recorder.createNewLoadedSoundAsync();
      const fileUrl = recorder.getURI();
      const size = await getFileSize(fileUrl);
      const newPlayback = { duration: status.durationMillis, fileName: fileUrl, size: size }

      _SecondsCounter = 0;

      clearInterval(recordTimeInterval);

      setAudioStatus(AudioStatuses.idle);
      setPlayBack(newPlayback);
      setRecorder(undefined);
      setTimer('');
      setMessage('');
    }
    catch (err) {
      console.error(err.message);
      setMessage("Error in Record, " + err.message);
    }
  }

  async function startPlay() {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: playBack.fileName },
        { shouldPlay: false }
      );
      console.log(sound);
      console.log(`Total Duration: ${playBack.duration}`);
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await sound.playAsync();
      setAudioStatus(AudioStatuses.play);
    }
    catch (err) {
      console.error(err.message);
      setMessage("Error in Playback, " + err.message);
    }
  }
  async function stopPlay() {
    const { sound } = await Audio.Sound.createAsync({ uri: playBack.fileName });
    await sound.stopAsync();
    setAudioStatus(AudioStatuses.idle);

  }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Hello World Audio Editor
        </Text>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.imageContainer}>
          <Image source={LongGuitar}
            style={{ width: '50%', height: '100%' }}
          />
          <Image source={dezibels}
            style={{ width: '50%', height: '100%' }}
          />
        </View>
        <View style={styles.pnlBar}>
          {audioStatus === AudioStatuses.record && (<View style={styles.timeContainer}>
            <Text style={styles.timerText}>{timer}</Text>
          </View>)
          }
          {audioStatus === AudioStatuses.play && (<View style={styles.sliderContainer}>
            <Text>{'111'}</Text>
          </View>)
          }
        </View>
        <View style={styles.pnlCommands}>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity disabled={audioStatus !== AudioStatuses.idle}
              style={audioStatus !== AudioStatuses.idle ? styles.disabledCommandButton : styles.commandButton}
              onPress={startRecord}>
              <Text style={styles.commandButtonText}>REC</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity disabled={audioStatus !== AudioStatuses.record}
              style={audioStatus !== AudioStatuses.record ? styles.disabledCommandButton : styles.commandButton}
              onPress={stopRecord}>
              <Text style={styles.commandButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity disabled={!playBack || audioStatus !== AudioStatuses.idle}
              style={!playBack || audioStatus !== AudioStatuses.idle ? styles.disabledCommandButton : styles.commandButton}
              onPress={startPlay}>
              <Text style={styles.commandButtonText}>PLAY</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity disabled={audioStatus !== AudioStatuses.play}
              style={audioStatus !== AudioStatuses.play ? styles.disabledCommandButton : styles.commandButton}
              onPress={stopPlay}>
              <Text style={styles.commandButtonText}
              >STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <Image source={ableton}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e2322',
    alignItems: 'stretch',
    justifyContent: 'center',
    margin: 10,
    marginTop: 40,
    borderRadius: 40

  },
  headerContainer: {
    flex: 1,
    backgroundColor: '#2e2322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 3,
    backgroundColor: '#68f289',
    alignItems: 'stretch',
    justifyContent: 'space-between'
  },
  footerContainer: {
    flex: 1.5,
    backgroundColor: '#2e2322',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 28,
    color: 'white'
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#68f289',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  pnlBar: {
    flex: 1,
    backgroundColor: '#2e2322',
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerText: {
    fontSize: 20,
    color: 'white'
  },
  sliderContainer: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  pnlCommands: {
    flex: 3,
    flexDirection: 'row',
    backgroundColor: '#68f289',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10
  },
  pnlCommandItem: {
    width: '50%',
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
    // borderWidth: 1,
    // borderColor: 'black'
  },
  commandButton: {
    width: '70%',
    height: '70%',
    backgroundColor: '#2e2322',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  disabledCommandButton: {
    width: '70%',
    height: '70%',
    backgroundColor: '#2e2322',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    opacity: 0.7
  },
  commandButtonText: {
    color: 'white',
    fontSize: 18
  },
  messagesText: {
    color: 'white',
    fontSize: 16,
    margin: 40
  }
});
