import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  // https://documentation.onesignal.com/reference#create-notification crear notificacion
  mensajes: OSNotificationPayload[] = [
  ];
  userID: string;
  pushListener = new EventEmitter<OSNotificationPayload>();
  constructor(private oneSignal: OneSignal,
              private storage: Storage) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await  this.cargarMensajes();
    return [...this.mensajes]; // objetos nuevos ...
  }

  configuracionInicial() {
    this.oneSignal.startInit('a6445841-b8fd-4f91-9e47-19c666178413', '162275688626');
   // id onesignal 162275688626 es de firebase(cualquier proyecto -> settings -> Configuracion del proyecto -> Cloud messaging ID remitente)

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification); // muestra una alert

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
     // do something when notification is received
     console.log('Notificacion recibida', noti);
     this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (noti) => {
      // do something when a notification is opened cuando tocan la notificación
      console.log('Notificacion abierta', noti);
      await this.notificacionRecibida( noti.notification );
    });

    // obtener id del suscriptor
    this.oneSignal.getIds().then( info => {
     this.userID =  info.userId;
     console.log('userId=', this.userID);
    });
    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID);
    if (existePush) {
      return;
    }
    // si no existe la meto al inicio del arreglo
    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    await this.guardarMensajes();
  }
  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }
  async cargarMensajes() {
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }
  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
