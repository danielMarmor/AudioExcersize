import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';


export default function App() {
  const [recorder, setRecorder] = useState(null);
  const [playBack, setPlayBack] = useState(null);
  const [audioStatus, setAudioStatus] = useState(0);
  const [message, setMessage] = useState('');

  function onRecordStatusUpdate(status) {

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
      setRecorder(recording);
      setPlayBack(undefined);
      setMessage("");
    }
    catch (err) {
      console.error(err.message);
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
      const newPlayback = { duration: status.durationMillis, fileName: recorder.getURI() }
      console.log(newPlayback);
      setPlayBack(newPlayback);
      setRecorder(undefined);
      setMessage("");
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
      await sound.playAsync();
    }
    catch (err) {
      console.error(err.message);
      setMessage("Error in Playback, " + err.message);
    }
  }
  async function stopPlaying() {

  }
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text>1</Text>
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.pnlBar}>
        </View>
        <View style={styles.pnlCommands}>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity style={styles.commandButton} onPress={startRecord}>
              <Text style={styles.commandButtonText}>REC</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity style={styles.commandButton} onPress={stopRecord}>
              <Text style={styles.commandButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity style={styles.commandButton} onPress={startPlay}>
              <Text style={styles.commandButtonText}>PLAY</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pnlCommandItem}>
            <TouchableOpacity style={styles.commandButton}>
              <Text style={styles.commandButtonText}>STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.messagesText}></Text>
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
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  pnlBar: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#2e2322',
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
