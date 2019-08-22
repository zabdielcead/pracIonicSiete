import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  mensajes: OSNotificationPayload [] = [];

  constructor(public pushService: PushService,
              private applicationRef: ApplicationRef) {}
  // onsesignal
  // https://ionicframework.com/docs/native/onesignal
  // ionic cordova plugin add onesignal-cordova-plugin
  // npm install @ionic-native/onesignal


  ngOnInit() {
    this.pushService.pushListener.subscribe(noti => {
      this.mensajes.unshift(noti);
      this.applicationRef.tick(); // tick dice angular que haga el ciclo de deteccion de cambios de angular
    });
  }
  async ionViewWillEnter() {
    this.mensajes = await this.pushService.getMensajes();
  }
  async borrarMensajes() {
   await this.pushService.borrarMensajes();
   this.mensajes = [];
  }
}
