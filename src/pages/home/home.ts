import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BehaviorSubject } from "rxjs/Rx";
import CryptoJS from 'crypto-js';
import aesjs from 'aes-js';
import pkcs7 from 'pkcs7';

declare var chrome;
declare var CryptoJS;
declare var aesjs;
declare var pkcs7;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private tcpstream: BehaviorSubject<Object> = new BehaviorSubject({});
  private socketid: number;
  private localAddress: string;

  constructor(public navCtrl: NavController) {

  }
  doTCPSHIT() {
    console.log('After sendTCP');

    this.sendTCPMessage('', '192.168.1.1', 80)
      .subscribe((stuff) => { console.log('stuff', stuff); });
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad ');
    // server IP = 192.168.1.1
    // mask = 255.255.255.0
    // port = 80

    function padString(source) {
      var paddingChar = ' ';
      var size = 16;
      var padLength = size - source.length;

      for (var i = 0; i < padLength; i++) source += paddingChar;

      return source;
    }

    var key = CryptoJS.enc.Hex.parse('1b6e151628aed2a6abf7158809cf3f2c');
    var iv = CryptoJS.enc.Hex.parse('0000000000000000');
    var message = 'ssid=“MyNetworkName”pwd=“MySecretPassword”';
    var padMsg = padString(message);

    var encrypted = CryptoJS.AES.encrypt(padMsg, key, {
      iv: iv,
      padding: CryptoJS.pad.ZeroPadding,
      mode: CryptoJS.mode.ECB
    });

    console.log('encrypted text is ' + encrypted);
    console.log('encrypted ciphertext is ' + encrypted.ciphertext);

    // Decrypt 
    var bytes = CryptoJS.AES.decrypt(encrypted.toString(), key, {
      iv: iv,
      padding: CryptoJS.pad.ZeroPadding,
      mode: CryptoJS.mode.ECB
    });
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decryption : ' + plaintext);



  }

  sendTCPMessage(message2: string, address: string, port: number) {

    // convert string to ArrayBuffer - taken from Chrome Developer page
    function str2ab(str) {

      console.log("str", str);

      var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    function ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    };


    console.log('Received ip', address);

    // only do udp stuff if there is plugin defined
    if (typeof chrome.sockets !== 'undefined') {
      console.log('CHROME SOCKETS IS AVAILABLE');
      var subscribeURL = 'http://192.168.178.22:1400/MediaRenderer/GroupRenderingControl/Event';

      // register the listeners
      chrome.sockets.tcp.onReceive.addListener(
        (info) => {
          // we have found one 
          console.log('Recv from socket: ', info, ab2str(info.data));
          this.tcpstream.next(info);
        }
      );
      // chrome.sockets.udp.onReceiveError.addListener(
      //   (error) => {
      //     console.log('Recv  ERROR from socket: ', error);
      //     this.tcpstream.next({ 'error': error });
      //   }
      // );

      // translate the string into ArrayBuffer
      //  let SENDBUFFER = str2ab(message2);

      // send  the TCP MessageItem
      chrome.sockets.tcp.create((createInfo) => {
        this.socketid = createInfo.socketId;
        console.log('Create socket ', createInfo, address, port);

        chrome.sockets.tcp.connect(createInfo.socketId, '192.168.1.1', 80,
          (resultCode) => {
            console.log('START OF SOCKET CONNECTION');
            if (resultCode < 0) { console.log('Error connect', resultCode) }
            else chrome.sockets.tcp.getInfo(createInfo.socketId,

              (getInfo) => {

                console.log('Into getInfo', getInfo);

                this.localAddress = getInfo.localAddress;

                let strmessage = "Hello World";
                let message = str2ab(strmessage);

                chrome.sockets.tcp.send(this.socketid, message,
                  (sendresult) => { console.log('Send result', sendresult) });
              });
          }
        )
      }
      );

      // and close the listener after a while
      setTimeout(() => {
        this.closeTCPService();
      }, 10000);
    }
    // return the stream
    return this.tcpstream.asObservable().skip(1);
  }






  closeTCPService() {
    // close the socket
    if (typeof chrome.sockets !== 'undefined') chrome.sockets.tcp.disconnect(this.socketid);

    // close the stream
    this.tcpstream.complete();
  }



}
