import {Component, OnInit} from '@angular/core';
import {GroupService} from "../../../services/group.service";
import {TheGroup} from "../../../models/the-group";

@Component({
  selector: 'app-group-shared',
  templateUrl: './group-shared.component.html',
  styleUrls: ['./group-shared.component.css']
})
export class GroupSharedComponent implements OnInit {

  idUserLogIn = localStorage.getItem("USERID")
  myGroup?: TheGroup[]
  allGroup?: TheGroup[]

  constructor(private groupService: GroupService,
  ) {
  }

  ngOnInit(): void {
    this.allGroupPublic()
    this.findGroupByIdUserCreate()
  }

  allGroupPublic() {
    this.groupService.findAllGroup(this.idUserLogIn).subscribe(rs => {
      console.log("allGroup")
      this.allGroup = rs
    })
  }

  findGroupByIdUserCreate() {
    this.groupService.findGroupByIdUserCreate(this.idUserLogIn).subscribe(rs => {
      console.log("findGroupByIdUserCreate")
      this.myGroup = rs
    })
  }
}
