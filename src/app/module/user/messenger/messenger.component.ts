import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MessengerService} from "../../../services/messenger.service";
import {UserService} from "../../../services/user.service";
import {FriendRelationService} from "../../../services/friend-relation.service";
import {User} from "../../../models/user";
import {Conversation} from "../../../models/conversation";
import {Messenger} from "../../../models/messenger";
import {FormControl, FormGroup} from "@angular/forms";
import {finalize, Observable} from "rxjs";
import {AngularFireStorage} from "@angular/fire/compat/storage";

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
  @Output() newItemEvent = new EventEmitter<string>();
  idConversation?: string
  idUserLogIn = localStorage.getItem("USERID")
  url = localStorage.getItem("Url")
  listFriend?: User[];
  conversations?: Conversation[];
  conversationsNotFriend?: Conversation[];
  conversation?: Conversation;
  messengers?: Messenger[]
  messengersHavePhoto?: Messenger[]
  messengersHaveLink? = []
  messenger?: Messenger
  userName?: User
  userName1?: User
  idUser?: any
  withUser = 'Đang trò truyện với : '
  border = 'border: #b2dba1 1px solid'
  countFriend = 0
  countMessageNotFriend = 0
  content: any;
  myScrollContainer: any;
  count = 0
  countMessengersHavePhoto = false
  countMessengersHaveLink = false
  background: any
  checkDone = false
  checkButton = true
  checkConversation = true
  checkOpenInfo = false
  withMessage = 12
  withInfo = 0
  fb: any;
  checkFriendMessage = true
  downloadURL!: Observable<string>;
  colorCheckFriendMessage1 = 'color: #ffc107'
  colorCheckFriendMessage2 = 'color: #8c8c8c'
  firstDayMessage?: any
  checkFirstDayMessage = false
  send?: any
  checkIdSend = false
  lastIdSend: any
  checkCreateMessage = false
  pressToChat = 'Ấn để trò truyện'

  messengerForm: FormGroup = new FormGroup({
    content: new FormControl("",),
    image: new FormControl("",)
  })

  constructor(private userService: UserService,
              private friendRelationService: FriendRelationService,
              private messengerService: MessengerService,
              private storage: AngularFireStorage,
  ) {
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }

  ngOnInit(): void {
    localStorage.setItem('UrlMessage', window.location.href);
    this.friendRelationService.listFriend(this.idUserLogIn).subscribe(rs => {
      this.listFriend = rs
      try {
        this.countFriend = rs.length
      } catch (err) {
        console.log("lỗi length")
      }
    })
    // @ts-ignore
    this.messengerService.myMessenger(this.idUserLogIn).subscribe(rs => {
      this.conversations = rs
    })
    this.scrollToBottom();
    this.listConversationNotFriend()
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log("lỗi scroll")
    }
  }

  createConversation(idReceiver: any) {
    this.checkCreateMessage = false
    // @ts-ignore
    this.messengerService.createConversation(this.idUserLogIn, idReceiver).subscribe(rs => {
      this.conversation = rs
      this.idConversation = rs.id
      localStorage.setItem("idConversation", <string>rs.id)
      console.log("idConversation: " + this.idConversation)
      // @ts-ignore
      this.messengerService.findAllByConversationOrderById(this.idConversation).subscribe(rs => {
        this.messengers = rs
        if (rs.length > 0) {
          // @ts-ignore
          this.messengerService.lastMessageIdSender(this.idConversation).subscribe(rs => {
            this.lastIdSend = rs
            console.log("lastIdSend" + this.lastIdSend)
            if (this.lastIdSend == this.idUserLogIn) {
              this.checkCreateMessage = true
              this.listMessage(this.idConversation)
            }
          })
          this.firstDayMessage = rs[0].createAt
          this.checkFirstDayMessage = true
        } else {
          this.checkFirstDayMessage = false
        }
        this.getAllMessageHavePhoto()
        this.getAllMessageHaveLink()
        try {
          this.count = rs.length
        } catch (err) {
          console.log("lỗi length")
        }
      })
      // @ts-ignore
      this.messengerService.findById(this.idConversation).subscribe(rs => {
        if (rs != null) {
          this.conversation = rs
        }
      })
      this.userService.findById(this.conversation?.idReceiver?.id).subscribe(rs => {
        this.userName = rs
      })
      this.userService.findById(this.conversation?.idSender?.id).subscribe(rs => {
        this.userName1 = rs
      })
      this.ngOnInit()
    })
  }

  createMessenger(idConversation: any) {
    console.log("vào hàm createMessenger")
    const newMessenger = {
      content: this.messengerForm.value.content,
      image: this.fb
    }
    console.log(newMessenger)
    // @ts-ignore
    this.messengerService.createMessenger(idConversation, this.idUserLogIn, newMessenger).subscribe(rs => {
      console.log("vào đây")
      this.listMessage(idConversation)
      // @ts-ignore
    }, error => {
      console.log("Lỗi: " + error)
    })
    this.ngOnInit()
  }

  listMessage(idConversation: any) {
    this.messengerService.findAllByConversationOrderById(idConversation).subscribe(rs => {
      this.checkCreateMessage = true
      this.messengers = rs
      this.send = new Date()
      this.lastMessageIdSender(this.idConversation)
      console.log("checkIdSend" + this.checkIdSend)
      this.getAllMessageHavePhoto()
      this.getAllMessageHaveLink()
      this.fb = null
      try {
        this.count = rs.length
      } catch (err) {
        console.log("lỗi length")
      }
      this.ngOnInit()
    })
  }

  onFileSelected(event: any) {
    this.checkDone = true
    this.checkButton = false
    let n = Date.now();
    const file = event.target.files[0];
    const filePath = `RoomsImages/${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`RoomsImages/${n}`, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if (url) {
              this.fb = url;
            }
            console.log(this.fb);
            this.checkDone = false
            this.checkButton = true
          });
        })
      )
      .subscribe(url => {
        if (url) {
          console.log(url);
        }
      });
  }

  friendMessageTrue() {
    console.log("vào1")
    this.checkFriendMessage = true
    this.colorCheckFriendMessage2 = 'color: #8c8c8c'
    this.colorCheckFriendMessage1 = 'color: #ffc107'
  }

  friendMessageFalse() {
    console.log("vào2")
    this.checkFriendMessage = false
    this.colorCheckFriendMessage1 = 'color: #8c8c8c'
    this.colorCheckFriendMessage2 = 'color: #ffc107'
  }

  closeMessage() {
    this.checkConversation = false
  }

  openMessage() {
    this.checkConversation = true
    this.ngOnInit()
  }

  openInfo() {
    this.checkOpenInfo = true
    this.withMessage = 9
    this.withInfo = 3
  }

  closeInfo() {
    this.checkOpenInfo = false
    this.withMessage = 12
    this.withInfo = 0
  }

  changeBackgroundColor1() {
    this.background = 'background-color: pink'
  }

  changeBackgroundColor2() {
    this.background = 'background-color: #afd9ee'
  }

  changeBackgroundColor3() {
    this.background = 'background-color: #1deecf'
  }

  changeBackgroundColor4() {
    this.background = 'background-color: #fcfcfc'
  }

  getAllMessageHavePhoto() {
    // @ts-ignore
    this.messengerService.getAllMessageHavePhoto(this.idConversation).subscribe(rs => {
      this.messengersHavePhoto = rs
      if (rs.length == 0) {
        this.countMessengersHavePhoto = true
      } else {
        this.countMessengersHavePhoto = false
      }
      console.log(this.countMessengersHavePhoto)
    })
  }

  getAllMessageHaveLink() {
    // @ts-ignore
    this.messengerService.getAllMessageHaveLink(this.idConversation).subscribe(rs => {
      this.messengersHaveLink = rs
      if (rs.length == 0) {
        this.countMessengersHaveLink = true
      } else {
        this.countMessengersHaveLink = false
      }
      console.log(this.countMessengersHaveLink)
    })
  }

  listConversationNotFriend() {
    // @ts-ignore
    this.messengerService.listConversationNotFriend(this.idUserLogIn).subscribe(rs => {
      this.conversationsNotFriend = rs
      this.countMessageNotFriend = rs.length
    })
  }

  lastMessageIdSender(idConversation: any) {
    this.messengerService.lastMessageIdSender(idConversation).subscribe(rs => {
      this.lastIdSend = rs
      console.log("lastIdSend" + this.lastIdSend)
    })
  }
}
