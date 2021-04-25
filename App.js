import React, {Component, useState} from 'react';
import { StyleSheet, PermissionsAndroid, Text, View, FlatList, Dimensions, SafeAreaView, Image, Button, Modal, TouchableOpacity, Alert} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase';

var firebaseConfig = {
  apiKey: "AIzaSyAS_d1ZN-cErWHrQardjeSLrqXsBofBSws",
  authDomain: "vendingmachine-e55bc.firebaseapp.com",
  databaseURL: "https://vendingmachine-e55bc.firebaseio.com",
  projectId: "vendingmachine-e55bc",
  storageBucket: "vendingmachine-e55bc.appspot.com",
  messagingSenderId: "532545534846",
  appId: "1:532545534846:web:4e4433a8853581a00a112f",
  measurementId: "G-2DWNMMY7V8"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const dataList = [{name: 'Coca-Cola', image: 'https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/888/cached.offlinehbpl.hbpl.co.uk/news/ORP/Coke-20150730041122131.JPG',price: 1.70}, 
                  {name: 'Sprite', image: 'https://trottospizza.com/wp-content/uploads/2017/11/Sprite_Can_375ml_1_1024x1024-e1443056044254.png',price: 2.30}, 
                  {name: '100 Plus', image: 'https://www.pantryexpress.my/27-thickbox_default/100-plus-325ml-x-24-original.jpg', price: 1.40}];
const WIDTH = Dimensions.get('window').width
const numColumns = 2

const leftTop = {
  borderLeftWidth: 4,
  borderTopWidth: 4,
  borderColor: 'white'
};
const leftBottom = {
  borderLeftWidth: 4,
  borderBottomWidth: 4,
  borderColor: 'white'
};
const rightTop = {
  borderRightWidth: 4,
  borderTopWidth: 4,
  borderColor: 'white'
};
const rightBottom = {
  borderRightWidth: 4,
  borderBottomWidth: 4,
  borderColor: 'white'
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPermission: false,
      shouldShowQrScanner: false,
      shouldShowModal: false,
      scanned: false,
      index: 0
    }
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === 'granted' });
  }

  async requestCameraPermission() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === 'granted' });
  }

  getQrcode = (codeId) => {
    var codeStr = '';
    firebase.database().ref('User/Aziz/Qr').on('value', (snapshot) => {
      codeStr = snapshot.val();
      console.log("Code String: " + codeStr);
    });
    return codeStr;
  }

  deductUserBalance = () => {
    var userBalance = firebase.database().ref('User/Aziz/Balance');
    userBalance.once('value').then(snapshot => {
      userBalance.set(snapshot.val() - 1);
  });
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true })
    this.setState({ shouldShowQrScanner: !this.state.shouldShowQrScanner })
    this.setState({ shouldShowModal: !this.state.shouldShowModal })
    const qrCode = this.getQrcode();

    if (data === qrCode) {
      this.deductUserBalance();

      Alert.alert('Payment Success', 'Payment Success! Please wait for the item to be dispensed.');
    }
    else 
      alert('Invalid QR code!')

    this.setState({ scanned: false })
  }

  formatData = (dataList, numColumns) => {
    const totalRows = Math.floor(dataList.length / numColumns)
    let totalLastRow = dataList.length - (totalRows * numColumns)

    while (totalLastRow !== 0 && totalLastRow !== numColumns) {
      dataList.push({key: 'blank', empty: true})
      totalLastRow++
    }
    return dataList
  }

  _renderItem = ({item, index}) => {
    let {itemStyle, itemText, itemInvisible} = styles
    if(item.empty) {
      return <View style={[itemStyle, itemInvisible]}/>
    }
    return(
      <View style={itemStyle}>
        <TouchableOpacity onPress={() => this.setState({ shouldShowModal: !this.state.shouldShowModal, index: index })}>
          <Image 
            style={{width: WIDTH / 2 - 10, height: 150, marginBottom: 5}}
            resizeMode="contain"
            source={{uri: item.image}}
          />
        </TouchableOpacity>
          <Text style={itemText}>{item.name}</Text>
      </View>
    )
  }

  render() {
    let {container, itemText, modalStyle, modalText, productDetails, buttonStyle, buttonFlex, qrBackButton} = styles
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {this.state.shouldShowQrScanner ? (<View style={{ flex: 1 }}>
         <Camera
         onBarCodeScanned={this.state.scanned ? console.log('undefined') : this.handleBarCodeScanned}
         style={StyleSheet.absoluteFillObject}
      />
      <View style={{ height: Dimensions.get('window').height / 2 - WIDTH / 4, width: WIDTH, backgroundColor: 'black', opacity: 0.5 }}></View>
        <View style={{ height: WIDTH / 2, width: WIDTH, opacity: 0.5, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: 'black' }}></View>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 1 }}></View>
          <View style={{ flex: 1, backgroundColor: 'black' }}></View>
        </View>
        <View style={{ height: Dimensions.get('window').height / 2 - WIDTH / 4, width: WIDTH, backgroundColor: 'black', opacity: 0.5 }}></View>
        <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', paddingTop: Dimensions.get('window').height / 2 - WIDTH / 4 }}>
          <View style={{ width: WIDTH / 2, height: WIDTH / 2 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, ...leftTop }}></View>
              <View style={{ flex: 1 }}></View>
              <View style={{ flex: 1, ...rightTop }}></View>
            </View>
            <View style={{ flex: 1 }}></View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flex: 1, ...leftBottom }}></View>
              <View style={{ flex: 1 }}></View>
              <View style={{ flex: 1, ...rightBottom }}></View>
            </View>
          </View>
          <View style={qrBackButton}>
            <Button 
                  color='red'
                  title="Back"
                  onPress={() => this.setState({ shouldShowQrScanner: !this.state.shouldShowQrScanner })}
                  />
          </View>
        </View>
      </View>
      ) : (<View style={container}>
        <Modal visible={this.state.shouldShowModal}>
          <View style={modalStyle}>
            <Image 
              style={{width: 300, height: 300, marginBottom: 5}}
              resizeMode="contain"
              source={{uri: dataList[this.state.index].image}}
            />
            <View style={productDetails}>
              <View style={{paddingRight: 25}}>
                <Text style={modalText}>Product Name:</Text>
                <Text style={modalText}>Price:</Text>
              </View>
              <View style={{paddingLeft: 25}}>
                <Text style={modalText}>{dataList[this.state.index].name}</Text>
                <Text style={modalText}>RM{dataList[this.state.index].price.toFixed(2)}</Text>
              </View>
            </View>
            <View style={buttonStyle}>
              <View style={buttonFlex}>
                <Button 
                color='red'
                title="Back"
                onPress={() => this.setState({ shouldShowModal: !this.state.shouldShowModal })}
                />
              </View>
              <View style={buttonFlex}>
                <Button 
                color='blue'
                title="Pay"
                onPress={() => this.state.hasPermission ? this.setState({ shouldShowQrScanner: !this.state.shouldShowQrScanner }) : this.requestCameraPermission}
                />
            </View>
            </View>
          </View>
        </Modal>
        <FlatList 
          data={this.formatData(dataList, numColumns)}
          renderItem={this._renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numColumns}
        /></View>)}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40
  },
  itemStyle: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    flex: 1,
    margin: 1,
    height: WIDTH / numColumns
  },
  itemText: {
    color: 'black',
    fontSize: 20
  },
  itemInvisible: {
    backgroundColor: 'transparent'
  },
  modalStyle: {
    flex: 1,
    alignItems: 'center'
  },
  modalText: {
    fontSize: 25
  },
  productDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  buttonStyle: {
    flexDirection: 'row'
  },
  buttonFlex: {
    flex: 1
  },
  qrBackButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0
  }
});