import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  Platform,
} from '@ionic/angular';
import { HomeService } from './home-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from './user.interface';
import { AdminModalPage } from '../admin-modal/admin-modal.page';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userForm = this.fb.group({
    address: ['', Validators.required],
    userName: ['', Validators.required],
    age: ['', Validators.required],
    foodPreference: ['', Validators.required],
    mobileNumber: [
      '',
      [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
    ],
    stayPreference: ['', Validators.required],
  });
  uniqueIdDetails: any = {};

  constructor(
    private platform: Platform,
    private service: HomeService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    this.getDeviceSize();
  }

  ngOnInit() {
    // Un-Comment this for testing purpose
    // this.openAdminPanelModal({
    //   adminId: "yash",
    //   password: "123",
    //   superUser: true,
    //   id: "DIf0YJhlpx5fK9TkWl25"
    // });
    this.service.fetchAndStoreUniqueId();
    this.service.fetchAdminLoginsFromFirestore();
  }

  getDeviceSize(): number {
    let colSize = 0,
      width = this.platform.width();
    if (width > 480 && width < 767) {
      colSize = 2;
    } else if (width > 768) {
      colSize = 3;
    }
    return colSize;
  }

  updateUniqueId(preferenceType: string, isReset: boolean) {
    if (!isReset) {
      if(preferenceType === 'food') {
        this.service.uniqueIdDetails.foodPreferenceUniqueId.uniqueId++;
      } else {
        this.service.uniqueIdDetails.nonFoodPreferenceUniqueId.uniqueId++;
      }
    } else {
      if(preferenceType === 'food') {
        this.service.uniqueIdDetails.foodPreferenceUniqueId.uniqueId = 50000
      } else {
        this.service.uniqueIdDetails.nonFoodPreferenceUniqueId.uniqueId = 10000;
      }
    }
    if(preferenceType === 'food') {
      this.service.updateUniqueId(
        this.service.uniqueIdDetails.foodPreferenceUniqueId,
        'food')
      } else {
        this.service.updateUniqueId(
          this.service.uniqueIdDetails.nonFoodPreferenceUniqueId,
          'nonFood'
        );
      }
    }

  submitForm() {
    this.loadingController
      .create({
        message: 'कृपया प्रतीक्षा करें...',
      })
      .then((loader) => {
        loader.present();
        let uniqueId: any =
          this.userForm.value.foodPreference === 'true'
            ? this.service.uniqueIdDetails.foodPreferenceUniqueId.uniqueId
            : this.service.uniqueIdDetails.nonFoodPreferenceUniqueId.uniqueId;
        let user: User = {
          uniqueId: uniqueId,
          address: this.userForm.value.address,
          age: Number(this.userForm.value.age),
          userName: this.userForm.value.userName?.toLowerCase(),
          mobileNumber: Number(this.userForm.value.mobileNumber),
          foodPreference: this.userForm.value.foodPreference === 'true',
          stayPreference: this.userForm.value.stayPreference === 'true',
        };
        this.service
          .addUserInFirestore(user)
          .then((success) => {
            this.updateUniqueId(
              user.foodPreference ? 'food' : 'nonFood',
              false
            );
            loader.dismiss();
            this.alertController
              .create({
                header: 'जानकारी',
                message:
                  'आपकी जानकारी सफलतापूर्वक जुड़ गई है, आपका रजिस्ट्रेशन नंबर व्हाट्सएप पर दिखाई देगा, व्हाट्सएप खोलने के लिए ओके पर क्लिक करें और सेंड बटन पर क्लिक करें',
                backdropDismiss: false,
                buttons: [
                  {
                    text: 'Ok',
                    role: 'ok',
                    cssClass: 'adminPanelAlertBtns',
                    handler: () => {
                      this.userForm.reset();
                      this.openWhatsappChat(user);
                    },
                  },
                ],
              })
              .then((alert) => alert.present());
          })
          .catch((error) => {
            console.log(error);
            loader.dismiss();
            this.alertController
              .create({
                header: 'जानकारी',
                message:
                  'आपकी जानकारी अभी नहीं जोड़ी गई है, कृपया कुछ समय बाद प्रयास करें',
                buttons: [
                  {
                    text: 'Ok',
                    role: 'ok',
                    cssClass: 'adminPanelAlertBtns',
                  },
                ],
              })
              .then((alert) => alert.present());
          });
      });
  }

  openWhatsappChat(userDetails: User) {
    const phoneNumber = environment.whatsappConfiguedNumber;
    const message =
      'आपका रजिस्ट्रेशन सफलतापूर्वक हो गया है, आपका रजिस्ट्रेशन नंबर ' +
      userDetails.uniqueId +
      ' है. धन्यवाद';
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  }

  openAdminPanel() {
    this.alertController
      .create({
        header: 'Admin Login',
        subHeader: 'Please enter Admin ID and Password',
        mode: 'ios',
        inputs: [
          {
            type: 'text',
            label: 'Admin ID',
            name: 'adminId',
            placeholder: 'Enter Admin ID',
          },
          {
            type: 'password',
            label: 'Admin Password',
            name: 'password',
            placeholder: 'Enter Admin Password',
          },
        ],
        buttons: [
          {
            text: 'Ok',
            cssClass: 'adminPanelAlertBtns',
            handler: (adminCredentials) => {
              const loggedIdUser = this.service.adminUsersList.find(
                (admin: any) =>
                  admin.adminId === adminCredentials.adminId &&
                  admin.password === adminCredentials.password
              );
              if (loggedIdUser) {
                this.openAdminPanelModal(loggedIdUser);
              } else {
                this.alertController
                  .create({
                    header: 'Message',
                    message: 'Invalid Credentials',
                    buttons: [
                      {
                        text: 'Ok',
                        role: 'cancel',
                      },
                    ],
                  })
                  .then((alert) => alert.present());
              }
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'adminPanelAlertBtns',
          },
        ],
      })
      .then((alert) => alert.present());
  }

  openAdminPanelModal(loggedIdUser: any) {
    this.modalController
      .create({
        component: AdminModalPage,
        componentProps: {
          loggedInUser: loggedIdUser,
        },
      })
      .then((modal) => modal.present());
  }

  clearForm() {
    this.userForm.reset();
  }
}
