import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BehaviorSubject } from "rxjs/Rx";
import CryptoJS from 'crypto-js';
import { AlertController } from 'ionic-angular';

import aesjs from 'aes-js';
// import pkcs7 from 'pkcs7';

declare var chrome;
declare var Socket;
declare var CryptoJS;
declare var aesjs;
// declare var pkcs7;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private tcpstream: BehaviorSubject<Object> = new BehaviorSubject({});
  private socketid: number;
  private localAddress: string;

  private wifi = {
    name: '',
    password: ''
  }
  private encryptedInfo;
  private socket;
  constructor(public navCtrl: NavController, private alertCtrl: AlertController) {


  }
  successAlert() {
    let alert = this.alertCtrl.create({
      title: 'Wifi-Pairing',
      subTitle: 'Wifi has been successfully paired to the device',
      buttons: ['Dismiss']
    });
    alert.present();
  }

  errorAlert() {
    let alert = this.alertCtrl.create({
      title: 'Wifi-Pairing',
      subTitle: 'Wifi has been unable to pair with the device',
      buttons: ['Dismiss']
    });
    alert.present();
  }


  doTcpConnection(encryptedWifiDetails) {
    //console.log('After sendTCP');

    this.sendTCPMessage(encryptedWifiDetails, '192.168.1.1', 80)
      .subscribe((stuff) => {
        //console.log('stuff', stuff);
      });
  }

  padString(source) {
    var paddingChar = ' ';
    var size = 16;
    var padLength = size - source.length;

    for (var i = 0; i < padLength; i++) source += paddingChar;

    return source;
  }

  doCryptoStuff(wifiname, password) {


    var key = CryptoJS.enc.Hex.parse('1b6e151628aed2a6abf7158809cf3f2c');
    var iv = CryptoJS.enc.Hex.parse('0000000000000000');
    //    var message = 'ssid=“MyNetworkName”pwd=“MySecretPassword”';

    var message = 'ssid="' + wifiname + '"pwd="' + password + '"';
    // var message = 'ssid="OriginDigitalDownstairs2"pwd="Gnat-Antelope42"';
    var padMsg = this.padString(message);

    var encrypted = CryptoJS.AES.encrypt(padMsg, key, {
      iv: iv,
      padding: CryptoJS.pad.ZeroPadding,
      mode: CryptoJS.mode.ECB
    });

    //console.log('encrypted text is ' + encrypted);
    //console.log('encrypted ciphertext is ' + encrypted.ciphertext);

    // Decrypt 
    var bytes = CryptoJS.AES.decrypt(encrypted.toString(), key, {
      iv: iv,
      padding: CryptoJS.pad.ZeroPadding,
      mode: CryptoJS.mode.ECB
    });
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    //console.log('Decryption : ' + plaintext);



    this.encryptedInfo = encrypted.ciphertext.toString();
    this.doTcpConnection(encrypted);


  }


  ionViewDidLoad() {
    //console.log('ionViewDidLoad ');

    var testString = 'c61f3d4b59da2b394eab989b69b29be10feafc832fb1d9c9679ec9165465ecf4';


    var testString2 = "717ec305a9ff4197c42680b610b5461901014ce29404ee5d3628673b5eab43af992e2b51952e4ed5e62770d64e2bbd3a06a1e01ca4607af296d7c4d15de3c5eb";
    // console.log(this.hexStringToByte(testString));
    // console.log(this.byteToHexString(this.hexStringToByte(testString)));
    // this.errorAlert();

    //console.log('We will do the length of their wifi then ours');
    // console.log(testString.length);
    // console.log(testString2.length);

    // console.log('What is their wifi string as a byte array');
    // console.log(this.hexStringToByte(testString));
    //console.log('What is our wifi string as a byte array');
    // console.log(this.hexStringToByte(testString2));
    //console.log(this.hexStringToByteArrayV2(testString2));
    // console.log(this.hexStringToByte(testString2).buffer);
    // console.log(this.hexStringToByteArrayV3(testString2));

  }

  ab2str2(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  };
  hexStringToByteArrayV3(str) {

    var a = []

    if (Math.floor(str.length % 2) == 0) {
      for (var i = 0; i < str.length; i = i + 2) {
        var hex = str.substr(i, 2).toUpperCase();
        // console.log(hex);
        var number = parseInt(hex, 16);
        a.push(number);

      }
    }

    return new Uint16Array(a);
  }
  hexStringToByteArrayV2(str) {

    var a = []

    if (Math.floor(str.length % 2) == 0) {
      for (var i = 0; i < str.length; i = i + 2) {
        var hex = str.substr(i, 2).toUpperCase();
        // console.log(hex);
        var number = parseInt(hex, 16);


        a.push(hex);

      }
    }

    return new Uint16Array(a);
  }

  hexStringToByte(str) {

    var a = [];
    for (var i = 0, len = str.length; i < len; i += 2) {
      a.push(parseInt(str.substr(i, 2), 16));
    }

    return new Uint8Array(a);
  }
  testFunction(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }


  byteToHexString(uint8arr) {
    if (!uint8arr) {
      return '';
    }

    var hexStr = '';
    for (var i = 0; i < uint8arr.length; i++) {
      var hex = (uint8arr[i] & 0xff).toString(16);
      hex = (hex.length === 1) ? '0' + hex : hex;
      hexStr += hex;
    }

    return hexStr;
  }

  str2arrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  stringToArrayBuffer(string) {
    var arrayBuffer = new ArrayBuffer(string.length * 2);
    var buffer = new Uint8Array(arrayBuffer);
    for (var i = 0, stringLength = string.length; i < stringLength; i++) {
      buffer[i] = string.charCodeAt(i);
      // Was: buffer = string.charCodeAt(i);
    }
    return buffer;
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  };

  sendTCPMessage(message2: string, address: string, port: number) {
    // '192.168.1.1', 80
    // let IP = "192.168.0.65";
    // let Port = 80
    let IP = "192.168.1.1";
    let Port = 80
    //console.log('Button');

    var delay = 25000;	/// 5 seconds timeout
    (<any>window).chrome.sockets.tcp.create({}, createInfo => { //callback function with createInfo as the parameter
      var _socketTcpId = createInfo.socketId;
      //console.log('CREATE SOCKET');
      (<any>window).chrome.sockets.tcp.connect(_socketTcpId, IP, Port, result => { //callback function with result as the parameter
        //console.log(result);
        //console.log('What is the result');
        if (result === 0) {
          //console.log('What is encryptedInfo');
          //console.log(this.encryptedInfo);
          let message = this.str2ab(this.encryptedInfo);
          var newMessage = this.hexStringToByte(this.encryptedInfo);

          /// connection ok, send the packet
          (<any>window).chrome.sockets.tcp.onReceive.addListener(info => { //callback function with info as the parameter
            /// recived, then close connection
            console.log('onReceive ' + info);
            (<any>window).chrome.sockets.tcp.close(_socketTcpId);
            var data = this.ab2str(info.data);
            console.log(data);
            // this.successAlert();

            if (data.indexOf('ERR') >= 0) {
              this.errorAlert();

            } else {
              this.successAlert();

            }

          });
          chrome.sockets.tcp.setPaused(_socketTcpId, false);

          // console.log('What is the message before being sent');
          // console.log(newMessage.buffer);
          (<any>window).chrome.sockets.tcp.send(_socketTcpId, newMessage.buffer, ((info) => {
            // console.log('SENDING THE PACKET UP');
            // console.log(info);


          }));
        }
      });

      /// set the timeout
      setTimeout(function () {
        (<any>window).chrome.sockets.tcp.close(_socketTcpId);
      }, delay);
    });


    return this.tcpstream.asObservable().skip(1);
  }

  closeTCPService() {

    //console.log('CLOSE THE TCP STREAM');
    // close the socket
    if (typeof chrome.sockets !== 'undefined') {

      chrome.sockets.tcp.disconnect(this.socketid);
    }
    // close the stream
    this.tcpstream.complete();
  }



}