import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ImgGeneticsComponent } from './img-genetics/img-genetics.component';


@NgModule({
  declarations: [
    AppComponent,
    ImgGeneticsComponent
],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
